<template>
  <div class="add_app">
    <div v-if="isAdd">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="app版本编码" prop="appVersionIndex">
              <el-input v-model="form.appVersionIndex" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="app版本名称" prop="appVersionName">
              <el-input v-model="form.appVersionName" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上传app文件" class="is-required" prop="upload">
              <el-upload
                ref="upload"
                action="baseImgUrl+ '' "
                class="avatar-uploader"
                :multiple="false"
                name="files"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :http-request="httpRequest"
                :on-exceed="handleExceed"
                :on-change="handleChanged"
                accept=".apk"
                :auto-upload="false"
                :limit="1"
              >
                <el-button slot="trigger" size="small" type="primary"  >选取文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="新增app描述" prop="appDesc">
              <el-input v-model="form.appDesc" placeholder="请输入200字以内的描述" type="textarea" :rows="5" maxlength="200" show-word-limit  />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div  class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm" v-loading="submitLoading">确 定</el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
    </div>
    <el-descriptions title="" :column="2" border v-else>
      <el-descriptions-item label="App版本编号">{{detailData.appVersionIndex}}</el-descriptions-item>
      <el-descriptions-item label="app版本名称">{{detailData.appVersionName}}</el-descriptions-item>
      <el-descriptions-item label="app下载地址">{{detailData.appUrl}}</el-descriptions-item>
      <el-descriptions-item label="app下载数量">{{detailData.appDownloadCount}}</el-descriptions-item>
       <el-descriptions-item label="创建时间">{{parseTime(detailData.createTime)}}</el-descriptions-item>
      <el-descriptions-item label="状态">{{detailData.appStatus===2?'停用':'启用'}}</el-descriptions-item>
      <el-descriptions-item label="版本描述" :contentStyle="{whiteSpace: 'pre-wrap'}">{{detailData.appDesc}}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'
export default {
  name: 'addapp',
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    dialogVisible: {
      type: Boolean,
      required: true
    },
    detailData: {
      required: true
    }
  },
  data () {
    const nameValid = (rule, value, callback) => {
      if (value && value.indexOf(' ') === -1) {
        value = value.replace(/\s*/g, '')
        if (value.length > 50) {
          callback(new Error('请输入50字以内的文字'))
        } else {
          callback()
        }
      } else {
        callback(new Error('文字中不能包含空格'))
      }
    }
    const appDescValid = (rule, value, callback) => {
      if (value && value.length > 200) {
        callback(new Error('请输入200字以内的文字'))
      } else {
        callback()
      }
    }
    const numberValid = (rule, value, callback) => {
      var reg = /^[0-9]{1,50}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('输入的只能是1到50位的正整数'))
      }
    }
    const uploadValid = (rule, value, callback) => {
      if (this.fileList.length > 0) {
        callback()
      } else {
        callback(new Error('必须上传文件'))
      }
    }
    return {
      form: {
        id: null,
        appVersionIndex: null,
        appVersionName: null,
        appDesc: null
      },
      rules: {
        appVersionIndex: [
          { required: true, message: 'app版本编码不能为空', trigger: 'blur' },
          { validator: numberValid, trigger: 'change' }
        ],
        appVersionName: [
          { required: true, message: 'app版本名称不能为空', trigger: 'blur' },
          { validator: nameValid, trigger: 'change' }
        ],
        appDesc: [
          { validator: appDescValid, trigger: 'change' }
        ],
        upload: [
          { validator: uploadValid, trigger: 'change' }
        ]
      },
      fileList: [],
      file: [],
      submitLoading: false
    }
  },
  methods: {
    parseTime,
    handleChanged(file, fileList) {
      this.fileList = fileList
    },
    handleExceed(file, fileList) {
      this.$message({
        type: 'error',
        message: '上传文件为一个，如果想上传其他的，请先删除先前的',
        showClose: true
      })
    },
    // 上传文件前的钩子函数
    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 50) {
        this.$message({
          type: 'error',
          message: '上传文件不超过50M',
          showClose: true
        })
        return false
      }
      var ext = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension =
        ext === 'apk'
      if (!extension) {
        this.$message({
          type: 'error',
          message: '上传文件格式只能为apk',
          showClose: true
        })
        return false
      }
    },
    httpRequest(opt) {
      this.file.push(opt.file)
    },
    submitForm() {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submitLoading = true
            const params = {
              ...this.form,
              create_user: this.$store.state.userInfo.id
            }

            const upData = new FormData()
            this.$refs.upload.submit()
            this.file.forEach((file) => { // 因为要上传多个文件，所以需要遍历
              upData.append('file', file, file.name)
            })
            upData.append('dt', JSON.stringify(params))

            const { code, message } = await this.$pub.post('', upData)
            this.submitLoading = false
            if (code !== 200) {
              this.$message({
                type: 'error',
                message: message || '操作失败',
                showClose: true
              })
            } else {
              this.$message({
                type: 'success',
                message: '操作成功',
                showClose: true
              })
              this.cancel()
              this.$emit('handleQuery')
            }
          }
        })
      } catch (err) {
        this.submitLoading = false
      }
    },
    // 取消按钮
    cancel () {
      this.$emit('update:dialogVisible', false)
      this.$refs.form.resetFields()
      this.fileList = []
    }
  }
}
</script>

<style scoped>
.dialog-footer{
  margin-top: 30px;
  text-align: right;
}
</style>
