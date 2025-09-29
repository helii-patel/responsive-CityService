import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find(opt => opt.value === value) || null
  );
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedOption(options.find(opt => opt.value === value) || null);
  }, [value, options]);

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-11 px-3 py-2.5 text-left border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-colors ${
          disabled
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
            : 'bg-white text-slate-700 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-slate-700' : 'text-slate-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`w-full px-3 py-2.5 text-left hover:bg-slate-50 focus:bg-slate-100 focus:outline-none transition-colors ${
                selectedOption?.value === option.value
                  ? 'bg-slate-100 text-slate-800 font-medium'
                  : 'text-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};