import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isNil, pick, isFunction, omit, cloneDeep, isUndefined } from 'lodash';
import { List, AutoSizer, ListInstance, ListRowProps } from '../Picker/VirtualizedList';
import CheckTreeNode from './CheckTreeNode';
import { PickerLocale } from '../locales';
import {
  createChainedFunction,
  useCustom,
  useClassNames,
  useControlled,
  KEY_VALUES,
  mergeRefs,
  shallowEqual
} from '../utils';

import {
  PickerToggle,
  onMenuKeyDown,
  PickerOverlay,
  SearchBar,
  SelectedElement,
  PickerToggleTrigger,
  createConcatChildrenFunction,
  usePickerClassName,
  usePublicMethods,
  OverlayTriggerInstance,
  pickTriggerPropKeys,
  omitTriggerPropKeys,
  PositionChildProps,
  listPickerPropTypes,
  listPickerDefaultProps,
  PickerComponent,
  useToggleKeyDownEvent
} from '../Picker';

import {
  isEveryChildChecked,
  isSomeNodeHasChildren,
  isAllSiblingNodeUncheckable,
  TreeNodesType,
  isEveryFirstLevelNodeUncheckable,
  getFormattedTree,
  getDisabledState,
  getCheckTreePickerDefaultValue,
  getSelectedItems,
  isNodeUncheckable,
  TreeNodeType
} from './utils';

import {
  hasVisibleChildren,
  getExpandWhenSearching,
  useTreeSearch,
  useTreeNodeRefs,
  getDefaultExpandItemValues,
  useFlattenTreeData,
  focusNextItem,
  getFocusableItems,
  focusPreviousItem,
  toggleExpand,
  getActiveItem,
  useGetTreeNodeChildren,
  focusToActiveTreeNode,
  focusTreeNode,
  leftArrowHandler,
  rightArrowHandler
} from '../utils/treeUtils';

import { TreeBaseProps } from '../Tree/Tree';
import { FormControlPickerProps, ItemDataType } from '../@types/common';
import { maxTreeHeight } from '../TreePicker/TreePicker';

export type ValueType = (string | number)[];
export interface CheckTreePickerProps<T = ValueType>
  extends TreeBaseProps<T, ItemDataType>,
    FormControlPickerProps<T, PickerLocale, ItemDataType> {
  /** Tree node cascade */
  cascade?: boolean;

  /** A picker that can be counted */
  countable?: boolean;

  /** default value */

  /** Set the option value for the check box not to be rendered */
  uncheckableItemValues?: T;

  /** Custom render selected items */
  renderValue?: (
    value: any[],
    selectedItems: any[],
    selectedElement: React.ReactNode
  ) => React.ReactNode;

  /** Called when scrolling */
  onScroll?: (event: React.SyntheticEvent<HTMLElement>) => void;
}

const defaultProps: Partial<CheckTreePickerProps> = {
  ...listPickerDefaultProps,
  as: 'div',
  height: 360,
  cascade: true,
  countable: true,
  searchable: true,
  menuAutoWidth: true,
  defaultValue: [],
  appearance: 'default',
  uncheckableItemValues: [],
  classPrefix: 'picker',
  placement: 'bottomStart'
};

