<template>
  <div class="role_wrap teamWrap">
    <div class="search">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item>
          <el-input
            size="small"
            placeholder="部门名称"
            suffix-icon="el-icon-search"
            v-model="queryParams.mc"
            @keyup.enter.native="handleQuery"
          >
          </el-input>
        </el-form-item>
        <!-- <el-form-item prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="状态"
            clearable
            size="small"
            style="width: 120px"
          >
            <el-option
              v-for="s in status"
              :key="s.key"
              :label="s.value"
              :value="s.key"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" size="mini"   @click="handleQuery">查询</el-button>
          <el-button size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_list">
        <div class="header">
          <el-button size="mini"   icon="el-icon-plus" type="primary" @click="add(0)">新增</el-button>
           <el-button size="mini"   type="primary" @click="handleExpand">{{isExpand?'一键折叠':'一键展开'}}</el-button>
        </div>
        <el-table
          ref="expandTable"
          v-loading="tableLoading"
          :data="tableData"
          row-key="id"
          :expand-row-keys="['0']"
          border
          :height="tableHeight"
          :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
          element-loading-text="数据加载中..."
        >
          <el-table-column prop="mc" label="部门名称" show-overflow-tooltip></el-table-column>
           <el-table-column prop="jc" label="部门简称" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="px" label="排序" width="50"></el-table-column>
          <el-table-column align="center" label="状态" width="60">
            <template slot-scope="scope">
              {{ scope.row.sfsy === 0 ? '停用' : '启用' }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="施工单位" width="80">
            <template slot-scope="scope">
              {{ scope.row.sgdw === 0 ? '否' : '是' }}
            </template>
          </el-table-column>
           <el-table-column align="left" prop="content" label="描述" show-overflow-tooltip=""></el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="add(2, scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-document-add"
                @click="add(1, scope.row)"
                >新增</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="deleteProject(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
    </div>
    <!-- 添加部门 -->
    <el-dialog :title="title" :visible.sync="dialogVisible" width="1000px" @close="closeDialog">
      <el-form
        v-if="dialogVisible"
        :rules="rules"
        ref="addform"
        size="mini"
        :model="addform"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="pid" label="上级部门">
              <treeselect
                v-model="addform.pid"
                :options="deptList"
                :normalizer="normalizer"
                :show-count="false"
                placeholder="选择上级部门"
                style="height: 28px;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="mc" label="部门名称">
              <el-input v-model="addform.mc" @blur="changeMC"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="jc" label="部门简称">
              <el-input v-model="addform.jc" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="px" label="显示排序">
              <el-input-number v-model="addform.px" :min="1"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="sgdw" label="施工单位">
              <el-radio-group v-model="addform.sgdw">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="sfsy" label="状态">
              <el-radio-group v-model="addform.sfsy">
                <el-radio :label="0">停用</el-radio>
                <el-radio :label="1">启用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="content" label="部门描述">
              <el-input type="textarea" v-model="addform.content"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="doAdd()">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'managerTeam',
  data() {
    return {
      title: '添加部门',
      tableLoading: false,
      dialogVisible: false,
      // 查询参数
      queryParams: {
        mc: '',
        sfsy: ''
      },
      // 状态
      status: [
        { key: 0, value: '停用' },
        { key: 1, value: '启用' }
      ],
      tableData: [],
      // 添加数据
      addform: {
        mc: '',
        jc: '',
        sgdw: 1,
        sfsy: 1
      },
      rules: {
        pid: [
          { required: true, message: '请选择上级部门', trigger: 'change' }
        ],
        mc: [
          { required: true, message: '请输入部门名称', trigger: 'change' }
        ],
        jc: [
          { required: true, message: '请输入部门简称', trigger: 'change' }
        ],
        px: [{ required: true, message: '请输入排序', trigger: 'change' }],
        sfsy: [{ required: true, message: '请选择状态', trigger: 'change' }],
        sgdw: [{ required: true, message: '请选择是否是施工', trigger: 'change' }]
      },
      tableHeight: window.innerHeight - 240,
      edit: false,
      deptList: [],
      isExpand: false
    }
  },
  computed: {},
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 240
    }
    this.handleQuery()
  },
  components: {},
  methods: {
    normalizer (node) { /** 转换菜单数据结构 */
      if (node.child && !node.child.length) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.mc,
        children: node.child
      }
    },
    // 查询
    handleQuery() {
      this.getList()
    },
    async getList() {
      this.tableLoading = true
      const params = {
        mc: this.queryParams.mc
        // sfsy: this.queryParams.sfsy === '' ? -1 : this.queryParams.sfsy
      }
      const { data } = await this.$pub.post('/sys/dept/list-tree', params)
      this.tableData = Array.isArray(data.dept) ? data.dept : [data.dept]
      this.tableLoading = false
    },
    // 重置
    resetQuery() {
      this.queryParams.mc = ''
      this.$fn.resetForm.call(this, 'queryForm')
      this.handleQuery()
    },
    async add(num, row) {
      this.reset()
      this.edit = false
      if (num === 2) {
        this.title = '修改部门'
        this.edit = true
        this.addform = { ...row }
        this.addform.pid = row.pid >= 0 ? row.pid : undefined
      } else if (num === 1) {
        this.addform.pid = row.id === 0 ? undefined : row.id
      }
      this.dialogVisible = true
      const { data } = await this.$pub.post('/sys/dept/list-tree', { mc: '' })
      const datas = Array.isArray(data.dept) ? data.dept : [data.dept]
      this.deptList = datas
    },
    changeMC() {
      this.addform.jc = this.addform.mc
    },
    doAdd() {
      this.$refs.addform.validate(async valid => {
        if (valid) {
          const url = this.edit ? '/sys/dept/edit' : '/sys/dept/add'
          const message = this.edit ? '修改' : '新增'
          this.addform.sgdw = this.addform.sgdw + ''
          this.addform.pid = this.addform.pid + ''
          const { code } = await this.$pub.post(url, this.addform)
          if (code === 200) {
            this.$message.success(message + '成功')
            this.handleQuery()
            this.dialogVisible = false
          } else {
            this.$message.error(message + '失败')
          }
        }
      })
    },
    // 一键折叠，一键展开
    handleExpand() {
      this.isExpand = !this.isExpand
      this.handleChildExpand(this.tableData)
    },
    handleChildExpand(arr) {
      arr.forEach(row => {
        this.$refs.expandTable.toggleRowExpansion(row, this.isExpand)
        if (row.child && row.child.length > 0) {
          this.handleChildExpand(row.child)
        }
      })
    },
    // 删除
    deleteProject(oj) {
      this.$confirm(`确认删除部门名为：${oj.mc}的数据吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.$pub.post('/sys/dept/del', { ID: oj.id })
        if (code === 200) {
          this.$message({
            type: 'success',
            message: '删除成功',
            showClose: true
          })
          this.handleQuery()
        } else {
          this.$message({
            type: 'error',
            message: '删除失败',
            showClose: true
          })
        }
      })
    },
    // 表单重置
    reset() {
      this.addform = {
        pid: null,
        mc: '',
        jc: '',
        px: 1,
        sfsy: 1,
        sgdw: 1,
        content: ''
      }
      this.$fn.resetForm.call(this, 'form')
    },
    closeDialog() {
      this.title = '新增部门'
    }
  }
}
</script>

<style lang="scss">
.role_wrap {
  .el-card__body {
    height: calc(100% - 58px);
    box-sizing: border-box;
    overflow: auto;
  }
  .el-pagination {
    text-align: right;
  }
}
.vue-treeselect__control{
  height:26px;
  border-radius:0;
  .vue-treeselect__placeholder, .vue-treeselect__single-value{
    line-height: 24px;
  }
}
.teamWrap{
  margin:0 auto;
}
.teamWrap .header{
  margin-bottom:10px;
  // border:1px solid #eee;
  // border-bottom:0;
}
</style>
