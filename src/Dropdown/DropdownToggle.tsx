import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import Ripple from '../Ripple';
import Button from '../Button';
import { useClassNames } from '../utils';
import { IconProps } from '@rsuite/icons/lib/Icon';
import { WithAsProps, RsRefForwardingComponent, TypeAttributes } from '../@types/common';
import useToggleCaret from '../utils/useToggleCaret';
import { SidenavContext } from '../Sidenav/Sidenav';

export interface DropdownToggleProps extends WithAsProps {
  icon?: React.ReactElement<IconProps>;
  noCaret?: boolean;
  renderTitle?: (children?: React.ReactNode) => React.ReactNode;
  placement?: TypeAttributes.Placement8;
}

const defaultProps: Partial<DropdownToggleProps> = {
  as: Button,
  classPrefix: 'dropdown-toggle'
};

const DropdownToggle: RsRefForwardingComponent<
  typeof Button,
  DropdownToggleProps
> = React.forwardRef((props: DropdownToggleProps, ref) => {
  const {
    as: Component,
    className,
    classPrefix,
    renderTitle,
    children,
    icon,
    noCaret,
    placement,
    ...rest
  } = props;

  const sidenav = useContext(SidenavContext);
  const { prefix, withClassPrefix, merge } = useClassNames(classPrefix);
  const classes = merge(
    className,
    withClassPrefix({
      'custom-title': typeof renderTitle === 'function',
      'no-caret': noCaret
    })
  );

  const inSidenav = !!sidenav;

  // Caret icon is down by default, when Dropdown is used in Sidenav.
  const Caret = useToggleCaret(inSidenav ? 'bottomStart' : placement);

  if (renderTitle) {
    return (
      <Component {...rest} ref={ref} className={classes}>
        {renderTitle(children)}
        <Ripple />
      </Component>
    );
  }

  const buttonProps = Component === Button ? { appearance: 'subtle' } : null;

  return (
    <Component {...buttonProps} {...rest} ref={ref} className={classes}>
      {icon}
      {children}
      {noCaret ? null : <Caret className={prefix('caret')} />}
    </Component>
  );
});

DropdownToggle.displayName = 'DropdownToggle';
DropdownToggle.defaultProps = defaultProps;
DropdownToggle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.node,
  classPrefix: PropTypes.string,
  noCaret: PropTypes.bool,
  as: PropTypes.elementType,
  renderTitle: PropTypes.func
};

export default DropdownToggle;
