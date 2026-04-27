import React from 'react';
import { LucideProps } from 'lucide-react';

export type IconVariant = 'outline' | 'solid';

interface IconWrapperProps {
  icon: React.ComponentType<LucideProps>;
  variant?: IconVariant;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  variant = 'outline',
  size = 20,
  className = '',
  strokeWidth = 1.2,
}) => {
  const isSolid = variant === 'solid';
  
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...(isSolid && { fill: 'currentColor' })}
    />
  );
};

export const iconDefaults = {
  strokeWidth: 1.2,
} as const;