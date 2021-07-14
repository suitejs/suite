import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import Ripple from '../Ripple';
import SafeAnchor from '../SafeAnchor';
import { appendTooltip, mergeRefs, shallowEqual, useClassNames } from '../utils';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { IconProps } from '@rsuite/icons/lib/Icon';
import { SidenavContext } from '../Sidenav/Sidenav';
import NavContext from './NavContext';
import { NavbarContext } from '../Navbar/Navbar';
import MenuItem from '../Menu/MenuItem';
import SidenavItem from '../Sidenav/SidenavItem';

export interface NavItemProps<T = string>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Activation status */
  active?: boolean;

  /** Disabled status */
  disabled?: boolean;

  /** divier for nav item */
  divider?: boolean;

  /** display panel */
  panel?: boolean;

  /** Sets the icon for the component */
  icon?: React.ReactElement<IconProps>;

  /** The value of the current option */
  eventKey?: T;

  /** Providing a `href` will render an `<a>` element */
  href?: string;

  /** Select the callback function that the event triggers. */
  onSelect?: (eventKey: T, event: React.SyntheticEvent) => void;
}

const defaultProps: Partial<NavItemProps> = {
  classPrefix: 'nav-item',
  as: SafeAnchor
};

/**
 * The <Nav.Item> API
 */
const NavItem: RsRefForwardingComponent<'a', NavItemProps> = React.forwardRef(
  (props: NavItemProps, ref: React.Ref<any>) => {
    const {
      as: Component,
      active: activeProp,
      disabled,
      eventKey,
      className,
      classPrefix,
      style,
      children,
      icon,
      divider,
      panel,
      onClick,
      onSelect,
      ...rest
    } = props;

    const { activeKey } = useContext(NavContext);

    const active = activeProp ?? (!isNil(eventKey) && shallowEqual(eventKey, activeKey));

    const navbar = useContext(NavbarContext);
    const sidenav = useContext(SidenavContext);

    const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix({ active, disabled }));

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (!disabled) {
          onSelect?.(eventKey, event);
          onClick?.(event);
        }
      },
      [disabled, onSelect, eventKey, onClick]
    );

    if (sidenav?.expanded) {
      return <SidenavItem {...props} />;
    }

    // If <Nav.Item> is inside collapsed <Sidenav>, render an ARIA `menuitem`
    if (sidenav) {
      return (
        <MenuItem selected={active} disabled={disabled} onActivate={e => onSelect?.(eventKey, e)}>
          {({ selected, active, ...menuitem }, menuitemRef) => {
            const classes = merge(
              className,
              withClassPrefix({ focus: active, active: selected, disabled })
            );

            const item = (
              <Component
                ref={mergeRefs(ref, menuitemRef)}
                disabled={Component === SafeAnchor ? disabled : undefined}
                className={classes}
                data-event-key={eventKey}
                {...menuitem}
                {...omit(rest, ['divider', 'panel'])}
              >
                {icon}
                {children}
                <Ripple />
              </Component>
            );

            // Show tooltip when inside a collapse <Sidenav>
            return sidenav
              ? appendTooltip({
                  children: (triggerProps, triggerRef) => {
                    return (
                      <Component
                        ref={mergeRefs(mergeRefs(ref, menuitemRef), triggerRef as any)}
                        disabled={Component === SafeAnchor ? disabled : undefined}
                        className={classes}
                        data-event-key={eventKey}
                        {...menuitem}
                        {...omit(rest, ['divider', 'panel'])}
                        {...triggerProps}
                      >
                        {icon}
                        {children}
                        <Ripple />
                      </Component>
                    );
                  },
                  message: children,
                  placement: 'right'
                })
              : item;
          }}
        </MenuItem>
      );
    }

    if (divider) {
      return (
        <div
          ref={ref}
          role="separator"
          style={style}
          className={merge(className, prefix('divider'))}
          {...rest}
        />
      );
    }

    if (panel) {
      return (
        <div ref={ref} style={style} className={merge(className, prefix('panel'))} {...rest}>
          {children}
        </div>
      );
    }

    if (navbar) {
      return (
        <a
          ref={ref}
          href="#"
          aria-selected={active || undefined}
          {...rest}
          className={classes}
          onClick={handleClick}
          style={style}
        >
          {icon}
          {children}
          <Ripple />
        </a>
      );
    }

    return (
      <a
        ref={ref}
        href="#"
        tabIndex={disabled ? -1 : undefined}
        {...rest}
        className={classes}
        onClick={handleClick}
        style={style}
        aria-selected={active || undefined}
      >
        {icon}
        {children}
        <Ripple />
      </a>
    );
  }
);

NavItem.defaultProps = defaultProps;
NavItem.displayName = 'Nav.Item';
NavItem.propTypes = {
  as: PropTypes.elementType,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  divider: PropTypes.bool,
  panel: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  icon: PropTypes.node,
  onSelect: PropTypes.func,
  children: PropTypes.node,
  eventKey: PropTypes.any
};

export default NavItem;
