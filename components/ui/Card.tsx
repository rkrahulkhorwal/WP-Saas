import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md p-6', className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('mb-4 pb-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <h3 className={clsx('text-xl font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
