import React from 'react'
import { withApollo } from 'react-apollo'
import {
  Form, Input, Button, InputNumber,
  Select, Layout,
  Card, Col, Row, Divider,
  Table, Collapse,
} from 'antd'
import { renderPrice } from '../../utils/renderNumber'
import * as R from 'ramda'
import { compose, withHandlers, withState } from 'recompose'
import gql from "graphql-tag"
const Panel = Collapse.Panel;

const { Content } = Layout
const FormItem = Form.Item

const Evaluate = props => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    style: { marginBottom: '0' }
  };

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const rooms = R.pipe(
    R.map(x => ['1', 'KK'].map(y => `${x}+${y}`)),
    R.flatten,
  )(R.range(1, 7))

  const { loading, result, form } = props
  const { getFieldDecorator } = form

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
      render: x => x.substring(0, 4)
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
    },
    {
      title: 'Rooms',
      dataIndex: 'numRooms',
      width: 100,
    },
    {
      title: 'Kitchen',
      dataIndex: 'kitchenType',
      width: 100,
    },
    {
      title: 'Ownership',
      dataIndex: 'ownershipType',
      width: 110,
    },
    {
      title: 'Condition',
      dataIndex: 'flatCondition',
      width: 120,
    },
    {
      title: 'Construction',
      dataIndex: 'constructionType',
      width: 120,
    },
    {
      title: 'Floor #',
      dataIndex: 'floorNum',
      width: 80,
    },
    {
      title: 'Basement',
      dataIndex: 'basement',
      width: 100,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: renderPrice,
      width: 100,
    },
    {
      title: 'Unit price',
      dataIndex: 'unitPrice',
      render: renderPrice,
      width: 100,
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
    { title: 'Address', dataIndex: 'address', width: 200 },
  ]

  const width = columns.reduce((acc, x) => acc + x.width, 0)

  return (
    <Content style={{ padding: '20px' }}>
      <Collapse defaultActiveKey={['1']}>
        <Panel header="Parameters" key="1">
          <Form onSubmit={props.evaluate}>
            <FormItem {...formItemLayout} label="Address">
              {getFieldDecorator('address', {
                initialValue: 'Brno, Cejl',
                rules: [{
                  required: true,
                }],
              })(
                <Input />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="Size m^2">
              {getFieldDecorator('size', {
                initialValue: 50,
                rules: [{
                  required: true,
                  type: 'number',
                }],
              })(
                <InputNumber min={1} />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="Rooms">
              {getFieldDecorator('rooms', {
                initialValue: R.head(rooms),
              })(
                <Select>
                  {rooms.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="Ownership">
              {getFieldDecorator('ownershipType', {
                initialValue: '',
              })(
                <Select allowClear>
                  <Select.Option value="PERSONAL">Personal</Select.Option>
                  <Select.Option value="SOCIETY">Society</Select.Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="Condition">
              {getFieldDecorator('flatCondition', {
                initialValue: '',
              })(
                <Select allowClear>
                  <Select.Option value="NEW">New</Select.Option>
                  <Select.Option value="VERY_GOOD">Very good</Select.Option>
                  <Select.Option value="GOOD">Good</Select.Option>
                  <Select.Option value="AFTER_RECONSTRUCTION">After reconstruction</Select.Option>
                  <Select.Option value="BEFORE_RECONSTRUCTION">Before reconstruction</Select.Option>
                  <Select.Option value="BUILDING">Under construction</Select.Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="Construction">
              {getFieldDecorator('constructionType', {
                initialValue: '',
              })(
                <Select allowClear>
                  <Select.Option value="PANEL">Panel</Select.Option>
                  <Select.Option value="BRICK">Brick</Select.Option>
                  <Select.Option value="MIX">Mix</Select.Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" loading={loading}>Evaluate</Button>
            </FormItem>
          </Form>
        </Panel>
      </Collapse>

      {(result && !loading) && (
        <div>
          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Estimated price" bordered={true}>
                {renderPrice(result.estimatedPrice)}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Estimated unit price" bordered={false}>
                {renderPrice(result.estimatedUnitPrice)}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Standard deviation" bordered={false}>
                {renderPrice(result.standardDeviation)}
              </Card>
            </Col>
          </Row>

          <Table
            style={{ marginTop: '20px' }}
            columns={columns}
            dataSource={result.competitors}
            scroll={{ x: width, y: 300 }}
            pagination={false}
          />
        </div>
      )}
    </Content>
  )
}

const query = gql`
  query ($attributes: EvaluationAttributes!) {
    evaluate (attributes: $attributes) {
      estimatedPrice
      estimatedUnitPrice
      standardDeviation
      competitors
    }
  }
`

export default compose(
  withApollo,
  Form.create({}),
  withState('result', 'setResult', null),
  withState('loading', 'setLoading', false),
  withHandlers({
    evaluate: (props) => (event) => {
      event.preventDefault()
      props.form.validateFields((err, values) => {
        if (err) {
          return
        }

        props.setLoading(true)

        const rooms = values.rooms.split('+')
        const numRooms = Number.parseInt(R.head(rooms))
        const kitchenType = R.last(rooms)
        const attributes = R.pipe(
          R.pick([
            'address', 'size', 'ownershipType',
            'flatCondition', 'constructionType',
          ]),
          R.merge({ numRooms, kitchenType })
        )(values)

        props.client.query({
          query,
          variables: { attributes },
        }).then(({ data: { evaluate } }) => {
          props.setResult(evaluate)
          props.setLoading(false)
        })
      })
    }
  })
)(Evaluate)
