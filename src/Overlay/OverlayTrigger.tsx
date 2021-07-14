import React, { useRef, useEffect, useImperativeHandle, useCallback } from 'react';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { contains } from 'dom-lib';
import Overlay, { OverlayProps } from './Overlay';
import { createChainedFunction, usePortal, useControlled } from '../utils';
import isOneOf from '../utils/isOneOf';
import { AnimationEventProps, StandardProps, TypeAttributes } from '../@types/common';
import { PositionInstance } from './Position';
import { isUndefined } from 'lodash';

export type OverlayTriggerType = 'click' | 'hover' | 'focus' | 'active' | 'contextMenu' | 'none';

function mergeEvents(events = {}, props = {}) {
  const nextEvents = {};

  Object.keys(events).forEach(eventName => {
    if (events[eventName]) {
      nextEvents[eventName] = createChainedFunction(events[eventName], props?.[eventName]);
    }
  });
  return nextEvents;
}

export interface OverlayTriggerProps extends StandardProps, AnimationEventProps {
  /** Triggering events */
  trigger?: OverlayTriggerType | OverlayTriggerType[];

  /** Display placement */
  placement?: TypeAttributes.Placement;

  /** Delay time */
  delay?: number;

  /** Open delay time */
  delayOpen?: number;

  /** Close delay time */
  delayClose?: number;

  /** Sets the rendering container */
  container?: HTMLElement | (() => HTMLElement);

  /** Container padding */
  containerPadding?: number;

  /** display element */
  speaker?: React.ReactElement | ((props: any, ref: React.RefObject<any>) => React.ReactElement);

  /** Prevent floating element overflow */
  preventOverflow?: boolean;

  /** Opern  overlay */
  open?: boolean;

  /** The overlay is open by default */
  defaultOpen?: boolean;

  /** Whether mouse is allowed to enter the floating layer of popover, whose default value is false. */
  enterable?: boolean;

  /** For the monitored component, the event will be bound to this component. */
  children?: React.ReactElement | ((props: any, ref) => React.ReactElement);

  /** Whether to allow clicking document to close the overlay */
  rootClose?: boolean;

  /** Once disabled, the event cannot be triggered. */
  disabled?: boolean;

  /** Render the control as plain text */
  plaintext?: boolean;

  /** Make the control readonly */
  readOnly?: boolean;

  /**  Set the `id` on `<Overlay>` and `aria-describedby` on `<OverlayTrigger>` */
  controlId?: string;

  /** Lose Focus callback function */
  onBlur?: () => void;

  /** Click on the callback function */
  onClick?: () => void;

  /** RightClick on the callback function */
  onContextMenu?: React.MouseEventHandler;

  /** Callback function to get focus */
  onFocus?: () => void;

  /** Mouse leave callback function */
  onMouseOut?: () => void;

  /** Mouse over callback function */
  onMouseOver?: () => void;

  /** Callback fired when open component */
  onOpen?: () => void;

  /** Callback fired when close component */
  onClose?: () => void;
}

/**
 * Useful for mouseover and mouseout.
 * In order to resolve the node entering the mouseover element, a mouseout event and a mouseover event will be triggered.
 * https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
 * @param handler
 * @param event
 */
function onMouseEventHandler(
  handler: (event: React.MouseEvent, delay?: number) => void,
  event: React.MouseEvent,
  delay?: number
) {
  const target = event.currentTarget;
  const related = event.relatedTarget || get(event, ['nativeEvent', 'toElement']);

  if ((!related || related !== target) && !contains(target as HTMLElement, related)) {
    handler(event, delay);
  }
}

const defaultProps: Partial<OverlayTriggerProps> = {
  trigger: ['hover', 'focus'],
  placement: 'bottomStart',
  rootClose: true
};

export interface OverlayTriggerInstance {
  root: Element;
  updatePosition?: () => void;
  open?: () => void;
  close?: () => void;
}

