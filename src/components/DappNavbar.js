import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Row, Col, Button, Badge } from 'antd';
import { uiChangeDrawerView} from '../actions';
import BlockClock from "./BlockClock";
const { Header } = Layout;

class DappNavbar extends PureComponent {

  render() {
    const { loadingWeb3, web3Error, networkSyncing, networkName, blockNumber, account, 
            balanceView, exp, newEventCount, newTxCount, newRacerCount, 
            dispatch } = this.props;
    
    return (
      <Header style={{paddingLeft: "12px", paddingRight: "12px", paddingTop: "7px"}}>
        <Row style={{height: "100%", width: "100%"}}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} >
            <Row style={{whiteSpace: 'nowrap', lineHeight: "19px"}}>
              <span style={{fontSize: "20px", color: "white"}}>
                Block Racer
              </span>
              {(!!web3Error) ? 
                <span style={{fontSize: "20px", paddingLeft: "4px", color: "red"}}>
                  {web3Error}
                </span> : 
                <BlockClock 
                  networkSyncing={networkSyncing} 
                  networkName={(loadingWeb3) ? null : networkName}
                  blockNumber={(loadingWeb3) ? null : blockNumber}/>}
            </Row>
            <Row style={{lineHeight: "14px",whiteSpace: 'nowrap'}}>
              <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                account
              </span>
              <span style={{fontSize: "9px", color: "#ffc107", paddingTop: "1px"}}>
                {account}
              </span>
            </Row>
            <Row style={{lineHeight: "14px", paddingBottom: "4px", whiteSpace: 'nowrap'}}>
              <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                balance
              </span>
              <span style={{fontSize: "12px", color: "#ffc107", paddingRight: "4px"}}>
                {balanceView}
              </span>
              <span style={{fontSize: "14px", color: "#fff", paddingRight: "4px"}}>
                {'ether'}
              </span>
              <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                {'/'}
              </span>
              <span style={{fontSize: "12px", color: "#ffc107", paddingRight: "4px"}}>
                {exp}
              </span>
              <span style={{fontSize: "14px", color: "#fff"}}>
                {'experience'}
              </span>
            </Row>
          </Col>
          <Col offset={2} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px 0px 0px 24px"}} 
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'racers'}))}> 
              Racers 
               {(newRacerCount > 0) && (<Badge count={newRacerCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
          <Col offset={2} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px 8px"}}
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'events'}))}> 
               Events
               {(newEventCount > 0) && (<Badge count={newEventCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
          <Col offset={2} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px"}}
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'txs'}))}> 
              Txs 
               {(newTxCount > 0) && (<Badge count={newTxCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
        </Row>
      </Header>
    );
  }
}

DappNavbar.propTypes = {
  loadingWeb3: PropTypes.bool,
  web3Error: PropTypes.string,
  networkName: PropTypes.string,
  networkSyncing: PropTypes.bool,
  blockNumber: PropTypes.number,
  loadingAccount: PropTypes.bool,
  mountingAccount: PropTypes.bool,
  account: PropTypes.string,
  accountView: PropTypes.string,
  accountError: PropTypes.string,
  balanceView: PropTypes.string,
  exp: PropTypes.number,
  newEventCount: PropTypes.number,
  newTxCount: PropTypes.number,
  newRacerCount: PropTypes.number
}

export default connect((state) => ({
  loadingWeb3: state.loadingWeb3,
  web3Error: state.web3Error,
  networkName: (!state.loadingWeb3 && !!state.network) ? state.network : '',
  networkSyncing: false,
  blockNumber: (!state.loadingWeb3 && !!state.block) ? state.block.number : undefined,
  loadingAccount: state.loadingAccount,
  account: state.account,
  accountView: state.accountView,
  accountError: state.accountError,
  balanceView: state.balanceView,
  exp: state.exp,
  newEventCount: state.newEventCount,
  newTxCount: state.newTxCount,
  newRacerCount: state.newRacerCount
}))(DappNavbar);