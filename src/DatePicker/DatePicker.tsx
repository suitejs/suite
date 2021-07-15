import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import IconCalendar from '@rsuite/icons/legacy/Calendar';
import IconClockO from '@rsuite/icons/legacy/ClockO';
import { Calendar, CalendarState } from '../Calendar';
import useCalendarDate from '../Calendar/useCalendarDate';
import Toolbar, { RangeType } from './Toolbar';
import { DatePickerLocale } from '../locales';
import {
  composeFunctions,
  createChainedFunction,
  DateUtils,
  mergeRefs,
  useClassNames,
  useControlled,
  useCustom
} from '../utils';

import {
  PickerOverlay,
  OverlayTriggerInstance,
  pickerDefaultProps,
  pickerPropTypes,
  PickerToggle,
  PickerToggleTrigger,
  pickTriggerPropKeys,
  omitTriggerPropKeys,
  PositionChildProps,
  usePickerClassName,
  usePublicMethods,
  useToggleKeyDownEvent
} from '../Picker';

import { FormControlBaseProps, PickerBaseProps, RsRefForwardingComponent } from '../@types/common';

import { useCalendarState } from './utils';

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

  /** one tap to select */
  oneTap?: boolean;

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
  onClean?: (event: React.MouseEvent) => void;

  /** Custom render value */
  renderValue?: (value: Date, format: string) => string;
}

const defaultProps: Partial<DatePickerProps> = {
  ...pickerDefaultProps,
  as: 'div',
  classPrefix: 'picker',
  format: 'yyyy-MM-dd',
  limitEndYear: 1000,
  placeholder: ''
};

