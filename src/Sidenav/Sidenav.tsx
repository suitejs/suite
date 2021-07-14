import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import remove from 'lodash/remove';
import Transition from '../Animation/Transition';
import shallowEqual from '../utils/shallowEqual';
import SidenavBody from './SidenavBody';
import SidenavHeader from './SidenavHeader';
import SidenavToggle from './SidenavToggle';
import { useClassNames, useControlled, mergeRefs } from '../utils';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';

export interface SidenavProps<T = string> extends WithAsProps {
  /** Whether to expand the Sidenav */
  expanded?: boolean;

  /** Menu style */
  appearance?: 'default' | 'inverse' | 'subtle';

  /** Open menu, corresponding to Dropdown eventkey */
  defaultOpenKeys?: T[];

  /** Open menu, corresponding to Dropdown eventkey (controlled) */
  openKeys?: T[];

  /** Activation option, corresponding menu eventkey */
  activeKey?: T;

  /** Menu opening callback function that changed */
  onOpenChange?: (openKeys: T[], event: React.SyntheticEvent) => void;

  /** Select the callback function for the menu */
  onSelect?: (eventKey: T, event: React.SyntheticEvent) => void;
}

export const SidenavContext = React.createContext<SidenavContextType>(null);

export interface SidenavContextType<T = string> {
  openKeys: T[];
  activeKey: T;
  sidenav: boolean;
  expanded: boolean;
  onOpenChange: (eventKey: T, event: React.SyntheticEvent) => void;
  onSelect?: (eventKey: T, event: React.SyntheticEvent) => void;
}

export interface SidenavComponent extends RsRefForwardingComponent<'div', SidenavProps> {
  Header: typeof SidenavHeader;
  Body: typeof SidenavBody;
  Toggle: typeof SidenavToggle;
}

const defaultProps: Partial<SidenavProps> = {
  as: 'nav',
  classPrefix: 'sidenav',
  appearance: 'default',
  expanded: true
};

const Sidenav: SidenavComponent = (React.forwardRef((props: SidenavProps, ref) => {
  const {
    as: Component,
    className,
    classPrefix,
    appearance,
    expanded,
    activeKey,
    defaultOpenKeys,
    openKeys: openKeysProp,
    onSelect,
    onOpenChange,
    ...rest
  } = props;

  const [openKeys, setOpenKeys] = useControlled(openKeysProp, defaultOpenKeys);
  const { prefix, merge, withClassPrefix } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix(appearance));

  const handleOpenChange = useCallback(
    (eventKey: any, event: React.MouseEvent) => {
      const find = key => shallowEqual(key, eventKey);
      const nextOpenKeys = [...openKeys];

      if (nextOpenKeys.some(find)) {
        remove(nextOpenKeys, find);
      } else {
        nextOpenKeys.push(eventKey);
      }

      setOpenKeys(nextOpenKeys);
      onOpenChange?.(nextOpenKeys, event);
    },
    [onOpenChange, openKeys, setOpenKeys]
  );

  const contextValue = useMemo<SidenavContextType>(
    () => ({
      expanded,
      activeKey,
      sidenav: true,
      openKeys: openKeys ?? [],
      onOpenChange: handleOpenChange,
      onSelect
    }),
    [activeKey, expanded, handleOpenChange, onSelect, openKeys]
  );

  return (
    <SidenavContext.Provider value={contextValue}>
      <Transition
        in={expanded}
        timeout={300}
        exitedClassName={prefix('collapse-out')}
        exitingClassName={prefix('collapse-out', 'collapsing')}
        enteredClassName={prefix('collapse-in')}
        enteringClassName={prefix('collapse-in', 'collapsing')}
      >
        {(transitionProps, transitionRef) => {
          const { className, ...transitionRest } = transitionProps;
          return (
            <Component
              {...rest}
              {...transitionRest}
              ref={mergeRefs(ref, transitionRef)}
              className={merge(classes, className)}
            />
          );
        }}
      </Transition>
    </SidenavContext.Provider>
  );
}) as unknown) as SidenavComponent;

Sidenav.Header = SidenavHeader;
Sidenav.Body = SidenavBody;
Sidenav.Toggle = SidenavToggle;

Sidenav.displayName = 'Sidenav';
Sidenav.defaultProps = defaultProps;
Sidenav.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  appearance: PropTypes.oneOf(['default', 'inverse', 'subtle']),
  defaultOpenKeys: PropTypes.array,
  openKeys: PropTypes.array,
  onOpenChange: PropTypes.func,
  activeKey: PropTypes.any,
  onSelect: PropTypes.func
};

export default Sidenav;
