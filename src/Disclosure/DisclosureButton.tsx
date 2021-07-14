import React, { useCallback, useContext, useRef } from 'react';
import DisclosureContext, { DisclosureActionTypes } from './DisclosureContext';
import { KEY_VALUES } from '../utils';

export interface DisclosureButtonRenderProps {
  open: boolean;
}

export interface DisclosureButtonProps {
  children: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & DisclosureButtonRenderProps,
    ref: React.Ref<HTMLButtonElement>
  ) => React.ReactElement<React.HTMLAttributes<HTMLButtonElement>>;
}

function DisclosureButton(props: DisclosureButtonProps) {
  const { children } = props;

  const buttonRef = useRef<HTMLButtonElement>();

  const [{ open }, dispatch, { onToggle }] = useContext(DisclosureContext);

  const toggle = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      if (!open) {
        dispatch({ type: DisclosureActionTypes.Show });
        onToggle?.(true, event);
      } else {
        dispatch({ type: DisclosureActionTypes.Hide });
        onToggle?.(false, event);
      }
    },
    [open, dispatch, onToggle]
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      toggle(event);
    },
    [toggle]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case KEY_VALUES.ENTER:
        case KEY_VALUES.SPACE:
          event.preventDefault();
          event.stopPropagation();
          toggle(event);
          break;
      }
    },
    [toggle]
  );

  return children({ role: 'button', 'aria-expanded': open, onClick, onKeyDown, open }, buttonRef);
}

DisclosureButton.displayName = 'Disclosure.Button';

export default DisclosureButton;
