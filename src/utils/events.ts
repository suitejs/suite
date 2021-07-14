// Ref: https://reactjs.org/docs/events.html#detecting-focus-entering-and-leaving
import React from 'react';

/**
 * Whether the focus is moving inside of current element
 * @param event The `focus` event
 */
export function isFocusEntering(event: React.FocusEvent) {
  return (
    event.type === 'focus' && !event.currentTarget.contains(event.relatedTarget as HTMLElement)
  );
}

/**
 * Whether the focus is moving outside of current element
 * @param event The `blur` event
 */
export function isFocusLeaving(event: React.FocusEvent) {
  return event.type === 'blur' && !event.currentTarget.contains(event.relatedTarget as HTMLElement);
}
