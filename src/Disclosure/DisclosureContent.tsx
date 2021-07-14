import React, { useContext, useRef } from 'react';
import DisclosureContext from './DisclosureContext';

export interface DisclosureContentRenderProps {
  open: boolean;
}

export interface DisclosureContentProps {
  children: (
    props: React.HTMLAttributes<HTMLElement> & DisclosureContentRenderProps,
    ref: React.Ref<HTMLElement>
  ) => React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

function DisclosureContent(props: DisclosureContentProps) {
  const { children } = props;

  const elementRef = useRef<HTMLElement>();

  const [{ open }] = useContext(DisclosureContext);

  return children({ open }, elementRef);
}

DisclosureContent.displayName = 'Disclosure.Content';

export default DisclosureContent;
