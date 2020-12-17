/**
 * IResponse - 接口的返回值
 */
export interface IResponse {
  codeKey: string;
  codeSuccessKey: number | string;
  dataKey: any;
  messageKey: string;
}

/**
 * IState - Store的数据
 * @interface
 */
export interface IState {
  [propName: string]: any;
}

/**
 * IMapStateToProps
 * @interface
 */
export interface IMapStateToProps {
  namespaces: string[];
  state: IState;
}

/**
 * IMapStateToPropsReturn
 */
export interface IMapStateToPropsReturn {
  // loading: boolean;
  [propName: string]: IState;
}

/**
 * IMapDispatchToProps
 * @interface
 */
export interface IMapDispatchToProps {
  namespaces: string[];
  dispatch: (action: any) => void;
}

/**
 * IMapDispatchToPropsReturn
 * @interface
 */
export interface IMapDispatchToPropsReturn {
  [propName: string]: (params: any) => void;
}

/**
 * IService - Service
 * @interface
 */
export interface IService {
  ["default"]: IResponse;
  [propName: string]: any;
}

/**
 * IModel - 模型
 * @interface
 */
export interface IModel {
  // defaultState
  defaultState: [] | {},
  // state
  state: [] | {},
  // namespace
  namespace: string;
  // effects
  effects: any;
  // reducers
  reducers: {
    receive: (state: IState, params: { payload: any }) => IState;
  };
}

/**
 * IConfig - 配置
 * @interface
 */
export interface IConfig {
  /**
   * propName
   * 键为namespace
   * 值为Service实例
   */
  [propName: string]: IService;
}

/**
 * IAdapter - 主对象
 * @interface
 */
export interface IAdapter {
  /**
   * initConfig - 初始化Service配置
   * @param {IConfig} - config
   * @return {VoidFunction}
   */
  initConfig(config: IConfig): void;

  /**
   * mapStateToProps - 生成redux的mapStateToProps数据
   * @param {IMapStateToProps} - params
   * @return IMapStateToPropsReturn
   */
  mapStateToProps(params: IMapStateToProps): IMapStateToPropsReturn;

  /**
   * mapDispatchToProps - 生成redux的mapDispatchToProps数据
   * @param {IMapDispatchToProps} - params
   * @return {IMapDispatchToPropsReturn}
   */
  mapDispatchToProps(params: IMapDispatchToProps): IMapDispatchToPropsReturn;

  /**
   * model - 生成模型
   * @param namespace
   */
  model(namespace: string): IModel;
}
