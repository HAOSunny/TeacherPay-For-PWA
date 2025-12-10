import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Briefcase, 
  Banknote, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  ChevronDown,
  School,
  GraduationCap,
  Users,
  User,
  Plus,
  Trash2,
  AlertCircle,
  ThumbsUp,
  Clock,
  AlertTriangle,
  Info,
  BarChart3,
  Wallet,
  UserPlus,
  Sparkles,
  Coins
} from 'lucide-react';
import { TeacherLevel, PositionType, SalaryState, CalculationResult, StudentGrade, GroupClass, TrialSuccessRecord } from './types';
import { BASE_TRIAL_FAIL_RATE, TRIAL_SUCCESS_BONUS, SALARY_TABLE, PERSONAL_CLASS_RATES } from './constants';
import { InputCard } from './components/InputCard';
import { SalaryChart } from './components/SalaryChart';

const App: React.FC = () => {
  // State
  const [state, setState] = useState<SalaryState>({
    level: TeacherLevel.ONE,
    positionType: PositionType.HIGH_SCHOOL,
    trialFailCount: 0,
    trialSuccessRecords: [],
    personalClassCounts: Object.values(StudentGrade).reduce((acc, grade) => ({...acc, [grade]: 0}), {} as Record<StudentGrade, number>),
    groupClasses: []
  });

  // Derived Calculation
  const result: CalculationResult = useMemo(() => {
    const salaryConfig = SALARY_TABLE[state.level][state.positionType];
    const personalRates = PERSONAL_CLASS_RATES[state.level];
    
    const baseSalary = salaryConfig.base;
    const postSalary = salaryConfig.post;
    const fixedPart = baseSalary + postSalary;

    // --- 1. Calculate Gross Incomes (Before Deduction) ---

    // A. Personal (1v1)
    let grossPersonalIncome = 0;
    let personalHours = 0;
    const personalItems: { grade: StudentGrade, rate: number, hours: number }[] = [];

    Object.values(StudentGrade).forEach(grade => {
      const count = state.personalClassCounts[grade] || 0;
      if (count > 0) {
        const rate = personalRates[grade];
        const hours = count * 2;
        grossPersonalIncome += count * rate;
        personalHours += hours;
        personalItems.push({ grade, rate, hours });
      }
    });

    // B. Group
    let grossGroupIncome = 0;
    let groupBaseIncome = 0;
    let groupHeadcountIncome = 0;
    let groupHours = 0;
    const groupItems: { grade: StudentGrade, baseRate: number, hours: number }[] = [];

    state.groupClasses.forEach(gc => {
      const baseRate = personalRates[gc.grade];
      const extraStudents = Math.max(0, gc.studentCount - 1);
      const extraPayPerClass = extraStudents * 10 * 2; 
      const totalRate = baseRate + extraPayPerClass;
      
      grossGroupIncome += totalRate * gc.classCount;
      
      // Split breakdown
      groupBaseIncome += baseRate * gc.classCount;
      groupHeadcountIncome += extraPayPerClass * gc.classCount;

      const hours = gc.classCount * 2;
      groupHours += hours;
      
      // For deduction, we only care about baseRate
      groupItems.push({ grade: gc.grade, baseRate, hours });
    });

    // C. Trial Success
    let grossSuccessIncome = 0;
    let successHours = 0;
    const successItems: { grade: StudentGrade, baseRate: number, hours: number }[] = [];

    state.trialSuccessRecords.forEach(record => {
      const baseRate = personalRates[record.grade];
      const rate = baseRate + TRIAL_SUCCESS_BONUS;
      
      grossSuccessIncome += record.count * rate;
      const hours = record.count * 2;
      successHours += hours;

      successItems.push({ grade: record.grade, baseRate, hours });
    });

    // D. Trial Fail
    const grossFailIncome = state.trialFailCount * BASE_TRIAL_FAIL_RATE;
    const failHours = state.trialFailCount * 2;

    const trialBonus = grossSuccessIncome + grossFailIncome;
    const trialHours = successHours + failHours;
    const regularHours = personalHours + groupHours;
    const totalHours = regularHours + trialHours;

    // --- 2. Task Hour Deduction Logic ---
    
    let remainingQuota = 30;
    let deductionAmount = 0;
    let hoursFilled = 0;

    // Helper to process deduction
    const processDeduction = (items: { hours: number, costPer2H: number }[]) => {
      for (const item of items) {
        if (remainingQuota <= 0) break;
        
        const deductHours = Math.min(item.hours, remainingQuota);
        const deductClasses = deductHours / 2;
        
        deductionAmount += deductClasses * item.costPer2H;
        remainingQuota -= deductHours;
        hoursFilled += deductHours;
      }
    };

    // Step 2a: Prioritize 1v1 (Lowest Grade/Rate first)
    // Sort by rate ascending
    personalItems.sort((a, b) => a.rate - b.rate);
    processDeduction(personalItems.map(i => ({ hours: i.hours, costPer2H: i.rate })));

    // Step 2b: Group Classes (Deduct Base Rate only)
    // Sort by baseRate ascending
    groupItems.sort((a, b) => a.baseRate - b.baseRate);
    processDeduction(groupItems.map(i => ({ hours: i.hours, costPer2H: i.baseRate })));

    // Step 2c: Trial Classes (Only if Regular Hours < 30)
    if (regularHours < 30) {
       // Trial Success (Deduct Base Rate)
       successItems.sort((a, b) => a.baseRate - b.baseRate);
       processDeduction(successItems.map(i => ({ hours: i.hours, costPer2H: i.baseRate })));

       // Trial Fail (Deduct Flat 99)
       // We treat 99 as the cost for 2 hours
       processDeduction([{ hours: failHours, costPer2H: BASE_TRIAL_FAIL_RATE }]);
    }

    // --- 3. Final Sum ---
    // Total Salary = Fixed + (All Gross Variable) - Deduction
    const totalVariable = grossPersonalIncome + grossGroupIncome + trialBonus;
    const totalSalary = fixedPart + totalVariable - deductionAmount;

    // Calculate Net Base Class Fees (1v1 Total + Group Base Portion - Deduction)
    const baseClassFees = (grossPersonalIncome + groupBaseIncome) - deductionAmount;

    return {
      baseSalary,
      postSalary,
      fixedPart,
      trialBonus,
      personalClassIncome: grossPersonalIncome,
      groupClassIncome: grossGroupIncome,
      successIncome: grossSuccessIncome,
      failIncome: grossFailIncome,
      totalSalary,
      
      // New Data Fields
      baseClassFees,
      groupHeadcountBonus: groupHeadcountIncome,

      // New Stats
      regularHours,
      trialHours,
      totalHours,
      taskHoursDeduction: deductionAmount,
      hoursFilled
    };
  }, [state]);

  const handleStateChange = (key: keyof SalaryState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handlePersonalClassChange = (grade: StudentGrade, count: number) => {
    setState(prev => ({
      ...prev,
      personalClassCounts: {
        ...prev.personalClassCounts,
        [grade]: count
      }
    }));
  };

  const addGroupClass = () => {
    const newClass: GroupClass = {
      id: Date.now().toString(),
      grade: StudentGrade.GRADE_1_2,
      studentCount: 2,
      classCount: 1
    };
    setState(prev => ({
      ...prev,
      groupClasses: [...prev.groupClasses, newClass]
    }));
  };

  const updateGroupClass = (id: string, field: keyof GroupClass, value: any) => {
    setState(prev => ({
      ...prev,
      groupClasses: prev.groupClasses.map(gc => 
        gc.id === id ? { ...gc, [field]: value } : gc
      )
    }));
  };

  const removeGroupClass = (id: string) => {
    setState(prev => ({
      ...prev,
      groupClasses: prev.groupClasses.filter(gc => gc.id !== id)
    }));
  };

  const addTrialSuccess = () => {
    const newRecord: TrialSuccessRecord = {
      id: Date.now().toString(),
      grade: StudentGrade.GRADE_1_2,
      count: 1
    };
    setState(prev => ({
      ...prev,
      trialSuccessRecords: [...prev.trialSuccessRecords, newRecord]
    }));
  };

  const updateTrialSuccess = (id: string, field: keyof TrialSuccessRecord, value: any) => {
    setState(prev => ({
      ...prev,
      trialSuccessRecords: prev.trialSuccessRecords.map(r => 
        r.id === id ? { ...r, [field]: value } : r
      )
    }));
  };

  const removeTrialSuccess = (id: string) => {
    setState(prev => ({
      ...prev,
      trialSuccessRecords: prev.trialSuccessRecords.filter(r => r.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
              TeacherPay
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block font-medium">
            教师工资结算系统 v3.6
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Warning Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
              <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800">
                  请务必将正式课和试听课分开录入
                </h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  系统会自动判断试听课是否用于抵扣任务课时。若将试听课混入“一对一”或“班课”中，会导致课时量重复计算，影响工资准确性。
                </p>
              </div>
            </div>
            
            {/* 1. Position & Level */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-yellow-100 rounded-lg text-yellow-600">
                    <Trophy size={18} />
                  </div>
                  岗位设定
                </h2>
                
                <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                  <button
                    onClick={() => handleStateChange('positionType', PositionType.HIGH_SCHOOL)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                      state.positionType === PositionType.HIGH_SCHOOL
                        ? 'bg-white text-indigo-600 shadow-sm transform scale-105'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <GraduationCap size={16} />
                    高中岗位
                  </button>
                  <button
                    onClick={() => handleStateChange('positionType', PositionType.PRIMARY_MIDDLE)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                      state.positionType === PositionType.PRIMARY_MIDDLE
                        ? 'bg-white text-indigo-600 shadow-sm transform scale-105'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <School size={16} />
                    小学初中
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {Object.values(TeacherLevel).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleStateChange('level', level)}
                    className={`
                      relative p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1
                      ${state.level === level 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span>{level}</span>
                    {state.level === level && (
                      <div className="absolute top-1.5 right-1.5 text-indigo-600 animate-in zoom-in duration-200">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

             {/* 2. One-on-One Class Inputs */}
             <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
               <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                      <User size={18} />
                    </div>
                    一对一课时 <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">2小时/节</span>
                  </h2>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {Object.values(StudentGrade).map((grade) => {
                   const rate = PERSONAL_CLASS_RATES[state.level][grade];
                   return (
                     <div key={grade} className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/60 hover:border-amber-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-slate-700">{grade}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">¥{rate}/节</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={state.personalClassCounts[grade] || ''}
                          onChange={(e) => handlePersonalClassChange(grade, Number(e.target.value))}
                          placeholder="0"
                          className="w-full bg-transparent text-xl font-bold text-slate-800 placeholder-slate-300 focus:outline-none group-hover:text-amber-700 transition-colors"
                        />
                     </div>
                   );
                 })}
               </div>
            </section>

            {/* 3. Group Class Inputs */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                      <Users size={18} />
                    </div>
                    班课课时 <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">2小时/节</span>
                  </h2>
                </div>
                <button 
                  onClick={addGroupClass}
                  className="flex items-center gap-1.5 text-sm bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 hover:shadow-sm font-semibold transition-all active:scale-95"
                >
                  <Plus size={16} /> 添加班课
                </button>
              </div>

              <div className="space-y-3">
                {state.groupClasses.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                    <Users size={24} className="opacity-20" />
                    <span>暂无班课记录，点击右上角添加</span>
                  </div>
                ) : (
                  state.groupClasses.map((gc) => {
                    const baseRate = PERSONAL_CLASS_RATES[state.level][gc.grade];
                    const extra = Math.max(0, gc.studentCount - 1) * 20;
                    const totalRate = baseRate + extra;
                    
                    return (
                      <div key={gc.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end sm:items-center">
                          {/* Grade Selector */}
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">年级</label>
                            <div className="relative">
                              <select 
                                value={gc.grade}
                                onChange={(e) => updateGroupClass(gc.id, 'grade', e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                              >
                                {Object.values(StudentGrade).map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>

                          {/* Student Count */}
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">学员数</label>
                            <input 
                              type="number" 
                              min="1"
                              value={gc.studentCount}
                              onChange={(e) => updateGroupClass(gc.id, 'studentCount', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                            />
                          </div>

                          {/* Class Count */}
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">课节数</label>
                            <input 
                              type="number" 
                              min="1"
                              value={gc.classCount}
                              onChange={(e) => updateGroupClass(gc.id, 'classCount', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                            />
                          </div>

                          {/* Actions & Info */}
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                            <div className="sm:hidden text-xs text-orange-600 font-bold">
                              ¥{totalRate}/节
                            </div>
                            <button 
                              onClick={() => removeGroupClass(gc.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-400">
                            构成: 基准¥{baseRate} + 人头费¥{extra} = <span className="text-orange-600 font-bold bg-orange-50 px-1 rounded">¥{totalRate}</span>
                          </span>
                          <span className="font-bold text-slate-700">
                             总计: ¥{(totalRate * gc.classCount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

             {/* 4. Trial Class Inputs */}
             <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
               <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                      <Briefcase size={18} />
                    </div>
                    试听课统计
                  </h2>
               </div>
               
                <div className="space-y-6">
                  {/* Fail Section */}
                  <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className="bg-rose-100 p-1 rounded-full"><XCircle className="text-rose-500 w-4 h-4" /></div>
                         <span className="font-bold text-slate-700">试听失败 <span className="text-xs font-normal text-slate-400">(报名费)</span></span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100/50 px-2 py-1 rounded-lg border border-rose-200">
                        固定 ¥{BASE_TRIAL_FAIL_RATE}/节
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={state.trialFailCount}
                          onChange={(e) => handleStateChange('trialFailCount', Number(e.target.value))}
                          placeholder="0"
                          className="w-full text-3xl font-bold bg-transparent text-rose-500 focus:outline-none placeholder-rose-200"
                        />
                      </div>
                      <div className="text-rose-700 font-bold text-lg bg-rose-100/30 px-3 py-1 rounded-lg">
                        + ¥{result.failIncome.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Success Section */}
                  <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/80">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <div className="bg-emerald-100 p-1 rounded-full"><ThumbsUp className="text-emerald-500 w-4 h-4" /></div>
                              <span className="font-bold text-slate-700">试听成功 <span className="text-xs font-normal text-slate-400">(奖励课时)</span></span>
                           </div>
                           <span className="text-xs text-emerald-600/70 mt-1 ml-8 font-medium">标准费 + 奖励¥{TRIAL_SUCCESS_BONUS}</span>
                        </div>
                        <button 
                          onClick={addTrialSuccess}
                          className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 hover:shadow-sm font-bold transition-all active:scale-95"
                        >
                          <Plus size={14} /> 添加记录
                        </button>
                     </div>

                     <div className="space-y-3">
                        {state.trialSuccessRecords.length === 0 ? (
                          <div className="text-center py-6 bg-white/50 rounded-xl border border-dashed border-emerald-200 text-emerald-400/70 text-xs flex flex-col items-center gap-1">
                             <ThumbsUp size={16} className="opacity-30"/>
                             暂无成功试听记录
                          </div>
                        ) : (
                          state.trialSuccessRecords.map((record) => {
                             const baseRate = PERSONAL_CLASS_RATES[state.level][record.grade];
                             const totalRate = baseRate + TRIAL_SUCCESS_BONUS;

                             return (
                                <div key={record.id} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                                   <div className="flex-1 w-full sm:w-auto">
                                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">年级</label>
                                      <select 
                                        value={record.grade}
                                        onChange={(e) => updateTrialSuccess(record.id, 'grade', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                                      >
                                        {Object.values(StudentGrade).map(g => (
                                          <option key={g} value={g}>{g}</option>
                                        ))}
                                      </select>
                                   </div>
                                   <div className="w-24">
                                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">节数</label>
                                      <input 
                                        type="number" 
                                        min="1"
                                        value={record.count}
                                        onChange={(e) => updateTrialSuccess(record.id, 'count', Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                                      />
                                   </div>
                                   <div className="flex-1 text-right text-sm">
                                      <div className="text-emerald-600 font-bold">¥{(totalRate * record.count).toLocaleString()}</div>
                                      <div className="text-[10px] text-slate-400">¥{totalRate}/节</div>
                                   </div>
                                   <button 
                                      onClick={() => removeTrialSuccess(record.id)}
                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                </div>
                             )
                          })
                        )}
                     </div>
                  </div>
                </div>
            </section>

             {/* 5. Fixed Salary Inputs (Read Only) */}
             <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
               <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                  <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                    <Banknote size={18} />
                  </div>
                  固定薪资 <span className="text-xs font-normal text-slate-400 ml-2">(根据等级自动计算)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputCard 
                    label="基本工资" 
                    icon={Briefcase} 
                    value={result.baseSalary} 
                    readOnly={true}
                    suffix="¥"
                    colorClass="text-blue-500"
                  />
                  <InputCard 
                    label="岗位工资" 
                    icon={Banknote} 
                    value={result.postSalary} 
                    readOnly={true}
                    suffix="¥"
                    colorClass="text-cyan-500"
                  />
                </div>
            </section>

          </div>

          {/* Right Column: Receipt/Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24">
              
              {/* Task Hour Status Card - REDESIGNED */}
              <div className="bg-[#1e1b4b] rounded-2xl shadow-xl overflow-hidden text-white p-6 mb-4 relative">
                 {/* Decorative Background */}
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Clock size={120} />
                 </div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold flex items-center gap-2 text-indigo-100">
                         <Clock size={18} className="text-indigo-400"/> 
                         底薪任务课时
                      </h3>
                      <span className="text-xs bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-100 font-medium backdrop-blur-sm">
                         目标 30 小时
                      </span>
                   </div>
                   
                   <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-4xl font-bold tracking-tight text-white">{result.hoursFilled}</span>
                      <span className="text-indigo-300 text-sm font-medium">/ 30 h</span>
                   </div>
                   
                   {/* Progress Bar */}
                   <div className="w-full bg-indigo-900/50 rounded-full h-3 mb-5 border border-indigo-500/20 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${Math.min(100, (result.hoursFilled / 30) * 100)}%` }}
                      ></div>
                   </div>

                   <div className="text-xs text-indigo-200/80 space-y-2 bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                         <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> 正价课时 (1v1+班课)</span>
                         <span className="font-mono text-white">{result.regularHours} h</span>
                      </div>
                      {result.regularHours < 30 && (
                         <div className="flex justify-between items-center text-yellow-300/90">
                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div> 试听抵扣课时</span>
                            <span className="font-mono">+ {Math.min(result.trialHours, 30 - result.regularHours)} h</span>
                         </div>
                      )}
                      <div className="pt-2 mt-1 border-t border-indigo-500/20 flex justify-between font-medium text-white">
                         <span>已抵扣金额</span>
                         <span>- ¥{result.taskHoursDeduction.toLocaleString()}</span>
                      </div>
                   </div>
                 </div>
              </div>


              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 border-b border-slate-100">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">本月预计发放工资</div>
                  <div className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-baseline gap-1">
                    <span className="text-2xl text-slate-400">¥</span>
                    {Math.max(0, result.totalSalary).toLocaleString()}
                  </div>
                </div>

                <div className="p-6">
                  {/* Chart */}
                  <div className="mb-6 -ml-4">
                    <SalaryChart data={result} />
                  </div>

                  {/* Detailed List */}
                  <div className="space-y-3 text-sm">
                    {/* Fixed Salary */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-indigo-100 rounded text-indigo-600"><Wallet size={12}/></div>
                           固定薪资
                        </span>
                        <span className="text-[10px] text-slate-400 pl-7">含30h任务</span>
                      </div>
                      <span className="font-bold text-slate-800">¥ {result.fixedPart.toLocaleString()}</span>
                    </div>

                    {/* NEW: Base Class Fees (NET) */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-blue-100 rounded text-blue-600"><BarChart3 size={12}/></div>
                           基础课时费 (税后)
                        </span>
                        <span className="text-[10px] text-slate-400 pl-7">已扣除任务抵扣</span>
                      </div>
                      <span className="font-bold text-blue-600">¥ {result.baseClassFees.toLocaleString()}</span>
                    </div>

                    {/* NEW: Group Headcount Bonus */}
                     <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-orange-100 rounded text-orange-600"><UserPlus size={12}/></div>
                           班课人头费
                        </span>
                        <span className="text-[10px] text-slate-400 pl-7">额外学员奖励</span>
                      </div>
                      <span className="font-bold text-orange-600">¥ {result.groupHeadcountBonus.toLocaleString()}</span>
                    </div>
                    
                    {/* 1v1 Total */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                       <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-amber-100 rounded text-amber-600"><User size={12}/></div>
                           一对一总收入
                        </span>
                      <span className="font-bold text-amber-600">¥ {result.personalClassIncome.toLocaleString()}</span>
                    </div>

                    {/* Group Total */}
                     <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                        <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-orange-100 rounded text-orange-600"><Users size={12}/></div>
                           班课总收入
                        </span>
                      <span className="font-bold text-orange-600">¥ {result.groupClassIncome.toLocaleString()}</span>
                    </div>

                    {/* Trial Total */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2 rounded">
                       <span className="text-slate-600 font-bold flex items-center gap-2">
                           <div className="p-1 bg-emerald-100 rounded text-emerald-600"><Sparkles size={12}/></div>
                           试听课总收入
                        </span>
                      <span className="font-bold text-emerald-600">¥ {result.trialBonus.toLocaleString()}</span>
                    </div>
                    
                    {/* Deduction Line */}
                    <div className="flex justify-between items-center py-3 bg-red-50/50 px-3 rounded-lg border border-red-100/50 mt-2">
                       <div className="flex flex-col gap-0.5">
                        <span className="text-red-700 font-bold flex items-center gap-2">
                          <div className="p-1 bg-red-100 rounded text-red-600"><Coins size={12}/></div>
                          任务课时抵扣
                        </span>
                        <span className="text-[10px] text-red-500/80 pl-7">优先抵扣低价课时 ({result.hoursFilled}h)</span>
                       </div>
                       <span className="font-bold text-red-600">- ¥ {result.taskHoursDeduction.toLocaleString()}</span>
                    </div>

                    <div className="pt-5 mt-2 flex justify-between items-center border-t border-slate-100">
                      <span className="text-lg font-bold text-slate-800">总计</span>
                      <span className="text-xl font-black text-indigo-600">¥ {Math.max(0, result.totalSalary).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                    onClick={() => alert(`已生成工资单\n总额: ¥${Math.max(0, result.totalSalary)}`)}
                  >
                    <Banknote size={18} />
                    确认并生成工资单
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;