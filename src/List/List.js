// @flow
import * as React from 'react';
import setStatic from 'recompose/setStatic';
import classNames from 'classnames';
import _ from 'lodash';
import { setDisplayName } from 'recompose';
import { on } from 'dom-lib';
import {
  setInlineStyles,
  setTranslate3d,
  setTransitionDuration,
  closest,
  getPosition,
  getEdgeOffset,
  getScrollingParent
} from './utils';
import { prefix, defaultProps, getUnhandledProps } from '../utils';
import ListItem from './ListItem';
import Manager from './Manager';
import AutoScroller from './AutoScroller';

const NodeType = {
  Anchor: 'A',
  Button: 'BUTTON',
  Canvas: 'CANVAS',
  Input: 'INPUT',
  Option: 'OPTION',
  Textarea: 'TEXTAREA',
  Select: 'SELECT'
};
const interactiveElements = [
  NodeType.Input,
  NodeType.Textarea,
  NodeType.Select,
  NodeType.Option,
  NodeType.Button
];

type SortStartCallback = (
  payload: { collection?: number | string, index?: number, node?: HTMLElement },
  event: Event
) => any;
type SortMoveCallback = (event: Event) => any;
type SortOverCallback = (payload: {
  collection: number | string,
  index?: number,
  newIndex?: number,
  oldIndex?: number
}) => any;
type SortCallback = (
  payload: {
    collection?: number | string,
    newIndex?: number,
    oldIndex?: number
  },
  event: Event
) => any;

export type Axis = {
  x: number,
  y: number
};
export type Position = {
  top?: number,
  left?: number,
  bottom?: number,
  right?: number
};
type Props = {
  bordered?: boolean,
  hover?: boolean,
  sortable?: boolean,
  size?: 'lg' | 'md' | 'sm',
  autoScroll?: boolean,
  pressDelay?: number,
  pressThreshold?: number,
  transitionDuration?: number,
  onSortStart?: SortStartCallback,
  onSortMove?: SortMoveCallback,
  onSortOver?: SortOverCallback,
  onSortEnd?: SortCallback,
  onSort?: SortCallback,
  className?: string,
  classPrefix: string,
  children?: React.Node
};
type State = {
  sorting: boolean,
  manager: Manager
};
type Context = {
  bordered?: boolean,
  size?: 'lg' | 'md' | 'sm',
  manager?: Manager | null
};

const defaultContext = {
  bordered: false,
  size: 'md',
  manager: null
};
export const { Provider, Consumer }: React.Context<Context> = React.createContext(defaultContext);

class List extends React.Component<Props, State> {
  static defaultProps = {
    size: 'md',
    autoScroll: true,
    pressDelay: 0,
    pressThreshold: 5,
    transitionDuration: 300
  };
  static handledProps = ['onSortStart', 'onSortMove', 'onSortOver', 'onSortEnd', 'onSort'];

  state = {
    sorting: false,
    manager: new Manager()
  };
  // actionEnv
  container: React$Ref<'div'>;
  containerBoundingRect: ClientRect;
  touched: boolean;
  scrollContainer: Element;
  scrollContainerInitialScroll: Position;
  autoScroller: AutoScroller;
  windowInitialScroll: Position;
  animatedNodeOffset: Array<Axis> = [];
  // activeNode
  activeNodeBoundingClientRect: ClientRect;
  activeNodeGhost: Element;
  activeNodeFlowBodyTranslate: Axis;
  activeNodeFlowBody: Element | null;
  activeNodeOffsetEdge: Position;
  activeNodeMarginOffset: Axis;
  activeNodeOldIndex: number;
  activeNodeNextIndex: number;
  activeNodeTranslateMin: Axis;
  activeNodeTranslateMax: Axis;
  // events
  windowStartListener: { off: Function };
  windowMoveListener: { off: Function };
  windowEndListener: { off: Function };
  sortMouseMoveListener: { off: Function };
  sortMouseEndListener: { off: Function };
  cursorInitialOffset: Axis;
  cursorCurrentPosition: Axis;
  pressTimer: TimeoutID;
  cancelTimer: TimeoutID;

