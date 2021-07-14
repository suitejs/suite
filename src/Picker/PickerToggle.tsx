import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import MaskedInput from 'react-text-mask';
import ToggleButton, { ToggleButtonProps } from './ToggleButton';
import CloseButton from '../CloseButton';
import { useClassNames, KEY_VALUES, mergeRefs } from '../utils';
import { RsRefForwardingComponent, TypeAttributes } from '../@types/common';
import Plaintext from '../Plaintext';
import useToggleCaret from '../utils/useToggleCaret';
import { IconProps } from '@rsuite/icons/lib/Icon';

type ValueType = string | number;

export interface PickerToggleProps extends ToggleButtonProps {
  value?: ValueType | ValueType[];
  inputValue?: ValueType | ValueType[];
  id?: string;
  hasValue?: boolean;
  cleanable?: boolean;
  caret?: boolean;
  active?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  plaintext?: boolean;
  tabIndex?: number;
  input?: boolean;
  inputPlaceholder?: string;
  inputMask?: (string | RegExp)[];
  onInputChange?: (value: string, event: React.ChangeEvent) => void;
  onInputPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onInputFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  placement?: TypeAttributes.Placement;
  caretComponent?: React.FC<IconProps>;
  onClean?: (event: React.MouseEvent) => void;
}

const defaultProps: Partial<PickerToggleProps> = {
  as: ToggleButton,
  classPrefix: 'picker-toggle',
  inputMask: []
};

const PickerToggle: RsRefForwardingComponent<
  typeof ToggleButton,
  PickerToggleProps
> = React.forwardRef((props: PickerToggleProps, ref) => {
  const {
    active: activeProp,
    as: Component,
    classPrefix,
    children,
    caret = true,
    className,
    disabled,
    readOnly,
    plaintext,
    hasValue,
    cleanable: cleanableProp,
    tabIndex = 0,
    id,
    value,
    input,
    inputPlaceholder,
    inputValue: inputValueProp,
    inputMask,
    onInputChange,
    onInputPressEnter,
    onInputBlur,
    onInputFocus,
    onClean,
    onFocus,
    onBlur,
    placement,
    caretComponent,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>();
  const [activeState, setActive] = useState(false);
  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const getInputValue = useCallback(
    () =>
      typeof inputValueProp === 'undefined'
        ? Array.isArray(value)
          ? value.join(',')
          : value
        : inputValueProp,
    [inputValueProp, value]
  );
  const [inputValue, setInputValue] = useState(getInputValue);

  useEffect(() => {
    const value = getInputValue();
    setInputValue(value);
  }, [getInputValue]);

  const classes = merge(className, withClassPrefix({ active: activeProp || activeState }));

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      setActive(true);
      onFocus?.(event);
      if (input) {
        inputRef.current.focus();
      }
    },
    [input, onFocus]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (document.activeElement !== inputRef.current) {
        setActive(false);
        inputRef.current?.blur();
      }
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleInputBlur = (event: React.FocusEvent<HTMLElement>) => {
    setInputValue(getInputValue());
    onInputBlur?.(event);
  };

  const handleClean = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      onClean?.(event);
      setActive(false);
    },
    [onClean]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target?.value;
      setInputValue(value);
      onInputChange?.(value, event);
    },
    [onInputChange]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (input && event.key === KEY_VALUES.ENTER) {
        onInputPressEnter?.(event);
      }
    },
    [onInputPressEnter, input]
  );

  const ToggleCaret = useToggleCaret(placement);
  const Caret = caretComponent ?? ToggleCaret;

  if (plaintext) {
    return (
      <Plaintext ref={ref} localeKey="notSelected">
        {hasValue ? children : null}
      </Plaintext>
    );
  }

  const cleanable = cleanableProp && hasValue && !readOnly;

  // When the component is read-only or disabled, the input is not interactive.
  const inputFocused = readOnly || disabled ? false : input && activeState;

  return (
    <Component
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={activeProp}
      aria-disabled={disabled}
      aria-owns={id ? `${id}-listbox` : undefined}
      {...rest}
      ref={ref}
      disabled={disabled}
      tabIndex={disabled ? undefined : tabIndex}
      className={classes}
      onFocus={!disabled ? handleFocus : null}
      // The debounce is set to 200 to solve the flicker caused by the switch between input and div.
      onBlur={!disabled ? debounce(handleBlur, 200) : null}
    >
      <MaskedInput
        mask={inputMask}
        value={Array.isArray(inputValue) ? inputValue.toString() : inputValue}
        onBlur={handleInputBlur}
        onFocus={onInputFocus}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        id={id}
        aria-hidden={!inputFocused}
        readOnly={!inputFocused}
        disabled={disabled}
        aria-controls={id ? `${id}-listbox` : undefined}
        tabIndex={-1}
        className={prefix('textbox', { 'read-only': !inputFocused })}
        placeholder={inputPlaceholder}
        render={(ref, props) => <input ref={mergeRefs(inputRef, ref)} {...props} />}
      />

      <span
        className={prefix(hasValue ? 'value' : 'placeholder')}
        aria-placeholder={typeof children === 'string' ? children : null}
      >
        {children}
      </span>
      {cleanable && <CloseButton className={prefix`clean`} tabIndex={-1} onClick={handleClean} />}
      {caret && <Caret className={prefix`caret`} />}
    </Component>
  );
});

PickerToggle.displayName = 'PickerToggle';
PickerToggle.defaultProps = defaultProps;
PickerToggle.propTypes = {
  classPrefix: PropTypes.string,
  hasValue: PropTypes.bool,
  cleanable: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  caret: PropTypes.bool,
  as: PropTypes.elementType,
  onClean: PropTypes.func,
  active: PropTypes.bool,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  plaintext: PropTypes.bool
};

export default PickerToggle;
