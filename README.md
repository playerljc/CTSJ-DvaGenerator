# CTSJ-DvaGenerator

&ensp;&ensp;dva数据流的一个生成器，能通过Service自动生成组件的mapStateToProps、mapDispatchToProps和Model

# 简介

&ensp;&ensp;一个简单的例子，用dva编写一个标椎的用户模块，用户模块中是标准的CRUD操作，我们大致会这样去写

######1. 定义UserService，UserService大致会是这样
```javascript
import { stringify } from 'qs';
import request from '@/utils/request';

// 列表
export async function fetchtList(params) {
  return request.get('fetchList');
}

// 详情
export async function fetchtInfo(id) {
  return request.get('fetchtInfo');
}

// 添加
export async function fetchtSave(payload) {
  return request.post('fetchSave');
}

// 删除
export async function fetchtDelete(id) {
  return request.delete('fetchtDelete');
}

// 修改
export async function fetchtUpdate(payload) {
  return request.put('fetchtUpdate');
}
```

######2. 定义UserModel，UserModel大致会是这样
```javascript
  import {
    fetchtList,
    fetchtInfo,
    fetchtSave,
    fetchtDelete,
    fetchtUpdate,
  } from '@/services/UserService';

  export default {
    namespace: 'user',
    state: {
      data: {
        list: [],
        total: 0,
      },
    },
    effects: {
      // 列表
      *fetchList({ payload }, { call, put, select }) {
        const response = yield call(fetchtList, payload);
        if (response.code === 0) {
          yield put({
            type: 'receive',
            payload: response.data,
          });
        }
      },
      // 详情
      *fetchInfo({ payload:{id} }, { call, put, select }) {
        const response = yield call(fetchInfo, id);
        if (response.code === 0) {
          yield put({
            type: 'receive',
            payload: response.data,
          });
        }
      },
      // 添加
      *feachSave({ payload: { success, ...other } }, { call, put }) {
        const response = yield call(fetchtSave, other);
        if (response.code === 0) {
          if (success) {
            success();
          }
          yield put({ type: 'fetchList', payload: {page:0,limit:10} });
        }
      },
      // 修改
      *feachUpdate({ payload: { success, ...other } }, { call, put }) {
        const response = yield call(feachUpdate, other);
        if (response.code === 0) {
          if (success) {
            success();
          }
          yield put({ type: 'fetchList', payload: {page:0,limit:10} });
        }
      },
      // 删除
      *feachDelete({ payload: { success, id } }, { call, put }) {
        const response = yield call(feachDelete, id);
        if (response.code === 0) {
          if (success) {
            success();
          }
          yield put({ type: 'fetchList', payload: {page:0,limit:10} });
        }
      },
    },
    reducers: {
      receive(state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
    },
  };
```
			
######3. 定义UserPage, UserPage大致会是这样 
```javascript
  import React from 'react';
  import { connect } from 'dva';

  class User extends React.Component {
    ...
  }

  const mapStateToProps = ({ user, loading }) => ({
    user,
    loading: loading.global,
  });

  const mapDispatchToProps = dispatch => ({
    fetchList: payload => dispatch({ type: 'user/fetchList', payload }),
    fetchInfo: payload => dispatch({ type: 'user/fetchInfo', payload }),
    fetchSave: payload => dispatch({ type: 'user/feachSave', payload }),
    fetchDelete: payload => dispatch({ type: 'user/fetchDelete', payload }),
    fetchUpdate: payload => dispatch({ type: 'user/fetchUpdate', payload }),
  });

  export default connect(mapStateToProps, mapDispatchToProps)(User);
```
&ensp;&ensp;我们会发现一个问题，像这样比较常规的CRUD操作，从Service -> Model -> Component的mapDispatchToProps方法的名字都是一一对应的， 而Model中的Effects操作基本都是调用Service中相应的接口，并且注入到数据流当中，而且Service也是按照相应模块编写的比如UserService就是处理User相关的操作， 这样就和Model中的namespace相对应，再则Model中的reducers里面应该只有一个receive的reducer，不应该有多个处理，effects中所有的put(reducer)都应该调用put({type:'receive'})来进行处理 所以我们就可以根据Service自动生成mapDispatchToProps和Model中的effects和reducers，我们只处理标椎模块，如果自动生成的这三部分不能满足需求，可以进行重写覆盖

# 处理

###### 1. mapStateToProps 
```javascript
  return {
    [namespace]: state[namespace],
    loading: state.loading.global
  };
```

###### 2. mapDispatchToProps和Service方法一一对应，例如 `
```javascript
  mapDispatchToProps[methodName] = params => dispatch(Object.assign({ type }, params));
```

###### 3. Model 
```javascript
  namespace,
  effects: {},
  reducers: {
    receive(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
```

###### 4. effects中的方法和Service的方法一一对用，effects中的方法只做三件事
  1 调用Service中相应接口 
```javascript
  const response = yield call(Service[key], other);
```
				
  2 调用success回调函数 
```javascript
  const { codeKey, codeSuccessKey, dataKey, messageKey } = Service.default;
  if (response[codeKey] === codeSuccessKey) {
    if (success) {
      success(response[dataKey],response[messageKey]);
    }
    ...
  }
```
				
  3 调用receice的reduce 
```javascript
  yield put({
    type: "receive",
    payload: { [service对应的方法名]: 接口返回数据 }
  });
```
				
  4 完整的操作 
