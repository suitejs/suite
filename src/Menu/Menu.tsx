import React, { useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import MenuContext, { MenuActionTypes, MenuContextProps, MoveFocusTo } from './MenuContext';
import { KEY_VALUES, useCustom } from '../utils';
import useUniqueId from '../utils/useUniqueId';
import useMenu from './useMenu';
import useFocus from '../utils/useFocus';
import useClickOutside from '../utils/useClickOutside';
import { isFocusLeaving } from '../utils/events';
import { isFocusableElement } from '../utils/dom';

export interface MenuProps {
  disabled?: boolean;

  children: (
    props: React.HTMLAttributes<HTMLDivElement> & MenuRenderProps,
    ref: React.Ref<HTMLDivElement>
  ) => React.ReactElement<React.HTMLAttributes<HTMLDivElement>>;

  menuButtonText?: React.ReactNode;
  renderMenuButton?: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & MenuButtonRenderProps,
    ref: React.Ref<HTMLButtonElement>
  ) => React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;

  renderMenuPopup?: (
    props: React.HTMLAttributes<HTMLUListElement> & MenuPopupRenderProps,
    ref: React.Ref<HTMLUListElement>
  ) => React.ReactElement<React.HTMLAttributes<HTMLUListElement>>;

  openMenuOn?: MenuButtonTrigger[];
  onToggleMenu?: (open: boolean, event: React.SyntheticEvent) => void;
}

export type MenuButtonTrigger = 'mouseover' | 'click' | 'contextmenu';

export interface MenuRenderProps {
  open: boolean;
}

export interface MenuButtonRenderProps {
  open: boolean;
}

export interface MenuPopupRenderProps {
  open: boolean;
}

export interface MenuHandle {
  dispatch: MenuContextProps[1];
}

const defaultProps: Partial<MenuProps> = {
  openMenuOn: ['click']
};

/**
 * Headless ARIA `menu`
 */
