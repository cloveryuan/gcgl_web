<template>
  <div class="childsetting">
    <div class="_top">
      <div class="module">
        <span class="line"></span>
        <span>子系统管理</span>
      </div>
      <el-button size="mini" @click="add" type="primary" v-hasPermi="['warehouseChild:add']">新增子系统</el-button>
    </div>
    <el-table :data="tableData"  size="mini" v-loading="loading" height="400px" style="margin-top:0;">
      <el-table-column prop="child_code" label="子系统" min-width="140">
        <template slot-scope="scope">
          <!-- <span v-if="!scope.row.isedit">{{scope.row.child_code}}</span> -->
          <el-select v-model="scope.row.child_code" :disabled="!scope.row.isedit" size="mini" placeholder="请选择">
            <el-option
              v-for="item in childList"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column  label="操作">
        <template slot-scope="scope">
          <el-button type="text" v-hasPermi="['warehouseChild:edit']"  @click="edit(scope.row,scope.$index)" v-if="!scope.row.isedit">编辑</el-button>
          <el-button type="text" @click="sure(scope.row,scope.$index)" v-loading="scope.row.addLoading" v-if="scope.row.isedit">确认</el-button>
           <el-button type="text" @click="cancle(scope.row,scope.$index)" v-if="scope.row.isedit">取消</el-button>
          <el-button type="text" v-hasPermi="['warehouseChild:del']" v-if="tableData.length>1" @click="del(scope.row,scope.$index)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ChildSetting',
  props: {
    project_id: {
      required: true
    },
    project_code: {
      required: true
    },
    device_id: {
      required: true
    }
  },
  data () {
    return {
      tableData: [],
      loading: false,
      currentRow: null,
      childList: []
    }
  },
  computed: {

  },
  mounted() {
    this.getTableData()
    this.getChildList()
  },
  components: {

  },
  methods: {
    async getTableData() {
      this.loading = true
      const { data, code, message } = await this.$pub.post('device/manage/binding-child-list', { project_id: this.project_id, device_Id: this.device_id })
      if (Number(code) === 200) {
        this.tableData = data.list || []
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
        this.tableData = []
      }
      this.loading = false
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.project_id })
        if (Number(code) === 200) {
          this.childList = data || []
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.childList = []
        }
      } catch (e) {
        this.childList = []
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    add() {
      if (this.tableData.length > 0) {
        const row = this.tableData[this.tableData.length - 1]
        if (!row.child_code) {
          return this.$message.error('子系统不能为空')
        }
        if (row.isedit) {
          return this.$message.error('先保存编辑中的子系统')
        }
      }
      this.currentRow = null
      this.tableData.push({
        id: '',
        child_code: '',
        isedit: true
      })
    },
    edit(row, i) {
      row.isedit = true
      this.$set(this.tableData, i, row)
      this.currentRow = Object.assign({}, row)
    },
    async del(row, i) {
      if (row.id) {
        this.$confirm('确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          row.delLoading = true
          this.$set(this.tableData, i, row)
          const params = {
            id: row.id
          }
          const { code, message } = await this.$pub.post('device/manage/binding-child-del', params)
          if (code === 200) {
            this.tableData.splice(i, 1)
            this.$message.success('删除成功')
          } else {
            row.delLoading = false
            this.$set(this.tableData, i, row)
            this.$message.error(message || '删除失败')
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.tableData.splice(i, 1)
      }
    },
    async sure(row, i) {
      if (!row.child_code) {
        return this.$message.error('子系统不能为空')
      }
      if (!row.child_code) {
        return this.$message.error('子系统不能为空')
      }
      let isSome = false
      this.tableData.some(s => {
        if (s.id !== row.id && s.child_code === row.child_code) {
          isSome = true
          return isSome
        }
      })
      if (isSome) {
        return this.$message.error('子系统不能重复')
      }
      row.addLoading = true
      this.$set(this.tableData, i, row)
      const params = {
        project_code: this.project_code + '',
        project_id: this.project_id,
        child_code: row.child_code,
        create_user: this.$store.state.userInfo.id,
        device_id: this.device_id
      }
      const editParams = Object.assign(
        { id: row.id }, params
      )
      const { code, message } = row.id ? await this.$pub.post('device/manage/binding-child', editParams) : await this.$pub.post('device/manage/binding-child', params)
      if (code === 200) {
        row.isedit = false
        row.addLoading = false
        this.$message.success(row.id ? '修改成功' : '新增成功')
        this.getTableData()
      } else {
        row.addLoading = false
        this.$set(this.tableData, i, row)
        this.$message.error(message || '确认失败')
      }
    },
    cancle(row, i) {
      if (row.id) {
        row = this.currentRow
        row.isedit = false
        this.$set(this.tableData, i, row)
      } else {
        this.tableData.splice(i, 1)
      }
    }

  }
}
</script>

<style lang="scss">
.childsetting{
  ._top{
    display: flex;
    justify-content: space-between;
    margin:10px 0;
    .module{
      .line{
        display: inline-block;
        width: 3px;
        height:14px;
        background:#4DD2D2;
        vertical-align: middle;
      }
      span{
        vertical-align: middle;
        font-size:16px;
        margin-left:6px;
      }
    }
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #f9fbff;
    color:#aeafb1;
  }
}
</style>
