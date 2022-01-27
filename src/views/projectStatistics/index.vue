<template>
  <div class="projectStatistics_container">
    <keep-alive :include="cachedViews">
      <router-view :key="key"></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'projectStatistics',
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
.projectStatistics_container{
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
}
</style>
