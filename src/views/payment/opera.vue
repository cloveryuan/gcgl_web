<template>
  <div>
    <el-form ref="form" size="small" label-position="right" label-width="78px" :rules="rules" :model="form">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title"  clearable></el-input>
      </el-form-item>
      <el-form-item label="所属项目" prop="project_code">
        <el-select
          v-model="form.project_code"
          placeholder="请选择"
          style="width:100%"
          value-key="id"
        >
          <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="付款点位" prop="points" class="is-required">
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
          <div class="el-upload__tip" slot="tip">
            <p>导入须知:</p>
            <p>1.文件格式目前仅支持XLSX</p>
            <p>2.单次只能上传一份文件</p>
            <p>3.内容格式请参考  <el-link type="primary" :href="file_url">导入模板</el-link></p>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="当前状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">未确认</el-radio>
          <el-radio :label="1">已确认</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="describe">
        <el-input v-model="form.describe"  type="textarea" :rows="6"></el-input>
      </el-form-item>
    </el-form>
    <div style="margin-top:30px;padding-bottom:30px;">
      <el-button
        style="float: right;"
        type="primary"
        size="small"
        @click="submit"
        v-loading="submitloading"
      >保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'payment_opera',
  props: {
    current: {
      require: true
    },
    projectList: {
      require: true
    },
    operaFlag: {
      require: true
    }
  },
  data () {
    const points_validate = (rule, value, callback) => {
      if (this.fileList.length <= 0) {
        callback(new Error('必须上传本次点位列表'))
      } else {
        callback()
      }
    }
    return {
      form: {
        project_code: '',
        title: '',
        describe: '',
        status: 0
      },
      rules: {
        project_code: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        points: [
          { validator: points_validate, message: '请上传本次付款点位表格' }
        ]
      },
      fileList: [],
      file: [],
      submitloading: false,
      file_url: ''
    }
  },
  created() {
    this.getFileUrl()
  },
  mounted() {
    if (this.current) {
      const { project_code, title, describe, status } = this.current
      this.form = {
        project_code, title, describe, status
      }
    }
  },
  methods: {
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
        this.$refs.form.validateField('points')
      }
    },
    handleRemove(file, fileList) {
      this.fileList = []
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
    async submit() {
      try {
        this.$refs.form.validate(async valid => {
          if (valid) {
            this.submitloading = true
            this.$refs.uploadFile.submit()
            const query_info = {
              title: this.form.title,
              project_code: this.form.project_code,
              describe: this.form.describe,
              status: this.form.status
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
            const { data, code, message } = await this.$pub.post('', upData)
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
              this.$emit('update:operaFlag', true)
              this.$emit('handleQuery')
            }
            this.submitloading = false
            this.file = []
            this.fileList = []
          }
        })
      } catch (err) {}
    }
  }
}
</script>

<style lang="scss">
.payment_opera{
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
      width:350px;
    }
    .el-upload__tip{
      margin-left:20px;
    }
  }
}
</style>
