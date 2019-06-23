import { eventChannel, buffers, END } from 'redux-saga';

export const BigNumber = require('bignumber.js');
export const Entity = require("./contracts/IEntity.json");
export const EntityAddress = '0x725e882ED026B5F90ACCe6E02Ee1f27FBCbe1928';
export const BlockRacer = require("./contracts/IBlockRacer.json");
export const BlockRacerAddress = '0x1E31cEBA5047254c3BF37dB4e86bF2b03B83839b';

export const CREATION_FEE = new BigNumber("4000000000000000");//4 finney
export const RACE_FEE = new BigNumber("4000000000000000");//4 finney
export const COST_MULT = new BigNumber("1800000000000000");//1.8 finney 
export const COST_BASE = new BigNumber("18000000000000000");//18 finney 
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

/* ACTiONS */
export const LOAD_WEB3 = 'BlockRacer/LOAD_WEB3';
export const LOAD_WEB3_SUCCESS = 'BlockRacer/LOAD_WEB3_SUCCESS';
export const LOAD_WEB3_ERROR = 'BlockRacer/LOAD_WEB3_ERROR';
export const NETWORK_LOADED = 'BlockRacer/NETWORK_LOADED';
export const NETWORK_CHANGE = 'BlockRacer/NETWORK_CHANGE';
export const NETWORK_SYNCING = 'BlockRacer/NETWORK_SYNCING';
export const BLOCK_UPDATE = 'BlockRacer/BLOCK_UPDATE';
export const ACCOUNT_CHANGE = 'BlockRacer/ACCOUNT_CHANGE';
export const ACCOUNT_CHANGED = 'BlockRacer/ACCOUNT_CHANGED';
export const ACCOUNT_MOUNTED = 'BlockRacer/ACCOUNT_MOUNTED';
export const CONTRACT_EVENT = 'BlockRacer/CONTRACT_EVENT';
export const SEND_TX = 'BlockRacer/SEND_TX';
export const TX_UPDATE = 'BlockRacer/TX_UPDATE';
export const RACER_UPDATED = 'BlockRacer/RACER_UPDATED';
export const UI_RACER_SELECTED = 'BlockRacer/UI_RACER_SELECTED';
export const UI_CREATION_NAME_CHANGE = 'BlockRacer/UI_CREATION_NAME_CHANGE';
export const UI_BREEDWITH_SELECTED = 'BlockRacer/UI_BREEDWITH_SELECTED';
export const UI_RACE_SELECTED = 'BlockRacer/UI_RACE_SELECTED';
export const RACE_LOADED = 'BlockRacer/RACE_LOADED';
export const RACE_UPDATED = 'BlockRacer/RACE_UPDATED';
export const RECENT_RACES_UPDATED = 'BlockRacer/RECENT_RACES_UPDATED';
export const UI_CHANGE_DRAWER_VIEW = 'BlockRacer/UI_CHANGE_DRAWER_VIEW';
export const UI_TOGGLE_CREATE_MODAL = 'BlockRacer/UI_TOGGLE_CREATE_MODAL';

export const initAccountState = {
  lastBlock: 0, 
  txs: [], 
  txLog: {}, 
  events: [], 
  eventLog: {}, 
  racers: [], 
  racer: {}, 
  races: {}, 
  stats: {}
};

export const createRacerTx = (name, parentA, parentB) => ({
  contract: 'entityC', 
  method: 'createEntity', 
  args: (!!parentA && !!parentB) ? [name, parentA, parentB] : [name, 0, 0],
  params: {value: CREATION_FEE}
});

export const spawnRacerTx = () => ({
  contract: 'entityC', 
  method: 'spawnEntity', 
  args: [], 
  params: {}
});

export const trainRacerTx = (id, training) => ({
  contract: 'blockRacerC', 
  method: 'train', 
  args: [id, training],
  params: {}
});

export const enterRaceTx = (id, racer) => ({
  contract: 'blockRacerC', 
  method: 'enterRaceQueue', 
  args: [id],
  params: {value: raceCost(racer)}
});

export const exitRaceTx = (id) => ({
  contract: 'blockRacerC', 
  method: 'exitRaceQueue', 
  args: [id],
  params: {}
});

