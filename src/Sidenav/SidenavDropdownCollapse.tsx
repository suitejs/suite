import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Collapse from '../Animation/Collapse';
import { mergeRefs, useClassNames } from '../utils';
import { StandardProps } from '../@types/common';

export interface SidenavDropdownCollapseProps extends StandardProps {
  open?: boolean;
}

const defaultProps: Partial<SidenavDropdownCollapseProps> = {
  classPrefix: 'dropdown-menu'
};

const SidenavDropdownCollapse = React.forwardRef(
  (props: SidenavDropdownCollapseProps & React.HTMLAttributes<HTMLUListElement>, ref) => {
    const { className, classPrefix, open, ...restProps } = props;

    const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);

    const classes = merge(className, withClassPrefix());

    return (
      <Collapse
        in={open}
        exitedClassName={prefix`collapse-out`}
        exitingClassName={prefix`collapsing`}
        enteredClassName={prefix`collapse-in`}
        enteringClassName={prefix`collapsing`}
      >
        {(transitionProps, transitionRef) => {
          const { className: transitionClassName, ...transitionRestProps } = transitionProps;

          return (
            <ul
              ref={mergeRefs(ref, transitionRef)}
              role="group"
              className={classNames(classes, transitionClassName)}
              {...restProps}
              {...transitionRestProps}
            />
          );
        }}
      </Collapse>
    );
  }
);

SidenavDropdownCollapse.displayName = 'Sidenav.Dropdown.Collapse';
SidenavDropdownCollapse.defaultProps = defaultProps;
SidenavDropdownCollapse.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  open: PropTypes.bool
};

export default SidenavDropdownCollapse;
