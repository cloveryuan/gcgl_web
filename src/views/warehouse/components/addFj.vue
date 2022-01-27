<template>
  <div class="fj_add_info" :style="{height:listHeight+'px',overflow:'auto'}" v-loading="sureOutLoading">
    <el-card v-for="(item,i) in photo_list" :key="item.file_path + i" style="margin-bottom:10px;">
      <div style="margin-bottom:10px;">
        <span>{{titList[i]}}</span>
        <el-upload
          :name="'up'+i"
          multiple
          :ref="'uploadFile'+i"
          class="clover_in"
          action="#"
          accept="image/png, image/jpeg,image/jpg, .pdf"
          :auto-upload="false"
          :http-request="httpRequest"
          :on-change="handleChange"
          :before-remove="beforeRemove"
          :on-remove="handleRemove"
          :on-preview="handlePreview">
            <el-button :class="{isFour:i==='files_t4',isFive:i==='files_t5'}" type="text" @click="changeFjType(i)"><i class="el-icon-upload el-icon--right" style="font-size:20px;"></i></el-button>
        </el-upload>
      </div>
      <div v-for="(fj,k) in item" :key="fj.file_path+k" class="line_row">
        <span @click="previewPdfAndImg(fj)" style="cursor:pointer;width:100%;">
          <i class="el-icon-document"></i>
          <span class="text">{{fj.file_name}}</span>
        </span>
        <i class="el-icon-close" @click="removeFJ(fj,i)"></i>
      </div>
    </el-card>
    <span style="color: #F56C6C;position:absolute;bottom:20px;">*上传现场到货签收单将切换工单状态为已归档</span>
    <div class="btns">
      <el-button type="primary" @click="clickAdd" :loading="sureOutLoading"  size="mini" >保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'add_fj',
  props: {
    currentRow: {
      required: true
    },
    addFJ: {
      default: false
    }
  },
  data () {
    return {
      titList: {
        files_t4: '现场到货签收单',
        files_t5: '建设方设备材料报验单'
      },
      photo_list: {},
      fjType: '0',
      allFj: [],
      upData: new FormData(),
      uploadFiles: [],
      listHeight: (window.innerHeight) * 0.80 - 200,
      fileTotal4: 0, // 上传文件总数
      fileTotal5: 0, // 上传文件总数
      sureOutLoading: false
    }
  },
  computed: {

  },
  mounted() {
    this.photo_list = this.currentRow.photo_list
    delete this.photo_list.files_t1
    delete this.photo_list.files_t2
    delete this.photo_list.files_t3
  },
  components: {

  },
  methods: {
    // 上传
    async httpRequest(file) {
      const currentfj = this.allFj.filter(f => f.uid === file.file.uid)[0]
      if (!currentfj) {
        this.sureOutLoading = false
        return
      }
      if (currentfj.fjType === 'files_t4') {
        this.upData.append('files_t4', file.file)
      } else if (currentfj.fjType === 'files_t5') {
        this.upData.append('files_t5', file.file)
      }
      // upData getall的数组长度与filetotal的长度一致，就说明万事俱备，就差上传了
      if (
        this.upData.getAll('files_t4').length === this.fileTotal4 &&
        this.upData.getAll('files_t5').length === this.fileTotal5
      ) {
        try {
          this.saveAdd()
        } catch (error) {
          console.log('上传文件出错', error)
        } finally {
          // 无论成功与失败
          // this.sureOutLoading = false
        }
      }
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleRemove(file, fileList) {
      this.allFj = this.allFj.filter(f => f.uid !== file.uid)
    },
    // 本次上传预览
    handlePreview(file) {
      this.isPdf = false
      this.isImg = false
      // 获取上传图片的本地url，用于上传前的本地预览
      let url = ''
      if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file.raw)
      } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file.raw)
      } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file.raw)
      }
      this.fileUrl = url
      window.open(this.fileUrl)
    },
    // 历史获取数据预览
    previewPdfAndImg(row) {
      this.isPdf = false
      this.isImg = false
      this.fileUrl = row.file_path + row.file_name
      window.open(this.fileUrl)
    },
    // 上传文件前的钩子函数
    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 10) {
        this.$message({
          type: 'error',
          message: '单个上传文件不能超过10M',
          showClose: true,
          customClass: 'uploadMessage'
        })
        return false
      } else {
        return true
      }
    },
    handleChange(file, fileList) {
      // 获取添加文件进来的状态
      if (file.status === 'ready') {
        const isLt10M = this.beforeUpload(file)
        if (isLt10M) {
          if (!file.fjType) {
            file.fjType = this.fjType
            this.allFj.push({
              uid: file.uid,
              fjType: file.fjType,
              size: file.size
            })
          }
        } else {
          fileList.splice(-1, 1)
        }
      }
    },
    changeFjType(type) {
      this.fjType = type
    },
    removeFJ(file, type) {
      this.photo_list[type] = this.photo_list[type].filter(f => !(f.file_path === file.file_path && f.file_name === file.file_name))
    },
    // 补充
    clickAdd() {
      let sizes = 0
      this.fileTotal4 = 0
      this.fileTotal5 = 0
      this.allFj.forEach(f => {
        sizes += f.size// 总和
        if (f.fjType === 'files_t4') {
          this.fileTotal4++
        } else if (f.fjType === 'files_t5') {
          this.fileTotal5++
        }
      })
      if (sizes / 1024 / 1024 > 80) {
        this.$message({
          type: 'error',
          message: '本次上传所有文件大小总和不能超过80M',
          showClose: true,
          customClass: 'uploadMessage'
        })
        this.sureOutLoading = false
        return false
      } else {
        this.sureOutLoading = true
        if (this.fileTotal4 > 0) { // 有附件先上传再保存
          this.$refs.uploadFilefiles_t4[0].submit()
        }
        if (this.fileTotal5 > 0) { // 有附件先上传再保存
          this.$refs.uploadFilefiles_t5[0].submit()
        }
        if (this.fileTotal4 <= 0 && this.fileTotal5 <= 0) { // 无附件上传
          this.saveAdd()
        }
      }
    },
    // 补充保存
    async saveAdd() {
      const order_info = {
        order_id: this.currentRow.order_id,
        create_user: this.$store.state.userInfo.id,
        photo_list: this.photo_list
      }
      this.upData.append('order_info', JSON.stringify(order_info))
      const { code } = await this.$pub.post('/device/order/input/keep', this.upData)
      if (code === 200) {
        this.$message.success('补充成功')
        this.$emit('successInout')
      } else {
        this.$message.error('补充失败')
        this.$refs.uploadFilefiles_t4[0].clearFiles()
        this.$refs.uploadFilefiles_t5[0].clearFiles()
      }
      this.sureOutLoading = false
      this.uploadFiles = []
      this.upData.delete('files_t4')
      this.upData.delete('files_t5')
      this.allFj = []
      this.upData.delete('order_id')
      this.upData.delete('create_user')
      this.upData.delete('photo_list')
    }
  }
}
</script>

<style lang="scss">
.fj_add_info{
  display:flex;
  justify-content: space-between;
  .el-card{
    width:50%;
    height:calc(100% - 20px);
    .el-card__body{
      height:calc(100% - 20px);
      overflow: auto;
    }
  }
  .line_row{
    display:flex;
    align-items: center;
    width:100%;
    padding:4px;
    color:#606266;
    i{
      &:first-child{
        margin-right:5px;
      }
      // &:last-child{

      // }
    }
    .el-icon-close{
      display: none;
      margin-left:auto;
      margin-right: 10px;
    }
    &:hover{
      background: #eee;
    }
    span{
      &:hover{
        color: #409eff;
      }
    }
    &:hover{
      .el-icon-close{
        display: inline-block;
      }
    }
    .text{
      width:80%;
      display:inline-block;
      white-space: nowrap;
      overflow:hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
  }
  .el-icon-close{
    cursor:pointer;
  }
  .btns{
    display:flex;
    flex-direction:row-reverse;
    position:absolute;
    top: 15px;
    right: 45px;
  }
}
.uploadMessage{
  left: 50%;
  top: 300px!important;
  transform: translateX(-50%);
  right: 0px;
  width: 360px;
}
</style>