export const settleRaceTx = (id) => ({
  contract: 'blockRacerC', 
  method: 'settleRace', 
  args: [id],
  params: {}
});

export const saveAccountState = (account, state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(`BlockRacer/account/${account}`, serialized);
  } catch (e) {
    console.error('Account cache store fail: error', e);
  }
};

export const loadAccountState = (account) => {
  try {
    const serialized = localStorage.getItem(`BlockRacer/account/${account}`);
    if (serialized === null) return undefined;
    else return JSON.parse(serialized);
  } catch (e) {
    console.error('Cached account retreival fail: error', e);
    return undefined;
  }
};

export const accountTopic = (place, topic) => 
  //entity = transfer-from, nameChange,and spawned
  //blockRacer = enter, exit, train, finished
  ((place === 1) ? ([null, topic, null, null]) : 
  //entity = transfer-to
  //blockRacer = raceSettled, laneSettled
  (place === 2) ? ([null, null, topic, null]) : 
  //entity = spawner
  ([null, null, null, topic]));

export const getPastEvents = async (contract, event, options) => 
  await contract.getPastEvents(event, options);

const cleanEvent = (e) => ({
  ...e,
  raw: null,
  returnValues: 
    (e.event === 'Transfer') ? {
      to: e.returnValues.to.toString(),
      from: e.returnValues.from.toString(),
      tokenId: e.returnValues.tokenId.toString()
    } : (e.event === 'Spawned') ? {
      owner: e.returnValues.owner.toString(),
      entity: e.returnValues.entity.toString(),
      spawner: e.returnValues.spawner.toString()
    } : (e.event === 'NameChanged') ? {
      owner: e.returnValues.owner.toString(),
      entity: e.returnValues.entity.toString(),
      name: e.returnValues.name.toString().replace(/[^A-Za-z0-9\s$%&*!@-_().]/ig, "")
    } : (e.event === 'RaceEntered' || e.event === 'RaceExited') ? {
      owner: e.returnValues.owner.toString(),
      racer: e.returnValues.racer.toString(),
      race: e.returnValues.race.toString(),
      lane: parseInt(e.returnValues.lane,10),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : (e.event === 'RaceStarted') ? {
      race: e.returnValues.race.toString(),
      distance: parseInt(e.returnValues.distance,10),
      conditions: parseInt(e.returnValues.conditions,10),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : (e.event === 'RaceFinished') ? {
      owner: e.returnValues.owner.toString(),
      racer: e.returnValues.racer.toString(),
      race: e.returnValues.race.toString(),
      place: parseInt(e.returnValues.place,10),
      splits: parseInt(e.returnValues.splits,10),
      distance: parseInt(e.returnValues.distance,10),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : (e.event === 'RacerTrained') ? {
      owner: e.returnValues.owner.toString(),
      racer: e.returnValues.racer.toString(),
      acceleration: parseInt(e.returnValues.acceleration,10),
      topSpeed: parseInt(e.returnValues.topSpeed,10),
      traction: parseInt(e.returnValues.traction,10),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : (e.event === 'LaneSettled') ? {
      race: e.returnValues.race.toString(),
      settler: e.returnValues.settler.toString(),
      lane: parseInt(e.returnValues.lane,10),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : (e.event === 'RaceSettled') ? {
      race: e.returnValues.race.toString(),
      settler: e.returnValues.settler.toString(),
      timestamp: parseInt(e.returnValues.timestamp,10)
    } : {}
});

export const mapEventToState = (event, state) => {
  if (!event || !state) return;
  const e = cleanEvent(event);
  if (!e.removed && !state.eventLog[e.id]) {
    e.account = state.account;
    state.eventLog[e.id] = e;
    state.events.unshift(e.id);//descending order
  } else if (!e.removed && !!state.eventLog[e.id]) {
    return;//already processed event
  } else if (e.removed && !state.eventLog[e.id]) {
    return;//already undid and removed event
  } else if (e.removed && !!state.eventLog[e.id]) {
    const alreadyRemoved = !!state.eventLog[e.id].removed;//defensive
    state.events = state.events.filter((each) => each !== e.id);
    state.eventLog[e.id] = null;
    if (alreadyRemoved) return;//never want to process remove more than once
  }
  //process event to racers state
  if (e.event === 'Transfer') {
    const racer = e.returnValues.tokenId;
    e.type = (e.returnValues.to === state.account)
    if (
      (!e.removed && e.returnValues.to === state.account && !state.racers.includes(racer)) ||
      (e.removed && e.returnValues.from === state.account && !state.racers.includes(racer))
    ) {
      state.racers.unshift(racer);
    } else if (
      (!e.removed && e.returnValues.from === state.account && state.racers.includes(racer)) ||
      (e.removed && e.returnValues.to === state.account && state.racers.includes(racer))
    ) {
      state.racers = state.racers.filter((each) => each !== racer);
    }
  } else if (e.event === 'RaceEntered' || e.event === 'RaceExited') {
    const racer = e.returnValues.racer;
    const race = e.returnValues.race;
    if (!state.races['$'+racer]) state.races['$'+racer] = [];
    if (
      (!e.removed && e.event === 'RaceEntered' && !state.races['$'+racer].includes(race)) ||
      (e.removed && e.event === 'RaceExited' && !state.races['$'+racer].includes(race))
    ) {
      state.races['$'+racer].push(race);
    } else if (
      (!e.removed && e.event === 'RaceExited' && state.races['$'+racer].includes(race)) ||
      (e.removed && e.event === 'RaceEntered' && state.races['$'+racer].includes(race))
    ) {
      state.races['$'+racer] = state.races['$'+racer].filter((each) => each !== race);
    }
  } else if (e.event === 'RaceFinished') {
    const racer = e.returnValues.racer;
    const race = e.returnValues.race;
    const place = e.returnValues.place;
    const distance = e.returnValues.distance;
    const splits = e.returnValues.splits;
    if (!distance) {//expired race
      if (!!state.racer['$'+racer] && state.racer['$'+racer].state === "RACING" && 
          state.racer['$'+racer].lastRace === race) {
        state.racer['$'+racer].state = "IDLE";
      }
      return;
    }
    if (!state.stats['$'+racer]) 
      state.stats['$'+racer] = {
        finishes: [0,0,0,0,0,0,0],
        splits: 0,
        distance: 0
      };
    if (!e.removed) {
      state.stats['$'+racer].finishes[0] += 1;
      state.stats['$'+racer].finishes[place] += 1;
      state.stats['$'+racer].distance += distance;
      state.stats['$'+racer].splits += splits;
    } else {
      if (state.stats['$'+racer].finishes[0] > 0) state.stats['$'+racer].finishes[0] -= 1;
      if (state.stats['$'+racer].finishes[place] > 0) state.stats['$'+racer].finishes[place] -= 1;
      if (state.stats['$'+racer].distance >= distance) state.stats['$'+racer].distance -= distance;
      if (state.stats['$'+racer].splits >= splits) state.stats['$'+racer].splits -= splits;
    }
  /*} else if (e.event === 'Spawned') {

  } else if (e.event === 'RacerTrained') {

  } else if (e.event === 'LaneSettled') {
  
  } else if (e.event === 'RaceSettled') {
    const race = e.returnValues.race;
    state.racers.forEach((id) => {
      if (!!state.racer['$'+id] && state.racer['$'+id].state === "RACING" && 
        state.racer['$'+id].lastRace === race) {
        state.racer['$'+id].state = "IDLE";
      }
    })*/
  } 
}

export const mapRacerSpawnState = (racer, blockNumber) => {
  const hasNullGenes = (!racer.genes || racer.genes[0] === 0);
  const age = (hasNullGenes) ? 0 : parseInt(Date.now()/1000) - racer.born;
  if (hasNullGenes && racer.born - blockNumber < 255) {//check if born is date not block number
    racer.state = "CREATING";
    racer.spawnReady = (blockNumber >= racer.born) ? 0 : racer.born - blockNumber 
    racer.spawnView = 'Spawn '+((blockNumber - racer.born  >= 255) ? 'expired' : 
      (racer.spawnReady === 0) ? 'ready' : 
      (racer.spawnReady === 1) ? 'next block' : 
      'in '+racer.spawnReady+' blocks');
    racer.expireView = (
      (blockNumber - racer.born >= 255) ? '' :
        (255 - (blockNumber - racer.born))+' block(s)');
  }else if (!hasNullGenes && age < 187) {
    racer.state = "SPAWNING";
    racer.spawnReady = 0;
    racer.spawnView = 'Spawn in '+(187 - age)+' sec';
    racer.expireView = '';
  }else if (!racer.state || racer.state === "CREATING" || racer.state === "SPAWNING") {
    racer.state = "IDLE";
    racer.spawnView = '';
    racer.spawnReady = 0;
    racer.expireView = '';
  }else if (racer.spawnReady !== 0) {
    racer.spawnView = '';
    racer.spawnReady = 0;
    racer.expireView = '';
  }
}

export const createAccountChangeChannel = () => eventChannel(emitter => {
  const accountChanged = () => {
    emitter({ accountHasChanged: true });
  };
  window.ethereum.on('accountsChanged', accountChanged)
  return () => window.ethereum.off('accountsChanged', accountChanged);
}, buffers.sliding(2));

export const createBlockUpdateChannel = (web3) => eventChannel(emitter => {
  const blockSub = web3.eth.subscribe('newBlockHeaders');
  const onBlockUpdate = (block) => {
    emitter({block});
  };
  blockSub.on("data", onBlockUpdate);
  return () => blockSub.unsubscribe();
}, buffers.sliding(2));

export const createEventListenerChannel = (contract, topics) => eventChannel(emitter => {
  const eventSub = contract.events.allEvents({
    topics,
    fromBlock: 'latest'
  });
  const onEvent = (e) => { console.log('EVENT---------EVENT', e); emitter(e); }
  eventSub.on("data", onEvent);
  eventSub.on("changed", onEvent);
  return () => {}
}, buffers.sliding(2));

export const createTransactionChannel = (tx, params) => eventChannel(emitter => {
  let txSub;
  var hash;
  try { 
    txSub = tx.send(params);
    txSub.on('transactionHash', (_hash) => {
      hash = _hash; 
      //console.log('Hash: '+hash)
      emitter({type: 'hash', hash});
    });
    txSub.on('receipt', (receipt) => emitter({type: 'receipt', receipt, hash}));
    txSub.on('confirmation', (count, receipt) => {
      emitter({type: 'confirmation', receipt, count, hash});
      if (count >= 12) emitter(END);
    });
    txSub.on('error', (error) => {
      emitter({type: 'error', error, hash});
      emitter(END);
    });
  } catch(error) {
    emitter({type: 'cancel', error});
    emitter(END);
  }
  return () => {}
}, buffers.sliding(2));

export const processLaneValues = (web3, _blockhash, _racer) => {
  const _racerBlockhash = web3.utils.soliditySha3 (_racer.seed, _blockhash);
  const speed = parseInt(_racer.speed,10);
  const max = parseInt(_racer.max,10);
  let rand;
  let splits=[];
  for (let split=0; split < 32; split++) {
    rand = parseInt("0x"+_racerBlockhash.substring( 2+(split*2), 4+(split*2) ), 16);
    splits[split] = ((speed + rand < max) ? speed + rand : max);
  }
  return splits;
}

const accelTraining = (racer) => (
  (!racer) ? 0 : (!racer.accel) ? racer.training[0] : racer.accel + racer.training[0]
);

const topTraining = (racer) => (
  (!racer) ? 0 : (!racer.top) ? racer.training[1] : racer.top + racer.training[1]
);

const tractionTraining = (racer) => (
  (!racer) ? 0 : (!racer.traction) ? racer.training[2] : racer.traction + racer.training[2]
);

const totalTraining = (racer) => (
  accelTraining(racer) + topTraining(racer) + tractionTraining(racer)
);

export const totalNewTraining = (racer) => (
  racer.training[0] + racer.training[1] + racer.training[2]
);

const accelPotential = (racer) => (
  (!racer || !racer.genes) ? 0 : racer.genes[0]
);

const topPotential = (racer) => (
  (!racer || !racer.genes) ? 0 : racer.genes[1]
);

const tractionPotential = (racer) => (
  (!racer || !racer.genes) ? 0 : racer.genes[2]
);

const totalPotential = (racer) => (
  accelPotential(racer) + topPotential(racer) + tractionPotential(racer)
);

const levelPotential = (racer) => (
  (!racer || !racer.genes) ? 0 : Math.floor(totalPotential(racer) / 8)
);

export const avgSpeed = (racer) => (
  (!racer || !racer.distance || !racer.splits) ? 0 : 
  ((racer.distance / racer.splits) / 100).toFixed(3) +" m/s"
);

export const racerLevel = (racer) => (
  (totalTraining(racer) < 8) ? 0 :
  Math.floor(totalTraining(racer) / 8)
);

export const totalBeforeTraining = (racer) => (
  (!racer) ? 0 : 
  (racer.accel || 0) + (racer.top || 0) + (racer.traction || 0)
);

export const levelBeforeTraining = (racer) => (
  (totalBeforeTraining(racer) < 8) ? 0 :
  Math.floor(totalBeforeTraining(racer) / 8)
);

export const levelView = (racer) => (
  racerLevel(racer)+'/'+levelPotential(racer)+' Training Level'
);

export const levelPercent = (racer) => (
  (racerLevel(racer) === 0) ? 0 :
  (racerLevel(racer) === levelPotential(racer)) ? 100 :
  ((racerLevel(racer) / levelPotential(racer)) * 100)
);

export const accelView = (racer) => (
  accelTraining(racer)+'/'+accelPotential(racer)+' Acceleration'
);

export const expLeft = (racer, exp) => (
  (!exp || exp <= totalNewTraining(racer)) ? 0 : exp - totalNewTraining(racer)
);

export const expLeftView = (racer, exp) => (
  expLeft(racer, exp)+' exp points left'
);

export const expLeftPercent = (racer, exp) => (
  (!expLeft(racer, exp)) ? 0 : ((expLeft(racer, exp) / exp) * 100)
);

export const isTrainable = (racer, exp) => (
  !!racer && !!racer.genes && !!racer.genes[0] && 
  (racer.state === 'IDLE' || racer.state === 'TRAIN') &&
   exp !== 0 && totalNewTraining(racer) < exp
); 

export const accelPercent = (racer) => (
  (accelTraining(racer) === 0) ? 0 :
  (accelTraining(racer) === accelPotential(racer)) ? 100 :
  ((accelTraining(racer) / accelPotential(racer)) * 100)
);

export const accelTrainable = (racer, exp) => (
  isTrainable(racer, exp) && accelTraining(racer) < accelPotential(racer)
); 

export const topView = (racer) => (
  topTraining(racer)+'/'+topPotential(racer)+' Top Speed'
);

export const topPercent = (racer) => (
  (topTraining(racer) === 0) ? 0 :
  (topTraining(racer) === topPotential(racer)) ? 100 :
  ((topTraining(racer) / topPotential(racer)) * 100)
);

export const topTrainable = (racer, exp) => (
  isTrainable(racer, exp) && topTraining(racer) < topPotential(racer)
); 

export const tractionView = (racer) => (
  tractionTraining(racer)+'/'+tractionPotential(racer)+' Traction'
);

export const tractionPercent = (racer) => (
  (tractionTraining(racer) === 0) ? 0 :
  (tractionTraining(racer) === tractionPotential(racer)) ? 100 :
  ((tractionTraining(racer) / tractionPotential(racer)) * 100)
);

export const tractionTrainable = (racer, exp) => (
  isTrainable(racer, exp) && tractionTraining(racer) < tractionPotential(racer)
);

export const hasNullGenes = (racer) => (
  /*
  !!racer && !!racer.entityGenes && racer.entityGenes.length === 32 &&
  racer.entityGenes.reduce((total, num) => (total + num)) === 0
  */
  !!racer && !!racer.entityGenes && racer.entityGenes.length === 32 &&
  racer.entityGenes[0] === 0
);

export const trainingIsValid = (racer, experience) => (
  totalNewTraining(racer) <= experience &&
  accelTraining(racer) + racer.training[0] <= racer.entityGenes[0] &&
  topTraining(racer) + racer.training[1] <= racer.entityGenes[1] && 
  tractionTraining(racer) + racer.training[2] <= racer.entityGenes[2]
);

export const raceCost = (racer) => (
  COST_MULT.times(racerLevel(racer)).plus(COST_BASE).plus(RACE_FEE)
);

export const raceWagerView = (racer) => (
  (!racer || !racer.level) ? '18 finney' : 
    (((racer.level * 1.8) + 18).toFixed(1))+' finney'
);

export const firstRewardView = (racer) => (
  (!racer || !racer.level) ? '48 finney' : 
    (((racer.level * 4.8) + 48).toFixed(1))+' finney'
);

export const secondRewardView = (racer) => (
  (!racer || !racer.level) ? '36 finney' : 
    (((racer.level * 3.6) + 36).toFixed(1))+' finney'
);

export const thirdRewardView = (racer) => (
  (!racer || !racer.level) ? '24 finney' : 
    (((racer.level * 2.4) + 24).toFixed(1))+' finney'
);

export const levelValue = (_level) => (
  (!_level) ? 0 : 
    raceCost(_level-1)
    .minus(RACE_FEE)
    .times(8)
    .plus(
      levelValue (_level-1)
    )
);

export const laneSort = (a, b) => (
  (a.lane < b.lane) ? -1 : 1
);

export const placeSort = (a, b) => (
  //yield to lowest final split
  (a.splits > b.splits) ? 1 :
  (a.splits < b.splits) ? -1 : 
  //final split the same, yield to hishest final speed
  (a.distance < b.distance) ? 1 : 
  (a.distance > b.distance) ? -1 : 
  //final speed the same, yield to highest
  //(a.speed < b.speed) ? 1 : 
  //(a.speed > b.speed) ? -1 : 
  //final split and speed the same, yield to inside lane
  (a.lane < b.lane) ? -1 : 1
);

export const laneFinish = (_lane, _finishState) => (
  (_finishState[0].lane === _lane) ? _finishState[0] : 
  (_finishState[1].lane === _lane) ? _finishState[1] : 
  (_finishState[2].lane === _lane) ? _finishState[2] : 
  (_finishState[3].lane === _lane) ? _finishState[3] : 
  (_finishState[4].lane === _lane) ? _finishState[4] : _finishState[5]
);

export const laneFinishView = (_lane, _finishState) => (
  (_finishState[0].lane === _lane) ? "1st Place" : 
  (_finishState[1].lane === _lane) ? "2nd Place" : 
  (_finishState[2].lane === _lane) ? "3rd Place" : 
  (_finishState[3].lane === _lane) ? "4th Place" : 
  (_finishState[4].lane === _lane) ? "5th Place" : "6th Place"
);

export const laneSettleView = (_lane, _settleLanes) => (
  (_settleLanes[0] === (_lane+1)) ? "1st Place" : 
  (_settleLanes[1] === (_lane+1)) ? "2nd Place" : 
  (_settleLanes[2] === (_lane+1)) ? "3rd Place" : 
  (_settleLanes[3] === (_lane+1)) ? "4th Place" : 
  (_settleLanes[4] === (_lane+1)) ? "5th Place" : "6th Place"
);

export const verifySettleState = (_finishState, _settleState) => (
  (_finishState[0].lane+1 === _settleState[0]) &&
  (_finishState[1].lane+1 === _settleState[1]) &&
  (_finishState[2].lane+1 === _settleState[2]) &&
  (_finishState[3].lane+1 === _settleState[3]) &&
  (_finishState[4].lane+1 === _settleState[4]) &&
  (_finishState[5].lane+1 === _settleState[5])
);

export const conditionsView = (_conditions) => (
  (_conditions >= 96 && _conditions <= 160) ? "Mild" : 
  (_conditions < 96 && _conditions >= 64) ? "Mostly Dry" : 
  (_conditions < 64 && _conditions >= 32) ? "Dry" : 
  (_conditions < 32) ? "Very Dry" : 
  (_conditions > 160 && _conditions <= 192) ? "Mostly Muddy" : 
  (_conditions > 192 && _conditions <= 224) ? "Muddy" : "Very Muddy"
);