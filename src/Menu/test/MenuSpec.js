import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Menu from '../Menu';

afterEach(() => {
  sinon.restore();
});

describe('<Menu>', () => {
  it('Closes menu and moves focus to button when clicking outside', () => {
    const { getByTestId } = render(
      <div data-testid="div">
        <Menu
          renderMenuButton={(buttonProps, buttonRef) => (
            <button ref={buttonRef} {...buttonProps} data-testid="button">
              Button
            </button>
          )}
          renderMenuPopup={({ open, ...popupProps }, popupRef) => (
            <ul ref={popupRef} {...popupProps} hidden={!open} data-testid="menu" />
          )}
        >
          {(containerProps, containerRef) => (
            <div ref={containerRef} {...containerProps} data-testid="container" />
          )}
        </Menu>
      </div>
    );

    const button = getByTestId('button');
    const menu = getByTestId('menu');

    fireEvent.click(button);
    expect(menu).to.be.visible;

    sinon.spy(button, 'focus');

    userEvent.click(getByTestId('div'));
    expect(menu).not.to.be.visible;
    expect(button.focus).to.have.been.called;
  });
  it('Closes menu but dont move focus to button when clicking on a focusable element outside', () => {
    const { getByTestId } = render(
      <div>
        <Menu
          renderMenuButton={(buttonProps, buttonRef) => (
            <button ref={buttonRef} {...buttonProps} data-testid="button">
              Button
            </button>
          )}
          renderMenuPopup={({ open, ...popupProps }, popupRef) => (
            <ul ref={popupRef} {...popupProps} hidden={!open} data-testid="menu" />
          )}
        >
          {(containerProps, containerRef) => (
            <div ref={containerRef} {...containerProps} data-testid="container" />
          )}
        </Menu>
        <button data-testid="outside-button">Another button</button>
      </div>
    );

    const button = getByTestId('button');
    const menu = getByTestId('menu');

    fireEvent.click(button);
    expect(menu).to.be.visible;

    sinon.spy(button, 'focus');

    userEvent.click(getByTestId('outside-button'));
    expect(menu).not.to.be.visible;
    expect(button.focus).not.to.have.been.called;
  });
  it('Closes menu when focus is moving outside of menu', () => {
    const { getByTestId } = render(
      <Menu
        renderMenuButton={(buttonProps, buttonRef) => (
          <button ref={buttonRef} {...buttonProps} data-testid="button">
            Button
          </button>
        )}
        renderMenuPopup={({ open, ...popupProps }, popupRef) => (
          <ul ref={popupRef} {...popupProps} hidden={!open} data-testid="menu" />
        )}
      >
        {(containerProps, containerRef) => (
          <div ref={containerRef} {...containerProps} data-testid="container" />
        )}
      </Menu>
    );

    const button = getByTestId('button');
    const menu = getByTestId('menu');

    act(() => {
      fireEvent.click(button);
    });
    expect(menu).to.be.visible;

    act(() => {
      fireEvent.blur(getByTestId('container'));
    });
    expect(menu).not.to.be.visible;
  });
});
