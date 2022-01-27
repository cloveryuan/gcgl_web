<template>
  <div class="class_config">
    <el-row :gutter="15" class="role_t_wrap">
      <!--工序列表-->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" >
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-input placeholder="请输入内容" v-model="query.className"  size="small" style="width:440px;" clearable @blur="getList" @clear="getList"  @keyup.enter.native="getList">
              <template slot="prepend">名称</template>
            </el-input>
            <div class="el-input-group">
              <el-button
                type="primary"
                size="small"
                @click="getList"
              >查询</el-button>
            </div>
            <el-button
              icon="el-icon-plus"
              size="small"
              @click="handleClassAdd"
              style="margin-left:auto;padding: 6px 9px"
            >新增</el-button>
            <el-button
              v-if="!query.className"
              :icon="isClassSort?'el-icon-check':'el-icon-s-operation'"
              size="small"
              :disabled="classList&&classList.length<=0"
              :loading="classSortLoading"
              @click="handleClassSort"
              style="margin-left:auto;padding: 6px 9px"
            >{{isClassSort?'保存排序':'排序'}}</el-button>
          </div>
          <el-table
            ref="table"
            v-loading="loading"
            :height="tableHeight"
            style="width: 100%;"
            :data="classList"
            @row-click="rowClick"
            :row-style="{ height: '40px' }"
            :cell-style="{ padding: '0px' }"
            :row-class-name="tableRowClassName"
            row-key="id"
            class="classTable"
          >
            <el-table-column label="工序名称"  prop="class_name"  :show-overflow-tooltip="true"  />
            <el-table-column label="工序编码"  prop="class_code"  :show-overflow-tooltip="true"  />
            <el-table-column label="排序" prop="index" width="60px"  />
            <el-table-column label="操作" align="center" width="120px" >
              <template slot-scope="scope">
                 <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleClassEdit(scope.row)"
                >编辑</el-button>
                <!-- <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleClassDelete(scope.row)"
                >删除</el-button> -->
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 工序步骤编辑 新增 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" >
        <el-card class="box-card" shadow="never" >
          <div slot="header" >
            <el-tooltip class="item" effect="dark" content="选择指定工序查看工序步骤" placement="top">
              <span class="role-span" style="line-height: 32px;"> {{title}}</span>
            </el-tooltip>
            <div style="float:right;" >
              <!-- <el-button
                icon="el-icon-s-fold"
                size="small"
                @click="handleExtandSeting"
                style="padding: 9px;"
              >扩展配置</el-button> -->
              <span v-if="current">
                <el-button
                  icon="el-icon-plus"
                  size="small"
                  @click="handleProcAdd"
                  style="padding: 9px;margin-left:0px;"
                >新增</el-button>
                <!-- <el-button
                  :disabled="procListSelections&&procListSelections.length<=0"
                  icon="el-icon-delete"
                  size="small"
                  :loading="procEditLoading"
                  @click="handleProcDelete(procListSelections)"
                  style="padding: 9px;margin-left:0px;"
                >删除</el-button> -->
                <el-button
                  :disabled="procList&&procList.length<=0"
                  :icon="isProcSort?'el-icon-check':'el-icon-s-operation'"
                  size="small"
                  :loading="procSortLoading"
                  @click="handleProcSort"
                  style="padding: 9px;margin-left:0px;"
                >{{isProcSort?'保存排序':'排序'}}</el-button>
              </span>
            </div>
          </div>
          <div class="content">
            <el-table
              ref="multipleTable"
              :height="tableHeight"
              style="width: 100%;"
              :data="procList"
              :row-style="{ height: '40px' }"
              :cell-style="{ padding: '0px' }"
              v-loading="procLoading"
              row-key="id"
              class="procTable"
              :row-class-name="tableprocRowClassName"
              @selection-change="selectionChange"
            >
              <el-table-column type="selection" width="50" align="center"></el-table-column>
              <el-table-column label="工序步骤名称"   prop="proc_name"  :show-overflow-tooltip="true"  />
              <el-table-column label="工序步骤编码"    prop="proc_code"  :show-overflow-tooltip="true"  />
              <el-table-column label="设计工序" align="center" width="120px" >
                <template slot-scope="scope">
                  <span>{{scope.row.is_design==='0'?'否':'是'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="关键工序" align="center" width="120px" >
                <template slot-scope="scope">
                  <span>{{scope.row.is_core==='0'?'否':'是'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="填报物料" align="center" width="120px" >
                <template slot-scope="scope">
                  <span>{{scope.row.is_fill_device==='0'?'否':'是'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="排序" prop="index" width="60px"  />
              <el-table-column label="操作" align="center" width="120px" >
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleProcEdit(scope.row)"
                  >编辑</el-button>
                  <!-- <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleProcDelete([scope.row])"
                  >删除</el-button> -->
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工序新增 -->
    <el-dialog custom-class="gxwrap" append-to-body :close-on-click-modal="false" :visible.sync="classDialog" :title="classTitle" width="500px">
      <el-form ref="classForm" :model="classForm" :rules="rules" size="small" label-width="80px" >
        <el-form-item label="工序名称" prop="class_name">
          <el-input v-model="classForm.class_name"  />
        </el-form-item>
        <el-form-item label="工序编码" prop="class_code">
          <el-input v-model="classForm.class_code"  :disabled="true"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancel">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="classsubmitMethod">确认</el-button>
      </div>
    </el-dialog>

    <!-- 工序步骤 -->
    <el-dialog custom-class="gxbzwrap" append-to-body :close-on-click-modal="false" :visible.sync="procDialog" :title="procTitle" width="800px">
        <el-form ref="procForm" :model="procForm" :rules="rules" size="small" label-width="135px" >
         <el-row  class="procForm">
          <el-col :span="24">
            <el-form-item label="上级工序" prop="fid" >
              <treeselect
                v-model="procForm.fid"
                :options="classList"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级工序"
                :clearable="false"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序步骤名称" prop="proc_name">
              <el-input v-model="procForm.proc_name"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序步骤编码" prop="proc_code">
              <el-input v-model="procForm.proc_code" :disabled="true" />
            </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item label="材料名称" prop="material_name">
              <el-input v-model="procForm.material_name"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报工名称" prop="report_work_name">
              <el-input v-model="procForm.report_work_name"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上报类型" prop="report_type">
              <el-select
                v-model="procForm.report_type"
                placeholder="请选择"
                size="small"
                style="width:100%;"
              >
                <el-option
                  v-for="item in report_typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报工标识" prop="is_report_work">
              <el-radio-group v-model="procForm.is_report_work">
                <el-radio label="1">显示</el-radio>
                <el-radio label="0">不显示</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传文件类型" prop="file_type" >
              <el-select
                v-model="procForm.file_type"
                placeholder="请选择"
                size="small"
                style="width:100%;"
              >
                <el-option
                  v-for="item in file_typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
           </el-col>
          <el-col :span="12">
            <el-form-item label="校验位置" prop="vaild_Postion">
              <el-radio-group v-model="procForm.vaild_Postion">
                <el-radio label="1">校验</el-radio>
                <el-radio label="0">不校验</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置" prop="position">
              <el-select
                v-model="procForm.position"
                placeholder="请选择"
                size="small"
                style="width:100%;"
              >
                <el-option
                  v-for="item in positionList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
           </el-col>
           <el-col :span="12">
            <el-form-item label="添加水印" prop="is_watermark">
              <el-radio-group v-model="procForm.is_watermark">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="procForm.sort" :min="0" :max="99999" style="width:100%;" controls-position="right"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现场勘测" prop="is_survey">
              <el-radio-group v-model="procForm.is_survey">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大上传附件数量" prop="upload_num">
              <el-input-number v-model.number="procForm.upload_num" :min="1"  style="width:100%;" controls-position="right"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计工序" prop="is_design">
              <el-radio-group v-model="procForm.is_design">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="允许补充数量" prop="replenish_num">
              <el-input-number v-model.number="procForm.replenish_num" :min="0"  style="width:100%;" controls-position="right"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键工序" prop="is_core">
              <el-radio-group v-model="procForm.is_core">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="360度全景照片" prop="is_360">
              <el-radio-group v-model="procForm.is_360">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需要填写ip工序" prop="is_ip">
              <el-radio-group v-model="procForm.is_ip">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="填报物料" prop="is_fill_device">
              <el-radio-group v-model="procForm.is_fill_device">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="物料规范描述" prop="description">
              <el-input v-model="procForm.description" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="cancel">取消</el-button>
        <el-button size="mini" :loading="submitloading" type="primary" @click="procsubmitMethod">确认</el-button>
      </div>
    </el-dialog>

    <!-- 扩展配置 -->
    <el-drawer title="扩展配置" :visible.sync="expandOpen" size="1200px"  append-to-body custom-class="expandproc">
     <Expand></Expand>
    </el-drawer>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Sortable from 'sortablejs'
import Expand from './expand.vue'
export default {
  name: 'classConfig',
  components: {
    Treeselect, Expand
  },
  data () {
    const valueValid = (rule, value, callback) => {
      var reg = /^[0-9a-zA-Z-]{1,}$/
      if (value && value.indexOf(' ') === -1) {
        value = value.replace(/\s*/g, '')
        if (!reg.test(value)) {
          callback(new Error('仅支持数字，字母，-'))
        } else {
          callback()
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    return {
      loading: false,
      tableHeight: window.innerHeight - 215,
      classList: [],
      procList: [],
      current: null,
      query: {
        className: '',
        status: '-1'
      },
      classTitle: '新增工序',
      procTitle: '新增工序步骤',
      title: '工序步骤',
      classDialog: false,
      procDialog: false,
      classForm: {
        class_code: '',
        class_name: ''
      },
      procLoading: false,
      procForm: {
        fid: '',
        proc_code: '',
        proc_name: '',
        material_name: '', // 材料名称
        is_report_work: '1', // 报工标识
        report_work_name: '', // 报工名称
        description: '', // 物料规范描述
        report_type: null, // 上报类型
        vaild_Postion: '1', // 校验位置
        is_watermark: '1', // 添加加水印(0:否1:是)
        position: null, // 位置
        file_type: null, // 上传文件类型
        upload_num: 1, // 最大上传附件数量
        replenish_num: 1, // 允许补充数量
        sort: 1,
        is_design: '0', // 设计工序
        is_survey: '0', // 现场勘测(否1:是)
        is_core: '0', // 关键工序步骤(0否1是)
        is_360: '0', // 360度全景照片(0否1是)
        is_ip: '0', // 需要填写ip工序(0否1是)
        is_fill_device: '0', // 是否填报物料
        extand_id: 0
      },
      rules: {
        class_code: [
          { required: true, message: '请输入工序编码', trigger: 'blur' },
          { validator: valueValid, trigger: 'blur' }
        ],
        class_name: [
          { required: true, message: '请输入工序名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入', trigger: 'blur', type: 'number' }
        ],

        fid: [
          { required: true, message: '请选择上级工序', trigger: 'blur' }
        ],
        proc_code: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          { validator: valueValid, trigger: 'blur' }
        ],
        proc_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        is_report_work: [
          { required: true, message: '请选择是否显示报工标识', trigger: 'blur' }
        ],
        report_work_name: [
          { required: true, message: '请输入报工名称', trigger: 'blur' }
        ],
        report_type: [
          { required: true, message: '请选择上传文件类型', trigger: 'blur' }
        ],
        vaild_Postion: [
          { required: true, message: '请选择是否校验位置', trigger: 'blur' }
        ],
        is_watermark: [
          { required: true, message: '请选择是否添加水印', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '请选择位置', trigger: 'blur' }
        ],
        file_type: [
          { required: true, message: '请选择上传文件类型', trigger: 'blur' }
        ],
        upload_num: [
          { required: true, message: '请输入最大上传附近数量', trigger: 'blur' }
        ],
        replenish_num: [
          { required: true, message: '请输入允许补充数量', trigger: 'blur' }
        ],
        is_design: [
          { required: true, message: '请选择是否是设计工序型', trigger: 'blur' }
        ],
        is_survey: [
          { required: true, message: '请选择是否是现场勘测', trigger: 'blur' }
        ],
        is_core: [
          { required: true, message: '请选择是否是关键工序步骤', trigger: 'blur' }
        ],
        is_360: [
          { required: true, message: '请选择是否是360度全景照片', trigger: 'blur' }
        ],
        is_ip: [
          { required: true, message: '请选择是否需要填写ip工序', trigger: 'blur' }
        ],
        is_fill_device: [
          { required: true, message: '请选择是否需要填报物料', trigger: 'blur' }
        ]
      },
      submitloading: false,
      normalizer (node) {
        if (node.proc_list) {
          node.proc_list.forEach(f => {
            f.isDisabled = true
          })
        }
        return {
          id: node.class_code ? node.class_code : node.proc_code,
          label: node.class_name ? node.class_name : node.proc_name,
          children: node.proc_list
        }
      },
      report_typeList: [],
      positionList: [],
      file_typeList: [],
      procListSelections: [],
      sortableObj: { // 可排序对象
        class: null,
        proc: null
      },
      isClassSort: false,
      classSortLoading: false,
      isProcSort: false,
      procSortLoading: false,
      procEditLoading: false,
      expandOpen: false // 扩展
    }
  },

  created() {
    this.getDictList()
    document.body.ondrop = function (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  mounted() {
    this.getList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 215
    }
  },
  methods: {
    getDictList() {
      const dicts = ['report_type', 'position', 'file_type']
      // 上报类型  位置 上传文件类型
      dicts.forEach(f => {
        this.$dict(this, f).then((res) => {
          if (res.code === 200) {
            const _name = f + 'List'
            this[_name] = res.data || []
          } else {
            this.$message({
              type: 'error',
              message: '字典出错了' + f,
              showClose: true
            })
            this[f + 'list'] = []
          }
        })
      })
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return this.current && row.id === this.current.id ? 'isactive' : ''
    },
    tableprocRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return ''
    },
    async getList() {
      this.loading = true
      const params = { content: this.query.className }
      const { data, msg, code } = await this.$pub.post('/proc/class/list', params)
      this.loading = false
      this.current = null
      this.procList = []
      if (code === 200) {
        this.classList = data.list || []
      } else {
        this.classList = []
        this.$message({
          type: 'error',
          message: msg || '获取工序列表出错了',
          showClose: true
        })
      }
    },
    handleClassDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除"' + row.class_name + '"的工序数据?', '警告', {
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
    handleClassAdd() {
      this.current = null
      this.procList = []
      this.classTitle = '新增工序'
      this.classDialog = true
      this.classForm = {
        class_code: '',
        class_name: ''
      }
    },
    async handleClassSort() {
      this.isClassSort = !this.isClassSort
      if (this.isClassSort) {
        this.getList()
        this.rowDrop()
      } else {
        this.sortableObj.class && this.sortableObj.class.destroy()
        this.classSortLoading = true
        const ids = this.classList.map(m => m.id)
        const { code, message } = await this.$pub.post('/proc/class/sort', { ids })
        this.classSortLoading = false
        if (code === 200) {
          this.$message({
            type: 'success',
            message: message || '排序成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '排序失败',
            showClose: true
          })
        }
      }
    },
    handleClassEdit(row) {
      this.classTitle = '编辑工序'
      this.current = row
      this.classDialog = true
      this.classForm = {
        class_code: row.class_code,
        class_name: row.class_name
      }
    },
    async rowClick(row) {
      this.title = '工序：' + row.class_name
      this.current = row
      this.procLoading = true
      const { data, msg, code } = await this.$pub.post('/proc/step/list', { fid: row.class_code })
      this.procLoading = false
      if (code === 200) {
        this.procList = data.list || []
      } else {
        this.procList = []
        this.$message({
          type: 'error',
          message: msg || '获取工序步骤列表出错了',
          showClose: true
        })
      }
    },
    cancel() {
      this.classDialog = false
      this.procDialog = false
    },
    classsubmitMethod() {
      this.$refs.classForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitloading = true
            const url = this.current ? '/proc/class/edit' : '/proc/class/add'
            const add = {
              ...this.classForm,
              fid: '0'
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

    // 工序步骤
    selectionChange(val) {
      this.procListSelections = val
    },
    handleProcAdd() {
      this.procDialog = true
      this.procTitle = '新增工序步骤'
      this.procForm = {
        fid: this.current ? this.current.class_code : null,
        proc_code: '',
        proc_name: '',
        material_name: '', // 材料名称
        is_report_work: '1', // 报工标识
        report_work_name: '', // 报工名称
        description: '', // 物料规范描述
        report_type: null, // 上报类型
        vaild_Postion: '1', // 校验位置
        is_watermark: '1', // 添加加水印(0:否1:是)
        position: null, // 位置
        file_type: null, // 上传文件类型
        upload_num: 1, // 最大上传附件数量
        replenish_num: 1, // 允许补充数量
        sort: 1,
        is_design: '0', // 设计工序
        is_survey: '0', // 现场勘测(否1:是)
        is_core: '0', // 关键工序步骤(0否1是)
        is_360: '0', // 360度全景照片(0否1是)
        is_ip: '0', // 需要填写ip工序(0否1是)
        is_fill_device: '0', // 是否填报物料
        extand_id: 0
      }
    },
    async handleProcSort() {
      this.isProcSort = !this.isProcSort
      if (this.isProcSort) {
        this.rowClick(this.current)
        this.procDrop()
      } else {
        this.sortableObj.proc && this.sortableObj.proc.destroy()
        this.procSortLoading = true
        const ids = this.procList.map(m => m.id)
        const { code, message } = await this.$pub.post('/proc/step/sort', { ids })
        this.procSortLoading = false
        if (code === 200) {
          this.$message({
            type: 'success',
            message: message || '排序成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '排序失败',
            showClose: true
          })
        }
      }
    },
    handleProcEdit(row) {
      this.procDialog = true
      this.procTitle = '编辑工序步骤'
      this.procForm = {
        ...row,
        fid: this.current ? this.current.class_code : null
      }
    },
    handleProcDelete(arrs) {
      this.procEditLoading = true
      const ids = arrs.map(m => m.id)
      this.$confirm('是否确认删除"' + this.current.class_name + '"下的选中的工序步骤数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/proc/step/del', { ids })
        this.procEditLoading = false
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
        this.procEditLoading = false
      })
    },
    procsubmitMethod() {
      this.$refs.procForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitloading = true
            const url = this.procForm.id ? '/proc/step/edit' : '/proc/step/add'
            const params = {
              ...this.procForm,
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
    },
    // 拖动
    rowDrop() {
      const tbody = document.querySelector('.classTable .el-table__body-wrapper tbody')
      const _this = this
      this.sortableObj.class = Sortable.create(tbody, {
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.classList.splice(oldIndex, 1)[0]
          _this.classList.splice(newIndex, 0, currRow)
        }
      })
    },
    procDrop() {
      const tbody = document.querySelector('.procTable .el-table__body-wrapper tbody')
      const _this = this
      this.sortableObj.proc = Sortable.create(tbody, {
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.procList.splice(oldIndex, 1)[0]
          _this.procList.splice(newIndex, 0, currRow)
        }
      })
    },
    // 扩展
    handleExtandSeting() {
      this.expandOpen = true
    }
  }
}
</script>

<style lang="scss">
.class_config{
  width: 100%;
  height: 100%;
  padding: 0 20px;
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
.sortable-ghost {
  background-color: #F4E2C9!important;
}
.procForm .el-radio-group{
  line-height:32px;
}
.gxbzwrap{
  margin-top:5vh!important;
}
.gxwrap .el-input.is-disabled .el-input__inner,.procForm .el-input.is-disabled .el-input__inner{
  background: #f9f9f9;
  color:#333;
}
</style>
