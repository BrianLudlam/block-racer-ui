import produce from 'immer';
import { LOAD_WEB3, LOAD_WEB3_SUCCESS, LOAD_WEB3_ERROR, BLOCK_UPDATE, ACCOUNT_CHANGE,
				 ACCOUNT_CHANGED, ACCOUNT_MOUNTED, RACER_UPDATED, CONTRACT_EVENT,
				 UI_RACER_SELECTED, UI_CREATION_NAME_CHANGE, UI_BREEDWITH_SELECTED,RACE_LOADED,
				 TX_UPDATE, UI_RACE_SELECTED, RACE_UPDATED, mapEventToState, mapRacerSpawnState, 
				 RECENT_RACES_UPDATED, SEND_TX, UI_CHANGE_DRAWER_VIEW, UI_TOGGLE_CREATE_MODAL
          } from './constants';

export const initialState = {
  loadingWeb3: false,
  web3Error: "",
  web3: undefined,
  network: '',
  block: undefined,
  entityC: undefined,
  blockRacerC: undefined,
  spawnCount: 0,
  settleCount: 0,
  loadingAccount: false,
  mountingAccount: false,
  account: '',
  accountView: '',
  accountError: '',
  balance: '',
  balanceView: '',
  exp: undefined,
  lastBlock: 0,
  txs: [],
  txLog: {},
  events: [],
  eventLog: {},
  newEventCount: 0,
  newTxCount: 0,
  newRacerCount: 0,
  racer: {},
  racers: [],
  races: {},
  stats: {},
  loadingRace: false,
  raceTrack: undefined,
  recentRaces: undefined,
  uiSelectedRacer: undefined,
  uiBreedRacerWith: undefined,
  uiCreationName: '',
  uiSelectedRace: undefined,
  uiRightDrawerOpen: false,
  uiRightDrawerView: 'racers',
  uiCreateModalOpen: false
};

const clearAccountState = (state) => {
	state.account = '';
  state.accountView = '';
  state.accountError = '';
  state.balance = '';
  state.balanceView = '';
  state.exp = undefined;
  state.txs = [];
  state.txLog = {};
  state.events = [];
  state.eventLog = {};
  state.racer = {};
  state.racers = [];
  state.races = {};
  state.stats = {};
  state.uiSelectedRacer = undefined;
  state.uiBreedRacerWith = undefined;
  state.uiCreationName = '';
  state.uiSelectedRace = undefined;
  state.uiRightDrawerOpen = false;
  state.uiRightDrawerView = 'racers';
  state.uiCreateModalOpen = false;
}

