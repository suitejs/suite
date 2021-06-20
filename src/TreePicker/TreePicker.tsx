import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { pick, omit, isUndefined, isNil, isFunction } from 'lodash';
import { List, AutoSizer, ListInstance, ListRowProps } from '../Picker/VirtualizedList';
import TreeNode from './TreeNode';
import { PickerLocale } from '../locales';
import {
  createChainedFunction,
  useClassNames,
  useCustom,
  useControlled,
  TREE_NODE_DROP_POSITION,
  KEY_VALUES,
  mergeRefs,
  shallowEqual
} from '../utils';

import {
  getExpandWhenSearching,
  hasVisibleChildren,
  getDragNodeKeys,
  calDropNodePosition,
  createUpdateTreeDataFunction,
  useTreeDrag,
  useFlattenTreeData,
  getTreeActiveNode,
  getDefaultExpandItemValues,
  useTreeNodeRefs,
  useTreeSearch,
  focusPreviousItem,
  getFocusableItems,
  focusNextItem,
  getActiveItem,
  toggleExpand,
  useGetTreeNodeChildren,
  focusToActiveTreeNode,
  leftArrowHandler,
  focusTreeNode,
  rightArrowHandler
} from '../utils/treeUtils';

import {
  PickerToggle,
  PickerOverlay,
  SearchBar,
  PickerToggleTrigger,
  createConcatChildrenFunction,
  usePickerClassName,
  onMenuKeyDown,
  usePublicMethods,
  listPickerPropTypes,
  listPickerDefaultProps,
  OverlayTriggerInstance,
  pickTriggerPropKeys,
  omitTriggerPropKeys,
  PositionChildProps,
  PickerComponent,
  useToggleKeyDownEvent
} from '../Picker';

import { TreeDragProps, TreeBaseProps } from '../Tree/Tree';
import { FormControlPickerProps, ItemDataType } from '../@types/common';

import { TreeNodeType } from '../CheckTreePicker/utils';

// default value for virtualized
export const maxTreeHeight = 320;

export interface TreePickerProps<T = number | string>
  extends TreeBaseProps<T, ItemDataType>,
    TreeDragProps,
    FormControlPickerProps<T, PickerLocale, ItemDataType> {
  /** The height of Dropdown */
  height?: number;

  /** Tree node cascade */
  cascade?: boolean;

  /** A picker that can be counted */
  countable?: boolean;

  /** Whether display search input box */
  searchable?: boolean;

  /** Whether using virtualized list */
  virtualized?: boolean;

  /** Set the option value for the expand node */
  defaultExpandItemValues?: ItemDataType[];

  /** Set the option value for the expand node with controlled*/
  expandItemValues?: ItemDataType[];

  /** Custom render selected items */
  renderValue?: (
    value: T,
    selectedItems: ItemDataType,
    selectedElement: React.ReactNode
  ) => React.ReactNode;

  /** Called when scrolling */
  onScroll?: (event: React.SyntheticEvent<HTMLElement>) => void;
}

const defaultProps: Partial<TreePickerProps> = {
  ...listPickerDefaultProps,
  classPrefix: 'picker',
  as: 'div',
  height: 360,
  appearance: 'default',
  searchable: true,
  cleanable: true,
  menuAutoWidth: true,
  placement: 'bottomStart'
};

