<template>
  <div class="directNums">
    <div class="_top">
      <div class="module">
        <span class="line"></span>
        <span>品牌管理</span>
      </div>
      <el-button size="mini" @click="add" type="primary" v-hasPermi="['warehouseBrand:add']">新增品牌</el-button>
    </div>
    <el-table :data="tableData" size="mini" height="400px" v-loading="loading" style="margin-top:0;">
      <el-table-column prop="id" label="品牌编码">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="品牌名称" min-width="140">
        <template slot-scope="scope">
          <span v-if="!scope.row.isedit">{{scope.row.name}}</span>
          <el-input v-else v-model="scope.row.name" size="mini" ref="bindName"></el-input>
        </template>
      </el-table-column>
      <el-table-column  label="操作">
        <template slot-scope="scope">
          <el-button type="text" v-hasPermi="['warehouseBrand:edit']"  @click="edit(scope.row,scope.$index)" v-if="!scope.row.isedit">编辑</el-button>
          <el-button type="text" @click="sure(scope.row,scope.$index)" v-loading="scope.row.addLoading" v-if="scope.row.isedit">确认</el-button>
           <el-button type="text" @click="cancle(scope.row,scope.$index)" v-if="scope.row.isedit">取消</el-button>
          <el-button type="text" v-hasPermi="['warehouseBrand:del']" v-if="tableData.length>1" @click="del(scope.row,scope.$index)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'bind_setting',
  props: {
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
      currentRow: null
    }
  },
  computed: {

  },
  mounted() {
    this.getbrandList()
  },
  components: {

  },
  methods: {
    async getbrandList() {
      this.loading = true
      const { code, message, data } = await this.$pub.post('/device/brand/list', { project_code: this.project_code, device_id: this.device_id })
      if (code !== 200) {
        return this.$message.error(message || '获取所有品牌失败')
      }
      this.tableData = data.list || []
      this.loading = false
    },
    add() {
      if (this.tableData.length.length > 0) {
        const row = this.tableData[this.tableData.length - 1]
        if (!row.name) {
          return this.$message.error('品牌不能为空')
        }
        if (row.isedit) {
          return this.$message.error('先保存新增的品牌')
        }
      }
      this.currentRow = null
      this.tableData.push({
        id: '',
        name: '',
        isedit: true
      })
      this.$nextTick(() => {
        const id = 'bindName'
        this.$refs[id].focus()
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
            ids: row.id + ''
          }
          const { code, message } = await this.$pub.post('/device/brand/delete', params)
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
      if (!row.name) {
        return this.$message.error('品牌不能为空')
      }
      row.addLoading = true
      this.$set(this.tableData, i, row)
      const params = {
        project_code: this.project_code,
        brand: row.name,
        create_user: this.$store.state.userInfo.id,
        device_id: this.device_id
      }
      const editParams = Object.assign(
        { id: row.id }, params
      )
      const { code, message } = row.id ? await this.$pub.post('/device/brand/edit', editParams) : await this.$pub.post('/device/brand/add', params)
      if (code === 200) {
        row.isedit = false
        row.addLoading = false
        this.$message.success(row.id ? '修改成功' : '新增成功')
        this.getbrandList()
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

<style scoped lang="scss">
.directNums{
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
}
</style>
