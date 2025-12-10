import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalculationResult } from '../types';

interface SalaryChartProps {
  data: CalculationResult;
}

export const SalaryChart: React.FC<SalaryChartProps> = ({ data }) => {
  const chartData = [
    { name: '基本工资', value: data.fixedPart, color: '#6366f1' }, // Indigo
    { name: '一对一课', value: data.personalClassIncome, color: '#f59e0b' }, // Amber
    { name: '班课', value: data.groupClassIncome, color: '#ea580c' }, // Orange
    { name: '试听课(成功)', value: data.successIncome, color: '#10b981' }, // Emerald
    { name: '试听课(失败)', value: data.failIncome, color: '#f43f5e' }, // Rose
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        暂无数据预览
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `¥${value.toLocaleString()}`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};