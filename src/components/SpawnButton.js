import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button } from 'antd';
import { sendTx } from '../actions';
import { spawnRacerTx } from '../constants';

class SpawnButton extends PureComponent {
  render() {
    const {spawnCount, dispatch } = this.props;
    return (
      <Button type="ghost" style={(spawnCount > 0) ? 
          {margin: "6px 12px 6px 0px", color:"#002950", backgroundColor: "#f0f2f5"} : 
            {margin: "6px 12px 6px 0px", color:"#bbb", backgroundColor: "#f0f2f5"}
        }
        disabled={spawnCount < 1}
        onClick={() => Modal.confirm({
          centered: true,
          title: 'Spawn next Block Racer?',
          content: <div><p>{'Each created Block Racer requires a Spawn transaction, open to anyone. '+
            'Transaction will spawn the next Block Racer in spawning queue.'}</p>
            <p>{'Spawn Reward: 4 finney. *Payed by creator. Transaction is '+
              'open to anyone. First come, first served.'}</p>
            <p>{'Provider (MetaMask) will follow to confirm transaction.'}</p></div>,
          okText: <span style={{color: "#002950"}}>Spawn</span>,
          cancelText: <span style={{color: "#002950"}}>Cancel</span>,
          onOk() { dispatch(sendTx(spawnRacerTx())); },
          onCancel() {}
        })}>
        {'Spawn Racer ('+spawnCount+' ready)'}
      </Button>
    );
  }
};

SpawnButton.propTypes = {
  spawnCount: PropTypes.number
}

export default connect((state) => ({
  spawnCount: state.spawnCount
}))(SpawnButton);