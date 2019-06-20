import { call, fork, put, select, take, takeLatest, takeEvery/*, cancel, cancelled*/ } from 'redux-saga/effects';
//import { eventChannel, buffers, END } from 'redux-saga';
import { LOAD_WEB3, LOAD_WEB3_SUCCESS, NETWORK_CHANGE, ACCOUNT_CHANGE, ACCOUNT_CHANGED, SEND_TX,
         Entity, EntityAddress, BlockRacer, BlockRacerAddress, racerLevel, mapEventToState, 
         createBlockUpdateChannel, createAccountChangeChannel, UI_RACE_SELECTED,//createEventListenerChannel,
         createTransactionChannel, mapRacerSpawnState, loadAccountState,
         saveAccountState, initAccountState, processLaneValues, conditionsView,
         getPastEvents, accountTopic, saveBlockhash, loadBlockhash, BLOCK_UPDATE } from './constants';
import { web3Loaded, web3Error, accountChange, accountChanged,
         blockUpdate, accountMounted, racerUpdated, contractEvent, txUpdate, raceLoaded,
         raceUpdated, recentRacesUpdated } from './actions';

function* mountNetwork() {
  const { web3 } = yield select();
  const init = {
    web3,
    network: '',
    block: undefined,
    account: '',
    accountView: '',
    balance: '',
    entityC: undefined,
    blockRacerC: undefined,
    exp: '',
    spawnCount: 0,
    settleCount: 0
  };
  if(!init.web3){
    init.web3 = yield* mountWeb3();
  }
  if(!init.web3){
    //yield put(web3Loaded(init));
    return;
  }
  init.entityC = new init.web3.eth.Contract(Entity.abi, EntityAddress);
  init.blockRacerC = new init.web3.eth.Contract(BlockRacer.abi, BlockRacerAddress);
  const getNetwork = async (web3) => await web3.eth.net.getNetworkType();
  init.network = yield call(getNetwork, init.web3);
  init.block = yield call(init.web3.eth.getBlock, 'latest');

  const accounts = yield call(init.web3.eth.getAccounts);
  if (!!accounts && !!accounts[0]){
    init.account = accounts[0].toString();
    init.accountView = init.account.substr(0,7)+'...'+ init.account.substr(
      init.account.length-5, init.account.length);
    const balanceWei = yield call(init.web3.eth.getBalance, init.account);
    init.balance = init.web3.utils.fromWei(balanceWei, 'ether');
    if (!!init.blockRacerC){
      const experienceOf = yield call(init.blockRacerC.methods.experienceOf, init.account);
      const exp = yield call(experienceOf.call, {from: init.account});
      init.exp = (!exp) ? 0 : parseInt(exp,10);
    }
    const spawnCountMethod = yield call(init.entityC.methods.spawnCount);
    init.spawnCount = yield call(spawnCountMethod.call, {from: init.account});
    init.spawnCount = (!init.spawnCount) ? 0 : parseInt(init.spawnCount,10);
    //const settleCountMethod = yield call(init.blockRacerC.methods.numSettling);
    //init.settleCount = yield call(settleCountMethod.call, {from: init.account});
    //init.settleCount = (!init.settleCount) ? 0 : parseInt(init.settleCount,10);
  }
  yield fork(initRecentRaces, init.blockRacerC, init.block.number, 15000);

  yield put(web3Loaded(init));
  yield fork(watchForAccountChanges);
  yield fork(watchForBlockUpdates, init.web3);
}

function* mountWeb3() {
  let web3;
  const Web3 = require('web3');
  if (typeof window.ethereum !== 'undefined') {
    try {// Requesting account access
      yield call(window.ethereum.enable);
      web3 = new Web3(window.ethereum, null, {
        transactionConfirmationBlocks: 12,
        transactionBlockTimeout: 36
      });
      return web3;
    } catch (e) {// User denied account access
      yield put(web3Error({error: 'Web3 User denied account access.'}));
    }
  } else if (typeof window.web3 !== 'undefined') {// Legacy dapp browsers...
    web3 = new Web3(window.web3.currentProvider, null, {
      transactionConfirmationBlocks: 12,
      transactionBlockTimeout: 36
    });
  } else {
    yield put(web3Error({error: 'Metamask/Web3 Provider not found.'}));
  }
  return web3;  
}

