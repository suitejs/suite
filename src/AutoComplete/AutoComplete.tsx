import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import Input from '../Input';
import { useClassNames, useControlled, PLACEMENT, mergeRefs } from '../utils';
import {
  PickerToggleTrigger,
  onMenuKeyDown,
  DropdownMenu,
  DropdownMenuItem,
  MenuWrapper,
  useFocusItemValue,
  usePublicMethods
} from '../Picker';
import {
  pickerToggleTriggerProps,
  PositionChildProps,
  OverlayTriggerInstance
} from '../Picker/PickerToggleTrigger';
import { PickerComponent } from '../Picker/types';
import { animationPropTypes } from '../Animation/utils';
import {
  WithAsProps,
  FormControlPickerProps,
  TypeAttributes,
  ItemDataType
} from '../@types/common';
import { transformData, shouldDisplay } from './utils';

export type ValueType = string;

export interface AutoCompleteProps<T = ValueType>
  extends WithAsProps,
    FormControlPickerProps<T, any, ItemDataType> {
  /** Additional classes for menu */
  menuClassName?: string;

  /** The placement of component */
  placement?: TypeAttributes.Placement;

  /** When set to false, the Enter key selection function is invalid */
  selectOnEnter?: boolean;

  /** Open the menu and control it */
  open?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Custom filter function to determine whether the item will be displayed */
  filterBy?: (value: string, item: ItemDataType) => boolean;

  /** Called when a option is selected */
  onSelect?: (value: any, item: ItemDataType, event: React.SyntheticEvent) => void;

  /** Called on focus */
  onFocus?: (event: React.SyntheticEvent<HTMLElement>) => void;

  /** Called on blur */
  onBlur?: (event: React.SyntheticEvent<HTMLElement>) => void;

  /** Called on menu focus */
  onMenuFocus?: (focusItemValue: any, event: React.KeyboardEvent) => void;

  /** The callback triggered by keyboard events. */
  onKeyDown?: (event: React.KeyboardEvent) => void;

  /** Called on open */
  onOpen?: () => void;

  /** Called on close */
  onClose?: () => void;

  /** Custom selected option */
  renderItem?: (itemData: ItemDataType) => React.ReactNode;
}

const defaultProps: Partial<AutoCompleteProps> = {
  as: 'div',
  classPrefix: 'auto-complete',
  defaultValue: '',
  placement: 'bottomStart',
  selectOnEnter: true
};

