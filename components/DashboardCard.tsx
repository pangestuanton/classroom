import React from 'react';

interface DashboardCardProps {
  value: number | string;
  label: string;
  iconSvg: string;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ value, label, iconSvg, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary'
        };
      case 'success':
        return {
          bg: 'bg-success-bg',
          text: 'text-success'
        };
      case 'warning':
        return {
          bg: 'bg-warning-bg',
          text: 'text-warning'
        };
      case 'info':
        return {
          bg: 'bg-primary/10', // using sky-blue/light blue variant mapped to action blue
          text: 'text-primary'
        };
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-canvas border border-hairline p-lg rounded-lg flex items-center gap-lg transition-smooth hover:-translate-y-[2px] select-none">
      <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center ${styles.bg} ${styles.text}`}>
        <span 
          className="w-6 h-6 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      </div>
      <div>
        <div className="typo-hero font-semibold text-ink leading-none">{value}</div>
        <div className="typo-caption text-ink-muted-48 mt-[4px] tracking-tight">{label}</div>
      </div>
    </div>
  );
};
