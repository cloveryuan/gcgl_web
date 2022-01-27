<template>
  <div class="wrap">
    <div class="_left">
      <!-- 详情基本信息 -->
      <div class="module">
        <span class="line"></span>
        <span>出库信息</span>
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
          <span>经办对象:</span>
          <span :title="order_info.involved_user_name">{{order_info.involved_user_name}}</span>
        </li>
        <li>
          <span>经办对象组织:</span>
          <span :title="order_info.involved_dept_name">{{order_info.involved_dept_name}}</span>
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
      <div class="module">
        <span class="line"></span>
        <span>单据附件</span>
      </div>
      <ul class="fj_wrap_info" >
        <li v-for="(item,i) in photo_list" :key="item.file_path + i" @click="previewPdfAndImg(item)">
          <i class="el-icon-tickets"></i>
          <span>{{item.file_name}}</span>
        </li>
        <li v-if="photo_list.length<=0">暂无单据</li>
      </ul>
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
        <el-table-column v-if="order_info.order_status===1" prop="stock_number" label="库存数量" min-width="80"></el-table-column>
        <el-table-column prop="number" label="出入库数量" min-width="120" align="center">
          <template slot-scope="scope" >
            <div v-if="order_info.order_status===1">
              <span :style="{color: scope.row.error?'#f40':''}">{{scope.row.number}}</span>
              <span v-if="scope.row.error" :style="{color: scope.row.error?'#f40':''}">{{scope.row.error}}</span>
            </div>
            <span v-else>{{scope.row.number}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="btns" v-if="isSeting">
      <el-button  size="mini" @click="clickOut" v-hasPermi="['warehouseOut:save']" v-if="order_info.order_status===1">出库</el-button>
      <el-button type="primary" @click="clickprinting" size="mini" v-hasPermi="['warehouseOut:print']" v-if="order_info.order_status===1">打印出库单</el-button>
    </div>
    <!--添加附件 出库 -->
    <el-dialog
      :title="currentRow.order_type"
      :visible.sync="outUpload"
      :append-to-body="true"
      width="40%">
      <div v-if="outUpload" style="width:100%;">
        <div style="margin-bottom:10px;">
          <span>请上传签字后的{{currentRow.order_type}}单扫描件</span>
          <el-upload
            name="up"
            ref="uploadFile"
            class="clover_out"
            action="#"
            accept="image/png, image/jpeg,image/jpg, .pdf"
            :auto-upload="false"
            :on-change="handleChange"
            :http-request="httpRequest"
            :before-remove="beforeRemove"
            :on-remove="handleRemove"
            :on-preview="handlePreview">
            <el-button size="small"  style="background:#F59A23;color:#fff;">添加附件</el-button>
          </el-upload>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" @click="cancleOut">取 消</el-button>
          <el-button size="mini" type="primary" @click="sureOut" v-loading="sureOutLoading">确认{{currentRow.order_type}}</el-button>
        </span>
      </div>
    </el-dialog>

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
  name: 'out_order_info',
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
      photo_list: [],
      tableData: [],
      uploadFiles: [], // 待上传的文件列表
      fileTotal: 0, // 上传文件总数
      upData: new FormData(),
      tableLoading: false,
      outUpload: false, //  出库
      sureOutLoading: false,
      fileUrl: '', // 预览的url
      isPdf: false,
      isImg: false,
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
    this.tableData = this.currentRow.device_list.map((m, i) => {
      m.id = m.device_id
      m.leng = i
      const test = /\D|^0/g
      if (m.number === '' || new RegExp(test).test(m.number)) {
        m.error = '请输入大于0的整数'
      } else if (Number(m.number) > Number(m.stock_number)) {
        m.error = '不能大于库存数量'
      } else {
        m.error = false
      }
      return m
    })
    this.photo_list = this.currentRow.photo_list ? this.currentRow.photo_list.map(m => {
      const isPdf = m.file_name.toLowerCase().search('.pdf') > -1
      const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
      const baseurl = process.env.VUE_APP_BASE_URL + env
      const url = baseurl + m.file_path + m.file_name
      return Object.assign(m, { type: isPdf ? 'pdf' : 'img', url })
    }) : []
  },
  components: {

  },
  methods: {
    parseTime,
    clickprinting() {
      if (this.tableData.length <= 0) {
        return this.$message.error('物料清单为空,请返回编辑物料清单')
      }
      let flag = false
      if (this.order_info.order_status === 1) {
        this.tableData.some(f => {
          if (f.error) {
            this.$message.error('出库数量不能大于库存数量!')
            flag = true
            return true
          }
        })
      }
      if (flag) return
      const params = { order_id: this.currentRow.order_id }
      this.$pub.post(
        '/device/order/output/print',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          responseType: 'arraybuffer' // 一定要设置响应类型，否则页面会是空白pdf
        }
      ).then(result => {
        const binaryData = []
        binaryData.push(result)
        console.log(binaryData)
        // 获取blob链接
        const pdfUrl = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }))
        window.open(pdfUrl)
      })
    },
    clickOut() {
      if (this.tableData.length <= 0) {
        return this.$message.error('物料清单为空,请返回编辑物料清单')
      }
      let flag = false
      this.tableData.some(f => {
        if (f.error) {
          this.$message.error('出库数量不能大于库存数量')
          flag = true
          return true
        }
      })
      if (flag) return
      this.outUpload = true
    },
    async getInfo(order_id) {
      const url = '/device/order/output/info'
      const params = { order_id }
      const { code, data } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message.error('获取详情失败')
      }
      this.tableData = (data.device_list || []).map((m, i) => {
        m.id = m.device_id
        m.leng = i
        const test = /\D|^0/g
        if (m.number === '' || new RegExp(test).test(m.number)) {
          m.error = '请输入大于0的整数'
        } else if (Number(m.number) > Number(m.stock_number)) {
          m.error = '不能大于库存数量'
        } else {
          m.error = false
        }
        return m
      })
    },
    // 上传
    async httpRequest(file) {
      this.upData.append('files', file.file)
      // upData getall的数组长度与filetotal的长度一致，就说明万事俱备，就差上传了
      if (this.upData.getAll('files').length === this.fileTotal) {
        try {
          this.upData.append('order_id', this.currentRow.order_id)
          this.upData.append('create_user', this.$store.state.userInfo.id)
          this.currentRow.order_type === '出库' && this.upData.append('order_code', this.order_info.order_code)
          const url = '/device/order/output/confirm'
          const { code } = await this.$pub.post(url, this.upData)
          if (code === 200) {
            this.$message.success(this.currentRow.order_type + '成功')
            this.$emit('successInout')
          } else {
            this.$message.error(this.currentRow.order_type + '失败')
            this.getInfo(this.currentRow.order_id)
          }
          this.cancleOut()
          this.uploadFiles = []
          this.upData.delete('files')
          this.sureOutLoading = false
        } catch (error) {
          this.$message.error('上传文件出错')
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
      this.uploadFiles = this.uploadFiles.filter(f => f.uid !== file.uid)
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
          customClass: 'uploadMessage1'
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
          // 获取添加文件进来的状态
          this.uploadFiles.push(file.raw)
        } else {
          fileList.splice(-1, 1)
        }
      }
    },
    // 取消出库
    cancleOut() {
      this.outUpload = false
    },
    // 确认出库
    async sureOut() {
      this.fileTotal = this.uploadFiles.length
      if (this.photo_list.length <= 0 && this.fileTotal <= 0) {
        return this.$message.error(`必须添加单据附件,才能${this.currentRow.order_type}`)
      }
      let sizes = 0
      this.uploadFiles.forEach(f => {
        sizes += f.size// 总和
      })
      if (sizes / 1024 / 1024 > 80) {
        this.$message({
          type: 'error',
          message: '本次上传所有文件大小总和不能超过80M',
          showClose: true,
          customClass: 'uploadMessage1'
        })
        this.saveLoading = false
        return false
      } else {
        this.sureOutLoading = true
        this.$refs.uploadFile.submit()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.wrap{
  width:100%;
  display:flex;
  justify-content:space-between;
  height:calc(100% - 40px);
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
  height:calc(100% - 310px);
  overflow:auto;
  li{
    display:flex;
    align-items: center;
    width:100%;
    padding:4px;
    cursor: pointer;
    box-sizing:border-box;
    i{
      &:first-child{
        margin-right:5px;
      }
      &:last-child{
        margin-left:auto;
      }
    }
    &:hover{
      color: #409eff;
      background: #eee;
    }
  }
  .el-icon-close{
    cursor:pointer;
  }
}
</style>
<style lang="scss">
.clover_out{
   .el-upload{
    // width:100%;
    float: right;
    margin-top: -30px;
    .el-icon-close-tip{
      display:none!important;
    }
  }
  .el-upload-list__item.focusing .el-icon-close-tip{
    display:none!important;
  }

}
.el-dialog .dialog-footer{
  display: block;
  text-align: right;
  margin-top:40px;
}
.uploadMessage1{
  left: 50%;
  top: 80px!important;
  transform: translateX(-50%);
  right: 0px;
  width: 360px;
}
</style>
