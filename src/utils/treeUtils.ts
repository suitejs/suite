import React, { useRef, useState, useEffect, useCallback } from 'react';
import _, { isUndefined, omit, isArray } from 'lodash';
import shallowEqual from '../utils/shallowEqual';
import shallowEqualArray from '../utils/shallowEqualArray';
import { TreeNodeType, TreeNodesType } from '../CheckTreePicker/utils';
import { TREE_NODE_DROP_POSITION } from '../constants';
import { CheckTreePickerProps } from '../CheckTreePicker/CheckTreePicker';
import { ItemDataType } from '../@types/common';
import { TreePickerProps } from '../TreePicker/TreePicker';
import { shouldDisplay } from '../Picker';
import reactToString from './reactToString';

type PartialTreeProps = Partial<TreePickerProps | CheckTreePickerProps>;

// gap of tree node
const TREE_NODE_GAP = 4;

/**
 * according node parentNode expand state decide node whether to show
 * @param {*} expandItemValues
 * @param {*} parentKeys
 */
export function shouldShowNodeByParentExpanded(
  expandItemValues: any[] = [],
  parentKeys: any[] = []
) {
  const intersectionKeys = _.intersection(expandItemValues, parentKeys);
  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }
  return false;
}

/**
 * 拍平树结构为数组
 * @param {*} tree
 * @param {*} childrenKey
 * @param {*} executor
 */
export function flattenTree(
  tree: any[],
  childrenKey = 'children',
  executor?: (node: any, index: number) => any
) {
  const flattenData: any[] = [];
  const traverse = (data: any[], parent: any | null) => {
    if (!_.isArray(data)) {
      return;
    }

    data.forEach((item: any, index: number) => {
      const node: any = typeof executor === 'function' ? executor(item, index) : item;
      node.parent = parent;

      flattenData.push({ ...node });

      if (item[childrenKey]) {
        traverse(item[childrenKey], item);
      }
    });
  };

  traverse(tree, null);
  return flattenData;
}

/**
 * 获取树节点所有的祖先节点
 * @param {*} node
 */
export function getNodeParents(node: any, parentKey = 'parent', valueKey?: string) {
  const parents: any[] = [];
  const traverse = (node: any) => {
    if (node?.[parentKey]) {
      traverse(node[parentKey]);

      if (valueKey) {
        parents.push(node[parentKey][valueKey]);
      } else {
        parents.push(node[parentKey]);
      }
    }
  };

  traverse(node);

  return parents;
}

/**
 * get node all parentKeys
 * @param nodes
 * @param node
 * @param valueKey
 */
export function getNodeParentKeys(nodes: TreeNodesType, node: TreeNodeType, valueKey: string) {
  const parentKeys = [];
  const traverse = (node: TreeNodeType) => {
    if (node?.parent) {
      traverse(nodes[node.parent.refKey]);
      parentKeys.push(node?.parent?.[valueKey]);
    }
  };

  traverse(node);
  return parentKeys;
}

export function hasVisibleChildren(node: TreeNodeType, childrenKey: string) {
  if (!Array.isArray(node[childrenKey])) {
    return false;
  }

  return node[childrenKey].some((child: TreeNodeType) => child.visible);
}

/**
 * shallow equal array
 * @param a
 * @param b
 */
export function compareArray(a: any[], b: any[]) {
  return _.isArray(a) && _.isArray(b) && !shallowEqualArray(a, b);
}

export function getDefaultExpandItemValues(
  data: ItemDataType[],
  props: Pick<
    TreePickerProps,
    'defaultExpandAll' | 'valueKey' | 'childrenKey' | 'defaultExpandItemValues'
  >
) {
  const { valueKey, defaultExpandAll, childrenKey, defaultExpandItemValues = [] } = props;
  if (defaultExpandAll) {
    return flattenTree(data, childrenKey)
      .filter(item => Array.isArray(item[childrenKey]) && item[childrenKey].length > 0)
      .map(item => item[valueKey]);
  }
  return defaultExpandItemValues;
}

