import React from 'react';

export const ExpenseBreakdownChart: React.FC = () => {
  const expenses = [
    { category: 'Accommodation', amount: 15000, percentage: 50, color: 'bg-blue-500' },
    { category: 'Food', amount: 8000, percentage: 27, color: 'bg-green-500' },
    { category: 'Transport', amount: 4000, percentage: 13, color: 'bg-yellow-500' },
    { category: 'Utilities', amount: 2000, percentage: 7, color: 'bg-purple-500' },
    { category: 'Others', amount: 1000, percentage: 3, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-200"
            />
            {expenses.map((expense, index) => {
              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = `${(expense.percentage / 100) * circumference} ${circumference}`;
              const previousPercentages = expenses.slice(0, index).reduce((sum, exp) => sum + exp.percentage, 0);
              const strokeDashoffset = -((previousPercentages / 100) * circumference);

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={`rgb(${expense.color === 'bg-blue-500' ? '59 130 246' :
                    expense.color === 'bg-green-500' ? '34 197 94' :
                    expense.color === 'bg-yellow-500' ? '234 179 8' :
                    expense.color === 'bg-purple-500' ? '168 85 247' : '107 114 128'})`}
                  strokeWidth="10"
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
              <div className="text-lg font-bold text-slate-800">₹30K</div>
              <div className="text-xs text-slate-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${expense.color}`}></div>
              <span className="text-sm text-slate-700">{expense.category}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-800">
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