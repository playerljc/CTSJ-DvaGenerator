import ServiceRegister from '@ctsj/dvagenerator';

export default Object.assign(ServiceRegister.model('todolist'), {
  state: {
    fetchList: [],
  },
  subscriptions: {
    setup({ history, dispatch }) {
      console.log('todolist', 'setup');
    },
  },
});