/**
 * 获取 expandItemValues 的 value
 * @param props
 */
export function getExpandItemValues(props: PartialTreeProps) {
  const { expandItemValues, defaultExpandItemValues } = props;
  if (!_.isUndefined(expandItemValues) && Array.isArray(expandItemValues)) {
    return expandItemValues;
  }

  if (!_.isUndefined(defaultExpandItemValues) && Array.isArray(defaultExpandItemValues)) {
    return defaultExpandItemValues;
  }
  return [];
}

/**
 * 获取节点展开状态
 * @param node
 * @param props
 */
export function getExpandState(node: any, props: PartialTreeProps) {
  const { valueKey, childrenKey, defaultExpandAll, expandItemValues } = props;

  const expand = getExpandItemValues(props).some((value: any) =>
    shallowEqual(node[valueKey], value)
  );
  if (!_.isUndefined(expandItemValues)) {
    return expand;
  } else if (node[childrenKey]?.length) {
    if (!_.isNil(node.expand)) {
      return !!node.expand;
    } else if (defaultExpandAll) {
      return true;
    }
    return false;
  }
  return false;
}

/**
 * 获取拖拽节点及子节点的key
 * @param node
 * @param childrenKey
 * @param valueKey
 */
export function getDragNodeKeys(dragNode: any, childrenKey: string, valueKey: string) {
  let dragNodeKeys: any[] = [dragNode[valueKey]];
  const traverse = (data: any) => {
    if (data?.length > 0) {
      data.forEach((node: any) => {
        dragNodeKeys = dragNodeKeys.concat([node[valueKey]]);
        if (node[childrenKey]) {
          traverse(node[childrenKey]);
        }
      });
    }
  };

  traverse(dragNode[childrenKey]);

  return dragNodeKeys;
}

export function calDropNodePosition(event: React.DragEvent, treeNodeElement: Element) {
  const { clientY } = event;
  const { top, bottom } = treeNodeElement.getBoundingClientRect();
  const gap = TREE_NODE_GAP;

  // 处于节点下方
  if (clientY >= bottom - gap && clientY <= bottom) {
    return TREE_NODE_DROP_POSITION.DRAG_OVER_BOTTOM;
  }

  // 处于节点上方
  if (clientY <= top + gap && clientY >= top) {
    return TREE_NODE_DROP_POSITION.DRAG_OVER_TOP;
  }

  if (clientY >= top + gap && clientY <= bottom - gap) {
    return TREE_NODE_DROP_POSITION.DRAG_OVER;
  }
  return -1;
}

export function removeDragNode(data: any[], params: any, { valueKey, childrenKey }) {
  const { dragNode } = params;
  const traverse = (items: any[], parent?: any) => {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (shallowEqual(item[valueKey], dragNode[valueKey])) {
        items.splice(index, 1);
        // 当 children 为空，需要删除 children 属性，不显示角标
        if (items.length === 0 && parent) {
          delete parent.children;
        }
        break;
      }

      if (Array.isArray(item[childrenKey])) {
        traverse(item[childrenKey], item);
      }
    }
  };
  traverse(data);
}

/**
 * 移动节点valueKey，先删除 dragNode 原本所在的数据，再将 dragNode 移动到拖动的位置
 * @param data
 * @param params
 */
