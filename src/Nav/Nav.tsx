import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import NavItem from './NavItem';
import Dropdown from '../Dropdown';
import { useClassNames } from '../utils';
import { NavbarContext } from '../Navbar/Navbar';
import { SidenavContext } from '../Sidenav/Sidenav';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
import NavContext from './NavContext';
import useEnsuredRef from '../utils/useEnsuredRef';
import Menubar from '../Menu/Menubar';

export interface NavProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** sets appearance */
  appearance?: 'default' | 'subtle' | 'tabs';

  /** Reverse Direction of tabs/subtle */
  reversed?: boolean;

  /** Justified navigation */
  justified?: boolean;

  /** Vertical navigation */
  vertical?: boolean;

  /** appears on the right. */
  pullRight?: boolean;

  /** Active key, corresponding to eventkey in <Nav.item>. */
  activeKey?: T;

  /** Callback function triggered after selection */
  onSelect?: (eventKey: T, event: React.SyntheticEvent) => void;
}

const defaultProps: Partial<NavProps> = {
  classPrefix: 'nav',
  appearance: 'default',
  as: 'div'
};

interface NavComponent extends RsRefForwardingComponent<'div', NavProps> {
  Dropdown: typeof Dropdown;
  Item: typeof NavItem;
}

const Nav: NavComponent = (React.forwardRef((props: NavProps, ref: React.Ref<HTMLElement>) => {
  const {
    as: Component,
    classPrefix,
    appearance,
    vertical,
    justified,
    reversed,
    pullRight,
    className,
    children,
    activeKey: activeKeyProp,
    onSelect: onSelectProp,
    ...rest
  } = props;

  const sidenav = useContext(SidenavContext);

  // Whether inside a <Navbar>
  const navbar = useContext(NavbarContext);

  const menubarRef = useEnsuredRef(ref);

  const { withClassPrefix, merge, rootPrefix, prefix } = useClassNames(classPrefix);

  const classes = merge(
    className,
    rootPrefix({
      'navbar-nav': navbar,
      'navbar-right': pullRight,
      'sidenav-nav': sidenav
    }),
    withClassPrefix(appearance, {
      horizontal: navbar || (!vertical && !sidenav),
      vertical: vertical || sidenav,
      justified,
      reversed
    })
  );

  if (sidenav?.expanded) {
    return (
      <ul ref={ref as any} className={classes} {...rest}>
        {children}
      </ul>
    );
  }

  const { activeKey: activeKeyFromSidenav, onSelect: onSelectFromSidenav = onSelectProp } =
    sidenav || {};

  const activeKey = activeKeyProp ?? activeKeyFromSidenav;

  const hasWaterline = appearance !== 'default';

  // If inside a collapsed <Sidenav>, render an ARIA `menubar` (vertical)
  if (sidenav) {
    return (
      <NavContext.Provider
        value={{
          activeKey,
          onSelect: onSelectProp ?? onSelectFromSidenav
        }}
      >
        <Menubar vertical={!!sidenav}>
          {(menubar, ref) => (
            <Component ref={ref} {...rest} className={classes} {...menubar}>
              {children}
            </Component>
          )}
        </Menubar>
      </NavContext.Provider>
    );
  }
  return (
    <NavContext.Provider
      value={{
        activeKey,
        onSelect: onSelectProp ?? onSelectFromSidenav
      }}
    >
      <Component {...rest} ref={menubarRef} className={classes}>
        {children}
        {hasWaterline && <div className={prefix('bar')} />}
      </Component>
    </NavContext.Provider>
  );
}) as unknown) as NavComponent;

Nav.Dropdown = Dropdown;
Nav.Item = NavItem;

Nav.displayName = 'Nav';
Nav.defaultProps = defaultProps;
Nav.propTypes = {
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  appearance: PropTypes.oneOf(['default', 'subtle', 'tabs']),
  // Reverse Direction of tabs/subtle
  reversed: PropTypes.bool,
  justified: PropTypes.bool,
  vertical: PropTypes.bool,
  pullRight: PropTypes.bool,
  activeKey: PropTypes.any,
  onSelect: PropTypes.func
};

export default Nav;
