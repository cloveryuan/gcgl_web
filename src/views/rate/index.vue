<template>
  <div class="rate_container">
    <keep-alive :include="cachedViews">
      <router-view :key="key"></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'rate',
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
.rate_container{
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  .pointNum:hover {
    color: #fff;
    background: #409eff;
  }
  .pointNum {
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    cursor: pointer;
    opacity: 0.9;
  }
  .normalpot{
    display: inline-block;
    border-radius: 10px;
    padding: 5px 20px;
    opacity: 0.9;
  }
   .wrap.isColl{
    ._left{
      width:10px;
      overflow: hidden;
      .el-form{
        opacity: 0;
        margin-top:40px;
      }
    }
    ._right{
      width:calc(100% - 30px);
    }
  }
   .wrap{
     position: relative;
    .changeIcon{
      position: absolute;
      top:50%;
      left:285px;
      cursor:pointer;
      font-size:40px;
      color: #999;
    }
    .el-icon-caret-right{
      top:50%;
      left:-5px;
    }
  }
}
</style>
