import { useState, useCallback, useRef } from 'react';
import { useUpdateEffect } from '../utils';

const useCalendarDate = (value: Date, defaultDate: Date) => {
  const valueRef = useRef(value);

  const [calendarDate, setValue] = useState<Date>(value ?? defaultDate ?? new Date());

  const setCalendarDate = useCallback(
    (date: Date) => {
      if (date.valueOf() !== calendarDate.valueOf()) {
        setValue(date);
      }
    },
    [calendarDate]
  );

  useUpdateEffect(() => {
    if (value?.valueOf() !== valueRef.current?.valueOf()) {
      setCalendarDate(value);
      valueRef.current = value;
    }
  }, [value]);

  return { calendarDate, setCalendarDate };
};

export default useCalendarDate;
