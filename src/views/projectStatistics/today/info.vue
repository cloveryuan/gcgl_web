<template>
  <div class="project_today" >
    <el-table
      :height="tableHeight"
      :data="tableData"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '4px 0' }"
      v-loading="tableLoading"
    >
      <el-table-column  show-overflow-tooltip prop="dept_name" label="施工队名称" min-width="250" ></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_002" label="今日基坑浇注数量" min-width="150" align="center"></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_004" label="今日立杆数量" min-width="150" align="center"></el-table-column>
      <el-table-column  show-overflow-tooltip prop="cls_009" label="今日相机安装数量" min-width="170" align="center"></el-table-column>
      <el-table-column  show-overflow-tooltip prop="debug_count" label="今日相机调试数量" min-width="170" align="center"></el-table-column>
      <!-- <el-table-column  show-overflow-tooltip prop="online_count" label="完工移交相机数量" min-width="170" align="center"></el-table-column> -->
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'project_today',
  props: {
    project: {
      required: true,
      default: ''
    }
  },
  data () {
    return {
      tableHeight: window.innerHeight - 100,
      tableData: [],
      tableLoading: false
    }
  },
  created () {
    this.getTableData()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 100
    }
  },
  methods: {
    async getTableData() {
      this.tableLoading = true
      const { data, code } = await this.$pub.post('rate/project_survey_dept_today', { project_code: this.project.project_code })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取项目概况(施工单位) 当天',
          showClose: true

        })
      }
      this.tableData = data || {}
      this.tableLoading = false
    }
  }
}
</script>

<style lang="scss">
.project_today{
  height:100%;
  .el-table__header-wrapper{
    font-size:16px;
  }
  .el-table__header{
    th{
      color:#000;
      border-top: 1px solid #EBEEF5;
    }

  }
}
</style>
