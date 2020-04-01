# CTSJ-DvaGenerator

&ensp;&ensp;dva数据流的一个生成器，能通过Service自动生成组件的mapStateToProps、mapDispatchToProps和Model

# 简介

&ensp;&ensp;一个简单的例子，用dva编写一个标椎的用户模块，用户模块中是标准的CRUD操作，我们大致会这样去写

1. 定义UserService，UserService大致会是这样
```js
import { stringify } from 'qs';
import request from '@/utils/request';

// &#x5217;&#x8868;
export async function fetchtList(params) {
  return request.get('fetchList');
}

// &#x8BE6;&#x60C5;
export async function fetchtInfo(id) {
  return request.get('fetchtInfo');
}

// &#x6DFB;&#x52A0;
export async function fetchtSave(payload) {
  return request.post('fetchSave');
}

// &#x5220;&#x9664;
export async function fetchtDelete(id) {
  return request.delete('fetchtDelete');
}

// &#x4FEE;&#x6539;
export async function fetchtUpdate(payload) {
  return request.put('fetchtUpdate');
}
```

2. 定义UserModel，UserModel大致会是这样
```js
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
      // &#x5217;&#x8868;
      *fetchList({ payload }, { call, put, select }) {
        const response = yield call(fetchtList, payload);
        if (response.code === 0) {
          yield put({
            type: 'receive',
            payload: response.data,
          });
        }
      },
      // &#x8BE6;&#x60C5;
      *fetchInfo({ payload:{id} }, { call, put, select }) {
        const response = yield call(fetchInfo, id);
        if (response.code === 0) {
          yield put({
            type: 'receive',
            payload: response.data,
          });
        }
      },
      // &#x6DFB;&#x52A0;
      *feachSave({ payload: { success, ...other } }, { call, put }) {
        const response = yield call(fetchtSave, other);
        if (response.code === 0) {
          if (success) {
            success();
          }
          yield put({ type: 'fetchList', payload: {page:0,limit:10} });
        }
      },
      // &#x4FEE;&#x6539;
      *feachUpdate({ payload: { success, ...other } }, { call, put }) {
        const response = yield call(feachUpdate, other);
        if (response.code === 0) {
          if (success) {
            success();
          }
          yield put({ type: 'fetchList', payload: {page:0,limit:10} });
        }
      },
      // &#x5220;&#x9664;
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
			
3. 定义UserPage, UserPage大致会是这样 
```js
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

1. mapStateToProps 
```js
  return {
    [namespace]: state[namespace],
    loading: state.loading.global
  };
```
		

2. mapDispatchToProps 和Service方法一一对应，例如 `
```js
  mapDispatchToProps[methodName] = params => dispatch(Object.assign({ type }, params));
```
		

3. Model 
```js
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
		

4. effects中的方法和Service的方法一一对用，effects中的方法只做三件事
  1. 调用Service中相应接口 
```js
  const response = yield call(Service[key], other);
```
				
  2. 调用success回调函数 
```js
  const { codeKey, codeSuccessKey, dataKey, messageKey } = Service.default;
  if (response[codeKey] === codeSuccessKey) {
    if (success) {
      success(response[dataKey],response[messageKey]);
    }
    ...
  }
```
				
  3. 调用receice的reduce 
```js
  yield put({
    type: "receive",
    payload: { [service&#x5BF9;&#x5E94;&#x7684;&#x65B9;&#x6CD5;&#x540D;]: &#x63A5;&#x53E3;&#x8FD4;&#x56DE;&#x6570;&#x636E; }
  });
```
				
  4. 完整的操作 
