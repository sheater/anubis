import React from 'react'
import { compose, withProps, withHandlers } from 'recompose'
import * as R from 'ramda'
import { Table, Popconfirm } from 'antd'

import listAll from './services/listAll'
import removeCompetitor from './services/removeCompetitor'
import { renderDecimal, renderPrice } from "../../utils/renderNumber"

const Competitors = props => {
  const { competitors, loading, onChange, onCompetitorRemove } = props

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
      render: x => x.substring(0, 4)
    },
    { title: 'Source', dataIndex: 'source', width: 130 },
    {
      title: 'Link',
      dataIndex: 'originalUrl',
      width: 70,
      render: (x) => {
        return <a href={x} target="_blank">Link</a>
      }
    },
    {
      title: 'Address',
      dataIndex: 'address',
      width: 200,
      sorter: (a, b) => a.address.localeCompare(b.address),
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Downtown distance',
      dataIndex: 'downtownDistance',
      width: 200,
      sorter: (a, b) => a.downtownDistance - b.downtownDistance,
      defaultSortOrder: 'ascend',
      render: x => renderDecimal(x / 1000)
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: renderPrice,
      width: 100,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Unit price',
      dataIndex: 'unitPrice',
      render: renderPrice,
      width: 100,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    { title: 'Rooms', dataIndex: 'numRooms', width: 100 },
    { title: 'Kitchen', dataIndex: 'kitchenType', width: 100 },
    { title: 'Ownership', dataIndex: 'ownershipType', width: 110 },
    { title: 'Condition', dataIndex: 'flatCondition', width: 120 },
    { title: 'Construction', dataIndex: 'constructionType', width: 120 },
    { title: 'Floor #', dataIndex: 'floorNum', width: 70 },
    {
      title: 'Basement',
      dataIndex: 'basement',
      width: 100,
      render: x => x ? '✅' : '🚫'
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) => (
        <span>
          <Popconfirm
            placement="left"
            title={"Are you sure?"}
            onConfirm={() => onCompetitorRemove(record)}
            okText="Yes"
            cancelText="No"
          >
            <a href="#">Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  const enhancedCompetitors = (competitors || []).map(x =>
    Object.assign({}, x, { unitPrice: x.price / x.size }))

  const width = columns.reduce((acc, x) => acc + x.width, 0)

  return (
    <Table
      columns={columns}
      dataSource={enhancedCompetitors}
      scroll={{ x: width, y: document.body.clientHeight - 54 }}
      loading={loading}
      pagination={false}
      onChange={onChange}
    />
  )
}

export default compose(
  listAll,
  removeCompetitor,
  withProps(
    R.pipe(
      R.prop('data'),
      R.pick(['competitors', 'loading'])
    )
  ),
  withHandlers({
    onChange: () => (pagination, filters, sorter) => {
      console.log('Various parameters', pagination, filters, sorter)
    },
    onCompetitorRemove: (props) => (record) => {
      console.log(props)
      props.removeCompetitor(record)
    },
  })
)(Competitors)
