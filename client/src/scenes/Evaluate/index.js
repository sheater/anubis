import React from 'react'
import { withApollo } from 'react-apollo'
import {
  Form, Input, Button,
  Checkbox, InputNumber,
  Select, Layout, Badge,
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

class Evaluate extends React.Component {
  render() {
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

    const { loading, result } = this.props
    const { getFieldDecorator } = this.props.form

    console.log('re', result)

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
        // render: renderWithSimilarityIndex('size'),
      },
      {
        title: 'Rooms',
        dataIndex: 'numRooms',
        width: 100,
        // render: renderWithSimilarityIndex('numRooms'),
      },
      {
        title: 'Kitchen',
        dataIndex: 'kitchenType',
        width: 100,
        // render: renderWithSimilarityIndex('kitchenType'),
      },
      {
        title: 'Ownership',
        dataIndex: 'ownershipType',
        width: 110,
        // render: renderWithSimilarityIndex('ownershipType'),
      },
      {
        title: 'Condition',
        dataIndex: 'flatCondition',
        width: 120,
        // render: renderWithSimilarityIndex('flatCondition'),
      },
      {
        title: 'Construction',
        dataIndex: 'constructionType',
        width: 120,
        // render: renderWithSimilarityIndex('constructionType'),
      },
      {
        title: 'Floor #',
        dataIndex: 'floorNum',
        width: 80,
        // render: renderWithSimilarityIndex('floorNum'),
      },
      {
        title: 'Basement',
        dataIndex: 'basement',
        width: 100,
        // render: renderBoolWithSimilarityIndex('basement')
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
      // {
      //   title: 'Weight',
      //   dataIndex: 'weight',
      //   width: 100,
      //   fixed: 'right',
      //   render: x => <NumberFormat value={x} decimalScale={2} displayType={'text'} />
      // },
    ]

    const width = columns.reduce((acc, x) => acc + x.width, 0)

    return (
      <Content style={{ padding: '20px' }}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Parameters" key="1">
            <Form onSubmit={this.props.evaluate}>
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

              {/*<FormItem {...formItemLayout} label="Rooms">*/}
                {/*{getFieldDecorator('rooms', {*/}
                  {/*initialValue: R.head(rooms),*/}
                {/*})(*/}
                  {/*<Select>*/}
                    {/*{rooms.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}*/}
                  {/*</Select>*/}
                {/*)}*/}
              {/*</FormItem>*/}

              {/*<FormItem {...formItemLayout} label="Ownership">*/}
                {/*{getFieldDecorator('ownershipType', {*/}
                  {/*initialValue: '',*/}
                {/*})(*/}
                  {/*<Select allowClear>*/}
                    {/*<Select.Option value="personal">Personal</Select.Option>*/}
                    {/*<Select.Option value="society">Society</Select.Option>*/}
                  {/*</Select>*/}
                {/*)}*/}
              {/*</FormItem>*/}

              {/*<FormItem {...formItemLayout} label="Condition">*/}
                {/*{getFieldDecorator('flatCondition', {*/}
                  {/*initialValue: '',*/}
                {/*})(*/}
                  {/*<Select allowClear>*/}
                    {/*<Select.Option value="NEW">New</Select.Option>*/}
                    {/*<Select.Option value="VERY_GOOD">Very good</Select.Option>*/}
                    {/*<Select.Option value="GOOD">Good</Select.Option>*/}
                    {/*<Select.Option value="AFTER_RECONSTRUCTION">After reconstruction</Select.Option>*/}
                    {/*<Select.Option value="BEFORE_RECONSTRUCTION">Before reconstruction</Select.Option>*/}
                    {/*<Select.Option value="BUILDING">Under construction</Select.Option>*/}
                  {/*</Select>*/}
                {/*)}*/}
              {/*</FormItem>*/}

              {/*<FormItem {...formItemLayout} label="Construction">*/}
                {/*{getFieldDecorator('constructionType', {*/}
                  {/*initialValue: '',*/}
                {/*})(*/}
                  {/*<Select allowClear>*/}
                    {/*<Select.Option value="PANEL">Panel</Select.Option>*/}
                    {/*<Select.Option value="BRICK">Brick</Select.Option>*/}
                    {/*<Select.Option value="SKELETON">Skelet</Select.Option>*/}
                    {/*<Select.Option value="WOOD">Wood</Select.Option>*/}
                    {/*<Select.Option value="MIX">Mix</Select.Option>*/}
                  {/*</Select>*/}
                {/*)}*/}
              {/*</FormItem>*/}

              {/*<FormItem {...formItemLayout} label="Floor number">*/}
                {/*{getFieldDecorator('floorNum', {*/}
                  {/*initialValue: 3,*/}
                {/*})(*/}
                  {/*<InputNumber min={0} />*/}
                {/*)}*/}
              {/*</FormItem>*/}

              {/*<FormItem {...tailFormItemLayout}>*/}
                {/*{getFieldDecorator('basement', {*/}
                  {/*initialValue: false,*/}
                {/*})(*/}
                  {/*<Checkbox>Basement</Checkbox>*/}
                {/*)}*/}
              {/*</FormItem>*/}

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
    evaluate: (props) => () => {
      props.form.validateFields((err, values) => {
        if (err) {
          return
        }

        props.setLoading(true)

        const rooms = '1+KK'//values.rooms.split('+')
        const numRooms = Number.parseInt(R.head(rooms))
        const kitchenType = R.last(rooms)
        const basement = Boolean(values.basement)
        const attributes = R.pipe(
          R.pick([
            'address', 'size', 'ownershipType',
            'flatCondition', 'constructionType',
            'floorNum', 'condition', 'flatCondition'
          ]),
          R.merge({ numRooms, kitchenType, basement })
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
