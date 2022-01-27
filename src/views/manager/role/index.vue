<template>
  <div class="app-container role_wrap">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="角色名称" prop="role_name">
        <el-input
          v-model="queryParams.role_name"
          placeholder="请输入角色名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
          @clear="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" style="margin-bottom:10px;">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col> -->
    </el-row>

    <el-row :gutter="15" class="role_t_wrap">
      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" >
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table
            ref="table"
            v-loading="loading"
            :height="tableHeight"
            highlight-current-row
            style="width: 100%;"
            :data="roleList"
            @selection-change="handleSelectionChange"
            @row-click="rowClick"
            :row-style="{ height: '40px' }"
            :cell-style="{ padding: '0px' }"
            :row-class-name="tableRowClassName"
          >
            <!-- <el-table-column type="selection" width="55" align="center" /> -->
            <el-table-column label="角色名称" align="left" prop="name" width="200" :show-overflow-tooltip="true"  />
            <el-table-column label="创建时间" align="left" prop="create_time" width="200">
              <template slot-scope="scope">
                <span>{{ $fn.parseTime(scope.row.create_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" align="left" :show-overflow-tooltip="true" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220px" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.row)"
                >修改</el-button>
                <!-- <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-user"
                  @click="handlePeople(scope.row)"
                >人员</el-button> -->
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
        </el-card>
      </el-col>
      <!-- 菜单授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7" >
        <el-card class="box-card" shadow="never"   v-loading="menuListLoading || rolemenuListLoading">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
              <span class="role-span">菜单分配</span>
            </el-tooltip>
            <el-button
              :loading="menuLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              :disabled="!current"
              @click="saveMenu"
            >保存</el-button>
          </div>
          <el-tree
            ref="menu"
            :data="menuOptions"
            :default-checked-keys="menuIds"
            :props="defaultProps"
            accordion
            show-checkbox
            node-key="id"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
       <add-edit
        ref="addedit"
        v-if="open"
        :menuOptions="menuOptions"
        :open.sync="open"
        :current="current"
        @roleGrant="roleGrant"></add-edit>
    </el-dialog>
    <!-- 查询角色下的人员配置对话框 -->
    <el-dialog title="人员分配" class="peo" :visible.sync="showPeople" width="1000px" append-to-body>
      <people-edit
        v-if="showPeople"
        :open.sync="showPeople"
        :current="current"></people-edit>
    </el-dialog>
  </div>
</template>

<script>
import addEdit from './addEdit.vue'
import peopleEdit from './peopleEdit.vue'
export default {
  name: 'managerRole',
  data () {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 菜单列表
      menuOptions: [],
      // 查询参数
      queryParams: {
        role_name: undefined,
        status: undefined
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      current: null,
      menuLoading: false,
      menuListLoading: false,
      rolemenuListLoading: false,
      menuIds: [],
      tableHeight: window.innerHeight - 375,
      showPeople: false
    }
  },
  created () {
    this.getList()
    this.getMenuTreeselect()
  },
  mouted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 375
    }
  },
  components: {
    addEdit, peopleEdit
  },
  methods: {
    /** 查询角色列表 */
    async getList () {
      this.loading = true
      const params = {
        name: this.queryParams.role_name,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, msg, code } = await this.$pub.post('sys/role/list', params)
      this.loading = false
      if (code === 200) {
        this.roleList = data.list
        this.total = data.total
      } else {
        this.total = 0
        this.roleList = []
        this.$message({
          type: 'error',
          message: msg || '获取角色列表出错了',
          showClose: true
        })
      }
    },
    /** 查询菜单树结构 */
    async getMenuTreeselect () {
      this.menuOptions = []
      this.menuListLoading = true
      const { data, code } = await this.$pub.post('sys/menu/query', { name: '' })
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '查询菜单列表失败',
          showClose: true
        })
      } else {
        this.menuOptions = data ? (Array.isArray(data) ? data : [data]) : []
      }
      this.menuListLoading = false
    },
    /** 搜索按钮操作 */
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
    /** 重置按钮操作 */
    resetQuery () {
      // this.dateRange = []
      this.$fn.resetForm.call(this, 'queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.open = true
      this.title = '添加角色'
      this.current = null
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.handleAdd()
      this.title = '修改角色'
      this.current = row
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const id = row.id
      const role_name = row.name
      this.$confirm('是否确认删除角色为"' + role_name + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('sys/role/del', { id })
        if (code === 200) {
          this.handleQuery()
          this.$message({
            type: 'success',
            message: message || '删除成功',
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
    handlePeople(row) {
      this.showPeople = true
      this.current = row
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return this.current && row.id === this.current.id ? 'isactive' : ''
    },
    async rowClick(val) {
      if (val) {
        const index = val.index
        // 清空菜单的选中
        this.$refs.menu.setCheckedKeys([])
        this.current = val
        this.rolemenuListLoading = true
        this.getMenuTreeselect()
        const { code, data } = await this.$pub.post('/sys/role/getMenuListRest', { role_id: val.id })
        this.rolemenuListLoading = false
        if (code === 200) {
          if (data && data.length > 0) {
            // 菜单数据需要特殊处理
            const pids = [...new Set(data.map(m => m.pid))]
            const menus = []
            data.forEach(data => {
              if (!pids.includes(data.id)) {
                menus.push(data.id)
              }
            })
            this.menuIds = menus
            val.menus = this.menuIds
            this.$set(this.roleList, index, val)
          } else {
            this.menuIds = []
          }
        } else {
          this.$message({
            type: 'error',
            message: '查询菜单失败',
            showClose: true
          })
        }
      }
    },
    // 保存菜单
    async saveMenu() {
      const role = []
      // 得到半选的父节点数据，保存起来
      this.$refs.menu.getHalfCheckedNodes().forEach(data => {
        role.push(data.id)
      })
      // 得到已选中的 key 值
      this.$refs.menu.getCheckedKeys().forEach(data => {
        role.push(data)
      })
      // console.log(role.length)
      if (role.length <= 0) {
        return this.$message({
          type: 'error',
          message: '必须至少配置一个菜单',
          showClose: true,
          customClass: 'message3'
        })
      }
      this.menuLoading = true
      await this.roleGrant({
        role_id: this.current.id,
        menu_id: [...new Set(role)]
      })
      this.menuLoading = false
    },
    // 角色确定授权
    async roleGrant(params) {
      const { code } = await this.$pub.post('sys/role/grant', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '菜单授权失败',
          showClose: true
        })
      } else {
        this.open = false
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
        this.handleQuery()
      }
    },

    /** 导出按钮操作 */
    handleExport () {
      // const queryParams = this.queryParams
      this.$confirm('是否确认导出所有角色数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        // return exportRole(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function () {})
    }
  }
}
</script>
<style lang="scss">
.role_wrap{
  height:100%;
  .role_t_wrap{
    height:calc(100% - 100px);
    &>.el-col{
      height:100%;
      .el-card{
        height:100%;
      }
    }
  }
  .el-card__body{
    height:calc(100% - 58px);
    box-sizing: border-box;
    overflow:auto;
  }
  .el-pagination{
    text-align:right;
  }
  tr.isactive{
    background-color: #ecf5ff;
  }
}
.peo{
  .el-dialog{
    margin-top:50px!important;
  }
}
</style>