function* watchForBlockUpdates(web3) {
  const blockUpdateChannel = yield call(createBlockUpdateChannel, web3);
  try {
    while (true) {
      const { block } = yield take(blockUpdateChannel);
      if (!!block) {
        const { account, loadingAccount, mountingAccount } = yield select();
        if (!!account && !loadingAccount) {
          if (!mountingAccount) {
            const { lastBlock, txs, txLog, events, eventLog, racer, racers, 
                  races, stats } = yield select();
            yield fork(saveAccountState, account, { 
              lastBlock, txs, txLog, events, eventLog, racer, racers, races, stats 
            });
          }
          const { balance, exp } = yield* updateAccount(account);
          const { spawnCount, settleCount } = yield* updateCounts();
          yield put(blockUpdate({block, balance, exp, spawnCount, settleCount}));
          //yield fork(saveBlockhash, block.number, block.hash);
        }
      }
    }
  } finally {
    blockUpdateChannel.close();
  }
}

function* initRecentRaces(blockRacerC, blockNumber, blockCount) {
  let recentRaces = yield call(getPastEvents, blockRacerC, 'RaceStarted', {
    fromBlock: ((blockNumber > blockCount) ? blockNumber - blockCount : 0),
    toBlock: blockNumber
  }); 
  if (!recentRaces) recentRaces = [];
  recentRaces = recentRaces.map((e) => ({
    id: e.returnValues.race.toString(),
    distance: parseInt(e.returnValues.distance,10),
    conditions: parseInt(e.returnValues.conditions,10),
    timestamp: parseInt(e.returnValues.timestamp,10)
  }));
  recentRaces.sort((a,b) => b.timestamp - a.timestamp);
  yield put(recentRacesUpdated({recentRaces}));
}

function* updateRecentRaces() {
  try {
    const { block, blockRacerC } = yield select();
    const _recentRaces = yield call(getPastEvents, blockRacerC, 'RaceStarted', {
      fromBlock: block.number,
      toBlock: block.number
    }); 
    if (!!_recentRaces && !!_recentRaces.length) {
      let recentRaces = _recentRaces.map((e) => ({
        id: e.returnValues.race.toString(),
        distance: parseInt(e.returnValues.distance,10),
        conditions: parseInt(e.returnValues.conditions,10),
        timestamp: parseInt(e.returnValues.timestamp,10)
      }));
      recentRaces.sort((a,b) => b.timestamp - a.timestamp);
      yield put(recentRacesUpdated({recentRaces}));
    }
  } catch (e) { console.log('Internal RPC Error caught: ',e); }
}

function* updateContractEvents() {
  const { block, eventLog, loadingAccount, mountingAccount } = yield select();
  if (!loadingAccount || !mountingAccount) {
    const newEvents = yield* getNewEvents(block.number, block.number, eventLog);
    if (!!newEvents && !!newEvents.length) {
      for (let i=0; i<newEvents.length; i++) {
        const event = newEvents[i]; 
        yield put(contractEvent({event}));
        yield fork(updateForEvent, event);
      }
    }
  }
}

function* getNewEvents(fromBlock, toBlock, eventLog) {
  const { web3, account, entityC, blockRacerC } = yield select();
  if (!web3 || !account || !entityC || !blockRacerC) return;

  let newEvents = [];
  const addEvent = (e) => {
    if (!e || !e.id) return;
    if (!eventLog[e.id] || (e.removed && !!eventLog[e.id])) {
      //delay removing removed events until after state mapping, which is delayed for ordered events
      newEvents.push(e);
    }
  }

  const topic = web3.eth.abi.encodeParameter('address', account);
  let pastEvents = yield call(getPastEvents, entityC, 'allEvents', {
    topics: accountTopic(1, topic),//transfer-from, nameChange,and spawned
    fromBlock, 
    toBlock
  }); 
  pastEvents.forEach(addEvent);

  pastEvents = yield call(getPastEvents, entityC, 'allEvents', {
    topics: accountTopic(2, topic),//transfer-to, spawner
    fromBlock, 
    toBlock
  }); 
  pastEvents.forEach(addEvent);

  pastEvents = yield call(getPastEvents, blockRacerC, 'allEvents', {
    topics: accountTopic(1, topic),
    fromBlock, 
    toBlock
  }); 
  pastEvents.forEach(addEvent);

  //process new events in order they occured
  newEvents.sort((a,b) => ((a.blockNumber === b.blockNumber) ?
    a.transactionIndex - b.transactionIndex : a.blockNumber - b.blockNumber));
  
  return newEvents;
}

