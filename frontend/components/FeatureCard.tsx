import React from 'react';

interface FeatureCardProps {
  title: string;
  description: React.ReactNode;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 p-5 bg-cs-bg-container border border-cs-border-divider rounded-lg">
      <h4 className="text-white font-bold text-base">{title}</h4>
      <div className="text-cs-text-body text-sm leading-relaxed">
        {description}
      </div>
    </div>
  );
}
