import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Drawer, List, Select, Radio, Progress, Row, Col,
         Icon, Badge, Modal, notification } from 'antd';
import { ADDRESS_ZERO, levelView, levelPercent, accelView, accelPercent, accelTrainable, 
         topView, topPercent, topTrainable, tractionTrainable, tractionView, tractionPercent, 
         avgSpeed, totalNewTraining, expLeft, expLeftView, expLeftPercent, trainRacerTx,
         enterRaceTx, exitRaceTx, spawnRacerTx, isTrainable, raceWagerView, racerLevel, 
         firstRewardView, secondRewardView, thirdRewardView, levelBeforeTraining,
         racingFeeByLevel, raceCost } from '../constants';
import { uiRacerSelected, uiRaceSelected, uiChangeDrawerView, racerUpdated, sendTx, 
         uiToggleCreateModal } from '../actions';

notification.config({
  placement: 'bottomLeft',
  bottom: 50,
  duration: 4,
  style: {
    margin: 0,
    padding: 0,
    border: 0
  }
});

const notificationsOn = false;

class RightDrawerView extends PureComponent {

  eventsShown = {};

  componentDidUpdate(prevProps) {
    const { loadingAccount, mountingAccount, events, eventLog, block, dispatch } = this.props;

    if (notificationsOn && !loadingAccount && !mountingAccount && events !== prevProps.events ) {
      events.forEach((e) => {
        if(!this.eventsShown[e] && !!eventLog[e] && 
          block.number - eventLog[e].blockNumber < 12 ) {
          this.eventsShown[e] =  true;
          notification.open({
            message: eventLog[e].event+' Event',
            description: this.eventLogView(eventLog[e], dispatch),
            key: e
          });
        }
      })
    }
  }

