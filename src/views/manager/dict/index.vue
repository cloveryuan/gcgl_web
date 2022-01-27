<template>
  <div class="dict_wrap">
        <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false"  :visible.sync="dialog" :title="getFormTitle()" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典名称" prop="name" >
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="form.label" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述" prop="remark" >
          <el-input v-model="form.remark" type="textarea" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" size="mini" @click="cancel">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="submitMethod">确认</el-button>
      </div>
    </el-dialog>
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典列表</span>
            <!-- 新增    v-permission="['admin','dict:add']"-->
            <el-button
              class="filter-item"
              size="mini"
              style="float: right;p"
              type="primary"
              icon="el-icon-plus"
              @click="showAddFormDialog"
            >新增</el-button>
          </div>
          <!--工具栏-->
          <div class="head-container">
            <!-- 搜索 -->
            <el-input v-model="query" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 240px;" @keyup.enter.native="handleQuery" @change="handleQuery">
              <el-button slot="append"   icon="el-icon-search" @click="handleQuery"></el-button>
            </el-input>
          </div>
          <!--表格渲染-->
          <el-table v-loading="loading" :height="tableHeight" :data="tableData" highlight-current-row style="width: 100%;" @current-change="handleCurrentChange">
            <el-table-column :show-overflow-tooltip="true" prop="name" label="字典名称" />
            <el-table-column prop="label" label="字典标签" />
            <el-table-column :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column  label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button  size="mini" type="text" icon="el-icon-edit"  @click="showEditFormDialog(scope.row)" style="margin-right:5px;">编辑</el-button>
                <!-- v-permission="['admin','dict:edit']" v-permission="['admin','dict:del']" -->
                <el-popover :ref="scope.row.id" placement="top" width="180">
                  <p>此操作将删除字典与对应的字典详情，确定要删除吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                    <el-button :loading="delLoading" type="primary" size="mini" @click="delMethod(scope.row.id)">确定</el-button>
                  </div>
                  <el-button slot="reference" icon="el-icon-delete" type="text" size="mini" >删除</el-button>
                </el-popover>
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
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
          </div>
          <dictDetail ref="dictDetail"  />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dictDetail from './dictDetail'
import mixin from './mixin'
export default {
  name: 'managerDict',
  mixins: [mixin],
  data () {
    var nameValid = (rule, value, callback) => {
      if (value && value.indexOf(' ') === -1) {
        // this.data.forEach(element => {
        //   if (value === element.name) {
        //     callback(new Error('该名称已经存在请重输'))
        //   } else {
        //     if (value && value.length > 50) {
        //       callback(new Error('该名称过长请重输'))
        //     } else {
        //       callback()
        //     }
        //   }
        // })
        if (value && value.length > 50) {
          callback(new Error('该名称过长请重输'))
        } else {
          callback()
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    var remarkValid = (rule, value, callback) => {
      if (value.length > 200) {
        callback(new Error('请输入200字以内'))
      } else {
        callback()
      }
    }
    var labelValid = (rule, value, callback) => {
      const r = new RegExp(/^[^\u4E00-\u9FA5]+$/)
      if (value && value.indexOf(' ') === -1) {
        value = value.replace(/\s*/g, '')
        if (!r.test(value)) {
          callback(new Error('不能包含汉字'))
        } else {
          callback()
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    return {
      tableHeight: window.innerHeight - 300,
      title: '字典',
      form: {
        name: '',
        remark: '',
        label: ''
      },
      query: '',
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: nameValid, trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入描述', trigger: 'blur' },
          { validator: remarkValid, trigger: 'change' }
        ],
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' },
          { validator: labelValid, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 300
    }
    this.type = 1
    this.getList()
  },
  components: {
    dictDetail
  },
  methods: {
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        this.$refs.dictDetail.dictName = val.name
        this.$refs.dictDetail.currentDict = val
        this.$refs.dictDetail.handleQuery()
      }
    }
  }
}
</script>

<style lang="scss">
.head-container .filter-item{
  display: inline-block;
  vertical-align: middle;
  margin: 0 3px 10px 0;
}
.head-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin: 0 3px 10px 0;
    input {
      height: 28.5px;
      line-height: 28.5px;
    }
  }
  .el-button+.el-button {
    margin-left: 0 !important;
  }
  .el-select__caret.el-input__icon.el-icon-arrow-up{
    line-height: 28.5px;
  }
  .date-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    height: 28.5px;
    width: 223px !important;
  }
}
</style>
