import { PropsWithChildren } from 'react';

interface WidgetCardProps {
  title?: string;
  className?: string;
  bodyClassName?: string;
}

// `h-full` allows the card to take the full height of the grid cell; `justify-start` ensures the title stays pinned to the top.
const baseCardClasses =
  'h-full bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col gap-4 justify-start';
// The body grows to fill remaining space and centers its contents vertically while left-aligning horizontally.
const baseBodyClasses = 'flex flex-col flex-1 justify-center items-start gap-4';

export const WidgetCard = ({ title, className = '', bodyClassName = '', children }: PropsWithChildren<WidgetCardProps>) => (
  <div className={`${baseCardClasses} ${className} flex flex-col`}>
    {title && <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>}
    <div className={`${baseBodyClasses} ${bodyClassName}`.trim()}>
      {children}
    </div>
  </div>
);