export function createUpdateTreeDataFunction(params: any, { valueKey, childrenKey }) {
  return function (tree: any[]) {
    const data = [...tree];
    const { dragNode, dropNode, dropNodePosition } = params;
    removeDragNode(data, params, { valueKey, childrenKey });
    const updateTree = (items: any[]) => {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];

        if (shallowEqual(item[valueKey], dropNode[valueKey])) {
          // 拖拽到 dropNode内，作为 dropNode 的子节点
          if (dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER) {
            item[childrenKey] = _.isNil(item[childrenKey]) ? [] : item[childrenKey];
            item[childrenKey].push(dragNode);
            break;
          } else if (dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER_TOP) {
            // 拖拽到 dropNode 的上面
            items.splice(index, 0, dragNode);
            break;
          } else if (dropNodePosition === TREE_NODE_DROP_POSITION.DRAG_OVER_BOTTOM) {
            // 拖拽到 dropNode 的下面
            items.splice(index + 1, 0, dragNode);
            break;
          }
        }

        if (Array.isArray(item[childrenKey]) && item[childrenKey].length > 0) {
          updateTree(item[childrenKey]);
        }
      }
    };

    updateTree(data);
    return [...data];
  };
}

export function findNodeOfTree(data, check) {
  const findNode = (nodes = []) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      if (_.isArray(item.children)) {
        const node = findNode(item.children);
        if (node) {
          return node;
        }
      }

      if (check(item)) {
        return item;
      }
    }

    return undefined;
  };

  return findNode(data);
}

export function filterNodesOfTree(data, check) {
  const findNodes = (nodes = []) => {
    const nextNodes = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (_.isArray(nodes[i].children)) {
        const nextChildren = findNodes(nodes[i].children);
        if (nextChildren.length) {
          const item = _.clone(nodes[i]);
          item.children = nextChildren;
          nextNodes.push(item);
          continue;
        }
      }

      if (check(nodes[i])) {
        nextNodes.push(nodes[i]);
      }
    }

    return nextNodes;
  };

  return findNodes(data);
}

/**
 * get all focusable items
 */
export const getFocusableItems = (filteredData: ItemDataType[], props: PartialTreeProps) => {
  const { disabledItemValues, valueKey, childrenKey, expandItemValues } = props;
  const items = [];
  const loop = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      const disabled = disabledItemValues.some(disabledItem =>
        shallowEqual(disabledItem, node[valueKey])
      );
      if (!disabled) {
        items.push(node);
      }
      if (node[childrenKey] && expandItemValues.includes(node[valueKey])) {
        loop(node[childrenKey]);
      }
    });
  };

  loop(filteredData);
  return items;
};

/**
 * return all focusable Item and active Element index
 * @param focusItemValue
 * @param focusableItems items
 */
export const getActiveIndex = (focusItemValue, focusItems: any[], valueKey) => {
  let activeIndex = -1;
  focusItems.forEach((item, index) => {
    if (shallowEqual(item[valueKey], focusItemValue)) {
      activeIndex = index;
    }
  });
  return activeIndex;
};

/**
 * get current active element and node data
 * @param flattenNodes - flattenData
 */
export const getActiveItem = (
  focusItemValue: string | number,
  flattenNodes: TreeNodesType,
  valueKey: string
) => {
  let nodeData: any = null;
  const activeNode = Object.values(flattenNodes).find(node =>
    shallowEqual(node[valueKey], focusItemValue)
  );
  if (activeNode) {
    nodeData = activeNode;
  }

  return nodeData;
};

export const getElementByDataKey = (dataKey: string, treeNodesRefs: any, selector: string) => {
  const ele = treeNodesRefs[dataKey];
  if (ele instanceof Element) {
    return ele.querySelector(selector);
  }
  return null;
};

export interface FocusPrevOrNextProps {
  focusItemValue: string | number;
  focusableItems: any[];
  treeNodesRefs: any;
  selector: string;
  valueKey: string;
  callback: (value: string | number) => void;
}

/**
 * focus next item with keyboard
 * @param param
 */
