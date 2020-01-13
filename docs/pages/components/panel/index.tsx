import * as React from 'react';
import { Button, Icon, Panel, PanelGroup, Table, Grid, Row, Col } from 'rsuite';

import PageContent from '@/components/PageContent';
import Frame from '@/components/Frame';
import tableData from '../table/data/users';

const { HeaderCell, Pagination, Cell, Column } = Table;

export default function Page() {
  return (
    <Frame>
      <PageContent
        id="Panel"
        examples={[
          'basic',
          'bordered',
          'shaded',
          'no-header',
          'card',
          'card-grid',
          'collapsible',
          'body-fill',
          'panel-group',
          'accordion-group',
          'accordion-group-active'
        ]}
        dependencies={{
          Table,
          PanelGroup,
          Panel,
          Icon,
          Button,
          HeaderCell,
          Pagination,
          Cell,
          Column,
          Grid,
          Row,
          Col,
          tableData
        }}
      />
    </Frame>
  );
}