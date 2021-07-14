// Headless ARIA `menubar`
import React, { useCallback, useRef } from 'react';
import MenuContext, { MenuActionTypes, MoveFocusTo } from './MenuContext';
import { KEY_VALUES, useCustom } from '../utils';
import { isFocusEntering, isFocusLeaving } from '../utils/events';
import useMenu from './useMenu';

export interface MenubarProps {
  /** Whether menubar is arranged in vertical form, defaults to false */
  vertical?: boolean;

  /** Render prop */
  children: (
    menubar: React.HTMLAttributes<HTMLUListElement>,
    ref: React.Ref<HTMLUListElement>
  ) => React.ReactElement;

  /** Callback triggered when an item is being activated */
  onActivateItem?: (event: React.SyntheticEvent<HTMLElement>) => void;
}

export default function Menubar({ vertical = false, children, onActivateItem }: MenubarProps) {
  const menubar = useMenu({ role: 'menubar' });
  const [{ items, activeItemIndex }, dispatch] = menubar;

  const menubarElementRef = useRef<HTMLUListElement>();

  const onFocus = useCallback(
    (event: React.FocusEvent) => {
      // Focus moves inside Menubar
      if (isFocusEntering(event)) {
        if (activeItemIndex === null) {
          dispatch({ type: MenuActionTypes.MoveFocus, to: MoveFocusTo.First });
        }
      }
    },
    [activeItemIndex, dispatch]
  );

  const onBlur = useCallback(
    (event: React.FocusEvent) => {
      // Focus moves outside of Menubar
      if (isFocusLeaving(event)) {
        dispatch({ type: MenuActionTypes.MoveFocus, to: MoveFocusTo.None });
      }
    },
    [dispatch]
  );

  const { rtl } = useCustom('Menubar');

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      const activeItem = items[activeItemIndex];
      switch (true) {
        case !vertical && !rtl && event.key === KEY_VALUES.RIGHT:
        case !vertical && rtl && event.key === KEY_VALUES.LEFT:
        case vertical && event.key === KEY_VALUES.DOWN:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Next
          });
          break;
        case !vertical && !rtl && event.key === KEY_VALUES.LEFT:
        case !vertical && rtl && event.key === KEY_VALUES.RIGHT:
        case vertical && event.key === KEY_VALUES.UP:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Prev
          });
          break;
        case event.key === KEY_VALUES.HOME:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.First
          });
          break;
        case event.key === KEY_VALUES.END:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Last
          });
          break;
        case !vertical && event.key === KEY_VALUES.DOWN:
        case vertical && !rtl && event.key === KEY_VALUES.RIGHT:
        case vertical && rtl && event.key === KEY_VALUES.LEFT:
          if (activeItem?.element.getAttribute('aria-haspopup') === 'menu') {
            event.preventDefault();
            event.stopPropagation();
            activeItem.element.click();
          }
          break;
        case event.key === KEY_VALUES.ENTER:
        case event.key === KEY_VALUES.SPACE:
          event.preventDefault();
          event.stopPropagation();
          activeItem?.element.click();
          break;
      }
    },
    [rtl, items, activeItemIndex, dispatch, vertical]
  );

  // Only used for handling click events bubbling from children
  // Which indicates that a child menuitem is being activated
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (items.some(item => item.element === event.target)) {
        onActivateItem?.(event);
      }
    },
    [items, onActivateItem]
  );

  return (
    <MenuContext.Provider value={menubar}>
      {children(
        {
          role: 'menubar',
          tabIndex: 0,
          onFocus,
          onBlur,
          onKeyDown,
          onClick,
          'aria-activedescendant': items[activeItemIndex]?.element.id,
          'aria-orientation': vertical ? 'vertical' : undefined // implicitly set 'horizontal'
        },
        menubarElementRef
      )}
    </MenuContext.Provider>
  );
}
