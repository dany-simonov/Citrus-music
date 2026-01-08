/**
 * Компонент иконки
 * @module components/ui/icon
 */

import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({ icon: IconComponent, className, ...props }: IconProps) {
  return <IconComponent className={cn('w-5 h-5', className)} {...props} />;
}