function Menu(props: MenuProps & React.HTMLAttributes<HTMLUListElement>) {
  const {
    disabled,
    children,
    openMenuOn,
    menuButtonText,
    renderMenuButton,
    renderMenuPopup,
    onToggleMenu
  } = props;

  const buttonElementRef = useRef<HTMLButtonElement>();
  const menuElementRef = useRef<HTMLUListElement>();

  const parentMenu = useContext(MenuContext);
  const isSubmenu = !!parentMenu;

  const menu = useMenu();
  const [{ open, items, activeItemIndex }, dispatch] = menu;

  const { rtl } = useCustom('Menu');

  const activeItem = items[activeItemIndex]?.element;

  const menuFocus = useFocus(menuElementRef);

  const openMenu = useCallback(
    (event: React.SyntheticEvent) => {
      dispatch({
        type: MenuActionTypes.OpenMenu
      });

      if (!event.isTrusted) {
        dispatch({
          type: MenuActionTypes.MoveFocus,
          to: MoveFocusTo.First
        });
      }
      onToggleMenu?.(true, event);

      menuFocus.grab();
    },
    [dispatch, onToggleMenu, menuFocus]
  );

  const closeMenu = useCallback(
    (event: React.SyntheticEvent, returnFocusToButton = true) => {
      dispatch({
        type: MenuActionTypes.CloseMenu
      });
      dispatch({
        type: MenuActionTypes.MoveFocus,
        to: MoveFocusTo.None
      });
      onToggleMenu?.(false, event);

      if (returnFocusToButton) {
        buttonElementRef.current.focus({ preventScroll: true });
      }
    },
    [dispatch, onToggleMenu, buttonElementRef]
  );

  const toggleMenu = useCallback(
    (event: React.SyntheticEvent) => {
      if (!open) {
        openMenu(event);
      } else {
        closeMenu(event);
      }
    },
    [open, openMenu, closeMenu]
  );

  useClickOutside({
    enabled: open,
    isOutside: event => {
      return (
        !buttonElementRef.current.contains(event.target as HTMLElement) &&
        !menuElementRef.current.contains(event.target as HTMLElement)
      );
    },
    // fixme if clicking on a focusable element, don't move focus to menu button
    handle: event => closeMenu(event as any, !isFocusableElement(event.target as HTMLElement))
  });

  /**
   * Keyboard interaction on menu button
   * @see https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
   */
  const handleButtonKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        // Open the menu
        case KEY_VALUES.ENTER:
        case KEY_VALUES.SPACE:
          e.preventDefault();
          e.stopPropagation();
          if (!open) {
            openMenu(e);
            dispatch({
              type: MenuActionTypes.MoveFocus,
              to: MoveFocusTo.First
            });
          } else {
            closeMenu(e);
          }
          break;
        // Open the menu (if closed) and move focus to first item
        // This is mostly useful after opening the menu with click
        case KEY_VALUES.DOWN:
          e.preventDefault();
          e.stopPropagation();
          if (!open) {
            openMenu(e);
          }
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.First
          });
          break;
      }
    },
    [open, openMenu, closeMenu, dispatch]
  );

  const handleButtonClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) {
        return;
      }
      toggleMenu(event);
    },
    [disabled, toggleMenu]
  );

  const handleButtonContextMenu = useCallback(
    (event: React.MouseEvent) => {
      // prevents default contextmenu
      event.preventDefault();

      // Only opens menu on right click. Left click can close the menu opened by a right click
      if (open) return;
      if (disabled) return;
      openMenu(event);
    },
    [open, disabled, openMenu]
  );

  const buttonEventHandlers: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    onKeyDown: handleButtonKeydown
  };

  /**
   * Bind event of trigger,
   * not used in  in the expanded state of '<Sidenav>'
   */
  if (openMenuOn?.includes('click')) {
    buttonEventHandlers.onClick = handleButtonClick;
  }

  if (openMenuOn?.includes('contextmenu')) {
    buttonEventHandlers.onContextMenu = handleButtonContextMenu;
  }

  const buttonId = useUniqueId('menubutton-');
  const menuId = useUniqueId('menu-');

  // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-14
  const buttonAriaAttributes: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    role: 'button',
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open || undefined, // it's recommend to remove aria-expanded when menu is hidden
    'aria-controls': menuId
  };

  const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & MenuButtonRenderProps = {
    id: buttonId,
    ...buttonAriaAttributes,
    ...buttonEventHandlers,

    // render props
    open
  };

  const customMenuButton = renderMenuButton?.(buttonProps, buttonElementRef);

  const buttonElement = customMenuButton ?? (
    <button ref={buttonElementRef} {...buttonProps}>
      {menuButtonText}
    </button>
  );

  /**
   * Keyboard interaction on menu
   * @see https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
   */
  const handleMenuKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      switch (e.key) {
        // Move focus to previous item
        case KEY_VALUES.UP:
          e.preventDefault();
          e.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Prev
          });
          break;
        // Move focus to next item
        case KEY_VALUES.DOWN:
          e.preventDefault();
          e.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Next
          });
          break;
        // When focus is in a menu and on a menuitem that has a submenu, opens the submenu and places focus on its first item.
        case KEY_VALUES.RIGHT:
          e.preventDefault();
          e.stopPropagation();
          if (!rtl) {
            if (activeItem?.getAttribute('aria-haspopup') === 'menu') {
              activeItem.click();
            }
          } else if (isSubmenu) {
            dispatch({
              type: MenuActionTypes.CloseMenu
            });
          }
          break;
        // When focus is in a submenu of an item in a menu, closes the submenu and returns focus to the parent menuitem.
        case KEY_VALUES.LEFT:
          e.preventDefault();
          e.stopPropagation();
          if (!rtl) {
            if (isSubmenu) {
              closeMenu(e);
            }
          } else if (activeItem?.getAttribute('aria-haspopup') === 'menu') {
            activeItem.click();
          }
          break;
        // Move focus to the first item
        case KEY_VALUES.HOME:
          e.preventDefault();
          e.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.First
          });
          break;
        // Move focus to the last item
        case KEY_VALUES.END:
          e.preventDefault();
          e.stopPropagation();
          dispatch({
            type: MenuActionTypes.MoveFocus,
            to: MoveFocusTo.Last
          });
          break;
        // - When focus is on a menuitem that has a submenu, opens the submenu and places focus on its first item.
        // - Otherwise, activates the item and closes the menu.
        case KEY_VALUES.ENTER:
        case KEY_VALUES.SPACE:
          if (activeItem) {
            e.preventDefault();
            e.stopPropagation();
            activeItem.click();
            if (!activeItem.getAttribute('aria-haspopup')) {
              closeMenu(e);
            }
          }
          break;
        //  Close the menu that contains focus and return focus to the element or context,
        //  e.g., menu button or parent menuitem, from which the menu was opened.
        case KEY_VALUES.ESC:
          closeMenu(e);
          break;
      }
    },
    [dispatch, activeItem, isSubmenu, rtl, closeMenu]
  );

  // Only used for clicks bubbling from child `menuitem`s.
  const handleMenuClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only handle clicks on `menuitem`s
      if (target.getAttribute('role') !== 'menuitem') return;

      // Ignore clicks on `menuitem`s that controls a submenu
      if (target.getAttribute('aria-haspopup') === 'menu') return;

      // Ignore disabled `menuitem`s
      if (target.getAttribute('aria-disabled') === 'true') return;

      closeMenu(event, !isSubmenu);
    },
    [dispatch, closeMenu, isSubmenu]
  );

  // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-13
  const menuAriaAttributes: React.HTMLAttributes<HTMLUListElement> = {
    role: 'menu',
    'aria-labelledby': buttonId,
    'aria-activedescendant': activeItem?.id
  };

  const menuEventHandlers: React.HTMLAttributes<HTMLUListElement> = {
    onClick: handleMenuClick,
    onKeyDown: handleMenuKeydown
  };

  const menuProps: React.HTMLAttributes<HTMLUListElement> = {
    id: menuId,
    ...menuAriaAttributes,
    ...menuEventHandlers,
    tabIndex: 0
  };

  const customMenuPopup = renderMenuPopup?.(
    {
      ...menuProps,
      open
    },
    menuElementRef
  );

  const menuElement = customMenuPopup ?? (
    <ul ref={menuElementRef} {...menuProps} hidden={!open}>
      {children}
    </ul>
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!disabled) {
        openMenu(e);
      }
    },
    [disabled, openMenu]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (!disabled) {
        closeMenu(e);
      }
    },
    [disabled, closeMenu]
  );

  const rootElementRef = useRef<HTMLDivElement>();

  const handleContainerBlur = useCallback(
    (event: React.FocusEvent) => {
      if (isFocusLeaving(event)) {
        closeMenu(event, false);
      }
    },
    [closeMenu]
  );

  const rootEventHandlers: React.HTMLAttributes<HTMLDivElement> = {
    onBlur: handleContainerBlur
  };

  if (openMenuOn?.includes('mouseover')) {
    rootEventHandlers.onMouseEnter = handleMouseEnter;
    rootEventHandlers.onMouseLeave = handleMouseLeave;
  }

  const rootProps: React.HTMLAttributes<HTMLDivElement> & MenuRenderProps = {
    ...rootEventHandlers,
    children: (
      <>
        {buttonElement}
        <MenuContext.Provider value={menu}>{menuElement}</MenuContext.Provider>
      </>
    ),
    // render props
    open
  };

  if (isSubmenu) {
    rootProps.role = 'none presentation';
  }

  return children(rootProps, rootElementRef);
}

Menu.displayName = 'Menu';
Menu.defaultProps = defaultProps;
Menu.propTypes = {
  children: PropTypes.func.isRequired
};

export default Menu;
