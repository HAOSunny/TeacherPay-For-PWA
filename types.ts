export enum TeacherLevel {
  ONE = '一级',
  TWO = '二级',
  THREE = '三级',
  FOUR = '四级',
  FIVE = '五级',
  SIX = '六级',
  SEVEN = '七级',
  EIGHT = '八级'
}

export enum PositionType {
  HIGH_SCHOOL = '高中岗位',
  PRIMARY_MIDDLE = '小学初中岗位'
}

export enum StudentGrade {
  GRADE_1_2 = '1-2 年级',
  GRADE_3_4 = '3-4 年级',
  GRADE_5_6 = '5-6 年级',
  MIDDLE_1 = '初一',
  MIDDLE_2 = '初二',
  MIDDLE_3 = '初三',
  HIGH_1 = '高一',
  HIGH_2 = '高二',
  HIGH_3 = '高三'
}

export interface GroupClass {
  id: string;
  grade: StudentGrade;
  studentCount: number;
  classCount: number;
}

export interface TrialSuccessRecord {
  id: string;
  grade: StudentGrade;
  count: number;
}

export interface SalaryState {
  level: TeacherLevel;
  positionType: PositionType;
  trialFailCount: number;
  trialSuccessRecords: TrialSuccessRecord[];
  personalClassCounts: Record<StudentGrade, number>;
  groupClasses: GroupClass[];
}

export interface CalculationResult {
  baseSalary: number;
  postSalary: number;
  fixedPart: number;
  trialBonus: number;
  personalClassIncome: number;
  groupClassIncome: number;
  totalSalary: number;
  successIncome: number;
  failIncome: number;
  
  // New Data Fields
  baseClassFees: number; // 1v1 + Group Base
  groupHeadcountBonus: number; // Group Headcount Only

  // New Task Hour Fields
  regularHours: number;
  trialHours: number;
  totalHours: number;
  taskHoursDeduction: number;
  hoursFilled: number;
}

export interface SalaryConfig {
  base: number;
  post: number;
}