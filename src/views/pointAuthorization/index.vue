<template>
  <div class="pointAuthorization">
    <el-form class="_top" size="small" ref="form" :model="form"  :inline="true">
      <el-form-item label="选择项目" prop="project">
        <el-select
          v-model="form.project"
          placeholder="请选择"
          filterable
          @change="handleProjectChange"
          style="width:150px;"
          value-key="id"
          >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.project_name?item.project_name:item.projectName"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="角色名称" prop="role_name">
        <el-input style="width:150px;" v-model="form.role_name"  placeholder="请输入角色名称"></el-input>
      </el-form-item>
      <el-form-item label="人员名称" prop="user_id">
        <el-select
          style="width:150px;"
          v-model="form.user_id"
          clearable
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
          value-key="user_id"
          :remote-method="user_remoteMethod"
          :loading="user_loading"
           @clear="handleQuery"
        >
          <el-option
            v-for="item in userList"
            :key="item.user_id"
            :label="item.user_name_dept"
            :value="item.user_id"
          >

          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width:150px;"  placeholder="请选择"  >
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="授权模式" prop="type">
        <el-select v-model="form.type" style="width:150px;"  placeholder="请选择"   clearable  @clear="handleQuery">
          <el-option
            v-for="item in typeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item style="float:right;">
        <el-button type="primary" size="mini"  @click="handleQuery">查询</el-button>
        <el-button  size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" size="mini" @click="handleAdd" v-if="form.project_id">新增</el-button>
       </el-form-item>
      <!-- <el-form-item style="float:right">
        <el-button type="primary" size="mini" @click="handleAdd" v-if="form.project_id">新增</el-button>
      </el-form-item> -->
    </el-form>
     <el-table :data="tableData" :height="tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="role_name" label="点位角色名称" min-width="120px"></el-table-column>
      <el-table-column  prop="type_name" label="授权模式" width="100px"></el-table-column>
      <el-table-column  prop="status" label="状态" width="80px">
        <template slot-scope="scope">
          <span>{{ (statusList.filter(m=>m.value===scope.row.status))[0].label }}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="desc" label="描述" min-width="120px"></el-table-column>
      <el-table-column  prop="create_user_name" label="操作人" width="150px"></el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-connection"
            @click="handleGrant(scope.row)"
          >授权</el-button>
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
    <el-drawer :title="title" :visible.sync="open" size="1100px"  append-to-body custom-class="addpointAu">
       <add-edit
        ref="addedit"
        v-if="open"
        :open.sync="open"
        :project="form.project_id"
        :project_code="form.project_code"
        :current="currentRow"
        :typeList="typeList"
        @handleQuery="handleQuery"></add-edit>
    </el-drawer>

    <!-- 授权 -->
    <el-drawer
      title="项目角色授权"
      :visible.sync="grantFlag"
      size="100%"
      :append-to-body="true"
      :destroy-on-close ="true"
      custom-class="rolegrantproject"
    >
      <grant-project
        v-if="grantFlag"
        :grantFlag.sync="grantFlag"
        @handleQuery="handleQuery"
        :project_id="form.project_id"
        :current="currentRow"
      ></grant-project>
    </el-drawer>
  </div>
</template>

<script>
import addEdit from './addEdit.vue'
import grantProject from './grantProject.vue'
import { checkPermission } from '@/utils/tool'
export default {
  name: 'pointAuthorization',
  data () {
    return {
      form: {
        project: null,
        project_code: '',
        project_id: '',
        role_name: '',
        status: -1,
        type: null,
        user_id: null
      },
      projectList: [],
      statusList: [
        { value: -1, label: '全部' }, { value: 0, label: '正常' }, { value: 1, label: '停用' }
      ],
      typeList: [
        { code: 1, name: '全部' }, { code: 2, name: '子系统' }, { code: 3, name: '自定义点位' }, { code: 4, name: '区域' }, { code: 5, name: '标签' }
        // 1全部 2子系统 3点位 4区域 5标签
      ],
      tableData: [],
      tableHeight: window.innerHeight - 210,
      tableLoading: false,
      currentRow: null,
      title: '点位授权',
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      open: false,
      grantFlag: false,
      user_loading: false,
      userList: []
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 210
    }
    this.getProjectsList()
  },
  components: {
    addEdit, grantProject
  },
  methods: {
    checkPermission,
    async getProjectsList() {
      const have = this.checkPermission(['pointAuthorization:project-slt'])
      const url = have ? '/project/list-slt' : '/project/project-list-by-user'
      const params = have ? { content: '' } : { user_id: this.$store.state.userInfo.id }
      const { data, message, code } = await this.$pub.post(url, params)
      if (Number(code) === 200 && data !== null) {
        this.projectList = data || []
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    async getList() {
      if (!this.form.project_id) {
        this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
        return
      }
      this.tableLoading = true
      const params = {
        ...this.page,
        ...this.form,
        type: this.form.type === '' ? null : this.form.type,
        user_id: this.form.user_id === '' ? null : this.form.user_id
      }
      const { code, data } = await this.$pub.post('/project/project-role-list', params)
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
    handleProjectChange(val) {
      this.form.project_code = val.project_code ? val.project_code : val.val.projectCode
      this.form.project_id = val.id
      this.handleQuery()
    },
    resetQuery() {
      this.$refs.form.resetFields()
      this.form.project_id = ''
      this.form.project_code = ''
      this.tableData = []
      // this.handleQuery()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    async user_remoteMethod(query) {
      if (query !== '') {
        this.user_loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.user_loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.userList = data.user_list
      } else {
        this.userList = []
      }
    },
    handleAdd() {
      this.currentRow = null
      this.open = true
    },
    handleUpdate(row) {
      this.currentRow = row
      this.open = true
    },
    handleGrant(row) {
      this.currentRow = row
      this.grantFlag = true
    },
    handleDelete(row) {
      const id = row.id
      const name = row.role_name
      this.$confirm('是否确认删除点位为"' + name + '"的数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('project/project-role-del', { id })
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
    }
  }
}
</script>

<style lang="scss">
.pointAuthorization{
  // padding:20px;
  height:100%;
  box-sizing: border-box;
  ._top{
    .el-form-item{
      margin-bottom: 10px;
    }
  }
}

</style>
