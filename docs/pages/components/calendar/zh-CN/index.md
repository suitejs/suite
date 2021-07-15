# Calendar 日历

以日历的方式展示数据。

## 获取组件

<!--{include:(components/calendar/fragments/import.md)}-->

## 演示

### 默认

<!--{include:`basic.md`}-->

### 紧凑型

<!--{include:`compact.md`}-->

## Props

### `<Calendar>`

| 属性名称     | 类型`(默认值)`            | 描述                                                      |
| ------------ | ------------------------- | --------------------------------------------------------- |
| bordered     | boolean                   | 显示边框                                                  |
| compact      | boolean                   | 紧凑型显示                                                |
| defaultValue | Date                      | 默认值                                                    |
| isoWeek      | boolean                   | ISO 8601 标准， 每个日历星期从星期一开始，星期日为第 7 天 |
| onChange     | (date:Date) => void       | 值改变后的回调函数                                        |
| onSelect     | (date:Date) => void       | 选择日期后的回调函数                                      |
| renderCell   | (date: Date) => ReactNode | 自定义渲染日历单元格                                      |
| value        | Date                      | 值 (`受控`)                                               |