function* mountAccount() {
  const { web3, block, account } = yield select();
  if (!web3 || !account) return;
  const prevState = loadAccountState(account);
  //console.log('loading prevState: ', prevState);
  let state = (!prevState) ? {...initAccountState, account} : {...prevState, account};
  
  //start from 12 blocks before last to recover from any reorg changes
  const fromBlock = (state.lastBlock > 12) ? state.lastBlock - 12 : 0;
  const toBlock = block.number;

  let newEvents = yield* getNewEvents(fromBlock, toBlock, state.eventLog);
  newEvents.forEach((e) => mapEventToState(e, state));

  state.lastBlock = toBlock;

  //block updates are blocked while mounting, and possible to miss block update, so catch up
  let caughtUp = false;
  while (!caughtUp) {
    const _block = yield call(web3.eth.getBlock, 'latest');
    if (state.lastBlock === _block.number) caughtUp = true;
    else {
      //console.log('catching up with block: ', _block.number);
      newEvents = yield* getNewEvents(state.lastBlock+1, _block.number, state.eventLog);
      newEvents.forEach((e) => mapEventToState(e, state));
      state.lastBlock = _block.number;
    }
  }

  yield put(accountMounted(state));

  //TODO better scaling - convert to on demand loading per racer selected
  for(let i=0; i<state.racers.length; i++) {
    yield fork(updateRacer, state.racers[i]);
  }

}
/*
const createEventListenerChannel = (contract, topics) => eventChannel(emitter => {
  const eventSub = contract.events.RaceEntered({
    topics,
    fromBlock: 'latest'
  });
  const onEvent = (e) => { console.log('EVENT---------EVENT', e); emitter(e); }
  eventSub.on("data", onEvent);
  eventSub.on("changed", onEvent);
  return () => {}
}, buffers.sliding(2));

function* watchForContractEvents(contract, topics) {
  //const eventListenerChannel = yield call(createEventListenerChannel, contract, topics);
  

  const eventListenerChannel = yield call(createEventListenerChannel, contract, topics);

  try {
    while (true) {
      const event = yield take(eventListenerChannel);
      const { eventLog } = yield select();
      if (!!event && (!event.removed && !eventLog[event.id] || event.removed && !!eventLog[event.id])) {
        yield put(contractEvent({event}));
        yield* updateForEvent(event);
      } 
    }
  } finally {
    eventListenerChannel.close();
  }
}
*/
function* updateForEvent(e) {
  const { account } = yield select();
  let racer = 
    (e.event === 'Transfer' && ((!e.removed && e.returnValues.to === account) ||
      (e.removed && e.returnValues.from === account))) ? e.returnValues.tokenId.toString() :
    (e.event === 'Spawned') ? e.returnValues.entity.toString() : 
    (e.event === 'RaceEntered' || e.event === 'RaceExited' || 
      e.event === 'RaceFinished' || e.event === 'RacerTrained') ? e.returnValues.racer.toString() :
    null;
  if (!!racer) yield fork(updateRacer, racer);
}

function* watchForAccountChanges() {
  const accountChangeChannel = yield call(createAccountChangeChannel);
  try {
    while (true) {
      yield take(accountChangeChannel);
      yield put(accountChange());
    }
  } finally {
    accountChangeChannel.close();
  }
}

function* changeAccount() {
  const { web3 } = yield select();
  if(!!web3) {
    const accounts = yield call(web3.eth.getAccounts);
    if (!!accounts && !!accounts[0]){
      const account = accounts[0].toString();
      const accountView = account.substr(0,7)+'...'+ account.substr(account.length-5, account.length);
      const { balance, exp } = yield* updateAccount(account);
      yield put(accountChanged({account, accountView, balance, exp}));
    }
  }
}

function* updateAccount(account) {
  const { web3, blockRacerC } = yield select();
  const balanceWei = yield call(web3.eth.getBalance, account);
  const balance = web3.utils.fromWei(balanceWei, 'ether');
  let experienceOf = yield call(blockRacerC.methods.experienceOf, account);
  let exp = yield call(experienceOf.call, {from: account});
  exp = (!exp) ? 0 : parseInt(exp,10);
  return { balance, exp };
}