  componentDidMount() {
    if (this.container instanceof Element) {
      this.scrollContainer = getScrollingParent(this.container) || this.container;
      this.autoScroller = new AutoScroller(this.scrollContainer, (offset: Position) => {
        this.activeNodeFlowBodyTranslate.x += offset.left;
        this.activeNodeFlowBodyTranslate.y += offset.top;
        this.animateNodes();
      });
      this.windowStartListener = on(this.container, 'mousedown', this.handleStart, {
        passive: false
      });
      this.windowMoveListener = on(this.container, 'mousemove', this.handleMove, {
        passive: false
      });
      this.windowEndListener = on(this.container, 'mouseup', this.handleEnd, { passive: false });
    }
  }

  componentWillUnmount() {
    this.windowStartListener && this.windowStartListener.off();
    this.windowMoveListener && this.windowMoveListener.off();
    this.windowEndListener && this.windowEndListener.off();
  }

  handleStart = (event: MouseEvent) => {
    const { sortable, pressDelay } = this.props;
    const { sorting, manager } = this.state;
    const node = closest(event.target, el => !!manager.getNodeManagerRef(el));
    const curManager = manager.getNodeManagerRef(node);
    if (!(event && event.target && node instanceof Element && curManager)) {
      return;
    }
    const {
      info: { disabled, manager: curNodeManager }
    } = curManager;
    if (
      //is sortable
      sortable &&
      //is list item
      !disabled &&
      //is not secondary button pressed
      event.button !== 2 &&
      //is this list
      curNodeManager === manager &&
      //is not sorting
      !sorting &&
      //excludes interactive elements
      !node.contains(
        closest(
          event.target,
          el => interactiveElements.includes(el.tagName) || el.contentEditable === 'true'
        )
      )
    ) {
      event.preventDefault();
      this.touched = true;
      this.cursorCurrentPosition = getPosition(event);
      manager.setActive(curManager);
      this.pressTimer = setTimeout(() => this.handlePress(event), pressDelay);
    }
  };

  handleMove = (event: MouseEvent) => {
    event.preventDefault();
    const { pressThreshold } = this.props;
    const { sorting } = this.state;

    if (!sorting && this.touched) {
      const position = getPosition(event);
      const delta = {
        x: this.cursorCurrentPosition.x - _.get(position, 'x', 0),
        y: this.cursorCurrentPosition.y - _.get(position, 'y', 0)
      };
      const combinedDelta = Math.abs(+delta.x) + Math.abs(+delta.y);
      if (!pressThreshold || combinedDelta >= pressThreshold) {
        clearTimeout(this.cancelTimer);
        this.cancelTimer = setTimeout(this.cancel, 0);
      }
    }
  };

  handleEnd = () => {
    this.touched = false;
    this.cancel();
  };

  cancel = () => {
    const { sorting, manager } = this.state;
    if (!sorting) {
      clearTimeout(this.pressTimer);
      manager.setActive(null);
    }
  };