  render () {
    const { entityC, blockRacerC, loadingAccount, mountingAccount, exp, txs, txLog, 
            account, events, eventLog, racers, racer, races, stats, uiSelectedRacer, 
            uiRightDrawerOpen, uiRightDrawerView, uiSelectedRace, dispatch } = this.props;

    return (
      <Drawer
        title={
          <Radio.Group buttonStyle="solid"
            value={uiRightDrawerView} 
            onChange={(e) => dispatch(uiChangeDrawerView({open: true, view: e.target.value}))}>
            <Radio.Button value="racers" style={uiRightDrawerView!=="racers"?{color: "#ffc107", backgroundColor: "#002950"}:{color: "#002950"}}>Racers</Radio.Button>
            <Radio.Button value="events" style={uiRightDrawerView!=="events"?{color: "#ffc107", backgroundColor: "#002950"}:{color: "#002950"}}>Events</Radio.Button>
            <Radio.Button value="txs" style={uiRightDrawerView!=="txs"?{color: "#ffc107", backgroundColor: "#002950"}:{color: "#002950"}}>Txs</Radio.Button>
          </Radio.Group>
        }
        placement="right"
        closable={true}
        maskClosable={true}
        onClose={() => dispatch(uiChangeDrawerView({open: false}))}
        visible={uiRightDrawerOpen}
        width={300}>

        {(uiRightDrawerView === 'events') ? (
          <Row style={{ marginTop: "-16px" }}>
          <List
            size="small"
            itemLayout="horizontal"
            dataSource={events || []}
            renderItem={(key) => this.eventLogView(eventLog[key], dispatch)}/>
          </Row>

        ) : (uiRightDrawerView === 'txs') ? (
          <Row style={{ marginTop: "-16px" }}>
          <List
            itemLayout="horizontal"
            dataSource={(txs || [])}
              //.filter((each) => !!txLog[each])
              //.sort((a,b)=>((txLog[b].timestamp < txLog[a].timestamp) ? -1 : 1))}
            renderItem={(key) => (
              <List.Item><span>
                <strong>{txLog[key].title+' Tx: '}</strong>
                <a href={"https://ropsten.etherscan.io/tx/"+key} target="_blank" rel="noopener noreferrer"> 
                  {key.substring(0,12)+'...'}
                </a>
                &nbsp;
                {((!txLog[key].status) ? <Badge status="error" text="FAILED"/> : 
                  (!!txLog[key].confirmCount && txLog[key].confirmCount === 12) ? 
                    <Badge status="success" text="VERIFIED"/>: (!!txLog[key].confirmCount) ? 
                      <Badge status="warning" text={'Confirmed '+txLog[key].confirmCount+' time(s)'}/> : 
                      <Badge status="processing" text="Pending"/>)}
              </span></List.Item>
            )}/>
          </Row>
        ) : (//racers
          <>
          <Row style={{ marginTop: "-6px" }}>
          <Select
            showSearch
            allowClear
            style={{ width: "180px", marginTop: "-12px", marginBottom: "4px" }}
            dropdownMatchSelectWidth={false}
            loading={loadingAccount || mountingAccount}
            placeholder={(loadingAccount || mountingAccount) ? "Loading racers" : "Select a racer ("+racers.length+")"}
            notFoundContent="No racers yet"
            optionFilterProp="children"
            value={uiSelectedRacer}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(id) => dispatch(uiRacerSelected({id}))}>
            {!!racers.length && racers.map((id) => (
              <Select.Option key={id} value={id}>
                {(!!racer["$"+id])? racer["$"+id].displayName: "Racer #"+id}
              </Select.Option>
            ))}
          </Select>
          <Button type="ghost" disabled={loadingAccount || mountingAccount}
            style={{float: "right", marginTop: "-6px", marginBottom: "4px", color:"#002950", backgroundColor: "#f0f2f5"}}
            onClick={() => dispatch(uiToggleCreateModal({open: true}))}>
            New
          </Button>
          </Row>

          {!!uiSelectedRacer && !!racer["$"+uiSelectedRacer] && ( 
          <>
          <Row size="small">
            <span style={{color: "#999"}}>ID:&nbsp;&nbsp;</span>
            {uiSelectedRacer}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span style={{color: "#999"}}>Name:&nbsp;&nbsp;</span>
            {racer["$"+uiSelectedRacer].name}
          </Row>
          {!!racer["$"+uiSelectedRacer].parentA && racer["$"+uiSelectedRacer].parentB && (
          <Row size="small">
            <span style={{color: "#999"}}>Parents:&nbsp;&nbsp;</span>
            <Button size="small" type="link" style={{paddingLeft: "4px"}}
              onClick={() => dispatch(uiRacerSelected({id: racer["$"+uiSelectedRacer].parentA}))}>
              {"Racer #"+racer["$"+uiSelectedRacer].parentA}
            </Button>
            <Button size="small" type="link" style={{paddingLeft: "4px"}}
              onClick={() => dispatch(uiRacerSelected({id: racer["$"+uiSelectedRacer].parentB}))}>
              {"Racer #"+racer["$"+uiSelectedRacer].parentB}
            </Button>
          </Row>)}
          <Row size="small">
            <span style={{color: "#999"}}>Created:&nbsp;&nbsp;</span>
            {(racer["$"+uiSelectedRacer].state === 'CREATING' || racer["$"+uiSelectedRacer].state === 'SPAWNING') ? 
              racer["$"+uiSelectedRacer].spawnView : (new Date(parseInt(racer["$"+uiSelectedRacer].born,10)*1000).toLocaleString())}
          </Row>
          {racer["$"+uiSelectedRacer].state === 'CREATING' && racer["$"+uiSelectedRacer].spawnReady === 0 && !!racer["$"+uiSelectedRacer].expireView && (
          <Row size="small">
            <span style={{color: "#999"}}>Expires in:&nbsp;&nbsp;</span>
            {racer["$"+uiSelectedRacer].expireView}
          </Row>)}
          {racer["$"+uiSelectedRacer].state === 'CREATING' && racer["$"+uiSelectedRacer].spawnReady <= 1 && (
          <Row size="small" type="flex" justify="center">
            <Button size="small" type="ghost" style={{float: "right", marginTop: "4px", marginBottom: "4px", color:"#002950"}}
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
                    ' a Block Racer with genes, it\'s unique skill potentials. Once created, a Block Racer must be Spawned with 256 blocks,'+
                    ' or it will expire, resulting in permanently zeroed genes.'+
                    ' Provider (MetaMask) will follow to confirm transaction.'}</Row>
                    <Row><strong>{"Reward: 4 finney"}</strong></Row>
                    <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row></Col>,
                  okText: <span style={{color: "#002950"}}>Spawn</span>,
                  cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                  onOk() {
                    dispatch(sendTx(spawnRacerTx()));
                  },
                  onCancel() {},
                });
              }}>
              Spawn Racer
            </Button>
          </Row>)}
          </>)}

          {!!uiSelectedRacer && !!racer["$"+uiSelectedRacer] && racer["$"+uiSelectedRacer].state !== 'CREATING' && (
          <>
          <Row size="small">
            <span style={{color: "#999"}}>Training:&nbsp;&nbsp;</span>
          </Row>
          <Row size="small" style={{width: "160px", whiteSpace: "nowrap"}}>
            <Progress size="large" strokeColor={(racerLevel(racer["$"+uiSelectedRacer]) > levelBeforeTraining(racer["$"+uiSelectedRacer])) ? "#52c41a" : "#005bb2"} style={{fontSize: "12px"}}
              status={(racerLevel(racer["$"+uiSelectedRacer]) > levelBeforeTraining(racer["$"+uiSelectedRacer])) ? "active" : "normal"}
              percent={levelPercent(racer["$"+uiSelectedRacer])} 
              format={() => (
                <span style={(racerLevel(racer["$"+uiSelectedRacer]) > levelBeforeTraining(racer["$"+uiSelectedRacer])) ? {color: "#52c41a"} : {}}>
                  {levelView(racer["$"+uiSelectedRacer])}
                </span>
              )}/>
          </Row>
          <Row size="small" style={{width: "160px", whiteSpace: "nowrap"}}> 
            {accelTrainable(racer["$"+uiSelectedRacer], exp) && 
            <Icon type="plus-circle" theme="filled" style={{color: "#52c41a", fontSize: "18px", paddingRight: "4px"}}
              disabled={racer["$"+uiSelectedRacer].state === "TRAINING"}
              onClick={
              () => dispatch(racerUpdated({ racer: {
                id: uiSelectedRacer,
                training: [
                  racer["$"+uiSelectedRacer].training[0]+1, 
                  racer["$"+uiSelectedRacer].training[1], 
                  racer["$"+uiSelectedRacer].training[2]
                ],
                state: "TRAIN"
              }}))}/>}
              <Progress size="large" strokeColor={(racer["$"+uiSelectedRacer].training[0] > 0) ? "#52c41a" : "#005bb2"} style={{fontSize: "12px"}}
                status={(racer["$"+uiSelectedRacer].training[0] > 0) ? "active" : "normal"}
                percent={accelPercent(racer["$"+uiSelectedRacer])} 
                format={() => (
                  <span style={(racer["$"+uiSelectedRacer].training[0] > 0) ? {color: "#52c41a"} : {}}>
                    {accelView(racer["$"+uiSelectedRacer])}
                  </span>
                )}/>
          </Row>
          <Row size="small" style={{width: "160px", whiteSpace: "nowrap"}}> 
            {topTrainable(racer["$"+uiSelectedRacer], exp) && 
            <Icon type="plus-circle" theme="filled" style={{color: "#52c41a", fontSize: "18px", paddingRight: "4px"}}
              disabled={racer["$"+uiSelectedRacer].state === "TRAINING"}
              onClick={
              () => dispatch(racerUpdated({ racer: {
                id: uiSelectedRacer,
                training: [
                  racer["$"+uiSelectedRacer].training[0], 
                  racer["$"+uiSelectedRacer].training[1]+1, 
                  racer["$"+uiSelectedRacer].training[2]
                ],
                state: "TRAIN"
              }}))}/>}
            <Progress size="large" strokeColor={(racer["$"+uiSelectedRacer].training[1] > 0) ? "#52c41a" : "#005bb2"} style={{fontSize: "12px"}}
              status={(racer["$"+uiSelectedRacer].training[1] > 0) ? "active" : "normal"}
              percent={topPercent(racer["$"+uiSelectedRacer])} 
              format={() => (
                <span style={(racer["$"+uiSelectedRacer].training[1] > 0) ? {color: "#52c41a"} : {}}>
                  {topView(racer["$"+uiSelectedRacer])}
                </span>
              )}/>
          </Row>
          <Row size="small" style={{width: "160px", whiteSpace: "nowrap"}}> 
            {tractionTrainable(racer["$"+uiSelectedRacer], exp) && 
            <Icon type="plus-circle" theme="filled" style={{color: "#52c41a", fontSize: "18px", paddingRight: "4px"}}
              disabled={racer["$"+uiSelectedRacer].state === "TRAINING"}
              onClick={
              () => dispatch(racerUpdated({ racer: {
                id: uiSelectedRacer,
                training: [
                  racer["$"+uiSelectedRacer].training[0], 
                  racer["$"+uiSelectedRacer].training[1], 
                  racer["$"+uiSelectedRacer].training[2]+1
                ],
                state: "TRAIN"
              }}))}/>}
            <Progress size="large" strokeColor={(racer["$"+uiSelectedRacer].training[2] > 0) ? "#52c41a" : "#005bb2"} style={{fontSize: "12px"}}
              status={(racer["$"+uiSelectedRacer].training[2] > 0) ? "active" : "normal"}
              percent={tractionPercent(racer["$"+uiSelectedRacer])} 
              format={() => (
                <span style={(racer["$"+uiSelectedRacer].training[2] > 0) ? {color: "#52c41a"} : {}}>
                  {tractionView(racer["$"+uiSelectedRacer])}
                </span>
              )}/>
          </Row>
          {isTrainable(racer["$"+uiSelectedRacer], exp) && !!expLeft(racer["$"+uiSelectedRacer], exp) && (
          <Row size="small" style={{width: "160px", whiteSpace: "nowrap"}}>
            <Progress size="large" strokeColor="#52c41a" style={{fontSize: "12px"}}
              status="active"
              percent={expLeftPercent(racer["$"+uiSelectedRacer], exp)} 
              format={() => (
                <span style={{color: "#52c41a"}}>
                  {expLeftView(racer["$"+uiSelectedRacer], exp)}
                </span>
              )}/>
          </Row>)}
          {racer["$"+uiSelectedRacer].state === "TRAIN" && !!totalNewTraining(racer["$"+uiSelectedRacer]) && (
          <Row size="small">
            <Button size="small" type="ghost" style={{marginTop: "8px", marginBottom: "4px", marginLeft: "20px", color:"#002950"}}
              onClick={async () => {
                let gas = '';
                try {
                  gas = await blockRacerC.methods.train(
                    uiSelectedRacer, racer["$"+uiSelectedRacer].training
                  ).estimateGas({from: account});
                } catch (e) { gas = 'TX MAY FAIL'; }
                Modal.confirm({
                  centered: true,
                  title: 'Train Block Racer with '+totalNewTraining(racer["$"+uiSelectedRacer])+' exp (of '+exp+' exp)?',
                  content: 
                    <Col><Row>{"Training Block Racers costs experience points. "+
                    "Experience points are earned by racing Block Racers. "+
                    "Provider (MetaMask) will follow to confirm transaction."}</Row>
                    <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row></Col>,
                  okText: <span style={{color: "#002950"}}>Train</span>,
                  cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                  onOk() {
                    dispatch(sendTx(trainRacerTx(uiSelectedRacer, racer["$"+uiSelectedRacer].training)));
                  },
                  onCancel() {},
                });
              }}>
              Train Racer
            </Button>
            <Button size="small" type="ghost" style={{marginTop: "8px", marginBottom: "4px",marginLeft: "20px", color:"#002950"}}
              onClick={() => dispatch(racerUpdated({ racer: {
                id: uiSelectedRacer,
                training: [0,0,0],
                state: "IDLE"
              }}))}>
              Clear Training
            </Button>
          </Row>)}
          {!!stats["$"+uiSelectedRacer] && (
          <Row size="small" style={{paddingTop: "0px"}}>
            <span style={{color: "#999"}}>Avg Speed:&nbsp;&nbsp;</span>
            {avgSpeed(stats["$"+uiSelectedRacer])}
          </Row>)}
          <Row size="small" style={{paddingTop: "0px"}}>
            <span style={{color: "#999"}}>Total Races:&nbsp;&nbsp;</span>
            {((!races["$"+uiSelectedRacer] || !races["$"+uiSelectedRacer].length) ? 0 :
              races["$"+uiSelectedRacer].length)}
          </Row>
          {!!stats["$"+uiSelectedRacer] && !!stats["$"+uiSelectedRacer].finishes.length && (
          <Row size="small" style={{paddingTop: "2px"}}>
            <span style={{color: "#999"}}>Finishes:&nbsp;&nbsp;</span>
            {stats["$"+uiSelectedRacer].finishes.map((place, index) => (
              (place > 0 && index > 0) ? 
              <Badge key={index} count={place} style={{ backgroundColor: '#005bb2' }} overflowCount={999}>
              <span style={(index === 1)? {paddingLeft: "14px", paddingRight: "9px"} : {paddingLeft: "22px", paddingRight: "9px"}}>{
                (index === 1)? '1st': (index === 2)? '2nd': 
                (index === 3)? '3rd': (index === 4)? '4th': (index === 5)? '5th': '6th'
              }</span></Badge> : ''
            ))}
          </Row>)}
          {!!racer["$"+uiSelectedRacer].lastRace && (racer["$"+uiSelectedRacer].state === "QUEUEING" || racer["$"+uiSelectedRacer].state === "RACING") && (
          <Row size="small">
            <span style={{color: "#999"}}>Current Race:&nbsp;&nbsp;</span>
            <Button size="small" type="link" style={{paddingLeft: "4px"}}
              onClick={() => dispatch(uiRaceSelected({id: racer["$"+uiSelectedRacer].lastRace}))}>
              {"Race #"+racer["$"+uiSelectedRacer].lastRace}
            </Button>
          </Row>)}
          
          <Row size="small" style={{paddingTop: "8px"}}>
            <Select
              showSearch
              allowClear
              style={{ width: "140px", marginTop: "-12px"}}
              dropdownMatchSelectWidth={false}
              loading={loadingAccount || mountingAccount}
              placeholder={(loadingAccount || mountingAccount) ? "Loading races" : 
                "Races ("+((!!races["$"+uiSelectedRacer])? races["$"+uiSelectedRacer].length : 0)+")"}
              notFoundContent="No races yet"
              optionFilterProp="children"
              value={(!!races["$"+uiSelectedRacer] && races["$"+uiSelectedRacer].includes(uiSelectedRace)) ? 
                uiSelectedRace : undefined}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(id) => dispatch(uiRaceSelected({id}))}>
              {!!races["$"+uiSelectedRacer] && !!races["$"+uiSelectedRacer].length && races["$"+uiSelectedRacer].map((id) => (
                <Select.Option key={id} value={id}>
                  {"Race #"+id}
                </Select.Option>
              ))}
            </Select>
            {racer["$"+uiSelectedRacer].state === 'IDLE' && (
            <Button type="ghost" style={{float: "right", marginTop: "-6px", marginBottom: "4px", color:"#002950", backgroundColor: "#f0f2f5"}}
              onClick={async () => {
                let gas = '';
                try {
                  gas = await blockRacerC.methods.enterRaceQueue(
                    uiSelectedRacer
                  ).estimateGas({from: account, value: raceCost(racer["$"+uiSelectedRacer])});
                } catch (e) { gas = 'TX MAY FAIL'; }
                Modal.confirm({
                  centered: true,
                  title: 'Enter Level '+((!racer["$"+uiSelectedRacer].level)?'0': racer["$"+uiSelectedRacer].level)+' Race Queue?',
                  content: 
                    <Col><Row>{'Races start on every 6 racers at any specific level in the rcace queue. Provider (MetaMask) will follow to confirm transaction.'}</Row>
                    <Row><strong>{'Level '+((!racer["$"+uiSelectedRacer].level)?'0': racer["$"+uiSelectedRacer].level)+
                    ' Racing Fee: '+raceWagerView(racer["$"+uiSelectedRacer])}</strong></Row>
                    <Row><strong><ul><li>{'First Place Reward: '+firstRewardView(racer["$"+uiSelectedRacer].level)}</li>
                      <li>{'Second Place Reward: '+secondRewardView(racer["$"+uiSelectedRacer].level)}</li>
                      <li>{'Third Place Reward: '+thirdRewardView(racer["$"+uiSelectedRacer].level)}</li></ul></strong></Row>
                    <Row><strong>{'Settlement Fee: 4 finney. *settler rewards'}</strong></Row>
                    <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row></Col>,
                  okText: <span style={{color: "#002950"}}>Race</span>,
                  cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                  onOk() {
                    dispatch(sendTx(enterRaceTx(uiSelectedRacer, racer["$"+uiSelectedRacer])));
                  },
                  onCancel() {},
                });
              }}>
              Enter Race
            </Button>)}
            {racer["$"+uiSelectedRacer].state === 'QUEUEING' && (
            <Button type="ghost" style={{float: "right", marginTop: "-6px", marginBottom: "4px", color:"#002950", backgroundColor: "#f0f2f5"}}
              onClick={async () => {
                let gas = '';
                try {
                  gas = await blockRacerC.methods.exitRaceQueue(
                    uiSelectedRacer
                  ).estimateGas({from: account});
                } catch (e) { gas = 'TX MAY FAIL'; }
                Modal.confirm({
                  centered: true,
                  title: 'Exit Race Queue?',
                  content:  <Col><Row>{'Once queued for a race, you may exit the race queue '+
                  'before the race starts, but not after. Once a race starts, '+
                  'entry is final. If successful exit, transaction will refund Racing Fees. '+
                  'Provider (MetaMask) will follow to confirm transaction.'}</Row>
                  <Row><strong>{"Est gas: "+gas+" gwei"}</strong></Row></Col>,
                  okText: <span style={{color: "#002950"}}>Exit</span>,
                  cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                  onOk() {
                    dispatch(sendTx(exitRaceTx(uiSelectedRacer)));
                  },
                  onCancel() {},
                });
              }}>
              Exit Race
            </Button>)}
          </Row>
          </>)}
        </>)}
      </Drawer>
    );
  }

  eventLogView = (e, dispatch) => (
    (!e) ? '' : 
    (e.event === "Transfer" && e.returnValues.from === ADDRESS_ZERO) ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Created '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
        {' (Fee: 4 finney)'}
      </span></List.Item> : 
    (e.event === "Transfer" && e.returnValues.from === e.account) ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Traded '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
      </span></List.Item> : 
    (e.event === "Transfer") ? //to = user
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Aquired '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
      </span></List.Item> : 
    (e.event === "Spawned" && e.returnValues.spawner === e.account && 
        e.returnValues.owner === e.account) ? 
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Spawned '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.entity}))}>
          {'Racer #'+e.returnValues.entity}
        </Button>
        {' (Reward: 4 finney)'}
      </span></List.Item> : 
    (e.event === "Spawned" && e.returnValues.spawner === e.account) ? 
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Spawned Racer #'+e.returnValues.entity+' (Reward: 4 finney)'}
      </span></List.Item> : 
    (e.event === "Spawned") ? 
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'Someone Spawned '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.entity}))}>
          {'Racer #'+e.returnValues.entity}
        </Button>
      </span></List.Item> : 
    (e.event === "RaceEntered") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Entered '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
        {' in '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {' (Fee: '+(racingFeeByLevel(e.returnValues.level) + 4)+' finney)'}
      </span></List.Item> : 
    (e.event === "RaceExited") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Exited '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
         {' from '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {' (Refund: '+(racingFeeByLevel(e.returnValues.level) + 4)+' finney)'}
      </span></List.Item> : 
    (e.event === "RaceStarted") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {' Race #'+e.returnValues.race+' (level '+e.returnValues.level+')'}
        </Button>
        {' Starting'}
      </span></List.Item> : 
    (e.event === "RaceFinished" && !e.returnValues.distance) ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {' expired with '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
      </span></List.Item> : 
    (e.event === "RaceFinished") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
        {' Finished '+e.returnValues.place+(
          (e.returnValues.place === 1) ? 'st Place in ' : 
          (e.returnValues.place === 2) ? 'nd Place in ' : 
          (e.returnValues.place === 3) ? 'rd Place in ' : 'th Place in '
        )}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        { (e.returnValues.place === 1) ? 
          ' winning '+firstRewardView(e.returnValues.level)+'!' : 
          (e.returnValues.place === 2) ? 
          ' winning '+secondRewardView(e.returnValues.level)+'!' : 
          (e.returnValues.place === 3) ? 
          ' winning '+thirdRewardView(e.returnValues.level)+'!' : ''
        }
        {' Experience +'+e.returnValues.exp}
      </span></List.Item> : 
    (e.event === "LaneSettled") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Settled Lane '+e.returnValues.lane+' in '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {(e.returnValues.lane === 1) ? ' (Reward: 4 finney)' : ' (Reward: 3 finney)'}
      </span></List.Item> : 
    (e.event === "RaceSettled") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Settled '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {' (Reward: 5 finney)'}
      </span></List.Item> : 
    (e.event === "RacerTrained") ?
      <List.Item><span>
        <strong>{(new Date(e.returnValues.timestamp*1000).toLocaleString())}</strong>
        <br/>
        {'You Trained '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
        {' - '+e.returnValues.acceleration+'/'+e.returnValues.topSpeed+'/'+e.returnValues.traction}
      </span></List.Item> : ''
  );

}

RightDrawerView.propTypes = {
  entityC: PropTypes.object,
  blockRacerC: PropTypes.object,
  loadingAccount: PropTypes.bool,
  mountingAccount: PropTypes.bool,
  account: PropTypes.string,
  block: PropTypes.object,
  exp: PropTypes.number,
  txs: PropTypes.array,
  txLog: PropTypes.object,
  events: PropTypes.array,
  eventLog: PropTypes.object,
  racers: PropTypes.array,
  racer: PropTypes.object,
  races: PropTypes.object,
  stats: PropTypes.object,
  uiSelectedRacer: PropTypes.string,
  uiSelectedRace: PropTypes.string,
  uiRightDrawerOpen: PropTypes.bool,
  uiRightDrawerView: PropTypes.string
}

export default connect((state) => ({
  entityC: state.entityC,
  blockRacerC: state.blockRacerC,
  loadingAccount: state.loadingAccount,
  mountingAccount: state.mountingAccount,
  account: state.account,
  block: state.block,
  exp: state.exp,
  txs: state.txs,
  txLog: state.txLog,
  events: state.events,
  eventLog: state.eventLog,
  racers: state.racers,
  racer: state.racer,
  races: state.races,
  stats: state.stats,
  uiSelectedRacer: state.uiSelectedRacer,
  uiSelectedRace: state.uiSelectedRace,
  uiRightDrawerOpen: state.uiRightDrawerOpen,
  uiRightDrawerView: state.uiRightDrawerView
}))(RightDrawerView); 