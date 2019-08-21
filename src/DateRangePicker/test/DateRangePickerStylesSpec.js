import React from 'react';
import ReactDOM from 'react-dom';
import DateRangePicker from '../index';
import { createTestContainer, getDOMNode } from '@test/testUtils';

import '../styles/index';

describe('DateRangePicker styles', () => {
  it('Should render the correct styles', () => {
    const instanceRef = React.createRef();
    ReactDOM.render(<DateRangePicker ref={instanceRef} />, createTestContainer());
    const toggleDom = getDOMNode(instanceRef.current).querySelector('.rs-picker-toggle');
    toggleDom.click();
    assert.equal(
      window.getComputedStyle(toggleDom.querySelector('.rs-picker-toggle-caret'), '::before')
        .content,
      `"${String.fromCharCode(0xf073)}"`
    );
  });
});
