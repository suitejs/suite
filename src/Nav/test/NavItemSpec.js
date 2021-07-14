import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { getByTestId, screen } from '@testing-library/react';
import { getDOMNode, createTestContainer, innerText } from '@test/testUtils';

import NavItem from '../NavItem';
import Sidenav from '../../Sidenav';
import Nav from '../Nav';

describe('<Nav.Item>', () => {
  it('Should render a <a>', () => {
    let title = 'Test';
    let instance = getDOMNode(<NavItem>{title}</NavItem>);
    assert.equal(instance.tagName, 'A');
    assert.equal(innerText(instance), title);
  });

  it('Should call onSelect callback', done => {
    let key = 'Test';
    let doneOp = eventKey => {
      if (eventKey === key) {
        done();
      }
    };

    let instance = getDOMNode(<NavItem onSelect={doneOp} eventKey={key} />);
    ReactTestUtils.Simulate.click(instance);
  });

  it('Should call onClick callback', done => {
    let doneOp = () => {
      done();
    };
    let instance = getDOMNode(<NavItem onSelect={doneOp} />);
    ReactTestUtils.Simulate.click(instance);
  });

  it('Should render a separator', () => {
    let instance = getDOMNode(
      <Sidenav>
        <Nav>
          <NavItem divider data-testid="nav-item" />
        </Nav>
      </Sidenav>
    );
    assert.include(getByTestId(instance, 'nav-item').className, 'rs-nav-item-divider');
  });

  it('Should render a panel', () => {
    let instance = getDOMNode(
      <Sidenav>
        <Nav>
          <NavItem panel data-testid="nav-item" />
        </Nav>
      </Sidenav>
    );
    assert.include(getByTestId(instance, 'nav-item').className, 'rs-nav-item-panel');
  });

  it('Should be active', () => {
    let instance = getDOMNode(<NavItem active />);
    assert.include(instance.className, 'rs-nav-item-active');
  });

  it('Should be disabled', () => {
    let instance = getDOMNode(<NavItem disabled />);
    assert.include(instance.className, 'rs-nav-item-disabled');
  });

  it('Should not call onSelect callback when the `NavItem` is disabled', () => {
    const onHideSpy = sinon.spy();

    let instance = getDOMNode(<NavItem onSelect={onHideSpy} disabled />);
    ReactTestUtils.Simulate.click(instance);
    assert.ok(!onHideSpy.calledOnce);
  });

  it('Should not call onClick callback when the `NavItem` is disabled', () => {
    const onHideSpy = sinon.spy();

    let instance = getDOMNode(<NavItem onClick={onHideSpy} disabled />);
    ReactTestUtils.Simulate.click(instance);
    assert.ok(!onHideSpy.calledOnce);
  });

  it('Should have a custom className', () => {
    let instance = getDOMNode(<NavItem className="custom" />);
    assert.include(instance.className, 'custom');
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    let instance = getDOMNode(<NavItem style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<NavItem classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });

  it('Should render a tooltip when used inside a collapsed <Sidenav>', async () => {
    const container = createTestContainer();
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <Sidenav expanded={false}>
          <NavItem data-testid="nav-item">item</NavItem>
        </Sidenav>,
        container
      );
    });

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.focus(getByTestId(container, 'nav-item'));
    });

    expect(screen.getByRole('tooltip'), 'Tooltip').not.to.be.null;
  });
});
