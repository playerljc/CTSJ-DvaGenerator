
// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  routes: [
    {
      path: '/',
      component: '../pages/App/app.jsx'
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: false,
      dva: {
        hmr: true,
      },
      dynamicImport: false,
      title: 'demo',
      dll: false,

      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
}
