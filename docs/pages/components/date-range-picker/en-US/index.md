# DateRangePicker

Used to quickly select a date range

If `<DateRangePicker>` does not satisfy the business scenario in which you select the time range, you can use two [`DatePicker`](/components/date-picker#Selection range) combinations.

## Import

<!--{include:(components/date-range-picker/fragments/import.md)}-->

## Examples

### Default

<!--{include:`basic.md`}-->

### Appearance

<!--{include:`appearance.md`}-->

### Size

<!--{include:`size.md`}-->

### Block

<!--{include:`block.md`}-->

### Placeholder

<!--{include:`placeholder.md`}-->

### Select Whole Week, Whole Month

<!--{include:`hover-range.md`}-->

### One tap

<!--{include:`one-tap.md`}-->

### Show Week Numbers

<!--{include:`show-week-numbers.md`}-->

### Show One Calendar

<!--{include:`show-only-calendar.md`}-->

### Disabled and read only

<!--{include:`disabled.md`}-->

`disabledDate` is a function type property that is called when the calendar is rendered and the date is selected, and the options that need to be disabled can be customized according to the business. The syntax is as follows:

```ts
disabledDate(
 date: Date,              // Date used to determine if disabling is required.
 selectDate: Array<Date>, // Date selected.
 selectedDone: boolean,     // Whether to choose to finish now. If `false`, only the start date is selected, waiting for the selection end date.
 target: 'CALENDAR', 'TOOLBAR_BUTTON_OK', 'TOOLBAR_SHORTCUT'   // Call the target of the `disabledDate` function
) => boolean
```

To make it easier to set the date you want to disable, `DateRangePicker` provides some methods for easy calling, examples:

```ts
import { DateRangePicker } from 'rsuite';

const { combine, allowedMaxDays, beforeToday } = DateRangePicker;

ReactDOM.render(<DateRangePicker disabledDate={combine(allowedMaxDays(7), beforeToday())} />);
```

**allowedMaxDays**

Allow the maximum number of days specified, other dates are disabled

```ts
allowedMaxDays(days: number) => boolean
```

**allowedDays**

Only allowed days are specified, other dates are disabled

```ts
allowedDays(days: number) => boolean
```

**allowedRange**

Allow specified date range, other dates are disabled

```ts
allowedRange( startDate: string | Date, endDate: string | Date) => boolean
```

**after**

Disable dates after the specified date

```ts
after(date?: string | Date) => boolean
```

**afterToday**

Disable dates after today

```ts
afterToday() => boolean
```

**before**

Disable dates before the specified date

```ts
before(date?: string | Date) => boolean
```

**beforeToday**

Disable dates before today

```ts
beforeToday() => boolean
```

**combine**

Used to combine multiple conditions

```ts
combine(...) => boolean
```

### Custom Shortcut Options

<!--{include:`custom-shortcut-options.md`}-->

### Controlled

<!--{include:`controlled.md`}-->

## Accessibility

Learn more in [Accessibility](/guide/accessibility).

## Props

```ts
type ValueType = ValueType;

type DisabledDateFunction = (
  /** Date used to determine if disabling is required. */
  date: Date,

  /** Date selected. */
  selectDate?: ValueType,

  /**
   Whether to choose to finish now.
   If `false`, only the start date is selected, waiting for the selection end date.
   */
  selectedDone?: boolean,

  // Call the target of the `disabledDate` function
  target?: 'CALENDAR' | 'TOOLBAR_BUTTON_OK' | 'TOOLBAR_SHORTCUT'
) => boolean;
```

### `<DateRangePicker>`

| Property             | Type`(default)`                                         | Description                                                                          |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| appearance           | enum: 'default' &#124; 'subtle' `('default')`           | Set picker appearence                                                                |
| block                | boolean                                                 | Blocking an entire row                                                               |
| cleanable            | boolean `(true)`                                        | Whether the selected value can be cleared                                            |
| container            | HTMLElement &#124; (() => HTMLElement)                  | Sets the rendering container                                                         |
| defaultCalendarValue | ValueType                                               | Default calendar panel date                                                          |
| defaultOpen          | boolean                                                 | Default value of open property                                                       |
| defaultValue         | ValueType                                               | Default value                                                                        |
| disabled             | boolean                                                 | Whether disabled the component                                                       |
| disabledDate         | DisabledDateFunction                                    | Disabled data                                                                        |
| hoverRange           | unions: 'week', 'month' or (date: Date) => ValueType    | The date range that will be selected when you click on the date                      |
| isoWeek              | boolean                                                 | ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day |
| limitEndYear         | number `(1000)`                                         | Sets the lower limit of the available year relative to the current selection date    |
| onChange             | (value: ValueType) => void                              | Callback fired when value changed                                                    |
| onClean              | (event) => void                                         | Callback fired when value clean                                                      |
| onClose              | () => void                                              | Callback fired when close component                                                  |
| onEnter              | () => void                                              | Callback fired before the overlay transitions in                                     |
| onEntered            | () => void                                              | Callback fired after the overlay finishes transitioning in                           |
| onEntering           | () => void                                              | Callback fired as the overlay begins to transition in                                |
| onExit               | () => void                                              | Callback fired right before the overlay transitions out                              |
| onExited             | () => void                                              | Callback fired after the overlay finishes transitioning out                          |
| onExiting            | () => void                                              | Callback fired as the overlay begins to transition out                               |
| onOk                 | (value: ValueType) => void                              | Callback fired when clicked OK button                                                |
| onOpen               | () => void                                              | Callback fired when open component                                                   |
| onSelect             | (date:Date) => void                                     | Callback fired when date is selected                                                 |
| oneTap               | boolean                                                 | Whether to click once on selected date range，Can be used with hoverRange            |
| open                 | boolean                                                 | whether open the component                                                           |
| placeholder          | string                                                  | Setting placeholders                                                                 |
| placement            | Placement `('bottomStart')`                             | The placement of component                                                           |
| preventOverflow      | boolean                                                 | Prevent floating element overflow                                                    |
| ranges               | Range[] `(Ranges)`                                      | Whortcut config，defeult: `Today`,`Yesterday`，`Last 7 days`                         |
| renderValue          | (value: ValueType, format: string) => ReactNode         | Custom render selected date range                                                    |
| showOneCalendar      | boolen                                                  | Whether to show only one calendar                                                    |
| showWeekNumbers      | boolean                                                 | Whether to show week numbers                                                         |
| size                 | enum: 'lg' &#124; 'md' &#124; 'sm' &#124; 'xs' `('md')` | A picker can have different sizes                                                    |
| toggleAs             | ElementType `('a')`                                     | You can use a custom element for this component                                      |
| value                | ValueType                                               | Value (Controlled)                                                                   |

## Default

### Ranges

```js
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';

const Ranges = [
  {
    label: 'today',
    value: [startOfDay(new Date()), endOfDay(new Date())]
  },
  {
    label: 'yesterday',
    value: [startOfDay(addDays(new Date(), -1)), endOfDay(addDays(new Date(), -1))]
  },
  {
    label: 'last7Days',
    value: [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]
  }
];
```
