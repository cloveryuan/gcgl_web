<template>
  <fragment class="nav_wrap" v-if="item.hidden!==1 ">
    <el-submenu v-if="item.children&&hasChild(item)" ref="subMenu" :index="item.path" popper-append-to-body>
      <template slot="title">
        <svg-icon v-if="item.meta.icon" :icon-class="item.meta.icon" />
        <span  slot="title" class="titletext">{{item.meta.title}}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
      />
    </el-submenu>
    <el-menu-item v-else :index="item.path">
      <svg-icon v-if="item.meta.icon" :icon-class="item.meta.icon" />
      <span slot="title" class="titletext">{{item.meta.title}}</span>
    </el-menu-item>
  </fragment>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    hasChild(item) {
      const children = item.children
      if (children.length <= 0) return false
      const showingChildren = children.filter(f => f.hidden !== 1)
      if (showingChildren.length > 0) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<style lang="scss">
.navbar{
  .nav_wrap{
    border: 1px solid transparent;
    // &:hover{
    //   border-bottom-color:#fff;
    // }
    .el-submenu__icon-arrow{
      right:0;
      color: inherit;
    }
  }
  .titletext{
    margin-left:4px;
  }
}
.el-menu-item {
  padding: 0 12px !important;
}
.el-submenu__title{
  padding: 0 12px !important;
}
</style>
