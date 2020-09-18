import {
  addMonths,
  endOfDay,
  endOfISOWeek,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfWeek
} from '../utils/dateUtils';
import { toLocalTimeZone, toTimeZone, zonedDate } from '../utils/timeZone';
import { ValueType } from './types';
import { useCallback } from 'react';

export const setTimingMargin = (date, way = 'left'): Date =>
  way === 'right' ? endOfDay(date) : startOfDay(date);

export const toLocalValue = (value: ValueType, timeZone: string): ValueType => {
  if (typeof value === 'undefined') {
    return value;
  }
  return (value ?? []).map(item => toLocalTimeZone(item, timeZone)) as ValueType;
};

export const toZonedValue = (value: ValueType, timeZone: string): ValueType => {
  if (typeof value === 'undefined') {
    return value;
  }
  return (value ?? []).map(item => toTimeZone(item, timeZone)) as ValueType;
};

export function getCalendarDate({
  value,
  timeZone
}: {
  value?: ValueType;
  timeZone: string | undefined;
}): ValueType {
  // Update calendarDate if the value is not null
  value = value ?? [];
  if (value[0] && value[1]) {
    const sameMonth = isSameMonth(value[0], value[1]);
    return [value[0], sameMonth ? addMonths(value[1], 1) : value[1]];
  }
  const todayDate = zonedDate(timeZone);
  return [todayDate, addMonths(todayDate, 1)];
}

export const isSameValueType = (source: ValueType, dest: ValueType) =>
  source?.[0]?.valueOf() === dest?.[0]?.valueOf() &&
  source?.[1]?.valueOf() === dest?.[1]?.valueOf();

export const getMonthHoverRange = (date: Date): ValueType => [startOfMonth(date), endOfMonth(date)];

export const getWeekHoverRange = (isoWeek: boolean, date: Date): ValueType => {
  if (isoWeek) {
    // set to the first day of this week according to ISO 8601, 12:00 am
    return [startOfISOWeek(date), endOfISOWeek(date)];
  }

  return [startOfWeek(date), endOfWeek(date)];
};
