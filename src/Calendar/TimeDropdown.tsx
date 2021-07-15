import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getPosition, scrollTop } from 'dom-lib';
import partial from 'lodash/partial';
import camelCase from 'lodash/camelCase';
import isNumber from 'lodash/isNumber';
import { DateUtils, scrollTopAnimation, useClassNames } from '../utils';

import { useCalendarContext } from './CalendarContext';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';

export interface TimeDropdownProps extends WithAsProps {
  show?: boolean;
  showMeridian?: boolean;
  disabledDate?: (date: Date) => boolean;
  disabledHours?: (hour: number, date: Date) => boolean;
  disabledMinutes?: (minute: number, date: Date) => boolean;
  disabledSeconds?: (second: number, date: Date) => boolean;
  hideHours?: (hour: number, date: Date) => boolean;
  hideMinutes?: (minute: number, date: Date) => boolean;
  hideSeconds?: (second: number, date: Date) => boolean;
}

const defaultProps: Partial<TimeDropdownProps> = {
  classPrefix: 'calendar-time-dropdown',
  as: 'div'
};

interface Time {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

type TimeType = 'hours' | 'minutes' | 'seconds';

/**
 * Get the effective range of hours, minutes and seconds
 * @param meridian
 */
export function getRanges(meridian: boolean) {
  return {
    hours: { start: 0, end: meridian ? 11 : 23 },
    minutes: { start: 0, end: 59 },
    seconds: { start: 0, end: 59 }
  };
}

/**
 * Convert the 24-hour clock to the 12-hour clock
 * @param hours
 */
export function getMeridianHours(hours: number): number {
  return hours >= 12 ? hours - 12 : hours;
}

const getTime = (props: { date: Date; format?: string; showMeridian: boolean }) => {
  const { format, date, showMeridian } = props;
  const time = date || new Date();
  const nextTime: Time = {};

  if (!format) {
    return nextTime;
  }

  if (/(H|h)/.test(format)) {
    const hours = DateUtils.getHours(time);
    nextTime.hours = showMeridian ? getMeridianHours(hours) : hours;
  }
  if (/m/.test(format)) {
    nextTime.minutes = DateUtils.getMinutes(time);
  }
  if (/s/.test(format)) {
    nextTime.seconds = DateUtils.getSeconds(time);
  }
  return nextTime;
};

const scrollTo = (time: Time, row: HTMLDivElement) => {
  if (!row) {
    return;
  }

  Object.entries(time).forEach(([type, value]: [string, number]) => {
    const container: Element = row.querySelector(`[data-type="${type}"]`);
    const node = container?.querySelector(`[data-key="${type}-${value}"]`);

    if (node && container) {
      const { top } = getPosition(node, container);
      scrollTopAnimation(container, top, scrollTop(container) !== 0);
    }
  });
};

const TimeDropdown: RsRefForwardingComponent<'div', TimeDropdownProps> = React.forwardRef(
  (props: TimeDropdownProps, ref) => {
    const { as: Component, className, classPrefix, show, showMeridian, ...rest } = props;
    const { locale, format, date, onChangePageTime: onSelect } = useCalendarContext();
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const time = getTime({ format, date, showMeridian });
      // The currently selected time scrolls to the visible range.
      show && scrollTo(time, rowRef.current);
    }, [date, format, show, showMeridian]);

    const handleClick = (type: TimeType, d: number, event: React.MouseEvent) => {
      let nextDate = date || new Date();

      switch (type) {
        case 'hours':
          nextDate = DateUtils.setHours(date, d);
          break;
        case 'minutes':
          nextDate = DateUtils.setMinutes(date, d);
          break;
        case 'seconds':
          nextDate = DateUtils.setSeconds(date, d);
          break;
      }

      onSelect?.(nextDate, event);
    };

    const { prefix, rootPrefix, merge } = useClassNames(classPrefix);

    const renderColumn = (type: TimeType, active: any) => {
      if (!isNumber(active)) {
        return null;
      }
      const { start, end } = getRanges(showMeridian)[type];
      const items = [];
      const hideFunc = props[camelCase(`hide_${type}`)];
      const disabledFunc = props[camelCase(`disabled_${type}`)];

      for (let i = start; i <= end; i += 1) {
        if (!hideFunc?.(i, date)) {
          const disabled = disabledFunc?.(i, date);
          const itemClasses = prefix('cell', {
            'cell-active': active === i,
            'cell-disabled': disabled
          });

          items.push(
            <li key={i} role="menuitem">
              <a
                role="button"
                className={itemClasses}
                tabIndex={-1}
                data-key={`${type}-${i}`}
                onClick={!disabled ? partial(handleClick, type, i) : null}
              >
                {showMeridian && type === 'hours' && i === 0 ? '12' : i}
              </a>
            </li>
          );
        }
      }

      return (
        <div className={prefix('column')} role="listitem">
          <div className={prefix('column-title')}>{locale?.[type]}</div>
          <ul data-type={type} role="menu">
            {items}
          </ul>
        </div>
      );
    };

    const time = getTime({ format, date, showMeridian });
    const classes = merge(className, rootPrefix(classPrefix));

    return (
      <Component
        role="list"
        {...DateUtils.omitHideDisabledProps<TimeDropdownProps>(rest)}
        ref={ref}
        className={classes}
      >
        <div className={prefix('content')}>
          <div className={prefix('row')} ref={rowRef}>
            {renderColumn('hours', time.hours)}
            {renderColumn('minutes', time.minutes)}
            {renderColumn('seconds', time.seconds)}
          </div>
        </div>
      </Component>
    );
  }
);

TimeDropdown.displayName = 'TimeDropdown';
TimeDropdown.defaultProps = defaultProps;
TimeDropdown.propTypes = {
  show: PropTypes.bool,
  showMeridian: PropTypes.bool,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  disabledDate: PropTypes.func,
  disabledHours: PropTypes.func,
  disabledMinutes: PropTypes.func,
  disabledSeconds: PropTypes.func,
  hideHours: PropTypes.func,
  hideMinutes: PropTypes.func,
  hideSeconds: PropTypes.func
};

export default TimeDropdown;
