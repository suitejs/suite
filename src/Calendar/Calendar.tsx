import React, { HTMLAttributes, useCallback } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import MonthDropdown from './MonthDropdown';
import TimeDropdown from './TimeDropdown';
import View from './View';
import Header, { HeaderProps } from './Header';
import { useClassNames, DateUtils, composeFunctions } from '../utils';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { CalendarLocale } from '../locales';
import { CalendarProvider } from './CalendarContext';

export enum CalendarState {
  'DROP_TIME' = 'DROP_TIME',
  'DROP_MONTH' = 'DROP_MONTH'
}

export interface CalendarProps
  extends WithAsProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onChange' | 'onMouseMove'>,
    Omit<HeaderProps, 'onMoveForward' | 'onMoveBackward' | 'showDate' | 'showTime' | 'showMonth'> {
  /** The status of the calendar display: day, month, time. */
  calendarState?: CalendarState;

  /** The panel render based on date range */
  dateRange?: Date[];

  /** Disabled date */
  disabledDate?: (date: Date) => boolean;

  /** Disabled hours */
  disabledHours?: (hour: number, date: Date) => boolean;

  /** Disabled minutes */
  disabledMinutes?: (minute: number, date: Date) => boolean;

  /** Hidden seconds */
  disabledSeconds?: (second: number, date: Date) => boolean;

  /** Format str */
  format?: string;

  /** Hidden hours */
  hideHours?: (hour: number, date: Date) => boolean;

  /** Hidden minutes */
  hideMinutes?: (minute: number, date: Date) => boolean;

  /** Hidden seconds */
  hideSeconds?: (second: number, date: Date) => boolean;

  /** The value that mouse hover on in range selection */
  hoverRangeValue?: Date[];

  /** Is it in the same month as today */
  inSameMonth?: (date: Date) => boolean;

  /** ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day */
  isoWeek?: boolean;

  /** Limit showing how many years in the future */
  limitEndYear?: number;

  /** Custom locale */
  locale?: CalendarLocale;

  /** Callback after the date has changed */
  onChangePageDate?: (nextPageDate: Date, event: React.MouseEvent) => void;

  /** Callback after the time has changed */
  onChangePageTime?: (nextPageTime: Date, event: React.MouseEvent) => void;

  /** Callback after mouse enter other date cell */
  onMouseMove?: (date: Date) => void;

  /** Switch to the callback triggered after the previous month. */
  onMoveBackward?: (nextPageDate: Date) => void;

  /** Switch to the callback triggered after the next month. */
  onMoveForward?: (nextPageDate: Date) => void;

  /** Callback fired before the date selected */
  onSelect?: (date: Date, event: React.MouseEvent<HTMLDivElement>) => void;

  /** Date displayed on the current page */
  calendarDate: Date;

  /** Custom rendering cell*/
  renderCell?: (date: Date) => React.ReactNode;

  /** Whether to show week numbers */
  showWeekNumbers?: boolean;

  inline?: boolean;
}

const defaultProps: Partial<CalendarProps> = {
  classPrefix: 'calendar',
  as: 'div'
};