  handlePress = async (event: MouseEvent) => {
    event.preventDefault();
    const { classPrefix, onSortStart } = this.props;
    const { manager } = this.state;
    const { node: activeNode, info } = manager.getActive() || {};

    // return if no active node
    if (!activeNode || !info) {
      return;
    }

    const { index, collection } = info;
    const addItemPrefix = prefix(classPrefix + '-item');
    const style = window.getComputedStyle(activeNode);
    const activeNodeMargin = {
      bottom: parseFloat(style.marginBottom),
      left: parseFloat(style.marginLeft),
      right: parseFloat(style.marginRight),
      top: parseFloat(style.marginTop)
    };
    this.activeNodeMarginOffset = {
      x: activeNodeMargin.left + activeNodeMargin.right,
      y: Math.max(activeNodeMargin.top, activeNodeMargin.bottom)
    };
    this.activeNodeBoundingClientRect = activeNode.getBoundingClientRect();
    this.containerBoundingRect = this.scrollContainer.getBoundingClientRect();
    this.activeNodeOldIndex = index;
    this.activeNodeNextIndex = index;
    this.activeNodeOffsetEdge = getEdgeOffset(activeNode, this.container);
    this.cursorInitialOffset = getPosition(event);
    this.scrollContainerInitialScroll = {
      left: this.scrollContainer.scrollLeft,
      top: this.scrollContainer.scrollTop
    };
    this.windowInitialScroll = {
      left: window.pageXOffset,
      top: window.pageYOffset
    };
    this.activeNodeFlowBody =
      document.body && document.body.appendChild(activeNode.cloneNode(true));
    this.activeNodeFlowBody && this.activeNodeFlowBody.classList.add(addItemPrefix('helper'));
    setInlineStyles(this.activeNodeFlowBody, {
      position: 'fixed',
      width: `${this.activeNodeBoundingClientRect.width}px`,
      height: `${this.activeNodeBoundingClientRect.height}px`,
      left: `${this.activeNodeBoundingClientRect.left - activeNodeMargin.left}px`,
      top: `${this.activeNodeBoundingClientRect.top - activeNodeMargin.top}px`
    });
    this.activeNodeGhost = activeNode;
    activeNode.classList.add(addItemPrefix('holder'));
    this.activeNodeTranslateMin = {};
    this.activeNodeTranslateMax = {};
    this.activeNodeTranslateMin.y =
      this.containerBoundingRect.top -
      this.activeNodeBoundingClientRect.top -
      this.activeNodeBoundingClientRect.height / 2;
    this.activeNodeTranslateMax.y =
      this.containerBoundingRect.top +
      this.containerBoundingRect.height -
      this.activeNodeBoundingClientRect.top -
      this.activeNodeBoundingClientRect.height / 2;

    this.sortMouseMoveListener = on(window, 'mousemove', this.handleSortMove, { passive: false });
    this.sortMouseEndListener = on(window, 'mouseup', this.handleSortEnd, { passive: false });

    this.setState({ sorting: true });

    if (onSortStart) {
      onSortStart({ collection, index, node: activeNode }, event);
    }
  };

  handleSortMove = (event: MouseEvent) => {
    event.preventDefault();
    const { onSortMove } = this.props;

    // Update helper position
    const offset = getPosition(event);
    const translate = {
      x: _.get(offset, 'x', 0) - this.cursorInitialOffset.x,
      y: _.get(offset, 'y', 0) - this.cursorInitialOffset.y
    };
    // Adjust for window scroll
    translate.y -= window.pageYOffset - (this.windowInitialScroll.top || 0);
    translate.x -= window.pageXOffset - (this.windowInitialScroll.left || 0);
    this.activeNodeFlowBodyTranslate = translate;
    setTranslate3d(this.activeNodeFlowBody, translate);
    this.animateNodes();
    this.autoScroll();

    if (onSortMove) {
      onSortMove(event);
    }
  };

