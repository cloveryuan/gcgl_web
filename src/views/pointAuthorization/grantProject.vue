<template>
  <div class="grantProject_wrap" v-loading="saveLoading">
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
            ref="tree"
            default-expand-all
          >
            <span class="el-tree-node__content" slot-scope="{ node, data }" @click="selectOrg(data,node)">
              <span class="el-tree-node__label" :style="{fontSize:'14px',color: data.id ===queryParams.org_id?'#409EFF':''}" >{{ data.mc }}</span>
            </span>
          </el-tree>
        </div>
      </div>
      <!--用户数据-->
      <div class="_right">
        <!-- 查询区 -->
        <div style="width:480px;border-right:1px solid #eee;padding-right:10px;">
          <div class="module" style="margin-bottom:0;">
            <div style="margin-bottom:6px;">
              <span class="line"></span>
              <span>查询区</span>
            </div>
            <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="54px" >
              <el-form-item label="关键字" prop="user_name">
                <el-input
                  v-model="queryParams.user_name"
                  placeholder="请输入用户昵称"
                  clearable
                  size="small"
                  style="width: 150px"
                  @keyup.enter.native="handleQuery"
                  @clear="handleQuery"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary"  icon="el-icon-search" size="mini" @click="handleQuery" >搜索</el-button >
                <el-button type="primary"  size="mini" @click="handleSelectAll" :disabled="isAllSelected">全选</el-button >
              </el-form-item>
            </el-form>
          </div>
            <el-table
              v-loading="loading"
              :height="tableHeight"
              :data="userList"
              row-key="user_id"
              :row-class-name="tableRowClassName"
              ref="multipleTable">
              <el-table-column  width="36" >
                <template slot-scope="scope">
                  <span style="color:#409EFF;cursor:pointer;" v-if="!scope.row.isSelected" @click="addPerson(scope.row)"><i class="el-icon-plus"></i></span>
                </template>
              </el-table-column>
              <el-table-column label="用户昵称"  width="150"  prop="user_name" :show-overflow-tooltip="true" />
              <el-table-column label="组织团队"  prop="dept_name" :show-overflow-tooltip="true" />
            </el-table>
            <div  style="display:flex;justify-content:space-between;">
              <span  style="color:#999;font-size:14px;">共{{total}}条</span>
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

        <!-- 选中的 -->
        <div style="width:calc(100% - 500px);">
          <div class="module" >
            <div style="margin-bottom:6px;">
              <span class="line"></span>
              <span>已选人员</span>
            </div>
            <div>
              <el-button @click="save" type="primary" size="mini" style="margin: 3px 0 0 10px;">确认已选人员</el-button>
            </div>
          </div>
          <el-table
            :data="allSelectData"
            :max-height="tableHeight+25"
            style="margin-top: 8px;">
            <el-table-column type="index" label="序号" align="center"></el-table-column>
            <el-table-column label="用户昵称"  width="120"  prop="user_name" :show-overflow-tooltip="true" />
            <el-table-column label="组织团队"  prop="dept_name" :show-overflow-tooltip="true" />
            <el-table-column label="账号权限" min-width="100px" prop="role_name" :show-overflow-tooltip="true" />
            <el-table-column prop="specs" label="操作" width="80px">
              <template slot-scope="scope">
                <el-button type="text" @click="del(scope)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'grane_project',
  data () {
    return {
      loading: false,
      saveLoading: false,
      // 组织团队树选项
      deptOptions: [],
      deptsLoading: false,
      // 用户表格数据
      userList: [],
      org_team: undefined,
      defaultProps: {
        children: 'child',
        label: 'mc',
        id: 'id'
      },
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      // 查询参数
      queryParams: {
        user_name: undefined,
        role_id: undefined,
        org_id: undefined
      },
      tableHeight: window.innerHeight - 200,
      allSelectData: []
    }
  },
  props: {
    current: {
      type: [Object, null],
      default: null
    },
    grantFlag: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isAllSelected() {
      const selectIds = this.allSelectData.map(m => m.user_id)
      const leftUserIds = this.userList.map(m => m.user_id)
      const isAll = leftUserIds.some(f => {
        if (!selectIds.includes(f)) {
          return true
        }
      })
      return !isAll
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200
    }
    this.init()
    this.getdeptsList()
  },
  methods: {
    async init() {
      this.loading = true
      const { data, code } = await this.$pub.post('project/project-role-detail', { id: this.current.id })
      this.submit = false
      if (code === 200) {
        const { user_ids } = data
        this.allSelectData = user_ids ? [...user_ids] : []
      } else {
        this.$message({
          type: 'error',
          message: '获取该角色详情失败',
          showClose: true
        })
      }
    },
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
        this.depList = this.deptOptions.length > 0 ? this.deptOptions[0].child ? this.deptOptions[0].child : [] : []
        this.selectOrg(this.deptOptions[0])
      }
      this.deptsLoading = false
    },
    /** 查询用户列表 */
    async getList() {
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
      this.userList = data.list || []
      const selectIds = this.allSelectData.map(m => m.user_id)
      if (selectIds.length > 0) {
        this.$nextTick(() => {
          this.userList.forEach((f, i) => {
            if (selectIds.includes(f.user_id)) {
              this.$refs.multipleTable.toggleRowSelection(f, true)
            }
          })
        })
      }
    },
    tableRowClassName({ row }) {
      if (this.allSelectData.length <= 0) {
        row.isSelected = false
      }
      this.allSelectData.some(s => {
        if (s.user_id === row.user_id) {
          row.isSelected = true
          return true
        } else {
          row.isSelected = false
        }
      })
      return row.isSelected ? 'selected_dev' : ''
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    selectOrg(data) {
      this.queryParams.org_id = data.id
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
    addPerson(row) {
      this.allSelectData.push(row)
    },
    handleSelectAll() {
      const selectIds = this.allSelectData.map(m => m.user_id)
      this.userList.forEach(f => {
        if (!selectIds.includes(f.user_id)) {
          this.allSelectData.push(f)
        }
      })
    },
    del(row) {
      const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.allSelectData.splice(_index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    async save() {
      this.saveLoading = true
      const params = {
        project_role_id: this.current.id,
        user_ids: this.allSelectData.map(m => m.user_id)
      }
      const { code, message } = await this.$pub.post('project/project-role-user-add', params)
      this.saveLoading = false
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '授权失败',
          showClose: true
        })
      } else {
        this.$message({
          type: 'success',
          message: '授权成功',
          showClose: true
        })
        this.$emit('update:grantFlag', false)
        this.$emit('handleQuery')
      }
    }
  }
}
</script>

