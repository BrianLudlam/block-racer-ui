import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import anime from 'animejs/lib/anime.es.js';
import { Col, Row, Button, Statistic, Modal } from 'antd';
import { laneSort, placeSort, settleRaceTx, laneFinishView, laneSettleView } from '../constants';
import { sendTx } from '../actions';

const LANES = [0,1,2,3,4,5];
const LANE_SPLITS = 32;

class RaceTrack extends PureComponent {

  state = {
    snapshot: []
  };
  isStopped = [true,true,true,true,true,true];
  isFinished = false;
  splitLanes = [];
  finishLanes = [];
  laneMotion = [];

  componentDidMount() {
    //console.log('RACETRACK: Mount racetrack...', this.props);
    this.initSnapshot();
  }

  componentWillUnmount() {
    this.stopMotion();
  }

  componentDidUpdate() {
    this.tryProgressRace();
  }

  initSnapshot = () => {
    const { raceStarted, dataExpired, startBlock, laneValues, raceDistance } = this.props;
    if (!raceStarted || dataExpired || !laneValues.L0['$'+startBlock]) return;
    //console.log('RACETRACK: initSnapshot...', this.props);

    let snapshot = [];
    let _split = 0;
    let _leg = 0;
    let _laneSet = false;
    let _laneSnapshot;
    for (let lane=0; lane<6; lane++) {
      _laneSnapshot = {
        lane, 
        leg: 0,
        split: 0,
        splits: 0, 
        speed: 0, 
        distance: 0, 
        percent: 0
      };
      _leg = 0;
      _laneSet = false;
      while (_laneSnapshot.distance < raceDistance && !_laneSet) {
        if (!!laneValues['L'+lane]['$'+(startBlock+_leg)]) {
          _split = 0;
          while (_split < LANE_SPLITS && _laneSnapshot.distance < raceDistance && !_laneSet) {
            _laneSnapshot.speed = laneValues['L'+lane]['$'+(startBlock+_leg)][_split];
            _laneSnapshot.distance += _laneSnapshot.speed;
            _laneSnapshot.leg = _leg;
            _laneSnapshot.split = _split;
            _laneSnapshot.splits = (_leg * 32) + _split + 1;
            if (_laneSnapshot.distance >= raceDistance) {
              _laneSnapshot.percent = 100;
              this.finishLanes.push(_laneSnapshot);
              snapshot.push(_laneSnapshot);
              _laneSet = true;
            }
            _split++;
          }
        } else {//not finished, set start percent
          _laneSnapshot.percent = (_laneSnapshot.distance === 0) ? 0 :
            ((_laneSnapshot.distance / raceDistance)*100).toFixed(2);
          snapshot.push(_laneSnapshot);
          _laneSet = true;
        }
        _leg++;
      }
    }

    if (this.finishLanes.length === 6) this.isFinished = true;

    snapshot.sort(laneSort);
    //console.log('Init snapshot: ', snapshot);
    this.setState({snapshot});
  }

  tryProgressRace = () => {
    const { raceStarted, dataExpired, startBlock, laneValues } = this.props;
    const { snapshot } = this.state;
    if (!raceStarted || dataExpired || !laneValues.L0['$'+startBlock]) return;
    //console.log('RACETRACK: tryProgressRace...', this.props);

    for (let _lane=0; _lane<6; _lane++) {
      if (this.isStopped[_lane] && (!snapshot.length || snapshot[_lane].percent < 100)) {
        if (!snapshot.length) {//no race progress yet
          this.isStopped[_lane] = false;
          //console.log('RACETRACK: playAnims starting lane '+_lane);
          this.animateLegSplit(_lane, 0, 0);
        } else if (snapshot[_lane].split < (LANE_SPLITS-1)) {
          this.isStopped[_lane] = false;
          //console.log('RACETRACK: playAnims next split lane '+_lane, snapshot);
          this.animateLegSplit(_lane, snapshot[_lane].leg, snapshot[_lane].split+1);
        } else if (!!laneValues['L'+_lane]['$'+(startBlock+(snapshot[_lane].leg+1))]) {
          this.isStopped[_lane] = false;
          //console.log('RACETRACK: playAnims next leg lane '+_lane, snapshot);
          this.animateLegSplit(_lane, snapshot[_lane].leg+1, 0);
        }
      }
    }
  }

