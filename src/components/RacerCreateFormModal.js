import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select, Radio, Row, Col } from 'antd';
import { uiToggleCreateModal, sendTx } from '../actions';
import { createRacerTx, CREATION_FEE } from '../constants';

const RacerCreateFormModal = Form.create({ name: 'racer_create_form' })(
  // eslint-disable-next-line
  class extends Component {
    state = { gas: '' } 
    
    estimateGas = async () => {
      const { entityC, account, form: { getFieldValue } } = this.props;
      if (!account || !entityC || !getFieldValue) return;

      const name = getFieldValue('createType');
      const pA = getFieldValue('racerA');
      const pB = getFieldValue('racerB');
      let gas = '';
      try {
        gas = await entityC.methods.createEntity(
          name || '', 
          (pA && pB) ? pA : 0, 
          (pA && pB) ? pB : 0
        ).estimateGas({value: CREATION_FEE, from: account});
      } catch (e) { gas = 'TX MAY FAIL'; }
      this.setState({ gas });
    }
    componentDidMount() {
      this.estimateGas();
    }
    componentDidUpdate() {
      this.estimateGas();
    }
    render() {
      const { uiCreateModalOpen, form, racers, racer, dispatch } = this.props;
      const { gas } = this.state;
      
      const { getFieldDecorator, getFieldValue } = form;
      const createType = getFieldValue('createType')
      const selectedRacerA = getFieldValue('racerA');
      const selectedRacerB = getFieldValue('racerB');

      return (
        <Modal
          visible={uiCreateModalOpen}
          centered
          title="Create a new Block Racer?"
          okText={<span style={{color: "#002950"}}>Create</span>}
          cancelText={<span style={{color: "#002950"}}>Cancel</span>}
          onCancel={() => dispatch(uiToggleCreateModal({open: false}))}
          onOk={() => {
            //const form = this.formRef.props.form;
            form.validateFields((err, values) => {
              if (err) return;
              //console.log('Received values of form: ', values);
              if(values.createType === "combine" && !!values && !!values.racerA && !!values.racerB) {
                dispatch(sendTx(createRacerTx(values.createName, values.racerA, values.racerB)));
              } else if(!!values) {//random
                dispatch(sendTx(createRacerTx((values.createName || ""), 0, 0)));
              }
              form.resetFields();
              dispatch(uiToggleCreateModal({open: false}));
              //dispatch create tx, delay create close
            });
          }}>
          <Col>
            <Row>{'Each Block Racer is a standard (ERC721) tradable non-fungible token. '+
              'Once created, a Block Racer also requires a Spawn transaction, to give the Block Racer it\'s relatively unique genes / skill potentials.'+
              ' Provider (MetaMask) will follow to confirm transaction.'}</Row>
            <Row><strong>{"Creation Fee: 4 finney *spawner reward"}</strong></Row>
            <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row>
          </Col>
          <Form layout="inline">
            <Form.Item label="Name">
              {getFieldDecorator('createName', {
                rules: [{ required: true, message: 'Select a name.' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item style={{marginBottom: 0}}>
              {getFieldDecorator('createType', {
                initialValue: 'random',
              })(
                <Radio.Group>
                  <Radio value="random">Random</Radio>
                  <Radio value="combine">Combine</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            {createType === "combine" && (
            <Form.Item label="Racer A" hasFeedback>
              {getFieldDecorator('racerA', {
                rules: [{ required: true, message: 'Select racer to combine.' }],
              })(
                <Select style={{ width: "256px" }}
                  showSearch
                  allowClear
                  dropdownMatchSelectWidth={false}
                  placeholder={"Select a racer"}
                  notFoundContent="No racers to combine"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {!!racers.length && racers.filter((each) => 
                    (!!racer["$"+each] && racer["$"+each].state === "IDLE" && (!selectedRacerB || each !== selectedRacerB))
                  ).map((id) => (
                    <Select.Option key={id} value={id}>
                      {(!!racer["$"+id])? racer["$"+id].displayName+' ('+racer["$"+id].state+')': "Racer #"+id}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>)}
            {createType === "combine" && (
            <Form.Item label="Racer B" hasFeedback>
              {getFieldDecorator('racerB', {
                rules: [{ required: true, message: 'Select racer to combine.' }],
              })(
                <Select style={{ width: "256px" }}
                  showSearch
                  allowClear
                  dropdownMatchSelectWidth={false}
                  placeholder={"Select a racer"}
                  notFoundContent="No racers to combine"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {!!racers.length && racers.filter((each) => 
                    (!!racer["$"+each] && racer["$"+each].state === "IDLE" && (!selectedRacerA || each !== selectedRacerA))
                  ).map((id) => (
                    <Select.Option key={id} value={id}>
                      {(!!racer["$"+id])? racer["$"+id].displayName+' ('+racer["$"+id].state+')': "Racer #"+id}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>)}
          </Form>
        </Modal>
      );
    }
  }
);

  //wrappedComponentRef={(formRef) => { this.formRef = formRef; }}

RacerCreateFormModal.propTypes = {
  entityC: PropTypes.object,
  account: PropTypes.string,
  uiCreateModalOpen: PropTypes.bool,
  racers: PropTypes.array,
  racer: PropTypes.object
}

export default connect((state) => ({
  entityC: state.entityC,
  account: state.account,
  uiCreateModalOpen: state.uiCreateModalOpen,
  racers: state.racers,
  racer: state.racer
}))(RacerCreateFormModal);