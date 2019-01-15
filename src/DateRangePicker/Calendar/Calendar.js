// @flow

import * as React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';

import { getUnhandledProps, prefix, defaultProps } from '../../utils';
import MonthDropdown from '../../Calendar/MonthDropdown';
import Header from '../../Calendar/Header';
import View from './View';

type Props = {
  disabledDate?: (date: dayjs.Dayjs, selectValue: ?Array<dayjs.Dayjs>, type: string) => boolean,
  calendarState?: 'DROP_MONTH' | 'DROP_TIME',
  index: number,
  calendarDate: Array<dayjs.Dayjs>,
  value?: Array<dayjs.Dayjs>,
  hoverValue?: Array<dayjs.Dayjs>,
  onMoveForword?: (nextPageDate: dayjs.Dayjs) => void,
  onMoveBackward?: (nextPageDate: dayjs.Dayjs) => void,
  onSelect?: (date: dayjs.Dayjs) => void,
  onMouseMove?: (date: dayjs.Dayjs) => void,
  onToggleMonthDropdown?: (event: SyntheticEvent<*>) => void,
  onChangePageDate?: (nextPageDate: dayjs.Dayjs, event: SyntheticEvent<*>) => void,
  format: string,
  isoWeek?: boolean,
  className?: string,
  classPrefix?: string,
  limitEndYear?: number
};

class Calendar extends React.Component<Props> {
  static defaultProps = {
    calendarDate: [dayjs(), dayjs().add(1, 'month')],
    index: 0
  };

  getPageDate() {
    const { calendarDate, index } = this.props;
    return calendarDate[index];
  }

  handleMoveForword = () => {
    const { onMoveForword } = this.props;
    onMoveForword && onMoveForword(this.getPageDate().add(1, 'month'));
  };

  handleMoveBackward = () => {
    const { onMoveBackward } = this.props;
    onMoveBackward && onMoveBackward(this.getPageDate().add(-1, 'month'));
  };

  disabledBackward = () => {
    const { calendarDate, index } = this.props;
    const isAfter = calendarDate[1].isAfter(calendarDate[0].add(1, 'month'), 'month');

    if (index === 0) {
      return false;
    }

    if (!isAfter) {
      return true;
    }

    return false;
  };

  disabledForword = () => {
    const { calendarDate, index } = this.props;
    const isAfter = calendarDate[1].isAfter(calendarDate[0].add(1, 'month'), 'month');

    if (index === 1) {
      return false;
    }

    if (!isAfter) {
      return true;
    }

    return false;
  };

  disabledMonth = (date: dayjs.Dayjs) => {
    const { calendarDate, value, index, disabledDate } = this.props;
    let isAfter = true;

    if (disabledDate && disabledDate(date, value, 'MONTH')) {
      return true;
    }

    if (index === 1) {
      isAfter = date.isAfter(calendarDate[0], 'month');
      return !isAfter;
    }

    isAfter = calendarDate[1].isAfter(date, 'month');

    return !isAfter;
  };

  shouldMountDate(props: Props) {
    const { format } = props || this.props;
    return /Y/.test(format) && /M/.test(format) && /D/.test(format);
  }
  render() {
    const {
      calendarState,
      onSelect,
      onMouseMove,
      onToggleMonthDropdown,
      onChangePageDate,
      disabledDate,
      className,
      value,
      hoverValue,
      isoWeek,
      limitEndYear,
      classPrefix,
      ...rest
    } = this.props;

    const pageDate = this.getPageDate();
    const dropMonth = calendarState === 'DROP_MONTH';
    const addPrefix = prefix(classPrefix);
    const calendarClasses = classNames(classPrefix, className, {
      [addPrefix('show-month-dropdown')]: dropMonth
    });

    const unhandled = getUnhandledProps(Calendar, rest);

    return (
      <div {...unhandled} className={calendarClasses}>
        <Header
          showMonth={true}
          date={pageDate}
          disabledBackward={this.disabledBackward()}
          disabledForword={this.disabledForword()}
          onMoveForword={this.handleMoveForword}
          onMoveBackward={this.handleMoveBackward}
          onToggleMonthDropdown={onToggleMonthDropdown}
        />

        <View
          activeDate={pageDate}
          value={value}
          hoverValue={hoverValue}
          onSelect={onSelect}
          onMouseMove={onMouseMove}
          disabledDate={disabledDate}
          isoWeek={isoWeek}
        />

        <MonthDropdown
          date={pageDate}
          show={dropMonth}
          disabledMonth={this.disabledMonth}
          onSelect={onChangePageDate}
          limitEndYear={limitEndYear}
        />
      </div>
    );
  }
}

const enhance = defaultProps({
  classPrefix: 'calendar'
});

export default enhance(Calendar);
