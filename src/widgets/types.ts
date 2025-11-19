import { ComponentType } from 'react';

export type WidgetArea = 'sidebar' | 'main';
export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  id: string;
  title: string;
  area?: WidgetArea;
  size?: WidgetSize;
  component: ComponentType<any>;
  props?: Record<string, unknown>;
  cardClassName?: string;
  bodyClassName?: string;
}
