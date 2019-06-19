import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Row, Col, Spin, Modal } from 'antd';
import DappNavbar from "./components/DappNavbar";
import RacerCreateFormModal from "./components/RacerCreateFormModal";
import SpawnButton from "./components/SpawnButton";
import RecentRacesSelector from "./components/RecentRacesSelector";
import RightDrawerView from "./components/RightDrawerView";
import RaceTrack from "./components/RaceTrack";
import { loadWeb3 } from './actions';

const { Content, Footer } = Layout;

class App extends Component { 

  componentDidMount() {
    window.addEventListener("beforeunload", this.unmount);
    this.mount();
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.unmount);
    this.unmount();
  }

  mount = () => {
    this.props.dispatch(loadWeb3());
  }

  unmount = () => {
    Modal.destroyAll();
  }

  render() {
    const { loadingRace, uiSelectedRace, recentRaces } = this.props;
    return (
      <Layout>
        <DappNavbar />
        <Layout>
          <Content>
            <RacerCreateFormModal />
            <RightDrawerView />

            <Row style={{ marginTop: "4px" }}>
              <Col xs={15} sm={15} md={15} lg={12} xl={12} xxl={12}>
                <RecentRacesSelector/>
              </Col>
              <Col xs={9} sm={9} md={9} lg={6} xl={6} xxl={6}>
                <SpawnButton />
              </Col>
            </Row>

            <Row style={{ margin: "4px", padding:"0px 8px" }}>
              {(!uiSelectedRace && !recentRaces) ? (
                <span>Loading races...</span>
              ) : (!uiSelectedRace && !recentRaces.length) ? (
                <span>No recent races found.</span>
              ) : (!uiSelectedRace) ? (
                <span>Select a race above.</span>
              ) : (loadingRace) ? (
                <span><Spin />
                <span style={{marginLeft: "4px"}}>
                  {'Loading Race #'+uiSelectedRace}
                </span></span>
              ) : (
                <RaceTrack />
              )}
            </Row>

          </Content>
        </Layout>
        <Footer>

        </Footer>
      </Layout>
    );
  }
}

App.propTypes = {
  loadingRace: PropTypes.bool,
  uiSelectedRace: PropTypes.string,
  recentRaces: PropTypes.array
}

export default connect((state) => ({
  loadingRace: state.loadingRace,
  uiSelectedRace: state.uiSelectedRace,
  recentRaces: state.recentRaces,
}))(App);