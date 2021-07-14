import React from 'react';
import ReactTestUtils, { act, Simulate } from 'react-dom/test-utils';
import { innerText, getDOMNode } from '@test/testUtils';

import DropdownItem from '../DropdownItem';
import User from '@rsuite/icons/legacy/User';

describe('<Dropdown.Item>', () => {
  it('Should render element with role="menuitem"', () => {
    const title = 'Test';
    const instance = getDOMNode(<DropdownItem>{title}</DropdownItem>);

    assert.equal(instance.getAttribute('role'), 'menuitem', 'role');
    assert.equal(innerText(instance), title);
  });

  it('Should render an <a> element given as="a"', () => {
    const title = 'Test';
    const instance = getDOMNode(<DropdownItem as="a">{title}</DropdownItem>);
    assert.equal(instance.tagName, 'A');
    assert.equal(innerText(instance), title);
  });

  it('Should render a divider', () => {
    const instance = getDOMNode(<DropdownItem divider />);
    assert.include(instance.className, 'rs-dropdown-item-divider');
  });

  it('Should render a panel', () => {
    const instance = getDOMNode(<DropdownItem panel />);
    assert.include(instance.className, 'rs-dropdown-item-panel');
  });

  it('Should be active', () => {
    const instance = getDOMNode(<DropdownItem active />);
    assert.include(instance.className, 'rs-dropdown-item-active');
  });

  it('Should be disabled', () => {
    const instance = getDOMNode(<DropdownItem disabled />);
    assert.include(instance.className, 'rs-dropdown-item-disabled');
  });

  it('Should render a icon', () => {
    const instance = getDOMNode(<DropdownItem icon={<User />} />);
    assert.ok(instance.querySelector('.rs-icon'));
  });

  it('Should call onSelect callback with correct `eventKey`', () => {
    const onSelectSpy = sinon.spy();

    const instance = getDOMNode(
      <DropdownItem onSelect={onSelectSpy} eventKey="ABC">
        Title
      </DropdownItem>
    );
    act(() => {
      Simulate.click(instance);
    });

    expect(onSelectSpy).to.have.been.calledWith('ABC');
  });

  it('Should call onClick callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(<DropdownItem onClick={doneOp}>Title</DropdownItem>);
    ReactTestUtils.Simulate.click(instance);
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<DropdownItem className="custom" />);
    assert.include(instance.className, 'custom');
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<DropdownItem style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<DropdownItem classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });

  it('Should accept a custom `id`', () => {
    const menuitem = getDOMNode(<DropdownItem id="custom-id">Menu item</DropdownItem>);
    assert.equal(menuitem.getAttribute('id'), 'custom-id', 'id');
  });
});
