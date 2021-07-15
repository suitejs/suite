import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { format, isSameDay, parseISO } from '../../utils/dateUtils';
import { getDOMNode, getInstance, createTestContainer } from '@test/testUtils';
import DatePicker from '../DatePicker';

describe('DatePicker ', () => {
  it('Should render a div with "rs-picker-date" class', () => {
    const instance = getDOMNode(<DatePicker />);
    assert.equal(instance.nodeName, 'DIV');
    assert.ok(instance.className.match(/\brs-picker-date\b/));
  });

  it('Should be disabled', () => {
    const instance = getDOMNode(<DatePicker disabled />);
    assert.ok(instance.className.match(/\bdisabled\b/));
  });

  it('Should be not cleanable', () => {
    const instance = getDOMNode(<DatePicker cleanable={false} value={new Date()} />);
    assert.ok(!instance.querySelector('.rs-picker-toggle-clean'));
  });

  it('Should output a button', () => {
    const instance = getDOMNode(<DatePicker toggleAs="button" />);
    assert.equal(instance.querySelector('[role="combobox"]').tagName, 'BUTTON');
  });

  it('Should be block', () => {
    const instance = getDOMNode(<DatePicker block />);

    assert.ok(instance.className.match(/\bblock\b/));
  });

  it('Should be inline', () => {
    const instance = getInstance(<DatePicker inline />);

    assert.ok(instance.root);
    assert.ok(!instance.overlay);
  });

  it('Should output a date', () => {
    const instance = getDOMNode(<DatePicker defaultValue={parseISO('2017-08-14')} />);
    assert.equal(instance.querySelector('.rs-picker-toggle-value').innerText, '2017-08-14');
  });

  it('Should output custom value', () => {
    const instance = getDOMNode(
      <DatePicker
        value={parseISO('2017-08-14')}
        renderValue={value => {
          return format(value, 'MM/dd/yyyy');
        }}
      />
    );

    assert.equal(instance.querySelector('.rs-picker-toggle-value').innerText, '08/14/2017');
  });

  it('Should output a date', () => {
    const instance = getDOMNode(<DatePicker value={parseISO('2017-08-14')} />);
    assert.equal(instance.querySelector('.rs-picker-toggle-value').innerText, '2017-08-14');
  });

  it('Should get panel container ref', function () {
    const instance = getDOMNode(<DatePicker defaultOpen />);
    assert.equal(instance.tagName, 'DIV');
  });

  it('Should call `onChange` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onChange={doneOp} defaultOpen />);

    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector('.rs-picker-toolbar-right .rs-btn')
    );
  });

  it('Should call `onClean` callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(<DatePicker defaultValue={new Date()} onClean={doneOp} />);
    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle-clean'));
  });

  it('Should call `onSelect` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onSelect={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector(
        '.rs-calendar-table-cell-is-today .rs-calendar-table-cell-content'
      )
    );
  });

  it('Should call `onOk` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onOk={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector('.rs-picker-toolbar-right .rs-btn')
    );
  });

  it('Should call `onNextMonth` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onNextMonth={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(instance.overlay.querySelector('.rs-calendar-header-forward'));
  });

  it('Should call `onPrevMonth` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onPrevMonth={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(instance.overlay.querySelector('.rs-calendar-header-backward'));
  });

  it('Should call `onToggleMonthDropdown` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(
      <DatePicker onToggleMonthDropdown={doneOp} inline format="yyyy-MM-dd HH:mm:ss" />
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-calendar-header-title'));
  });

  it('Should call `onToggleTimeDropdown` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(
      <DatePicker onToggleTimeDropdown={doneOp} inline format="yyyy-MM-dd HH:mm:ss" />
    );
    ReactTestUtils.Simulate.click(instance.querySelector('.rs-calendar-header-title-time'));
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<DatePicker className="custom" />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<DatePicker style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should call `onChangeCalendarDate` callback when click backward', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onChangeCalendarDate={doneOp} defaultOpen />);

    ReactTestUtils.Simulate.click(instance.overlay.querySelector('.rs-calendar-header-backward'));
  });

  it('Should call `onChangeCalendarDate` callback when click forward', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onChangeCalendarDate={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(instance.overlay.querySelector('.rs-calendar-header-forward'));
  });

  it('Should call `onChangeCalendarDate` callback when click today ', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onChangeCalendarDate={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector(
        '.rs-calendar-table-cell-is-today .rs-calendar-table-cell-content'
      )
    );
  });

  it('Should call `onOpen` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getDOMNode(<DatePicker onOpen={doneOp} />);
    ReactTestUtils.Simulate.click(instance.querySelector('[role="combobox"]'));
  });

  it('Should call `onClose` callback', done => {
    const doneOp = () => {
      done();
    };

    const instance = getInstance(<DatePicker onClose={doneOp} defaultOpen />);
    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector('.rs-picker-toolbar-right .rs-btn')
    );
  });

  it('Should not change for the value  when it is controlled', done => {
    const doneOp = () => {
      if (instance.target.querySelector('.rs-picker-toggle-value').innerText === '2018-01-05') {
        done();
      }
    };

    const instance = getInstance(
      <DatePicker value={parseISO('2018-01-05')} onChange={doneOp} defaultOpen />
    );

    const allCells = instance.overlay.querySelectorAll(
      '.rs-calendar-table-cell .rs-calendar-table-cell-content'
    );

    ReactTestUtils.Simulate.click(allCells[allCells.length - 1]);
    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector('.rs-picker-toolbar-right .rs-btn')
    );
  });

  it('Should call onBlur callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(<DatePicker onBlur={doneOp} />);

    const toggle = instance.querySelector('.rs-picker-toggle');

    ReactTestUtils.Simulate.blur(toggle);
  });

  it('Should call onFocus callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(<DatePicker onFocus={doneOp} />);
    const toggle = instance.querySelector('.rs-picker-toggle');

    ReactTestUtils.Simulate.focus(toggle);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<DatePicker classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });

  it('Should call onChange after setting oneTap', done => {
    const doneOp = value => {
      if (isSameDay(value, new Date())) {
        done();
      }
    };

    const instance = getInstance(<DatePicker onChange={doneOp} oneTap defaultOpen />);

    const today = instance.overlay.querySelector(
      '.rs-calendar-table-cell-is-today .rs-calendar-table-cell-content'
    );

    ReactTestUtils.Simulate.click(today);
  });

  it('Should be show meridian', () => {
    const instance = getInstance(
      <DatePicker
        value={parseISO('2017-08-14 13:00:00')}
        format="dd MMM yyyy hh:mm:ss a"
        defaultOpen
        showMeridian
      />
    );
    const picker = instance.overlay;

    assert.equal(picker.querySelector('.rs-calendar-header-meridian').innerText, 'PM');
    assert.equal(picker.querySelector('.rs-calendar-header-title-time').innerText, '01:00:00');
    assert.equal(
      picker.querySelector('.rs-calendar-time-dropdown-column').querySelectorAll('li').length,
      12
    );
    assert.equal(picker.querySelector('.rs-calendar-time-dropdown-column li').innerText, '12');
  });

  it('Should show dates that are not in the same month', () => {
    const instance = getInstance(<DatePicker value={new Date('6/10/2021')} open />);
    const picker = instance.overlay;
    const days = picker.querySelectorAll('.rs-calendar-table-cell-un-same-month');

    assert.equal(days[0].innerText, '30');
    assert.equal(days[1].innerText, '31');
    assert.equal(days[2].innerText, '1');
  });

  it('Should be a controlled value', done => {
    const instanceRef = React.createRef();
    const container = createTestContainer();
    const App = React.forwardRef((props, ref) => {
      const [value, setValue] = React.useState(new Date('6/10/2021'));
      const pickerRef = React.useRef();
      React.useImperativeHandle(ref, () => ({
        picker: pickerRef.current,
        setDate: date => {
          setValue(date);
        }
      }));
      return <DatePicker value={value} open ref={pickerRef} format="yyyy-MM-dd" />;
    });

    ReactDOM.render(<App ref={instanceRef} />, container);
    instanceRef.current.setDate(new Date('7/11/2021'));

    assert.equal(
      instanceRef.current.picker.root.querySelector('.rs-picker-toggle-value').innerText,
      '2021-07-11'
    );

    setTimeout(() => {
      if (
        instanceRef.current.picker.overlay.querySelector('.rs-calendar-header-title').innerText ===
        '11 Jul 2021'
      ) {
        done();
      }
    }, 100);
  });
});
