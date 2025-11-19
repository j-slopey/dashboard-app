import { PropsWithChildren } from 'react';

interface WidgetCardProps {
  title?: string;
  className?: string;
  bodyClassName?: string;
}

const baseCardClasses =
  'bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col gap-4';
const baseBodyClasses = 'flex flex-col gap-4';

export const WidgetCard = ({ title, className = '', bodyClassName = '', children }: PropsWithChildren<WidgetCardProps>) => (
  <div className={`${baseCardClasses} ${className}`}>
    {title && <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>}
    <div className={`${baseBodyClasses} ${bodyClassName}`.trim()}>
      {children}
    </div>
  </div>
);
