<template>
  <div class="projectManagement">
    <el-form class="_top" ref="form" :model="form" size="small" :inline="true">
      <el-form-item label="项目名称" prop="project_name">
        <el-input v-model="form.project_name"  placeholder="请输入项目名称"></el-input>
      </el-form-item>
      <el-form-item label="项目编号" prop="project_code">
        <el-input v-model="form.project_code"  placeholder="请输入项目编号"></el-input>
      </el-form-item>
      <el-form-item label="招标项目编码" prop="biding_project_code">
        <el-input v-model="form.biding_project_code"  placeholder="请输入招标项目编码"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status"  placeholder="请选择" clearable  @change="handleQuery">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item >
        <el-button type="primary" size="mini" @click="handleQuery">查询</el-button>
        <el-button  size="mini" @click="resetQuery">重置</el-button>
       </el-form-item>

        <el-form-item style="float:right">
           <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
        </el-form-item>
    </el-form>
     <el-table :data="tableData" :height="tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="project_code" label="项目编码" min-width="120px"></el-table-column>
      <el-table-column  prop="project_name" label="项目名称" min-width="220px"></el-table-column>
      <el-table-column  prop="biding_project_code" label="招标项目编码" min-width="220px"></el-table-column>
      <!-- <el-table-column  prop="create_user_name" label="项目负责人" width="120px"></el-table-column> -->
      <el-table-column  prop="city_name" label="所在城市" align="center" width="150px"></el-table-column>
       <el-table-column  prop="build_unit" label="建设单位" min-width="220px"></el-table-column>
      <el-table-column  prop="status_name" label="状态" width="80px" align="center"></el-table-column>
      <el-table-column label="操作" width="230px" align="center">
        <template slot-scope="scope">
          <el-dropdown @command="handleCommand" style="margin-right:10px;" trigger="click">
            <span class="cursor"><i class="el-icon-setting"></i>维护</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'child')">子系统维护</el-dropdown-item>
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'stage')">工程阶段维护</el-dropdown-item>
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'company')">厂商平台维护</el-dropdown-item>
              <el-dropdown-item v-hasPermi="['projectManagement:proc']" :command="beforeHandleCommand(scope.row,'procM')">工序物料维护</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div  style="display:flex;justify-content:space-between;">
      <span  style="color:#999;font-size:14px;">共 {{total}} 条记录</span>
      <el-pagination
        layout="prev, pager, next,sizes"
        :total="total"
        :page-size.sync="page.page_size"
        @current-change="pageChange"
        @size-change="sizeChange"
        :current-page.sync="page.page_no"
        class="pagination"
        small
        background
      >
      </el-pagination>
    </div>

    <!-- 添加或修改配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
       <add-edit
        ref="addedit"
        v-if="open"
        :open.sync="open"
        :current="currentRow"
        :statusList="statusList"
        @handleQuery="handleQuery"></add-edit>
    </el-dialog>

    <!-- 子系统维护 -->
    <el-dialog
      :visible.sync="childFlag"
      :footer="false"
      width="800px"
      title="子系统维护"
      :close-on-click-modal="false"
    >
     <child-setting :current="currentRow" v-if="childFlag" ></child-setting>
    </el-dialog>

    <!-- 工程阶段维护 -->
    <el-drawer
      title="工程阶段维护"
      :visible.sync="stageFlag"
      :append-to-body="true"
      custom-class="stage_wrap"
      size="75%"
      :destroy-on-close ="true"
    >
     <stage-setting :stageFlag.sync="stageFlag"  :project_code="currentRow.project_code" :project_id="currentRow.id" v-if="stageFlag" ></stage-setting>
    </el-drawer>

    <!-- 厂商平台维护 -->
    <el-drawer
      title="厂商平台维护"
      :visible.sync="companyFlag"
      :append-to-body="true"
      custom-class="company_wrap"
      size="80%"
      :destroy-on-close ="true"
    >
     <company-setting :companyFlag.sync="companyFlag"  :project_code="currentRow.project_code" :project_id="currentRow.id" v-if="companyFlag" ></company-setting>
    </el-drawer>

    <!-- 工序物料维护 -->
    <el-drawer
      title="工序物料维护"
      :visible.sync="procMFlag"
      :append-to-body="true"
      custom-class="procm_wrap"
      size="90%"
      :destroy-on-close ="true"
    >
     <procm-setting :procMFlag.sync="procMFlag"  :project_code="currentRow.project_code" :project_id="currentRow.id" v-if="procMFlag" ></procm-setting>
    </el-drawer>

  </div>
