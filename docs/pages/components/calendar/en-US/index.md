# Calendar

A component that displays data by calendar

## Import

<!--{include:(components/calendar/fragments/import.md)}-->

## Examples

### Default

<!--{include:`basic.md`}-->

### Compact

<!--{include:`compact.md`}-->

## Props

### `<Calendar>`

| Property     | Type`(Default)`           | Description                                                                          |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------ |
| bordered     | boolean                   | Show border                                                                          |
| compact      | boolean                   | Display a compact calendar                                                           |
| defaultValue | Date                      | Default value                                                                        |
| isoWeek      | boolean                   | ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day |
| onChange     | (date:Date) => void       | Callback fired before the value changed                                              |
| onSelect     | (date:Date) => void       | Callback fired before the date selected                                              |
| renderCell   | (date: Date) => ReactNode | Custom render calendar cells                                                         |
| value        | Date                      | Controlled value                                                                     |
