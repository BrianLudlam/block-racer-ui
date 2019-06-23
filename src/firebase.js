import { firebase } from '@firebase/app';
import '@firebase/database';
import { firebaseConfig } from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

export const blockhashCacheThreshold = 24;

export const getBlockhashSet = async (network, start, count=12) => {
  let _hashHistory = undefined;
  if (!network || !start) return _hashHistory; 
  try {
    const hashHistoryRef = db.ref(`blockhashs/${network}`);
    const hashHistoryQuery = 
    	hashHistoryRef
    	.orderByKey()
    	.startAt(start.toString())
    	.endAt((start + count).toString());
    const snapshot = await hashHistoryQuery.once("value");
    if (!!snapshot) {
      _hashHistory = snapshot.val();
      //console.log('hashHistory found: ', _hashHistory);
    }//else console.log('hashHistory not found');
  } catch (e) {
    console.error('firebase getBlockhashSet fail, e: ', e);
  } finally {
    //console.error('Cached hashHistory:', _hashHistory);
    return _hashHistory;
  }
};

export const cacheBlockhash = async (network, number, hash) => {
  if (!network || !number || !hash) return; 
  try {
    const hashRef = db.ref(`blockhashs/${network}`).child(number);
    const hashSnapshot = await hashRef.once("value");
    if (!hashSnapshot || hashSnapshot.val() !== hash) {
      hashRef.set(hash);
      //console.log('hashHistory SET: #'+number+' = '+hash);
    }//else console.log('hashHistory already set: #'+number+' = '+hash);
  } catch (e) {
    console.error('firebase cacheBlockhash fail, e: ', e);
  }
};