const CheckTreePicker: PickerComponent<CheckTreePickerProps> = React.forwardRef((props, ref) => {
  const {
    as: Component,
    data,
    style,
    cleanable,
    countable,
    searchBy,
    toggleAs,
    searchKeyword,
    locale: overrideLocale,
    inline,
    cascade,
    disabled,
    valueKey,
    labelKey,
    placement,
    childrenKey,
    placeholder,
    value: controlledValue,
    defaultValue,
    defaultExpandAll,
    disabledItemValues,
    expandItemValues: controlledExpandItemValues,
    defaultExpandItemValues,
    height,
    menuStyle,
    searchable,
    virtualized,
    className,
    classPrefix,
    menuClassName,
    menuAutoWidth,
    uncheckableItemValues,
    id,
    renderMenu,
    getChildren,
    renderExtraFooter,
    onEntered,
    onChange,
    onClean,
    onClose,
    onExited,
    onSearch,
    onSelect,
    onOpen,
    onScroll,
    onExpand,
    renderValue,
    renderTreeIcon,
    renderTreeNode,
    ...rest
  } = props;
  const triggerRef = useRef<OverlayTriggerInstance>();
  const targetRef = useRef<HTMLButtonElement>();
  const listRef = useRef<ListInstance>();
  const overlayRef = useRef<HTMLDivElement>();
  const searchInputRef = useRef<HTMLInputElement>();
  const treeViewRef = useRef<HTMLDivElement>();
  const { rtl, locale } = useCustom<PickerLocale>('Picker', overrideLocale);
  const [active, setActive] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const { prefix, merge } = useClassNames(classPrefix);
  const { prefix: checkTreePrefix, withClassPrefix: withCheckTreeClassPrefix } = useClassNames(
    'check-tree'
  );

  const [value, setValue, isControlled] = useControlled<ValueType>(controlledValue, defaultValue);
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

  const [focusItemValue, setFocusItemValue] = useState(null);

  const {
    flattenNodes,
    forceUpdate,
    formatVirtualizedTreeData,
    serializeListOnlyParent,
    unSerializeList
  } = useFlattenTreeData({
    data: treeData,
    labelKey,
    valueKey,
    childrenKey,
    uncheckableItemValues,
    callback: nodes => {
      // after flattenData, always unSerialize check property value
      unSerializeList({ nodes, key: 'check', value, cascade, uncheckableItemValues });
      forceUpdate();
    }
  });

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

  const { treeNodesRefs, saveTreeNodeRef } = useTreeNodeRefs();

  /**
   * get formatted nodes for render tree
   * @params render - renderNode function. only used when virtualized setting false
   */
  const getFormattedNodes = useCallback(
    (render?: any) => {
      let formattedNodes = [];
      if (virtualized) {
        formattedNodes = formatVirtualizedTreeData(
          flattenNodes,
          filteredData,
          expandItemValues,
          cascade
        ).filter(item => item.showNode && item.visible);
      } else {
        formattedNodes = getFormattedTree(filteredData, flattenNodes, {
          childrenKey,
          cascade
        }).map(node => render?.(node, 1));
      }
      return formattedNodes;
    },
    [
      expandItemValues,
      filteredData,
      flattenNodes,
      formatVirtualizedTreeData,
      virtualized,
      childrenKey,
      cascade
    ]
  );

  const getTreeNodeProps = (node: any, layer: number) => {
    return {
      as: Component,
      rtl,
      value: node[valueKey],
      label: node[labelKey],
      layer,
      focus: shallowEqual(focusItemValue, node[valueKey]),
      expand: node.expand,
      visible: node.visible,
      loading: loadingNodeValues.some(item => shallowEqual(item, node[valueKey])),
      disabled: getDisabledState(flattenNodes, node, { disabledItemValues, valueKey }),
      nodeData: node,
      checkState: node.checkState,
      uncheckable: isNodeUncheckable(node, { uncheckableItemValues, valueKey }),
      allUncheckable: isAllSiblingNodeUncheckable(
        node,
        flattenNodes,
        uncheckableItemValues,
        valueKey
      ),
      onSelect: handleSelect,
      onExpand: handleExpand,
      onRenderTreeNode: renderTreeNode,
      onRenderTreeIcon: renderTreeIcon
    };
  };

  const focusActiveNode = useCallback(() => {
    focusToActiveTreeNode({
      list: listRef.current,
      valueKey,
      selector: `.${checkTreePrefix('node-active')}`,
      activeNode,
      virtualized,
      container: treeViewRef.current,
      formattedNodes: getFormattedNodes()
    });
  }, [checkTreePrefix, activeNode, getFormattedNodes, valueKey, virtualized]);

  useEffect(() => {
    setValue(getCheckTreePickerDefaultValue(value, uncheckableItemValues));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    unSerializeList({
      nodes: flattenNodes,
      key: 'check',
      value,
      cascade,
      uncheckableItemValues
    });
    forceUpdate();
  }, [cascade, value, uncheckableItemValues, unSerializeList, flattenNodes, forceUpdate]);

  const toggleUpChecked = useCallback(
    (nodes: TreeNodesType, node: TreeNodeType, checked: boolean) => {
      const currentNode = nodes[node.refKey];
      if (cascade) {
        if (!checked) {
          currentNode.check = checked;
          currentNode.checkAll = checked;
        } else {
          if (isEveryChildChecked(nodes, currentNode)) {
            currentNode.check = true;
            currentNode.checkAll = true;
          } else {
            currentNode.check = false;
            currentNode.checkAll = false;
          }
        }
        if (currentNode.parent) {
          toggleUpChecked(nodes, currentNode.parent, checked);
        }
      }
    },
    [cascade]
  );

  const toggleDownChecked = useCallback(
    (nodes: TreeNodesType, node: TreeNodeType, isChecked: boolean) => {
      const currentNode = nodes[node.refKey];
      currentNode.check = isChecked;

      if (!currentNode[childrenKey] || !currentNode[childrenKey].length || !cascade) {
        currentNode.checkAll = false;
      } else {
        currentNode.checkAll = isChecked;
        currentNode[childrenKey].forEach(child => {
          toggleDownChecked(nodes, child, isChecked);
        });
      }
    },
    [cascade, childrenKey]
  );

  const toggleChecked = useCallback(
    (node: TreeNodeType, isChecked: boolean) => {
      const nodes = cloneDeep(flattenNodes);
      toggleDownChecked(nodes, node, isChecked);
      node.parent && toggleUpChecked(nodes, node.parent, isChecked);
      const values = serializeListOnlyParent(nodes, 'check');
      // filter uncheckableItemValues
      return values.filter(v => !uncheckableItemValues.includes(v));
    },
    [
      flattenNodes,
      uncheckableItemValues,
      serializeListOnlyParent,
      toggleDownChecked,
      toggleUpChecked
    ]
  );

  const handleSelect = useCallback(
    (node: TreeNodeType, event: React.SyntheticEvent<any>) => {
      if (!node) {
        return;
      }

      const selectedValues = toggleChecked(node, !flattenNodes[node.refKey].check);
      if (!isControlled) {
        unSerializeList({
          nodes: flattenNodes,
          key: 'check',
          value: selectedValues,
          cascade,
          uncheckableItemValues
        });
        setValue(selectedValues);
      }

      setActiveNode(node);
      setFocusItemValue(node[valueKey]);

      onChange?.(selectedValues, event);
      onSelect?.(node as ItemDataType, selectedValues, event);
    },
    [
      cascade,
      valueKey,
      flattenNodes,
      isControlled,
      uncheckableItemValues,
      setValue,
      onChange,
      onSelect,
      toggleChecked,
      unSerializeList
    ]
  );

  const hasValue = () => {
    const selectedValues = Object.keys(flattenNodes)
      .map((refKey: string) => flattenNodes[refKey][valueKey])
      .filter((item: any) => value.some(v => shallowEqual(v, item)));
    return !!selectedValues.length;
  };

  const handleOpen = useCallback(() => {
    triggerRef.current?.open?.();
    setFocusItemValue(activeNode?.[valueKey]);
    focusActiveNode();
    onOpen?.();
    setActive(true);
  }, [activeNode, focusActiveNode, onOpen, valueKey]);

  const handleClose = useCallback(() => {
    triggerRef.current?.close?.();
    setSearchKeyword('');
    onClose?.();
    setFocusItemValue(null);
    setActive(false);

    /**
     * when using keyboard toggle picker, should refocus on PickerToggle Component after close picker menu
     */
    targetRef.current?.focus();
  }, [onClose, setSearchKeyword]);

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
      childrenKey,
      expandItemValues,
      getChildren,
      loadChildren,
      onExpand,
      setExpandItemValues,
      valueKey
    ]
  );

  usePublicMethods(ref, { triggerRef, overlayRef, targetRef });

  const handleClean = useCallback(
    (event: React.SyntheticEvent<any>) => {
      const target = event.target as Element;
      // exclude searchBar
      if (target.matches('div[role="searchbox"] > input')) {
        return;
      }

      setActiveNode(null);
      setValue([]);
      setFocusItemValue(null);

      unSerializeList({
        nodes: flattenNodes,
        key: 'check',
        value: [],
        cascade,
        uncheckableItemValues
      });

      onChange?.([], event);
    },
    [cascade, flattenNodes, onChange, setValue, unSerializeList, uncheckableItemValues]
  );

  const handleFocusItem = useCallback(
    (key: string) => {
      const focusableItems = getFocusableItems(filteredData, {
        disabledItemValues,
        valueKey,
        childrenKey,
        expandItemValues
      });

      const selector = `.${checkTreePrefix('node-label')}`;
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
      checkTreePrefix,
      expandItemValues,
      filteredData,
      focusItemValue,
      treeNodesRefs,
      childrenKey,
      valueKey,
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
        focusTreeNode(
          focusItem?.parent?.refKey,
          treeNodesRefs,
          `.${checkTreePrefix('node-label')}`
        );
      }
    });
  }, [
    checkTreePrefix,
    expandItemValues,
    flattenNodes,
    focusItemValue,
    handleExpand,
    treeNodesRefs,
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
    (event: React.KeyboardEvent<any>) => {
      const activeItem = getActiveItem(focusItemValue, flattenNodes, valueKey);
      if (
        !isNodeUncheckable(activeItem, { uncheckableItemValues, valueKey }) &&
        activeItem !== null
      ) {
        handleSelect(activeItem, event);
      }
    },
    [flattenNodes, focusItemValue, handleSelect, uncheckableItemValues, valueKey]
  );

  const onPickerKeydown = useToggleKeyDownEvent({
    toggle: !focusItemValue || !active,
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
    }
  });

  const handleTreeKeydown = useCallback(
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

  const renderNode = (node: TreeNodeType, layer: number) => {
    const { visible, refKey } = node;

    // when searching, all nodes should be expand
    const expand = getExpandWhenSearching(
      searchKeywordState,
      expandItemValues.includes(node[valueKey])
    );
    if (!visible) {
      return null;
    }

    const children = node[childrenKey];
    const visibleChildren =
      isUndefined(searchKeywordState) || searchKeywordState.length === 0
        ? !!children
        : hasVisibleChildren(node, childrenKey);
    const nodeProps = {
      ...getTreeNodeProps({ ...node, expand }, layer),
      hasChildren: visibleChildren
    };

    if (nodeProps.hasChildren) {
      layer += 1;

      const openClass = checkTreePrefix('open');
      const childrenClass = merge(checkTreePrefix('node-children'), {
        [openClass]: expand && visibleChildren
      });

      const nodes = children || [];
      return (
        <div className={childrenClass} key={node[valueKey]}>
          <CheckTreeNode {...nodeProps} ref={ref => saveTreeNodeRef(refKey, ref)} />
          <div className={checkTreePrefix('children')}>
            {nodes.map(child => renderNode(child, layer))}
          </div>
        </div>
      );
    }

    return (
      <CheckTreeNode
        key={node[valueKey]}
        ref={ref => saveTreeNodeRef(refKey, ref)}
        {...nodeProps}
      />
    );
  };

  const renderVirtualListNode = (nodes: any[]) => ({ key, index, style }: ListRowProps) => {
    const node = nodes[index];
    const { layer, refKey, showNode } = node;
    const expand = getExpandWhenSearching(
      searchKeywordState,
      expandItemValues.includes(node[valueKey])
    );
    const nodeProps = {
      ...getTreeNodeProps({ ...node, expand }, layer),
      hasChildren: node.hasChildren
    };

    return (
      showNode && (
        <CheckTreeNode
          style={style}
          key={key}
          ref={ref => saveTreeNodeRef(refKey, ref)}
          {...nodeProps}
        />
      )
    );
  };

  const renderCheckTree = () => {
    const classes = withCheckTreeClassPrefix({
      [className ?? '']: inline,
      'without-children': !isSomeNodeHasChildren,
      virtualized
    });

    const formattedNodes = getFormattedNodes(renderNode);

    if (!formattedNodes.some(v => v !== null)) {
      return <div className={prefix('none')}>{locale.noResultsText}</div>;
    }

    const treeNodesClass = merge(checkTreePrefix('nodes'), {
      [checkTreePrefix('all-uncheckable')]: isEveryFirstLevelNodeUncheckable(
        flattenNodes,
        uncheckableItemValues,
        valueKey
      )
    });

    const styles = inline ? { height, ...style } : {};
    return (
      <div
        id={id ? `${id}-listbox` : undefined}
        ref={treeViewRef}
        role="tree"
        aria-multiselectable
        className={classes}
        style={styles}
        onScroll={onScroll}
        onKeyDown={inline ? handleTreeKeydown : undefined}
      >
        <div className={treeNodesClass}>
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
    );
  };

  const renderDropdownMenu = (positionProps: PositionChildProps, speakerRef) => {
    const { left, top, className } = positionProps;
    const classes = classNames(className, menuClassName, prefix('check-tree-menu'));
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
        {renderMenu ? renderMenu(renderCheckTree()) : renderCheckTree()}
        {renderExtraFooter?.()}
      </PickerOverlay>
    );
  };

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValidValue = hasValue() || (value.length > 0 && isFunction(renderValue));
  let selectedElement: React.ReactNode = placeholder;
  const selectedItems = getSelectedItems(flattenNodes, value, valueKey);

  if (hasValidValue) {
    selectedElement = (
      <SelectedElement
        selectedItems={selectedItems}
        countable={countable}
        valueKey={valueKey}
        labelKey={labelKey}
        childrenKey={childrenKey}
        prefix={prefix}
        cascade={cascade}
        locale={locale}
      />
    );
    if (isFunction(renderValue)) {
      selectedElement = renderValue(value, selectedItems, selectedElement);
      if (isNil(selectedElement)) {
        hasValidValue = false;
      }
    }
  }

  const [classes, usedClassNamePropKeys] = usePickerClassName({
    ...props,
    hasValue: hasValidValue,
    name: 'check-tree'
  });

  if (inline) {
    return renderCheckTree();
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
          {...omit(rest, [...omitTriggerPropKeys, ...usedClassNamePropKeys])}
          id={id}
          ref={targetRef}
          onKeyDown={onPickerKeydown}
          onClean={createChainedFunction(handleClean, onClean)}
          cleanable={cleanable && !disabled}
          disabled={disabled}
          as={toggleAs}
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

CheckTreePicker.displayName = 'CheckTreePicker';
CheckTreePicker.defaultProps = defaultProps;
CheckTreePicker.propTypes = {
  ...listPickerPropTypes,
  height: PropTypes.number,
  appearance: PropTypes.oneOf(['default', 'subtle']),
  inline: PropTypes.bool,
  locale: PropTypes.any,
  cascade: PropTypes.bool,
  countable: PropTypes.bool,
  searchable: PropTypes.bool,
  virtualized: PropTypes.bool,
  searchKeyword: PropTypes.string,
  menuAutoWidth: PropTypes.bool,
  defaultExpandAll: PropTypes.bool,
  containerPadding: PropTypes.number,
  disabledItemValues: PropTypes.array,
  expandItemValues: PropTypes.array,
  defaultExpandItemValues: PropTypes.array,
  uncheckableItemValues: PropTypes.array,
  onSearch: PropTypes.func,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  renderMenu: PropTypes.func,
  renderTreeNode: PropTypes.func,
  renderTreeIcon: PropTypes.func,
  searchBy: PropTypes.func,
  onScroll: PropTypes.func
};

export default CheckTreePicker;
