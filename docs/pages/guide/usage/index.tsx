import * as React from 'react';
import PageContent from '@/components/PageContent';
import Frame from '@/components/Frame';

export default function Page() {
  return (
    <Frame>
      <PageContent routerId="guide/usage" />
    </Frame>
  );
}
