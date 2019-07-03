import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Col, Row } from 'antd';
import { sendTx } from '../actions';
import { spawnRacerTx } from '../constants';

class SpawnButton extends PureComponent {
  render() {
    const {entityC, account, spawnCount, dispatch } = this.props;
    return (
      <Button type="ghost" style={(spawnCount > 0) ? 
          {margin: "6px 12px 6px 0px", color:"#002950", backgroundColor: "#f0f2f5"} : 
            {margin: "6px 12px 6px 0px", color:"#bbb", backgroundColor: "#f0f2f5"}
        }
        disabled={spawnCount < 1}
        onClick={async () => {
          let gas = '';
          try {
            gas = await entityC.methods.spawnEntity().estimateGas({from: account});
          } catch (e) { gas = 'TX MAY FAIL'; }
          Modal.confirm({
            centered: true,
            title: 'Spawn the next Block Racer?',
            content: 
              <Col><Row>{'Each created Block Racer requires a Spawn transaction, open to anyone. '+
              'The transaction will semi-blindly spawn the next Block Racer in the spawning queue. Spawning provides '+
              ' a Block Racer with genes, it\'s relatively unique skill potentials. Once created, a Block Racer must be Spawned with 256 blocks,'+
              ' or it will expire, resulting in permanently zeroed genes.'+
              ' Provider (MetaMask) will follow to confirm transaction.'}</Row>
              <Row><strong>{"Reward: 4 finney"}</strong></Row>
              <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row></Col>,
            okText: <span style={{color: "#002950"}}>Spawn</span>,
            cancelText: <span style={{color: "#002950"}}>Cancel</span>,
            onOk() { dispatch(sendTx(spawnRacerTx())); },
            onCancel() {}
          });
        }}>
        {'Spawn Racer ('+spawnCount+' ready)'}
      </Button>
    );
  }
};

SpawnButton.propTypes = {
  account: PropTypes.string,
  entityC: PropTypes.object,
  spawnCount: PropTypes.number
}

export default connect((state) => ({
  account: state.account,
  entityC: state.entityC,
  spawnCount: state.spawnCount
}))(SpawnButton);