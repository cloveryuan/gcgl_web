<template>
  <div class="app-main">
    <!-- v-if="mode" -->
    <tags-view   />
    <div class="clover-main">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <router-view :key="key"></router-view>
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
import tagsView from './TagsView'
export default {
  name: 'AppMain',
  data() {
    return {

    }
  },
  components: { tagsView },
  computed: {
    key() {
      return this.$route.path
    },
    mode() {
      return this.$store.state.mode === 'vertical'
    },
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
.main-wrapper{
 .app-main{
    height: calc(100% - 64px);
    width:100%;
    // margin-top: 4px;
    .clover-main{
      height: calc(100% - 35px);
      width:100%;
      margin-top: 4px;
    }
  }
}
</style>
