import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { useClassNames, shallowEqual } from '../utils';
import { SidenavContext } from './Sidenav';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { IconProps } from '@rsuite/icons/lib/Icon';
import Ripple from '../Ripple';

export interface SidenavItemProps<T = any>
  extends WithAsProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Activation status */
  active?: boolean;

  /** Set the icon */
  icon?: React.ReactElement<IconProps>;

  /** Whether or not component is disabled */
  disabled?: boolean;

  /** The value of the current option */
  eventKey?: T;

  /** Selected callback function */
  onSelect?: (eventKey: T, event: React.MouseEvent<HTMLElement>) => void;

  divider?: boolean;

  panel?: boolean;
}

const defaultProps: Partial<SidenavItemProps> = {
  as: 'div',
  classPrefix: 'dropdown'
};

const SidenavItem: RsRefForwardingComponent<'li', SidenavItemProps> = React.forwardRef<
  HTMLLIElement,
  SidenavItemProps
>((props: SidenavItemProps, ref) => {
  const {
    active: activeProp,
    children,
    className,
    disabled,
    classPrefix,
    icon,
    eventKey,
    style,
    onClick,
    onSelect,
    divider,
    panel,
    ...rest
  } = props;

  const { activeKey, onSelect: onSelectFromSidenav } = useContext(SidenavContext);

  const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);

  const selected = activeProp ?? (!isNil(eventKey) && shallowEqual(activeKey, eventKey));

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (disabled) return;

      onSelect?.(eventKey, event);
      onSelectFromSidenav?.(eventKey, event);
      onClick?.(event);
    },
    [disabled, onSelect, onSelectFromSidenav, eventKey, onClick]
  );

  if (divider) {
    return (
      <li
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
      <li
        ref={ref}
        role="none presentation"
        style={style}
        className={merge(className, prefix('panel'))}
        {...rest}
      >
        {children}
      </li>
    );
  }

  return (
    <a
      ref={ref as any}
      href="#"
      className={merge(className, withClassPrefix({ active: selected, disabled }))}
      onClick={handleClick}
      style={style}
      aria-selected={selected || undefined}
      data-event-key={eventKey}
      {...rest}
    >
      {icon}
      {children}
      <Ripple />
    </a>
  );
});

SidenavItem.displayName = 'Sidenav.Item';
SidenavItem.defaultProps = defaultProps;
SidenavItem.propTypes = {
  classPrefix: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  eventKey: PropTypes.any,
  as: PropTypes.elementType,
  style: PropTypes.object,
  onSelect: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onContextMenu: PropTypes.func,
  onClick: PropTypes.func
};

export default SidenavItem;
