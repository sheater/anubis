import React from 'react'
import { Layout as AntdLayout } from 'antd'
import { pure } from 'recompose'

import Nav from './components/Nav'

const Layout = ({ global, children }) => (
  <AntdLayout>
    <Nav global={global} />
    <AntdLayout style={{ marginLeft: 200, backgroundColor: '#fff' }}>
      {children}
    </AntdLayout>
  </AntdLayout>
)

export default pure(Layout)
