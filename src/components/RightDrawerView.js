import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Drawer, List, Select, Radio, Progress, Row, 
         Icon, Badge, Modal } from 'antd';
import { ADDRESS_ZERO, levelView, levelPercent, accelView, accelPercent, accelTrainable, 
         topView, topPercent, topTrainable, tractionTrainable, tractionView, tractionPercent, 
         avgSpeed, totalNewTraining, expLeft, expLeftView, expLeftPercent, trainRacerTx,
         enterRaceTx, exitRaceTx, spawnRacerTx, isTrainable, raceWagerView, racerLevel, 
         firstRewardView, secondRewardView, thirdRewardView, levelBeforeTraining
       } from '../constants';
import { uiRacerSelected, uiRaceSelected, uiChangeDrawerView, racerUpdated, sendTx, 
         uiToggleCreateModal } from '../actions';

class RightDrawerView extends PureComponent {

  render () {
    const { loadingAccount, mountingAccount, exp, txs, txLog, events, eventLog, racers, 
            racer, races, stats, uiSelectedRacer, uiRightDrawerOpen, uiRightDrawerView,
            uiSelectedRace, dispatch } = this.props;

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
                onOk() {
                  dispatch(sendTx(spawnRacerTx()));
                  //return;
                },
                onCancel() {},
              })}>
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
              onClick={() => Modal.confirm({
                centered: true,
                title: 'Train racer with '+totalNewTraining(racer["$"+uiSelectedRacer])+' exp (of '+exp+' exp)?',
                content: <div><p>{'Training Block Racers costs experience points (exp). Experience '+
                    'points are earned by racing Block Racers.'}</p>
                  <p>{'Provider (MetaMask) will follow to confirm transaction.'}</p></div>,
                okText: <span style={{color: "#002950"}}>Train</span>,
                cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                onOk() {
                  dispatch(sendTx(trainRacerTx(uiSelectedRacer, racer["$"+uiSelectedRacer].training)));
                },
                onCancel() {},
              })}>
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
              onClick={() => Modal.confirm({
                centered: true,
                title: 'Enter level '+((!racer["$"+uiSelectedRacer].level)?'0': racer["$"+uiSelectedRacer].level)+' race queue?',
                content: <div><p>{'Races start for every 6 racers queued at any specific level. '}</p>
                <p>{'Level '+((!racer["$"+uiSelectedRacer].level)?'0': racer["$"+uiSelectedRacer].level)+
                  ' Racing Fee: '+raceWagerView(racer["$"+uiSelectedRacer])+'. *payed-in-full to race winners.'}</p>
                <ul><li>{'First Place Reward: '+firstRewardView(racer["$"+uiSelectedRacer])}</li>
                <li>{'Second Place Reward: '+secondRewardView(racer["$"+uiSelectedRacer])}</li>
                <li>{'Third Place Reward: '+thirdRewardView(racer["$"+uiSelectedRacer])}</li></ul>
                <p>{'Settlement Fee: 4 finney. *payed-in-full to race settlers.'}</p>
                <p>{'Provider (MetaMask) will follow to confirm transaction.'}</p></div>,
                okText: <span style={{color: "#002950"}}>Race</span>,
                cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                onOk() {
                  dispatch(sendTx(enterRaceTx(uiSelectedRacer, racer["$"+uiSelectedRacer])));
                },
                onCancel() {},
              })}>
              Enter Race
            </Button>)}
            {racer["$"+uiSelectedRacer].state === 'QUEUEING' && (
            <Button type="ghost" style={{float: "right", marginTop: "-6px", marginBottom: "4px", color:"#002950", backgroundColor: "#f0f2f5"}}
              onClick={() => Modal.confirm({
                centered: true,
                title: 'Exit race queue?',
                content:  <div><p>{'Once queued for a race, you may exit the race queue '+
                'before the race starts, but not after. Once a race starts, '+
                'entry is final. If successful exit, transaction will refund Racing Fees'}</p>
                <p>{'Provider (MetaMask) will follow to confirm transaction.'}</p></div>,
                okText: <span style={{color: "#002950"}}>Exit</span>,
                cancelText: <span style={{color: "#002950"}}>Cancel</span>,
                onOk() {
                  dispatch(sendTx(exitRaceTx(uiSelectedRacer)));
                },
                onCancel() {},
              })}>
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
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Created '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
      </span></List.Item> : 
    (e.event === "Transfer" && e.returnValues.from === e.account) ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Traded '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
      </span></List.Item> : 
    (e.event === "Transfer") ? //to = user
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Aquired '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.tokenId}))}>
          {'Racer #'+e.returnValues.tokenId}
        </Button>
      </span></List.Item> : 
    (e.event === "Spawned" && e.returnValues.spawner === e.account && 
        e.returnValues.owner === e.account) ? 
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Spawned '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.entity}))}>
          {'Racer #'+e.returnValues.entity}
        </Button>
      </span></List.Item> : 
    (e.event === "Spawned" && e.returnValues.spawner === e.account) ? 
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Spawned Racer #'+e.returnValues.entity}
      </span></List.Item> : 
    (e.event === "Spawned") ? 
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'Someone Spawned '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.entity}))}>
          {'Racer #'+e.returnValues.entity}
        </Button>
      </span></List.Item> : 
    (e.event === "RaceEntered") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
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
      </span></List.Item> : 
    (e.event === "RaceExited") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
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
      </span></List.Item> : 
    (e.event === "RaceStarted") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
        {' Starting'}
      </span></List.Item> : 
    (e.event === "RaceFinished" && !e.returnValues.distance) ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
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
        <strong>{'['+e.blockNumber+']> '}</strong>
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRacerSelected({id: e.returnValues.racer}))}>
          {'Racer #'+e.returnValues.racer}
        </Button>
        {' finished #'+e.returnValues.place+' in '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
      </span></List.Item> : 
    (e.event === "LaneSettled") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Settled Lane '+e.returnValues.lane+' in '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
      </span></List.Item> : 
    (e.event === "RaceSettled") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
        {'You Settled '}
        <Button type="link" style={{padding: "0"}}
          onClick={() => dispatch(uiRaceSelected({id: e.returnValues.race}))}>
          {'Race #'+e.returnValues.race}
        </Button>
      </span></List.Item> : 
    (e.event === "RacerTrained") ?
      <List.Item><span>
        <strong>{'['+e.blockNumber+']> '}</strong>
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
  loadingAccount: PropTypes.bool,
  mountingAccount: PropTypes.bool,
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
  loadingAccount: state.loadingAccount,
  mountingAccount: state.mountingAccount,
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