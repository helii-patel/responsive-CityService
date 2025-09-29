import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface CostCalculatorProps {
  selectedServices: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
  userBudget: {
    min: number;
    max: number;
  };
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ selectedServices, userBudget }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // Calculate totals
  const selectedServicesList = selectedServices.filter(service => selectedItems[service.id]);
  const totalMonthly = selectedServicesList.reduce((sum, service) => sum + (service.price || 0), 0);
  const totalDaily = totalMonthly / 30;

  // Budget analysis
  const budgetMax = userBudget.max || 0;
  const budgetMin = userBudget.min || 0;
  const isOverBudget = totalMonthly > budgetMax;
  const budgetUsagePercent = budgetMax > 0 ? (totalMonthly / budgetMax) * 100 : 0;

  const toggleService = (serviceId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Calculator className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Cost Calculator</h3>
          <p className="text-sm text-slate-600">Select options to calculate costs</p>
        </div>
      </div>

      {/* Daily and Monthly Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Daily Cost */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Daily</span>
          </div>
          <div className="text-2xl font-bold">₹{Math.round(totalDaily).toLocaleString()}</div>
          <div className="text-sm opacity-90">Per day cost</div>
        </div>

        {/* Monthly Cost */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Monthly</span>
          </div>
          <div className="text-2xl font-bold">₹{totalMonthly.toLocaleString()}</div>
          <div className="text-sm opacity-90">Per month cost</div>
        </div>
      </div>

      {/* Budget Analysis */}
      {budgetMax > 0 && (
        <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-800">Budget Analysis</h4>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOverBudget ? 'bg-red-100 text-red-700' : 
              budgetUsagePercent > 80 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-green-100 text-green-700'
            }`}>
              {isOverBudget ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  Over Budget
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  Within Budget
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Range: ₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}</span>
              <span>Usage: {budgetUsagePercent.toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-red-500' : 
                  budgetUsagePercent > 80 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>
            
            {isOverBudget && (
              <p className="text-sm text-red-600">
                You're ₹{(totalMonthly - budgetMax).toLocaleString()} over your maximum budget.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-800">Cost Breakdown</h4>
          <button 
            onClick={() => setSelectedItems({})}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear All
          </button>
        </div>
        
        {selectedServices.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No services available for calculation
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedServices.map(service => (
              <label
                key={service.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems[service.id] || false}
                    onChange={() => toggleService(service.id)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-sm text-slate-800">{service.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{service.type}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">
                  ₹{(service.price || 0).toLocaleString()}/month
                </div>
              </label>
            ))}
          </div>
        )}
        
        {selectedServicesList.length > 0 && (
          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex justify-between items-center font-semibold text-slate-800">
              <span>Total ({selectedServicesList.length} items)</span>
              <span>₹{totalMonthly.toLocaleString()}/month</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};