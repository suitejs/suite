import React from 'react';
import noop from 'lodash/noop';

export interface NavContextProps {
  activeKey: string | null;
  onSelect: (eventKey: string, event: React.SyntheticEvent) => void;
}

const NavContext = React.createContext<NavContextProps>({
  activeKey: null,
  onSelect: noop
});

export default NavContext;
