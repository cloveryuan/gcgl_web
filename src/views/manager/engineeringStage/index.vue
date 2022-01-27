<template>
  <div class="engineeringStage">
    <el-row :gutter="15" class="role_t_wrap">
      <!--阶段列表-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" >
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">工程阶段列表</span>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              style="float: right; padding: 6px 9px"
            >新增</el-button>
          </div>
          <!-- 搜索 -->
          <el-input v-model="query" clearable size="small" placeholder="输入名称搜索" style="width: 240px;" @keyup.enter.native="handleQuery" @change="handleQuery">
            <el-button slot="append"   icon="el-icon-search" @click="handleQuery"></el-button>
          </el-input>
          <el-table
            ref="table"
            v-loading="loading"
            :height="tableHeight"
            style="width: 100%;"
            :data="stageList"
            @row-click="rowClick"
            :row-style="{ height: '40px' }"
            :cell-style="{ padding: '0px' }"
            :row-class-name="tableRowClassName"
          >
            <el-table-column label="阶段名称" prop="stage_name"  :show-overflow-tooltip="true"  />
            <el-table-column label="阶段编码" align="center" prop="stage_code"   />
            <el-table-column label="状态" align="center" prop="status" >
               <template slot-scope="scope">
                 <span>{{scope.row.status==='0'?'启用 ':'停用 '}}</span>
               </template>
            </el-table-column>
            <el-table-column label="排序" align="center" prop="sort"   />
            <el-table-column label="操作" align="center" >
              <template slot-scope="scope">
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
      <!-- 阶段编辑 新增 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7" >
        <el-card class="box-card" shadow="never"   v-loading="opearLoading">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定工程阶段编辑信息或者点击新增" placement="top">
              <span class="role-span"> {{title}}</span>
            </el-tooltip>
            <el-button
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="save"
            >保存</el-button>
          </div>
          <el-form size="small" ref="form"  :model="form" :rules="rules"  label-width="60px" style="border-radius:4px;">
            <el-form-item label="名称" prop="stage_name">
              <el-input v-model="form.stage_name" />
            </el-form-item>
            <el-form-item label="编码" prop="stage_code">
              <el-input v-model="form.stage_code" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const codeValidate = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入工程阶段编码'))
  } else if (!(/^[0-9]*$/.test(value))) {
    callback(new Error('阶段编码必须是数字'))
  } else {
    callback()
  }
}
export default {
  name: 'managerEngineeringStage',
  data () {
    return {
      query: '',
      loading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      tableHeight: window.innerHeight - 285,
      stageList: [],
      current: null,
      form: {
        stage_name: '',
        stage_code: null,
        status: '0',
        sort: 999
      },
      rules: {
        stage_name: [
          { required: true, message: '请输入工程阶段名称', trigger: 'change' }
        ],
        stage_code: [
          { required: true, message: '请输入工程阶段编码', trigger: 'change' },
          { validator: codeValidate, message: '阶段编码必须是数字', trigger: 'blur' }
        ]
      },
      title: '新增工程阶段',
      opearLoading: false
    }
  },
  mounted() {
    this.getList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 285
    }
  },
  components: {

  },
  methods: {
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return this.current && row.id === this.current.id ? 'isactive' : ''
    },
    async getList() {
      this.loading = true
      const params = {
        stage_name: this.query,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, msg, code } = await this.$pub.post('/stage/list', params)
      this.loading = false
      if (code === 200) {
        this.stageList = data.list
        this.total = data.total
      } else {
        this.total = 0
        this.stageList = []
        this.$message({
          type: 'error',
          message: msg || '获取列表出错了',
          showClose: true
        })
      }
    },
    handleQuery () {
      this.page.page_no = 1
      this.handleAdd()
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
    handleDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除阶段为"' + row.stage_name + '"的数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/stage/del', { id })
        if (code === 200) {
          this.handleQuery()
          this.handleAdd()
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
    handleAdd() {
      this.title = '新增工程阶段'
      this.current = null
      this.form = {
        stage_name: '',
        stage_code: null,
        status: '0',
        sort: 999
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    rowClick(row) {
      this.title = '工程阶段：' + row.stage_name
      this.current = row
      const { stage_name, stage_code, status, sort } = this.current
      this.form = {
        stage_name, stage_code, status, sort
      }
    },
    save() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.opearLoading = true
          const base = {
            stage_name: this.form.stage_name,
            stage_code: this.form.stage_code,
            status: this.form.status,
            create_user: this.$store.state.userInfo.id,
            sort: this.form.sort
          }
          const params = (this.current && this.current.id) ? {
            ...base, id: this.current.id
          } : { ...base }
          const url = (this.current && this.current.id) ? '/stage/edit' : '/stage/add'
          const { code } = await this.$pub.post(url, params)
          if (code === 200) {
            this.$message({
              type: 'success',
              message: '操作成功',
              showClose: true
            })
            // this.$refs.form.clearValidate()
            this.handleQuery()
          } else {
            this.$message({
              type: 'error',
              message: '操作失败',
              showClose: true
            })
          }
          this.opearLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.engineeringStage{
  width:100%;
  height:100%;
  td{
    cursor:pointer;
  }
  .isactive{
    td.el-table__cell{
      background:rgb(209, 230, 247);
    }
  }
}
</style>
