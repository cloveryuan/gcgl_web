<template>
  <div class="person_wrap">
    <div :gutter="20" class="wrap">
      <!--部门数据-->
      <div class="_left">
        <div class="head-container">
          <el-input
            v-model="org_team"
            placeholder="输入部门名称"
            clearable
            size="small"
            style="margin-bottom: 20px"
            @clear="getdeptsList"
          >
          <el-button slot="append"   icon="el-icon-search" @click="getdeptsList"></el-button>
          </el-input>
        </div>
        <div class="clover_tree" v-loading="deptsLoading">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            node-key="id"
            ref="tree"
            :default-expanded-keys="defaultExpandkey"
          >
            <span class="el-tree-node__content" slot-scope="{ node, data }" @click="selectOrg(data,node)">
              <span class="el-tree-node__label" :style="{fontSize:'14px',color: data.id ===queryParams.org_id?'#409EFF':''}" >{{ data.jc?data.jc:data.mc }}</span>
            </span>
          </el-tree>
        </div>
      </div>
      <!--用户数据-->
      <div class="_right">
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" >
          <el-form-item label="关键字" prop="user_name">
            <el-input
              v-model="queryParams.user_name"
              placeholder="请输入用户账号或姓名"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
              @clear="handleQuery"
            />
          </el-form-item>
          <el-form-item label="角色" >
            <el-select
              v-model="queryParams.role_id"
              placeholder="用户角色"
              clearable
              size="small"
              style="width: 240px"
              @clear="handleQuery"
              filterable
            >
              <el-option
                v-for="dict in rolesOptions"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"  icon="el-icon-search" size="mini" @click="handleQuery" >搜索</el-button >
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery" >重置</el-button >
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" >新增</el-button >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete(selectAll)" v-hasPermi="['system/auth/deleteAdmin']" >删除</el-button  >
          </el-col> -->
        </el-row>

        <el-table  v-loading="loading"  :height="tableHeight" :data="userList"  row-key="user_id" >
          <el-table-column label="用户账号" align="left" width="120" prop="user_account" :show-overflow-tooltip="true"  />
          <el-table-column label="用户昵称" align="left" width="120"  prop="user_name" :show-overflow-tooltip="true" />
          <el-table-column label="组织团队" align="left" width="200" prop="dept_name" :show-overflow-tooltip="true" />
          <el-table-column label="角色" align="left" prop="role_name" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="left" prop="mobile" width="120"  />
          <el-table-column prop="status" label="状态"  width="80">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-color="#409EFF"
                inactive-color="#F56C6C"
                :active-value="1"
                :inactive-value="0"
                @change="changeStatus(scope.row, scope.row.status)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" >
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"  >修改</el-button >
              <el-button v-if="scope.row.id !== 1" size="mini" type="text" icon="el-icon-delete" @click="handleDelete([scope.row])" >删除</el-button >
              <el-button size="mini"  type="text" icon="el-icon-key"  @click="handleResetPwd([scope.row])" >重置</el-button >
            </template>
          </el-table-column>
        </el-table>
        <div style="display:flex;justify-content:space-between;">
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
      </div>
    </div>
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <add-edit
        v-if="open"
        :currentDept="currentDept"
        :open.sync="open"
        :statusOptions="statusOptions"
        :current="current"
        @handleQuery="handleQuery"></add-edit>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-checkbox
            v-model="upload.updateSupport"
          />是否更新已经存在的用户数据
          <el-link type="info" style="font-size:12px" @click="importTemplate"
            >下载模板</el-link
          >
        </div>
        <div class="el-upload__tip" style="color:red" slot="tip">
          提示：仅允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import addEdit from './addEdit.vue'
