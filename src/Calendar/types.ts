import React from 'react';
import { CalendarLocale } from '../locales';

export interface CalendarInnerContextValue {
  date: Date;
  dateRange?: Date[];
  disabledDate?: (date: Date, selectRangeValue?: Date[], type?: string) => boolean;
  format?: string;
  hoverRangeValue?: Date[];
  inSameMonth?: (date: Date) => boolean;
  isoWeek?: boolean;
  onChangePageDate?: (nextPageDate: Date, event: React.MouseEvent) => void;
  onChangePageTime?: (nextPageTime: Date, event: React.MouseEvent) => void;
  onMouseMove?: (date: Date) => void;
  onSelect?: (date: Date, event: React.MouseEvent) => void;
  renderCell?: (date: Date) => React.ReactNode;
  showWeekNumbers?: boolean;
  inline?: boolean;
}

export interface CalendarContextValue extends CalendarInnerContextValue {
  locale: CalendarLocale;
  formatDate?: (
    date: Date | string | number,
    format?: string,
    options?: {
      locale?: any;
    }
  ) => string;
}
