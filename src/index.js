import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import rootRreducer, { initialState } from './reducer';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
/*
const logger = store => next => action => {
  console.group(action.type)
  console.info('>>> ', action)
  let result = next(action)
  console.log('=== ', store.getState())
  console.groupEnd()
  return result
}
*/
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  rootRreducer,
  initialState,
  applyMiddleware(/*logger, */sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

const root = document.getElementById('root');
ReactDOM.render(
	<Provider store={store}>
    <App />
  </Provider>, 
	root
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