export const focusNextItem = ({
  focusItemValue,
  focusableItems,
  treeNodesRefs,
  selector,
  valueKey,
  callback
}: FocusPrevOrNextProps) => {
  const activeIndex = getActiveIndex(focusItemValue, focusableItems, valueKey);
  if (focusableItems.length === 0) {
    return;
  }
  const nextIndex = activeIndex === focusableItems.length - 1 ? 0 : activeIndex + 1;
  const nextFocusItemValue = focusableItems[nextIndex][valueKey];
  callback?.(nextFocusItemValue);
  const node: any = getElementByDataKey(focusableItems[nextIndex].refKey, treeNodesRefs, selector);
  node?.focus?.();
};

/**
 * focus prev item with keyboard
 * @param param
 */
export const focusPreviousItem = ({
  focusItemValue,
  focusableItems,
  treeNodesRefs,
  selector,
  valueKey,
  callback
}: FocusPrevOrNextProps) => {
  const activeIndex = getActiveIndex(focusItemValue, focusableItems, valueKey);
  if (focusableItems.length === 0) {
    return;
  }

  let prevIndex = activeIndex === 0 ? focusableItems.length - 1 : activeIndex - 1;
  prevIndex = prevIndex >= 0 ? prevIndex : 0;
  const prevFocusItemValue = focusableItems[prevIndex][valueKey];
  callback?.(prevFocusItemValue);
  const node: any = getElementByDataKey(focusableItems[prevIndex].refKey, treeNodesRefs, selector);
  node?.focus?.();
};

/**
 * get scrollIndex in virtualized list
 * @param nodes - data
 * @param value - activeItem value
 * @param valueKey
 */
export const getScrollToIndex = (nodes: TreeNodeType[], value: string | number, valueKey: string) =>
  nodes.filter(n => n.showNode && n.visible).findIndex(item => item[valueKey] === value);

/**
 * expand always return true when searching
 * @param searchKeyword
 * @param expand
 */
export function getExpandWhenSearching(searchKeyword: string, expand: boolean) {
  return !_.isEmpty(searchKeyword) ? true : expand;
}

export function getTreeActiveNode(nodes: TreeNodesType, value: number | string, valueKey: string) {
  let activeNode = null;
  if (!isUndefined(value)) {
    Object.keys(nodes).forEach(refKey => {
      if (shallowEqual(nodes[refKey][valueKey], value)) {
        activeNode = nodes[refKey];
      }
    });
  }

  return activeNode;
}

/**
 * toggle tree node
 * @param param0
 */
export function toggleExpand({ node, isExpand, expandItemValues, valueKey }: any) {
  const newExpandItemValues = new Set(expandItemValues);
  if (isExpand) {
    newExpandItemValues.add(node[valueKey]);
  } else {
    newExpandItemValues.delete(node[valueKey]);
  }
  return Array.from(newExpandItemValues);
}

export function getTreeNodeTitle(label: any) {
  if (typeof label === 'string') {
    return label;
  } else if (React.isValidElement(label)) {
    const nodes = reactToString(label);
    return nodes.join('');
  }
}

export function useTreeDrag() {
  // current dragging node
  const dragNode = useRef(null);
  const [dragOverNodeKey, setDragOverNodeKey] = useState(null);
  // drag node and it's children nodes key
  const [dragNodeKeys, setDragNodeKeys] = useState([]);
  const [dropNodePosition, setDropNodePosition] = useState<TREE_NODE_DROP_POSITION>(null);

  const setDragNode = (node: ItemDataType) => {
    dragNode.current = node;
  };
  return {
    dragNode: dragNode?.current,
    dragOverNodeKey,
    dragNodeKeys,
    dropNodePosition,
    setDragNode,
    setDragOverNodeKey,
    setDragNodeKeys,
    setDropNodePosition
  };
}

interface FlattenTreeDataProps {
  data: TreeNodeType[];
  labelKey: string;
  valueKey: string;
  childrenKey: string;
  uncheckableItemValues?: any[];
  callback?: (nodes: TreeNodesType) => void;
}

interface UnSerializeListProps {
  nodes: TreeNodesType;
  key: string;
  value: any[];
  cascade: boolean;
  uncheckableItemValues: any[];
}

