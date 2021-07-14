// Headless Disclosure
// Ref: https://w3c.github.io/aria-practices/#disclosure

import React, { useMemo, useReducer, useRef } from 'react';
import DisclosureContext, {
  DisclosureAction,
  DisclosureActionTypes,
  DisclosureContextProps,
  DisclosureState
} from './DisclosureContext';
import DisclosureButton from './DisclosureButton';
import DisclosureContent from './DisclosureContent';
import useClickOutside from '../utils/useClickOutside';

export interface DisclosureRenderProps {
  open: boolean;
}

export interface DisclosureProps {
  children: (props: DisclosureRenderProps, ref: React.Ref<HTMLElement>) => React.ReactNode;

  /** Controlled open state */
  open?: boolean;

  /** Whether disclosure is initially expanded */
  defaultOpen?: boolean;
  hideOnClickOutside?: boolean;

  /** Callback when disclosure button is being activated to update the open state */
  onToggle?: (open: boolean, event: React.SyntheticEvent<HTMLElement>) => void;
}

const initialDisclosureState: DisclosureState = {
  open: false
};

function disclosureReducer(state: DisclosureState, action: DisclosureAction): DisclosureState {
  switch (action.type) {
    case DisclosureActionTypes.Show:
      return { ...state, open: true };
    case DisclosureActionTypes.Hide:
      return { ...state, open: false };
  }
  return state;
}

function Disclosure(props: DisclosureProps) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    hideOnClickOutside = false,
    onToggle
  } = props;

  const [{ open: openState }, dispatch] = useReducer(disclosureReducer, {
    ...initialDisclosureState,
    open: defaultOpen
  });

  const containerElementRef = useRef<HTMLElement>();

  const open = openProp ?? openState;

  useClickOutside({
    enabled: hideOnClickOutside,
    isOutside: event => !containerElementRef.current.contains(event.target as HTMLElement),
    handle: () => dispatch({ type: DisclosureActionTypes.Hide })
  });

  const context = useMemo<DisclosureContextProps>(() => {
    return [{ open }, dispatch, { onToggle }];
  }, [open, dispatch, onToggle]);

  return (
    <DisclosureContext.Provider value={context}>
      {children({ open }, containerElementRef)}
    </DisclosureContext.Provider>
  );
}

Disclosure.Button = DisclosureButton;
Disclosure.Content = DisclosureContent;

export default Disclosure;
