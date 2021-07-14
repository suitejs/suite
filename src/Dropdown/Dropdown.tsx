import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import DropdownMenu from './DropdownMenu';
import { mergeRefs, PLACEMENT_8, placementPolyfill, useClassNames } from '../utils';
import { SidenavContext, SidenavContextType } from '../Sidenav/Sidenav';
import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { IconProps } from '@rsuite/icons/lib/Icon';
import deprecatePropType from '../utils/deprecatePropType';
import DropdownItem from './DropdownItem';
import DropdownContext from './DropdownContext';
import Menu, { MenuButtonTrigger } from '../Menu/Menu';
import DropdownToggle from './DropdownToggle';
import MenuContext from '../Menu/MenuContext';
import MenuItem from '../Menu/MenuItem';
import kebabCase from 'lodash/kebabCase';
import { NavbarContext } from '../Navbar/Navbar';
import Disclosure from '../Disclosure/Disclosure';
import SidenavDropdown from '../Sidenav/SidenavDropdown';

export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';
export interface DropdownProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'onSelect' | 'title'> {
  /** Define the title as a submenu */
  title?: React.ReactNode;

  /** Set the icon */
  icon?: React.ReactElement<IconProps>;

  /** The option to activate the state, corresponding to the eventkey in the Dropdown.item */
  activeKey?: T;

  /** Triggering events */
  trigger?: DropdownTrigger | DropdownTrigger[];

  /** The placement of Menu */
  placement?: TypeAttributes.Placement8;

  /** Whether or not component is disabled */
  disabled?: boolean;

  /** The style of the menu */
  menuStyle?: React.CSSProperties;

  /** A css class to apply to the Toggle DOM node */
  toggleClassName?: string;

  /** The value of the current option */
  eventKey?: T;

  /** You can use a custom element type for this toggle component */
  toggleAs?: React.ElementType;

  /** No caret variation */
  noCaret?: boolean;

  /**
   * Open the menu and control it
   * @deprecated
   */
  open?: boolean;

  /** Custom title */
  renderTitle?: (children?: React.ReactNode) => React.ReactNode;

  /** The callback function that the menu closes */
  onClose?: () => void;

  /** Menu Pop-up callback function */
  onOpen?: () => void;

  /** Callback function for menu state switching */
  onToggle?: (open?: boolean) => void;

  /** Selected callback function */
  onSelect?: (eventKey: T, event: React.MouseEvent<HTMLElement>) => void;
}

export interface DropdownComponent extends RsRefForwardingComponent<'div', DropdownProps> {
  Item: typeof DropdownItem;
  Menu: typeof DropdownMenu;
}

const defaultProps: Partial<DropdownProps> = {
  as: 'div',
  classPrefix: 'dropdown',
  placement: 'bottomStart',
  trigger: 'click'
};

/**
 * The <Dropdown> API
 * When used inside <Sidenav>, renders a <TreeviewRootItem>;
 * Otherwise renders a <MenuRoot>
 */
