import React from 'react';
import { connect } from 'dva';
import ServiceRegister from '@ctsj/dvagenerator';

import './header.less';

const selectorPrefix = 'ctsj-state-todolist';

/**
 * Header
 * @param onAdd
 * @return {*}
 * @constructor
 */
class Header extends React.PureComponent {
  render() {
    return (
      <div className={`${selectorPrefix}-header`}>
        <div className={`${selectorPrefix}-header-title`}>ToDoList</div>
        <div className={`${selectorPrefix}-header-input`}>
          <input
            placeholder="添加ToDo"
            type="text"
            onKeyUp={(e) => {
              const { which, target: { value } } = e;
              if (which === 13) {
                this.props.todolistFetchSave({
                  value,
                  success: () => {
                    console.log('HeaderFetchSaveSuccess');
                    this.props.todolistFetchList({
                      success: () => {
                        console.log('AppFetchListSuccess');
                      },
                    });
                  },
                });
              }
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state =>
  ServiceRegister.mapStateToProps({
    namespace: 'todolist',
    state,
  });

const mapDispatchToProps = dispatch => ServiceRegister.mapDispatchToProps({
  namespaces: ['todolist'],
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