  handleSortEnd = (event: MouseEvent) => {
    const { onSortEnd, onSort, classPrefix, transitionDuration } = this.props;
    const { manager } = this.state;
    const activeManagerRef = manager.getActive();
    const activeCollection = activeManagerRef ? activeManagerRef.info.collection : 0;
    const managerRefs = manager.getOrderedRefs(activeCollection);
    const addItemPrefix = prefix(classPrefix + '-item');

    // Remove the event listeners
    this.sortMouseMoveListener.off();
    this.sortMouseEndListener.off();

    setTranslate3d(this.activeNodeFlowBody, this.holderTranslate);
    setTransitionDuration(this.activeNodeFlowBody, transitionDuration);

    // wait for animation
    setTimeout(() => {
      // Remove the helper from the DOM
      if (this.activeNodeFlowBody) {
        this.activeNodeFlowBody.parentNode &&
          this.activeNodeFlowBody.parentNode.removeChild(this.activeNodeFlowBody);
        this.activeNodeFlowBody = null;
      }

      if (this.activeNodeGhost) {
        this.activeNodeGhost.classList.remove(addItemPrefix('holder'));
        setTranslate3d(this.activeNodeGhost, null);
        this.animatedNodeOffset = [];
      }

      for (let i = 0, len = managerRefs.length; i < len; i++) {
        const managerRef = managerRefs[i];
        const el = managerRef.node;

        // Clear the cached offsetTop / offsetLeft value
        managerRef.edgeOffset = null;
        // Remove the transforms / transitions
        setTranslate3d(el, null);
        setTransitionDuration(el, null);
      }

      // Stop autoScroll
      this.autoScroller.clear();

      // Update manager state
      manager.setActive(null);
      this.setState({ sorting: false });

      if (typeof onSortEnd === 'function') {
        onSortEnd(
          {
            collection: activeCollection,
            newIndex: this.activeNodeNextIndex,
            oldIndex: this.activeNodeOldIndex
          },
          event
        );
      }
      if (typeof onSort === 'function') {
        onSort(
          {
            collection: activeCollection,
            newIndex: this.activeNodeNextIndex,
            oldIndex: this.activeNodeOldIndex
          },
          event
        );
      }
    }, transitionDuration);
  };

  animateNodes() {
    const { transitionDuration, onSortOver } = this.props;
    const { manager } = this.state;
    const listItemManagerRefs = manager.getOrderedRefs();
    const sortingOffset: Position = {
      left:
        this.activeNodeOffsetEdge.left +
        this.activeNodeFlowBodyTranslate.x +
        this.containerScrollDelta.left,
      top:
        this.activeNodeOffsetEdge.top +
        this.activeNodeFlowBodyTranslate.y +
        this.containerScrollDelta.top
    };

    const prevIndex = this.activeNodeNextIndex;
    this.activeNodeNextIndex = -1;

    for (let i = 0, len = listItemManagerRefs.length; i < len; i++) {
      const {
        node,
        info: { index },
        edgeOffset
      } = listItemManagerRefs[i];
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const offset: { height: number, width: number } = {
        height:
          this.activeNodeBoundingClientRect.height > height
            ? height / 2
            : this.activeNodeBoundingClientRect.height / 2,
        width:
          this.activeNodeBoundingClientRect.width > width
            ? width / 2
            : this.activeNodeBoundingClientRect.width / 2
      };

      const translate: Axis = {
        x: 0,
        y: 0
      };

      // If we haven't cached the node's offsetTop / offsetLeft value
      const curEdgeOffset = edgeOffset || getEdgeOffset(node, this.container);
      listItemManagerRefs[i].edgeOffset = curEdgeOffset;

      // Get a reference to the next and previous node
      const nextNode = i < len - 1 && listItemManagerRefs[i + 1];

      // Also cache the next node's edge offset if needed.
      // We need this for calculating the animation in a grid setup
      if (nextNode && !nextNode.edgeOffset) {
        nextNode.edgeOffset = getEdgeOffset(nextNode.node, this.container);
      }

      // If the node is the one we're currently animating, skip it
      if (index === this.activeNodeOldIndex) {
        continue;
      }

      setTransitionDuration(node, transitionDuration);
      const offsetY = this.activeNodeBoundingClientRect.height + this.activeNodeMarginOffset.y;
      const distanceTop = sortingOffset.top + this.windowScrollDelta.top || 0;

      if (
        index > this.activeNodeOldIndex &&
        distanceTop + offset.height >= (curEdgeOffset.top || 0)
      ) {
        translate.y = -offsetY;
        this.activeNodeNextIndex = index;
      } else if (
        index < this.activeNodeOldIndex &&
        distanceTop <= curEdgeOffset.top + offset.height
      ) {
        translate.y = offsetY;
        if (this.activeNodeNextIndex === -1) {
          this.activeNodeNextIndex = index;
        }
      }
      setTranslate3d(node, translate);

      // translate holder
      this.animatedNodeOffset[index] = translate;
      setTranslate3d(this.activeNodeGhost, this.holderTranslate);
    }

    if (this.activeNodeNextIndex === -1) {
      this.activeNodeNextIndex = this.activeNodeOldIndex;
    }

    if (onSortOver && this.activeNodeNextIndex !== prevIndex) {
      onSortOver({
        collection: _.get(manager, ['active', 'collection']),
        index: this.activeNodeOldIndex,
        newIndex: this.activeNodeNextIndex,
        oldIndex: prevIndex
      });
    }
  }

