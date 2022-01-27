<template>
  <div class="project_info_area" >
    <el-descriptions :column="2" border v-loading="loading">
      <el-descriptions-item label="点位设计数量" :span="2"><span>{{infos.point_count}}</span></el-descriptions-item>
      <el-descriptions-item label="基坑设计数量"><span>{{infos.pit_design_count}}</span></el-descriptions-item>
      <el-descriptions-item label="基坑浇筑数量"><span>{{infos.pit_install_count}}</span></el-descriptions-item>
      <el-descriptions-item label="杆件设计数量"><span>{{infos.rod_design_count}}</span></el-descriptions-item>
      <el-descriptions-item label="立杆完成数量"><span>{{infos.rod_install_count}}</span></el-descriptions-item>
      <el-descriptions-item label="相机设计数量"><span>{{infos.camera_design_count}}</span></el-descriptions-item>
      <el-descriptions-item label="相机安装完成数量"><span>{{infos.camera_install_count}}</span></el-descriptions-item>
      <el-descriptions-item label="完工移交相机数量" :span="2"><span>{{infos.finish_device_count}}</span></el-descriptions-item>
    </el-descriptions>

    <el-table
      :height="tableHeight"
      :data="tableData"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '4px 0' }"
      v-loading="tableLoading"
    >
      <el-table-column  show-overflow-tooltip prop="dept_name" label="施工队名称" min-width="250" ></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_002" label="基坑浇注数量" min-width="150" align="center" ></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_004" label="立杆完成数量" min-width="150" align="center" ></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_009" label="相机安装完成数量" min-width="170" align="center" ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'project_i',
  props: {
    project: {
      required: true,
      default: ''
    }
  },
  data () {
    return {
      loading: false,
      infos: [],
      tableHeight: window.innerHeight - 450,
      tableData: [],
      tableLoading: false
    }
  },
  created () {
    this.getData()
    this.getTableData()
  },
  mounted() {
    window.onresize = () => {
      const _el = document.getElementsByClassName('project_info_area')
      if (_el[0]) {
        const _header = _el[0].getElementsByClassName('el-descriptions')
        const top_height = _header[0].offsetHeight
        const _height = window.innerHeight
        this.tableHeight = _height - 170 - top_height
      }
    }
  },
  methods: {
    async getData() {
      this.loading = true
      const { data, code } = await this.$pub.post('rate/project_survey_info', { project_code: this.project.project_code })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取项目概况出错了',
          showClose: true

        })
      }
      this.infos = data || {}
      this.loading = false
    },
    async getTableData() {
      this.tableLoading = true
      const { data, code } = await this.$pub.post('rate/project_survey_dept', { project_code: this.project.project_code })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取施工队概况出错了',
          showClose: true

        })
      }
      this.tableData = data || {}
      this.$nextTick(() => {
        const _el = document.getElementsByClassName('project_info_area')
        if (_el[0]) {
          const _header = _el[0].getElementsByClassName('el-descriptions')
          const top_height = _header[0].offsetHeight
          const _height = window.innerHeight
          this.tableHeight = _height - 170 - top_height
        }
      })
      this.tableLoading = false
    }
  }
}
</script>

<style lang="scss">
.project_info_area{
  height:100%;
  .el-table__header-wrapper{
    font-size:16px;
  }
  .el-descriptions{
    font-size:16px;
    margin-bottom:40px;
  }
  .el-descriptions-item__content{
    span{
      font-size:18px;
      font-weight: 550;
    }
  }
  .el-descriptions .is-bordered .el-descriptions-item__cell{
    padding: 5px 10px;
  }
  .el-table__header{
    th{
      color:#000;
      border-top: 1px solid #EBEEF5;
    }

  }
}
</style>