/**
 * hooks for flatten tree structure
 * @param param0
 */
export function useFlattenTreeData({
  data,
  labelKey,
  valueKey,
  childrenKey,
  uncheckableItemValues = [],
  callback
}: FlattenTreeDataProps) {
  const [, dispatch] = useState(Object.create(null));

  const forceUpdate = useCallback((): void => {
    dispatch(Object.create(null));
  }, [dispatch]);

  const { current: flattenNodes = {} } = useRef<TreeNodesType>({});

  const flattenTreeData = useCallback(
    (treeData: TreeNodeType[], ref: string, parent?: TreeNodeType, layer = 1) => {
      if (!Array.isArray(treeData) || treeData.length === 0) {
        return [];
      }

      treeData.map((node, index) => {
        const refKey = `${ref}-${index}`;

        node.refKey = refKey;

        flattenNodes[refKey] = {
          layer,
          [labelKey]: node[labelKey],
          [valueKey]: node[valueKey],
          refKey,
          uncheckable: uncheckableItemValues.some((value: any) =>
            shallowEqual(node[valueKey], value)
          ),
          ...node
        };
        if (parent) {
          flattenNodes[refKey].parent = omit(parent, 'parent', 'children');
        }
        flattenTreeData(node[childrenKey], refKey, node, layer + 1);
      });

      callback?.(flattenNodes);
    },
    [childrenKey, valueKey, labelKey, callback, uncheckableItemValues, flattenNodes]
  );

  const serializeListOnlyParent = useCallback(
    (nodes: TreeNodesType, key: string) => {
      const list = [];

      Object.keys(nodes).forEach((refKey: string) => {
        const currentNode = nodes[refKey];
        if (currentNode.parent) {
          const parentNode = nodes[currentNode.parent?.refKey];
          if (currentNode[key]) {
            if (!parentNode?.checkAll) {
              list.push(nodes[refKey][valueKey]);
            } else if (parentNode?.uncheckable) {
              list.push(nodes[refKey][valueKey]);
            }
          }
        } else {
          if (currentNode[key]) {
            list.push(nodes[refKey][valueKey]);
          }
        }
      });
      return list;
    },
    [valueKey]
  );

  /**
   * using in CheckTreePicker, to unSerializeList check property
   */
  const unSerializeList = useCallback(
    ({ nodes, key, value = [], cascade, uncheckableItemValues }: UnSerializeListProps) => {
      // Reset values to false
      Object.keys(nodes).forEach((refKey: string) => {
        const node = nodes[refKey];
        if (cascade && node.parent) {
          node[key] = nodes[node.parent.refKey][key];
        } else {
          node[key] = false;
        }
        value.forEach((value: any) => {
          if (
            shallowEqual(nodes[refKey][valueKey], value) &&
            !uncheckableItemValues.some(uncheckableValue => shallowEqual(value, uncheckableValue))
          ) {
            nodes[refKey][key] = true;
          }
        });
      });
    },
    [valueKey]
  );

  const formatVirtualizedTreeData = (
    nodes: TreeNodesType,
    data: any[],
    expandItemValues: ItemDataType[]
  ) => {
    return flattenTree(data, childrenKey, (node: any) => {
      let formatted = {};
      const curNode = nodes?.[node.refKey];
      const parentKeys = getNodeParentKeys(nodes, curNode, valueKey);
      if (curNode) {
        formatted = {
          ...node,
          check: curNode.check,
          uncheckable: curNode.uncheckable,
          hasChildren: !!node[childrenKey],
          layer: curNode.layer,
          parent: curNode.parent,
          // when parent node fold, children nodes should be hidden
          showNode: curNode.parent
            ? shouldShowNodeByParentExpanded(expandItemValues, parentKeys)
            : true
        };
      }
      return formatted;
    });
  };

  useEffect(() => {
    flattenTreeData(data, '0');
  }, [data]);

  return {
    forceUpdate,
    flattenNodes,
    flattenTreeData,
    serializeListOnlyParent,
    unSerializeList,
    formatVirtualizedTreeData
  };
}