  animateLegSplit = (lane, leg, split) => {
    const { startBlock, laneValues, raceDistance } = this.props;
    const { snapshot } = this.state;
    //console.log('RACETRACK: animating from', snapshot);

    const _speed = laneValues['L'+lane]['$'+(startBlock+leg)][split];
    const _distance = _speed + ((!snapshot.length) ? 0 : snapshot[lane].distance);
    const _percent = (_distance >= raceDistance) ?
      100 : ((_distance / raceDistance)*100).toFixed(4);
  
    this.laneMotion[lane] = anime({
      targets: ('.L'+lane),
      easing: 'linear', 
      width: _percent+'%',
      duration: 532,
      autoplay: true,
      complete: (anim) => this.registerSnapshot(
        lane, leg, split, _speed, _distance, _percent)
    });
  }

  registerSnapshot = (lane, leg, split, speed, distance, percent) => {
    
    this.isStopped[lane] = true;

    const _laneSnapshot = {
      lane, 
      leg,
      split,
      splits: (leg * 32) + split + 1, 
      speed,
      distance,
      percent
    };

    if (percent === 100) {
      //console.log('LANE FINISHED: '+_laneSnapshot);
      this.finishLanes.push(_laneSnapshot);
    } else this.splitLanes.push(_laneSnapshot);

    if (this.splitLanes.length + this.finishLanes.length === 6) {
      let snapshot = [...this.splitLanes, ...this.finishLanes];
      snapshot.sort(laneSort);

      if (this.finishLanes.length === 6) this.isFinished = true;

      //console.log('Registering snapshot: ', snapshot);
      this.setState({ snapshot });
      this.splitLanes = [];
    }
  } 

  stopMotion = () => {
    if (!!this.laneMotion) {
      for (let _lane=0; _lane<6; _lane++) {
        if (!!this.laneMotion[_lane]) {
          this.laneMotion[_lane].pause();
        }
      }
    }
  }

  replayRace = () => {
    this.stopMotion();
    this.isStopped = [true,true,true,true,true,true];
    this.splitLanes = [];
    this.finishLanes = [];
    this.laneMotion = [];
    this.setState({ snapshot: [] });
  }

  settleRace = () => {
    const { raceNumber, dispatch } = this.props;
    dispatch(sendTx(settleRaceTx(raceNumber)));
  }

