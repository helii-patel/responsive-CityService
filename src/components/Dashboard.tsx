import React from 'react';
import { TrendingUp, MapPin, DollarSign, Users, Lightbulb, Building, Home } from 'lucide-react';
import { CostComparisonChart } from './CostComparisonChart';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Cities Analyzed',
      value: '50+',
      change: '+12%',
      icon: MapPin,
      trend: 'up',
    },
    {
      label: 'Avg. Monthly Savings',
      value: '₹8,500',
      change: '+24%',
      icon: DollarSign,
      trend: 'up',
    },
    {
      label: 'Active Users',
      value: '2.4K',
      change: '+18%',
      icon: Users,
      trend: 'up',
    },
    {
      label: 'Accuracy Rate',
      value: '95%',
      change: '+5%',
      icon: TrendingUp,
      trend: 'up',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Dashboard Overview
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get insights into city living costs and make informed decisions about your next move
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-slate-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Cost Comparison Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-slate-700 rounded-full mr-4"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">City Cost Comparison</h3>
              <p className="text-sm text-slate-600">Average monthly living costs</p>
            </div>
          </div>
          <CostComparisonChart />
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-slate-700 rounded-full mr-4"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Monthly Expense Breakdown</h3>
              <p className="text-sm text-slate-600">How your budget is typically allocated</p>
            </div>
          </div>
          <ExpenseBreakdownChart />
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">AI-Powered Insights</h3>
            <p className="text-slate-600">Personalized recommendations based on your preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Savings Tip */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-slate-900">Savings Tip</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Switching to public transport in Mumbai could save you 
              <span className="font-bold text-slate-900"> ₹3,200/month</span>
            </p>
          </div>

          {/* City Recommendation */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-900">City Recommendation</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Based on your budget, 
              <span className="font-bold text-slate-900"> Pune</span> offers 35% lower living costs than Mumbai
            </p>
          </div>

          {/* Accommodation Insight */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-semibold text-slate-900">Accommodation</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Shared apartments in your preferred area average 
              <span className="font-bold text-slate-900"> ₹12,000/month</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};