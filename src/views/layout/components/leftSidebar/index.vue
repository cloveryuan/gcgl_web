<template>
  <div style="height:100%;">
    <div class="top">
      <router-link class="logo-box" to="/">
        <img src="../../../../assets/images/logo.png" alt="logo" />
      </router-link>
      <span class="title" v-if="!isCollapse">桑达电子</span>
    </div>
    <el-menu
      :collapse-transition="false"
      :collapse="isCollapse"
      :unique-opened="true"
      :default-active="activeMenu"
      :mode="mode"
      router
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      class="ver-menu"
    >
      <sidebar-item v-for="route in permission_routers" :key="route.path" :item="route" />
    </el-menu>
  </div>
</template>

<script>
import SidebarItem from '../Sidebar/SidebarItem.vue'
export default {
  name: 'left-bar',
  props: {
    isCollapse: {
      type: Boolean,
      default: false
    },
    permission_routers: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: '/'
    },
    variables: {
      type: Object,
      default: () => {
        return {
          menuBg: '#23b7bd',
          menuText: '#8ffffe',
          menuActiveText: '#fff'
        }
      }
    },
    mode: {
      type: String,
      default: 'horizontal'
    }
  },
  data () {
    return {

    }
  },
  computed: {

  },
  mounted() {

  },
  components: {
    SidebarItem
  },
  methods: {

  }
}
</script>
<style lang="scss">
.ver-wrapper{
  li{
    &:hover{
      .el-submenu__title{
        color:#fff!important;
      }
      color:#fff!important;
    }
  }
}
.isver.iscoll{
  li.is-active{
    .el-submenu__title{
      color:#fff!important;
    }
    color:#fff!important;
  }
}
</style>

<style scoped>

</style>
