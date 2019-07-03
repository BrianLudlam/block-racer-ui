import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Row, Col, Button, Badge, Modal } from 'antd';
import { uiChangeDrawerView} from '../actions';
import BlockClock from "./BlockClock";
const { Header } = Layout;

class DappNavbar extends PureComponent {

  render() {
    const { loadingWeb3, web3Error, networkSyncing, networkName, blockNumber, account, 
            accountError, balanceView, exp, newEventCount, newTxCount, newRacerCount, 
            dispatch } = this.props;
    
    return (
      <Header style={{paddingLeft: "12px", paddingRight: "12px", paddingTop: "7px"}}>
        <Row style={{height: "100%", width: "100%"}}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} >
            <Row style={{whiteSpace: 'nowrap', lineHeight: "19px"}}>
              <span style={{fontSize: "20px", color: "white"}}>
                Block Racer
              </span>
              {!web3Error && ( 
                <BlockClock 
                  networkSyncing={networkSyncing} 
                  networkName={(loadingWeb3) ? null : networkName}
                  blockNumber={(loadingWeb3) ? null : blockNumber}/>)}
            </Row>
            {(!!web3Error) ? (
              <Row style={{whiteSpace: 'nowrap', lineHeight: "18px", paddingTop: "8px"}}>
                <span style={{fontSize: "18px", color: "red"}}>
                  {web3Error}
                </span>
              </Row>) : 
              (!web3Error && !!accountError) ? (
              <Row style={{whiteSpace: 'nowrap', lineHeight: "18px", paddingTop: "8px"}}>
                <span style={{fontSize: "18px", color: "red"}}>
                  {accountError}
                </span>
              </Row>) : (
              <Row style={{lineHeight: "14px", whiteSpace: 'nowrap'}}>
                <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                  account
                </span>
                <span style={{fontSize: "9px", color: "#ffc107", paddingTop: "1px"}}>
                  {account}
                </span>
              </Row>)
            }
            {!web3Error && !accountError && !!account && (
            <Row style={{lineHeight: "14px", paddingBottom: "4px", whiteSpace: 'nowrap'}}>
              <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                balance
              </span>
              <span style={{fontSize: "12px", color: "#ffc107", paddingRight: "4px"}}>
                {balanceView}
              </span>
              <span style={{fontSize: "14px", color: "#fff", paddingRight: "4px"}}>
                {'ether'}
              </span>
              <span style={{fontSize: "14px", color: "#ccc", paddingRight: "4px"}}>
                {'/'}
              </span>
              <span style={{fontSize: "12px", color: "#ffc107", paddingRight: "4px"}}>
                {exp}
              </span>
              <span style={{fontSize: "14px", color: "#fff"}}>
                {'experience'}
              </span>
            </Row>)}
          </Col>
          <Col offset={0} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px 0px 0px 24px"}} 
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'racers'}))}> 
              Racers 
               {(newRacerCount > 0) && (<Badge count={newRacerCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
          <Col offset={2} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px 8px"}}
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'events'}))}> 
               Events
               {(newEventCount > 0) && (<Badge count={newEventCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
          <Col offset={2} xs={2} sm={2} md={2} lg={2} xl={2} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px"}}
              onClick={() => dispatch(uiChangeDrawerView({open: true, view: 'txs'}))}> 
              Txs 
               {(newTxCount > 0) && (<Badge count={newTxCount} overflowCount={99} 
                style={{marginBottom: "24px", backgroundColor: "green"}}/>)}
            </Button>
          </Col>
          <Col offset={1} xs={1} sm={1} md={1} lg={1} xl={1} style={{height: "100%"}}>
            <Button className="hover-yellow" size="large" ghost type="link" style={{padding: "0px"}}
              onClick={() => Modal.info({
                width: "80%",
                centered: true,
                autoFocusButton: null,
                maskClosable: true,
                title: 'Help',
                content: 
                <div>
                  <h3>Block Racer Dapp</h3>
                  <p>{"A decentralized application, allowing Ethereum users (requires a Web3 Provider, such as MetaMask, installed in browser) to create ERC721 extended tokens, and race them against each other in a virtual race using blockchain mechanics. Each race's results are settled on-chain, via a transaction that is open to any Ethereum account holder. Race results are playable live, as well as replayable in the future. Block Racer tokens each have relatively unique and random \"genes\", which translate into racing skill potentials. Each Block Racer can be trained up to their potential, using experience points gained by racing, per account."}</p>
                  <h4>Block Racers = Tokens</h4>
                  <p>{"All created Block Racers are standard ERC721 tokens, therefore can be bought, sold, and traded at will. This Dapp UI does not concern with trading tokens though, as that would be better implemented with a seperate market oriented interface. This is in the future development scope of the project. For now, tokens can still be traded using manual transactions and even Remix, so very possible."}</p>
                  <h5>Creating and Spawning</h5>
                  <p>{"There is a transaction fee required for creating a new Block Racer, which can be reclaimed by spawning a Block Racer. When creating each Block Racer, future block mechanics are used to randomize each Block Racer's genes / skill potentials, as well as relative verification of each creation transaction. Exactly 12 blocks after a Block Racer creation transaction is successful, that Block Racer can be Spawned (via spawnEntity transaction). Spawning is simply the process of giving a Block Racer it's relatively-random genes. A created Block Racer that is not Spawned before the 256 block limit (due to Eth blockhash history limit), will result in permanently zeroed genes. Still useful, but much less. Spawning is queued semi-blindly depending on transaction order, first-come-first-served, and open to anyone with an account. A successful spawning transaction pays 4 finney. Likewise, a successful creation transaction cost 4 finney."}</p>
                  <h5>Parents and Rarity</h5>
                  <p>{"A Block Racer can be created with \"parents\" or without. Prarents can be any two created Block Racers, already Spawned, and owned by the creator. A Block Racer created with parents will have genes relatively-randomized between each gene value of it's parents. A Block Racer created without parents will receive relatively-random genes on an exponential scale of rarity. Most Block Racers will have skill potentials less than 100, with every 8 points above that being exponentially more rare, maxing at 255. The odds of getting all three Block Racer skill potentials at 255, is 256^3, or one in 16,777,216. *Miners may have a slight advantage here, but effects are minimalized, individualized, and far below block rewards in any ultimate value of transaction manipulation."}</p>
                  <h5>Genes</h5>
                  <p>{"Block Racer genes represent the potential of a Block Racer to be trained in any of three skills: acceleration, top speed, and traction. Acceleration governs the relative minimum speed of a Block Racer each split, with top speed governing the relative max speed each split, and traction skill governs the effect that track conditions have on slowing the racer down. Each Block Racer has a total of 32 8bit genes after Spawning. This project is only using 3 of them so far. More skills can be added that further translate racing performance, as well as virtual charactoristics of the Block Racer itself. At the current scope of this project, racing Block Racers are simply represented by a progress bar. "}</p>
                  <h4>Racing</h4>
                  <p>{"Any created Block Racer can enter the race queue at any time, unless already queued or racing. Block Racers entering are queued by level. As soon as 6 are queued at the same level, a race at that level will begin in exactly 12 blocks. Queued Block Racers can exit the race queue at any time before the race starts, but not after it starts, which is at the exact instant that a 6th entry transaction is processed at any given race level. "}</p>
                  <h5>Race Performance</h5>
                  <p>{"Starting on the 12th block after all 6 Block Racers are queued at a specific level, each block after that transaltes into part-skill part-randomish race performance until each racer reaches the finish line. The trained performance of each Block Racer can be combined with some relative-randness in block creation mechanics to give a distance travelled for each of 32 \"splits\" per block. Each Block Racer is individually processed to compute 32 split values per block, representing distance traveled each split. Each race result can be calculated (by a UI) in parallel to it's eventual smart contract's official calculations, however the smart contracts know nothing about the race result until informed with a set of Settlement transactions. The race ends when all Block Racers have reached a specified level-based distance (calculated and displayed by the UI) and coming in one of: 1st - 6th place. Each race requires Settlement transactions to finalize the race result on-chain and payout winners. Race entry has a fee, part of which is later passed on to race settlers, and the rest is payed out to race winners. Contracts do not retain any fees, all fees are passed on to players in some way."}</p>
                  <h5>Settlement Fees and Rewards</h5>
                  <p>{"Settling each race requires 7 transactions total, one for each of 6 lanes, and a final to compare results. Settlement transactions are open to anyone, and pay a reward, which is previously collected from each Block Racer's race entry transaction. Settlment fees for each race entry are 4 finney per racer, eventually paying out: 4 finney to the first race settlement transaction, 5 finney to the last, and 3 finney to the middle 5 settlement transactions. If a race settlement transaction occurs after all 6 settlement transactions occur for a given race, the contract will attempt to find another race to settle, before failing."}</p>
                  <h5>Racing Fees and Winner Rewards</h5>
                  <p>{"Each race also pays out rewards to it's: 1st, 2nd, and 3rd place winners. The amount payed out each race to winners is scaled by level, and collected beforehand as racing fees from each Block Racer's entry transaction. Racing fees are 18 finney per racer at level zero, and 1.8 finney more per each level. Race winners at level zero win a 4:3:2 split of collected racing fees, which at level zero is rewards of: 48 finney for 1st place, 36 finney for second plae, and 24 finney for third place. Each level above that adds to rewards: 4.8 finney, 3.6 finney, and 2.4 finney, respectively. "}</p>
                  <h5>Block Racer Training and Levels</h5>
                  <p>{"Block Racers can be trained in each of their 3 skills: acceleration, top speed, and traction. The specifc genes of each Block Racer govern the maximum amount each skill can be trained. Training Block Racers costs experience points at a 1:1 ratio. Eperience points are collected, per account, by racing Block Racers. At least 1 experience point (sometimes 2, rarely 3) is earned for every Block Racer race entry, upon settlement of the race, regardless of performance in the race. Experience points can be applied to any Block Racer, given that Block Racer has the skill potential. For every 8 levels a Block Racer is trained in any skill, that Block Racer automatically goes up a level. The maximum amount of training a Block Racer can receive, is governed by it's genes as skill potential, which has a max of 255. Therefore, a Block Racer with max genes, and max training, would find a max level Block Racer at 95. A Block Racer with zeroed genes (zero skill potential), due to not being spawned in time to receive genes, can never be trained, but can always race at level zero with no training. Level zero races are the most random, with each level adding more and more player skill in training strategy. Level zero races will be very close, with generally greater differential as level gets higher. Racing fees (not settlement fees) go up per level, as well as their matching payout table."}</p>
                </div>,
              })}> 
              {"?"} 
            </Button>
          </Col>
        </Row>
      </Header>
    );
  }
}