const OverlayTrigger = React.forwardRef((props: OverlayTriggerProps, ref) => {
  const {
    children,
    container,
    controlId,
    defaultOpen,
    trigger,
    disabled,
    readOnly,
    plaintext,
    open: openProp,
    delay,
    delayOpen: delayOpenProp,
    delayClose: delayCloseProp,
    enterable,
    placement,
    speaker,
    onClick,
    onMouseOver,
    onMouseOut,
    onContextMenu,
    onFocus,
    onBlur,
    onClose,
    ...rest
  } = props;

  const { Portal } = usePortal({ container });

  const triggerRef = useRef();
  const overlayRef = useRef<PositionInstance>();
  const [open, setOpen] = useControlled(openProp, defaultOpen);

  // Delay the timer to close/open the overlay
  // When the cursor moves from the trigger to the overlay, the overlay will be closed.
  // In order to keep the overlay open, a timer is used to delay the closing.
  const delayOpenTimer = useRef<ReturnType<typeof setTimeout>>();
  const delayCloseTimer = useRef<ReturnType<typeof setTimeout>>();

  const delayOpen = isNil(delayOpenProp) ? delay : delayOpenProp;
  const delayClose = isNil(delayCloseProp) ? delay : delayCloseProp;

  // Whether the cursor is on the overlay
  const isOnOverlay = useRef(false);

  // Whether the cursor is on the trigger
  const isOnTrigger = useRef(false);

  useEffect(() => {
    return () => {
      clearTimeout(delayOpenTimer.current);
      clearTimeout(delayCloseTimer.current);
    };
  }, []);

  const handleOpen = useCallback(
    (delay?: number) => {
      const ms = isUndefined(delay) ? delayOpen : delay;
      if (ms && typeof ms === 'number') {
        return (delayOpenTimer.current = setTimeout(() => {
          delayOpenTimer.current = null;
          setOpen(true);
        }, ms));
      }

      setOpen(true);
    },
    [delayOpen, setOpen]
  );

  const handleClose = useCallback(
    (delay?: number) => {
      const ms = isUndefined(delay) ? delayClose : delay;

      if (ms && typeof ms === 'number') {
        return (delayCloseTimer.current = setTimeout(() => {
          delayCloseTimer.current = null;
          setOpen(false);
        }, ms));
      }
      setOpen(false);
    },
    [delayClose, setOpen]
  );

  useImperativeHandle(ref, () => ({
    get root() {
      return triggerRef.current;
    },
    get overlay() {
      return overlayRef.current?.child;
    },
    open: handleOpen,
    close: handleClose,
    updatePosition: () => {
      overlayRef.current?.updatePosition?.();
    }
  }));

  /**
   * Close after the cursor leaves.
   */
  const handleCloseWhenLeave = useCallback(() => {
    // When the cursor is not on the overlay and not on the trigger, it is closed.
    if (!isOnOverlay.current && !isOnTrigger.current) {
      handleClose();
    }
  }, [handleClose]);

  /**
   * Toggle open and closed state.
   */
  const handleOpenState = useCallback(() => {
    if (open) {
      handleCloseWhenLeave();
    } else {
      handleOpen();
    }
  }, [open, handleCloseWhenLeave, handleOpen]);

  const handleDelayedOpen = useCallback(() => {
    if (!enterable) {
      return handleOpen();
    }

    isOnTrigger.current = true;
    if (!isNil(delayCloseTimer.current)) {
      clearTimeout(delayCloseTimer.current);
      delayCloseTimer.current = null;
      return handleOpen();
    }

    if (open) {
      return;
    }

    handleOpen();
  }, [enterable, open, handleOpen]);

  const handleDelayedClose = useCallback(() => {
    if (!enterable) {
      handleClose();
    }

    isOnTrigger.current = false;
    if (!isNil(delayOpenTimer.current)) {
      clearTimeout(delayOpenTimer.current);
      delayOpenTimer.current = null;
      return;
    }

    if (!open || !isNil(delayCloseTimer.current)) {
      return;
    }

    delayCloseTimer.current = setTimeout(() => {
      clearTimeout(delayCloseTimer.current);
      delayCloseTimer.current = null;
      handleCloseWhenLeave();
    }, 200);
  }, [enterable, open, handleClose, handleCloseWhenLeave]);

  const handleSpeakerMouseEnter = useCallback(() => {
    isOnOverlay.current = true;
  }, []);

  const handleSpeakerMouseLeave = useCallback(() => {
    isOnOverlay.current = false;
    if (
      !isOneOf('click', trigger) &&
      !isOneOf('contextMenu', trigger) &&
      !isOneOf('active', trigger)
    ) {
      handleCloseWhenLeave();
    }
  }, [handleCloseWhenLeave, trigger]);

  const preventDefault = useCallback((event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
  }, []);

  const triggerEvents = { onClick, onContextMenu, onMouseOver, onMouseOut, onFocus, onBlur };

  if (!disabled && !readOnly && !plaintext) {
    if (isOneOf('click', trigger)) {
      triggerEvents.onClick = createChainedFunction(handleOpenState, triggerEvents.onClick);
    }

    if (isOneOf('contextMenu', trigger)) {
      triggerEvents.onContextMenu = createChainedFunction(
        preventDefault,
        handleOpenState,
        triggerEvents.onContextMenu
      );
    }

    if (isOneOf('active', trigger)) {
      triggerEvents.onClick = createChainedFunction(handleDelayedOpen, triggerEvents.onClick);
    }

    if (isOneOf('hover', trigger)) {
      let onMouseOverListener = null;
      let onMouseOutListener = null;

      if (trigger !== 'none') {
        onMouseOverListener = e => onMouseEventHandler(handleDelayedOpen, e);
        onMouseOutListener = e => onMouseEventHandler(handleDelayedClose, e);
      }
      triggerEvents.onMouseOver = createChainedFunction(onMouseOverListener, onMouseOver);
      triggerEvents.onMouseOut = createChainedFunction(onMouseOutListener, onMouseOut);
    }

    if (isOneOf('focus', trigger)) {
      triggerEvents.onFocus = createChainedFunction(handleDelayedOpen, onFocus);
      triggerEvents.onBlur = createChainedFunction(handleDelayedClose, onBlur);
    }
  }

  const renderOverlay = () => {
    const overlayProps: OverlayProps = {
      ...rest,
      triggerTarget: triggerRef,
      onClose: trigger !== 'none' ? createChainedFunction(handleClose, onClose) : undefined,
      placement,
      container,
      open
    };

    const speakerProps: React.HTMLAttributes<HTMLElement> = {
      id: controlId
    };

    // The purpose of adding mouse entry and exit events to the Overlay is to record whether the current cursor is on the Overlay.
    // When `trigger` is equal to `hover`, if the cursor leaves the `triggerTarget` and stays on the Overlay,
    // the Overlay will continue to remain open.
    if (trigger !== 'none' && enterable) {
      speakerProps.onMouseEnter = handleSpeakerMouseEnter;
      speakerProps.onMouseLeave = handleSpeakerMouseLeave;
    }

    return (
      <Overlay {...overlayProps} ref={overlayRef} childrenProps={speakerProps}>
        {typeof speaker === 'function'
          ? (props, ref) => {
              return speaker({ ...props, onClose: handleClose }, ref);
            }
          : speaker}
      </Overlay>
    );
  };
  return (
    <>
      {typeof children === 'function'
        ? children(triggerEvents, triggerRef)
        : React.cloneElement(children, {
            ref: triggerRef,
            'aria-describedby': controlId,
            ...mergeEvents(triggerEvents, children.props)
          })}
      <Portal>{renderOverlay()}</Portal>
    </>
  );
});

OverlayTrigger.displayName = 'OverlayTrigger';
OverlayTrigger.defaultProps = defaultProps;

export default OverlayTrigger;
