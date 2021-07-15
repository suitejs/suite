import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import isUndefined from 'lodash/isUndefined';
import { addMonths, compareAsc, isSameDay, isSameMonth } from '../utils/dateUtils';
import * as disabledDateUtils from './disabledDateUtils';
import { FormattedDate } from '../CustomProvider';
import Toolbar from '../DatePicker/Toolbar';
import Panel from './Panel';
import { getCalendarDate, getMonthHoverRange, getWeekHoverRange, setTimingMargin } from './utils';
import {
  createChainedFunction,
  DATERANGE_DISABLED_TARGET,
  DateUtils,
  mergeRefs,
  useClassNames,
  useControlled,
  useCustom
} from '../utils';
import {
  PickerOverlay,
  OverlayTriggerInstance,
  PickerComponent,
  pickerDefaultProps,
  pickerPropTypes,
  usePublicMethods,
  useToggleKeyDownEvent,
  PickerToggle,
  PickerToggleTrigger,
  pickTriggerPropKeys,
  omitTriggerPropKeys,
  PositionChildProps,
  usePickerClassName
} from '../Picker';
import { FormControlBaseProps, PickerBaseProps } from '../@types/common';
import { DisabledDateFunction, RangeType, ValueType } from './types';
import partial from 'lodash/partial';
import useUpdateEffect from '../utils/useUpdateEffect';
import { DateRangePickerLocale } from '../locales';
import IconCalendar from '@rsuite/icons/legacy/Calendar';

type InputState = 'Typing' | 'Error' | 'Initial';

export interface DateRangePickerProps extends PickerBaseProps, FormControlBaseProps<ValueType> {
  /** Configure shortcut options */
  ranges?: RangeType[];

  /** Format date */
  format?: string;

  /** The date range that will be selected when you click on the date */
  hoverRange?: 'week' | 'month' | ((date: Date) => ValueType);

  /** Whether to click once on selected date range，Can be used with hoverRange */
  oneTap?: boolean;

  /** ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day */
  isoWeek?: boolean;

  /** Set the lower limit of the available year relative to the current selection date */
  limitEndYear?: number;

  /** Whether to show week numbers */
  showWeekNumbers?: boolean;

  /** Show only one calendar select */
  showOneCalendar?: boolean;

  /** Set default date for calendar */
  defaultCalendarValue?: ValueType;

  /** The character that separates two dates */
  character?: string;

  /** Disabled date */
  disabledDate?: DisabledDateFunction;

  /** Called when the option is selected */
  onSelect?: (date: Date, event?: React.SyntheticEvent<HTMLElement>) => void;

  /** Called after clicking the OK button */
  onOk?: (date: ValueType, event: React.SyntheticEvent<HTMLElement>) => void;

  /** Called when clean */
  onClean?: (event: React.MouseEvent) => void;

  /** Custom render value */
  renderValue?: (value: ValueType, format: string) => React.ReactNode;
}

export interface DateRangePicker extends PickerComponent<DateRangePickerProps> {
  /** Allow the maximum number of days specified, other dates are disabled */
  allowedMaxDays?: (days: number) => DisabledDateFunction;

  /** Only allowed days are specified, other dates are disabled */
  allowedDays?: (days: number) => DisabledDateFunction;

  /** Allow specified date range, other dates are disabled */
  allowedRange?: (startDate: string | Date, endDate: string | Date) => DisabledDateFunction;

  /** Disable dates after the specified date */
  before?: (beforeDate: string | Date) => DisabledDateFunction;

  /** Disable dates before the specified date */
  after?: (afterDate: string | Date) => DisabledDateFunction;

  /** Disable dates after today. */
  beforeToday?: () => DisabledDateFunction;

  /** Disable dates before today */
  afterToday?: () => DisabledDateFunction;

  /** Used to combine multiple conditions */
  combine?: (...args: any) => DisabledDateFunction;
}

