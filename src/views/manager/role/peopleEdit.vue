<template>
  <div>
    <el-table  v-loading="loading"  :height="tableHeight" :data="userList" @selection-change="handleSelectionChange"  row-key="user_id" >
      <el-table-column label="用户账号" align="left" width="120" prop="user_account" :show-overflow-tooltip="true"  />
      <el-table-column label="用户昵称" align="left" width="120"  prop="user_name" :show-overflow-tooltip="true" />
      <el-table-column label="组织团队" align="left" width="200" prop="dept_name" :show-overflow-tooltip="true" />
      <el-table-column label="角色" align="left" prop="role_name" :show-overflow-tooltip="true" />
      <el-table-column label="手机号码" align="left" prop="mobile" width="120"  />
      <el-table-column prop="status_name" label="状态"  width="80" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" >
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete([scope.row])">删除</el-button >
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
</template>

<script>
export default {
  name: 'people_edit',
  data () {
    return {
      loading: false,
      userList: [],
      tableHeight: window.innerHeight - 300,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      }
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 300
    }
    this.getList()
  },
  methods: {
    async getList() {
      this.userList = []
      this.loading = true
      const params = {
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectAll = selection
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
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
    }
  }
}
</script>

<style scoped>

</style>