const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD_WEB3:
        draft.loadingWeb3 = true;
        draft.web3Error = "";
        draft.loadingAccount = true;
        draft.accountError = "";
        break;

      case LOAD_WEB3_SUCCESS:
      	draft.web3 = action.web3;
      	draft.entityC = action.entityC;
      	draft.blockRacerC = action.blockRacerC;
      	draft.network = action.network;
      	draft.block = action.block;
      	draft.account = action.account;
      	draft.accountView = action.accountView;
      	draft.balance = action.balance;
      	draft.balanceView = (!!draft.balance) ? parseFloat(draft.balance).toFixed(6).toString() : '0';
      	draft.exp = action.exp;
      	draft.spawnCount = action.spawnCount;
        draft.loadingWeb3 = false;
        draft.web3Error = "";
        draft.loadingAccount = false;
        draft.accountError = "";
        draft.mountingAccount = true;
        break;

      case LOAD_WEB3_ERROR:
      	draft.loadingWeb3 = false;
      	draft.web3Error = action.error;
      	draft.loadingAccount = false;
        draft.accountError = action.error;
        break;

      case ACCOUNT_MOUNTED:
      	draft.events = action.events;
      	draft.eventLog = action.eventLog;
      	draft.racers = action.racers;
      	draft.racer = action.racer;
      	draft.races = action.races;
      	draft.stats = action.stats;
      	draft.lastBlock = action.lastBlock;
      	draft.mountingAccount = false;
        break;

      case ACCOUNT_CHANGE:
      	clearAccountState(draft);
      	draft.loadingAccount = true;
      	draft.accountError = "";
        break;

      case ACCOUNT_CHANGED:
        draft.account = action.account;
        draft.accountView = action.accountView;
        draft.balance = action.balance;
        draft.balanceView = (!!draft.balance) ? parseFloat(draft.balance).toFixed(6).toString() : '0';
        draft.exp = action.exp;
        if (!action.account)  draft.accountError = "Unable to load account.";
      	draft.loadingAccount = false;
      	draft.mountingAccount = true;
        break;

      case BLOCK_UPDATE:
      	draft.block = action.block;
      	draft.balance = action.balance;
      	draft.balanceView = (!!draft.balance) ? parseFloat(draft.balance).toFixed(6).toString() : '0';
      	draft.exp = action.exp;
      	draft.spawnCount = action.spawnCount;
      	draft.settleCount = action.settleCount;
      	if (!!draft.account && !draft.loadingAccount && !draft.mountingAccount) {
      		draft.lastBlock = action.block.number;
	      	draft.racers.forEach((id) => {
	      		if (!!draft.racer['$'+id] && !!draft.racer['$'+id].born && (!draft.racer['$'+id].state || 
	      			draft.racer['$'+id].state === "CREATING" || draft.racer['$'+id].state === "SPAWNING")) {
	      			mapRacerSpawnState(draft.racer['$'+id], draft.block.number);
	      		}
	      	})
      	}
        break;

      case RACER_UPDATED:
      	draft.racer['$'+action.racer.id] = (!draft.racer['$'+action.racer.id]) ? action.racer : {
      		...draft.racer['$'+action.racer.id],
      		...action.racer
      	};
        break;

      case CONTRACT_EVENT:
      	const e = action.event;
      	if (!e || !e.id) break;
        const prevRacerCount = draft.racers.length;
      	mapEventToState(e, draft);
        draft.newEventCount += 1;
        if (prevRacerCount < draft.racers.length) {
          draft.newRacerCount += 1;
        }
        break;

     	case RECENT_RACES_UPDATED:
      	draft.recentRaces = (!draft.recentRaces) ? action.recentRaces : [
      		...action.recentRaces,
          ...draft.recentRaces
      	];
        for (let i=0; i<draft.racers.length; i++) {
      		if (!!draft.racer['$'+draft.racers[i]] && draft.racer['$'+draft.racers[i]].state === 'QUEUEING'){
						const lastRace = draft.racer['$'+draft.racers[i]].lastRace;
      			if (!!lastRace && action.recentRaces.find((race) => (race.id === lastRace))){
		        	draft.racer['$'+draft.racers[i]].state = 'RACING';
              //console.log('Updating racer for start of race ', draft.racer['$'+draft.racers[i]]);
		        }
      		}
	      }
        break;

      case SEND_TX:
      	if (action.method === 'enterRaceQueue' && !!action.args[0]) {
      		const racerId = action.args[0];
      		if (draft.racer['$'+racerId].state === 'IDLE') {
      			draft.racer['$'+racerId].state = 'QUEUEING';
      		}
      	} else if (action.method === 'exitRaceQueue' && !!action.args[0]) {
      		const racerId = action.args[0];
      		if (draft.racer['$'+racerId].state === 'QUEUEING') {
      			draft.racer['$'+racerId].state = 'IDLE';
      		}
        } else if (action.method === 'train' && !!action.args[0]) {
          const racerId = action.args[0];
          if (draft.racer['$'+racerId].state === 'TRAIN') {
            draft.racer['$'+racerId].state = 'TRAINING';
          }
        }
        break;

      case TX_UPDATE:
  			if (!action.tx) break;
        //console.log('tx: ',action.tx)
	      if (action.tx.type === 'hash' && !draft.txLog[action.tx.hash]) {
          draft.newTxCount += 1;
	      	draft.txLog[action.tx.hash] = {
	      		transactionHash: action.tx.hash, 
	      		confirmCount: 0, 
	      		status: true,
	      		title: action.tx.title
	      	};
	      	draft.txs.unshift(action.tx.hash);
	      } else if (action.tx.type === 'receipt') {
	      	draft.txLog[action.tx.receipt.transactionHash] = {
	      		...action.tx.receipt, 
	      		confirmCount: 1,
	      		title: action.tx.title
	      	};
	      } else if (action.tx.type === 'confirmation') {
	      	draft.txLog[action.tx.receipt.transactionHash] = {
	      		...action.tx.receipt, 
	      		confirmCount: action.tx.count,
	      		title: action.tx.title
	      	};
	      } else if (action.tx.type === 'error' || action.tx.type === 'cancel') {
	      	if (action.tx.type === 'error' && !!action.tx.hash && !!draft.txLog[action.tx.hash]) {
            draft.txLog[action.tx.hash].confirmCount = 0;
            draft.txLog[action.tx.hash].status = false;
          }
          if (action.tx.title === 'enterRaceQueue' && !!action.tx.args[0]) {
	      		const racerId = action.tx.args[0];
	      		if (draft.racer['$'+racerId].state === 'QUEUEING') {
	      			draft.racer['$'+racerId].state = 'IDLE';
	      		}
	      	} else if (action.tx.title === 'exitRaceQueue' && !!action.tx.args[0]) {
	      		const racerId = action.tx.args[0];
            if (draft.racer['$'+racerId].state === 'IDLE') {
              draft.racer['$'+racerId].state = 'QUEUEING';
            }
	      	} else if (action.tx.title === 'train' && !!action.tx.args[0]) {
            const racerId = action.tx.args[0];
            if (draft.racer['$'+racerId].state === 'TRAINING') {
              draft.racer['$'+racerId].state = 'TRAIN';
            }
          }
	      }
        break;

      case RACE_LOADED:
        draft.raceTrack = action.raceTrack;
        draft.loadingRace = false;
        draft.raceTrack.myRacerNames = {};
        for (let i=0; i<draft.racers.length; i++) {
          if (!!draft.racer['$'+draft.racers[i]]) {
            draft.raceTrack.myRacerNames['$'+draft.racers[i]] = 
              draft.racer['$'+draft.racers[i]].name;
          }
        }
        break;

      case RACE_UPDATED:
        if (!!action.raceTrack) {
          draft.raceTrack = {
            ...draft.raceTrack,
            ...action.raceTrack,
            raceCompleted: (draft.raceTrack.raceCompleted || (
              !!action.raceTrack.raceState && action.raceTrack.raceState.start === 2))
                ? true : false
          }
        }
        break;

      case UI_RACER_SELECTED:
      	draft.uiSelectedRacer = (!!action.id) ? action.id : undefined;
  			draft.uiBreedRacerWith = undefined;
        draft.uiRightDrawerView = 'racers';
        draft.uiRightDrawerOpen = true;
        break;

      case UI_BREEDWITH_SELECTED:
      	draft.uiBreedRacerWith = (!!action.id) ? action.id : undefined;
        break;

     	case UI_CREATION_NAME_CHANGE:
      	draft.uiCreationName = (!!action.name) ? action.name : '';
        break;

      case UI_RACE_SELECTED:
      	draft.uiSelectedRace = (!!action.id) ? action.id : undefined;
      	draft.loadingRace = true;
        break;

      case UI_CHANGE_DRAWER_VIEW:
        if (action.open) {
          draft.uiRightDrawerView = (action.view === 'events') ? 'events' : 
            (action.view === 'txs') ? 'txs' : 'racers';
          draft.uiRightDrawerOpen = true;
          if (action.view === 'events') draft.newEventCount = 0;
          else if (action.view === 'txs') draft.newTxCount = 0;
          else if (action.view === 'racers') draft.newRacerCount = 0;
        } else draft.uiRightDrawerOpen = false;
        break;

     case UI_TOGGLE_CREATE_MODAL:
        if (action.open) {
          draft.uiCreateModalOpen = true;
        } else draft.uiCreateModalOpen = false;
        break;

      default: break;
    }
  });

export default appReducer;

