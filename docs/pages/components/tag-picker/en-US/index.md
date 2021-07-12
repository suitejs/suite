# TagPicker

Multi-select by tag and support new options

## Import

<!--{include:(components/tag-picker/fragments/import.md)}-->

## Examples

### Default

<!--{include:`basic.md`}-->

### Size

<!--{include:`size.md`}-->

### Block

<!--{include:`block.md`}-->

### Group

<!--{include:`group.md`}-->

### Creatable

<!--{include:`creatable.md`}-->

### Custom

<!--{include:`custom.md`}-->

### Disabled and read only

<!--{include:`disabled.md`}-->

### Async

<!--{include:`async.md`}-->

## Accessibility

Learn more in [Accessibility](/guide/accessibility).

## Props

<!--{include:(_common/types/data-item-type.md)}-->
<!--{include:(_common/types/placement.md)}-->

### `<TagPicker>`

| Property           | Type`(Default)`                                                        | Description                                                 |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| cacheData          | DataItemType[]                                                         | Option to cache `value` when searching asynchronously       |
| classPrefix        | string `('picker')`                                                    | The prefix of the component CSS class                       |
| cleanable          | boolean `(true)`                                                       | Whether the selected value can be cleared                   |
| container          | HTMLElement &#124; (() => HTMLElement)                                 | Sets the rendering container                                |
| creatable          | boolean                                                                | Settings can create new options                             |
| data \*            | DataItemType[]                                                         | The data of component                                       |
| defaultValue       | string[]                                                               | Default values of the selected items                        |
| disabled           | boolean                                                                | Whether disabled componet                                   |
| disabledItemValues | string[]                                                               | Disable item by value                                       |
| groupBy            | string                                                                 | Set group condition key in data                             |
| labelKey           | string `('label')`                                                     | Set label key in data                                       |
| listProps          | [ListProps][listprops]                                                 | List-related properties in `react-virtualized`              |
| maxHeight          | number `(320)`                                                         | The max height of Dropdown                                  |
| menuClassName      | string                                                                 | A css class to apply to the Menu DOM node.                  |
| menuStyle          | CSSProperties                                                          | A style to apply to the Menu DOM node.                      |
| onChange           | (value:string[], event) => void                                        | Callback fired when value change                            |
| onClean            | (event) => void                                                        | Callback fired when value clean                             |
| onClose            | () => void                                                             | Callback fired when close component                         |
| onCreate           | (value: string[], item: ItemDataType, event) => void                   | Callback fired when a new option is created                 |
| onEnter            | () => void                                                             | Callback fired before the overlay transitions in            |
| onEntered          | () => void                                                             | Callback fired after the overlay finishes transitioning in  |
| onEntering         | () => void                                                             | Callback fired as the overlay begins to transition in       |
| onExit             | () => void                                                             | Callback fired right before the overlay transitions out     |
| onExited           | () => void                                                             | Callback fired after the overlay finishes transitioning out |
| onExiting          | () => void                                                             | Callback fired as the overlay begins to transition out      |
| onGroupTitleClick  | (event) => void                                                        | Callback fired when click the group title                   |
| onOpen             | () => void                                                             | Callback fired when open component                          |
| onSearch           | (searchKeyword:string, event) => void                                  | Callback fired when search                                  |
| onSelect           | (value:string[], item: DataItemType , event) => void                   | Callback fired when item is selected                        |
| placeholder        | ReactNode `('Select')`                                                 | Setting placeholders                                        |
| placement          | Placement `('bottomStart')`                                            | The placement of component                                  |
| preventOverflow    | boolean                                                                | Prevent floating element overflow                           |
| renderExtraFooter  | () => ReactNode                                                        | Custom render extra footer                                  |
| renderMenuGroup    | (groupTitle:ReactNode, item:DataItemType) => ReactNode                 | Custom render menu group                                    |
| renderMenuItem     | (label:ReactNode, item:DataItemType) => ReactNode                      | Custom render menu items                                    |
| renderValue        | (value: string[], items:DataItemType[], tags:ReactNode[]) => ReactNode | Custom render selected items                                |
| searchBy           | (keyword: string, label: ReactNode, item: ItemDataType) => boolean     | Custom search rules                                         |
| searchable         | boolean `(true)`                                                       | Whether dispaly search input box                            |
| size               | enum: 'lg'&#124;'md'&#124;'sm'&#124;'xs' `('md')`                      | A picker can have different sizes                           |
| sort               | (isGroup: boolean) => (a: any, b: any) => number                       | Sort options                                                |
| tagProps           | [TagProps][tagprops]                                                   | Set the props of the Tag                                    |
| toggleAs           | ElementType `('a')`                                                    | You can use a custom element for this component             |
| value              | string[]                                                               | Specifies the values of the selected items (Controlled)     |
| valueKey           | string `('value')`                                                     | Set value key in data                                       |
| virtualized        | boolean                                                                | Whether using Virtualized List                              |

[listprops]: https://github.com/bvaughn/react-virtualized/blob/master/docs/List.md#prop-types
[tagprops]: https://rsuitejs.com/en/components/tag#Props