/**
 * A hook that saving every tree node ref
 */
export function useTreeNodeRefs() {
  const treeNodeRefs = useRef({});

  const saveTreeNodeRef = (refKey: string, ref: React.Ref<any>) => {
    if (refKey) {
      treeNodeRefs.current[refKey] = ref;
    }
  };

  return {
    treeNodesRefs: treeNodeRefs.current,
    saveTreeNodeRef
  };
}

interface TreeSearchProps {
  labelKey: string;
  childrenKey: string;
  searchKeyword: string;
  data: ItemDataType[];
  searchBy: (keyword, label, item) => boolean;
  callback?: (keyword: string, data: ItemDataType[], event: React.SyntheticEvent<any>) => void;
}

/**
 * A hook that handles tree search filter options
 * @param props
 */
export function useTreeSearch(props: TreeSearchProps) {
  const { labelKey, childrenKey, searchKeyword, data, searchBy, callback } = props;

  const filterVisibleData = useCallback(
    (data: ItemDataType[], searchKeyword: string) => {
      const setVisible = (nodes: ItemDataType[]) =>
        nodes.forEach((item: any) => {
          item.visible = searchBy
            ? searchBy(searchKeyword, item[labelKey], item)
            : shouldDisplay(item[labelKey], searchKeyword);
          if (isArray(item[childrenKey])) {
            filterVisibleData(item[childrenKey], searchKeyword);
            item[childrenKey].forEach((child: any) => {
              if (child.visible) {
                item.visible = child.visible;
              }
            });
          }
        });

      setVisible(data);
      return data;
    },
    [childrenKey, labelKey, searchBy]
  );

  // Use search keywords to filter options.
  const [searchKeywordState, setSearchKeyword] = useState(searchKeyword);
  const [filteredData, setFilteredData] = useState(filterVisibleData(data, searchKeywordState));

  const handleSetFilteredData = useCallback(
    (data: ItemDataType[], searchKeyword: string) => {
      setFilteredData(filterVisibleData(data, searchKeyword));
    },
    [filterVisibleData]
  );

  const handleSearch = (searchKeyword: string, event: React.SyntheticEvent<any>) => {
    const filteredData = filterVisibleData(data, searchKeyword);
    setFilteredData(filteredData);
    setSearchKeyword(searchKeyword);
    callback?.(searchKeyword, filteredData, event);
  };

  return {
    searchKeywordState,
    filteredData,
    setFilteredData: handleSetFilteredData,
    setSearchKeyword,
    handleSearch
  };
}

export function useGetTreeNodeChildren(
  treeData: ItemDataType[],
  valueKey: string,
  childrenKey: string
) {
  const [loadingNodeValues, setLoadingNodeValues] = useState([]);
  const [data, setData] = useState(treeData);

  const concatChildren = (treeNode: TreeNodeType, children: any[]): any[] => {
    const value = treeNode[valueKey];
    treeNode = findNodeOfTree(data, item => value === item[valueKey]);
    treeNode[childrenKey] = children;
    const newData = data.concat([]);
    setData(newData);
    return newData;
  };

  const loadChildren = (node, getChildren) => {
    setLoadingNodeValues(prev => prev.concat(node[valueKey]));
    const children = getChildren(node);
    if (children instanceof Promise) {
      children.then(res => {
        const newData = concatChildren(node, res);
        setData(newData);
        setLoadingNodeValues(prev => prev.filter(item => !shallowEqual(item, node[valueKey])));
      });
    } else {
      setData(concatChildren(node, children));
      setLoadingNodeValues(prev => prev.filter(item => !shallowEqual(item, node[valueKey])));
    }
  };
  return { data, setData, loadingNodeValues, loadChildren };
}
