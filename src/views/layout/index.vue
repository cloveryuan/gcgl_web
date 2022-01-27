<template>
  <div class="main-wrapper" :class="{'isver':mode==='vertical','iscoll':isCollapse}">
    <div class="ver-wrapper"  v-if="mode==='vertical'" >
      <left-side-bar
        :mode="mode"
        :permission_routers="permission_routers"
        :activeMenu="activeMenu"
        :variables="variables"
        :isCollapse="isCollapse"
        :title="title"
      ></left-side-bar>
    </div>
    <div class="hor-wrapper">
      <sidebar
        :mode="mode"
        :permission_routers="permission_routers"
        :activeMenu="activeMenu"
        :variables="variables"
        :isCollapse="isCollapse"
        @changeCollapse="changeCollapse"
        :title="title"
      />
      <app-main />
    </div>
  </div>
</template>

<script>
import { AppMain, Sidebar } from './components'
import leftSideBar from './components/leftSidebar'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Sidebar,
    leftSideBar
  },
  data() {
    return {
      isCollapse: false,
      screenWidth: 1920,
      title: '桑达公共安全视频监控类工程管理系统'
    }
  },
  watch: {
    screenWidth(val) {
      if (val >= 1920) {
        this.title = '桑达公共安全视频监控类工程管理系统'
      } else {
        this.title = '桑达工程管理系统'
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    key() {
      return this.$route.name !== undefined
        ? this.$route.name + +new Date()
        : this.$route + +new Date()
    },
    mode() {
      return this.$store.state.mode
    },
    permission_routers() {
      return this.$store.state.menus
    },
    activeMenu() {
      const route = this.$route
      const { path } = route
      return path
    },
    variables() {
      return {
        // menuBg: this.mode === 'horizontal' ? '#23b7bd' : '#FAFAFA',
        // menuText: this.mode === 'horizontal' ? '#8ffffe' : 'rgba(0, 0, 0, 0.85)',
        // menuActiveText: this.mode === 'horizontal' ? '#fff' : '#23b7bd'

        menuBg: this.mode === 'horizontal' ? '#23b7bd' : '#001529',
        menuText: this.mode === 'horizontal' ? '#8ffffe' : 'rgba(255, 255, 255, 0.65)',
        menuActiveText: this.mode === 'horizontal' ? '#fff' : '#fff'
      }
    }
  },
  mounted() {
    this.screenWidth = document.body.clientWidth
    window.onresize = () => {
      this.screenWidth = document.body.clientWidth
    }
  },
  methods: {
    changeCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="scss" >
  .main-wrapper.isver.iscoll{
    .hor-wrapper{
      width:calc(100% - 64px);
    }
    .ver-wrapper{
      width:64px;
      .nav_wrap{
        li{
          svg{
            height:18px;
            width:18px;
          }
          .titletext,.el-submenu__icon-arrow{
            // display: none;
          }
        }
      }
    }
  }
  .main-wrapper.isver{
     .hor-wrapper{
      width:calc(100% - 208px);
      position: relative;
      .main_header{
        background:#fff;
        color:#000;
        box-shadow: 0 0 4px rgba(0, 0 ,0, 0.2);
        li{
          color:#000;
          .topic{
            color:#000;
          }
        }
      }
    }
    .ver-wrapper{
      width:208px;
      .titletext{
        margin-left:6px;
      }
    }
  }

  .main-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    background:#fff;
    display: flex;
    overflow: auto;
    .hor-wrapper{
      height: 100%;
      // min-width: 1300px;
      width: 100%;
      overflow: auto;
      background:#fff;
      display: flex;
      flex-direction: column;
    }
  }
  .isver{
    .ver-wrapper{
      display:flex;
      flex-direction: column;
      // background:#FAFAFA;
      background:#001529;
    }
    .top{
      // background:#23b7bd;
      background:#002140;
      height:60px;
      line-height: 60px;
      color:#fff;
      img{
        display: inline-block;
        vertical-align: middle;
        padding-left:20px;
      }
      span{
        font-size: 18px;
        margin: 0 0 0 8px;
      }
    }
    .ver-menu{
      height:calc(100% - 80px);
      border-right:none;
      overflow-y: auto;
    }

    .container_content{
      height: calc(100% - 60px);
      width:100%;
      display:flex;
      flex-direction: row;
    }
  }
  .navbar .el-submenu__title i{
    color: rgb(143, 255, 254);
  }
</style>
