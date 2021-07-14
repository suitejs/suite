import React from 'react';

export interface DropdownContextProps {
  activeKey?: string;
  onSelect: (eventKey: string, event: React.SyntheticEvent) => void;
}

const DropdownContext = React.createContext<DropdownContextProps | null>(null);
DropdownContext.displayName = 'DropdownContext';

export default DropdownContext;