function* updateCounts() {
  const { account, entityC, blockRacerC } = yield select();
  const spawnCountMethod = yield call(entityC.methods.spawnCount);
  let spawnCount = yield call(spawnCountMethod.call, {from: account});
  spawnCount = (!spawnCount) ? 0 : parseInt(spawnCount,10);
  const settleCountMethod = yield call(blockRacerC.methods.numSettling);
  let settleCount = yield call(settleCountMethod.call, {from: account});
  settleCount = (!settleCount) ? 0 : parseInt(settleCount,10);
  //const queueCountMethod = yield call(blockRacerC.methods.getRaceQueue, level);
  //let queueCount = yield call(queueCountMethod.call, {from: account});
  //queueCount = (!queueCount) ? 0 : parseInt(queueCount,10);
  return { spawnCount, settleCount };
}

function* updateRacer(id) {
  const { account, block, entityC, blockRacerC, racer } = yield select();

  let _racer = {...(racer['$'+id] || {})};
  _racer.training = [0,0,0]; 
  if (!!_racer && (_racer.state === "TRAINING" || _racer.state === "TRAIN" )) {
    _racer.state = "IDLE";
  }

  if (!_racer.genes || _racer.genes[0] === 0) {
    const getEntity = yield call(entityC.methods.getEntity, id);
    const entity = yield call(getEntity.call, {from: account});

    const name = entity.name.toString().replace(/[^A-Za-z0-9\s$%&*!@-_().]/ig, "");
    _racer.id = id;
    _racer.name = name;
    _racer.displayName = 'Racer #'+id+((!!name) ? ' "'+name+'"' : '');
    _racer.born = parseInt(entity.born,10);
    _racer.parentA = (entity.parentA.toString() === "0") ? null : entity.parentA.toString();
    _racer.parentB = (entity.parentB.toString() === "0") ? null : entity.parentB.toString();
    _racer.genes = entity.genes;
  }

  if (!!_racer.born && (!_racer.state || _racer.state === "CREATING" || _racer.state === "SPAWNING")) {
    mapRacerSpawnState(_racer, block.number);
  } else {
    const getRacer = yield call(blockRacerC.methods.getRacer, id);
    const racerRaw = yield call(getRacer.call, {from: account});
    _racer.lastRace = (racerRaw.lastRace.toString() === "0") ? "" : racerRaw.lastRace.toString();
    _racer.accel = parseInt(racerRaw.accel,10);
    _racer.top = parseInt(racerRaw.top,10);
    _racer.traction = parseInt(racerRaw.traction,10);
    _racer.level = racerLevel(_racer);
  }

  if (!!_racer.lastRace) {
    const getRace = yield call(blockRacerC.methods.getRace, _racer.lastRace);
    const _race = yield call(getRace.call, {from: account});
    _racer.state = (parseInt(_race.lanesReady,10) < 6) ? 'QUEUEING' : 
      (!_race.settled) ? 'RACING' : 'IDLE';
  } else if (_racer.state === "RACING" || _racer.state === "QUEUEING") {
    _racer.state = 'IDLE';
  }

  yield put(racerUpdated({racer: _racer}));
}

function* watchTransaction({contract, method, args, params}) {
  const { entityC, blockRacerC } = yield select();
  let tx;
  let _contract = (contract === 'entityC') ? entityC : blockRacerC;
  if (!!args && !!args.length) {
    tx = yield call(_contract.methods[method], ...args);
  }else {
    tx = yield call(_contract.methods[method]);
  }
  const { account } = yield select();
  const _params = {...params, from: account};
  const transactionChannel = yield call(createTransactionChannel, tx, _params);
  try {
    while (true) {
      const tx = yield take(transactionChannel);
      //console.log('Incoming tx: ', tx)
      const { account } = yield select();
      if (_params.from !== account) break;//defensive for account changes during tx lifetime
      tx.title = method;
      tx.args = args;
      yield put(txUpdate({tx}));
    }
  } finally {
    transactionChannel.close();
  }
}


