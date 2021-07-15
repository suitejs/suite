import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Calendar, { CalendarState } from './Calendar';
import { CalendarLocale } from '../locales';
import Button from '../Button';
import { FormattedDate } from '../CustomProvider';
import { useClassNames, useCustom } from '../utils';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import useCalendarDate from './useCalendarDate';

export interface CalendarPanelProps extends WithAsProps {
  /** Controlled value */
  value?: Date;

  /** Default value  */
  defaultValue?: Date;

  /** ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day  */
  isoWeek?: boolean;

  /** Display a compact calendar   */
  compact?: boolean;

  /** Show border   */
  bordered?: boolean;

  /** Custom locale */
  locale?: CalendarLocale;

  /**  Callback fired before the value changed  */
  onChange?: (date: Date) => void;

  /** Callback fired before the date selected */
  onSelect?: (date: Date) => void;

  /** Custom render calendar cells  */
  renderCell?: (date: Date) => React.ReactNode;
}

const defaultProps: Partial<CalendarPanelProps> = {
  defaultValue: new Date(),
  classPrefix: 'calendar',
  as: Calendar
};

const CalendarPanel: RsRefForwardingComponent<
  typeof Calendar,
  CalendarPanelProps
> = React.forwardRef((props: CalendarPanelProps, ref) => {
  const {
    as: Component,
    bordered,
    className,
    classPrefix,
    compact,
    defaultValue,
    isoWeek,
    locale: overrideLocale,
    onChange,
    onSelect,
    renderCell,
    value,
    ...rest
  } = props;

  const { calendarDate, setCalendarDate } = useCalendarDate(value, defaultValue);
  const [showMonth, setShowMonth] = useState<boolean>(false);
  const { locale } = useCustom('Calendar', overrideLocale);

  const handleToggleMonthDropdown = useCallback(() => {
    setShowMonth(prevShowMonth => !prevShowMonth);
  }, []);

  const handleChange = useCallback(
    (nextValue: Date) => {
      setCalendarDate(nextValue);
      onChange?.(nextValue);
    },
    [setCalendarDate, onChange]
  );

  const handleChangePageDate = useCallback(
    (nextValue: Date) => {
      setShowMonth(false);
      handleChange(nextValue);
    },
    [handleChange]
  );

  const handleClickToday = useCallback(() => {
    setShowMonth(false);
    handleChange(new Date());
  }, [handleChange]);

  const handleSelect = useCallback(
    (nextValue: Date) => {
      onSelect?.(nextValue);
      handleChange(nextValue);
    },
    [handleChange, onSelect]
  );

  const { prefix, merge, withClassPrefix } = useClassNames(classPrefix);

  const renderToolbar = useCallback(
    () => (
      <Button className={prefix('btn-today')} size="sm" onClick={handleClickToday}>
        {locale.today || 'Today'}
      </Button>
    ),
    [handleClickToday, locale.today, prefix]
  );

  const customRenderCell = useCallback((date: Date) => renderCell?.(date), [renderCell]);

  const classes = merge(className, withClassPrefix('panel', { bordered, compact }));

  return (
    <Component
      {...rest}
      inline
      className={classes}
      ref={ref}
      isoWeek={isoWeek}
      format="yyyy-MM-dd"
      calendarState={showMonth ? CalendarState.DROP_MONTH : null}
      calendarDate={calendarDate}
      limitEndYear={1000}
      locale={locale}
      renderTitle={date => (
        <FormattedDate date={date} formatStr={locale.formattedMonthPattern || 'MMMM  yyyy'} />
      )}
      renderToolbar={renderToolbar}
      renderCell={customRenderCell}
      onMoveForward={handleChange}
      onMoveBackward={handleChange}
      onToggleMonthDropdown={handleToggleMonthDropdown}
      onChangePageDate={handleChangePageDate}
      onSelect={handleSelect}
    />
  );
});

CalendarPanel.displayName = 'CalendarPanel';
CalendarPanel.propTypes = {
  value: PropTypes.instanceOf(Date),
  defaultValue: PropTypes.instanceOf(Date),
  isoWeek: PropTypes.bool,
  compact: PropTypes.bool,
  bordered: PropTypes.bool,
  locale: PropTypes.object,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  renderCell: PropTypes.func
};
CalendarPanel.defaultProps = defaultProps;

export default CalendarPanel;
