<template>
  <div class="camera_num">
     <div class="_top">
      <div class="module">
        <span class="line"></span>
        <span>通道数修改</span>
      </div>
    </div>
    <div class="content">
      <p>
        <span class="tit">类型名称</span>
        <span class="num">{{device_name}}</span>
      </p>
      <p>
        <span class="tit">原通道数</span>
        <span class="num">{{currentCameraNum}}</span>
      </p>
      <p>
        <span class="tit">修改数量</span>
        <el-input-number v-model="camera_num" size="small" style="width:200px;"  :min="0" :max="64" ></el-input-number>
      </p>
    </div>
    <div style="text-align: right;">
     <el-button size="mini"   type="primary" @click="save" :loading="saveloading">保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'camera_num',
  props: {
    device_name: {
      required: true
    },
    device_id: {
      required: true
    },
    currentCameraNum: {
      required: true
    }
  },
  data () {
    return {
      camera_num: 0,
      saveloading: false
    }
  },
  mounted() {

  },
  components: {

  },
  methods: {
    async save() {
      this.saveloading = true
      const { code } = await this.$pub.post('/device/manage/edit-num',
        {
          camera_num: this.camera_num + '',
          id: this.device_id
        }
      )
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '修改成功',
          showClose: true
        })
        this.$emit('toQuery')
        this.$emit('update:visible', false)
      } else {
        this.$message({
          type: 'error',
          message: '修改失败',
          showClose: true
        })
      }
      this.saveloading = false
    }
  }
}
</script>

<style scoped lang="scss">
.camera_num{
  margin-top: -30px;
  ._top{
    display: flex;
    justify-content: space-between;
    margin:10px 0;
    .module{
      .line{
        display: inline-block;
        width: 3px;
        height:14px;
        background:#4DD2D2;
      }
      span{
        vertical-align: middle;
        font-size:16px;
        margin-left:6px;
      }
    }
  }
  .content{
    >p{
      margin:20px 0;
    }
    .tit{
      font-weight:700;
      margin:0 10px ;
    }
    .num{
      text-decoration: underline;
    }
  }
}
</style>
