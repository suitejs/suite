import React, { Dispatch } from 'react';

export interface DisclosureState {
  open: boolean;
}

export enum DisclosureActionTypes {
  Show,
  Hide
}

export type DisclosureAction = { type: DisclosureActionTypes };

export type DisclosureContextProps = [
  DisclosureState,
  Dispatch<DisclosureAction>,
  {
    onToggle: (open: boolean, event?: React.SyntheticEvent<HTMLElement>) => void;
  }
];

const DisclosureContext = React.createContext<DisclosureContextProps | null>(null);
DisclosureContext.displayName = 'Disclosure.Context';

export default DisclosureContext;
