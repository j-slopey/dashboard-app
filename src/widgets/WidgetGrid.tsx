import { WidgetCard } from './WidgetCard';
import { WidgetConfig } from './types';

const sizeClassMap: Record<string, string> = {
  small: 'md:col-span-1',
  medium: 'md:col-span-2',
  large: 'md:col-span-3',
};

interface WidgetGridProps {
  widgets: WidgetConfig[];
}

export const WidgetGrid = ({ widgets }: WidgetGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
    {widgets.map((widget) => (
      <WidgetCard
        key={widget.id}
        title={widget.title}
        className={`${sizeClassMap[widget.size ?? 'medium'] ?? ''}`.trim()}
        bodyClassName={widget.bodyClassName}
      >
        <widget.component {...(widget.props ?? {})} />
      </WidgetCard>
    ))}
  </div>
);