const Dropdown: DropdownComponent = (React.forwardRef((props: DropdownProps, ref) => {
  const { activeKey, onSelect, ...rest } = props;

  const {
    as: Component,
    title,
    onClose,
    onOpen,
    onToggle,
    eventKey,
    trigger,
    placement,
    renderTitle,
    toggleAs,
    toggleClassName,
    classPrefix,
    className,
    disabled,
    children,
    menuStyle,
    style,
    ...menuProps
  } = rest;

  const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);

  const { withClassPrefix: withMenuClassPrefix, merge: mergeMenuClassName } = useClassNames(
    'dropdown-menu'
  );

  const { withClassPrefix: withNavItemClassPrefix, merge: mergeNavItemClassNames } = useClassNames(
    'nav-item'
  );

  const menuButtonTriggers = useMemo<MenuButtonTrigger[] | undefined>(() => {
    if (!trigger) {
      return undefined;
    }

    const triggerMap: { [key: string]: MenuButtonTrigger } = {
      hover: 'mouseover',
      click: 'click',
      contextMenu: 'contextmenu'
    };

    if (!Array.isArray(trigger)) {
      return [triggerMap[trigger]];
    }

    return trigger.map(t => triggerMap[t]);
  }, [trigger]);

  const parentMenu = useContext(MenuContext);

  const sidenav = useContext<SidenavContextType>(SidenavContext);
  const navbar = useContext(NavbarContext);

  // Render a disclosure when inside expanded <Sidenav>
  if (sidenav?.expanded) {
    return (
      <DropdownContext.Provider value={{ activeKey, onSelect }}>
        <SidenavDropdown ref={ref} {...rest} />
      </DropdownContext.Provider>
    );
  }

  // Renders a disclosure when used inside <Navbar>
  if (navbar) {
    return (
      <Disclosure hideOnClickOutside>
        {({ open }, containerRef) => {
          const classes = merge(
            className,
            withClassPrefix({
              [`placement-${kebabCase(placementPolyfill(placement))}`]: !!placement,
              disabled,
              open
              // focus: hasFocus
            })
          );
          return (
            <Component ref={mergeRefs(ref, containerRef)} className={classes} style={style}>
              <Disclosure.Button>
                {(buttonProps, buttonRef) => (
                  <DropdownToggle
                    ref={buttonRef}
                    as={renderTitle ? 'span' : toggleAs}
                    className={toggleClassName}
                    placement={placement}
                    disabled={disabled}
                    {...omit(buttonProps, ['open'])}
                    {...menuProps}
                  >
                    {title}
                  </DropdownToggle>
                )}
              </Disclosure.Button>
              <Disclosure.Content>
                {({ open }, elementRef) => {
                  const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
                  return (
                    <ul
                      ref={elementRef as any}
                      className={menuClassName}
                      style={menuStyle}
                      hidden={!open}
                    >
                      {children}
                    </ul>
                  );
                }}
              </Disclosure.Content>
            </Component>
          );
        }}
      </Disclosure>
    );
  }

  let renderMenuButton = (menuButtonProps, menuButtonRef) => (
    <DropdownToggle
      ref={menuButtonRef}
      as={renderTitle ? 'span' : toggleAs}
      className={toggleClassName}
      placement={placement}
      disabled={disabled}
      {...omit(menuButtonProps, ['open'])}
      {...menuProps}
    >
      {title}
    </DropdownToggle>
  );

  if (parentMenu) {
    renderMenuButton = (menuButtonProps, buttonRef) => (
      <MenuItem disabled={disabled}>
        {({ active, ...menuitemProps }, menuitemRef) => {
          return (
            <DropdownToggle
              ref={mergeRefs(buttonRef, menuitemRef)}
              as={renderTitle ? 'span' : toggleAs}
              className={mergeNavItemClassNames(
                toggleClassName,
                withNavItemClassPrefix({
                  focus: active
                })
              )}
              {...menuButtonProps}
              {...omit(menuitemProps, ['onClick'])}
              {...menuProps}
            >
              {title}
            </DropdownToggle>
          );
        }}
      </MenuItem>
    );
  }

  return (
    <DropdownContext.Provider value={{ activeKey, onSelect }}>
      <Menu
        menuButtonText={title}
        renderMenuButton={renderMenuButton}
        openMenuOn={menuButtonTriggers}
        renderMenuPopup={({ open, ...popupProps }, popupRef) => {
          const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
          // When inside a collapsed <Sidenav>, render a header in menu
          const showHeader = !!sidenav;

          return (
            <ul
              ref={popupRef}
              className={menuClassName}
              style={menuStyle}
              hidden={!open}
              {...popupProps}
            >
              {showHeader && <div className={prefix('header')}>{title}</div>}
              {children}
            </ul>
          );
        }}
        onToggleMenu={(open, event) => {
          onToggle?.(open);
          sidenav?.onOpenChange(eventKey, event);
          if (open) {
            onOpen?.();
          } else {
            onClose?.();
          }
        }}
      >
        {({ open, ...menuContainer }, menuContainerRef) => {
          const classes = merge(
            className,
            withClassPrefix({
              [`placement-${kebabCase(placementPolyfill(placement))}`]: !!placement,
              disabled,
              open,
              submenu: !!parentMenu
              // focus: hasFocus
            })
          );
          return (
            <Component
              ref={mergeRefs(ref, menuContainerRef)}
              className={classes}
              {...menuContainer}
              style={style}
            />
          );
        }}
      </Menu>
    </DropdownContext.Provider>
  );
}) as unknown) as DropdownComponent;

Dropdown.Item = DropdownItem;
Dropdown.Menu = DropdownMenu;

Dropdown.displayName = 'Dropdown';
Dropdown.defaultProps = defaultProps;
Dropdown.propTypes = {
  activeKey: PropTypes.any,
  classPrefix: PropTypes.string,
  trigger: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.oneOf(['click', 'hover', 'contextMenu'])
  ]),
  placement: PropTypes.oneOf(PLACEMENT_8),
  title: PropTypes.node,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  menuStyle: PropTypes.object,
  className: PropTypes.string,
  toggleClassName: PropTypes.string,
  children: PropTypes.node,
  open: deprecatePropType(PropTypes.bool),
  eventKey: PropTypes.any,
  as: PropTypes.elementType,
  toggleAs: PropTypes.elementType,
  noCaret: PropTypes.bool,
  style: PropTypes.object,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  onToggle: PropTypes.func,
  onSelect: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onContextMenu: PropTypes.func,
  onClick: PropTypes.func,
  renderTitle: PropTypes.func
};

export default Dropdown;
