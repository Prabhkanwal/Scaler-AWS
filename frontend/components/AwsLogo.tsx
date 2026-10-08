import React from 'react';

export default function AwsLogo({ width = 35, className = "" }: { color?: string, width?: number, className?: string }) {
  return (
    <img
      src="/aws-logo.png"
      alt="AWS Logo"
      width={width}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
