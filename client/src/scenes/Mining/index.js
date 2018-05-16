import React from 'react'
import gql from 'graphql-tag'
import { graphql } from "react-apollo"
import * as R from 'ramda'
import { compose, withProps, withHandlers } from "recompose"
import { Table, Layout, Popconfirm } from 'antd'
const { Content } = Layout

const miningQuery = gql`
  query {
    scrapes {
      id, createdAt, source, startUrl, numRequested, numEffective
    }
  }
`

const miningGraphql = graphql(miningQuery)

const removeScrapeGraphQl = graphql(gql`
  mutation ($id: ID!) {
    removeScrape (id: $id) {
      id,
      source,
    }
  }
`, {
  props: ({ ownProps, mutate }) => ({
    removeScrape: ({ id }) => mutate({
      variables: { id },
      // optimisticResponse: {
      //   __typename: 'Mutation',
      //   removeScrape: {
      //     __typename: 'Scrape',
      //     id,
      //   }
      // },
      update: (proxy, { data: { removeScrape } }) => {
        const data = proxy.readQuery({ query: miningQuery })
        const index = data.scrapes.findIndex(x => x.id === removeScrape.id)

        if (index >= 0) {
          data.scrapes.splice(index, 1)
        }

        proxy.writeQuery({ query: miningQuery, data })
      }
    })
  })
})

const Mining = ({ scrapes, loading, onTableChange, onScrapeDelete }) => {
  const columns = [
    {
      title: 'Created at',
      dataIndex: 'createdAt',
    },
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'Number of requested',
      dataIndex: 'numRequested',
    },
    {
      title: 'Number of effective',
      dataIndex: 'numEffective',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Popconfirm placement="left" title={"Are you sure?"} onConfirm={() => onScrapeDelete(record)} okText="Yes" cancelText="No">
            <a href="#">Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      rowKey={record => record.id}
      dataSource={scrapes}
      pagination={false}
      loading={loading}
      onChange={onTableChange}
    />
  )
}

export default compose(
  miningGraphql,
  removeScrapeGraphQl,
  withProps(R.pipe(
    R.prop('data'),
    R.pick(['scrapes', 'loading']),
  )),
  withHandlers({
    onTableChange: (props) => () => {},
    onScrapeDelete: (props) => (record) => {
      props.removeScrape(record)
    },
  }),
)(Mining)
