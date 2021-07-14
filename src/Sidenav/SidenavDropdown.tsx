import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import kebabCase from 'lodash/kebabCase';
import omit from 'lodash/omit';
import DropdownToggle from '../Dropdown/DropdownToggle';
import { useClassNames, placementPolyfill, PLACEMENT_8, mergeRefs } from '../utils';
import { SidenavContext } from './Sidenav';
import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { IconProps } from '@rsuite/icons/lib/Icon';
import deprecatePropType from '../utils/deprecatePropType';
import SidenavDropdownCollapse from './SidenavDropdownCollapse';
import Disclosure from '../Disclosure/Disclosure';

export interface SidenavDropdownProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Define the title as a submenu */
  title?: React.ReactNode;

  /** Set the icon */
  icon?: React.ReactElement<IconProps>;

  /** The option to activate the state, corresponding to the eventkey in the Dropdown.item */
  activeKey?: T;

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
}

const defaultProps: Partial<SidenavDropdownProps> = {
  as: 'div',
  classPrefix: 'dropdown',
  placement: 'bottomStart'
};

const SidenavDropdown: RsRefForwardingComponent<'li', SidenavDropdownProps> = React.forwardRef<
  HTMLLIElement,
  SidenavDropdownProps
>((props: SidenavDropdownProps, ref) => {
  const {
    as: Component,
    title,
    children,
    className,
    menuStyle,
    disabled,
    renderTitle,
    classPrefix,
    placement,
    toggleClassName,
    icon,
    eventKey,
    toggleAs,
    noCaret,
    style,
    onOpen,
    onClose,
    open: openProp,
    onToggle,
    ...rest
  } = props;

  const { openKeys = [], onOpenChange } = useContext(SidenavContext);

  const { merge, withClassPrefix } = useClassNames(classPrefix);

  const handleToggleDisclosure = useCallback(
    (open: boolean, event: React.SyntheticEvent<HTMLElement>) => {
      if (open) {
        onClose?.();
      } else {
        onOpen?.();
      }

      onToggle?.(open);

      if (isNil(eventKey)) return;

      onOpenChange?.(eventKey, event);
    },
    [onClose, onOpen, onToggle, eventKey, onOpenChange]
  );

  return (
    <Disclosure
      open={openProp ?? (!isNil(eventKey) && openKeys.includes(eventKey))}
      onToggle={handleToggleDisclosure}
    >
      {({ open }, containerRef) => {
        const classes = merge(
          className,
          withClassPrefix({
            [`placement-${kebabCase(placementPolyfill(placement))}`]: placement,
            [open ? 'expand' : 'collapse']: true,
            disabled,
            // open,
            'no-caret': noCaret
          })
        );

        return (
          <Component
            ref={mergeRefs(ref, containerRef)}
            style={style}
            className={classes}
            {...rest}
            data-event-key={eventKey}
          >
            <Disclosure.Button>
              {(buttonProps, buttonRef) => (
                <DropdownToggle
                  ref={buttonRef}
                  as={renderTitle ? 'span' : toggleAs}
                  noCaret={noCaret}
                  className={toggleClassName}
                  renderTitle={renderTitle}
                  icon={icon}
                  placement={placement}
                  {...omit(buttonProps, ['open'])}
                >
                  {title}
                </DropdownToggle>
              )}
            </Disclosure.Button>
            <Disclosure.Content>
              {({ open }) => (
                <SidenavDropdownCollapse open={open} style={menuStyle}>
                  {children}
                </SidenavDropdownCollapse>
              )}
            </Disclosure.Content>
          </Component>
        );
      }}
    </Disclosure>
  );
});

SidenavDropdown.displayName = 'Sidenav.Dropdown';
SidenavDropdown.defaultProps = defaultProps;
SidenavDropdown.propTypes = {
  activeKey: PropTypes.any,
  classPrefix: PropTypes.string,
  placement: PropTypes.oneOf(PLACEMENT_8),
  title: PropTypes.node,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  menuStyle: PropTypes.object,
  className: PropTypes.string,
  toggleClassName: PropTypes.string,
  children: PropTypes.node,
  tabIndex: PropTypes.number,
  open: deprecatePropType(PropTypes.bool),
  eventKey: PropTypes.any,
  as: PropTypes.elementType,
  toggleAs: PropTypes.elementType,
  noCaret: PropTypes.bool,
  style: PropTypes.object,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  onToggle: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onContextMenu: PropTypes.func,
  onClick: PropTypes.func,
  renderTitle: PropTypes.func
};

export default SidenavDropdown;
