import React from 'react';
import { X } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  message?: string;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  message = "You need to login to perform this action"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};