function* mountRace() {
  const { web3, account, block, blockRacerC, uiSelectedRace } = yield select();

  const raceTrack = { 
    raceNumber: uiSelectedRace,
    racers: [],
    laneValues: {
      L0: {},
      L1: {},
      L2: {},
      L3: {},
      L4: {},
      L5: {}
    }
  };

  if (!uiSelectedRace) {
    yield put(raceLoaded({raceTrack}));
    return;
  } 

  const getRace = yield call(blockRacerC.methods.getRace, uiSelectedRace);
  const _race = yield call(getRace.call, {from: account});

  raceTrack.latestBlock = block.number;
  raceTrack.raceDistance = parseInt(_race.distance,10);
  raceTrack.conditions = parseInt(_race.conditions,10);
  raceTrack.raceLevel = parseInt(_race.level,10);
  raceTrack.lanesReady = parseInt(_race.lanesReady,10);
  raceTrack.lanesSettled = parseInt(_race.lanesSettled,10);
  raceTrack.raceSettled = _race.settled;

  raceTrack.conditionsView = conditionsView(raceTrack.conditions);
  raceTrack.raceReady = (raceTrack.lanesReady === 6);
  raceTrack.startBlock = (raceTrack.raceReady) ? parseInt(_race.start,10) : 0;
  raceTrack.settleBlock = (raceTrack.raceReady) ? raceTrack.startBlock + 12: 0;
  raceTrack.raceStarted = (raceTrack.raceReady && raceTrack.latestBlock >= raceTrack.startBlock);
  raceTrack.raceExpired = (raceTrack.raceStarted && raceTrack.latestBlock - raceTrack.startBlock >= 255);
  raceTrack.settleState = (!raceTrack.raceSettled) ? [] : _race.finish.map((each) => parseInt(each,10));
  raceTrack.settleNeeded = (raceTrack.raceStarted && raceTrack.settleBlock <= raceTrack.latestBlock && !raceTrack.raceSettled);

  let _raceLane;
  let _getRaceLane;
  for (let _lane=1; _lane<=6; _lane++) {
    if (raceTrack.lanesReady >= _lane) {
      _getRaceLane = yield call(blockRacerC.methods.getRaceLane, uiSelectedRace, _lane);
      _raceLane = yield call(_getRaceLane.call, {from: account});
      raceTrack.racers[_lane-1] = {..._raceLane, id: _raceLane.id.toString()};
    } else raceTrack.racers[_lane-1] = {id:"0"};
  }

  raceTrack.dataExpired = false;
  if (raceTrack.raceStarted) {
    let nextBlock = raceTrack.startBlock;
    let blockhash;
    while (nextBlock <= raceTrack.latestBlock && nextBlock < raceTrack.settleBlock) {
      blockhash = undefined;
      //gaurd against reorg by only loading blockhashs at least 12 blocks old
      //otherwise (re)write saveed blockhash as if new
      if (nextBlock <= (raceTrack.latestBlock - 12)) {
        blockhash = yield call(loadBlockhash, nextBlock);
      }
      if (!blockhash && !raceTrack.raceExpired) {
        const block = yield call(web3.eth.getBlock, nextBlock);
        blockhash = block.hash;
        yield fork(saveBlockhash, nextBlock, blockhash);
        //console.log("dl\'d and cached blockhash for "+nextBlock+': '+blockhash);
      } //else if (!blockhash && raceTrack.raceExpired) 
        //console.log('expired blockhash for '+nextBlock);
     //else console.log('found cached blockhash for '+nextBlock+': '+blockhash);

      if (!!blockhash) {
        for (let _lane=1; _lane<=6; _lane++) {
          if (!raceTrack.laneValues['L'+(_lane-1)]['$'+nextBlock]) {
            raceTrack.laneValues['L'+(_lane-1)]['$'+nextBlock] = 
              processLaneValues(web3, blockhash, raceTrack.racers[_lane-1]);
          }
        }
      } else raceTrack.dataExpired = true;
      nextBlock++;
    }
  }

  yield put(raceLoaded({raceTrack}));

}

