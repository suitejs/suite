// @flow

import * as React from 'react';
import classNames from 'classnames';
import Transition from 'rsuite-utils/lib/Animation/Transition';
import { getWidth, getOffset } from 'dom-lib';

import { defaultProps, prefix } from './utils';

type Props = {
  classPrefix?: string,
  className?: string
};

type State = {
  rippling: boolean,
  position: Object
};

class Ripple extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      rippling: false,
      position: {}
    };
  }
  trigger = null;
  bindTriggerRef = ref => {
    this.trigger = ref;
  };
  getPosition = event => {
    const offset = getOffset(this.trigger);
    const offsetX = event.pageX - offset.left;
    const offsetY = event.pageY - offset.top;

    const radiusX = Math.max(offset.width - offsetX, offsetX);
    const radiusY = Math.max(offset.height - offsetY, offsetY);
    const radius = Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2));

    return {
      width: radius * 2,
      height: radius * 2,
      left: offsetX - radius,
      top: offsetY - radius
    };
  };
  handleMouseMown = event => {
    const position = this.getPosition(event);
    this.setState({
      rippling: true,
      position
    });
  };

  handleRippled = () => {
    this.setState({
      rippling: false
    });
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  render() {
    const { className, classPrefix, ...props } = this.props;
    const classes = classNames(this.addPrefix('pond'), className);
    const { position, rippling } = this.state;

    return (
      <span
        {...props}
        className={classes}
        ref={this.bindTriggerRef}
        onMouseDown={this.handleMouseMown}
      >
        <Transition
          in={rippling}
          enteringClassName={this.addPrefix('rippling')}
          onEntered={this.handleRippled}
        >
          <span className={classPrefix} style={position} />
        </Transition>
      </span>
    );
  }
}

export default defaultProps({
  classPrefix: 'ripple'
})(Ripple);
