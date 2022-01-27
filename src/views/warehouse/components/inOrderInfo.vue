<template>
  <div class="wrap" v-loading="sureOutLoading">
    <div class="_left" >
      <!-- 详情基本信息 -->
      <div class="module">
        <span class="line"></span>
        <span>入库信息</span>
      </div>
      <ul class="info_wrap">
        <li>
          <span>过程单号:</span>
          <span :title="order_info.order_code">{{order_info.order_code}}</span>
        </li>
        <li>
          <span>经办人:</span>
          <span :title="order_info.oper_user_name">{{order_info.oper_user_name}}</span>
        </li>
        <li>
          <span>供应方:</span>
          <span :title="order_info.supply">{{order_info.supply}}</span>
        </li>
        <li>
          <span>发生时间:</span>
          <span :title="parseTime(order_info.oper_time)">{{parseTime(order_info.oper_time)}}</span>
        </li>
        <li>
          <span>所在库房:</span>
          <span :title="order_info.warehouse_name">{{order_info.warehouse_name}}</span>
        </li>
        <li>
          <span>最后编辑人:</span>
          <span :title="order_info.create_user">{{order_info.create_user}}</span>
        </li>
      </ul>

      <!-- 附件 -->
      <!--
        入库时需添加的附件标准 order_status===1
        1、物流单据 送货人姓名身份证号 手机号码（必须）files_t1
        2、到货照片（必须）files_t2
        3、随货附件（光盘、合格证、说明书、装箱单等）（非必须）files_t3
        入库结束后需补充材料 order_status===2 order_status===4
        1、现场到货签收单（必须 这项后端判断）files_t4
        2、建设方设备材料报验单（非必须） files_t5
       -->
      <template>
        <div class="module">
          <span class="line"></span>
          <span>单据附件</span>
          <span v-if="inUpload" style="margin-left:65px;color: #F56C6C;">请上传*号必传项</span>
        </div>
        <div class="fj_wrap_info" style="height:calc(100% - 310px);overflow:'auto'" >
          <el-card v-for="(item,i) in photo_list" :key="item.file_path + i" style="margin-bottom:10px;">
            <div style="margin-bottom:10px;">
              <span v-if="order_info.order_status===1&&(i==='files_t1' || i==='files_t2')" style="color: #F56C6C;margin-right: 4px;">*</span>
              <span>{{titList[i]}}</span>
              <el-upload
                v-if="(order_info.order_status===1&&(i==='files_t1' || i==='files_t2' || i==='files_t3')) || ((order_info.order_status===2 || order_info.order_status===4)&&(i==='files_t4' || i==='files_t5'))"
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
                <!-- <el-button size="mini"  style="background:#F59A23;color:#fff;" @click="changeFjType(i)">添加附件</el-button> -->
                 <el-button :class="{isFour:i==='files_t4',isFive:i==='files_t5'}" type="text" @click="changeFjType(i)"><i class="el-icon-upload el-icon--right" style="font-size:20px;"></i></el-button>
              </el-upload>
            </div>
            <div v-for="(fj,k) in item" :key="fj.file_path+k" class="line_row">
                <span @click="previewPdfAndImg(fj)" style="cursor:pointer;">
                  <i class="el-icon-document"></i>
                  <span class="text" :style="{width:(i==='files_t4' || i==='files_t5')?'158px':'180px' }">{{fj.file_name}}</span>
                </span>
                <i class="el-icon-close" v-if="(order_info.order_status===2 || order_info.order_status===4)&&(i==='files_t4' || i==='files_t5')" @click="removeFJ(fj,i)"></i>
            </div>
            <span
              v-if="item.length<=0&&(order_info.order_status===3  || (order_info.order_status!==1&&isStat.includes(i)))"
              style="display:inline-block;width:100%;text-align:center;color:#ccc;"
            >暂无附件</span>
          </el-card>
        </div>
      </template>
    </div>

    <div class="_right">
      <div class="module">
        <span class="line"></span>
        <span>物料清单</span>
      </div>
      <el-table :data="tableData" v-loading="tableLoading"  style="width: 100%;" :height="tableHeight">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="device_name" label="物料类型名称" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip >
          <template slot-scope="scope">
            <span style="color:#409EFF;">{{scope.row.device_model}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="60"></el-table-column>
        <el-table-column  prop="device_brand_name" label="品牌" width="60"></el-table-column>
        <el-table-column prop="number" label="出入库数量" min-width="120" align="center">
          <template slot-scope="scope" >
            <span>{{scope.row.number}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="btns" v-if="isSeting">
      <el-button type="primary" @click="clickIn" :loading="sureOutLoading"  size="mini" v-if="order_info.order_status===1" v-hasPermi="['warehouseIn:save']">入库</el-button>
      <el-button type="primary" @click="clickAdd" :loading="sureOutLoading"  size="mini" v-if="order_info.order_status===2 || order_info.order_status===4" v-hasPermi="['warehouseIn:supply']">补充</el-button>
    </div>

    <!-- pdf预览 -->
    <el-dialog :visible.sync="isPdf"  width="70%" custom-class="clover_prview" append-to-body>
      <iframe :src="fileUrl" style="width: 100%; height: 100%"/>
    </el-dialog>
    <!-- 图片预览 -->
    <el-dialog :visible.sync="isImg"  width="240px"  append-to-body>
      <img width="100%" fit="contain" :src="fileUrl">
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'
export default {
  name: 'in_order_info',
  props: {
    currentRow: {
      required: true
    },
    isSeting: { // 是查询，还是管理
      required: true
    },
    project_code: {
      required: true
    },
    InfoShow: {
      default: false
    }
  },
  data () {
    return {
      order_info: {},
      photo_list: {
        files_t1: [],
        files_t2: [],
        files_t3: [],
        files_t4: [],
        files_t5: []
      },
      titList: {
        files_t1: '物流单据',
        files_t2: '到货照片',
        files_t3: '随货附件',
        files_t4: '现场到货签收单',
        files_t5: '建设方设备材料报验单'
      },
      isStat: ['files_t1', 'files_t2', 'files_t3'],
      tableData: [],
      uploadFiles: [], // 待上传的文件列表
      fileTotal1: 0, // 上传文件总数
      fileTotal2: 0, // 上传文件总数
      fileTotal3: 0, // 上传文件总数
      fileTotal4: 0, // 上传文件总数
      fileTotal5: 0, // 上传文件总数
      upData: new FormData(),
      tableLoading: false,
      inUpload: false, // 入库
      sureOutLoading: false,
      fileUrl: '', // 预览的url
      isPdf: false,
      isImg: false,
      fjType: '0',
      allFj: [],
      tableHeight: (window.innerHeight) - 300
    }
  },
  computed: {

  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 300
    }
    this.order_info = this.currentRow.order_info
    this.tableData = this.currentRow.device_list
    if (this.order_info.order_status === 1 || this.order_info.order_status === 3) {
      delete this.currentRow.photo_list.files_t4
      delete this.currentRow.photo_list.files_t5
    }
    for (const i in this.currentRow.photo_list) {
      this.currentRow.photo_list[i].map(m => {
        const isPdf = m.file_name.toLowerCase().search('.pdf') > -1
        const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
        const baseurl = process.env.VUE_APP_BASE_URL + env
        const url = baseurl + m.file_path + m.file_name
        return Object.assign(m, { type: isPdf ? 'pdf' : 'img', url })
      })
    }
    this.photo_list = this.currentRow.photo_list
  },
  components: {

  },
  methods: {
    parseTime,
    // 上传
    async httpRequest(file) {
      const currentfj = this.allFj.filter(f => f.uid === file.file.uid)[0]
      if (!currentfj) {
        this.sureOutLoading = false
        return
      }
      if (currentfj.fjType === 'files_t1') {
        this.upData.append('files_t1', file.file)
      } else if (currentfj.fjType === 'files_t2') {
        this.upData.append('files_t2', file.file)
      } else if (currentfj.fjType === 'files_t3') {
        this.upData.append('files_t3', file.file)
      } else if (currentfj.fjType === 'files_t4') {
        this.upData.append('files_t4', file.file)
      } else if (currentfj.fjType === 'files_t5') {
        this.upData.append('files_t5', file.file)
      }
      // upData getall的数组长度与filetotal的长度一致，就说明万事俱备，就差上传了
      if (
        this.upData.getAll('files_t1').length === this.fileTotal1 &&
        this.upData.getAll('files_t2').length === this.fileTotal2 &&
        this.upData.getAll('files_t3').length === this.fileTotal3 &&
        this.upData.getAll('files_t4').length === this.fileTotal4 &&
        this.upData.getAll('files_t5').length === this.fileTotal5
      ) {
        try {
          if (this.order_info.order_status === 1) {
            this.saveIn()
          } else {
            this.saveAdd()
          }
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
      // if(file.raw.type.search('.pdf')>-1){
      //   this.isPdf = true;
      // }else{
      //   this.isImg = true;
      // }
    },
    // 历史获取数据预览
    previewPdfAndImg(row) {
      this.isPdf = false
      this.isImg = false
      this.fileUrl = row.url
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
    // 入库
    async clickIn() {
      if (this.tableData.length <= 0) {
        return this.$message.error('物料清单为空,请返回编辑物料清单')
      }
      let sizes = 0
      this.fileTotal1 = 0
      this.fileTotal2 = 0
      this.fileTotal3 = 0
      this.fileTotal4 = 0
      this.fileTotal5 = 0
      this.allFj.forEach(f => {
        sizes += f.size// 总和
        if (f.fjType === 'files_t1') {
          this.fileTotal1++
        } else if (f.fjType === 'files_t2') {
          this.fileTotal2++
        } else if (f.fjType === 'files_t3') {
          this.fileTotal3++
        } else if (f.fjType === 'files_t4') {
          this.fileTotal4++
        } else if (f.fjType === 'files_t5') {
          this.fileTotal5++
        }
      })
      if ((this.fileTotal1 <= 0 && this.photo_list.files_t1.length <= 0) || (this.fileTotal2 <= 0 && this.photo_list.files_t2 <= 0)) { // files_t1 files_t2必上传
        this.inUpload = true
      } else {
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
          this.inUpload = false
          this.sureOutLoading = true
          if (this.fileTotal1 > 0) { // 有附件先上传再保存
            this.$refs.uploadFilefiles_t1[0].submit()
          }
          if (this.fileTotal2 > 0) { // 有附件先上传再保存
            this.$refs.uploadFilefiles_t2[0].submit()
          }
          if (this.fileTotal3 > 0) { // 有附件先上传再保存
            this.$refs.uploadFilefiles_t3[0].submit()
          }

          if (this.fileTotal1 <= 0 && this.fileTotal2 <= 0 && this.fileTotal3 <= 0) { // 无附件上传
            this.saveIn()
          }
        }
      }
    },
    // 入库的保存
    async saveIn() {
      this.upData.append('order_id', this.currentRow.order_id)
      this.upData.append('create_user', this.$store.state.userInfo.id)
      this.upData.append('photo_list', JSON.stringify(this.photo_list))
      const { code } = await this.$pub.post('/device/order/input/confirm', this.upData)
      if (code === 200) {
        this.$message.success('入库成功')
        this.outUpload = false
        this.$emit('successInout')
      } else {
        this.$message.error('入库失败')
        this.$refs.uploadFilefiles_t1[0].clearFiles()
        this.$refs.uploadFilefiles_t2[0].clearFiles()
        this.$refs.uploadFilefiles_t3[0].clearFiles()
      }
      this.sureOutLoading = false
      this.uploadFiles = []
      this.upData.delete('files_t1')
      this.upData.delete('files_t2')
      this.upData.delete('files_t3')
      this.allFj = []
      this.upData.delete('order_id')
      this.upData.delete('create_user')
      this.upData.delete('photo_list')
    },
    // 补充
    clickAdd() {
      let sizes = 0
      this.fileTotal1 = 0
      this.fileTotal2 = 0
      this.fileTotal3 = 0
      this.fileTotal4 = 0
      this.fileTotal5 = 0
      this.allFj.forEach(f => {
        sizes += f.size// 总和
        if (f.fjType === 'files_t1') {
          this.fileTotal1++
        } else if (f.fjType === 'files_t2') {
          this.fileTotal2++
        } else if (f.fjType === 'files_t3') {
          this.fileTotal3++
        } else if (f.fjType === 'files_t4') {
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
      const photo = {
        files_t4: this.photo_list.files_t4,
        files_t5: this.photo_list.files_t5
      }
      const order_info = {
        order_id: this.currentRow.order_id,
        create_user: this.$store.state.userInfo.id,
        photo_list: photo
      }
      this.upData.append('order_info', JSON.stringify(order_info))
      const { code } = await this.$pub.post('/device/order/input/keep', this.upData)
      if (code === 200) {
        this.$message.success('补充成功')
        this.outUpload = false
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

<style scoped lang="scss">
.wrap{
  width:100%;
  display:flex;
  justify-content:space-between;
  height:calc(100% - 60px);
  border-top:1px solid #eee;
  padding:10px 0 0;
  position:relative;
  ._left{
    width: 260px;
    height: 100%;
    border-right:1px solid #eee;
    overflow: auto;
    padding-right:10px;
    .info_wrap{
      margin-bottom:30px;
      li{
        line-height: 30px;
        span:first-child{
          width:90px;
          display:inline-block;
          font-weight:550;
          vertical-align: middle;
        }
        span:nth-child(2){
          color: rgb(141, 135, 135);
          display:inline-block;
          width: calc(100% - 100px);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          vertical-align: middle;
        }
      }
    }
  }
  ._right{
    width: calc(100% - 290px);
    overflow: auto;
  }
  .btns{
    display:flex;
    flex-direction:row-reverse;
    position:absolute;
    top: -50px;
    right: 30px;
  }
  .module{
    .line{
      margin-right: 6px;
    }
  }
}
.fj_wrap_info{
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
      &:last-child{
        // display: none;
        // margin-left:auto;
        // margin-right: 10px;
      }
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
      width:158px;
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
}
</style>
<style lang="scss">
.clover_in{
   margin-top: -20px;
   .el-upload{
    // width:100%;
    margin-left: 60px;
    .el-icon-close-tip{
      display:none!important;
    }
  }
  .isFour{
    margin-left: 35px;
  }
  .isFive{
    margin-left: 76px;
  }
  .el-upload-list__item.focusing .el-icon-close-tip{
    display:none!important;
  }
  .el-button{
    padding:0
  }
}
.el-dialog .dialog-footer{
  display: block;
  text-align: right;
  margin-top:40px;
}
.uploadMessage{
  left: 50%;
  top: 300px!important;
  transform: translateX(-50%);
  right: 0px;
  width: 360px;
}
</style>
