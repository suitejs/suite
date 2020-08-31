import * as React from 'react';
import { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import omitBy from 'lodash/omitBy';
import FormattedDate from '../IntlProvider/FormattedDate';
import Calendar from '../Calendar/Calendar';
import Toolbar, { RangeType } from './Toolbar';
import { shouldOnlyTime } from '../utils/formatUtils';
import composeFunctions from '../utils/composeFunctions';
import { createChainedFunction, useClassNames, useCustom } from '../utils';
import {
  getToggleWrapperClassName,
  MenuWrapper,
  PickerToggle,
  PickerToggleTrigger
} from '../Picker';
import {
  calendarOnlyProps,
  CalendarOnlyPropsType,
  disabledTime,
  getHours,
  getMinutes,
  getSeconds,
  isEqual,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds
} from '../utils/dateUtils';
import { pickerDefaultProps, pickerPropTypes } from '../Picker/propTypes';
import { toLocalTimeZone, toTimeZone, zonedDate } from '../utils/timeZone';
import { FormControlBaseProps, PickerBaseProps, RsRefForwardingComponent } from '../@types/common';
import { DatePickerLocale } from './types';

export type { RangeType } from './Toolbar';
export interface DatePickerProps
  extends PickerBaseProps<DatePickerLocale>,
    FormControlBaseProps<Date> {
  /** Configure shortcut options */
  ranges?: RangeType[];

  /** Calendar panel default presentation date and time */
  calendarDefaultDate?: Date;

  /** Format date */
  format?: string;

  /** IANA Time zone */
  timeZone?: string;

  /** Display date panel when component initial */
  inline?: boolean;

  /** ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day */
  isoWeek?: boolean;

  /** Set the lower limit of the available year relative to the current selection date */
  limitEndYear?: number;

  /** Whether to show week numbers */
  showWeekNumbers?: boolean;

  /** Meridian format */
  showMeridian?: boolean;

  /** Disabled date */
  disabledDate?: (date?: Date) => boolean;

  /** Disabled hours */
  disabledHours?: (hour: number, date: Date) => boolean;

  /** Disabled minutes */
  disabledMinutes?: (minute: number, date: Date) => boolean;

  /** Disabled seconds */
  disabledSeconds?: (second: number, date: Date) => boolean;

  /** Hidden hours */
  hideHours?: (hour: number, date: Date) => boolean;

  /** Hidden minutes */
  hideMinutes?: (minute: number, date: Date) => boolean;

  /** Hidden seconds */
  hideSeconds?: (second: number, date: Date) => boolean;

  /** one tap to select */
  oneTap?: boolean;

  /** Called when the calendar panel date changes */
  onChangeCalendarDate?: (date: Date, event?: React.SyntheticEvent<HTMLElement>) => void;

  /** Called when opening the month view */
  onToggleMonthDropdown?: (toggle: boolean) => void;

  /** Called when opening the time view */
  onToggleTimeDropdown?: (toggle: boolean) => void;

  /** Called when the option is selected */
  onSelect?: (date: Date, event?: React.SyntheticEvent<HTMLElement>) => void;

  /** Called after the prev month */
  onPrevMonth?: (date: Date) => void;

  /** Called after the next month */
  onNextMonth?: (date: Date) => void;

  /** Called after clicking the OK button */
  onOk?: (date: Date, event: React.SyntheticEvent<HTMLElement>) => void;

  /** Called when clean */
  onClean?: <TEvent extends React.SyntheticEvent<HTMLElement> = React.SyntheticEvent<HTMLElement>>(
    event: TEvent
  ) => void;

  /** Custom render value */
  renderValue?: (value: Date, format: string) => React.ReactNode;

  /** Pop-up panel container reference   */
  panelContainerRef?: Ref<HTMLDivElement>;
}

enum CalendarState {
  'DROP_MONTH' = 'DROP_MONTH',
  'DROP_TIME' = 'DROP_TIME'
}

const defaultProps: Partial<DatePickerProps> = {
  ...pickerDefaultProps,
  limitEndYear: 1000,
  placeholder: '',
  locale: {
    sunday: 'Su',
    monday: 'Mo',
    tuesday: 'Tu',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
    ok: 'OK',
    today: 'Today',
    yesterday: 'Yesterday',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds'
  },
  as: 'div',
  classPrefix: 'picker'
};

const DatePicker: RsRefForwardingComponent<'div', DatePickerProps> = React.forwardRef(
  (props: DatePickerProps, ref) => {
    const {
      as: Component,
      className,
      classPrefix,
      calendarDefaultDate,
      cleanable,
      defaultValue,
      disabled,
      disabledDate: disabledDateProp,
      format = 'yyyy-MM-dd',
      inline,
      isoWeek,
      limitEndYear,
      locale: overrideLocale,
      menuClassName,
      onChange,
      onChangeCalendarDate,
      onClean,
      onClose,
      onEntered,
      onExited,
      onNextMonth,
      onOk,
      onOpen,
      onPrevMonth,
      onSelect,
      onToggleMonthDropdown,
      onToggleTimeDropdown,
      oneTap,
      panelContainerRef,
      placeholder,
      ranges,
      renderValue,
      showMeridian,
      showWeekNumbers,
      style,
      timeZone,
      toggleAs,
      value: valueProp,
      ...rest
    } = props;
    const { locale } = useCustom<DatePickerLocale>('DatePicker', overrideLocale);
    const { merge, prefix, withClassPrefix } = useClassNames(classPrefix);
    const activeValue = valueProp ?? defaultValue;
    const [localZoneValue, setLocalZoneValue] = useState(activeValue);
    const [value, updateValue] = useState(toTimeZone(activeValue, timeZone));
    const [pageDate, setPageDate] = useState(
      toTimeZone(activeValue ?? calendarDefaultDate ?? new Date(), timeZone)
    );
    const [calendarState, setCalendarState] = useState<CalendarState>();
    const [active, setActive] = useState<boolean>(false);
    const triggerRef = useRef<{ show?: () => void; hide?: () => void }>();
    const setValue = useCallback(
      nextValue => {
        if (!isEqual(value, nextValue)) {
          setLocalZoneValue(toLocalTimeZone(nextValue, timeZone));
          updateValue(nextValue);
        }
      },
      [timeZone, value]
    );

    useEffect(() => {
      const nextLocalZoneValue = valueProp ?? localZoneValue;
      const nextValue = toTimeZone(nextLocalZoneValue, timeZone);

      setValue(nextValue);
      setPageDate(nextValue ?? zonedDate(timeZone));
    }, [timeZone, valueProp, localZoneValue, setValue]);

    const getLocalPageDate = useCallback((date = pageDate) => toLocalTimeZone(date, timeZone), [
      pageDate,
      timeZone
    ]);

    const handleMoveForward = useCallback(
      (nextPageDate: Date) => {
        setPageDate(nextPageDate);

        nextPageDate = getLocalPageDate(nextPageDate);
        onNextMonth?.(nextPageDate);
        onChangeCalendarDate?.(nextPageDate);
      },
      [getLocalPageDate, onChangeCalendarDate, onNextMonth]
    );

    const handleMoveBackward = useCallback(
      (nextPageDate: Date) => {
        setPageDate(nextPageDate);

        nextPageDate = getLocalPageDate(nextPageDate);
        onPrevMonth?.(nextPageDate);
        onChangeCalendarDate?.(nextPageDate);
      },
      [getLocalPageDate, onChangeCalendarDate, onPrevMonth]
    );

    const getDateString = useCallback(() => {
      if (!value) {
        return placeholder || format;
      }

      return renderValue?.(value, format) ?? <FormattedDate date={value} formatStr={format} />;
    }, [format, placeholder, renderValue, value]);

    const handleAllSelect = useCallback(
      (nextValue: Date, event?: React.SyntheticEvent<any>) => {
        nextValue = toLocalTimeZone(nextValue, timeZone);
        onSelect?.(nextValue, event);
        onChangeCalendarDate?.(nextValue, event);
      },
      [onChangeCalendarDate, onSelect, timeZone]
    );

    const handleChangePageDate = useCallback(
      (nextPageDate: Date) => {
        setPageDate(nextPageDate);
        setCalendarState(undefined);
        handleAllSelect(nextPageDate);
      },
      [handleAllSelect]
    );

    const handleChangePageTime = useCallback(
      (nextPageTime: Date) => {
        setPageDate(nextPageTime);
        handleAllSelect(nextPageTime);
      },
      [handleAllSelect]
    );

    const handleCloseDropdown = useCallback(() => {
      triggerRef.current?.hide?.();
    }, []);

    const handleToggleMeridian = useCallback(() => {
      const hours = getHours(pageDate);
      const nextHours = hours >= 12 ? hours - 12 : hours + 12;
      const nextDate = setHours(pageDate, nextHours);
      setPageDate(nextDate);
    }, [pageDate]);

    const handleValueUpdate = useCallback(
      (event: React.SyntheticEvent<any>, nextPageDate?: Date | null, closeOverlay = true) => {
        const nextValue: Date = typeof nextPageDate !== 'undefined' ? nextPageDate : pageDate;

        setPageDate(nextValue || new Date());
        setValue(nextValue);

        if (nextValue !== value || !isSameDay(nextValue, value)) {
          onChange?.(getLocalPageDate(nextValue), event);
        }

        // `closeOverlay` default value is `true`
        if (closeOverlay !== false) {
          handleCloseDropdown();
        }
      },
      [getLocalPageDate, handleCloseDropdown, onChange, pageDate, setValue, value]
    );

    const handleShortcutPageDate = useCallback(
      (value: Date, closeOverlay?: boolean, event?: React.SyntheticEvent<any>) => {
        handleValueUpdate(event, value, closeOverlay);
        handleAllSelect(value, event);
      },
      [handleAllSelect, handleValueUpdate]
    );

    const handleOK = useCallback(
      (event: React.SyntheticEvent<any>) => {
        handleValueUpdate(event);
        onOk?.(getLocalPageDate(), event);
      },
      [getLocalPageDate, handleValueUpdate, onOk]
    );

    const showMonthDropdown = () => {
      setCalendarState(CalendarState.DROP_MONTH);
    };

    const showTimeDropdown = () => {
      setCalendarState(CalendarState.DROP_TIME);
    };

    const hideDropdown = () => {
      setCalendarState(undefined);
    };

    const toggleMonthDropdown = useCallback(() => {
      let toggle;

      if (calendarState === CalendarState.DROP_MONTH) {
        hideDropdown();
        toggle = false;
      } else {
        showMonthDropdown();
        toggle = true;
      }
      onToggleMonthDropdown?.(toggle);
    }, [calendarState, onToggleMonthDropdown]);

    const toggleTimeDropdown = useCallback(() => {
      let toggle;

      if (calendarState === CalendarState.DROP_TIME) {
        hideDropdown();
        toggle = false;
      } else {
        showTimeDropdown();
        toggle = true;
      }

      onToggleTimeDropdown?.(toggle);
    }, [calendarState, onToggleTimeDropdown]);

    const handleClean = useCallback(
      (event: React.SyntheticEvent<any>) => {
        setPageDate(toTimeZone(new Date(), timeZone));
        handleValueUpdate(event, null);
      },
      [handleValueUpdate, timeZone]
    );

    const handleSelect = useCallback(
      (nextValue: Date, event: React.SyntheticEvent<any>) => {
        setPageDate(
          composeFunctions(
            (d: Date) => setHours(d, getHours(pageDate)),
            (d: Date) => setMinutes(d, getMinutes(pageDate)),
            (d: Date) => setSeconds(d, getSeconds(pageDate))
          )(nextValue)
        );

        handleAllSelect(nextValue);
        oneTap && handleValueUpdate(event, nextValue);
      },
      [handleAllSelect, handleValueUpdate, oneTap, pageDate]
    );

    const handleEntered = useCallback(() => {
      onOpen?.();
      setActive(true);
    }, [onOpen]);

    const handleExit = useCallback(() => {
      onClose?.();
      setCalendarState(undefined);
      setActive(false);
    }, [onClose]);

    const disabledDate = useCallback(
      (date?: Date) => disabledDateProp?.(toLocalTimeZone(date, timeZone)),
      [disabledDateProp, timeZone]
    );

    const disabledToolbarHandle = useCallback(
      (date?: Date): boolean => {
        const localTimeZoneDate = toLocalTimeZone(date, timeZone);
        const allowDate = disabledDateProp?.(localTimeZoneDate) ?? false;
        const allowTime = disabledTime(props, localTimeZoneDate);

        return allowDate || allowTime;
      },
      [disabledDateProp, props, timeZone]
    );

    const calendarProps = useMemo(
      () =>
        mapValues(
          pick<DatePickerProps, CalendarOnlyPropsType>(props, calendarOnlyProps),
          disabledOrHiddenTimeFunc => (next: number, date: Date): boolean =>
            disabledOrHiddenTimeFunc(next, toLocalTimeZone(date, timeZone))
        ),
      [props, timeZone]
    );
    const renderCalendar = useCallback(
      () => (
        <Calendar
          {...calendarProps}
          locale={locale}
          showWeekNumbers={showWeekNumbers}
          showMeridian={showMeridian}
          disabledDate={disabledDate}
          limitEndYear={limitEndYear}
          format={format}
          timeZone={timeZone}
          isoWeek={isoWeek}
          calendarState={calendarState}
          pageDate={pageDate}
          onMoveForward={handleMoveForward}
          onMoveBackward={handleMoveBackward}
          onSelect={handleSelect}
          onToggleMonthDropdown={toggleMonthDropdown}
          onToggleTimeDropdown={toggleTimeDropdown}
          onChangePageDate={handleChangePageDate}
          onChangePageTime={handleChangePageTime}
          onToggleMeridian={handleToggleMeridian}
        />
      ),
      [
        calendarProps,
        calendarState,
        disabledDate,
        format,
        handleChangePageDate,
        handleChangePageTime,
        handleMoveBackward,
        handleMoveForward,
        handleSelect,
        handleToggleMeridian,
        isoWeek,
        limitEndYear,
        locale,
        pageDate,
        showMeridian,
        showWeekNumbers,
        timeZone,
        toggleMonthDropdown,
        toggleTimeDropdown
      ]
    );

    const renderDropdownMenu = useCallback(
      (calendar: React.ReactNode) => {
        const classes = merge(menuClassName, prefix('date-menu'));

        return (
          <MenuWrapper className={classes}>
            <div ref={panelContainerRef}>
              {calendar}
              <Toolbar
                timeZone={timeZone}
                ranges={ranges}
                pageDate={pageDate}
                disabledOkBtn={disabledToolbarHandle}
                disabledShortcut={disabledToolbarHandle}
                onShortcut={handleShortcutPageDate}
                onOk={handleOK}
                hideOkButton={oneTap}
              />
            </div>
          </MenuWrapper>
        );
      },
      [
        disabledToolbarHandle,
        handleOK,
        handleShortcutPageDate,
        menuClassName,
        merge,
        oneTap,
        pageDate,
        panelContainerRef,
        prefix,
        ranges,
        timeZone
      ]
    );

    const hasValue = !!value;
    const calendar = useMemo(() => renderCalendar(), [renderCalendar]);

    if (inline) {
      return (
        <Component ref={ref} className={merge(className, withClassPrefix('date-inline'))}>
          {calendar}
        </Component>
      );
    }

    const classes = getToggleWrapperClassName('date', prefix, props, hasValue, {
      [prefix('date-only-time')]: shouldOnlyTime(format)
    });

    return (
      <Component className={classes} style={style} ref={ref}>
        <PickerToggleTrigger
          pickerProps={props}
          ref={triggerRef}
          onEntered={createChainedFunction(handleEntered, onEntered)}
          onExited={createChainedFunction(handleExit, onExited)}
          speaker={renderDropdownMenu(calendar)}
        >
          <PickerToggle
            {...omitBy(rest, (_value, key) => key.startsWith('hide') || key.startsWith('disabled'))}
            as={toggleAs}
            onClean={createChainedFunction<(event: React.MouseEvent<any>) => void>(
              handleClean,
              onClean
            )}
            cleanable={cleanable && !disabled}
            hasValue={hasValue}
            active={active}
          >
            {getDateString()}
          </PickerToggle>
        </PickerToggleTrigger>
      </Component>
    );
  }
);

DatePicker.displayName = 'DatePicker';
DatePicker.propTypes = {
  ...pickerPropTypes,
  calendarDefaultDate: PropTypes.instanceOf(Date),
  defaultValue: PropTypes.instanceOf(Date),
  disabledDate: PropTypes.func,
  disabledHours: PropTypes.func,
  disabledMinutes: PropTypes.func,
  disabledSeconds: PropTypes.func,
  format: PropTypes.string,
  hideHours: PropTypes.func,
  hideMinutes: PropTypes.func,
  hideSeconds: PropTypes.func,
  inline: PropTypes.bool,
  isoWeek: PropTypes.bool,
  limitEndYear: PropTypes.number,
  onChange: PropTypes.func,
  onChangeCalendarDate: PropTypes.func,
  onNextMonth: PropTypes.func,
  onOk: PropTypes.func,
  onPrevMonth: PropTypes.func,
  onSelect: PropTypes.func,
  onToggleMonthDropdown: PropTypes.func,
  onToggleTimeDropdown: PropTypes.func,
  oneTap: PropTypes.bool,
  panelContainerRef: PropTypes.any,
  ranges: PropTypes.array,
  showMeridian: PropTypes.bool,
  showWeekNumbers: PropTypes.bool,
  timeZone: PropTypes.string,
  value: PropTypes.instanceOf(Date)
};
DatePicker.defaultProps = defaultProps;

export default DatePicker;