export default {
  name: 'managerPerson',
  data () {
    return {
      loading: false,
      // 用户状态数据字典
      statusOptions: {
        1: {
          dict_label: '启用',
          dict_value: '1'
        },
        0: {
          dict_label: '停用',
          dict_value: '0'
        }
      },
      // 组织团队树选项
      deptOptions: [],
      deptsLoading: false,
      // 弹出层标题
      title: '添加用户',
      // 是否显示弹出层
      open: false,
      // 用户表格数据
      userList: [],
      org_team: undefined,
      defaultProps: {
        children: 'child',
        label: 'mc',
        id: 'id'
      },
      defaultExpandkey: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0
        // 设置上传的请求头部
        // headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        // url: config.ImageUrl + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        user_name: undefined,
        role_id: undefined,
        org_id: undefined
      },
      currentDept: null,
      rolesOptions: [],
      // 非多个禁用
      multiple: true,
      tableHeight: window.innerHeight - 265,
      current: null,
      selectAll: []
    }
  },
  computed: {

  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 265
    }
    this.getdeptsList()
    this.getRolesList()
  },
  components: {
    addEdit
  },
  methods: {
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 查询部门列表
    async getdeptsList() {
      this.deptsLoading = true
      const params = {
        mc: this.org_team
      }
      const { data, code, msg } = await this.$pub.post('/sys/dept/list-tree', params)
      if (code !== 200) {
        this.$message.error(msg || '获取部门出错了')
        this.deptOptions = []
      } else {
        this.deptOptions = Array.isArray(data.dept) ? data.dept : [data.dept]
        if (this.deptOptions.length > 0) {
          this.defaultExpandkey = [this.deptOptions[0].id]
          this.selectOrg(this.deptOptions[0])
        } else {
          this.userList = []
          this.total = 0
        }
      }
      this.deptsLoading = false
    },
    // 查询角色列表
    async getRolesList() {
      const params = {
        name: '',
        page_no: 1,
        page_size: 99999999999
      }
      const { data, msg, code } = await this.$pub.post('sys/role/list', params)
      if (code === 200) {
        this.rolesOptions = data.list
      } else {
        this.rolesOptions = []
        this.$message({
          type: 'error',
          message: msg || '获取角色列表出错了',
          showClose: true
        })
      }
    },
    /** 查询用户列表 */
    async getList() {
      this.userList = []
      this.loading = true
      const params = {
        content: this.queryParams.user_name,
        dept_id: this.queryParams.org_id,
        role_id: this.queryParams.role_id ? this.queryParams.role_id + 0 : 0,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, code } = await this.$pub.post('sys/user/manage/list', params)
      this.loading = false
      if (code !== 200) {
        this.$message.error('获取用户列表出错了')
      }
      this.total = data.total
      this.userList = data.list
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    selectOrg(data) {
      this.queryParams.org_id = data.id
      this.currentDept = data
      this.handleQuery()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$fn.resetForm.call(this, 'queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.open = true
      this.title = '添加用户'
      this.current = null
    },
    handleUpdate(row) {
      this.open = true
      this.title = '编辑用户'
      this.current = row
    },
    handleDelete(arr = this.selectAll) {
      // const id = arr.map(m => m.user_id).join(',')
      // const user_account = arr.map(m => m.user_account).join(',')
      const id = arr[0].user_id
      const user_account = arr[0].user_account
      this.$confirm(
        '是否确认删除账户为"' + user_account + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return this.$pub.post('sys/user/manage/del', { id })
        })
        .then(() => {
          this.handleQuery()
          this.$message.success('删除成功')
        })
        .catch(function() {})
    },
    handleResetPwd(arr) {
      // const id = arr.map(m => m.user_id).join(',') // const user_ids = row.user_id || this.ids.join(',')
      // const user_account = arr.map(m => m.user_account).join(',')
      const id = arr[0].user_id
      const user_account = arr[0].user_account
      this.$confirm(
        '此操作将用户名为"' + user_account + '"的密码重置, 是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return this.$pub.post('sys/user/manage/initPwd', { id })
        })
        .then(() => {
          this.handleQuery()
          this.$message.success('密码重置成功')
        })
        .catch(function() {})
    },
    changeStatus(data, val) {
      this.$confirm('此操作将 "' + this.statusOptions[val].dict_label + '" ' + data.user_account + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return this.$pub.post('sys/user/manage/edit-status', { id: data.user_id, status: val })
      }).then((data) => {
        if (data.code !== 200) {
          data.status = data.status === 0 ? 1 : 0
        }
      }).catch(() => {
        data.status = data.status === 0 ? 1 : 0
      })
    },
    /** 下载模板操作 */
    importTemplate() {
      // importTemplate().then(response => {
      //   this.download(response.msg)
      // })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss">
  .person_wrap{
    height:100%;
    .el-tree{
      height: 100%;
      width:100%;
      overflow: auto;
    }
    .wrap{
      height: 100%;
      display:flex;
      justify-content: space-between;
      ._left{
        height:100%;
        width:280px;
        .clover_tree{
          height:calc(100% - 65px);
          width:100%;
          .el-tree-node {
            width: fit-content;
          }
        }
      }
      ._right{
        width:calc(100% - 300px)
      }
    }
  }
</style>
