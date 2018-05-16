import React from 'react'
import { compose, withProps } from 'recompose'
import * as R from 'ramda'
import { List, Spin, Badge, Tag } from 'antd'
import styled from 'styled-components'

import getAspectStats from './../services/getAspectStats'

const Item = styled.span`
  margin-right 16px
`

const AspectStat = ({ item, loading, aspectStats }) => {
  if (loading) {
    return <Spin />
  }

  return (
    <List
      dataSource={aspectStats.items}
      renderItem={item => (
        <List.Item key={item.adapterId}>
          <List.Item.Meta
            description={item.possibleValues.map(x => (
              <Item>
                <Badge count={x.count}>
                  <Tag>{x.content}</Tag>
                </Badge>
              </Item>
            ))}
            title={item.adapterId}
          />
          <pre>{JSON.stringify(R.pick(['isUndefinedPossible'])(item))}</pre>
        </List.Item>
      )}
    />
  )
}

export default compose(
  getAspectStats,
  withProps(R.pipe(
    R.prop('data'),
    R.pick(['aspectStats', 'loading']),
  )),
)(AspectStat)