```javascript
  // 1.调用接口
  const response = yield call(Service[key], other);
  // Service中的默认导出必须有的键
  // codeKey为状态域
  // codeSuccessKey为状态域中成功标识
  // dataKey为数据域
  const { codeKey, codeSuccessKey, dataKey, messageKey } = Service.default;
  if (response[codeKey] === codeSuccessKey) {
    // 如果有success调用success传递data和message
    // 2.调用回调函数
    if (success) {
      success(response[dataKey],response[messageKey]);
    }
    // 向数据流里放入Service的方法名为key,response[dataKey]为值的数据
    // 3.调用数据流
    yield put({
      type: "receive",
      payload: { [key]: response[dataKey] }
    });
  }
```

###### 5. 处理完成之后我们的UserPage的props中会有如下数据 
```javascript
  {
    user: {
      fetchList:[],
      fetchInfo:{},
      fetchSave:{},
      fetchDelete:{},
      fetchUpdate:{},
    }
  }
```
		

# 安装


```javascript
  npm install @ctsj/dvagenerator
```


# 例子

###### 1. 定义UserService 
```javascript
  import { stringify } from 'qs';
  import request from '@/utils/request';

  // 列表
  export const fetchtList(params) = (() => {
    return {
      call: () => {
        return request.get('fetchList');
      },
      // 接口的默认值
      defaultResult: () => ({
        total: 0,
        list: [],
      }),
    };
  })();

  // 详情
  export const fetchtInfo() = (() => {
    return {
      call: (id) => {
        return request.get('fetchtInfo');
      },
      defaultResult: () => ({
        id:'',
        ...
      })
    };
  })();

  // 添加
  export const fetchtSave() {
    return {
      call: (id) => {
        return request.get('fetchtSave');
      },
      defaultResult: () => true
    };
  }

  // 删除
  export const fetchtDelete() {
    return {
      call: (id) => {
        return request.get('fetchtDelete');
      },
      defaultResult: () => true
    };
  }

  // 修改
  export const fetchtUpdate() {
    return {
      call: (id) => {
        return request.get('fetchtUpdate');
      },
      defaultResult: () => true
    };
  }

  // 默认导出与接口先关的参数
  export default {
    // 接口成功失败的状态键
    codeKey: 'code',
    // 接口成功的状态值
    codeSuccessKey: 200,
    // 接口数据的键
    dataKey: 'data',
    // 接口消息键
    messageKey: 'message',
  };
```
		

###### 2. 定义UserModel 
```javascript
  // util.js
  /**
   * serviceRegister - Service的注册
   * @type {function(...[*]=)}
   */
  export const serviceRegister = (function () {
    const services = {};
    let isLoad = false;
  
    return function () {
      if(isLoad) return;
      const requireComponent = require.context('../services', true, /.*\.(js)$/);
  
      requireComponent.keys().forEach((fileName) => {
        const serviceKey = fileName.substring(2, fileName.length - 3);
        services[serviceKey] = requireComponent(fileName);
      });
  
      ServiceRegister.initConfig(services);
      isLoad = true;
    };
  })();

  // example.js
  import ServiceRegister from '@ctsj/dvagenerator';
  import { serviceRegister } from '@/utils/utils';
  
  serviceRegister();
  
  const Model = {
    namespace: 'example',
  };
  
  Object.assign(Model, ServiceRegister.model('example',{
    state: {
      fetchUsers: [],
      fetchUser: {},
    },
  }));
  
  export default Model;
```

###### 3. 定义UserPage 
```javascript
  import React from 'react';
  
  import { Link } from 'umi';
  import ServiceRegister from '@ctsj/dvagenerator';
  
  class Example extends React.Component {
    componentDidMount() {
      this.props.exampleFetchUsers();
      this.props.exampleFetchUser();
  
      this.props.aaaFetchUsers();
      this.props.aaaFetchUser();
  
      this.props.userQuery();
      this.props.userQueryCurrent();
      this.props.userQueryNotices();
    }
  
    render() {
      console.log(this.props);
      return <div>
        <div>Example</div>
        <div>
          <Link to="/user">go-user</Link>
        </div>
      </div>;
    }
  }
  
  const mapStateToProps = (state) => {
    return Object.assign(
      ServiceRegister.mapStateToProps({
        namespaces: ['example','user','aaa'],
        state,
      }),
      {
        loading: state.loading,
      },
    );
  }
  
  const mapDispatchToProps = (dispatch) =>
    ServiceRegister.mapDispatchToProps({
      namespaces: ['example','user','aaa'],
      dispatch,
    });
  
  export default ServiceRegister.connect(['example','user','aaa'])(mapStateToProps, mapDispatchToProps)(Example)
```
		

4. 注册Service(在第一个执行文件执行的所有引用之后注册,umi是src/global.jsx) 
```javascript
  import * as UserService from './service/UserService';
  import ServiceRegister from '@ctsj/dvagenerator';

  ServiceRegister.initConfig({
    user: UserService,
  });
```
		

# API

* initConfig - 服务注册初始化

* mapStateToProps - 自动生成mapStateToProps
* mapDispatchToProps - 自动生成mapDispatchToProps
* model - 生成Service对应的Model

# 其他

demo目录下附带了一个todolist的demo，用的是umi的dva工程
