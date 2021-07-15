# DatePicker 时间选择器

时间选择器，可以选择日期和时间。

> 当需要选择日期范围，推荐使用 [`<DateRangePicker>`](/zh/components/date-range-picker)

## 获取组件

<!--{include:(components/date-picker/fragments/import.md)}-->

## 演示

### 默认

<!--{include:`basic.md`}-->

### 尺寸

<!--{include:`size.md`}-->

### 一键选值

<!--{include:`one-tap.md`}-->

### 外观

<!--{include:`appearance.md`}-->

### 撑满

<!--{include:`block.md`}-->

### 占位符

<!--{include:`placeholder.md`}-->

### 日期与时间

<!--{include:`format.md`}-->

### 只显示月份

<!--{include:`format-month.md`}-->

### 只显示时间

<!--{include:`format-time.md`}-->

### 以 12 小时制的格式显示

<!--{include:`format-time-meridian.md`}-->

### ISO week

国际标准 ISO 8601 定义，每个日历星期从星期一开始，星期日为第 7 天, [ISO week date](https://en.wikipedia.org/wiki/ISO_week_date).

可以通过 `isoWeek` 属性设置以 ISO 标准显示日历面板。

<!--{include:`iso-week.md`}-->

### 禁用与只读

<!--{include:`disabled.md`}-->

### 设置本地语言

`DatePicker` 支持本地语言自定义配置，但是我们更推荐使用统一[国际化](/guide/intl)配置。

<!--{include:`intl-zh-cn.md`}-->

### 位置

<!--{include:`placement.md`}-->

> 提示：设置为 `auto*`时， 尝试滚动页面，或者改变浏览器大小，会自动显示在合适的位置。

### 自定义快捷项

<!--{include:`custom.md`}-->

示例中点击“前一天”，不会关闭浮层，是因为配置 `closeOverlay:boolean` 参数，该参数用于设置点击快捷项以后是否关闭浮层，默认为 `true`。

### 受控

<!--{include:`control.md`}-->

### 选择范围

<!--{include:`range.md`}-->

### 显示周数

<!--{include:`show-week-numbers.md`}-->

### 原生的选择器

如果您只需要满足简单的日期选择功能，完全可以使用浏览器支持的原生选择器。

<!--{include:`native-pickers.md`}-->

## 无障碍设计

了解更多有关[无障碍设计](/zh/guide/accessibility)的信息。

## Props

### `<DatePicker>`

| 属性名称              | 类型`(默认值)`                                          | 描述                                                                        |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| appearance            | enum: 'default' &#124; 'subtle' `('default')`           | 设置外观                                                                    |
| block                 | boolean                                                 | 堵塞整行                                                                    |
| calendarDefaultDate   | Date                                                    | 日历面板默认呈现的日期时间                                                  |
| cleanable             | boolean `(true)`                                        | 可以清除                                                                    |
| container             | HTMLElement &#124; (() => HTMLElement)                  | 设置渲染的容器                                                              |
| defaultOpen           | boolean                                                 | 默认打开                                                                    |
| defaultValue          | Date                                                    | 默认值                                                                      |
| disabled              | boolean                                                 | 禁用组件                                                                    |
| disabledDate          | (date:Date) => boolean                                  | 禁用日期                                                                    |
| disabledHours         | (hour:number, date:Date) => boolean                     | 禁用小时                                                                    |
| disabledMinutes       | (minute:number, date:Date) => boolean                   | 禁用分钟                                                                    |
| disabledSeconds       | (second:number, date:Date) => boolean                   | 禁用秒                                                                      |
| format                | string `('yyyy-MM-dd')`                                 | 日期显示格式化                                                              |
| hideHours             | (hour:number, date:Date) => boolean                     | 隐藏小时                                                                    |
| hideMinutes           | (minute:number, date:Date) => boolean                   | 隐藏分钟                                                                    |
| hideSeconds           | (second:number, date:Date) => boolean                   | 隐藏秒                                                                      |
| inline                | boolean                                                 | 默认显示日历面板                                                            |
| isoWeek               | boolean                                                 | ISO 8601 标准， 每个日历星期从星期一开始，星期日为第 7 天                   |
| limitEndYear          | number `(1000)`                                         | 相对当前选择日期，设置可选年份下限                                          |
| locale                | object                                                  | 本地化对应的语言描述                                                        |
| menuClassName         | string                                                  | 选项菜单的 className                                                        |
| onChange              | (date:Date) => void                                     | 值改变后的回调函数                                                          |
| onChangeCalendarDate  | (date: Date, event) => void                             | 日历日期改变后的回调函数                                                    |
| onClean               | (event) => void                                         | 清除值后的回调函数                                                          |
| onClose               | () => void                                              | 关闭回调函数                                                                |
| onEnter               | () => void                                              | 显示前动画过渡的回调函数                                                    |
| onEntered             | () => void                                              | 显示后动画过渡的回调函数                                                    |
| onEntering            | () => void                                              | 显示中动画过渡的回调函数                                                    |
| onExit                | () => void                                              | 退出前动画过渡的回调函数                                                    |
| onExited              | () => void                                              | 退出后动画过渡的回调函数                                                    |
| onExiting             | () => void                                              | 退出中动画过渡的回调函数                                                    |
| onNextMonth           | (date: Date) => void                                    | 切换到下一月的回调函数                                                      |
| onOk                  | (date: Date, event) => void                             | 点击确定后的回调函数                                                        |
| onOpen                | () => void                                              | 打开回调函数                                                                |
| onPrevMonth           | (date: Date) => void                                    | 切换到上一月的回调函数                                                      |
| onSelect              | (date: Date) => void                                    | 选择日期或者时间的回调函数                                                  |
| onToggleMonthDropdown | (open: boolean) => void                                 | 切换到月份视图的回调函数                                                    |
| onToggleTimeDropdown  | (open: boolean) => void                                 | 切换到时间视图的回调函数                                                    |
| oneTap                | boolean                                                 | 一个点击完成选择日期                                                        |
| open                  | boolean                                                 | 打开 (受控)                                                                 |
| placeholder           | string                                                  | 没有值时候默认显示内容                                                      |
| placement             | Placement `('bottomStart')`                             | 显示位置                                                                    |
| preventOverflow       | boolean                                                 | 防止浮动元素溢出                                                            |
| ranges                | Range[](Ranges)                                         | 快捷项配置                                                                  |
| showMeridian          | boolean                                                 | 显示 12 小时制的时间格式                                                    |
| showWeekNumbers       | boolean                                                 | 显示周数量                                                                  |
| size                  | enum: 'lg' &#124; 'md' &#124; 'sm' &#124; 'xs' `('md')` | 组件设置尺寸                                                                |
| timeZone              | string                                                  | [IANA 时区名](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) |
| toggleAs              | ElementType `('a')`                                     | 为组件自定义元素类型                                                        |
| value                 | Date                                                    | 值`受控`                                                                    |

## Default

### Ranges

```js
const Ranges = [
  {
    label: 'today',
    value: new Date(),
    closeOverlay: true
  },
  {
    label: 'yesterday',
    value: dateFns.addDays(new Date(), -1),
    closeOverlay: true
  }
];
```
