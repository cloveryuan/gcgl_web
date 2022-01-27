import Vue from 'vue';
import Vuex from 'vuex';
import { constantRouterMap } from '@/router/routers'
import tagsView from './modules/tagsView'
import { pub } from "../ajax/pub";

//持久化
import CreatePersistedState from 'vuex-persistedstate';
import config from '../config/config';
// const vuexLocal = new CreatePersistedState();

Vue.use(Vuex);
 
export default new Vuex.Store({
  state:{
    mobile:'',
    userInfo:{},
    project:{},
    // 权限，动态路由start 
    routers: constantRouterMap,
    buttons: [], // 功能权限
    token: '',
    menus: [],//导航栏菜单
    mode:config.mode
  },
  getters: {
    buttons: state => state.buttons
  },
  mutations:{
    setUserInfo(state,userInfo){
      state.userInfo = userInfo;
      Vue.ls.set('userInfo', userInfo, 1 * 24 * 60 * 60 * 1000)//有效期1天
    },
    setProject(state,project){
      state.project = project;
    },  
    // 权限，动态路由start 
    SET_ROUTERS: (state, asyncRouter) => {
      state.routers = constantRouterMap.concat(asyncRouter || [])
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus || []
    },
    SET_BUTTONS: (state, buttons) => {
      state.buttons = buttons
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_MODE: (state,mode)=>{
      state.mode = mode
    }
  },
  actions:{
    // 权限，动态路由start 
    GenerateRoutes ({ commit }, allRoutersAndRoles) {
      const {menus,asyncRouter} = allRoutersAndRoles
      commit('SET_ROUTERS', asyncRouter)
      commit('SET_MENUS', menus)
      // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
      if (allRoutersAndRoles.roles.length === 0) {
        commit('SET_BUTTONS', ['ROLE_SYSTEM_DEFAULT']);
      } else {
        commit('SET_BUTTONS', allRoutersAndRoles.roles);
      }
    },
    // 登出
    async Logout ({ dispatch,commit }) {
      return new Promise((resolve,reject) => {
        pub.post('/sys/login-out').then(()=>{
          logOut(commit, dispatch)
          resolve()
        }).catch(error => {
          logOut(commit, dispatch)
          reject(error)
        })
      })
    }
  },
  modules: {
    tagsView
  }
  // plugins:[vuexLocal]
})
const logOut = (commit, dispatch)=>{
  commit('SET_TOKEN', '');
  commit('SET_BUTTONS', []);
  commit("setUserInfo", {});
  commit("SET_ROUTERS", []);
  dispatch('tagsView/delAllViews',{},{ root: true })
  // Vue.ls.remove('userInfo')
}