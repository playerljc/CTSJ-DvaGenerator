import {
  IConfig,
  IAdapter,
  IMapStateToProps,
  IMapStateToPropsReturn,
  IMapDispatchToProps,
  IMapDispatchToPropsReturn,
  IModel
} from "./define";

let Config: IConfig;

/**
 * ServiceRegister
 * @class ServiceRegister
 * @classdesc 服务的注册
 * 1.自动生成数据流的mapDispatchToProps映射
 * 2.自动生成数据流的mapStateToProps映射
 * 3.自动生成数据流的Model
 */
const Adapter: IAdapter = {
  /**
   * initConfig - 服务注册初始化
   * @param {Object} - config
   * - namespace: service的实例
   * property: model的namespace，也可以理解为模块名称
   * value: value为Service的实例对象
   */
  initConfig(config: IConfig) {
    Config = config;
  },
  /**
   * mapStateToProps - 自动生成mapStateToProps
   * @param {String} - namespace
   * @param {Object} - state 数据流的数据
   * @return {Object} - mapStateToProps的映射
   * 映射namespace到Props
   * 映射loading到Props
   */
  mapStateToProps({ namespaces, state }: IMapStateToProps) {
    const props: IMapStateToPropsReturn = {
      loading: state.loading
    };

    if (namespaces && namespaces.length) {
      namespaces.forEach((namespace) => {
        props[namespace] = state[namespace];
      });
    }

    return props;
  },
  /**
   * mapDispatchToProps - 自动生成mapDispatchToProps
   * @param {Array<String>} - namespaces - 模块的集合
   * @param {Function} - dispatch
   * @return {Object} - mapDispatchToProps映射
   */
  mapDispatchToProps({ namespaces, dispatch }: IMapDispatchToProps) {
    // service的实例
    const mapDispatchToProps: IMapDispatchToPropsReturn = {};

    let keys:string[] = [];
    if (!namespaces || !namespaces.length) {
      // 如果不传递模块集合或者模块集合为空数组，则生成所有Service的方法隐射
      keys = Object.keys(Config);
    } else {
      keys = namespaces;
    }

    keys.forEach(namespace => {
      const Service = Config[namespace];

      Object.keys(Service).forEach(key => {
        if(key !== 'default') {
          // methodName是namespace + 接口方法名首字母大写
          // 例子 namespace是todolist Service中有fetchList接口
          // 则方法名为todolistFetchList
          const methodName = `${namespace}${key.charAt(0).toUpperCase()}${key.substring(1)}`;
          const type = `${namespace}/${key}`;
          // params必须是对象且只有一个对象
          mapDispatchToProps[methodName] = params => dispatch(Object.assign({ type }, params));
        }
      });
    });

    return mapDispatchToProps;
  },
  /**
   * model - 生成Service对应的Model
   * @param {String} - namespace
   * @return {Object} - Model
   * 此方默认处理Service中的所有接口，默认生成的Effect只调用接口，
   * 把接口返回值注入到以方法名为Key，返回的dataKey为数据的数据流中，且在model的namespace键中创建
   * 例如：
   * 假定model的namsespace为todolist
   * Service中有ferchList方法
   * Model的处理为
   * 1.调用fetchList
   * 2.将返回值放入 {
   *    todolist:{
   *      fetchList: 数据
   *    }
   * }
   */
  model(namespace: string) {
    // service的实例
    const Service = Config[namespace];

    const keys = Object.keys(Service);

    // const defaultState = {};
    //
    // keys.forEach(key => {
    //   if(key !== 'default') {
    //     defaultState[key] = Service[key].defaultResult();
    //   }
    // });

    // 模型
    const model: IModel = {
      // namespace
      namespace,
      // effects
      effects: {},
      // reducers
      reducers: {
        receive(state, { payload }) {
          return {
            ...state,
            ...payload
          };
        }
      }
    };

    // 所有除了default
    keys.forEach(key => {
      if (key !== "default") {
        // params是调用mapDispatchToProps的参数
        // success是回调函数
        model.effects[key] = function*(params, { call, put }) {
          // 1.调用接口
          const response = yield call(Service[key], params);
          // Service中的默认导出必须有的键
          // codeKey为状态域
          // codeSuccessKey为状态域中成功标识
          // dataKey为数据域
          const { codeKey, codeSuccessKey, dataKey } = Service.default;

          if (response[codeKey] === codeSuccessKey) {
            // // 如果有success调用success传递data和message
            // // 2.调用回调函数
            // if (success) {
            //   success(response[dataKey],response[messageKey]);
            // }
            // 向数据流里放入Service的方法名为key,response[dataKey]为值的数据
            // 3.调用数据流
            yield put({
              type: "receive",
              payload: { [key]: response[dataKey] }
            });
          }
        };
      }
    });

    return model;
  }
};

export default Adapter;
