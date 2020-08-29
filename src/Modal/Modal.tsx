import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import BaseModal, { BaseModalProps, modalPropTypes } from '../Overlay/Modal';
import Bounce from '../Animation/Bounce';
import { createChainedFunction, useClassNames, mergeRefs, SIZE } from '../utils';
import ModalDialog, { modalDialogPropTypes } from './ModalDialog';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';
import ModalTitle from './ModalTitle';
import ModalFooter from './ModalFooter';
import helper from '../DOMHelper';
import { useBodyStyles } from './utils';
import { TypeAttributes, RsRefForwardingComponent } from '../@types/common';

interface ModalProps extends BaseModalProps {
  /** A modal can have different sizes */
  size?: TypeAttributes.Size;

  animationTimeout: number;

  animation: React.ElementType;

  /** CSS class applied to Dialog DOM nodes */
  dialogClassName?: string;

  /** CSS style applied to dialog DOM nodes */
  dialogStyle?: React.CSSProperties;

  /** Full screen */
  full?: boolean;

  /** You can use a custom element type for Dialog */
  dialogAs?: React.ElementType;

  /** Automatically sets the height when the body content is too long. */
  overflow: boolean;

  drawer: boolean;
}

const defaultProps: Partial<ModalProps> = {
  classPrefix: 'modal',
  size: 'sm',
  animation: Bounce,
  animationTimeout: 300,
  dialogAs: ModalDialog,
  overflow: true
};

export interface ModalContextProps {
  /** Pass the close event callback to the header close button. */
  onModalClose: (event: React.MouseEvent<Element, MouseEvent>) => void;

  /** Pass the latest style to body. */
  getBodyStyles?: () => React.CSSProperties;
}

export const ModalContext = React.createContext<ModalContextProps>(null);

interface ModalComponent extends RsRefForwardingComponent<'div', ModalProps> {
  Body?: typeof ModalBody;
  Header?: typeof ModalHeader;
  Title?: typeof ModalTitle;
  Footer?: typeof ModalFooter;
  Dialog?: typeof ModalDialog;
}

const Modal: ModalComponent = React.forwardRef((props: ModalProps, ref) => {
  const {
    className,
    children,
    classPrefix,
    dialogClassName,
    backdropClassName,
    dialogStyle,
    animation,
    open,
    size,
    full,
    dialogAs: Dialog,
    animationProps,
    animationTimeout,
    overflow,
    drawer,
    onClose,
    onEntered,
    onEntering,
    onExited,
    backdrop,
    ...rest
  } = props;

  const inClass = { in: open && !animation };
  const { merge, prefix } = useClassNames(classPrefix);
  const classes = merge(className, prefix(size, { full }));

  const dialogRef = useRef<HTMLElement>();
  const transitionEndListener = useRef<{ off: () => void }>();

  // The style of the Modal body will be updated with the size of the window or container.
  const [bodyStyles, onChangeBodyStyles, onDestroyEvents] = useBodyStyles(dialogRef, {
    overflow,
    drawer,
    prefix
  });

  const modalContextValue = useMemo(
    () => ({
      onModalClose: onClose,
      getBodyStyles: () => bodyStyles
    }),
    [onClose, bodyStyles]
  );

  const [shake, setShake] = useState(false);
  const handleBackdropClick = useCallback(() => {
    // When the value of `backdrop` is `static`, a jitter animation will be added to the dialog when clicked.
    if (backdrop === 'static') {
      setShake(true);
      transitionEndListener.current = helper.on(dialogRef.current, helper.transition().end, () => {
        setShake(false);
      });
    }
  }, [backdrop]);

  const handleExited = useCallback(() => {
    onDestroyEvents();
    transitionEndListener.current?.off();
  }, [onDestroyEvents]);

  useEffect(() => {
    transitionEndListener.current?.off();
  }, []);

  return (
    <ModalContext.Provider value={modalContextValue}>
      <BaseModal
        {...rest}
        ref={ref}
        backdrop={backdrop}
        open={open}
        onClose={onClose}
        onBackdropClick={handleBackdropClick}
        className={prefix`wrapper`}
        onEntered={createChainedFunction(onEntered, onChangeBodyStyles)}
        onEntering={createChainedFunction(onEntering, onChangeBodyStyles)}
        onExited={createChainedFunction(onExited, handleExited)}
        backdropClassName={merge(prefix`backdrop`, backdropClassName, inClass)}
        containerClassName={prefix(open, { 'has-backdrop': backdrop })}
        transition={animation ? animation : undefined}
        animationProps={animationProps}
        dialogTransitionTimeout={animationTimeout}
        backdropTransitionTimeout={150}
      >
        {(transitionProps, transitionRef) => {
          const { className: transitionClassName, ...transitionRest } = transitionProps;
          return (
            <Dialog
              {...transitionRest}
              {...pick(rest, Object.keys(modalDialogPropTypes))}
              ref={mergeRefs(dialogRef, transitionRef)}
              classPrefix={classPrefix}
              className={merge(classes, transitionClassName, prefix({ shake }))}
              dialogClassName={dialogClassName}
              dialogStyle={dialogStyle}
            >
              {children}
            </Dialog>
          );
        }}
      </BaseModal>
    </ModalContext.Provider>
  );
});

Modal.Body = ModalBody;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Footer = ModalFooter;
Modal.Dialog = ModalDialog;

Modal.displayName = 'Modal';
Modal.defaultProps = defaultProps;
Modal.propTypes = {
  ...modalPropTypes,
  animation: PropTypes.any,
  animationTimeout: PropTypes.number,
  classPrefix: PropTypes.string,
  dialogClassName: PropTypes.string,
  size: PropTypes.oneOf(SIZE),
  dialogStyle: PropTypes.object,
  dialogAs: PropTypes.elementType,
  full: PropTypes.bool,
  overflow: PropTypes.bool,
  drawer: PropTypes.bool
};

export default Modal;
