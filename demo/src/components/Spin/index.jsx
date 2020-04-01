import React from 'react';
import ReactLoading from 'react-loading';

import './index.less';

export default props => {
  return (
    <div className="Spin">
      {props.loading ? (
        <div className="SpinInner">
          <ReactLoading type="spin" color="blue" height={60} width={60} />
        </div>
      ) : null}
      {props.children}
    </div>
  );
};
