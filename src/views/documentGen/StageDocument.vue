<template>
  <div class="stage_document">
    <div class="_top">
      <el-select
        v-model="searchstatus"
        placeholder="请选择项目状态"
        value-key="id"
        @change="handleStatusChange"
        clearable
        size="mini"
      >
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-button @click="refresh"  size="mini" style="margin-left:10px">刷新</el-button>
      <el-button type="primary" @click="add" size="mini" style="float:right;">新增</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '0px' }"
      :height="tableHeight"
      v-loading="tableLoading"
    >
      <af-table-column
        prop="id"
        label="编号"
        align="center"
        width="80px"
      >
      </af-table-column>
      <af-table-column prop="file_name" label="文件名" align="center" width="220px"></af-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center" width="170px">
        <template slot-scope="scope">
          <span>{{ moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间" align="center"  width="170px">
        <template slot-scope="scope">
          <span v-if="scope.row.status != 1">{{ moment(scope.row.end_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1" style="color: orange">已创建</span>
          <span v-if="scope.row.status === 2" style="color: green">已生成</span>
          <span v-if="scope.row.status === 3" style="color: red">错误</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="执行信息" align="center">
      </el-table-column>
      <el-table-column
        prop="query_para"
        label="查询参数"
        align="center"
        style="display: flex; justify-content: space-around;"
        width="100px"
      >
        <template slot-scope="scope">
          <el-tooltip
            effect="dark"
            :content="scope.row.query_para"
            placement="top"
            :enterable="false"
            style="margin-left:8px"
          >
            <span style="border-bottom: 1px solid #719bff">参数</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80px">
        <template slot-scope="scope">
          <a :href="scope.row.ftp_path.substr(0, scope.row.ftp_path.length - 1)" target="_blank" v-if="scope.row.status === 2 && scope.row.ftp_path"  style="border-bottom: 1px solid #719bff ;text-decoration: none;">下载</a>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="阶段文档新增" width="650px"  :visible.sync="addFlag">
      <el-form ref="addForm" size="small" label-position="right" label-width="70px" :rules="rules" :model="form" v-if="addFlag">
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="form.project"
            placeholder="请选择"
            style="width:100%"
            value-key="id"
            @change="handleProjectChange"
          >
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.projectName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="子系统">
          <el-select
            v-model="form.child_code"
            clearable
            style="width:100%"
            placeholder="默认所有子系统"
          >
            <el-option
              v-for="item in childs"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select
            v-model="form.area"
            clearable
            style="width:100%"
            placeholder="默认所有区域"
          >
            <el-option
              v-for="item in areas"
              :key="item.value"
              :label="item.value"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工序">
          <el-cascader
            v-model="form.proc_code"
            :options="procs"
            :props="procsProps"
            collapse-tags
            size="small"
            filterable
            style="width: 100%"
            :key="iscascaderShow"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="施工单位">
            <el-select
              v-model="form.dept_id"
              clearable
              collapse-tags
              style="width:100%"
              placeholder="选择施工单位"
            >
              <el-option
                v-for="item in BuilderList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="点位列表">
          <div class="wrap_up">
           <el-upload
              drag
              ref="uploadFile"
              action="#"
              accept=".xlsx"
              :auto-upload="false"
              :on-error="handleError"
              :before-upload="beforeAvatarUpload"
              :file-list="fileList"
              :http-request="httpRequest"
              :on-change="handleChange"
              :on-remove="handleRemove"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">选取文件<em></em></div>
            </el-upload>
            <!-- <p v-if="file_url" class="tip"><el-link type="primary" :href="file_url">下载模板</el-link></p> -->
            <div class="el-upload__tip" slot="tip">
              <p>导入须知:</p>
              <p>1.文件格式目前仅支持XLSX</p>
              <p>2.单次只能上传一份文件</p>
              <p>3.内容格式请参考  <el-link type="primary" :href="file_url">导入模板</el-link></p>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="导出照片">
          <el-radio-group v-model="form.audit_status">
            <el-radio :label="statu.yes">已审</el-radio>
            <el-radio :label="statu.no">未审核</el-radio>
            <el-radio :label="statu.all">全部</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出字段">
          <el-checkbox-group v-model="form.exp_fileds">
            <el-checkbox v-for="item in exp_filedsList" :disabled="item.isSure" :label="item.value" :key="item.value">{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div style="margin-top:30px;padding-bottom:30px;">
        <el-button
          style="float: right;"
          type="primary"
          @click="submit"
          v-loading="submitloading"
        >确认生成</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import mixin from '@/mixins/common.js'
import moment from 'moment'
export default {
  name: 'StageDocument',
  mixins: [mixin],
  data () {
    return {
      searchstatus: null,
      statusList: [],
      tableData: [],
      tableHeight: window.innerHeight - 180,
      tableLoading: false,
      addFlag: false,
      form: {
        project: null,
        child_code: '',
        area: '',
        proc_code: [],
        dept_id: '',
        audit_status: 'yes',
        exp_fileds: ['point_code', 'point_name']
      },
      rules: {
        project: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ]
      },
      procsProps: {
        multiple: true
      },
      iscascaderShow: 0,
      statu: {
        yes: 'yes',
        no: 'no',
        all: 'all'
      },
      fileList: [],
      file: [],
      exp_filedsList: [
        { value: 'point_code', label: '点位编码', isSure: true },
        { value: 'point_name', label: '点位名称', isSure: true },
        { value: 'area', label: '辖区' },
        { value: 'coor', label: '经纬度' }
      ],
      submitloading: false,
      file_url: ''
    }
  },
  computed: {

  },
  mounted() {
    this.getStatus()
    this.refresh()
    this.getFileUrl()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
  },
  methods: {
    moment,
    getStatus() {
      this.$dict(this, 'documentStatus').then(res => {
        if (res.code === 200) {
          this.statusList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了documentStatus',
            showClose: true
          })
          this.statusList = []
        }
      })
    },
    async handleStatusChange() {
      this.tableLoading = true
      const params = this.searchstatus ? {
        user_id: this.$store.state.userInfo.id,
        gen_type: 4,
        status: this.searchstatus
      } : {
        user_id: this.$store.state.userInfo.id,
        gen_type: 4
      }
      const { data } = await this.$pub.post('/gen/gen-list', params)
      this.tableData = data || []
      this.tableLoading = false
    },
    refresh() {
      this.handleStatusChange()
    },
    async getFileUrl() {
      // const { data, code } = await this.$pub.post('')
      // if (code === 200) {
      //   const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
      //   const baseurl = process.env.VUE_APP_BASE_URL + env
      //   this.file_url = baseurl + data.url
      // } else {
      //   this.file_url = ''
      // }
      const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
      const baseurl = process.env.VUE_APP_BASE_URL + env
      this.file_url = baseurl + '/gen/photo-doc-templates/templatesImp.xlsx'
    },
    add() {
      this.pointList = null
      this.form = {
        project: null,
        child_code: null,
        area: null,
        proc_code: [],
        dept_id: '',
        audit_status: 'yes',
        exp_fileds: ['point_code', 'point_name']
      }
      this.fileList = []
      this.file = []
      this.getProjectList()
      this.addFlag = true
    },
    // 新增 start
    handleProjectChange() {
      this.iscascaderShow++
      const obj = {
        child_code: '',
        area: '',
        proc_code: [],
        dept_id: '',
        audit_status: 'yes',
        exp_fileds: ['point_code', 'point_name']
      }
      Object.assign(this.form, obj)
      this.childs = []
      this.areas = []
      this.procs = []

      this.getChildList()
      this.getAreaList()
      this.getProcList()
      this.getBuilderList()
    },
    beforeAvatarUpload (file) {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isvsdx = fileType === 'xlsx'
      if (!isvsdx) {
        this.$message.error('文件格式目前仅支持XLSX!')
      }
      return isvsdx
    },
    handleError (e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 0
      })
    },
    httpRequest(param) {
      this.file.push(param.file)
    },
    handleChange(file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
    },
    handleRemove(file, fileList) {
      this.fileList = []
    },
    async submit() {
      try {
        this.$refs.addForm.validate(async valid => {
          if (valid) {
            this.submitloading = true
            this.$refs.uploadFile.submit()
            const query_info = {
              project_code: this.form.project.projectCode,
              area: this.form.area,
              child_code: this.form.child_code,
              proc_code: this.form.proc_code.map(m => m[1] ? m[1] : ''),
              dept_id: this.form.dept_id,
              audit_status: this.form.audit_status === 'yes' ? [1, 3] : this.form.audit_status === 'no' ? [0] : [0, 1, 3],
              exp_fileds: {
                point_code: this.form.exp_fileds.includes('point_code') ? 1 : 0,
                point_name: this.form.exp_fileds.includes('point_name') ? 1 : 0,
                coor: this.form.exp_fileds.includes('coor') ? 1 : 0,
                area: this.form.exp_fileds.includes('area') ? 1 : 0
              }
            }
            const upData = new FormData()
            if (this.file.length > 0) {
              this.file.forEach((file) => {
                upData.append('file', file, file.name)
              })
            } else {
              upData.append('file', null)
            }

            upData.append('query_info', JSON.stringify(query_info))
            const { data, code, message } = await this.$pub.post('/gen/photo-doc', upData)
            if (code !== 200) {
              this.$message({
                message: message,
                type: 'info',
                showClose: true,
                customClass: 'uploadMessage'
              })
            } else {
              this.$message({
                message: data,
                type: 'success',
                showClose: true,
                customClass: 'uploadMessage'
              })
              this.addFlag = false
              this.refresh()
            }
            this.submitloading = false
            this.file = []
          }
        })
      } catch (err) {}
    }
  }
}
</script>

<style lang="scss">

.stage_document{
  ._top{
    padding:4px 0;
  }
  .el-upload-dragger {
    height: 130px;
    .el-icon-upload{
      margin: 20px 0 16px;
    }
  }
  .wrap_up{
    position: relative;
    display:flex;
    &>div{
      width:360px;
    }
    .el-upload__tip{
      margin-left:20px;
    }
  }
}

</style>
