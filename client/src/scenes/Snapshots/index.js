import React from "react"
import { Layout, Table } from "antd"
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import * as R from 'ramda'
import { compose, mapProps, defaultProps } from 'recompose'
import { withRouter } from 'react-router'

const { Content } = Layout

const query = gql`
  query($adapter: String) {
    snapshots(adapter: $adapter)
  }
`

const snaphshotGrapgql = graphql(query, {
  options: (props) => {
    return {
      variables: {
        adapter: props.match.params.adapter
      }
    }
  }
})

const Snapshots = props => {
  const { snapshots, loading } = props

  const keys = (snapshots || []).reduce((acc, x) => {
    const keys = Object.keys(x)
    acc.push(...R.difference(keys, acc))
    return acc
  }, [])

  const columns = keys.reduce((acc, key, i) => {
    const column = {
      title: key,
      dataIndex: key,
      width: 200,
      key: i,
      render: (x) => {
        if (typeof x === 'string' && x.length > 50) {
          return x.substring(0, 50)
        }
        return x
      }
    }

    switch (key) {
      case 'address':
        column.fixed = 'left'
        break

      case 'originalUrl':
        column.fixed = 'right'
        column.width = 70
        column.render = (x) => {
          return <a href={x} target="_blank">Link</a>
        }
        break
    }

    acc.push(column)
    return acc
  }, [])

  const width = columns.reduce((acc, column) => acc + column.width, 0)

  return (
    <Table
      columns={columns}
      dataSource={snapshots}
      scroll={{ x: width, y: document.body.clientHeight - 54 }}
      loading={loading}
      pagination={false}
    />
  )
}

export default compose(
  withRouter,
  snaphshotGrapgql,
  mapProps(R.pipe(
    R.prop('data'),
    R.pick(['snapshots', 'loading'])
  ))
)(Snapshots)
