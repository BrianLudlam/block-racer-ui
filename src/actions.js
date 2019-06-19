/*
 * App Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */
import { LOAD_WEB3, LOAD_WEB3_SUCCESS, LOAD_WEB3_ERROR, NETWORK_LOADED, 
				 NETWORK_CHANGE, NETWORK_SYNCING, BLOCK_UPDATE, ACCOUNT_CHANGE,
				 ACCOUNT_CHANGED, ACCOUNT_MOUNTED, RACER_UPDATED, CONTRACT_EVENT,
				 SEND_TX, TX_UPDATE, UI_RACER_SELECTED, UI_CREATION_NAME_CHANGE, 
				 UI_BREEDWITH_SELECTED, UI_RACE_SELECTED, RACE_LOADED, RACE_UPDATED,
				 RECENT_RACES_UPDATED, UI_CHANGE_DRAWER_VIEW, UI_TOGGLE_CREATE_MODAL 
        } from './constants';

/**
 * Load web3, this action starts the request saga
 * @return {object} An action object with a type of LOAD_WEB3
 */
export function loadWeb3() {
  return {
    type: LOAD_WEB3
  };
}

export function web3Loaded({web3, network, block, account, accountView, balance, 
	entityC, blockRacerC, exp, spawnCount}) {
  return {
    type: LOAD_WEB3_SUCCESS,
    web3, network, block, account, accountView, balance, entityC, 
    blockRacerC, exp, spawnCount
  };
}

export function web3Error({error}) {
  return {
    type: LOAD_WEB3_ERROR,
    error
  };
}
export function networkLoaded() {
  return {
    type: NETWORK_LOADED
  };
}
export function networkChange() {
  return {
    type: NETWORK_CHANGE
  };
}
export function networkSyncing({isSyncing}) {
  return {
    type: NETWORK_SYNCING,
    isSyncing
  };
}
export function blockUpdate({block, balance, exp, spawnCount, settleCount}) {
  return {
    type: BLOCK_UPDATE,
    block, balance, exp, spawnCount, settleCount
  };
}
export function accountChange() {
  return {
    type: ACCOUNT_CHANGE
  };
}
export function accountChanged({account, accountView, balance, exp}) {
  return {
    type: ACCOUNT_CHANGED,
		account, accountView, balance, exp
  };
}

export function accountMounted({events, eventLog, racers, racer, races, stats, lastBlock}) {
  return {
    type: ACCOUNT_MOUNTED,
    events, eventLog, racers, racer, races, stats, lastBlock
  };
}

export function racerUpdated({racer}) {
  return {
    type: RACER_UPDATED,
    racer
  };
}

export function contractEvent({event}) {
  return {
    type: CONTRACT_EVENT,
    event
  };
}

export function sendTx({contract, method, args, params}) {
  return {
    type: SEND_TX,
    contract, method, args, params
  };
}

export function txUpdate({tx}) {
  return {
    type: TX_UPDATE,
    tx
  };
}

export function uiRacerSelected({id}) {
  return {
    type: UI_RACER_SELECTED,
    id
  };
}

export function uiBreedWithSelected({id}) {
  return {
    type: UI_BREEDWITH_SELECTED,
    id
  };
}

export function uiCreationNameChanged({name}) {
  return {
    type: UI_CREATION_NAME_CHANGE,
    name
  };
}

export function uiRaceSelected({id}) {
  return {
    type: UI_RACE_SELECTED,
    id
  };
}

export function raceLoaded({raceTrack}) {
  return {
    type: RACE_LOADED,
    raceTrack
  };
}

export function raceUpdated({raceTrack}) {
  return {
    type: RACE_UPDATED,
    raceTrack
  };
}

export function recentRacesUpdated({recentRaces}) {
  return {
    type: RECENT_RACES_UPDATED,
    recentRaces
  };
}

export function uiChangeDrawerView({open, view}) {
  return {
    type: UI_CHANGE_DRAWER_VIEW,
    open, view
  };
}

export function uiToggleCreateModal({open}) {
  return {
    type: UI_TOGGLE_CREATE_MODAL,
    open
  };
}





