import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Select } from 'antd';
import { uiRaceSelected } from '../actions';

class RecentRacesSelector extends PureComponent {
  render() {
    const { loadingWeb3, recentRaces, uiSelectedRace, dispatch } = this.props;
    return (
      <span>
        <span style={{color: "#999", fontSize: "16px", margin: "6px 0px 6px 12px"}}>
          Recent Races:&nbsp;&nbsp;
        </span>
        <Select
          showSearch
          allowClear
          style={{width: "140px", margin: "6px 0px"}}
          dropdownMatchSelectWidth={false}
          loading={loadingWeb3 || !recentRaces}
          placeholder={(loadingWeb3 || !recentRaces) ? "Loading races" : "Select a race ("+recentRaces.length+")"}
          notFoundContent="No races yet"
          optionFilterProp="children"
          value={(!!recentRaces &&!!recentRaces.find && recentRaces.find((value) => (value.id === uiSelectedRace))) ? uiSelectedRace : undefined}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onChange={(id) => dispatch(uiRaceSelected({id}))}>
          {!!recentRaces && !!recentRaces.length && recentRaces.map((race) => (
            <Select.Option key={race.id} value={race.id}>
              {"Race #"+race.id}
            </Select.Option>
          ))}
        </Select>
      </span>
    );
  }
}

RecentRacesSelector.propTypes = {
  loadingWeb3: PropTypes.bool, 
  recentRaces: PropTypes.array, 
  uiSelectedRace: PropTypes.string
}

export default connect((state) => ({
  loadingWeb3: state.loadingWeb3, 
  recentRaces: state.recentRaces, 
  uiSelectedRace: state.uiSelectedRace
}))(RecentRacesSelector);