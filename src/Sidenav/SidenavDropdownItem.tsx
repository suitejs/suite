import React, { useCallback, useContext } from 'react';
import isNil from 'lodash/isNil';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { createChainedFunction, shallowEqual, useClassNames } from '../utils';
import { SidenavContext } from './Sidenav';
import PropTypes from 'prop-types';
import { IconProps } from '@rsuite/icons/lib/Icon';
import Ripple from '../Ripple';

export interface SidenavDropdownItemProps<T = any>
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

  /** Whether the submenu is expanded, used in Sidenav. */
  expanded?: boolean;

  /** Select the callback function for the current option  */
  onSelect?: (eventKey: T, event: React.SyntheticEvent<HTMLElement>) => void;
}

const defaultProps: Partial<SidenavDropdownItemProps> = {
  as: 'li',
  classPrefix: 'dropdown-item'
};

/**
 * Tree View Node
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
const SidenavDropdownItem: RsRefForwardingComponent<
  'li',
  SidenavDropdownItemProps
> = React.forwardRef<HTMLLIElement, SidenavDropdownItemProps>((props, ref) => {
  const {
    as: Component,
    active: activeProp,
    children,
    disabled,
    divider,
    panel,
    className,
    style,
    classPrefix,
    icon,
    eventKey,
    onClick,
    onSelect,
    ...rest
  } = props;

  const { activeKey, onSelect: onSidenavSelect } = useContext(SidenavContext);

  const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);

  const selected = activeProp ?? (!isNil(eventKey) && shallowEqual(eventKey, activeKey));

  const classes = merge(
    className,
    withClassPrefix({
      'with-icon': icon,
      active: selected,
      disabled
    })
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      if (disabled) return;

      onSelect?.(eventKey, event);
      onSidenavSelect?.(eventKey, event);
    },
    [disabled, onSelect, onSidenavSelect, eventKey]
  );

  const menuitemEventHandlers: React.HTMLAttributes<HTMLElement> = {
    onClick: createChainedFunction(handleClick, onClick)
  };

  if (divider) {
    return (
      <Component
        ref={ref}
        role="separator"
        style={style}
        className={merge(prefix('divider'), className)}
        {...rest}
      />
    );
  }

  if (panel) {
    return (
      <Component
        ref={ref}
        role="none presentation"
        style={style}
        className={merge(prefix('panel'), className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  return (
    <a
      ref={ref as any}
      href="#"
      {...rest}
      style={style}
      className={classes}
      aria-selected={selected || undefined}
      {...menuitemEventHandlers}
    >
      {icon && React.cloneElement(icon, { className: prefix('menu-icon') })}
      {children}
      <Ripple />
    </a>
  );
});

SidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
SidenavDropdownItem.defaultProps = defaultProps;
SidenavDropdownItem.propTypes = {
  as: PropTypes.elementType,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  divider: PropTypes.bool,
  panel: PropTypes.bool,
  disabled: PropTypes.bool,
  submenu: PropTypes.element,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  eventKey: PropTypes.any,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number,
  title: PropTypes.node,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func
};

export default SidenavDropdownItem;
