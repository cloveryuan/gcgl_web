<template>
  <div class="area_contain">
    <div class="_top">
      <span style="display: block;width: 110px;">区域：</span>
      <el-radio-group v-model="area">
        <el-radio style="margin-bottom:10px;" :label="area" v-for="area in areaList" :key="area"></el-radio>
      </el-radio-group>
    </div>
    <div class="_bottom" v-hasPermi="['points:areaAdd']">
      <span style="display: block;width: 100px;">其他区域：</span>
      <el-input size="medium" v-model="addArea" placeholder="请输入需要添加的区域"></el-input>
    </div>
    <div style="text-align:center;" v-hasPermi="['points:areaEdit']">
      <el-button type="primary" style="width:100%" @click="sure" v-loading="sureLoading">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'area_container',
  props: {
    pointInfo: {
      required: true
    },
    areaList: {
      default: []
    },
    project_code: {
      required: true
    }
  },
  data () {
    return {
      addArea: '',
      sureLoading: false,
      area: this.pointInfo.area
    }
  },
  methods: {
    async sure() {
      this.sureLoading = true
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code,
        point_id: Number(this.pointInfo.point_id),
        area_name: this.addArea ? this.addArea : this.area
      }
      const { code } = await this.$pub.post('/point/manage/area-edit', params)
      this.sureLoading = false
      if (code === 200) {
        this.sureLoading = false
        this.addArea = ''
        this.$message.success('修改成功')
        this.$emit('changeshowArea')
      } else {
        this.sureLoading = false
        this.$message.error('修改失败')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.area_contain{
 ._top,._bottom{
  display: flex;
  justify-content: flex-start;
 }
 ._bottom{
   margin:30px 0 40px;
 }
}
</style>
