import React from 'react';

interface ProductItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function ProductItem({ icon, title, description }: ProductItemProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-t border-cs-border-divider first:border-t-0">
      <div className="flex-shrink-0 w-16 flex justify-center text-white">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-white font-bold text-base">{title}</h4>
        <p className="text-cs-text-body text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