const AutoComplete: PickerComponent<AutoCompleteProps> = React.forwardRef(
  (props: AutoCompleteProps, ref) => {
    const {
      as: Component,
      disabled,
      className,
      placement,
      selectOnEnter,
      classPrefix,
      defaultValue,
      data,
      value: valueProp,
      open,
      style,
      menuClassName,
      renderItem,
      onSelect,
      filterBy,
      onKeyDown,
      onChange,
      onClose,
      onOpen,
      onFocus,
      onBlur,
      onMenuFocus,
      ...rest
    } = props;

    const datalist = transformData(data);
    const [value, setValue] = useControlled<ValueType>(valueProp, defaultValue);
    const [focus, setFocus] = useState(false);
    const items = datalist?.filter(shouldDisplay(filterBy, value)) || [];
    const hasItems = items.length > 0;
    const menuRef = useRef<HTMLDivElement>(null);

    // Used to hover the focuse item  when trigger `onKeydown`
    const { focusItemValue, setFocusItemValue, onKeyDown: handleKeyDown } = useFocusItemValue(
      value,
      {
        data: datalist,
        callback: onMenuFocus,
        target: () => menuRef.current
      }
    );

    const handleKeyDownEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!menuRef.current) {
        return;
      }
      onMenuKeyDown(event, {
        enter: selectOnEnter ? selectFocusMenuItem : undefined,
        esc: handleClose
      });
      handleKeyDown(event);
      onKeyDown?.(event);
    };

    const selectFocusMenuItem = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!focusItemValue) {
        return;
      }

      const focusItem = datalist.find(item => item?.value === focusItemValue);
      setValue(focusItemValue);
      setFocusItemValue(focusItemValue);

      handleSelect(focusItem, event);
      if (value !== focusItemValue) {
        handleChangeValue(focusItemValue, event);
      }

      handleClose();
    };

    const handleSelect = useCallback(
      (item: ItemDataType, event: React.SyntheticEvent) => {
        onSelect?.(item.value, item, event);
      },
      [onSelect]
    );

    const handleChangeValue = useCallback(
      (value: any, event: React.SyntheticEvent<any>) => {
        onChange?.(value, event);
      },
      [onChange]
    );

    const handleChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
      setFocusItemValue('');
      setValue(value);
      setFocus(true);
      handleChangeValue(value, event);
    };

    const handleClose = useCallback(() => {
      setFocus(false);
      onClose?.();
    }, [onClose]);

    const handleOpen = useCallback(() => {
      setFocus(true);
      onOpen?.();
    }, [onOpen]);

    const handleItemSelect = useCallback(
      (nextItemValue: ValueType, item: ItemDataType, event: React.SyntheticEvent) => {
        setValue(nextItemValue);
        setFocusItemValue(nextItemValue);
        handleSelect(item, event);

        if (value !== nextItemValue) {
          handleChangeValue(nextItemValue, event);
        }
        handleClose();
      },
      [value, setValue, handleSelect, handleChangeValue, handleClose, setFocusItemValue]
    );

    const handleInputFocus = useCallback(
      (event: React.SyntheticEvent<HTMLElement>) => {
        onFocus?.(event);
        handleOpen();
      },
      [onFocus, handleOpen]
    );

    const handleInputBlur = useCallback(
      (event: React.SyntheticEvent<HTMLElement>) => {
        setTimeout(handleClose, 300);
        onBlur?.(event);
      },
      [onBlur, handleClose]
    );

    const { withClassPrefix, merge } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix({ disabled }));
    const rootRef = useRef();
    const triggerRef = useRef<OverlayTriggerInstance>();

    usePublicMethods(ref, { triggerRef, menuRef });

    const renderDropdownMenu = (positionProps: PositionChildProps, speakerRef) => {
      const { left, top, className } = positionProps;
      const styles = { left, top };

      return (
        <MenuWrapper
          ref={mergeRefs(menuRef, speakerRef)}
          style={styles}
          className={className}
          onKeyDown={handleKeyDownEvent}
        >
          <DropdownMenu
            classPrefix="auto-complete-menu"
            dropdownMenuItemClassPrefix="auto-complete-item"
            dropdownMenuItemAs={DropdownMenuItem}
            focusItemValue={focusItemValue}
            ref={menuRef}
            onSelect={handleItemSelect}
            renderMenuItem={renderItem}
            data={items}
            className={menuClassName}
          />
        </MenuWrapper>
      );
    };

    return (
      <Component ref={rootRef} className={classes} style={style}>
        <PickerToggleTrigger
          ref={triggerRef}
          placement={placement}
          pickerProps={pick(props, pickerToggleTriggerProps)}
          trigger={['click', 'focus']}
          open={open || (focus && hasItems)}
          speaker={renderDropdownMenu}
        >
          <Input
            {...rest}
            disabled={disabled}
            value={value}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onChange={handleChange}
            onKeyDown={handleKeyDownEvent}
          />
        </PickerToggleTrigger>
      </Component>
    );
  }
);

AutoComplete.displayName = 'AutoComplete';
AutoComplete.defaultProps = defaultProps;
AutoComplete.propTypes = {
  ...animationPropTypes,
  data: PropTypes.array,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  classPrefix: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  placement: PropTypes.oneOf(PLACEMENT),
  onFocus: PropTypes.func,
  onMenuFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  renderItem: PropTypes.func,
  style: PropTypes.object,
  open: PropTypes.bool,
  selectOnEnter: PropTypes.bool,
  filterBy: PropTypes.func
};

export default AutoComplete;
