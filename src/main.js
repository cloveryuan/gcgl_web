import Vue from "vue";
import App from "./App";
// import router from "./router/indexs";
import router from "./router/routers";
import store from "./store";
import Storage from 'vue-ls';
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Viser from "viser-vue";
import config from '@/config/config.js';
import { pub } from "./ajax/pub";
import './router/index';
import "viewerjs/dist/viewer.css";
import Viewer from "v-viewer";
import "./assets/iconfont/iconfont.css"
import "./assets/style/public.scss"
import fn from '@/utils/ruoyi.js'
import componentsInstall from '@/components/index.js';
import './assets/icons'
import permission from './utils/permission'
import AFTableColumn from 'af-table-column'
import Fragment from 'vue-fragment'
import {getDictData} from '@/utils/tool.js'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

Vue.prototype.$pub = pub;
Vue.prototype.$fn = fn;
Vue.prototype.$dict = getDictData;

Vue.use(ElementUI);
Vue.use(Viser);
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 99999999
  }
})
Vue.use(Fragment.Plugin)

Vue.use(Storage, config.storageOptions)
Vue.use(componentsInstall)
Vue.use(permission)
Vue.use(AFTableColumn)
Vue.use(VXETable)
Vue.config.productionTip = false;

/* eslint-disable no-new */
window.vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
