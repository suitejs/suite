# DatePicker

To select or input a date or time

> When you need to select a date range, it is recommended to use [`<DateRangePicker>`](/components/date-range-picker)

## Usage

<!--{include:(components/date-picker/fragments/import.md)}-->

## Examples

### Default

<!--{include:`basic.md`}-->

### Size

<!--{include:`size.md`}-->

### One tap

<!--{include:`one-tap.md`}-->

### Appearance

<!--{include:`appearance.md`}-->

### Block

<!--{include:`block.md`}-->

### Placeholder

<!--{include:`placeholder.md`}-->

### Date and time

<!--{include:`format.md`}-->

### Show month

<!--{include:`format-month.md`}-->

### Show time

<!--{include:`format-time.md`}-->

### Meridian format

Display hours in 12 format.

<!--{include:`format-time-meridian.md`}-->

### ISO week

International Standard ISO 8601 defines that each calendar week begins on Monday and Sunday is the seventh day, [ISO week date](https://en.wikipedia.org/wiki/ISO_week_date).

The calendar panel can be displayed in ISO standard via the ʻisoWeek` property setting.

<!--{include:`iso-week.md`}-->

### Disabled and read only

<!--{include:`disabled.md`}-->

### Set the local language

`DatePicker` supports local language custom configuration, but we recommend using the unified [internationalization](/guide/intl) configuration.

<!--{include:`intl.md`}-->

### Placement

<!--{include:`placement.md`}-->

> Tip: When set to `auto*`, try to scroll the page, or change the browser size, it will automatically appear in the right place.

### Custom short options

<!--{include:`custom.md`}-->

Clicking "The day before" in the example does not close the picker layer because the `closeOverlay:boolean` property is configured. This propperty is used to set whether to close the picker layer after clicking the shortcut item. The default value is `true`.

### Controlled

<!--{include:`control.md`}-->

### Selection range

<!--{include:`range.md`}-->

### Show week numbers

<!--{include:`show-week-numbers.md`}-->

### Native pickers

If you only need to meet the simple date selection function, you can use the native pickers supported by the browser.

<!--{include:`native-pickers.md`}-->

## Accessibility

Learn more in [Accessibility](/guide/accessibility).

## Props

### `<DatePicker>`

| Property              | Type`(default)`                                         | Description                                                                          |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| appearance            | enum: 'default' &#124; 'subtle' `('default')`           | Set picker appearence                                                                |
| block                 | boolean                                                 | Blocking an entire row                                                               |
| calendarDefaultDate   | Date                                                    | Calendar panel default presentation date and time                                    |
| cleanable             | boolean `(true)`                                        | Whether the selected value can be cleared                                            |
| container             | HTMLElement &#124; (() => HTMLElement)                  | Sets the rendering container                                                         |
| defaultOpen           | boolean                                                 | Default value of open property                                                       |
| defaultValue          | Date                                                    | Default value                                                                        |
| disabled              | boolean                                                 | Whether disabled the component                                                       |
| disabledDate          | (date:Date) => boolean                                  | Disabled date                                                                        |
| disabledHours         | (hour:number, date:Date) => boolean                     | Disabled hours                                                                       |
| disabledMinutes       | (minute:number, date:Date) => boolean                   | Disabled minutes                                                                     |
| disabledSeconds       | (second:number, date:Date) => boolean                   | Disabled seconds                                                                     |
| format                | string `('yyyy-MM-dd')`                                 | Format date                                                                          |
| hideHours             | (hour:number, date:Date) => boolean                     | Hidden hours                                                                         |
| hideMinutes           | (minute:number, date:Date) => boolean                   | Hidden minutes                                                                       |
| hideSeconds           | (second:number, date:Date) => boolean                   | Hidden seconds                                                                       |
| inline                | boolean                                                 | Display date panel when component initial                                            |
| isoWeek               | boolean                                                 | ISO 8601 standard, each calendar week begins on Monday and Sunday on the seventh day |
| limitEndYear          | number `(1000)`                                         | Set the lower limit of the available year relative to the current selection date     |
| locale                | object                                                  | i18n config                                                                          |
| onChange              | (date: Date) => void                                    | Callback fired when value changed                                                    |
| onChangeCalendarDate  | (date: Date, event) => void                             | Callback function that changes the calendar date.                                    |
| onClean               | (event) => void                                         | Callback fired when value clean                                                      |
| onClose               | () => void                                              | Callback fired when close component                                                  |
| onEnter               | () => void                                              | Callback fired before the overlay transitions in                                     |
| onEntered             | () => void                                              | Callback fired after the overlay finishes transitioning in                           |
| onEntering            | () => void                                              | Callback fired as the overlay begins to transition in                                |
| onExit                | () => void                                              | Callback fired right before the overlay transitions out                              |
| onExited              | () => void                                              | Callback fired after the overlay finishes transitioning out                          |
| onExiting             | () => void                                              | Callback fired as the overlay begins to transition out                               |
| onNextMonth           | (date: Date) => void                                    | Switch to the callback function for the next Month                                   |
| onOk                  | (date: Date, event) => void                             | Click the OK callback function                                                       |
| onOpen                | () => void                                              | Callback fired when open component                                                   |
| onPrevMonth           | (date: Date) => void                                    | Switch to the callback function for the previous Month                               |
| onSelect              | (date: Date) => void                                    | Callback fired when date or time is selected                                         |
| onToggleMonthDropdown | (open: boolean) => void                                 | Callback function that switches to the month view                                    |
| onToggleTimeDropdown  | (open: boolean) => void                                 | Callback function that switches to the time view                                     |
| oneTap                | boolean                                                 | One click to complete the selection date                                             |
| open                  | boolean                                                 | Whether open the component                                                           |
| placeholder           | string                                                  | Placeholder                                                                          |
| placement             | Placement `('bottomStart')`                             | The placement of component                                                           |
| preventOverflow       | boolean                                                 | Prevent floating element overflow                                                    |
| ranges                | Range[] `(Ranges)`                                      | Shortcut config                                                                      |
| showMeridian          | boolean                                                 | Display hours in 12 format                                                           |
| showWeekNumbers       | boolean                                                 | Whether to show week numbers                                                         |
| size                  | enum: 'lg' &#124; 'md' &#124; 'sm' &#124; 'xs' `('md')` | A picker can have different sizes                                                    |
| toggleAs              | ElementType `('a')`                                     | You can use a custom element for this component                                      |
| value                 | Date                                                    | Value (Controlled)                                                                   |

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
