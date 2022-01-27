import router from './routers'
import Vue from 'vue'
import store from '@/store'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { filterAsyncRouter } from "@/utils/tool";
import { pub } from "../ajax/pub.js";
NProgress.configure({ showSpinner: false });

let loadMenu = false;
let is404 = false
const whiteList = ['/login', '/noper', '/photoSphere', '/appMap'];
const menus = store.state.menus
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  };
  NProgress.start()
  const userInfo =  Vue.ls.get('userInfo') 
  // || store.state.userInfo
  if (userInfo && userInfo.token!==undefined) {
    /* has token */
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (to.path === '/noper') {
      next()
      NProgress.done()
    } else {
      store.commit('setUserInfo', userInfo);
      if (store.getters.buttons.length === 0 || !loadMenu) {
        // 判断当前用户是否已拉取完菜单信息
        // 动态路由，拉取菜单
        loadMenus(next, to)
      } else {
        if(to.path === '/404' && !is404){
          const _path = goToLink()
          console.log(_path,'/404')
          is404 = true
          next({path:_path})
        }else{
          next()
        }
      }
      NProgress.done()
    }
  } else {
    loadMenu = false
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.fullPath } })
      NProgress.done()
    }
  }
})


/**
 * 初始化
 * @param {*} next
 * @param {*} to
 */
export const loadMenus = async (next, to) => {
  try{
    const parent = {
      path: "/",
      name: "",
      component: 'layout/index',
      redirect: "/points",
      children: []
    }
    const user_id = Vue.ls.get('userInfo')? Vue.ls.get('userInfo').id:''
    const {data} = await pub.post('/sys/user/manage/getRoleMenuByUserId',{user_id,is_app:0})

    if (data.menus.filter(f=>f.hidden!==1).length <= 0 ) {
      router.push('/noper');
      return
    };
    parent.children = data.menus
    parent.redirect = data.menus[0].path
  
    const tempArr = JSON.parse(JSON.stringify([parent]));
    const asyncRouter = filterAsyncRouter(tempArr);
    asyncRouter.push({ path: '*', redirect: '/404', hidden: 1 });
    const allRoutersAndRoles = {
      asyncRouter, //动态路由
      menus:data.menus,//导航栏菜单
      roles:data.roles // 按钮权限
    }
    store.dispatch('GenerateRoutes', allRoutersAndRoles).then(() => {
      // 存储路由
      loadMenu = true;
      router.addRoutes(asyncRouter) // 动态添加可访问路由表
      next({ ...to, replace: true })
    })
  }catch(err){
    // window.vm.$notify({
    //   type: "warning",
    //   message: "获取权限菜单报错，请重新登录获取新的token",
    //   duration: 2000
    // });
    store.dispatch('Logout').then(() => {
      location.reload() // 为了重新实例化vue-router对象 避免bug
    })
  }
};


const goToLink = () => {
  let result = ''
  if (store.state.menus.length > 0) {
    const _path = store.state.menus[0]
    if (_path.children && _path.children.length > 0) {
      result = _path.children[0].path
    } else {
      result = _path.path
    }
  } else {
    result = '/noper'
  }
  return result
}

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

