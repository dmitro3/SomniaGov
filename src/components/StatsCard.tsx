

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  change?: string;
  format?: 'number' | 'currency' | 'token' | 'percentage';
  className?: string;
}

export default function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  format = 'number',
  className = '' 
}: StatsCardProps) {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return `$${(val / 1000000).toFixed(1)}M`;
      case 'token':
        return `${(val / 1000000).toFixed(0)}M`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = change?.startsWith('+') || false;

  return (
    <motion.div
      className={`stats-card group hover:border-primary-500/50 cursor-pointer ${className}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
          <Icon className="h-6 w-6 text-primary-500" />
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          isPositive 
            ? 'text-success-400 bg-success-400/10' 
            : 'text-danger-400 bg-danger-400/10'
        }`}>
          {change || '--'}
        </span>
      </div>
      
      <div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {formatValue(value, format)}
        </div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </motion.div>
  );
}