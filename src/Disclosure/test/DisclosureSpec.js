import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import Disclosure from '../Disclosure';

describe('<Disclosure>', () => {
  it('Should render a Disclosure', () => {
    const { getByTestId } = render(
      <Disclosure>
        {() => (
          <>
            <Disclosure.Button>
              {props => (
                <button data-testid="button" {...props}>
                  Button
                </button>
              )}
            </Disclosure.Button>
            <Disclosure.Content>
              {({ open, ...props }) => (
                <div data-testid="content" hidden={!open} {...props}>
                  Content
                </div>
              )}
            </Disclosure.Content>
          </>
        )}
      </Disclosure>
    );

    const button = getByTestId('button');
    const content = getByTestId('content');

    expect(button, 'The button').not.to.be.null;
    expect(content, 'The content').not.to.be.null;

    expect(content.hidden, 'Content is hidden').to.be.true;

    act(() => {
      fireEvent.click(button);
    });

    expect(!content.hidden, 'Content is visible').to.be.true;
  });

  it('Should be possible to control Disclosure with `open` and `onToggle`', () => {
    const onToggleSpy = sinon.spy();
    const { getByTestId, rerender } = render(
      <Disclosure open onToggle={onToggleSpy}>
        {() => (
          <>
            <Disclosure.Button>
              {props => (
                <button data-testid="button" {...props}>
                  Button
                </button>
              )}
            </Disclosure.Button>
            <Disclosure.Content>
              {({ open, ...props }) => (
                <div data-testid="content" hidden={!open} {...props}>
                  Content
                </div>
              )}
            </Disclosure.Content>
          </>
        )}
      </Disclosure>
    );

    const button = getByTestId('button');
    const content = getByTestId('content');

    expect(!content.hidden, 'Content is visible').to.be.true;

    act(() => {
      fireEvent.click(button);
    });

    expect(onToggleSpy).to.have.been.calledWith(false);

    rerender(
      <Disclosure open={false} onToggle={onToggleSpy}>
        {() => (
          <>
            <Disclosure.Button>
              {props => (
                <button data-testid="button" {...props}>
                  Button
                </button>
              )}
            </Disclosure.Button>
            <Disclosure.Content>
              {({ open, ...props }) => (
                <div data-testid="content" hidden={!open} {...props}>
                  Content
                </div>
              )}
            </Disclosure.Content>
          </>
        )}
      </Disclosure>
    );

    expect(content.hidden, 'Content is hidden').to.be.true;

    act(() => {
      fireEvent.click(button);
    });

    expect(onToggleSpy).to.have.been.calledWith(true);
  });

  describe('Keyboard interaction', function () {
    it('Enter: activates the disclosure control and toggles the visibility of the disclosure content.', () => {
      const { getByTestId } = render(
        <Disclosure>
          {() => (
            <>
              <Disclosure.Button>
                {props => (
                  <button data-testid="button" {...props}>
                    Button
                  </button>
                )}
              </Disclosure.Button>
              <Disclosure.Content>
                {({ open, ...props }) => (
                  <div data-testid="content" hidden={!open} {...props}>
                    Content
                  </div>
                )}
              </Disclosure.Content>
            </>
          )}
        </Disclosure>
      );

      const button = getByTestId('button');
      const content = getByTestId('content');

      act(() => {
        fireEvent.keyDown(button, { key: 'Enter' });
      });

      expect(!content.hidden, 'Shows the content').to.be.true;

      act(() => {
        fireEvent.keyDown(button, { key: 'Enter' });
      });

      expect(content.hidden, 'Hides the content').to.be.true;
    });
    it('Space: activates the disclosure control and toggles the visibility of the disclosure content.', () => {
      const { getByTestId } = render(
        <Disclosure>
          {() => (
            <>
              <Disclosure.Button>
                {props => (
                  <button data-testid="button" {...props}>
                    Button
                  </button>
                )}
              </Disclosure.Button>
              <Disclosure.Content>
                {({ open, ...props }) => (
                  <div data-testid="content" hidden={!open} {...props}>
                    Content
                  </div>
                )}
              </Disclosure.Content>
            </>
          )}
        </Disclosure>
      );

      const button = getByTestId('button');
      const content = getByTestId('content');

      act(() => {
        fireEvent.keyDown(button, { key: ' ' });
      });

      expect(!content.hidden, 'Shows the content').to.be.true;

      act(() => {
        fireEvent.keyDown(button, { key: ' ' });
      });

      expect(content.hidden, 'Hides the content').to.be.true;
    });
  });
});
