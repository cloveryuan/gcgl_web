<template>
  <div class="company_wrap">
    <el-row :gutter="15" class="role_t_wrap">
      <!--厂商列表-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" >
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-input placeholder="请输入内容" v-model="query.sys_name"  size="small" style="width:440px;" clearable @clear="getList"  @keyup.enter.native="getList">
              <template slot="prepend">名称</template>
            </el-input>
            <div style="margin-left:10px;" class="el-input-group">
              <span class="el-input-group__prepend">状态</span>
              <el-select v-model="query.status"  size="small">
                <el-option
                  v-for="item in statusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                type="primary"
                 size="small"
                style="margin-left:10px;"
                @click="getList"
              >查询</el-button>
            </div>
            <el-button
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
              style="margin-left:auto;padding: 6px 9px"
            >新增</el-button>
          </div>
          <el-table
            ref="table"
            v-loading="loading"
            :height="tableHeight"
            style="width: 100%;"
            :data="companyList"
            @row-click="rowClick"
            :row-style="{ height: '40px' }"
            :cell-style="{ padding: '0px' }"
            :row-class-name="tableRowClassName"
          >
            <el-table-column label="厂商名称"  prop="sys_name"  :show-overflow-tooltip="true"  />
            <el-table-column label="厂商地址"  prop="sys_addr"  :show-overflow-tooltip="true"  />
            <el-table-column label="端口"  prop="sys_port"  width="60"  />
            <el-table-column label="账号"  prop="sys_account"  :show-overflow-tooltip="true"  />
            <el-table-column label="状态" align="center" prop="status_name" width="90" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <span>{{scope.row.status==='1'?'停用':'启用'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true"  />
            <el-table-column label="操作" align="center" width="150px" >
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 厂商编辑 新增 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7" >
        <el-card class="box-card" shadow="never"   v-loading="opearLoading">
          <div slot="header" >
            <el-tooltip class="item" effect="dark" content="选择指定厂商编辑信息或者点击新增" placement="top">
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
          <el-form size="small" ref="form"  :model="form" :rules="rules"  label-width="60px" style="border-radius:4px;margin-top:20px;">
            <el-form-item label="名称" prop="sys_name">
              <el-input v-model="form.sys_name" />
            </el-form-item>
            <el-form-item label="地址" prop="sys_addr">
              <el-input v-model="form.sys_addr" />
            </el-form-item>
            <el-form-item label="端口" prop="sys_port">
              <el-input v-model="form.sys_port" />
            </el-form-item>
            <el-form-item label="账号" prop="sys_account">
              <el-input v-model="form.sys_account" />
            </el-form-item>
            <el-form-item label="密码" prop="sys_pass">
              <el-input v-model="form.sys_pass" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="1">停用</el-radio>
                <el-radio label="0">启用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'company_setting',
  props: {
    project_code: {
      required: true
    },
    project_id: {
      required: true
    },
    companyFlag: {
      require: true
    }
  },
  data () {
    var ipValid = (rule, value, callback) => {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if ((!reg.test(value)) && value !== '') {
        callback(new Error('ip地址格式不正确'))
      } else {
        callback()
      }
    }
    var protValid = (rule, value, callback) => {
      const reg = /^\d*$/ // ^[0-9]*$
      if ((!reg.test(value)) && value !== '') {
        callback(new Error('端口号格式不正确'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      tableHeight: window.innerHeight - 235,
      companyList: [],
      current: null,
      query: {
        sys_name: '',
        status: '-1'
      },
      statusList: [
        { value: '-1', label: '全部' }, { value: '0', label: '启用' }, { value: '1', label: '停用' }
      ],
      form: {
        sys_name: '',
        sys_addr: '',
        sys_port: null,
        sys_account: '',
        sys_pass: '',
        remark: '',
        status: '0'
      },
      rules: {
        sys_name: [
          { required: true, message: '请输入厂商名称', trigger: 'change' }
        ],
        sys_addr: [
          { required: true, message: '请输入厂商地址', trigger: 'change' },
          { validator: ipValid, trigger: 'blur' }
        ],
        sys_port: [
          { required: true, message: '请输入端口', trigger: 'change' },
          { validator: protValid, trigger: 'blur' }
        ],
        sys_account: [
          { required: true, message: '请输入账户', trigger: 'change' }
        ],
        sys_pass: [
          { required: true, message: '请输入密码', trigger: 'change' }
        ]
      },
      title: '新增厂商',
      opearLoading: false
    }
  },
  mounted() {
    this.getList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 235
    }
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
        project_code: this.project_code,
        sys_name: this.query.sys_name,
        status: this.query.status
      }
      const { data, msg, code } = await this.$pub.post('project/sys/list', params)
      this.loading = false
      if (code === 200) {
        this.companyList = data.list
      } else {
        this.companyList = []
        this.$message({
          type: 'error',
          message: msg || '获取厂商列表出错了',
          showClose: true
        })
      }
    },
    handleDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除厂商为"' + row.sys_name + '"的数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/project/sys/del', { id })
        if (code === 200) {
          this.getList()
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
      this.title = '新增厂商'
      this.current = null
      this.form = {
        sys_name: '',
        sys_addr: '',
        sys_port: null,
        sys_account: '',
        sys_pass: '',
        remark: '',
        status: '0'
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    rowClick(row) {
      this.title = '厂商：' + row.sys_name
      this.current = row
      const { sys_name, sys_addr, status, sys_port, sys_account, sys_pass, remark } = this.current
      this.form = {
        sys_name,
        sys_addr,
        status,
        sys_port,
        sys_account,
        sys_pass,
        remark
      }
    },
    save() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            this.opearLoading = true
            const url = this.current ? 'project/sys/edit' : 'project/sys/add'
            const add = {
              project_id: this.project_id + '',
              project_code: this.project_code,
              create_user: this.$store.state.userInfo.id + '',
              ...this.form
            }
            const edit = {
              id: this.current ? this.current.id : '',
              create_user: this.$store.state.userInfo.id + '',
              ...this.form
            }
            const params = this.current ? edit : add
            const { code } = await this.$pub.post(url, params)
            if (code === 200) {
              this.$message({
                type: 'success',
                message: '操作成功',
                showClose: true
              })
              // this.$refs.form.clearValidate()
              this.getList()
            } else {
              this.$message({
                type: 'error',
                message: '操作失败',
                showClose: true
              })
            }
            this.opearLoading = false
          } catch (err) {
            this.opearLoading = false
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.company_wrap{
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  .el-card__body{
    padding: 0;
  }
  .clearfix{
    display:flex;
    flex-wrap: nowrap;
    .el-input-group__prepend{
      padding:0 10px;
    }
  }
  tr{
    cursor:pointer;
  }
  tr.isactive td{
    // background-color: #ecf5ff;
    background: #4478f1!important;
    color: #fff!important;
    .el-button--text{
      color:#fff;
    }
  }
}
</style>
