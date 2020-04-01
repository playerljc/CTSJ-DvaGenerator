import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../ListItem/listitem';

import './list.less';

const selectorPrefix = 'ctsj-state-todolist';

/**
 * List
 * @class List
 * @classdesc List
 */
class List extends React.PureComponent {
  render() {
    const { type, data = []} = this.props;
    const curData = data.filter(t => t.type === type);
    const title = type === 'completed' ? '已完成' : '进行中';

    return (
      <div className={`${selectorPrefix}-list`}>
        <div className={`${selectorPrefix}-list-header`}>
          <div className={`${selectorPrefix}-list-header-title`}>{title}</div>
          <div className={`${selectorPrefix}-list-header-count`}>{curData.length}</div>
        </div>
        <ul className={`${selectorPrefix}-list-body`} >
          {
            curData.map((t) => {
              return <ListItem key={t.id} {...t} />;
            })
          }
        </ul>
      </div>
    );
  }
}

List.defaultProps = {
  type: 'completed',
  data: [],
};

List.propTypes = {
  type: PropTypes.string,
  data: PropTypes.array,
};

export default List;
