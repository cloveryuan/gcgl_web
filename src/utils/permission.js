import store from '@/store'

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

const permission = {
  inserted (el, binding, vnode) {
    const { value } = binding
    const buttons = store.getters && store.getters.buttons
    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value
      let hasPermission = null
      if(buttons.includes('admin')) {
        hasPermission=true
      }else{
        hasPermission = buttons.some(role => {
          return permissionRoles.includes(role)
        })
      }

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('使用方式： v-hasPermi="[\'admin\',\'editor\']"')
    }
  }
}

const install = function (Vue) {
  Vue.directive('hasPermi', permission)
}

if (window.Vue) {
  window.permission = permission
  Vue.use(install) // eslint-disable-line
}

permission.install = install
export default permission
