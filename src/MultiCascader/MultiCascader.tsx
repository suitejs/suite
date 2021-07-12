import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import shallowEqualArray from '../utils/shallowEqualArray';
import { polyfill } from 'react-lifecycles-compat';

import DropdownMenu, { dropdownMenuPropTypes } from './DropdownMenu';
import Checkbox from '../Checkbox';
import createUtils, { UtilType } from './utils';
import { flattenTree, getNodeParents } from '../utils/treeUtils';

import {
  defaultProps,
  prefix,
  getUnhandledProps,
  createChainedFunction,
  mergeRefs
} from '../utils';
import getSafeRegExpString from '../utils/getSafeRegExpString';

import {
  PickerToggle,
  MenuWrapper,
  SearchBar,
  SelectedElement,
  PickerToggleTrigger,
  getToggleWrapperClassName,
  createConcatChildrenFunction
} from '../Picker';

import { listPickerPropTypes, listPickerDefaultProps } from '../Picker/propTypes';
import { MultiCascaderProps } from './MultiCascader.d';

interface MultiCascaderState {
  selectNode?: any;
  value?: any[];
  prevValue?: any[];
  activePaths?: any[];
  items?: any[];
  data?: any[];
  flattenData?: any[];
  active?: boolean;
  searchKeyword?: string;
}

class MultiCascader extends React.Component<MultiCascaderProps, MultiCascaderState> {
  static propTypes = {
    ...listPickerPropTypes,
    cascade: PropTypes.bool,
    inline: PropTypes.bool,
    countable: PropTypes.bool,
    menuWidth: PropTypes.number,
    menuHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    uncheckableItemValues: PropTypes.array,
    searchable: PropTypes.bool,
    renderMenuItem: PropTypes.func,
    renderMenu: PropTypes.func,
    onSearch: PropTypes.func,
    onSelect: PropTypes.func,
    onCheck: PropTypes.func
  };

  static defaultProps = {
    ...listPickerDefaultProps,
    searchable: true,
    countable: true,
    cascade: true,
    uncheckableItemValues: [],
    locale: {
      placeholder: 'Select',
      checkAll: 'All',
      searchPlaceholder: 'Search',
      noResultsText: 'No results found'
    }
  };

  static utils: UtilType = {};
  isControlled: boolean = null;
  menuContainerRef: React.RefObject<any>;
  positionRef: React.RefObject<any>;
  triggerRef: React.RefObject<any>;
  toggleRef: React.RefObject<any>;

  constructor(props) {
    super(props);

    const { data, value, defaultValue } = props;
    const initState = {
      data,
      searchKeyword: '',
      prevValue: value,
      value: defaultValue || [],
      selectNode: null,
      /**
       * 选中值的路径
       */
      activePaths: []
    };

    MultiCascader.utils = createUtils(props);
    const flattenData = flattenTree(data, props.childrenKey);

    this.isControlled = !_.isUndefined(value);
    this.state = {
      ...initState,
      flattenData,
      /**
       * 用于展示面板的数据列表，是一个二维的数组
       * 是通过 data 树结构转换成的二维的数组，其中只包含页面上展示的数据
       */
      items: [flattenData.filter(item => !item.parent)],
      ...MultiCascader.getCascadeState(props, flattenData)
    };

    // for test
    this.menuContainerRef = React.createRef();
    this.positionRef = React.createRef();
    this.triggerRef = React.createRef();
    this.toggleRef = React.createRef();
  }

  static getCascadeState(nextProps: MultiCascaderProps, flattenData: any[], nextValue?: any[]) {
    const { data, cascade, value, defaultValue, uncheckableItemValues } = nextProps;
    let cascadeValue = nextValue || value || defaultValue || [];

    if (cascade && data) {
      cascadeValue = MultiCascader.utils.transformValue(
        cascadeValue,
        flattenData,
        uncheckableItemValues
      );
    }

    return {
      value: cascadeValue
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, valueKey, childrenKey } = nextProps;

    const value = nextProps.value || prevState.value || [];
    const { prevValue, selectNode = {}, items } = prevState;
    let { flattenData } = prevState;

    const isChangedData = data !== prevState.data;
    const isChangedValue = !shallowEqualArray(prevValue, nextProps.value);

    if (isChangedData || isChangedValue) {
      if (isChangedData) {
        flattenData = flattenTree(data, nextProps.childrenKey);
      }

      /**
       * 如果更新了 data,
       * 首先获取到被点击节点的值 `selectNode`， 然后再拿到新增后的 `newChildren`,
       */
      const nextSelectNode = flattenData.find(n => {
        return selectNode && n[valueKey] === selectNode[valueKey];
      });
      const newChildren = (_.get(nextSelectNode, childrenKey) || []).map(item => {
        item.parent = nextSelectNode;
        return item;
      });

      if (newChildren.length && items) {
        items[items.length - 1] = newChildren;
      }

      const nextState: MultiCascaderState = {
        selectNode: nextSelectNode,
        flattenData,
        data,
        items: MultiCascader.utils.getItems(nextSelectNode, flattenData),
        ...MultiCascader.getCascadeState(nextProps, flattenData, value)
      };

      if (isChangedValue) {
        nextState.prevValue = nextProps.value;
      }

      return nextState;
    }

    return null;
  }