function* updateRace() {
  const { web3, account, block, blockRacerC, uiSelectedRace, raceTrack, loadingRace } = yield select();

  if (!uiSelectedRace || loadingRace || !raceTrack.raceNumber || 
      raceTrack.raceNumber === '0' || raceTrack.raceSettled || 
      raceTrack.latestBlock === block.number) 
    return;

  let nextBlock = raceTrack.latestBlock + 1;
  const racersImmutable = (raceTrack.raceReady) ? true: false;

  const _raceTrack = {
    ...raceTrack,
    latestBlock: block.number,
    racers: [...raceTrack.racers],
    laneValues: {
      L0: {...raceTrack.laneValues.L0},
      L1: {...raceTrack.laneValues.L1},
      L2: {...raceTrack.laneValues.L2},
      L3: {...raceTrack.laneValues.L3},
      L4: {...raceTrack.laneValues.L4},
      L5: {...raceTrack.laneValues.L5},
    }
  };

  const getRace = yield call(blockRacerC.methods.getRace, uiSelectedRace);
  const _race = yield call(getRace.call, {from: account});

  _raceTrack.lanesReady = parseInt(_race.lanesReady,10);
  _raceTrack.raceReady = (_raceTrack.lanesReady === 6);
  _raceTrack.startBlock = (_raceTrack.raceReady) ? parseInt(_race.start,10) : 0;
  _raceTrack.settleBlock = (_raceTrack.raceReady) ? _raceTrack.startBlock + 12: 0;
  _raceTrack.raceStarted = (_raceTrack.raceReady && block.number >= _raceTrack.startBlock);
  _raceTrack.raceExpired = (_raceTrack.raceStarted && block.number - _raceTrack.startBlock >= 255);
  _raceTrack.lanesSettled = parseInt(_race.lanesSettled,10);
  _raceTrack.raceSettled = _race.settled;
  _raceTrack.settleState = (!_raceTrack.raceSettled) ? [] : _race.finish.map((each) => parseInt(each,10));
  _raceTrack.settleNeeded = (_raceTrack.raceStarted && _raceTrack.settleBlock <= _raceTrack.latestBlock && !_raceTrack.raceSettled);

  if (!racersImmutable) {
    let _raceLane;
    let _getRaceLane;
    for (let _lane=1; _lane<=6; _lane++) {
      if (_raceTrack.lanesReady >= _lane) {
        _getRaceLane = yield call(blockRacerC.methods.getRaceLane, uiSelectedRace, _lane);
        _raceLane = yield call(_getRaceLane.call, {from: account});
        _raceTrack.racers[_lane-1] = {..._raceTrack.racers[_lane-1], ..._raceLane, id: _raceLane.id.toString()};
      } else _raceTrack.racers[_lane-1] = {id:"0"};
    }
  }

  if (_raceTrack.raceStarted) {
    let blockhash;
    while (nextBlock <= _raceTrack.latestBlock && nextBlock < _raceTrack.settleBlock) {
      blockhash = undefined;
      //gaurd against reorg by only loading saved blockhashs at least
      //12 blocks old, otherwise (re)write saved blockhash as if new.
      if (nextBlock <= (_raceTrack.latestBlock - 12)) {
        blockhash = yield call(loadBlockhash, nextBlock);
      }
      if (!blockhash && !_raceTrack.raceExpired) {
        const block = yield call(web3.eth.getBlock, nextBlock);
        blockhash = block.hash;
        yield fork(saveBlockhash, nextBlock, blockhash);
        //console.log("dl\'d and cached blockhash for "+nextBlock+': '+blockhash);
      } //else if (!blockhash && _raceTrack.raceExpired) 
        //console.log('expired blockhash for '+nextBlock);
      //else console.log('found cached blockhash for '+nextBlock+': '+blockhash);

      if (!!blockhash) {
        for (let _lane=1; _lane<=6; _lane++) {
          if (!_raceTrack.laneValues['L'+(_lane-1)]['$'+nextBlock]) {
            _raceTrack.laneValues['L'+(_lane-1)]['$'+nextBlock] = 
              processLaneValues(web3, blockhash, _raceTrack.racers[_lane-1]);
          }
        }
      } else _raceTrack.dataExpired = true;
      nextBlock++;
    }
  }

  yield put(raceUpdated({raceTrack: _raceTrack}));
}

export default function* rootSaga() {
  yield takeLatest(LOAD_WEB3, mountNetwork);
  yield takeLatest(LOAD_WEB3_SUCCESS, mountAccount);
  yield takeLatest(NETWORK_CHANGE, mountNetwork);
  yield takeLatest(ACCOUNT_CHANGE, changeAccount);
  yield takeLatest(ACCOUNT_CHANGED, mountAccount);
  yield takeEvery(SEND_TX, watchTransaction);
  yield takeEvery(BLOCK_UPDATE, updateContractEvents);
  yield takeEvery(BLOCK_UPDATE, updateRecentRaces);
  yield takeLatest(BLOCK_UPDATE, updateRace);
  yield takeLatest(UI_RACE_SELECTED, mountRace);
}
