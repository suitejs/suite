import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { IconProps } from '@rsuite/icons/lib/Icon';
import { SidenavContext } from '../Sidenav/Sidenav';
import deprecatePropType from '../utils/deprecatePropType';
import MenuItem from '../Menu/MenuItem';
import DropdownContext from './DropdownContext';
import isNil from 'lodash/isNil';
import { mergeRefs, shallowEqual, useClassNames } from '../utils';
import { NavbarContext } from '../Navbar/Navbar';
import SidenavDropdownItem from '../Sidenav/SidenavDropdownItem';

export interface DropdownMenuItemProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Active the current option */
  active?: boolean;

  /** Primary content */
  children?: React.ReactNode;

  /** You can use a custom element for this component */
  as?: React.ElementType;

  /** Whether to display the divider */
  divider?: boolean;

  /** Disable the current option */
  disabled?: boolean;

  /** The value of the current option */
  eventKey?: T;

  /** Displays a custom panel */
  panel?: boolean;

  /** Set the icon */
  icon?: React.ReactElement<IconProps>;

  /** The submenu that this menuitem controls (if exists) */
  submenu?: React.ReactElement;

  /**
   * The sub-level menu appears from the right side by default, and when `pullLeft` is set, it appears from the left.
   * @deprecated Submenus are now pointing the same direction.
   */
  pullLeft?: boolean;

  /**
   * Whether the submenu is opened.
   * @deprecated
   * @internal
   */
  open?: boolean;

  /** Select the callback function for the current option  */
  onSelect?: (eventKey: T, event: React.SyntheticEvent<HTMLElement>) => void;
}

const defaultProps: Partial<DropdownMenuItemProps> = {
  as: 'li',
  classPrefix: 'dropdown-item'
};

/**
 * The <Dropdown.Item> API
 * When used inside <Sidenav>, renders a <TreeviewItem>
 * Otherwise renders a <MenuItem>
 */
const DropdownItem: RsRefForwardingComponent<'li', DropdownMenuItemProps> = React.forwardRef(
  (props: DropdownMenuItemProps, ref: React.Ref<any>) => {
    const { classPrefix, className, active: activeProp, eventKey, onSelect, icon, ...rest } = props;

    const dropdown = useContext(DropdownContext);
    const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);

    const handleSelectItem = useCallback(
      (event: React.SyntheticEvent<HTMLElement>) => {
        onSelect?.(eventKey, event);
        dropdown?.onSelect?.(eventKey, event);
      },
      [onSelect, eventKey, dropdown]
    );

    const sidenav = useContext(SidenavContext);
    const navbar = useContext(NavbarContext);

    if (sidenav?.expanded) {
      return <SidenavDropdownItem ref={ref} {...props} />;
    }

    const menuitemSelected =
      activeProp || (!isNil(eventKey) && shallowEqual(dropdown?.activeKey, eventKey));

    const { as: Component, divider, panel, children, disabled, ...restProps } = rest;

    if (divider) {
      return (
        <Component
          ref={ref}
          role="separator"
          className={merge(prefix('divider'), className)}
          {...restProps}
        />
      );
    }

    if (panel) {
      return (
        <Component
          ref={ref}
          role="none presentation"
          className={merge(prefix('panel'), className)}
          {...restProps}
        >
          {children}
        </Component>
      );
    }

    if (navbar) {
      const classes = merge(
        className,
        withClassPrefix({
          'with-icon': icon,
          disabled,
          divider,
          panel
        })
      );
      const dataAttributes: { [key: string]: any } = {
        'data-event-key': eventKey
      };

      if (!isNil(eventKey) && typeof eventKey !== 'string') {
        dataAttributes['data-event-key-type'] = typeof eventKey;
      }
      return (
        <li>
          <a ref={ref} href="#" className={classes} {...dataAttributes} {...restProps}>
            {icon && React.cloneElement(icon, { className: prefix('menu-icon') })}
            {children}
          </a>
        </li>
      );
    }

    return (
      <MenuItem selected={menuitemSelected} disabled={disabled} onActivate={handleSelectItem}>
        {({ selected, active, ...menuitem }, menuitemRef) => {
          const classes = merge(
            className,
            withClassPrefix({
              'with-icon': icon,
              active: selected,
              disabled,
              focus: active,
              divider,
              panel
            })
          );

          const dataAttributes: { [key: string]: any } = {
            'data-event-key': eventKey
          };

          if (!isNil(eventKey) && typeof eventKey !== 'string') {
            dataAttributes['data-event-key-type'] = typeof eventKey;
          }
          return (
            <Component
              ref={mergeRefs(ref, menuitemRef)}
              className={classes}
              {...menuitem}
              {...dataAttributes}
              {...restProps}
            >
              {icon && React.cloneElement(icon, { className: prefix('menu-icon') })}
              {children}
            </Component>
          );
        }}
      </MenuItem>
    );
  }
);

DropdownItem.displayName = 'Dropdown.Item';
DropdownItem.defaultProps = defaultProps;
DropdownItem.propTypes = {
  as: PropTypes.elementType,
  divider: PropTypes.bool,
  panel: PropTypes.bool,
  trigger: PropTypes.oneOfType([PropTypes.array, PropTypes.oneOf(['click', 'hover'])]),
  open: deprecatePropType(PropTypes.bool),
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  pullLeft: deprecatePropType(PropTypes.bool),
  submenu: PropTypes.element,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  eventKey: PropTypes.any,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number
};

export default DropdownItem;