<style lang="scss">
.rolegrantproject{
  .el-drawer__body{
    height:calc(100% - 70px);
  }
}
.grantProject_wrap{
  height:100%;
  padding:0 20px 20px;
  box-sizing: border-box;
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
      width:300px;
      .clover_tree{
        height:calc(100% - 55px);
        width:100%;
        .el-tree-node {
          width: fit-content;
        }
      }
    }
    ._right{
      width:calc(100% - 320px);
      display:flex;
      justify-content:space-between;
      padding:0 10px;
       overflow: auto;
      .module{
        .line{
          display: inline-block;
          width: 3px;
          height:14px;
          background:#4DD2D2;
          vertical-align: middle;
          margin-right:4px;
        }
        span{
          vertical-align: middle;
        }
      }
      .el-table__row.selected_dev{
        background:#535457;
        color:#fff!important;
        i,span{
          color:#fff!important;
        }
      }
      .el-table--enable-row-hover .el-table__body .selected_dev:hover>td {
        background-color: #535457;
        color:#fff!important;
        i,span{
          color:#fff!important;
        }
      }
      .el-table td, .el-table th{
        padding:6px 0;
      }
      .cell .el-button{
         padding:0;
      }
      .el-form-item{
        margin-bottom: 0px;
      }
    }
  }
}
</style>
