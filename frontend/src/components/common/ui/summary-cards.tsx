import React from 'react';
import { cn } from '@/lib/utils';

// UISummaryCard Component
interface UISummaryCardProps {
  title: string;
  value: number | string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'indigo' | 'green' | 'red';
}

const UISummaryCard: React.FC<UISummaryCardProps> = ({
  title,
  value,
  description,
  className,
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'indigo':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'red':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-white', text: 'text-blue-600' };
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'indigo':
      case 'green':
      case 'red':
        return 'rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300';
      default:
        return 'rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow';
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={cn(getContainerClasses(), variantClasses.bg, className)}>
      <div className="text-center">
        <p className={cn('text-3xl font-bold mb-1', variantClasses.text)}>
          {value}
        </p>
        <p
          className={cn(
            'text-sm font-medium',
            variant !== 'default'
              ? 'text-gray-700 uppercase tracking-wide'
              : 'text-gray-600',
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

// SummaryCards Component
interface SummaryCardData {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'indigo' | 'green' | 'red';
}

interface SummaryCardsProps {
  cards: SummaryCardData[];
  className?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ cards, className }) => {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 mb-6', className)}
    >
      {cards.map((card, index) => (
        <UISummaryCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </div>
  );
};

export { UISummaryCard, SummaryCards };
