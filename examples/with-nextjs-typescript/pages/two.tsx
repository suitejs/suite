import React from 'react';
import Header from 'next/head';
import Layout from '../components/layout';
import 'rsuite/lib/styles/index.less';

export default function Home() {
  return (
    <>
      <Header>
        <title>TWO</title>
      </Header>
      <Layout activeKey="two">
        <h1> TWO </h1>
      </Layout>
    </>
  );
}

