import React from 'react';
import { TrendingUp, MapPin, DollarSign, Users } from 'lucide-react';
import { CostComparisonChart } from './CostComparisonChart';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Cities Analyzed',
      value: '50+',
      change: '+12%',
      icon: MapPin,
      color: 'bg-blue-500',
    },
    {
      label: 'Avg. Monthly Savings',
      value: '₹8,500',
      change: '+24%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Active Users',
      value: '2.4K',
      change: '+18%',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Cost Predictions',
      value: '95%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Your City Services Dashboard
        </h2>
        <p className="text-slate-600">
          Discover insights and make informed decisions about city living
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
              <p className="text-slate-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            City Cost Comparison
          </h3>
          <CostComparisonChart />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Monthly Expense Breakdown
          </h3>
          <ExpenseBreakdownChart />
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:scale-105 transition-all duration-300">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">🤖 AI-Powered Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-slate-700">
              <strong>💡 Savings Tip:</strong> Switching to public transport in Mumbai could save you 
              <span className="text-green-600 font-semibold"> ₹3,200/month</span>
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <p className="text-slate-700">
              <strong>🏙️ City Recommendation:</strong> Based on your budget, 
              <span className="text-blue-600 font-semibold"> Pune</span> offers 35% lower living costs than Mumbai
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <p className="text-slate-700">
              <strong>🏠 Accommodation:</strong> Shared apartments in your preferred area average 
              <span className="text-blue-600 font-semibold"> ₹12,000/month</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};