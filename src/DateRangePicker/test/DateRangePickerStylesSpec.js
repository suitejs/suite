import React from 'react';
import ReactDOM from 'react-dom';
import DateRangePicker from '../index';
import { createTestContainer, getInstance } from '@test/testUtils';
import { getWidth } from 'dom-lib';

import '../styles/index';

describe('DateRangePicker styles', () => {
  it('Should render the correct styles', call => {
    const instanceRef = React.createRef();
    ReactDOM.render(<DateRangePicker ref={instanceRef} open />, createTestContainer());

    const toggleDom = instanceRef.current.toggle;
    assert.equal(
      window.getComputedStyle(toggleDom.querySelector('.rs-picker-toggle-caret'), '::before')
        .content,
      `"${String.fromCharCode(0xf073)}"`
    );
    call();
  });

  it('Should keep size in `block` mode', function () {
    const instance = getInstance(<DateRangePicker block defaultOpen />);

    assert.ok(instance.root.className.includes('rs-picker-block'));
    assert.ok(getWidth(instance.menu) === 510);
  });
});