  render() {
    const { raceNumber, raceDistance, conditionsView, racers, raceReady, 
      settleState, startBlock, raceLevel, settleBlock, latestBlock, lanesReady, 
      raceStarted, lanesSettled, raceSettled, raceExpired, myRacerNames, dataExpired,
      dispatch } = this.props;

    const { snapshot } = this.state;

    const racerLabels = racers.map((racer) => (
      '#'+racer.id+(
        (!!myRacerNames['$'+racer.id] && myRacerNames['$'+racer.id].length > 15) ? 
          ' "'+myRacerNames['$'+racer.id].substring(0,12)+'..."' : 
        (!!myRacerNames['$'+racer.id]) ? 
          ' "'+myRacerNames['$'+racer.id]+'"' : ''
      )
    ));

    const orderedSnapshot = (!snapshot.length) ? [] :
      [...snapshot].sort(placeSort);

      console.log('orderedSnapshot: ', orderedSnapshot)

    return (
    <div>
      <Row style={{ margin: "4px", paddingLeft:"4px" }}>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="Race Number" value={raceNumber} prefix="#" />
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
         <Statistic title="Status" value={
          (raceSettled && lanesSettled < 6) ? "Refunded" :
          (!raceSettled && raceExpired) ? "Expired" :
          (raceSettled) ? "Settled" :
          (lanesSettled > 0) ? "Settling "+lanesSettled+'/7' :
          (this.isFinished && settleBlock <= (latestBlock+1)) ? 
            'Settle' :
          (this.isFinished) ? 
            "Finished" :
          (raceStarted && snapshot.length === 6) ? "Racing!" :
          (raceStarted) ? "Started" :
          (lanesReady === 6) ? "Starting" :
          (lanesReady || 0)+"/6 Ready"
          } />
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="Start Block" value={startBlock} valueStyle={{color: "#001529"}}/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="Race Level" value={raceLevel} />
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="Race Distance" value={((raceDistance/100).toFixed(2))} suffix="m"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="Track Conditions" value={conditionsView} />
        </Col>
      </Row>

      {raceSettled && settleState.length === 6 && (
      <Row style={{ margin: "4px", paddingLeft:"4px" }}>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="1st Place" value={racers[settleState[0]-1].id} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="2nd Place" value={racers[settleState[1]-1].id} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="3rd Place" value={racers[settleState[2]-1].id} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="4th Place" value={racers[settleState[3]-1].id} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="5th Place" value={racers[settleState[4]-1].id} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="6th Place" value={racers[settleState[5]-1].id} prefix="#"/>
        </Col>
      </Row>)}
      
      {raceStarted && !raceSettled && (
      <Row style={{ margin: "4px", paddingLeft:"4px" }}>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="1st Place" value={((!orderedSnapshot[0]) ? 0 : 
            racers[orderedSnapshot[0].lane].id)} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="2nd Place" value={((!orderedSnapshot[1]) ? 0 : 
            racers[orderedSnapshot[1].lane].id)} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="3rd Place" value={((!orderedSnapshot[2]) ? 0 : 
            racers[orderedSnapshot[2].lane].id)} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="4th Place" value={((!orderedSnapshot[3]) ? 0 : 
            racers[orderedSnapshot[3].lane].id)} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="5th Place" value={((!orderedSnapshot[4]) ? 0 : 
            racers[orderedSnapshot[4].lane].id)} prefix="#"/>
        </Col>
        <Col xs={8} sm={6} md={4} lg={4} xl={4} xxl={4}>
          <Statistic title="6th Place" value={((!orderedSnapshot[5]) ? 0 : 
            racers[orderedSnapshot[5].lane].id)} prefix="#"/>
        </Col>
      </Row>)}
      
      {raceStarted && !dataExpired && this.finishLanes.length < 6 && (
      <Row style={{ margin: "4px", paddingLeft:"4px" }}>
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Statistic title="Race Block" value={((!snapshot[0]) ? 0 : startBlock + snapshot[0].leg)} />
        </Col>
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Statistic title="Race Block Split" value={((!snapshot[0]) ? 0 : snapshot[0].split + 1)} suffix=" of 32" />
        </Col>
      </Row>)}

      <Row style={{ margin: "4px", paddingLeft:"4px" }}>

        {this.isFinished && !raceSettled && !raceExpired && settleBlock <= (latestBlock+1) && (
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Statistic title="Race Expires in" value={255 - (latestBlock - startBlock)} suffix=" block(s)" />
        </Col>)}

        {(this.isFinished && !raceSettled && settleBlock <= (latestBlock+1)) ? (
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Button type="ghost" style={{margin: "6px", color:"#002950", backgroundColor: "#f0f2f5"}}
            onClick={() => Modal.confirm({
              centered: true,
              title: 'Settle Race?',
              content: <div><p>{'Each race requires 7 settlement transactions to finalize results. '+
                'One for each of 6 lanes, and one more to compare results and payout winners. '}</p>
                <p>{'Settlement Reward: 4 finney for the first successful settle tx, 5 finney for the last, and the '+
                'rest 3 finney. First come, first served. If race is already settled when '+
                'transaction goes through, contract will attempt to find another race to settle, '+
                'before failing.'}</p>
                <p>{'Provider (MetaMask) will follow to confirm transaction.'}</p></div>,
              okText: <span style={{color: "#002950"}}>Settle</span>,
              cancelText: <span style={{color: "#002950"}}>Cancel</span>,
              onOk() { dispatch(sendTx(settleRaceTx(raceNumber))); },
              onCancel() {},
            })}>
            Settle Race
          </Button>
        </Col>

        ) : (this.isFinished && !raceSettled && settleBlock > (latestBlock+1)) ? (
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Statistic title="Settle Race in" value={settleBlock - (latestBlock+1)} suffix=" block(s)" />
        </Col>

        ) : (raceReady && !raceStarted) ? (
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Statistic title="Race Starts in" value={startBlock - latestBlock} suffix=" block(s)" />
        </Col>

        ) : (<></>)}

        {!dataExpired && raceStarted && (
        <Col xs={8} sm={8} md={8} lg={6} xl={4} xxl={3}>
          <Button type="ghost" style={{margin: "6px", color:"#002950"}} 
            onClick={this.replayRace}>
            Replay Race
          </Button>
        </Col>)}

      </Row>

      {!dataExpired && (
      <div style={{ width: "100%", boxSizing: "border-box", border: "solid 8px #002950", borderRadius: "8px", 
        padding: "12px 16px 12px 16px", margin: "0px", color: "#eef2f5", backgroundColor: "#002950"}}>
        {LANES.map((lane) => (
          <Row key={lane}>
            <Col xs={3} sm={3} md={2} lg={2} xl={2} xxl={2}>
              <span style={{fontSize: "15px", color: "#ffc107"}}>{'Lane '+(lane+1)}</span>
            </Col>
            <Col xs={21} sm={21} md={22} lg={22} xl={22} xxl={22}>
              <svg width="100%" height="1.5em"><g>
                <rect width="100%" height="100%" fill="#eef2f5"/>
                <rect className={"L"+lane} height="100%" fill="#ffc107" 
                  width={(
                  (!snapshot[lane] || !snapshot[lane].percent) ? "0%" : 
                    snapshot[lane].percent+'%'
                  )}/>
                <text x="6" y="15" fontSize="13" fontWeight="bold" fill="#002950">{(
                  (!raceNumber || lanesReady <= lane) ? (
                    'Waiting for racer'
                  ) : (!raceStarted && lanesReady < 6) ? (
                    racerLabels[lane]+' - Ready'
                  ) : (!raceStarted || !snapshot[lane] || !snapshot[lane].distance) ? (
                    racerLabels[lane]+' - Starting Line'
                  ) : (!raceSettled && raceExpired) ? (
                    racerLabels[lane]+' - Race Expired - Settle to refund racer'
                  ) : (raceSettled && raceExpired && settleState.length < 6) ? (
                    racerLabels[lane]+' - Race Expired and Refunded' 
                  ) : (raceSettled && this.finishLanes.length === 6) ? (
                    racerLabels[lane]+' - Race Final - '+laneSettleView(lane, settleState)
                  ) : (snapshot[lane].percent === 100) ? (
                    racerLabels[lane]+' - Race Finished - '+laneFinishView(lane, orderedSnapshot)
                  ) : (
                    racerLabels[lane]+' - '+laneFinishView(lane, orderedSnapshot)/*' - '+((snapshot[lane].distance / 100).toFixed(2))+'m'+*/
                  )
                )}</text>
              </g></svg>
            </Col>
          </Row>
        ))}
      </div>)}
    </div>
    );
  }
}