</template>

<script>
import addEdit from './addEdit.vue'
import childSetting from './childSetting.vue'
import stageSetting from './stageSetting.vue'
import companySetting from './companySetting.vue'
import procmSetting from './procmSetting.vue'
export default {
  name: 'projectManagement',
  data () {
    return {
      form: {
        project_code: '',
        project_name: '',
        status: '',
        biding_project_code: ''
      },
      statusList: [],
      tableData: [],
      tableHeight: window.innerHeight - 210,
      tableLoading: false,
      currentRow: null,
      title: '新增',
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      open: false,
      childFlag: false,
      stageFlag: false,
      companyFlag: false,
      procMFlag: false
    }
  },
  created() {
    this.getStatus()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 210
    }
    this.handleQuery()
  },
  components: {
    addEdit, childSetting, stageSetting, companySetting, procmSetting
  },
  methods: {
    async getStatus() { // 状态字典为1
      const { code, data } = await this.$pub.post('/sys/dict/list-slt', { dict_label: 'project_status' })
      if (code === 200) {
        this.statusList = data || []
      } else {
        this.$message({
          type: 'error',
          message: '查询状态列表失败',
          showClose: true
        })
      }
    },
    async getList() {
      this.tableLoading = true
      const params = {
        ...this.page,
        ...this.form,
        status: this.form.status ? Number(this.form.status) : 0
      }
      const { code, data } = await this.$pub.post('/project/list', params)
      if (code === 200) {
        this.tableData = data.list || []
        this.total = data.total
      } else {
        this.$message({
          type: 'error',
          message: '查询失败',
          showClose: true
        })
      }
      this.tableLoading = false
    },
    handleQuery () {
      this.page.page_no = 1
      this.getList()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    resetQuery() {
      this.$refs.form.resetFields()
      this.handleQuery()
    },
    handleAdd() {
      this.title = '新增'
      this.currentRow = null
      this.open = true
    },
    handleUpdate(row) {
      this.title = '修改'
      this.currentRow = row
      this.open = true
    },
    handleDelete(row) {
      const id = row.id
      const name = row.project_name
      this.$confirm('是否确认删除项目为"' + name + '"的数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/project/del', { id })
        if (code === 200) {
          this.handleQuery()
          this.$message({
            type: 'success',
            message: '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(function () {})
    },
    handleChildSetting() {
      this.childFlag = true
    },
    handleStageSetting() {
      this.stageFlag = true
    },
    handleCompanySetting() {
      this.companyFlag = true
    },
    handleClassSetting() {
      this.classFlag = true
    },
    handleProMSetting() {
      this.procMFlag = true
    },
    beforeHandleCommand(row, command) {
      return {
        row: row,
        command: command
      }
    },
    handleCommand(command) {
      this.currentRow = command.row
      if (command.command === 'child') {
        this.handleChildSetting()
      } else if (command.command === 'stage') {
        this.handleStageSetting()
      } else if (command.command === 'company') {
        this.handleCompanySetting()
      } else if (command.command === 'procM') {
        this.handleProMSetting()
      }
    }
  }
}
</script>

<style lang="scss">
.projectManagement{
  // padding:20px;
  height:100%;
  box-sizing: border-box;
  ._top{
    .el-form-item{
      margin-bottom: 10px;
    }
  }
  .cursor{
    cursor:pointer;
    color:#409EFF;
    .el-icon-setting{
      margin-right:4px;
    }
  }
}
.stage_wrap,.procm_wrap{
  padding: 0 20px 20px;
}

</style>
