import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface FlashMessageProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
}

export default function FlashMessage({ type, message, onDismiss }: FlashMessageProps) {
  const isSuccess = type === 'success';
  const borderColor = isSuccess ? 'border-l-[#1d8102]' : 'border-l-[#d91515]';
  const iconColor = isSuccess ? 'text-[#1d8102]' : 'text-[#d91515]';
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const title = isSuccess ? 'Success' : 'Error';

  return (
    <div className={`mb-6 bg-cs-bg-container border border-cs-border-divider border-l-[4px] ${borderColor} rounded-md shadow-sm p-4 flex items-start gap-3 relative`}>
      <div className={`${iconColor} mt-0.5`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 pr-6">
        <h3 className="text-cs-text-body text-[14px] font-bold mb-1">{title}</h3>
        <p className="text-cs-text-body text-[13px]">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-cs-text-body transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
