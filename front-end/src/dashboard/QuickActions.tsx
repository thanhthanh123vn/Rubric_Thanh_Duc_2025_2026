import React from 'react';
import { Plus, FileText } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create New Rubric */}
        <button className="flex items-center gap-4 p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all duration-200 group">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <Plus className="text-emerald-600" size={24} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Create New Rubric</p>
            <p className="text-sm text-gray-600">Design assessment rubrics</p>
          </div>
        </button>

        {/* View OBE Report */}
        <button className="flex items-center gap-4 p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition-all duration-200 group">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <FileText className="text-amber-600" size={24} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">View OBE Report</p>
            <p className="text-sm text-gray-600">Check learning outcomes</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