const Calendar: RsRefForwardingComponent<'div', CalendarProps> = React.forwardRef(
  (props: CalendarProps, ref) => {
    const {
      as: Component,
      className,
      classPrefix,
      calendarState,
      dateRange,
      disabledBackward,
      disabledDate,
      disabledForward,
      format,
      hoverRangeValue,
      inSameMonth,
      isoWeek,
      limitEndYear,
      locale,
      onChangePageDate,
      onChangePageTime,
      onMouseMove,
      onMoveBackward,
      onMoveForward,
      onSelect,
      onToggleMeridian,
      onToggleMonthDropdown,
      onToggleTimeDropdown,
      calendarDate,
      renderCell,
      renderTitle,
      renderToolbar,
      showMeridian,
      showWeekNumbers,
      inline,
      ...rest
    } = props;
    const { withClassPrefix, merge } = useClassNames(classPrefix);
    const isDisabledDate = (date: Date) => disabledDate?.(date);
    const isTimeDisabled = (date: Date) => DateUtils.disabledTime(props, date);
    const handleMoveForward = useCallback(() => {
      onMoveForward?.(DateUtils.addMonths(calendarDate, 1));
    }, [onMoveForward, calendarDate]);

    const handleMoveBackward = useCallback(() => {
      onMoveBackward?.(DateUtils.addMonths(calendarDate, -1));
    }, [onMoveBackward, calendarDate]);

    const showDate = DateUtils.shouldDate(format);
    const showTime = DateUtils.shouldTime(format);
    const showMonth = DateUtils.shouldMonth(format);

    const onlyShowTime = showTime && !showDate && !showMonth;
    const onlyShowMonth = showMonth && !showDate && !showTime;
    const dropTime = calendarState === CalendarState.DROP_TIME || onlyShowTime;
    const dropMonth = calendarState === CalendarState.DROP_MONTH || onlyShowMonth;

    const inSameThisMonthDate = useCallback(
      (date: Date) =>
        composeFunctions(
          d => DateUtils.setDate(d, 1),
          d => DateUtils.isSameMonth(d, date)
        )(date),
      []
    );

    const calendarClasses = merge(
      className,
      withClassPrefix({
        'show-time-dropdown': dropTime,
        'show-month-dropdown': dropMonth,
        'show-week-numbers': showWeekNumbers
      })
    );
    const timeDropdownProps = pick(rest, DateUtils.calendarOnlyProps);
    const contextValue = {
      date: calendarDate,
      dateRange,
      disabledDate: isDisabledDate,
      format,
      hoverRangeValue,
      inSameMonth: inSameMonth ?? inSameThisMonthDate,
      isoWeek,
      locale,
      onChangePageDate,
      onChangePageTime,
      onMouseMove,
      onSelect,
      renderCell,
      showWeekNumbers,
      inline
    };
    return (
      <CalendarProvider value={contextValue}>
        <Component
          {...DateUtils.omitHideDisabledProps<Partial<CalendarProps>>(rest)}
          role="table"
          className={calendarClasses}
          ref={ref}
        >
          <Header
            showMonth={showMonth}
            showDate={showDate}
            showTime={showTime}
            showMeridian={showMeridian}
            disabledTime={isTimeDisabled}
            onMoveForward={handleMoveForward}
            onMoveBackward={handleMoveBackward}
            onToggleMonthDropdown={onToggleMonthDropdown}
            onToggleTimeDropdown={onToggleTimeDropdown}
            onToggleMeridian={onToggleMeridian}
            renderTitle={renderTitle}
            renderToolbar={renderToolbar}
            disabledBackward={disabledBackward}
            disabledForward={disabledForward}
          />
          {showDate && <View />}
          {showMonth && (
            <MonthDropdown
              show={dropMonth}
              limitEndYear={limitEndYear}
              disabledMonth={isDisabledDate}
            />
          )}
          {showTime && (
            <TimeDropdown {...timeDropdownProps} show={dropTime} showMeridian={showMeridian} />
          )}
        </Component>
      </CalendarProvider>
    );
  }
);

Calendar.displayName = 'Calendar';
Calendar.defaultProps = defaultProps;
Calendar.propTypes = {
  calendarState: PropTypes.oneOf(Object.values(CalendarState)),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  disabledDate: PropTypes.func,
  disabledHours: PropTypes.func,
  disabledMinutes: PropTypes.func,
  disabledSeconds: PropTypes.func,
  format: PropTypes.string,
  hideHours: PropTypes.func,
  hideMinutes: PropTypes.func,
  hideSeconds: PropTypes.func,
  inSameMonth: PropTypes.func,
  isoWeek: PropTypes.bool,
  limitEndYear: PropTypes.number,
  locale: PropTypes.object,
  onChangePageDate: PropTypes.func,
  onChangePageTime: PropTypes.func,
  onMoveBackward: PropTypes.func,
  onMoveForward: PropTypes.func,
  onSelect: PropTypes.func,
  onToggleMeridian: PropTypes.func,
  onToggleMonthDropdown: PropTypes.func,
  onToggleTimeDropdown: PropTypes.func,
  calendarDate: PropTypes.instanceOf(Date),
  renderCell: PropTypes.func,
  renderTitle: PropTypes.func,
  renderToolbar: PropTypes.func,
  showMeridian: PropTypes.bool,
  showWeekNumbers: PropTypes.bool
};

export default Calendar;