DappNavbar.propTypes = {
  loadingWeb3: PropTypes.bool,
  web3Error: PropTypes.string,
  networkName: PropTypes.string,
  networkSyncing: PropTypes.bool,
  blockNumber: PropTypes.number,
  loadingAccount: PropTypes.bool,
  mountingAccount: PropTypes.bool,
  account: PropTypes.string,
  accountView: PropTypes.string,
  accountError: PropTypes.string,
  balanceView: PropTypes.string,
  exp: PropTypes.number,
  newEventCount: PropTypes.number,
  newTxCount: PropTypes.number,
  newRacerCount: PropTypes.number
}

export default connect((state) => ({
  loadingWeb3: state.loadingWeb3,
  web3Error: state.web3Error,
  networkName: (!state.loadingWeb3 && !!state.network) ? state.network : '',
  networkSyncing: false,
  blockNumber: (!state.loadingWeb3 && !!state.block) ? state.block.number : undefined,
  loadingAccount: state.loadingAccount,
  account: state.account,
  accountView: state.accountView,
  accountError: state.accountError,
  balanceView: state.balanceView,
  exp: state.exp,
  newEventCount: state.newEventCount,
  newTxCount: state.newTxCount,
  newRacerCount: state.newRacerCount
}))(DappNavbar);