RaceTrack.propTypes = {
  raceNumber: PropTypes.string, 
  racers: PropTypes.array, 
  myRacerNames: PropTypes.object, 
  raceDistance: PropTypes.number, 
  conditionsView: PropTypes.string, 
  startBlock: PropTypes.number, 
  raceLevel: PropTypes.number, 
  latestBlock: PropTypes.number, 
  lanesReady: PropTypes.number, 
  laneValues: PropTypes.object,
  raceReady: PropTypes.bool, 
  raceStarted: PropTypes.bool,
  lanesSettled: PropTypes.number,
  raceSettled: PropTypes.bool,
  raceExpired: PropTypes.bool,
  dataExpired: PropTypes.bool,
  settleBlock: PropTypes.number, 
  settleState: PropTypes.array
}

export default connect((state) => ({
  raceNumber: state.raceTrack.raceNumber, 
  racers: state.raceTrack.racers, 
  myRacerNames: state.raceTrack.myRacerNames, 
  raceDistance: state.raceTrack.raceDistance, 
  conditionsView: state.raceTrack.conditionsView, 
  startBlock: state.raceTrack.startBlock, 
  raceLevel: state.raceTrack.raceLevel, 
  latestBlock: state.raceTrack.latestBlock, 
  lanesReady: state.raceTrack.lanesReady, 
  laneValues: state.raceTrack.laneValues,
  raceReady: state.raceTrack.raceReady, 
  raceStarted: state.raceTrack.raceStarted,
  lanesSettled: state.raceTrack.lanesSettled,
  raceSettled: state.raceTrack.raceSettled,
  raceExpired: state.raceTrack.raceExpired,
  dataExpired: state.raceTrack.dataExpired, 
  settleBlock: state.raceTrack.settleBlock, 
  settleState: state.raceTrack.settleState
}))(RaceTrack); 