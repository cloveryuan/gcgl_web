<!-- 施工队物料使用统计 -->
<template>
  <div style="padding:0px 20px;">
   <el-form size="small" label-position="left"  :inline="true">
      <el-form-item label="项目" style="margin-right:10px;">
        <el-select
          v-model="form.project"
          placeholder="请选择"
          value-key="id"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.projectName"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="施工单位" >
        <el-select
          v-model="form.builder_dept_id"
          clearable
          collapse-tags
          placeholder="默认施工单位"
          multiple
        >
          <el-option
            v-for="item in BuilderList"
            :key="item.id"
            :label="item.name"
            :value="item.id + ''"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="getList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      v-loading="tableLoading"
      border
      :height="tableHeight">
      <el-table-column
        align="center"
        prop="device_name"
        label="物料名称"
        min-width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="out_nums"
        label="领货数量"
        min-width="80">
      </el-table-column>
      <el-table-column
        align="center"
        prop="install_nums"
        label="安装数量"
        min-width="80">
      </el-table-column>
      <el-table-column
        align="center"
        prop="sync_nums"
        label="联网数量"
        min-width="80">
      </el-table-column>
      <el-table-column
        align="center"
        prop="screen_mums"
        label="合格数量"
        min-width="80">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'material_statis',
  props: ['projectList', 'project'],
  data () {
    return {
      BuilderList: [],
      form: {
        project: null,
        builder_dept_id: null
      },
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 145
    }
  },
  computed: {
    project_code() {
      return this.form.project ? this.form.project.projectCode : null
    }
  },
  mounted() {
    this.form.project = this.project
    this.getBuilderList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 145
    }
  },
  components: {

  },
  methods: {
    handleProjectChange() {
      Object.assign(this.form, { builder_dept_id: null })
      this.BuilderList = []
      this.getBuilderList()
    },
    // 获取施工队列表
    async getBuilderList() {
      if (this.project_code === null) {
        return
      }
      const req = {
        project_code: this.project_code
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (result.code === 200) {
        if (result.data !== null) {
          this.BuilderList = result.data
        }
      } else {
        this.BuilderList = []
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
    },
    async getList() {
      this.tableData = []
      this.tableLoading = true
      const req = {
        project_code: this.project_code,
        dept_id: this.form.builder_dept_id ? this.form.builder_dept_id : []
        // user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/point/device/statis-data', req)
      if (code === 200) {
        this.tableData = data.list || []
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message || '查询失败'
        })
      }
      this.tableLoading = false
    }
  }
}
</script>

<style scoped>

</style>