const TreePicker: PickerComponent<TreePickerProps> = React.forwardRef((props, ref) => {
  const {
    as: Component,
    data,
    style,
    value: controlledValue,
    inline,
    locale: overrideLocale,
    height,
    className,
    disabled,
    placement,
    cleanable,
    menuStyle,
    searchable,
    virtualized,
    classPrefix,
    defaultValue,
    placeholder,
    searchKeyword,
    menuClassName,
    menuAutoWidth,
    searchBy,
    toggleAs,
    labelKey,
    valueKey,
    childrenKey,
    draggable,
    defaultExpandAll,
    disabledItemValues,
    expandItemValues: controlledExpandItemValues,
    defaultExpandItemValues,
    id,
    getChildren,
    renderTreeIcon,
    renderTreeNode,
    onExited,
    onClean,
    onOpen,
    onSearch,
    onSelect,
    onChange,
    onEntered,
    onClose,
    onDragEnd,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onExpand,
    renderExtraFooter,
    renderMenu,
    renderValue,
    renderDragNode,
    ...rest
  } = props;
  const triggerRef = useRef<OverlayTriggerInstance>();
  const targetRef = useRef<HTMLButtonElement>();
  const listRef = useRef<ListInstance>();
  const overlayRef = useRef<HTMLDivElement>();
  const searchInputRef = useRef<HTMLInputElement>();
  const treeViewRef = useRef<HTMLDivElement>();
  const { rtl, locale } = useCustom<PickerLocale>('Picker', overrideLocale);

  const [value, setValue, isControlled] = useControlled(controlledValue, defaultValue);
  const {
    data: treeData,
    setData: setTreeData,
    loadingNodeValues,
    loadChildren
  } = useGetTreeNodeChildren(data, valueKey, childrenKey);

  const [expandItemValues, setExpandItemValues] = useControlled(
    controlledExpandItemValues,
    getDefaultExpandItemValues(treeData, {
      defaultExpandAll,
      valueKey,
      childrenKey,
      defaultExpandItemValues
    })
  );
  const [active, setActive] = useState(false);
  const [focusItemValue, setFocusItemValue] = useState(null);

  const { flattenNodes, forceUpdate, formatVirtualizedTreeData } = useFlattenTreeData({
    data: treeData,
    labelKey,
    valueKey,
    childrenKey,
    callback: () => {
      // after flattenData, always trigger re-render
      forceUpdate();
    }
  });
  const { prefix, merge } = useClassNames(classPrefix);
  const { prefix: treePrefix, withClassPrefix: withTreeClassPrefix } = useClassNames('tree');

  const {
    filteredData,
    searchKeywordState,
    setSearchKeyword,
    handleSearch,
    setFilteredData
  } = useTreeSearch({
    labelKey,
    childrenKey,
    searchKeyword,
    data: treeData,
    searchBy,
    callback: (
      searchKeyword: string,
      _filterData: TreeNodeType[],
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      onSearch?.(searchKeyword, event);
    }
  });

  const {
    dragNodeKeys,
    dragOverNodeKey,
    dragNode,
    dropNodePosition,
    setDragNodeKeys,
    setDragOverNodeKey,
    setDragNode,
    setDropNodePosition
  } = useTreeDrag();

  const { treeNodesRefs, saveTreeNodeRef } = useTreeNodeRefs();

  const activeNode = getTreeActiveNode(flattenNodes, value, valueKey);

  const getFormattedNodes = useCallback(
    (render?: any) => {
      let formattedNodes = [];
      if (virtualized) {
        formattedNodes = formatVirtualizedTreeData(
          flattenNodes,
          filteredData,
          expandItemValues
        ).filter(n => n.showNode && n.visible);
      } else {
        formattedNodes = filteredData.map((dataItem, index) => render?.(dataItem, index, 1));
      }

      return formattedNodes;
    },
    [expandItemValues, filteredData, flattenNodes, formatVirtualizedTreeData, virtualized]
  );

  const focusActiveNode = useCallback(() => {
    focusToActiveTreeNode({
      list: listRef.current,
      valueKey,
      selector: `.${treePrefix('node-active')}`,
      activeNode,
      virtualized,
      container: treeViewRef.current,
      formattedNodes: getFormattedNodes()
    });
  }, [treePrefix, activeNode, getFormattedNodes, valueKey, virtualized]);

  useEffect(() => {
    setFilteredData(data, searchKeywordState);
    setTreeData(data);
  }, [data, searchKeywordState, setFilteredData, setTreeData]);

  useEffect(() => {
    setFilteredData(treeData, searchKeywordState);
  }, [treeData, searchKeywordState, setFilteredData]);

  useEffect(() => {
    if (Array.isArray(controlledExpandItemValues)) {
      setExpandItemValues(controlledExpandItemValues);
    }
  }, [controlledExpandItemValues, setExpandItemValues]);

  useEffect(() => {
    setSearchKeyword(searchKeyword ?? '');
  }, [searchKeyword, setSearchKeyword]);

  const getDropData = useCallback(
    (nodeData: any) => {
      const options = { valueKey, childrenKey };
      return {
        /** draggingNode */
        dragNode,
        /** dropNode */
        dropNode: nodeData,
        /** dragAndDrop Position type */
        dropNodePosition,
        createUpdateDataFunction: createUpdateTreeDataFunction(
          {
            dragNode,
            dropNode: nodeData,
            dropNodePosition
          },
          options
        )
      };
    },
    [dragNode, valueKey, childrenKey, dropNodePosition]
  );

  const getTreeNodeProps = (node: any, layer: number, index?: number) => {
    const draggingNode = dragNode ?? {};
    return {
      as: Component,
      rtl,
      value: node[valueKey],
      label: node[labelKey],
      index,
      layer,
      loading: loadingNodeValues.some(item => shallowEqual(item, node[valueKey])),
      expand: node.expand,
      active: shallowEqual(node[valueKey], value),
      focus: shallowEqual(node[valueKey], focusItemValue),
      visible: node.visible,
      draggable,
      dragging: shallowEqual(node[valueKey], draggingNode[valueKey]),
      children: node[childrenKey],
      nodeData: node,
      disabled: disabledItemValues.some(disabledItem => shallowEqual(disabledItem, node[valueKey])),
      dragOver:
        shallowEqual(node[valueKey], dragOverNodeKey) &&
        dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER,
      dragOverTop:
        shallowEqual(node[valueKey], dragOverNodeKey) &&
        dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER_TOP,
      dragOverBottom:
        shallowEqual(node[valueKey], dragOverNodeKey) &&
        dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER_BOTTOM,
      onSelect: handleSelect,
      onDragStart: handleDragStart,
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDragEnd: handleDragEnd,
      onDrop: handleDrop,
      onExpand: handleExpand,
      onRenderTreeNode: renderTreeNode,
      onRenderTreeIcon: renderTreeIcon
    };
  };

  const handleSelect = useCallback(
    (nodeData: any, event: React.SyntheticEvent<any>) => {
      if (!nodeData) {
        return;
      }
      const nodeValue = nodeData[valueKey];
      if (!isControlled) {
        setValue(nodeValue);
      }

      setFocusItemValue(nodeData[valueKey]);
      onChange?.(nodeValue, event);
      onSelect?.(nodeData, nodeValue, event);
      targetRef.current?.focus();
      triggerRef.current?.close?.();
    },
    [valueKey, isControlled, onChange, onSelect, setValue]
  );

  const handleExpand = useCallback(
    (node: any) => {
      const nextExpandItemValues = toggleExpand({
        node: node,
        isExpand: !node.expand,
        expandItemValues,
        valueKey
      });
      setExpandItemValues(nextExpandItemValues);
      onExpand?.(
        nextExpandItemValues,
        node,
        createConcatChildrenFunction(node, node[valueKey], { valueKey, childrenKey })
      );
      if (
        isFunction(getChildren) &&
        !node.expand &&
        Array.isArray(node[childrenKey]) &&
        node[childrenKey].length === 0
      ) {
        loadChildren(node, getChildren);
      }
    },
    [
      valueKey,
      childrenKey,
      expandItemValues,
      getChildren,
      onExpand,
      setExpandItemValues,
      loadChildren
    ]
  );

  const handleDragStart = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      if (draggable) {
        setDragNodeKeys(getDragNodeKeys(nodeData, childrenKey, valueKey));
        setDragNode(flattenNodes[nodeData.refKey]);
        onDragStart?.(nodeData, event);
      }
    },
    [draggable, childrenKey, flattenNodes, onDragStart, setDragNodeKeys, setDragNode, valueKey]
  );

  const handleDragEnter = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      if (dragNodeKeys.some(d => shallowEqual(d, nodeData[valueKey]))) {
        return;
      }

      if (dragNode) {
        setDragOverNodeKey(nodeData[valueKey]);
        setDropNodePosition(calDropNodePosition(event, treeNodesRefs[nodeData.refKey]));
      }
      onDragEnter?.(nodeData, event);
    },
    [
      dragNode,
      treeNodesRefs,
      dragNodeKeys,
      onDragEnter,
      setDragOverNodeKey,
      setDropNodePosition,
      valueKey
    ]
  );

  const handleDragOver = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      if (dragNodeKeys.some(d => shallowEqual(d, nodeData[valueKey]))) {
        return;
      }

      if (dragNode && shallowEqual(nodeData[valueKey], dragOverNodeKey)) {
        const lastDropNodePosition = calDropNodePosition(event, treeNodesRefs[nodeData.refKey]);
        if (lastDropNodePosition === dropNodePosition) return;

        setDropNodePosition(lastDropNodePosition);
      }

      onDragOver?.(nodeData, event);
    },
    [
      dragNode,
      dragNodeKeys,
      dragOverNodeKey,
      dropNodePosition,
      onDragOver,
      setDropNodePosition,
      treeNodesRefs,
      valueKey
    ]
  );

  const handleDragLeave = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      onDragLeave?.(nodeData, event);
    },
    [onDragLeave]
  );

  const handleDragEnd = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      setDragNode(null);
      setDragNodeKeys([]);
      setDragOverNodeKey(null);
      onDragEnd?.(nodeData, event);
    },
    [setDragNode, setDragNodeKeys, setDragOverNodeKey, onDragEnd]
  );

  const handleDrop = useCallback(
    (nodeData: any, event: React.DragEvent) => {
      if (dragNodeKeys.some(d => shallowEqual(d, nodeData[valueKey]))) {
        console.error('Cannot drag a node to itself and its children');
      } else {
        const dropData = getDropData(nodeData);
        onDrop?.(dropData, event);
      }
      setDragNode(null);
      setDragNodeKeys([]);
      setDragOverNodeKey(null);
    },
    [dragNodeKeys, setDragNode, setDragOverNodeKey, setDragNodeKeys, onDrop, getDropData, valueKey]
  );

  const handleOpen = useCallback(() => {
    triggerRef.current?.open?.();
    focusActiveNode();
    onOpen?.();
    setActive(true);
  }, [focusActiveNode, onOpen]);

  const handleClose = useCallback(() => {
    triggerRef.current?.close?.();
    setSearchKeyword('');
    onClose?.();
    setActive(false);
    setFocusItemValue(activeNode?.[valueKey]);
    /**
     * when using keyboard toggle picker, should refocus on PickerToggle Component after close picker menu
     */
    targetRef.current?.focus();
  }, [activeNode, onClose, setSearchKeyword, valueKey]);

  usePublicMethods(ref, { triggerRef, overlayRef, targetRef });

  const handleFocusItem = useCallback(
    (key: string) => {
      const focusableItems = getFocusableItems(filteredData, {
        disabledItemValues,
        valueKey,
        childrenKey,
        expandItemValues
      });
      const selector = `.${treePrefix('node-label')}`;
      const focusProps = {
        focusItemValue,
        focusableItems,
        treeNodesRefs,
        selector,
        valueKey,
        callback: nextFocusItemValue => {
          setFocusItemValue(nextFocusItemValue);
        }
      };
      if (key === KEY_VALUES.DOWN) {
        focusNextItem(focusProps);
        return;
      }
      if (key === KEY_VALUES.UP) {
        focusPreviousItem(focusProps);
      }
    },
    [
      expandItemValues,
      filteredData,
      focusItemValue,
      treeNodesRefs,
      treePrefix,
      valueKey,
      childrenKey,
      disabledItemValues
    ]
  );

  const handleLeftArrow = useCallback(() => {
    const focusItem = getActiveItem(focusItemValue, flattenNodes, valueKey);
    leftArrowHandler({
      focusItem,
      expand: expandItemValues.includes(focusItem?.[valueKey]),
      onExpand: handleExpand,
      onFocusItem: () => {
        setFocusItemValue(focusItem?.parent?.[valueKey]);
        focusTreeNode(focusItem?.parent?.refKey, treeNodesRefs, `.${treePrefix('node-label')}`);
      }
    });
  }, [
    expandItemValues,
    flattenNodes,
    focusItemValue,
    handleExpand,
    treeNodesRefs,
    treePrefix,
    valueKey
  ]);

  const handleRightArrow = useCallback(() => {
    const focusItem = getActiveItem(focusItemValue, flattenNodes, valueKey);

    rightArrowHandler({
      focusItem,
      expand: expandItemValues.includes(focusItem?.[valueKey]),
      childrenKey,
      onExpand: handleExpand,
      onFocusItem: () => {
        handleFocusItem(KEY_VALUES.DOWN);
      }
    });
  }, [
    focusItemValue,
    flattenNodes,
    valueKey,
    expandItemValues,
    childrenKey,
    handleExpand,
    handleFocusItem
  ]);

  const selectActiveItem = useCallback(
    (event: React.SyntheticEvent<any>) => {
      const activeItem = getActiveItem(focusItemValue, flattenNodes, valueKey);
      handleSelect(activeItem, event);
    },
    [flattenNodes, valueKey, focusItemValue, handleSelect]
  );

  const handleClean = useCallback(
    (event: React.SyntheticEvent<any>) => {
      const target = event.target as Element;
      // exclude searchBar
      if (target.matches('div[role="searchbox"] > input')) {
        return;
      }
      setValue(null);
      onChange?.(null, event);
    },
    [onChange, setValue]
  );

  const onPickerKeydown = useToggleKeyDownEvent({
    toggle: !activeNode || !active,
    triggerRef,
    targetRef,
    overlayRef,
    searchInputRef,
    active,
    onExit: handleClean,
    onClose: handleClose,
    onMenuKeyDown: event => {
      onMenuKeyDown(event, {
        down: () => handleFocusItem(KEY_VALUES.DOWN),
        up: () => handleFocusItem(KEY_VALUES.UP),
        left: rtl ? handleRightArrow : handleLeftArrow,
        right: rtl ? handleLeftArrow : handleRightArrow,
        enter: selectActiveItem,
        del: handleClean
      });
    },
    ...rest
  });

  const handleTreeKeyDown = useCallback(
    (event: React.KeyboardEvent<any>) => {
      if (!treeViewRef.current) {
        return;
      }

      onMenuKeyDown(event, {
        down: () => handleFocusItem(KEY_VALUES.DOWN),
        up: () => handleFocusItem(KEY_VALUES.UP),
        left: rtl ? handleRightArrow : handleLeftArrow,
        right: rtl ? handleLeftArrow : handleRightArrow,
        enter: selectActiveItem
      });
    },
    [handleFocusItem, handleLeftArrow, handleRightArrow, rtl, selectActiveItem]
  );

  const renderNode = (node: any, index: number, layer: number) => {
    if (!node.visible) {
      return null;
    }

    const children = node[childrenKey];
    const expand = getExpandWhenSearching(
      searchKeywordState,
      expandItemValues.includes(node[valueKey])
    );
    const visibleChildren =
      isUndefined(searchKeywordState) || searchKeywordState.length === 0
        ? !!children
        : hasVisibleChildren(node, childrenKey);

    const nodeProps = {
      ...getTreeNodeProps({ ...node, expand }, layer, index),
      hasChildren: visibleChildren
    };

    if (nodeProps.hasChildren) {
      layer += 1;
      const openClass = treePrefix('open');
      const childrenClass = merge(treePrefix('node-children'), {
        [openClass]: expand && visibleChildren
      });

      const nodes = children || [];
      return (
        <div className={childrenClass} key={node[valueKey]}>
          <TreeNode {...nodeProps} ref={ref => saveTreeNodeRef(node.refKey, ref)} />
          <div className={treePrefix('children')}>
            {nodes.map((child, i) => renderNode(child, i, layer))}
          </div>
        </div>
      );
    }
    return (
      <TreeNode
        ref={ref => saveTreeNodeRef(node.refKey, ref)}
        key={node[valueKey]}
        {...nodeProps}
      />
    );
  };

  const renderVirtualListNode = (nodes: any[]) => ({ key, index, style }: ListRowProps) => {
    const node = nodes[index];
    const { layer, showNode } = node;

    const expand = getExpandWhenSearching(
      searchKeywordState,
      expandItemValues.includes(node[valueKey])
    );
    if (!node.visible) {
      return null;
    }

    const nodeProps = {
      ...getTreeNodeProps({ ...node, expand }, layer),
      style,
      hasChildren: node.hasChildren
    };

    return (
      showNode && (
        <TreeNode ref={ref => saveTreeNodeRef(node.refKey, ref)} key={key} {...nodeProps} />
      )
    );
  };

  const renderDefaultDragNode = () => {
    if (draggable) {
      let dragNodeContent = dragNode?.[labelKey];
      if (isFunction(renderDragNode)) {
        dragNodeContent = renderDragNode(dragNode);
      }
      return (
        <span id="drag-node" className={treePrefix('drag-node-mover')}>
          {dragNodeContent}
        </span>
      );
    }
    return null;
  };

  const renderTree = () => {
    const classes = withTreeClassPrefix({
      [className ?? '']: inline,
      virtualized
    });

    const formattedNodes = getFormattedNodes(renderNode);
    const styles = inline ? { height, ...style } : {};
    return (
      <React.Fragment>
        <div
          role="tree"
          id={id ? `${id}-listbox` : undefined}
          ref={treeViewRef}
          className={classes}
          style={styles}
          onKeyDown={inline ? handleTreeKeyDown : undefined}
        >
          <div className={treePrefix('nodes')}>
            {virtualized ? (
              <AutoSizer
                defaultHeight={inline ? height : maxTreeHeight}
                style={{ width: 'auto', height: 'auto' }}
              >
                {({ height, width }) => (
                  <List
                    ref={listRef}
                    width={width}
                    height={height}
                    rowHeight={36}
                    rowCount={formattedNodes.length}
                    rowRenderer={renderVirtualListNode(formattedNodes)}
                    scrollToAlignment="center"
                  />
                )}
              </AutoSizer>
            ) : (
              formattedNodes
            )}
          </div>
        </div>
        {renderDefaultDragNode()}
      </React.Fragment>
    );
  };

  const renderDropdownMenu = (positionProps: PositionChildProps, speakerRef) => {
    const { left, top, className } = positionProps;
    const classes = merge(className, menuClassName, prefix('tree-menu'));
    const mergedMenuStyle = { ...menuStyle, left, top };
    const styles = virtualized ? { height, ...mergedMenuStyle } : { ...mergedMenuStyle };

    return (
      <PickerOverlay
        autoWidth={menuAutoWidth}
        className={classes}
        style={styles}
        ref={mergeRefs(overlayRef, speakerRef)}
        onKeyDown={onPickerKeydown}
        target={triggerRef}
      >
        {searchable ? (
          <SearchBar
            placeholder={locale.searchPlaceholder}
            onChange={handleSearch}
            value={searchKeywordState}
            inputRef={searchInputRef}
          />
        ) : null}
        {renderMenu ? renderMenu(renderTree()) : renderTree()}
        {renderExtraFooter?.()}
      </PickerOverlay>
    );
  };

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValidValue = !isNil(activeNode) || (!isNil(value) && isFunction(renderValue));
  let selectedElement: React.ReactNode = placeholder;

  if (hasValidValue) {
    const node = activeNode ?? {};
    selectedElement = node[labelKey];
    if (isFunction(renderValue)) {
      selectedElement = renderValue(value, node, selectedElement);
      if (isNil(selectedElement)) {
        hasValidValue = false;
      }
    }
  }

  const [classes, usedClassNamePropKeys] = usePickerClassName({
    ...props,
    hasValue: hasValidValue,
    name: 'tree'
  });

  if (inline) {
    return renderTree();
  }

  return (
    <PickerToggleTrigger
      pickerProps={pick(props, pickTriggerPropKeys)}
      ref={triggerRef}
      placement={placement}
      onEnter={handleOpen}
      onEntered={onEntered}
      onExited={createChainedFunction(handleClose, onExited)}
      speaker={renderDropdownMenu}
    >
      <Component className={classes} style={style}>
        <PickerToggle
          {...omit(rest, [...omitTriggerPropKeys, ...usedClassNamePropKeys, 'cascade'])}
          id={id}
          ref={targetRef}
          onKeyDown={onPickerKeydown}
          onClean={createChainedFunction(handleClean, onClean)}
          cleanable={cleanable && !disabled}
          as={toggleAs}
          disabled={disabled}
          hasValue={hasValidValue}
          active={active}
          placement={placement}
          inputValue={value}
        >
          {selectedElement || locale.placeholder}
        </PickerToggle>
      </Component>
    </PickerToggleTrigger>
  );
});

TreePicker.displayName = 'TreePicker';
TreePicker.defaultProps = defaultProps;
TreePicker.propTypes = {
  ...listPickerPropTypes,
  locale: PropTypes.any,
  appearance: PropTypes.oneOf(['default', 'subtle']),
  height: PropTypes.number,
  inline: PropTypes.bool,
  draggable: PropTypes.bool,
  virtualized: PropTypes.bool,
  searchable: PropTypes.bool,
  menuAutoWidth: PropTypes.bool,
  searchKeyword: PropTypes.string,
  defaultExpandAll: PropTypes.bool,
  expandItemValues: PropTypes.array,
  defaultExpandItemValues: PropTypes.array,
  onSearch: PropTypes.func,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  renderMenu: PropTypes.func,
  renderTreeNode: PropTypes.func,
  renderTreeIcon: PropTypes.func,
  renderExtraFooter: PropTypes.func,
  renderDragNode: PropTypes.func,
  searchBy: PropTypes.func
};

export default TreePicker;
