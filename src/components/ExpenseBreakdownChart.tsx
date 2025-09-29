import React from 'react';

export const ExpenseBreakdownChart: React.FC = () => {
  const expenses = [
    { category: 'Accommodation', amount: 15000, percentage: 50, color: '#334155' },
    { category: 'Food', amount: 8000, percentage: 27, color: '#475569' },
    { category: 'Transport', amount: 4000, percentage: 13, color: '#64748b' },
    { category: 'Utilities', amount: 2000, percentage: 7, color: '#94a3b8' },
    { category: 'Others', amount: 1000, percentage: 3, color: '#cbd5e1' },
  ];

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#f1f5f9"
              strokeWidth="8"
              fill="transparent"
            />
            {expenses.map((expense, index) => {
              const circumference = 2 * Math.PI * 35;
              const strokeDasharray = `${(expense.percentage / 100) * circumference} ${circumference}`;
              const previousPercentages = expenses.slice(0, index).reduce((sum, exp) => sum + exp.percentage, 0);
              const strokeDashoffset = -((previousPercentages / 100) * circumference);

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="35"
                  stroke={expense.color}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-in-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">₹{(total / 1000).toFixed(0)}K</div>
              <div className="text-xs text-slate-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: expense.color }}
              ></div>
              <span className="text-sm font-medium text-slate-700">{expense.category}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">
                ₹{expense.amount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">{expense.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};