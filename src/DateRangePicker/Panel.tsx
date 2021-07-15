import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { addMonths, isAfter, isSameMonth, setDate } from '../utils/dateUtils';
import CalendarCore, {
  CalendarProps as CalendarCoreProps,
  CalendarState
} from '../Calendar/Calendar';
import { ValueType } from './types';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { DatePickerLocale } from '../locales';
import { DATERANGE_DISABLED_TARGET } from '../utils';

type OmitCalendarCoreTypes = 'disabledDate' | 'onSelect' | 'onMouseMove' | 'calendarDate';

export interface PanelProps extends WithAsProps, Omit<CalendarCoreProps, OmitCalendarCoreTypes> {
  calendarDate?: ValueType;
  disabledDate?: (date: Date, selectValue: ValueType, type: string) => boolean;
  format?: string;
  hoverRangeValue?: ValueType;
  index: number;
  isoWeek?: boolean;
  limitEndYear?: number;
  locale?: DatePickerLocale;
  onChangeCalendarDate?: (index: number, nextPageDate: Date) => void;
  onMouseMove?: (date: Date) => void;
  onSelect?: (date: Date, event?: React.SyntheticEvent<any>) => void;
  showOneCalendar?: boolean;
  showWeekNumbers?: boolean;
  value?: ValueType;
}

const defaultProps: Partial<PanelProps> = {
  as: CalendarCore,
  calendarDate: [new Date(), addMonths(new Date(), 1)],
  format: 'yyyy-MM-dd',
  index: 0,
  value: []
};
const Panel: RsRefForwardingComponent<'div', PanelProps> = React.forwardRef(
  (props: PanelProps, ref) => {
    const {
      as: Component,
      calendarDate,
      disabledDate,
      index,
      limitEndYear,
      onChangeCalendarDate,
      showOneCalendar,
      value,
      ...rest
    } = props;
    const [calendarState, setCalendarState] = useState<CalendarState>();

    const onMoveForward = useCallback(
      (nextPageDate: Date) => {
        onChangeCalendarDate?.(index, nextPageDate);
      },
      [index, onChangeCalendarDate]
    );

    const onMoveBackward = useCallback(
      (nextPageDate: Date) => {
        onChangeCalendarDate?.(index, nextPageDate);
      },
      [index, onChangeCalendarDate]
    );

    const handleChangePageDate = useCallback(
      (nextPageDate: Date) => {
        onChangeCalendarDate?.(index, nextPageDate);
        setCalendarState(undefined);
      },
      [index, onChangeCalendarDate]
    );

    const handleChangePageTime = useCallback(
      (nextPageDate: Date) => {
        onChangeCalendarDate(index, nextPageDate);
      },
      [index, onChangeCalendarDate]
    );

    const toggleMonthDropdown = useCallback(() => {
      setCalendarState(
        calendarState === CalendarState.DROP_MONTH ? undefined : CalendarState.DROP_MONTH
      );
    }, [calendarState]);

    const toggleTimeDropdown = useCallback(() => {
      setCalendarState(
        calendarState === CalendarState.DROP_TIME ? undefined : CalendarState.DROP_TIME
      );
    }, [calendarState]);

    const inSameMonth = useCallback((date: Date) => isSameMonth(date, calendarDate[index]), [
      calendarDate,
      index
    ]);

    const getPageDate = useCallback(() => calendarDate[index], [calendarDate, index]);

    const handleMoveForward = useCallback(() => {
      onMoveForward?.(addMonths(getPageDate(), 1));
    }, [getPageDate, onMoveForward]);

    const handleMoveBackward = useCallback(() => {
      onMoveBackward?.(addMonths(getPageDate(), -1));
    }, [getPageDate, onMoveBackward]);

    const disabledBackward = useCallback(() => {
      const after = isAfter(setDate(calendarDate[1], 1), setDate(addMonths(calendarDate[0], 1), 1));

      if (index === 0) {
        return false;
      }

      return !after;
    }, [calendarDate, index]);

    const disabledForward = useCallback(() => {
      if (showOneCalendar) return false;
      const after = isAfter(setDate(calendarDate[1], 1), setDate(addMonths(calendarDate[0], 1), 1));

      if (index === 1) {
        return false;
      }

      return !after;
    }, [calendarDate, index, showOneCalendar]);

    const disabledMonth = useCallback(
      (date: Date) => {
        let after: boolean;

        if (disabledDate?.(date, value, DATERANGE_DISABLED_TARGET.CALENDAR)) {
          return true;
        }
        if (showOneCalendar) return false;

        if (index === 1) {
          after = isAfter(date, calendarDate[0]);

          return !after;
        }

        after = isAfter(calendarDate[1], date);

        return !after;
      },
      [calendarDate, disabledDate, index, showOneCalendar, value]
    );

    return (
      <Component
        {...rest}
        calendarState={calendarState}
        dateRange={value}
        disabledBackward={disabledBackward()}
        disabledDate={disabledMonth}
        disabledForward={disabledForward()}
        inSameMonth={inSameMonth}
        index={index}
        limitEndYear={limitEndYear}
        onChangePageDate={handleChangePageDate}
        onChangePageTime={handleChangePageTime}
        onMoveBackward={handleMoveBackward}
        onMoveForward={handleMoveForward}
        onToggleMonthDropdown={toggleMonthDropdown}
        onToggleTimeDropdown={toggleTimeDropdown}
        calendarDate={getPageDate()}
        ref={ref}
      />
    );
  }
);

Panel.displayName = 'Panel';
Panel.defaultProps = defaultProps;
Panel.propTypes = {
  value: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  hoverValue: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  calendarDate: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  index: PropTypes.number,
  format: PropTypes.string,
  isoWeek: PropTypes.bool,
  limitEndYear: PropTypes.number,
  classPrefix: PropTypes.string,
  disabledDate: PropTypes.func,
  onSelect: PropTypes.func,
  onMouseMove: PropTypes.func,
  onChangeCalendarDate: PropTypes.func
};

export default Panel;
