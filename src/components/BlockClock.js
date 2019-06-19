import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class BlockClock extends PureComponent {

  state={ tick: 17 }

  componentDidMount() {
    this.blockInterval = setInterval(
      () => this.setState((state) => ({tick: state.tick+1})),
      950
    );
  }

  componentWillUnmount() {
    if (!!this.blockInterval){
      clearInterval(this.blockInterval);
      this.blockInterval = null;
    } 
  }

  componentDidUpdate(prevProps) {
    const { networkName, blockNumber} = this.props;
    if (networkName !== prevProps.networkName) {
      this.setState({tick: 17});
    } else if ( blockNumber !== prevProps.blockNumber ) {
      this.setState({tick: 0});//start
    }
  }

  render() {
    const { networkName, blockNumber, networkSyncing  } = this.props;
    const { tick } = this.state;
    const nextBlockPercent = (tick === 0) ? 0 : (tick >= 17) ? 100 : (
      ((tick / 17) * 100).toFixed(1)
    );
    return (
      <span style={{ whiteSpace: 'nowrap', paddingLeft: "3px", fontSize: "12px", paddingTop: "4px"}}>
        <span style={((networkSyncing) ? {color:"#c77"} : {color:"#ccc"})}>
          {(!networkName || !blockNumber) ? 'loading...': 
            'on '+networkName + ((networkSyncing) ? ' syncing...' : 
              ' #' + blockNumber)}
        </span>
        {!networkSyncing && (
        <CircularProgressbar className="CircularProgressbar"
          percentage={nextBlockPercent} text={`${nextBlockPercent}%`}/>
        )}
      </span>
    );
  }
}

BlockClock.propTypes = {
  networkSyncing: PropTypes.bool,
  networkName: PropTypes.string,
  //version: PropTypes.string,
  blockNumber: PropTypes.number
}

export default BlockClock;