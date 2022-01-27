<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击左侧字典查看详情</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <div class="btn-container">
        <!-- 搜索 -->
        <!-- <el-input v-model="query" clearable size="small" placeholder="输入字典项查询" style="width: 240px;" @keyup.enter.native="handleQuery" @change="handleQuery">
          <el-button slot="append"  icon="el-icon-search" @click="handleQuery"></el-button>
        </el-input> -->
        <!-- v-if="checkPermission(['admin','dict:add']) && this.$refs.dictDetail && this.$refs.dictDetail.dictName" -->
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="showAddFormDialog"
        >新增</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="!multiple"
          @click="handleDelete"
          :loading="delLoading"
        >删除</el-button>
      </div>
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialog" :title="getFormTitle()" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px" >
          <el-form-item label="字典项" prop="label">
            <el-input v-model="form.label" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典值" prop="value">
            <el-input v-model="form.value" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" type="text" @click="cancel">取消</el-button>
          <el-button size="mini" :loading="submitloading" type="primary" @click="submitMethod">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table v-loading="loading" :data="tableData" :height="tableHeight" style="width: 100%;" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" reserve-selection />
        <el-table-column label="所属字典">{{ dictName }}</el-table-column>
        <el-table-column prop="label" label="字典项" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="sort" label="排序" />
        <el-table-column  label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button  size="mini" icon="el-icon-edit"  type="text" style="margin-right:5px;"  @click="showEditFormDialog(scope.row)">编辑</el-button>
            <el-popover
              :ref="scope.row.id"
              placement="top"
              width="180"
            >
              <p>确定删除本条数据吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                <el-button :loading="delLoading" type="primary" size="mini" @click="delMethod([scope.row.id])">确定</el-button>
              </div>
              <el-button icon="el-icon-delete" slot="reference" type="text"  size="mini">删除</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
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
    </div>
  </div>
</template>

<script>
import mixin from './mixin'
export default {
  mixins: [mixin],
  data() {
    var labelValid = (rule, value, callback) => {
      if (value && value.indexOf(' ') === -1) {
        value = value.replace(/\s*/g, '')
        if (value.length > 50) {
          callback(new Error('请输入50字以内'))
        } else {
          callback()
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    var valueValid = (rule, value, callback) => {
      var reg = /^[0-9]+.?[0-9]*$/
      if (value && value.indexOf(' ') === -1) {
        value = value.replace(/\s*/g, '')
        if (value.length > 20) {
          callback(new Error('请输入20个数以内'))
        } else {
          if (!reg.test(value)) {
            callback(new Error('请输入数字'))
          } else {
            callback()
          }
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    return {
      title: '字典详情',
      dictName: '',
      query: '',
      form: { id: null, label: null, value: null, sort: 999 },
      rules: {
        label: [
          { required: true, message: '请输入字典项', trigger: 'blur' },
          { validator: labelValid, trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' },
          { validator: valueValid, trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      tableHeight: window.innerHeight - 285,
      currentDict: {},
      ids: [],
      multiple: false
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 285
    }
    this.type = 2
  },
  methods: {
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = selection.length >= 1
    },
    handleDelete() {
      this.$confirm(
        '是否确认删除已选中的字典项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.delMethod(this.ids)
      })
        .catch(function() {})
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .el-input-number .el-input__inner {
    text-align: left;
  }
  .btn-container{
    display:flex;
  }
</style>
