import { WidgetCard } from './WidgetCard';
import { WidgetGrid } from './WidgetGrid';
import { WidgetConfig } from './types';

interface DashboardLayoutProps {
  widgets: WidgetConfig[];
}

export const DashboardLayout = ({ widgets }: DashboardLayoutProps) => {
  const sidebarWidgets = widgets.filter((widget) => widget.area === 'sidebar');
  const mainWidgets = widgets.filter((widget) => widget.area !== 'sidebar');

  return (
    <div className="flex h-screen p-6 gap-6">
      {sidebarWidgets.length > 0 && (
        <div className="flex flex-col justify-center gap-4">
          {sidebarWidgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              title={widget.title}
              className={widget.cardClassName}
              bodyClassName={`flex-1 ${widget.bodyClassName ?? ''}`.trim()}
            >
              <widget.component {...(widget.props ?? {})} />
            </WidgetCard>
          ))}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <WidgetGrid widgets={mainWidgets} />
      </div>
    </div>
  );
};
