import React from 'react';
import { connect } from 'dva';
import ServiceRegister from '@ctsj/dvagenerator';

import Header from '../../components/Header/header';
import List from '../../components/List/list';
import Spin from '../../components/Spin';

import './app.less';

const selectorPrefix = 'ctsj-state-todolist';

/**
 * App
 * @param data
 * @return {*}
 * @constructor
 */
class App extends React.PureComponent {
  componentDidMount() {
    this.props.todolistFetchList({
      success: () => {
        console.log('AppFetchListSuccess');
      },
    });
  }

  render() {
    const {
      todolist: { fetchList },
    } = this.props;

    return (
      <Spin loading={this.props.loading}>
        <div className={`${selectorPrefix}`}>
          <Header />
          <div className={`${selectorPrefix}-body`}>
            <List data={fetchList} type="run" />
            <List data={fetchList} type="complete" />
          </div>
        </div>
      </Spin>
    );
  }
}

const mapStateToProps = state =>
  ServiceRegister.mapStateToProps({
    namespace: 'todolist',
    state,
  });

const mapDispatchToProps = dispatch =>
  ServiceRegister.mapDispatchToProps({
    namespaces: ['todolist'],
    dispatch,
  });

/**
 * App
 * @class App
 * @classdesc App
 */
export default connect(mapStateToProps, mapDispatchToProps)(App);