const defaultProps: Partial<DateRangePickerProps> = {
  ...pickerDefaultProps,
  as: 'div',
  classPrefix: 'picker',
  cleanable: true,
  placement: 'bottomStart',
  appearance: 'default',
  format: 'yyyy-MM-dd',
  limitEndYear: 1000,
  placeholder: '',
  showOneCalendar: false,
  character: ' ~ '
};

const DateRangePicker: DateRangePicker = React.forwardRef((props: DateRangePickerProps, ref) => {
  const {
    as: Component,
    classPrefix,
    className,
    cleanable,
    character,
    defaultCalendarValue,
    defaultValue,
    disabled,
    disabledDate: disabledDateProp,
    format: formatStr,
    hoverRange,
    isoWeek,
    limitEndYear,
    locale: overrideLocale,
    menuClassName,
    menuStyle,
    oneTap,
    placeholder,
    placement,
    ranges,
    renderValue,
    showOneCalendar,
    showWeekNumbers,
    style,

    toggleAs,
    value: valueProp,
    onChange,
    onClean,
    onClose,
    onEnter,
    onEntered,
    onExited,
    onOk,
    onOpen,
    onSelect,
    ...rest
  } = props;
  const { merge, prefix } = useClassNames(classPrefix);
  const { locale, formatDate } = useCustom<DateRangePickerLocale>(
    'DateRangePicker',
    overrideLocale
  );
  const rangeFormatStr = `${formatStr}${character}${formatStr}`;

  const [value, setValue] = useControlled<ValueType>(valueProp, defaultValue ?? []);

  /**
   * Whether to complete the selection.
   * Everytime selection will change this value. If the value is false, it means that the selection has not been completed.
   *
   * In `oneTap` mode, select action will not change this value, its value should be true always.
   */
  const hasDoneSelect = useRef(true);

  /**
   * The currently selected date range.
   *
   * The time range is selected by two clicks. After the first click,
   * the cursor will store a temporary event date in the process until
   * the second click to determine the end date of the date range.
   *
   */
  const [selectValue, setSelectValue] = useState<ValueType>(valueProp ?? defaultValue ?? []);

  // The date of the current hover, used to reduce the calculation of `handleMouseMove`
  const [hoverValue, setHoverValue] = useState<ValueType>([]);

  // The displayed calendar panel is rendered based on this value.
  const [calendarDate, setCalendarDate] = useState(
    getCalendarDate({
      value: valueProp ?? defaultCalendarValue
    })
  );

  const [inputState, setInputState] = useState<InputState>();

  /**
   * Call this function to update the calendar panel rendering benchmark value.
   *
   * If params `value` is not passed, it defaults to [new Date(), addMonth(new Date(), 1)].
   */
  const updateCalendarDate = useCallback((value?: ValueType) => {
    setCalendarDate(getCalendarDate({ value }));
  }, []);

  // if valueProp changed then update selectValue/hoverValue
  useEffect(() => {
    setSelectValue(valueProp ?? []);
    setHoverValue(valueProp ?? []);
  }, [valueProp]);

  // if selectValue changed then update calendarDate/localZonedSelectValue
  useUpdateEffect(() => {
    updateCalendarDate(selectValue);
  }, [selectValue, updateCalendarDate]);

  const [isPickerToggleActive, setPickerToggleActive] = useState(false);

  const rootRef = useRef<HTMLDivElement>();
  const overlayRef = useRef<HTMLDivElement>();
  const targetRef = useRef<HTMLButtonElement>();
  const triggerRef = useRef<OverlayTriggerInstance>();

  const handleCloseDropdown = useCallback(() => {
    triggerRef.current?.close?.();
  }, []);

  usePublicMethods(ref, {
    triggerRef,
    overlayRef,
    targetRef,
    rootRef
  });

  const getDisplayString = useCallback(
    (nextValue: ValueType = value, isPlaintext?: boolean) => {
      const startDate: Date = nextValue?.[0];
      const endDate: Date = nextValue?.[1];

      if (startDate && endDate) {
        const displayValue: any = [startDate, endDate].sort(compareAsc);

        if (isPlaintext) {
          return (
            formatDate(displayValue[0], formatStr) +
            character +
            formatDate(displayValue[1], formatStr)
          );
        }

        return renderValue ? (
          renderValue(displayValue, formatStr)
        ) : (
          <>
            <FormattedDate date={displayValue[0]} formatStr={formatStr} />
            {character}
            <FormattedDate date={displayValue[1]} formatStr={formatStr} />
          </>
        );
      }

      return isPlaintext ? '' : placeholder || rangeFormatStr;
    },
    [character, formatDate, formatStr, placeholder, rangeFormatStr, renderValue, value]
  );

  /**
   * preset hover range
   */
  const getHoverRange = useCallback(
    (date: Date): ValueType => {
      if (!hoverRange) {
        return [];
      }

      let hoverRangeFunc = hoverRange;
      if (hoverRange === 'week') {
        hoverRangeFunc = partial(getWeekHoverRange, isoWeek);
      }

      if (hoverRangeFunc === 'month') {
        hoverRangeFunc = getMonthHoverRange;
      }

      if (typeof hoverRangeFunc !== 'function') {
        return [];
      }

      const hoverValues: ValueType = hoverRangeFunc(date);
      const isHoverRangeValid = hoverValues instanceof Array && hoverValues.length === 2;
      if (!isHoverRangeValid) {
        return [];
      }
      if (DateUtils.isAfter(hoverValues[0], hoverValues[1])) {
        hoverValues.reverse();
      }
      return hoverValues;
    },
    [hoverRange, isoWeek]
  );

  const handleValueUpdate = useCallback(
    (event: React.SyntheticEvent<any>, nextSelectValue?: ValueType, closeOverlay = true) => {
      const nextValue = !isUndefined(nextSelectValue) ? nextSelectValue : selectValue;

      setSelectValue(nextValue || []);
      if (!isSameDay(nextValue[0], value[0]) || !isSameDay(nextValue[1], value[1])) {
        setValue(nextValue);
        onChange?.(nextValue, event);
      }

      // `closeOverlay` default value is `true`
      if (closeOverlay !== false) {
        handleCloseDropdown();
      }
    },
    [handleCloseDropdown, onChange, selectValue, setSelectValue, setValue, value]
  );

  const handleMouseMove = useCallback(
    (date: Date) => {
      const hoverRange = getHoverRange(date);
      if (!hasDoneSelect.current) {
        setHoverValue(prevHoverValue => {
          const nextHoverValue = Array.from(prevHoverValue) as ValueType;
          nextHoverValue[+!hasDoneSelect.current] = date;
          return nextHoverValue;
        });
      } else if (hoverRange.length) {
        setHoverValue(hoverRange);
      }
    },
    [getHoverRange]
  );

  const handleSelectValueChange = useCallback(
    (date: Date, event: React.SyntheticEvent<any>) => {
      let nextSelectValue = Array.from(hoverValue) as ValueType;
      const hoverRange = getHoverRange(date);
      const noHoverRangeValid = hoverRange.length !== 2;

      // no preset hover range can use
      if (noHoverRangeValid) {
        // start select
        if (hasDoneSelect.current) {
          nextSelectValue = [date] as ValueType;
        } else {
          // finish select
          nextSelectValue[1] = date;
        }
      } else {
        // use preset hover range as select value
        nextSelectValue = hoverRange;
      }

      // in `oneTap` mode
      if (hasDoneSelect.current && oneTap) {
        handleValueUpdate(
          event,
          noHoverRangeValid ? [setTimingMargin(date), setTimingMargin(date, 'right')] : hoverRange
        );
        return;
      }

      // If user have completed the selection, then sort
      if (
        nextSelectValue.length === 2 &&
        DateUtils.isAfter(nextSelectValue[0], nextSelectValue[1])
      ) {
        nextSelectValue.reverse();
      }

      setHoverValue(nextSelectValue);
      setSelectValue(nextSelectValue);
      onSelect?.(date, event);
    },
    [getHoverRange, handleValueUpdate, hoverValue, onSelect, oneTap]
  );

  /**
   * If `selectValue` changed, there will be the following effects.
   * 1. Check if the selection is completed.
   * 2. if the selection is completed, set the temporary `hoverValue` empty.
   */
  useEffect(() => {
    const selectValueLength = selectValue?.length ?? 0;
    const doneSelected = selectValueLength === 0 || selectValueLength === 2;

    hasDoneSelect.current = doneSelected;
    doneSelected && setHoverValue([]);
  }, [selectValue]);

  const handleChangeCalendarDate = useCallback(
    (index: number, date: Date) => {
      const nextCalendarDate = Array.from(calendarDate);
      nextCalendarDate[index] = date;

      updateCalendarDate(nextCalendarDate as ValueType);
    },
    [calendarDate, updateCalendarDate]
  );

  /**
   * Toolbar operation callback function
   */
  const handleShortcutPageDate = useCallback(
    (value: ValueType, closeOverlay?: boolean, event?: React.SyntheticEvent<any>) => {
      handleValueUpdate(event, value, closeOverlay);
    },
    [handleValueUpdate]
  );

  const handleOK = useCallback(
    (event: React.SyntheticEvent<any>) => {
      handleValueUpdate(event);
      onOk?.(selectValue, event);
    },
    [handleValueUpdate, onOk, selectValue]
  );

  const handleClean = useCallback(
    (event: React.MouseEvent) => {
      updateCalendarDate();
      handleValueUpdate(event, []);
    },
    [handleValueUpdate, updateCalendarDate]
  );

  /**
   * Callback after the input box value is changed.
   */
  const handleInputChange = useCallback(
    (value: string) => {
      setInputState('Typing');

      const rangeValue = value.split(character);

      // isMatch('01/11/2020', 'MM/dd/yyyy') ==> true
      // isMatch('2020-11-01', 'MM/dd/yyyy') ==> false
      if (
        !DateUtils.isMatch(rangeValue[0], formatStr) ||
        !DateUtils.isMatch(rangeValue[1], formatStr)
      ) {
        setInputState('Error');
        return;
      }

      const startDate = new Date(rangeValue[0]);
      const endDate = new Date(rangeValue[1]);
      const selectValue = [startDate, endDate] as ValueType;

      if (!DateUtils.isValid(startDate) || !DateUtils.isValid(endDate)) {
        setInputState('Error');
        return;
      }

      if (disabledDate(startDate, selectValue, true, DATERANGE_DISABLED_TARGET.CALENDAR)) {
        setInputState('Error');
        return;
      }

      setHoverValue(selectValue);
      setSelectValue(selectValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character, rangeFormatStr]
  );

  /**
   * The callback after the enter key is triggered on the input
   */
  const handleInputBlur = useCallback(
    event => {
      if (inputState === 'Typing') {
        handleValueUpdate(event, selectValue);
      }
      setInputState('Initial');
    },
    [handleValueUpdate, selectValue, inputState]
  );

  const handleEnter = useCallback(() => {
    let nextCalendarDate;

    if (value && value.length) {
      const [startDate, endData] = value;
      nextCalendarDate = [
        startDate,
        isSameMonth(startDate, endData) ? addMonths(endData, 1) : endData
      ];
    } else {
      nextCalendarDate = getCalendarDate({
        value: defaultCalendarValue
      });
    }

    setSelectValue(value);
    updateCalendarDate(nextCalendarDate);
  }, [defaultCalendarValue, updateCalendarDate, setSelectValue, value]);

  const handleEntered = useCallback(() => {
    onOpen?.();
    setPickerToggleActive(true);
  }, [onOpen]);

  const handleExited = useCallback(() => {
    setPickerToggleActive(false);
    hasDoneSelect.current = true;

    onClose?.();
  }, [onClose]);

  const disabledDate = useCallback(
    (
      date: Date,
      selectDate: ValueType,
      selectedDone: boolean,
      target: DATERANGE_DISABLED_TARGET
    ): boolean => {
      return disabledDateProp?.(date, selectDate, selectedDone, target);
    },
    [disabledDateProp]
  );

  const disabledByBetween = useCallback(
    (start: Date, end: Date, type: DATERANGE_DISABLED_TARGET) => {
      const [selectStartDate, selectEndDate] = selectValue;
      const nextSelectValue: ValueType = [selectStartDate, selectEndDate];

      // If the date is between the start and the end
      // the button is disabled
      while (DateUtils.isBefore(start, end) || DateUtils.isSameDay(start, end)) {
        if (disabledDate(start, nextSelectValue, hasDoneSelect.current, type)) {
          return true;
        }
        start = DateUtils.addDays(start, 1);
      }

      return false;
    },
    [disabledDate, selectValue]
  );

  const disabledOkButton = useCallback(() => {
    const [start, end] = selectValue;
    if (!start || !end || !hasDoneSelect.current) {
      return true;
    }

    return disabledByBetween(start, end, DATERANGE_DISABLED_TARGET.TOOLBAR_BUTTON_OK);
  }, [disabledByBetween, selectValue]);

  const disabledShortcutButton = useCallback(
    (value: ValueType = []) => {
      const [start, end] = value;

      if (!start || !end) {
        return true;
      }

      return disabledByBetween(start, end, DATERANGE_DISABLED_TARGET.TOOLBAR_SHORTCUT);
    },
    [disabledByBetween]
  );

  const handleDisabledDate = useCallback(
    (date: Date, values: ValueType, type: DATERANGE_DISABLED_TARGET) => {
      return !!disabledDate(date, values, hasDoneSelect.current, type);
    },
    [disabledDate]
  );

  const onPickerKeyDown = useToggleKeyDownEvent({
    triggerRef,
    targetRef,
    active: isPickerToggleActive,
    onExit: handleClean,
    ...rest
  });

  const renderDropdownMenu = useCallback(
    (positionProps: PositionChildProps, speakerRef) => {
      const { left, top, className } = positionProps;
      const classes = merge(className, menuClassName, prefix('daterange-menu'));
      const panelClasses = prefix('daterange-panel', {
        'daterange-panel-show-one-calendar': showOneCalendar
      });
      const styles = { ...menuStyle, left, top };

      const panelProps = {
        calendarDate,
        disabledDate: handleDisabledDate,
        format: formatStr,
        hoverRangeValue: hoverValue,
        isoWeek,
        limitEndYear,
        locale,
        showOneCalendar,
        showWeekNumbers,
        value: selectValue,
        onChangeCalendarDate: handleChangeCalendarDate,
        onMouseMove: handleMouseMove,
        onSelect: handleSelectValueChange
      };

      return (
        <PickerOverlay
          className={classes}
          ref={mergeRefs(overlayRef, speakerRef)}
          target={triggerRef}
          style={styles}
        >
          <div className={panelClasses}>
            <div className={prefix('daterange-content')}>
              <div className={prefix('daterange-header')}>{getDisplayString(selectValue)}</div>
              <div className={prefix(`daterange-calendar-${showOneCalendar ? 'single' : 'group'}`)}>
                <Panel index={0} {...panelProps} />
                {!showOneCalendar && <Panel index={1} {...panelProps} />}
              </div>
            </div>
            <Toolbar
              locale={locale}
              calendarDate={selectValue}
              disabledOkBtn={disabledOkButton}
              disabledShortcut={disabledShortcutButton}
              hideOkBtn={oneTap}
              onOk={handleOK}
              onClickShortcut={handleShortcutPageDate}
              ranges={ranges}
            />
          </div>
        </PickerOverlay>
      );
    },
    [
      menuStyle,
      merge,
      menuClassName,
      prefix,
      showOneCalendar,
      calendarDate,
      handleDisabledDate,
      formatStr,
      hoverValue,
      isoWeek,
      limitEndYear,
      locale,
      handleChangeCalendarDate,
      handleMouseMove,
      handleSelectValueChange,
      showWeekNumbers,
      selectValue,
      getDisplayString,
      disabledOkButton,
      disabledShortcutButton,
      oneTap,
      handleOK,
      handleShortcutPageDate,
      ranges
    ]
  );

  const hasValue = value && value.length > 1;
  const [classes, usedClassNamePropKeys] = usePickerClassName({
    ...props,
    name: 'daterange',
    hasValue
  });

  return (
    <PickerToggleTrigger
      pickerProps={pick(props, pickTriggerPropKeys)}
      ref={triggerRef}
      placement={placement}
      onEnter={createChainedFunction(handleEnter, onEnter)}
      onEntered={createChainedFunction(handleEntered, onEntered)}
      onExited={createChainedFunction(handleExited, onExited)}
      speaker={renderDropdownMenu}
    >
      <Component ref={rootRef} className={merge(className, classes)} style={style}>
        <PickerToggle
          {...omit(rest, [
            ...omitTriggerPropKeys,
            ...usedClassNamePropKeys,
            ...DateUtils.calendarOnlyProps
          ])}
          as={toggleAs}
          ref={targetRef}
          input
          inputMask={DateUtils.getDateMask(rangeFormatStr)}
          inputValue={value ? (getDisplayString(value, true) as string) : ''}
          inputPlaceholder={
            typeof placeholder === 'string' && placeholder ? placeholder : rangeFormatStr
          }
          onInputChange={handleInputChange}
          onInputBlur={handleInputBlur}
          onKeyDown={onPickerKeyDown}
          onClean={createChainedFunction(handleClean, onClean)}
          cleanable={cleanable && !disabled}
          hasValue={hasValue}
          active={isPickerToggleActive}
          placement={placement}
          caretComponent={IconCalendar}
          disabled={disabled}
        >
          {getDisplayString()}
        </PickerToggle>
      </Component>
    </PickerToggleTrigger>
  );
});

DateRangePicker.after = disabledDateUtils.after;
DateRangePicker.afterToday = disabledDateUtils.afterToday;
DateRangePicker.allowedDays = disabledDateUtils.allowedDays;
DateRangePicker.allowedMaxDays = disabledDateUtils.allowedMaxDays;
DateRangePicker.allowedRange = disabledDateUtils.allowedRange;
DateRangePicker.before = disabledDateUtils.before;
DateRangePicker.beforeToday = disabledDateUtils.beforeToday;
DateRangePicker.combine = disabledDateUtils.combine;

DateRangePicker.displayName = 'DateRangePicker';
DateRangePicker.defaultProps = defaultProps;
DateRangePicker.propTypes = {
  ...pickerPropTypes,
  ranges: PropTypes.array,
  value: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  defaultValue: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  defaultCalendarValue: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  hoverRange: PropTypes.oneOfType([PropTypes.oneOf(['week', 'month']), PropTypes.func]),
  format: PropTypes.string,
  isoWeek: PropTypes.bool,
  oneTap: PropTypes.bool,
  limitEndYear: PropTypes.number,
  showWeekNumbers: PropTypes.bool,
  onChange: PropTypes.func,
  onOk: PropTypes.func,
  disabledDate: PropTypes.func,
  onSelect: PropTypes.func,
  showOneCalendar: PropTypes.bool
};

export default DateRangePicker;
