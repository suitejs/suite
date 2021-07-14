// Inspired by tailwindlabs/headlessui
import { useReducer } from 'react';
import {
  MenuAction,
  MenuActionTypes,
  MenuContextProps,
  MenuState,
  MoveFocusTo
} from './MenuContext';

export const initialMenuState: MenuState = {
  role: 'menu',
  open: false,
  items: [],
  activeItemIndex: null
};

export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  const { items, activeItemIndex } = state;

  switch (action.type) {
    case MenuActionTypes.RegisterItem:
      return {
        ...state,
        items: [...items, { element: action.element, props: action.props }]
      };
    case MenuActionTypes.UnregisterItem:
      return {
        ...state,
        items: items.filter(item => item.element.id !== action.id)
      };
    case MenuActionTypes.OpenMenu:
      return {
        ...state,
        open: true
      };
    case MenuActionTypes.CloseMenu:
      return {
        ...state,
        open: false
      };
    case MenuActionTypes.MoveFocus:
      let nextActiveItemIndex = activeItemIndex;

      switch (action.to) {
        case MoveFocusTo.Next:
          for (
            let i = nextActiveItemIndex === null ? 0 : activeItemIndex + 1;
            i < items.length;
            i++
          ) {
            if (!items[i].props.disabled) {
              nextActiveItemIndex = i;
              break;
            }
          }
          break;
        case MoveFocusTo.Prev:
          for (
            let i = nextActiveItemIndex === null ? items.length - 1 : activeItemIndex - 1;
            i >= 0;
            i--
          ) {
            if (!items[i].props.disabled) {
              nextActiveItemIndex = i;
              break;
            }
          }
          break;
        case MoveFocusTo.First:
          for (let i = 0; i < items.length; i++) {
            if (!items[i].props.disabled) {
              nextActiveItemIndex = i;
              break;
            }
          }
          break;
        case MoveFocusTo.Last:
          for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].props.disabled) {
              nextActiveItemIndex = i;
              break;
            }
          }
          break;
        case MoveFocusTo.Specific:
          for (let i = 0; i < items.length; i++) {
            if (items[i].element.id === action.id && !items[i].props.disabled) {
              nextActiveItemIndex = i;
              break;
            }
          }
          break;
        case MoveFocusTo.None:
          nextActiveItemIndex = null;
          break;
      }

      return {
        ...state,
        activeItemIndex: nextActiveItemIndex
      };
    default:
      return state;
  }
}

export default function useMenu(initialState?: Partial<MenuState>): MenuContextProps {
  // `menuitem`s
  const [state, dispatch] = useReducer(menuReducer, {
    ...initialMenuState,
    ...initialState
  });

  return [state, dispatch];
}
