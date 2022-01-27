import store from '@/store'
import Layout from '@/views/layout/index'
import Vue from 'vue'

// 防抖
export function _debounce(fn, delay) {
  var delay = delay || 200;
  var timer;
  return function () {
      var th = this;
      var args = arguments;
      if (timer) {
          clearTimeout(timer);
      }
      timer = setTimeout(function () {
          timer = null;
          fn.apply(th, args);
      }, delay);
  };
}
// 节流
export function _throttle(fn, interval) {
  var last;
  var timer;
  var interval = interval || 200;
  return function () {
      var th = this;
      var args = arguments;
      var now = +new Date();
      if (last && now - last < interval) {
          clearTimeout(timer);
          timer = setTimeout(function () {
              last = now;
              fn.apply(th, args);
          }, interval);
      } else {
          last = now;
          fn.apply(th, args);
      }
  }
}
/** 毫秒转换
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'undefined' || time === null || time === 'null') {
    return ''
  } else if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  // eslint-disable-next-line camelcase
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  // eslint-disable-next-line camelcase
  return time_str
}

export const downloadFile = (obj, name, suffix) => {
  const fileName = name + '-' + parseTime(new Date(),'{y}.{m}.{d} {h}:{i}:{s}')  +  '.' + suffix;
  // for ie 10+
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveOrOpenBlob(new Blob([obj]),fileName);
    return;
  }
  //google
  const url =  window.URL.createObjectURL(new Blob([obj]))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


export const filterAsyncRouter = (routers) => { // 遍历后台传来的路由字符串，转换为组件对象
  return routers.filter(router => {
    if (router.component) {
      if (router.component === 'Layout') { // Layout组件特殊处理
        router.component = Layout
      } else {
        const component = router.component
        router.component = loadView(component)
      }
    }
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children)
    }
    return true
  })
}

export const loadView = (view) => {
  return (resolve) => require([`@/views/${view}.vue`], resolve)
}

export const findUrlParams = (url)=> {
  const temp1 = url.split('?')
  const pram = temp1[1]
  const keyValue = pram.split('&')
  const obj = {}
  for (let i = 0; i < keyValue.length; i++) {
    var item = keyValue[i].split('=')
    var key = item[0]
    var value = item[1]
    obj[key] = value
  }
  return obj
}

export  const checkPermission = (value)=> {
  if (value && value instanceof Array && value.length > 0) {
    const buttons = store.getters && store.getters.buttons
    const permissionRoles = value

    const hasPermission = buttons.some(role => {
      return permissionRoles.includes(role)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need buttons! Like -hasPermi="['admin','editor']"`)
    return false
  }
}

export const newArr = (arr)=>{
  return arr.reduce((pre,cur) => Array.isArray(cur.children)?pre.concat(cur,this.newArr(cur.children)):pre.concat(cur),[]);
}

export const getDictData = async (_this,dict_label)=>{
  return await _this.$pub.post('/sys/dict/list-slt', { dict_label })
}

// a链接下载，加入鉴权的token
export const downFileA = (url,fileName) => {
  const token =  Vue.ls.get('userInfo')? Vue.ls.get('userInfo').token: '';
  const xhr = new XMLHttpRequest(); //定义http请求对象
  xhr.open("GET", url, true);
  xhr.setRequestHeader("token", token);
  xhr.send();
  xhr.responseType = "blob"; // 返回类型blob
  xhr.onload = function() {
    const blob = this.response;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.οnlοad=function (e) {
      // 转换完成，创建一个a标签用于下载
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = e.target.result;
      a.download= parseTime(new Date()) + '-' + fileName; //自定义下载文件名称
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a)
    }
  }
}