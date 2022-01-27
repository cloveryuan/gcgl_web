import Vue from 'vue';
import Router from 'vue-router';
import Layout from '../views/layout/index';
import login from "@/views/login";

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)
export const constantRouterMap = [
  {
    path: "/login",
    name: "login",
    component: login,
  },
  {
    path: '/noper',
    meta: { title: '无权限', noCache: true },
    component: () => import('@/views/features/noper'),
    hidden: true
  },
  {
    path: "/marker",
    name: "marker",
    meta: { title: '定位', noCache: true },
    // http://localhost:8080/#/marker?position=120.15524,33.398513
    component: () => import("@/views/otherpage/transformLngLat"),
    hidden: true
  },
  {
    path: "/appMap",
    name: "appMap",
    meta: { title: '手机端的导航', noCache: true },
    // http://localhost:8080/#/appMap?position=120.15524,33.398513
    component: () => import("@/views/otherpage/appMap"),
    hidden: true
  },
  {
    path: "/photoSphere",
    name: "photoSphere",
    meta: { title: '手机端全景相机', noCache: true },
    // http://localhost:8080/#/photoSphere?img=https://gw.alicdn.com/tfs/TB1WSInRFXXXXXlXpXXXXXXXXXX-1200-600.jpg
    component: () => import("@/views/otherpage/photoSphere"),
    hidden: true
  },
  {
    path: "/3D",
    name: "3D",
    meta: { title: '全景相机', noCache: true },
    component: () => import("@/views/3D/index"),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/features/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/features/401'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/features/redirect')
      }
    ]
  }
]

const router = new Router({
  linkExactActiveClass: 'active',
  mode:'hash',
  // base:'/web/',//前缀,跟打包名称一致
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export default router