  getValue() {
    return this.state.value || [];
  }

  handleCheck = (item: any, event: React.SyntheticEvent<any>, checked: boolean) => {
    const { valueKey, cascade, uncheckableItemValues, onChange, onCheck } = this.props;
    const itemValue = item[valueKey];
    let value = [];

    if (cascade) {
      value = MultiCascader.utils.splitValue(item, checked, this.getValue(), uncheckableItemValues)
        .value;
    } else {
      value = this.getValue();
      if (checked) {
        value.push(itemValue);
      } else {
        value = value.filter(n => n !== itemValue);
      }
    }

    if (!this.isControlled) {
      this.setState({ value });
    }

    onChange?.(value, event);
    onCheck?.(value, item, checked, event);
  };

  handleChangeForSearchItem = (value: any, checked: boolean, event: React.SyntheticEvent<any>) => {
    this.handleCheck(value, event, checked);
  };

  handleSelect = (
    node: any,
    cascadeItems,
    activePaths: any[],
    event: React.SyntheticEvent<any>
  ) => {
    const { onSelect, valueKey, childrenKey } = this.props;

    this.setState(
      {
        selectNode: node,
        items: cascadeItems,
        activePaths
      },
      () => {
        this.positionRef.current?.updatePosition?.();
      }
    );

    onSelect?.(
      node,
      activePaths,
      createConcatChildrenFunction(node, node[valueKey], { valueKey, childrenKey }),
      event
    );
  };

  handleSearch = (searchKeyword: string, event: React.SyntheticEvent<any>) => {
    this.setState({ searchKeyword });
    this.props.onSearch?.(searchKeyword, event);
  };

  handleCloseDropdown = () => {
    this.triggerRef.current?.hide?.();
  };

  handleOpenDropdown = () => {
    this.triggerRef.current?.show?.();
  };
  open = () => {
    this.handleOpenDropdown?.();
  };
  close = () => {
    this.handleCloseDropdown?.();
  };

  handleClean = (event: React.SyntheticEvent<any>) => {
    const { disabled, onChange, data } = this.props;
    if (disabled) {
      return;
    }
    const nextState: MultiCascaderState = {
      items: [data],
      selectNode: null,
      activePaths: []
    };

    if (!this.isControlled) {
      nextState.value = [];
    }

    this.setState(nextState);
    onChange?.([], event);
  };

  handleEntered = () => {
    this.props.onOpen?.();
    this.setState({ active: true });
  };

