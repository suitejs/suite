import React from 'react';
import ReactDOM from 'react-dom';
import Content from '../index';
import { createTestContainer, getDOMNode, getStyle } from '@test/testUtils';

import '../styles/index';

describe('Content styles', () => {
  it('Should render the correct styles', () => {
    const instanceRef = React.createRef();
    ReactDOM.render(<Content ref={instanceRef}>Title</Content>, createTestContainer());
    assert.equal(getStyle(getDOMNode(instanceRef.current), 'flex'), '1 1 auto');
  });
});
