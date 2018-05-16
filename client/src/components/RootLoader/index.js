import React from 'react'
import styled from 'styled-components'
import { Spin } from 'antd'

const SpinnerWrapper = styled.div`
  background-color: #eee;
  width: 100%;
  height: 100%;
  
  display: flex;
  justify-content: center;
  align-items: center;

  .ant-spin-lg .ant-spin-dot {
    width: 64px;
    height: 64px;
    
    i {
      width: 25px;
      height: 25px;
    }
  }
`

const RootLoader = () => (
  <SpinnerWrapper>
    <Spin size="large" />
  </SpinnerWrapper>
)

export default RootLoader