  handleExit = () => {
    this.props.onClose?.();
    this.setState({
      searchKeyword: '',
      active: false
    });
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  getSearchResult() {
    const { labelKey, valueKey, uncheckableItemValues = [] } = this.props;
    const { searchKeyword, flattenData } = this.state;

    const items = [];
    const result = flattenData.filter(item => {
      if (uncheckableItemValues.some(value => item[valueKey] === value)) {
        return false;
      }

      if (item[labelKey].match(new RegExp(getSafeRegExpString(searchKeyword), 'i'))) {
        return true;
      }
      return false;
    });

    for (let i = 0; i < result.length; i++) {
      items.push(result[i]);

      if (i === 99) {
        return items;
      }
    }
    return items;
  }
  getPositionInstance = () => {
    return this.positionRef.current;
  };

  getToggleInstance = () => {
    return this.toggleRef.current;
  };

  renderSearchRow = (item: any, key: number) => {
    const { labelKey, valueKey, cascade, disabledItemValues = [] } = this.props;
    const { searchKeyword } = this.state;
    const values = this.getValue();
    const nodes = getNodeParents(item);
    const regx = new RegExp(getSafeRegExpString(searchKeyword), 'ig');
    const labelElements = [];

    const a = item[labelKey].split(regx);
    const b = item[labelKey].match(regx);

    for (let i = 0; i < a.length; i++) {
      labelElements.push(a[i]);
      if (b[i]) {
        labelElements.push(<strong key={i}>{b[i]}</strong>);
      }
    }

    nodes.push({
      ...item,
      [labelKey]: labelElements
    });

    const active = values.some(value => {
      if (cascade) {
        return nodes.some(node => node[valueKey] === value);
      }
      return item[valueKey] === value;
    });
    const disabled = disabledItemValues.some(value => nodes.some(node => node[valueKey] === value));
    const itemClasses = classNames(this.addPrefix('cascader-row'), {
      [this.addPrefix('cascader-row-disabled')]: disabled
    });

    return (
      <div key={key} className={itemClasses}>
        <Checkbox
          disabled={disabled}
          checked={active}
          value={item}
          indeterminate={cascade && !active && MultiCascader.utils.isSomeChildChecked(item, values)}
          onChange={this.handleChangeForSearchItem}
        >
          <span className={this.addPrefix('cascader-cols')}>
            {nodes.map((node, index) => (
              <span key={`col-${index}`} className={this.addPrefix('cascader-col')}>
                {node[labelKey]}
              </span>
            ))}
          </span>
        </Checkbox>
      </div>
    );
  };

  renderSearchResultPanel() {
    const { locale } = this.props;
    const { searchKeyword } = this.state;

    if (searchKeyword === '') {
      return null;
    }

    const items = this.getSearchResult();
    return (
      <div className={this.addPrefix('cascader-search-panel')}>
        {items.length ? (
          items.map(this.renderSearchRow)
        ) : (
          <div className={this.addPrefix('none')}>{locale.noResultsText}</div>
        )}
      </div>
    );
  }

  renderDropdownMenu() {
    const { items, activePaths, searchKeyword } = this.state;
    const {
      renderMenu,
      renderExtraFooter,
      menuClassName,
      menuStyle,
      classPrefix,
      searchable,
      locale,
      inline
    } = this.props;

    const classes = classNames(
      this.addPrefix('cascader-menu'),
      this.addPrefix('multi-cascader-menu'),
      menuClassName,
      {
        [this.addPrefix('inline')]: inline
      }
    );

    const menuProps = _.pick(this.props, Object.keys(dropdownMenuPropTypes));

    return (
      <MenuWrapper
        className={classes}
        style={menuStyle}
        getToggleInstance={this.getToggleInstance}
        getPositionInstance={this.getPositionInstance}
      >
        {searchable && (
          <SearchBar
            placeholder={locale.searchPlaceholder}
            onChange={this.handleSearch}
            value={searchKeyword}
          />
        )}

        {this.renderSearchResultPanel()}

        {searchKeyword === '' && (
          <DropdownMenu
            {...menuProps}
            classPrefix={classPrefix}
            ref={this.menuContainerRef}
            cascadeItems={items}
            cascadePathItems={activePaths}
            value={this.getValue()}
            onSelect={this.handleSelect}
            onCheck={this.handleCheck}
            renderMenu={renderMenu}
          />
        )}

        {renderExtraFooter?.()}
      </MenuWrapper>
    );
  }

  render() {
    const {
      valueKey,
      labelKey,
      childrenKey,
      placeholder,
      renderValue,
      disabled,
      cleanable,
      locale,
      toggleComponentClass,
      style,
      onEnter,
      onExited,
      onClean,
      countable,
      cascade,
      inline,
      positionRef,
      ...rest
    } = this.props;

    if (inline) {
      return this.renderDropdownMenu();
    }

    const { flattenData } = this.state;
    const unhandled = getUnhandledProps(MultiCascader, rest);
    const value = this.getValue();

    const selectedItems = flattenData.filter(item => value.some(v => v === item[valueKey])) || [];

    /**
     * 1.Have a value and the value is valid.
     * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
     */
    let hasValue =
      selectedItems.length > 0 || (this.props.value?.length > 0 && _.isFunction(renderValue));

    let selectedElement: React.ReactNode = placeholder;

    if (selectedItems.length > 0) {
      selectedElement = (
        <SelectedElement
          selectedItems={selectedItems}
          countable={countable}
          valueKey={valueKey}
          labelKey={labelKey}
          childrenKey={childrenKey}
          prefix={this.addPrefix}
          cascade={cascade}
          locale={locale}
        />
      );
    }

    if (hasValue && _.isFunction(renderValue)) {
      selectedElement = renderValue(
        value?.length > 0 ? value : this.props.value,
        selectedItems,
        selectedElement
      );
      if (_.isNil(selectedElement)) {
        hasValue = false;
      }
    }

    const classes = getToggleWrapperClassName('cascader', this.addPrefix, this.props, hasValue);

    return (
      <div className={classes} style={style} tabIndex={-1} role="menu">
        <PickerToggleTrigger
          pickerProps={this.props}
          ref={this.triggerRef}
          positionRef={mergeRefs(this.positionRef, positionRef)}
          onEnter={createChainedFunction(this.handleEntered, onEnter)}
          onExited={createChainedFunction(this.handleExit, onExited)}
          speaker={this.renderDropdownMenu()}
        >
          <PickerToggle
            {...unhandled}
            ref={this.toggleRef}
            componentClass={toggleComponentClass}
            onClean={createChainedFunction(this.handleClean, onClean)}
            cleanable={cleanable && !disabled}
            hasValue={hasValue}
            active={this.state.active}
            aria-disabled={disabled}
          >
            {selectedElement || locale.placeholder}
          </PickerToggle>
        </PickerToggleTrigger>
      </div>
    );
  }
}

polyfill(MultiCascader);

export default defaultProps({
  classPrefix: 'picker'
})(MultiCascader);
