import React from "react"
import styled from "styled-components"
import { Layout, Menu, Icon, Alert } from "antd"
import { withRouter } from "react-router"
import { pure, compose, withHandlers } from 'recompose'

import LogoIcon from "./LogoIcon"

const { SubMenu } = Menu;

const Logo = styled.div`
  display: flex;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  margin-right: 1rem;
  line-height: 200%;

  svg {
    margin: 10px;
    width: 40px;
    height: 40px;
  }
`

const Nav = ({ global, onClick }) => {
  return (
    <Layout.Sider style={{overflow: "auto", height: "100vh", position: "fixed", left: 0}}>
      <Logo><LogoIcon/> anubis</Logo>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["mining"]}
        onClick={onClick}
      >
        <Menu.Item key="mining">
          <Icon type="user" />
          <span className="nav-text">mining</span>
        </Menu.Item>
        <SubMenu key="snapshots" title={<span><Icon type="video-camera" />snapshots</span>}>
          {global.adapters.map(x => <Menu.Item key={`snapshots/${x.id}`}>{x.name}</Menu.Item>)}
        </SubMenu>
        <Menu.Item key="aspects">
          <Icon type="tag-o" />
          <span className="nav-text">aspects</span>
        </Menu.Item>
        <Menu.Item key="competitors">
          <Icon type="upload"/>
          <span className="nav-text">competitors</span>
        </Menu.Item>
        <SubMenu key="stats" title={<span><Icon type="bar-chart" />stats</span>}>
          <Menu.Item key="stats/prices">prices</Menu.Item>
          <Menu.Item key="stats/quantities">quantities</Menu.Item>
          <Menu.Item key="stats/correlation">correlation</Menu.Item>
          <Menu.Item key="stats/heatmaps">heatmaps</Menu.Item>
          <Menu.Item key="stats/streets">streets</Menu.Item>
        </SubMenu>
        <Menu.Item key="evaluate">
          <Icon type="cloud-o"/>
          <span className="nav-text">evaluate</span>
        </Menu.Item>
      </Menu>
      {/*<Alert style={{ margin: '10px' }} message="VUT USI 2018, created by Stephen Skovajsa" type="info" />*/}
    </Layout.Sider>
  )
}

export default compose(
  withRouter,
  pure,
  withHandlers({
    onClick: props => ev => {
      props.history.push(`/${ev.key}`)
    }
  })
)(Nav)
