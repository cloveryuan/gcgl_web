<template>
  <div class="setting_wrap">
     <keep-alive :include="cachedViews">
      <router-view :key="key"></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'manager',
  computed: {
    key() {
      return this.$route.path
    },
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
  }
}
</script>

<style lang="scss">
.setting_wrap{
  width:100%;
  height:100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>
