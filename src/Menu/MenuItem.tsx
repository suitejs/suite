import React, { useCallback, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useUniqueId from '../utils/useUniqueId';
import MenuContext, { MenuActionTypes, MoveFocusTo } from './MenuContext';

export interface MenuItemProps {
  /** Active the current option */
  selected?: boolean;

  /** Disable the current option */
  disabled?: boolean;

  /** Render prop */
  children: (
    menuitem: React.LiHTMLAttributes<HTMLLIElement> & MenuitemRenderProps,
    ref: React.Ref<HTMLLIElement>
  ) => React.ReactElement;

  /** Callback when menuitem is being activated */
  onActivate?: (event: React.SyntheticEvent<HTMLElement>) => void;
}

export interface MenuitemRenderProps {
  selected: boolean;
  active: boolean;
}

/**
 * Headless ARIA `menuitem`
 */
function MenuItem(props: MenuItemProps) {
  const { children, selected, disabled, onActivate } = props;

  const menuitemRef = useRef<HTMLLIElement>();
  const menuitemId = useUniqueId('menuitem-');

  const menu = useContext(MenuContext);
  // fixme make sure <MenuItem> is used inside a <Menu>
  const [menuState, dispatch] = menu ?? [];

  // Whether this menuitem has focus (indicated by `aria-activedescendant` from parent menu)
  const hasFocus = menuState?.items[menuState?.activeItemIndex]?.element === menuitemRef.current;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      if (disabled) {
        return;
      }

      onActivate?.(event);
    },
    [disabled, onActivate]
  );

  // Gain/release focus on mousedown in `menubar`

  const handleMouseDown = useCallback(() => {
    dispatch({
      type: MenuActionTypes.MoveFocus,
      to: MoveFocusTo.Specific,
      id: menuitemRef.current.id
    });
  }, [dispatch]);

  // Gain/release focus on mouseenter/mouseleave in `menu`
  const handleMouseMove = useCallback(() => {
    dispatch({
      type: MenuActionTypes.MoveFocus,
      to: MoveFocusTo.Specific,
      id: menuitemRef.current.id
    });
  }, [dispatch]);

  const handleMouseLeave = useCallback(() => {
    dispatch({
      type: MenuActionTypes.MoveFocus,
      to: MoveFocusTo.None
    });
  }, [dispatch]);

  useEffect(() => {
    const menuitemElement = menuitemRef.current;

    dispatch?.({
      type: MenuActionTypes.RegisterItem,
      element: menuitemElement,
      props: { disabled }
    });
    return () => {
      dispatch?.({ type: MenuActionTypes.UnregisterItem, id: menuitemElement.id });
    };
  }, [menuitemRef, disabled, dispatch]);

  const menuitemProps: React.LiHTMLAttributes<HTMLLIElement> & MenuitemRenderProps = {
    id: menuitemId,
    role: 'menuitem',
    // fixme Only use `aria-checked` on menuitemradio and menuitemcheckbox
    'aria-checked': selected || undefined,
    'aria-disabled': disabled,
    tabIndex: -1,
    onClick: handleClick,
    // render props

    selected,
    active: hasFocus
  };

  // Only move focus on hover in a `menu`, not `menubar`
  if (menuState?.role === 'menu') {
    menuitemProps.onMouseMove = handleMouseMove;
    menuitemProps.onMouseLeave = handleMouseLeave;
  }

  if (menuState?.role === 'menubar') {
    menuitemProps.onMouseDown = handleMouseDown;
  }

  return children(menuitemProps, menuitemRef);
}

MenuItem.displayName = 'MenuItem';
MenuItem.propTypes = {
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.func.isRequired,
  onActivate: PropTypes.func
};

export default MenuItem;
