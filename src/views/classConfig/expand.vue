<template>
  <div class="expand_config">
    <el-row :gutter="15" class="role_t_wrap">
      <!--工序列表-->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" >
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-input placeholder="请输入内容" v-model="query.name"    clearable @blur="getList" @clear="getList"  @keyup.enter.native="getList">
              <template slot="prepend">名称</template>
            </el-input>
            <div class="el-input-group">
              <el-button
                type="primary"
                @click="getList"
              >查询</el-button>
            </div>
            <el-button
              icon="el-icon-plus"
              @click="handleExpandAdd"
              style="padding: 6px 9px"
            >新增</el-button>
          </div>
          <el-table
            ref="table"
            v-loading="loading"
            :height="tableHeight"
            style="width: 100%;"
            :data="expandList"
            @row-click="rowClick"
            :row-style="{ height: '40px' }"
            :cell-style="{ padding: '0px' }"
            :row-class-name="tableRowClassName"
            row-key="id"
            class="classTable"
          >
            <el-table-column label="扩展名称"  prop="name"  :show-overflow-tooltip="true"  />
            <el-table-column label="操作" align="center" width="120px" >
              <template slot-scope="scope">
                 <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleExpandEdit(scope.row)"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleExpandDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 扩展属性的编辑 新增 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" >
        <el-card class="box-card" shadow="never" >
          <div slot="header" >
            <el-tooltip class="item" effect="dark" content="选择指定扩展查看" placement="top">
              <span class="role-span" style="line-height: 40px;"> {{title}}</span>
            </el-tooltip>
            <div style="float:right;margin-top:4px;" >
              <span>
                <el-button
                  icon="el-icon-plus"
                  @click="handleChildAdd"
                  :disabled="!current"
                  style="padding: 9px;margin-left:0px;"
                >新增</el-button>
                <el-button
                  :disabled="childListSelections&&childListSelections.length<=0"
                  icon="el-icon-delete"
                  :loading="childEditLoading"
                  @click="handleChildDelete(childListSelections)"
                  style="padding: 9px;margin-left:0px;"
                >删除</el-button>
              </span>
            </div>
          </div>
          <div class="content">
            <el-table
              ref="multipleTable"
              :height="tableHeight"
              style="width: 100%;"
              :data="childList"
              :row-style="{ height: '40px' }"
              :cell-style="{ padding: '0px' }"
              v-loading="childLoading"
              row-key="id"
              @selection-change="selectionChange"
            >
              <el-table-column type="selection" width="50" align="center"></el-table-column>
              <el-table-column label="名称"   prop="name"  :show-overflow-tooltip="true"  />
              <el-table-column label="编码"    prop="code"  :show-overflow-tooltip="true"  />
              <el-table-column label="操作" align="center" width="120px" >
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleChildEdit(scope.row)"
                  >编辑</el-button>
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleChildDelete([scope.row])"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 扩展新增 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="expandDialog" :title="expandTitle" width="500px">
      <el-form ref="expandForm" :model="expandForm" :rules="rules" size="small" label-width="80px" >
        <el-form-item label="扩展名称" prop="name">
          <el-input v-model="expandForm.name"  />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancel">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="expandsubmitMethod">确认</el-button>
      </div>
    </el-dialog>

    <!-- 扩展子级新增 编辑 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="childDialog" :title="childTitle" width="600px">
      <el-row :gutter="15" >
        <el-form ref="childForm" :model="childForm" :rules="rules" size="small" label-width="75px" >
          <el-form-item label="编码" prop="code">
            <el-input v-model="childForm.code"  />
          </el-form-item>
           <el-form-item label="名称" prop="name">
            <el-input v-model="childForm.name"  />
          </el-form-item>
           <el-form-item label="类型" prop="types">
            <el-select
                v-model="childForm.types"
                placeholder="请选择"
                size="small"
                style="width:100%;"
              >
                <el-option
                  v-for="item in typesList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="必填" prop="required">
            <el-radio-group v-model="childForm.required">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model.number="childForm.sort" :min="0" :max="99999" style="width:100%;" controls-position="right"  />
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input v-model="childForm.description" type="textarea" />
          </el-form-item>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancel">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="childsubmitMethod">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'expandConfig',
  data () {
    return {
      loading: false,
      tableHeight: window.innerHeight - 165,
      expandList: [],
      childList: [],
      current: null,
      query: {
        name: ''
      },
      expandTitle: '新增扩展',
      childTitle: '新增扩展属性',
      title: '扩展',
      expandDialog: false,
      childDialog: false,
      expandForm: {
        name: ''
      },
      childLoading: false,
      childForm: {
        name: '',
        code: '',
        types: null,
        required: '0',
        sort: 1,
        description: ''
      },
      typesList: [],
      submitloading: false,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ],
        code: [
          { required: true, message: '请编码', trigger: 'blur' }
        ],
        types: [
          { required: true, message: '请选择字段类型', trigger: 'blur' }
        ],
        required: [
          { required: true, message: '请选择', trigger: 'blur' }
        ]
      },
      childListSelections: [],
      childEditLoading: false
    }
  },

  mounted() {
    this.getList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 165
    }
  },
  methods: {
    async getList() {
      this.loading = true
      const params = { content: this.query.name }
      const { data, msg, code } = await this.$pub.post('/proc/class/list', params)
      this.loading = false
      this.current = null
      this.childList = []
      if (code === 200) {
        this.expandList = data.list || []
      } else {
        this.expandList = []
        this.$message({
          type: 'error',
          message: msg || '获取扩展列表出错了',
          showClose: true
        })
      }
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return this.current && row.id === this.current.id ? 'isactive' : ''
    },
    handleExpandDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除"' + row.name + '"的扩展数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/proc/class/del', { id })
        if (code === 200) {
          this.getList()
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
    handleExpandAdd() {
      this.current = null
      this.childList = []
      this.expandTitle = '新增扩展'
      this.expandDialog = true
      this.expandForm = {
        name: ''
      }
    },
    handleExpandEdit(row) {
      this.expandTitle = '编辑扩展'
      this.current = row
      this.expandDialog = true
      this.expandForm = {
        name: row.name
      }
    },
    async rowClick(row) {
      this.title = '扩展：' + row.name
      this.current = row
      this.childLoading = true
      const { data, msg, code } = await this.$pub.post('/proc/step/list', { fid: row.class_code })
      this.childLoading = false
      if (code === 200) {
        this.childList = data.list || []
      } else {
        this.childList = []
        this.$message({
          type: 'error',
          message: msg || '获取扩展属性列表出错了',
          showClose: true
        })
      }
    },
    cancel() {
      this.expandDialog = false
      this.childDialog = false
    },
    expandsubmitMethod() {
      this.$refs.expandForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitloading = true
            const url = this.current ? '/proc/class/edit' : '/proc/class/add'
            const add = {
              ...this.expandForm
            }
            const edit = {
              id: this.current ? this.current.id : '',
              ...add
            }
            const params = this.current ? edit : add
            const { code, message } = await this.$pub.post(url, params)
            if (code === 200) {
              this.$message({
                type: 'success',
                message: '操作成功',
                showClose: true
              })
              this.getList()
              this.cancel()
            } else {
              this.$message({
                type: 'error',
                message: message || '操作失败',
                showClose: true
              })
            }
            this.submitloading = false
          } catch (err) {
            this.submitloading = false
          }
        }
      })
    },

    // 扩展属性
    selectionChange(val) {
      this.childListSelections = val
    },
    handleChildAdd() {
      this.childDialog = true
      this.childTitle = '新增扩展属性'
      this.childForm = {
        name: '',
        code: '',
        types: null,
        required: '0',
        sort: 1,
        description: ''
      }
    },
    handleChildEdit(row) {
      this.childDialog = true
      this.childTitle = '编辑扩展属性'
      this.childForm = {
        ...row,
        extandId: this.current ? this.current.id : null
      }
    },
    handleChildDelete(arrs) {
      this.childEditLoading = true
      const ids = arrs.map(m => m.id)
      this.$confirm('是否确认删除"' + this.current.name + '"下的选中的属性数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/proc/step/del', { ids })
        this.childEditLoading = false
        if (code === 200) {
          this.rowClick(this.current)
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
      }).catch(() => {
        this.childEditLoading = false
      })
    },
    childsubmitMethod() {
      this.$refs.childForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitloading = true
            const url = this.childForm.id ? '/proc/step/edit' : '/proc/step/add'
            const params = {
              ...this.childForm,
              createUser: this.$store.state.userInfo.id
            }
            const { code, message } = await this.$pub.post(url, params)
            if (code === 200) {
              this.$message({
                type: 'success',
                message: '操作成功',
                showClose: true
              })
              this.rowClick(this.current)
              this.cancel()
            } else {
              this.$message({
                type: 'error',
                message: message || '操作失败',
                showClose: true
              })
            }
            this.submitloading = false
          } catch (err) {
            this.submitloading = false
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.expand_config{
  width: 100%;
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .el-card__body{
    padding: 0;
  }
  .el-card__header{
    padding: 10px ;
  }
  .clearfix{
    display:flex;
    flex-wrap: nowrap;
    .el-input-group__prepend{
      padding:0 10px;
    }
    .el-input__inner{
      width:169px!important;
    }
  }
  tr{
    cursor:pointer;
  }
  tr.isactive td{
    background: #4478f1!important;
    color: #fff!important;
    .el-button--text{
      color:#fff;
    }
  }
}
</style>
