import React, { useCallback, useContext } from 'react';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
import { createChainedFunction, useClassNames } from '../utils';
import { SidenavContext } from './Sidenav';
import useCustom from '../utils/useCustom';
import AngleLeft from '@rsuite/icons/legacy/AngleLeft';
import AngleRight from '@rsuite/icons/legacy/AngleRight';
import PropTypes from 'prop-types';
import { IconProps } from '@rsuite/icons/lib/Icon';
import SidenavDropdownCollapse from './SidenavDropdownCollapse';
import Ripple from '../Ripple';
import Disclosure from '../Disclosure/Disclosure';

export interface SidenavDropdownMenuProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'title' | 'onSelect'> {
  /** Primary content */
  children?: React.ReactNode;

  /** You can use a custom element for this component */
  as?: React.ElementType;

  /** Disable the current option */
  disabled?: boolean;

  /** The value of the current option */
  eventKey?: T;

  /** Set the icon */
  icon?: React.ReactElement<IconProps>;

  /** Whether the submenu is expanded, used in Sidenav. */
  expanded?: boolean;

  /** Select the callback function for the current option  */
  onSelect?: (eventKey: T, event: React.SyntheticEvent<HTMLElement>) => void;

  title?: React.ReactNode;
}

const defaultProps: Partial<SidenavDropdownMenuProps> = {
  as: 'li',
  classPrefix: 'dropdown-item'
};

/**
 * Tree View Node
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
const SidenavDropdownMenu: RsRefForwardingComponent<
  'li',
  SidenavDropdownMenuProps
> = React.forwardRef<HTMLLIElement, SidenavDropdownMenuProps>((props, ref) => {
  const {
    as: Component,
    children,
    disabled,
    className,
    style,
    classPrefix,
    tabIndex,
    icon,
    title,
    eventKey,
    onClick,
    onSelect,
    ...rest
  } = props;

  const { rtl } = useCustom('DropdownMenu');

  const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);
  const { openKeys = [], onOpenChange, onSelect: onSidenavSelect } = useContext(SidenavContext);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onSelect?.(eventKey, event);
      onSidenavSelect?.(eventKey, event);
    },
    [disabled, onSelect, onSidenavSelect, eventKey]
  );

  const menuitemEventHandlers: React.LiHTMLAttributes<HTMLLIElement> = {
    onClick: createChainedFunction(handleClick, onClick)
  };

  const Icon = rtl ? AngleLeft : AngleRight;

  return (
    <Disclosure
      open={!isNil(eventKey) && openKeys.includes(eventKey)}
      onToggle={(_, event) => onOpenChange?.(eventKey, event)}
    >
      {({ open }) => {
        const classes = merge(
          className,
          prefix('submenu'),
          prefix(`pull-${rtl ? 'left' : 'right'}`),
          prefix(open ? 'expand' : 'collapse'),
          withClassPrefix({
            'with-icon': icon,
            // open,
            disabled
          })
        );
        return (
          <Component
            ref={ref}
            {...rest}
            tabIndex={disabled ? -1 : tabIndex}
            style={style}
            className={classes}
            {...menuitemEventHandlers}
          >
            <Disclosure.Button>
              {buttonProps => {
                return (
                  <button
                    className={prefix`toggle`}
                    onClick={handleClick}
                    {...omit(buttonProps, ['open'])}
                  >
                    {icon && React.cloneElement(icon, { className: prefix('menu-icon') })}
                    {title}
                    <Icon className={prefix`toggle-icon`} />
                    <Ripple />
                  </button>
                );
              }}
            </Disclosure.Button>
            <Disclosure.Content>
              {({ open }) => {
                return <SidenavDropdownCollapse open={open}>{children}</SidenavDropdownCollapse>;
              }}
            </Disclosure.Content>
          </Component>
        );
      }}
    </Disclosure>
  );
});

SidenavDropdownMenu.displayName = 'Sidenav.Dropdown.Menu';
SidenavDropdownMenu.defaultProps = defaultProps;
SidenavDropdownMenu.propTypes = {
  as: PropTypes.elementType,
  expanded: PropTypes.bool,
  disabled: PropTypes.bool,
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

export default SidenavDropdownMenu;
