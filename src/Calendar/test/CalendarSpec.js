import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { parseISO } from '../../utils/dateUtils';
import { getDOMNode } from '@test/testUtils';
import Calendar from '../Calendar';

describe('Calendar', () => {
  it('Should render a div with `calendar` class', () => {
    const instance = getDOMNode(<Calendar calendarDate={new Date()} />);

    assert.equal(instance.nodeName, 'DIV');
    assert.ok(instance.className.match(/\bcalendar\b/));
  });

  it('Should output valid one day', () => {
    const instance = getDOMNode(
      <Calendar format="yyyy-MM-dd" calendarDate={parseISO('2018-07-01')} />
    );
    assert.equal(
      instance
        .querySelectorAll('.rs-calendar-table-row')[1]
        .querySelector('.rs-calendar-table-cell-content').innerText,
      '1'
    );
  });

  it('Should call `onSelect` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(
      <Calendar format="yyyy-MM-dd" calendarDate={new Date()} onSelect={doneOp} />
    );
    ReactTestUtils.Simulate.click(
      instance.querySelector('.rs-calendar-table-cell-is-today .rs-calendar-table-cell-content')
    );
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<Calendar className="custom" calendarDate={new Date()} />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<Calendar style={{ fontSize }} calendarDate={new Date()} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<Calendar classPrefix="custom-prefix" calendarDate={new Date()} />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });
});
