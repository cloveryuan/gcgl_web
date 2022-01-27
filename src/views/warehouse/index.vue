<template>
  <div class="ware_wrap">
    <keep-alive :include="cachedViews">
      <router-view :key="key"></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'warehouse',
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
<style>
.ware_wrap{
  height:100%;
  padding:20px 20px 0;
  box-sizing: border-box;
}
</style>