type InputState = 'Typing' | 'Error' | 'Initial';

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
      format: formatStr,
      inline,
      isoWeek,
      limitEndYear,
      locale: overrideLocale,
      menuClassName,
      placement,
      oneTap,
      placeholder,
      ranges,
      value: valueProp,
      showMeridian,
      showWeekNumbers,
      style,
      toggleAs,
      disabledDate: disabledDateProp,
      renderValue,
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
      ...rest
    } = props;

    const { locale, formatDate, parseDate } = useCustom<DatePickerLocale>(
      'DatePicker',
      overrideLocale
    );
    const { merge, prefix, withClassPrefix } = useClassNames(classPrefix);

    const [value, setValue] = useControlled<Date>(valueProp, defaultValue);
    const { calendarDate, setCalendarDate } = useCalendarDate(valueProp, calendarDefaultDate);
    const [inputState, setInputState] = useState<InputState>();
    const { calendarState, reset, openMonth, openTime } = useCalendarState();
    const [active, setActive] = useState<boolean>(false);
    const triggerRef = useRef<OverlayTriggerInstance>();
    const rootRef = useRef<HTMLDivElement>();
    const targetRef = useRef<HTMLButtonElement>();
    const overlayRef = useRef<HTMLDivElement>();

    usePublicMethods(ref, { rootRef, triggerRef, overlayRef, targetRef });

    /**
     * Switch to the callback triggered after the next month.
     */
    const handleMoveForward = useCallback(
      (nextPageDate: Date) => {
        setCalendarDate(nextPageDate);

        onNextMonth?.(nextPageDate);
        onChangeCalendarDate?.(nextPageDate);
      },
      [onChangeCalendarDate, onNextMonth, setCalendarDate]
    );

    /**
     * Switch to the callback triggered after the previous month.
     */
    const handleMoveBackward = useCallback(
      (nextPageDate: Date) => {
        setCalendarDate(nextPageDate);

        onPrevMonth?.(nextPageDate);
        onChangeCalendarDate?.(nextPageDate);
      },
      [onChangeCalendarDate, onPrevMonth, setCalendarDate]
    );

    /**
     * The callback triggered when the date changes.
     */
    const handleDateChange = useCallback(
      (nextValue: Date, event?: React.SyntheticEvent<any>) => {
        onSelect?.(nextValue, event);
        onChangeCalendarDate?.(nextValue, event);
      },
      [onChangeCalendarDate, onSelect]
    );

    /**
     *  A callback triggered when the date on the calendar changes.
     */
    const handleChangePageDate = useCallback(
      (nextPageDate: Date) => {
        setCalendarDate(nextPageDate);
        reset();
        handleDateChange(nextPageDate);
      },
      [handleDateChange, reset, setCalendarDate]
    );

    /**
     *  A callback triggered when the time on the calendar changes.
     */
    const handleChangePageTime = useCallback(
      (nextPageTime: Date) => {
        setCalendarDate(nextPageTime);
        handleDateChange(nextPageTime);
      },
      [handleDateChange, setCalendarDate]
    );

    const handleClose = useCallback(() => {
      triggerRef.current?.close?.();
    }, []);

    /**
     * The callback triggered when PM/AM is switched.
     */
    const handleToggleMeridian = useCallback(() => {
      const hours = DateUtils.getHours(calendarDate);
      const nextHours = hours >= 12 ? hours - 12 : hours + 12;
      const nextDate = DateUtils.setHours(calendarDate, nextHours);
      setCalendarDate(nextDate);
    }, [calendarDate, setCalendarDate]);

    const updateValue = useCallback(
      (event: React.SyntheticEvent<any>, nextPageDate?: Date | null, closeOverlay = true) => {
        const nextValue: Date = typeof nextPageDate !== 'undefined' ? nextPageDate : calendarDate;

        setCalendarDate(nextValue || new Date());
        setValue(nextValue);

        if (nextValue !== value || !DateUtils.isSameDay(nextValue, value)) {
          onChange?.(nextValue, event);
        }

        // `closeOverlay` default value is `true`
        if (closeOverlay !== false) {
          handleClose();
        }
      },
      [handleClose, onChange, calendarDate, setCalendarDate, setValue, value]
    );

    /**
     * The callback triggered after the date in the shortcut area is clicked.
     */
    const handleShortcutPageDate = useCallback(
      (value: Date, closeOverlay?: boolean, event?: React.SyntheticEvent<any>) => {
        updateValue(event, value, closeOverlay);
        handleDateChange(value, event);
      },
      [handleDateChange, updateValue]
    );

    /**
     * The callback triggered after clicking the OK button.
     */
    const handleOK = useCallback(
      (event: React.SyntheticEvent<any>) => {
        updateValue(event);
        onOk?.(calendarDate, event);
      },
      [updateValue, onOk, calendarDate]
    );

    /**
     * Toggle month selection panel
     */
    const handleMonthDropdown = useCallback(() => {
      if (calendarState === CalendarState.DROP_MONTH) {
        reset();
      } else {
        openMonth();
      }

      onToggleMonthDropdown?.(calendarState !== CalendarState.DROP_MONTH);
    }, [calendarState, onToggleMonthDropdown, openMonth, reset]);

    /**
     * Switch time selection panel
     */
    const handleTimeDropdown = useCallback(() => {
      if (calendarState === CalendarState.DROP_TIME) {
        reset();
      } else {
        openTime();
      }

      onToggleTimeDropdown?.(calendarState !== CalendarState.DROP_TIME);
    }, [calendarState, onToggleTimeDropdown, openTime, reset]);

    /**
     * Callback after clicking the clear button.
     */
    const handleClean = useCallback(
      (event: React.SyntheticEvent) => {
        setCalendarDate(new Date());
        updateValue(event, null);
      },
      [setCalendarDate, updateValue]
    );

    /**
     * Handle keyboard events.
     */
    const onPickerKeyDown = useToggleKeyDownEvent({
      triggerRef,
      targetRef,
      active,
      onExit: handleClean,
      ...rest
    });

    /**
     * Callback after the date is selected.
     */
    const handleSelect = useCallback(
      (nextValue: Date, event: React.SyntheticEvent, updatableValue = true) => {
        setCalendarDate(
          // Determine whether the current value contains time, if not, use calendarDate.
          DateUtils.shouldTime(formatStr)
            ? nextValue
            : composeFunctions(
                (d: Date) => DateUtils.setHours(d, DateUtils.getHours(calendarDate)),
                (d: Date) => DateUtils.setMinutes(d, DateUtils.getMinutes(calendarDate)),
                (d: Date) => DateUtils.setSeconds(d, DateUtils.getSeconds(calendarDate))
              )(nextValue)
        );

        handleDateChange(nextValue);
        if (oneTap && updatableValue) {
          updateValue(event, nextValue);
        }
      },
      [formatStr, handleDateChange, oneTap, calendarDate, setCalendarDate, updateValue]
    );

    const disabledDate = useCallback((date?: Date) => disabledDateProp?.(date), [disabledDateProp]);

    /**
     * Callback after the input box value is changed.
     */
    const handleInputChange = useCallback(
      (value, event) => {
        setInputState('Typing');

        // isMatch('01/11/2020', 'MM/dd/yyyy') ==> true
        // isMatch('2020-11-01', 'MM/dd/yyyy') ==> false
        if (!DateUtils.isMatch(value, formatStr, { locale: locale.dateLocale })) {
          setInputState('Error');

          return;
        }

        let date = parseDate(value, formatStr);

        // If only the time is included in the characters, it will default to today.
        if (DateUtils.shouldOnlyTime(formatStr)) {
          date = new Date(`${DateUtils.format(new Date(), 'yyyy-MM-dd')} ${value}`);
        }

        if (!DateUtils.isValid(date)) {
          setInputState('Error');
          return;
        }

        if (disabledDate(date)) {
          setInputState('Error');
          return;
        }

        handleSelect(date, event, false);
      },
      [formatStr, locale, parseDate, disabledDate, handleSelect]
    );

    /**
     * The callback after the enter key is triggered on the input
     */
    const handleInputBlur = useCallback(
      event => {
        if (inputState === 'Typing') {
          updateValue(event, calendarDate);
        }
        setInputState('Initial');
      },
      [inputState, calendarDate, updateValue]
    );

    const handleEntered = useCallback(() => {
      onOpen?.();
      setActive(true);
    }, [onOpen]);

    const handleExited = useCallback(() => {
      onClose?.();
      reset();
      setActive(false);
    }, [onClose, reset]);

    // Check whether the time is within the time range of the shortcut option in the toolbar.
    const disabledToolbarHandle = useCallback(
      (date?: Date): boolean => {
        const allowDate = disabledDateProp?.(date) ?? false;
        const allowTime = DateUtils.disabledTime(props, date);

        return allowDate || allowTime;
      },
      [disabledDateProp, props]
    );

    const calendarProps = useMemo(
      () =>
        mapValues(
          pick<DatePickerProps, DateUtils.CalendarOnlyPropsType>(
            props,
            DateUtils.calendarOnlyProps
          ),
          disabledOrHiddenTimeFunc => (next: number, date: Date): boolean =>
            disabledOrHiddenTimeFunc(next, date)
        ),
      [props]
    );

    const inSameMonth = useCallback((date: Date) => DateUtils.isSameMonth(date, calendarDate), [
      calendarDate
    ]);

    const calendar = (
      <Calendar
        {...calendarProps}
        locale={locale}
        showWeekNumbers={showWeekNumbers}
        showMeridian={showMeridian}
        disabledDate={disabledDate}
        limitEndYear={limitEndYear}
        format={formatStr}
        isoWeek={isoWeek}
        inSameMonth={inSameMonth}
        calendarState={calendarState}
        calendarDate={calendarDate}
        onMoveForward={handleMoveForward}
        onMoveBackward={handleMoveBackward}
        onSelect={handleSelect}
        onToggleMonthDropdown={handleMonthDropdown}
        onToggleTimeDropdown={handleTimeDropdown}
        onChangePageDate={handleChangePageDate}
        onChangePageTime={handleChangePageTime}
        onToggleMeridian={handleToggleMeridian}
      />
    );

    const renderDropdownMenu = (positionProps: PositionChildProps, speakerRef) => {
      const { left, top, className } = positionProps;
      const classes = merge(menuClassName, className, prefix('date-menu'));
      const styles = { left, top };
      return (
        <PickerOverlay
          className={classes}
          ref={mergeRefs(overlayRef, speakerRef)}
          style={styles}
          target={triggerRef}
        >
          {calendar}
          <Toolbar
            locale={locale}
            ranges={ranges}
            calendarDate={calendarDate}
            disabledOkBtn={disabledToolbarHandle}
            disabledShortcut={disabledToolbarHandle}
            onClickShortcut={handleShortcutPageDate}
            onOk={handleOK}
            hideOkBtn={oneTap}
          />
        </PickerOverlay>
      );
    };

    const hasValue = !!value;

    const [classes, usedClassNamePropKeys] = usePickerClassName({
      ...props,
      name: 'date',
      hasValue
    });

    const renderDate = useCallback(() => {
      if (!value) {
        return placeholder || formatStr;
      }

      return renderValue?.(value, formatStr) ?? formatDate(value, formatStr);
    }, [formatStr, formatDate, placeholder, renderValue, value]);

    const caretComponent = useMemo(
      () => (DateUtils.shouldOnlyTime(formatStr) ? IconClockO : IconCalendar),
      [formatStr]
    );

    if (inline) {
      return (
        <Component ref={rootRef} className={merge(className, withClassPrefix('date-inline'))}>
          {calendar}
        </Component>
      );
    }

    return (
      <PickerToggleTrigger
        trigger="active"
        pickerProps={pick(props, pickTriggerPropKeys)}
        ref={triggerRef}
        placement={placement}
        onEntered={createChainedFunction(handleEntered, onEntered)}
        onExited={createChainedFunction(handleExited, onExited)}
        speaker={renderDropdownMenu}
      >
        <Component className={merge(className, classes)} style={style} ref={rootRef}>
          <PickerToggle
            {...omit(rest, [
              ...omitTriggerPropKeys,
              ...usedClassNamePropKeys,
              ...DateUtils.calendarOnlyProps
            ])}
            className={prefix({ error: inputState === 'Error' })}
            as={toggleAs}
            ref={targetRef}
            input
            inputValue={value ? formatDate(value, formatStr) : ''}
            inputPlaceholder={
              typeof placeholder === 'string' && placeholder ? placeholder : formatStr
            }
            inputMask={DateUtils.getDateMask(formatStr)}
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            onKeyDown={onPickerKeyDown}
            onClean={createChainedFunction(handleClean, onClean)}
            cleanable={cleanable && !disabled}
            hasValue={hasValue}
            active={active}
            placement={placement}
            disabled={disabled}
            caretComponent={caretComponent}
          >
            {renderDate()}
          </PickerToggle>
        </Component>
      </PickerToggleTrigger>
    );
  }
);

DatePicker.displayName = 'DatePicker';
DatePicker.defaultProps = defaultProps;
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
  value: PropTypes.instanceOf(Date)
};

export default DatePicker;