```js
  // 1.&#x8C03;&#x7528;&#x63A5;&#x53E3;
  const response = yield call(Service[key], other);
  // Service&#x4E2D;&#x7684;&#x9ED8;&#x8BA4;&#x5BFC;&#x51FA;&#x5FC5;&#x987B;&#x6709;&#x7684;&#x952E;
  // codeKey&#x4E3A;&#x72B6;&#x6001;&#x57DF;
  // codeSuccessKey&#x4E3A;&#x72B6;&#x6001;&#x57DF;&#x4E2D;&#x6210;&#x529F;&#x6807;&#x8BC6;
  // dataKey&#x4E3A;&#x6570;&#x636E;&#x57DF;
  const { codeKey, codeSuccessKey, dataKey, messageKey } = Service.default;
  if (response[codeKey] === codeSuccessKey) {
    // &#x5982;&#x679C;&#x6709;success&#x8C03;&#x7528;success&#x4F20;&#x9012;data&#x548C;message
    // 2.&#x8C03;&#x7528;&#x56DE;&#x8C03;&#x51FD;&#x6570;
    if (success) {
      success(response[dataKey],response[messageKey]);
    }
    // &#x5411;&#x6570;&#x636E;&#x6D41;&#x91CC;&#x653E;&#x5165;Service&#x7684;&#x65B9;&#x6CD5;&#x540D;&#x4E3A;key,response[dataKey]&#x4E3A;&#x503C;&#x7684;&#x6570;&#x636E;
    // 3.&#x8C03;&#x7528;&#x6570;&#x636E;&#x6D41;
    yield put({
      type: "receive",
      payload: { [key]: response[dataKey] }
    });
  }
```
				

5. 处理完成之后我们的UserPage的props中会有如下数据 
```js
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


```js
  npm install @ctsj/dvagenerator
```


# 例子

1. 定义UserService 
```js
  import { stringify } from 'qs';
  import request from '@/utils/request';

  // &#x5217;&#x8868;
  export async function fetchtList(params) {
    return request.get('fetchList');
  }

  // &#x8BE6;&#x60C5;
  export async function fetchtInfo(id) {
    return request.get('fetchtInfo');
  }

  // &#x6DFB;&#x52A0;
  export async function fetchtSave(payload) {
    return request.post('fetchSave');
  }

  // &#x5220;&#x9664;
  export async function fetchtDelete(id) {
    return request.delete('fetchtDelete');
  }

  // &#x4FEE;&#x6539;
  export async function fetchtUpdate(payload) {
    return request.put('fetchtUpdate');
  }

  // &#x9ED8;&#x8BA4;&#x5BFC;&#x51FA;&#x4E0E;&#x63A5;&#x53E3;&#x5148;&#x5173;&#x7684;&#x53C2;&#x6570;
  export default {
    // &#x63A5;&#x53E3;&#x6210;&#x529F;&#x5931;&#x8D25;&#x7684;&#x72B6;&#x6001;&#x952E;
    codeKey: 'code',
    // &#x63A5;&#x53E3;&#x6210;&#x529F;&#x7684;&#x72B6;&#x6001;&#x503C;
    codeSuccessKey: 200,
    // &#x63A5;&#x53E3;&#x6570;&#x636E;&#x7684;&#x952E;
    dataKey: 'data',
    // &#x63A5;&#x53E3;&#x6D88;&#x606F;&#x952E;
    messageKey: 'message',
  };
```
		

2. 定义UserModel 
```js
  import ServiceRegister from '@ctsj/dvagenerator';

  export default Object.assign(ServiceRegister.model('user'), {
    state: {
      fetchList: [],
    },
    subscriptions: {
      setup({ history, dispatch }) {
        console.log('user', 'setup');
      },
    },
  });
```
		

3. 定义UserPage 
```js
  import React from 'react';
  import { connect } from 'dva';
  import ServiceRegister from '@ctsj/dvagenerator';

  class User extends React.Component {
    ...
  }

  const mapStateToProps = state =>
    ServiceRegister.mapStateToProps({
      namespace: 'user',
      state,
    });

  const mapDispatchToProps = dispatch => ServiceRegister.mapDispatchToProps({
    namespaces: ['user'],
    dispatch,
  });

  export default connect(mapStateToProps, mapDispatchToProps)(User);
```
		

4. 注册Service(在第一个执行文件执行的所有引用之后注册,umi是src/global.jsx) 
```js
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