  autoScroll = () =>
    this.props.autoScroll &&
    this.autoScroller.update({
      width: this.activeNodeBoundingClientRect.width,
      height: this.activeNodeBoundingClientRect.height,
      translate: this.activeNodeFlowBodyTranslate,
      maxTranslate: this.activeNodeTranslateMax,
      minTranslate: this.activeNodeTranslateMin
    });

  get containerScrollDelta(): Position {
    return {
      left: this.scrollContainer.scrollLeft - (this.scrollContainerInitialScroll.left || 0),
      top: this.scrollContainer.scrollTop - (this.scrollContainerInitialScroll.top || 0)
    };
  }

  get windowScrollDelta(): Position {
    return {
      left: window.pageXOffset - (this.windowInitialScroll.left || 0),
      top: window.pageYOffset - (this.windowInitialScroll.top || 0)
    };
  }

  get holderTranslate(): Axis {
    const { manager } = this.state;
    let translateX = 0;
    let translateY = 0;
    this.animatedNodeOffset.forEach(({ x, y }: Axis, index) => {
      const nodeItems = manager.getOrderedRefs();
      const nodeItem = nodeItems.find(nodeInfo => nodeInfo.info.index === index);
      const node = _.get(nodeItem, 'node');
      if (!nodeItem || !node) {
        return;
      }
      const style = window.getComputedStyle(node);
      const margin = {
        bottom: parseFloat(style.marginBottom),
        left: parseFloat(style.marginLeft),
        right: parseFloat(style.marginRight),
        top: parseFloat(style.marginTop)
      };
      const marginOffset = {
        x: margin.left + margin.right,
        y: Math.max(margin.top, margin.bottom)
      };
      if (!nodeItem.edgeOffset) {
        nodeItem.edgeOffset = getEdgeOffset(node, this.container);
      }
      const offsetX = node.offsetWidth + marginOffset.x;
      const offsetY = node.offsetHeight + marginOffset.y;

      if (x) {
        translateX += +x / Math.abs(+x) * offsetX;
      }
      if (y) {
        translateY += +y / Math.abs(+y) * offsetY;
      }
    });
    return {
      x:
        (this.scrollContainerInitialScroll.left || 0) -
        this.scrollContainer.scrollLeft -
        translateX,
      y: (this.scrollContainerInitialScroll.top || 0) - this.scrollContainer.scrollTop - translateY
    };
  }

  render() {
    const {
      className,
      classPrefix,
      bordered,
      hover,
      size,
      sortable,
      children,
      ...rest
    } = this.props;
    const { sorting, manager } = this.state;
    const addPrefix = prefix(classPrefix);
    const unhandled = getUnhandledProps(List, rest);
    const classes = classNames(classPrefix, className, {
      [addPrefix('bordered')]: bordered,
      [addPrefix('sortable')]: sortable,
      [addPrefix('sorting')]: sorting,
      [addPrefix('hover')]: hover
    });
    const contextValue: Context = {
      bordered,
      size,
      manager
    };
    return (
      <Provider value={contextValue}>
        <div ref={ref => (this.container = ref)} className={classes} {...unhandled}>
          {children}
        </div>
      </Provider>
    );
  }
}

const EnhancedList = defaultProps({
  classPrefix: 'list'
})(List);

setStatic('Item', ListItem)(EnhancedList);
const Component: EnhancedList = setDisplayName('List')(EnhancedList);

export default Component;
