<!-- 新增出库单 新增入库单 -->
<template>
  <div style="height:100%;position:relative;" v-loading="screenLoading">
    <p class="_top">
      <el-button type="primary" size="mini" @click="save" v-loading="saveLoading">保存</el-button>
    </p>
    <div class="wrap">
      <div class="_left">
        <div class="module">
          <span class="line"></span>
          <span>{{orderType===1?'入库信息':'出库信息'}}</span>
        </div>
        <el-form :model="form" ref="form"  size="small"  label-width="82px" :rules="rules">
          <el-form-item label="过程单号:" prop="order_code" v-if="orderType===1 || (orderType===2&&isEdit)">
            <el-input
              style="width:220px;"
              v-model="form.order_code"
              placeholder="请输入过程单号"
              clearable
              :disabled="orderType===2"
            />
          </el-form-item>
          <el-form-item label="经办人:" prop="oper_user_id">
            <el-select
              v-model="form.oper_user_id"
              clearable
              style="width:220px;"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="oper_user_remoteMethod"
              :loading="loading"
            >
              <el-option
                v-for="item in userList"
                :key="item.user_id"
                :label="item.user_name_dept"
                :value="item.user_id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="供应方:" prop="supply" v-if="orderType===1">
            <el-input
              style="width:220px;"
              v-model="form.supply"
              placeholder="请输入供应方"
              clearable
            />
          </el-form-item>
          <el-form-item label="经办对象:" prop="involved_user_id" v-if="orderType===2">
            <el-select
              v-model="form.involved_user_id"
              clearable
              style="width:220px;"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="involved_user_remoteMethod"
              :loading="loading"
            >
              <el-option
                v-for="item in involved_userList"
                :key="item.user_id"
                :label="item.user_name_dept"
                :value="item.user_id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发生时间:" prop="oper_time">
            <el-date-picker
              v-model="form.oper_time"
              type="datetime"
              align="right"
              style="width:220px;"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="timestamp"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="所在库房:" prop="warehouse_id">
            <el-select v-model="form.warehouse_id"  placeholder="请选择"  :style="{width:orderType===1?'160px':'220px'}" @visible-change="before_warehouseChange($event)" @change="warehouseChange">
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
            <span style="text-align:right;" v-if="orderType===1">
              <el-button @click="addWarehouse" size="small" style="background:#F59A23;color:#fff;margin-left:5px;" >新增</el-button>
            </span>
          </el-form-item>
        </el-form>

        <!-- 附件 -->
        <template  v-if="orderType===1">
          <div class="module">
            <span class="line"></span>
            <span>单据附件</span>
          </div>
          <div class="fj_wrap">
            <el-card v-for="(item,i) in photo_list" :key="i" style="margin-bottom:10px;">
              <div style="margin-bottom:10px;">
                <span v-if="i==='files_t1'|| i==='files_t2'" style="color: #F56C6C;margin-right: 4px;">*</span>
                <span>{{i==='files_t1'?'物流单据':i==='files_t2'?'到货照片':'随货附件'}}</span>
                 <el-upload
                  :name="'up'+i"
                  multiple
                  :ref="'uploadFile'+i"
                  class="clover_outadd"
                  action="#"
                  accept="image/png, image/jpeg,image/jpg, .pdf"
                  :auto-upload="false"
                  :http-request="httpRequest"
                  :on-change="handleChange"
                  :before-remove="beforeRemove"
                  :on-remove="handleRemove"
                  :on-preview="handlePreview">
                  <!-- style="background:#F59A23;color:#fff;" -->
                  <!-- <el-button size="mini"   @click="changeFjType(i)">+</el-button> -->
                  <el-button :class="{isThree:i==='files_t3'}" type="text" @click="changeFjType(i)"><i class="el-icon-upload el-icon--right" style="font-size:20px;"></i></el-button>
                </el-upload>
              </div>
              <div v-for="(fj,k) in item" :key="fj.file_path+k" class="line_row">
                <span @click="previewPdfAndImg(fj)" style="cursor:pointer">
                  <i class="el-icon-document"></i>
                  <span class="text">{{fj.file_name}}</span>
                </span>
                <i class="el-icon-close" @click="removeFJ(fj,i)"></i>
              </div>
            </el-card>
          </div>
        </template>
      </div>
      <div class="_right">
        <div class="module">
          <span class="line"></span>
          <span>物料清单</span>
        </div>
        <div class="btns">
          <el-button style="background:#F59A23;color:#fff;" size="mini" @click="addTableData">添加物料</el-button>
        </div>
        <el-table :data="tableData" v-loading="tableLoading" style="width: 100%;" :height="tableHeight" row-key="leng" >
          <el-table-column prop="device_name" label="物料类型名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color:#409EFF;">{{scope.row.device_model}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="60"></el-table-column>
          <el-table-column  prop="device_brand" label="品牌" min-width="120">
            <template slot-scope="scope">
              <span>{{scope.row.device_brand_name}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock_number" label="库存数量" v-if="orderType===2" width="80"></el-table-column>
          <el-table-column prop="number" :label="orderType===2?'出库数量':'入库数量'" min-width="120">
            <template slot-scope="scope">
              <div>
                <el-input
                  v-model.trim="scope.row.number"
                  placeholder="请输入大于0的数字"
                  :style="{width:scope.row.error?'70%':'100%'}"
                  controls-position="right"
                  @input="($event)=>change($event,scope)"></el-input>
                  <span v-if="scope.row.error" style="color:#f40;display:block;margin-left:10px;font-size:12px;">{{scope.row.error}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="specs" label="操作" width="80px">
            <template slot-scope="scope">
              <el-button type="text" @click="del(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加物料（物料类型选择） -->
      <el-drawer
        title="物料类型选择"
        :visible.sync="addTable"
        size="100%"
        :append-to-body="true"
        :destroy-on-close ="true"
        custom-class="addWarehouse"
      >
        <add-warehouse-in
          v-if="addTable&&orderType===1"
          @sureAddTableData="sureAddTableData"
          :defaultData="tableData"
          :project_code="project_code"
          :warehouse_id="form.warehouse_id"
        ></add-warehouse-in>
        <add-warehouse-out
          v-if="addTable&&orderType===2"
          @sureAddTableData="sureAddTableData"
          :defaultData="tableData"
          :project_code="project_code"
          :warehouse_id="form.warehouse_id"
        ></add-warehouse-out>
      </el-drawer>

      <!-- pdf预览 -->
      <el-dialog :visible.sync="isPdf"  width="70%" custom-class="clover_prview" append-to-body>
        <iframe :src="fileUrl" style="width: 100%; height: 100%"/>
      </el-dialog>
      <!-- 图片预览 -->
      <el-dialog :visible.sync="isImg"  width="800px" custom-class="clover_prview_img"  append-to-body>
        <img width="100%" fit="contain" :src="fileUrl">
      </el-dialog>
    </div>
  </div>
</template>

<script>
import addWarehouseIn from './addWarehouseIn'
import addWarehouseOut from './addWarehouseOut'
export default {
  name: 'add_order',
  inject: ['orderType'],
  props: {
    isEdit: {
      required: true
    },
    currentRow: {
      required: true
    },
    warehouseList: {
      required: true
    },
    project_code: {
      default: ''
    }
  },
  data () {
    return {
      form: {},
      rules: {
        order_code: [
          { required: true, message: '请输入过程单号', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const test1 = '[\u4e00-\u9fa5]'
              const test2 = '[^\x00-\xff]'
              if (new RegExp(test1).test(value)) {
                callback('过程单号不允许中文!')
              } else if (new RegExp(test2).test(value)) {
                callback('过程单号不允许全角符号!')
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        oper_user_id: [{ required: true, message: '请输入经办人', trigger: 'blur' }],
        involved_user_id: [{ required: true, message: '请输入经办对象', trigger: 'blur' }],
        supply: [{ required: true, message: '请输入供应方', trigger: 'blur' }],
        oper_time: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
        warehouse_id: [{ required: true, message: '请选择所在库房', trigger: 'change' }]
      },
      addTable: false,
      tableData: [], // device_list
      tableLoading: false,
      tableHeight: window.innerHeight - 155,
      userList: [],
      involved_userList: [],
      loading: false,
      photo_list: {
        files_t1: [],
        files_t2: [],
        files_t3: []
      },
      fileTotal1: 0, // 上传文件总数
      fileTotal2: 0, // 上传文件总数
      fileTotal3: 0, // 上传文件总数
      upData: new FormData(),
      saveLoading: false,
      fileUrl: '', // 预览的url
      isPdf: false,
      isImg: false,
      fjType: '0',
      allFj: [],
      screenLoading: false
    }
  },
  computed: {

  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 155
    }
    if (this.isEdit) {
      this.form = this.currentRow.order_info
      this.tableData = this.currentRow.device_list.map((m, i) => {
        m.id = m.device_id
        m.leng = i
        m.brand_name = m.device_brand_name
        m.brand_id = m.device_brand
        const test = /\D|^0/g
        if (m.number === '' || new RegExp(test).test(m.number)) {
          m.error = '请输入大于0的整数'
        } else if (this.orderType === 2 && Number(m.number) > Number(m.stock_number)) {
          m.error = '不能大于库存数量'
        } else {
          m.error = false
        }
        return m
      })

      delete this.currentRow.photo_list.files_t4
      delete this.currentRow.photo_list.files_t5
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
      this.userList.push({
        user_id: this.form.oper_user_id,
        user_name_dept: this.form.oper_user_name
      })
      this.involved_userList.push({
        user_id: this.form.involved_user_id,
        user_name_dept: this.form.involved_user_name
      })
    }
  },
  components: {
    addWarehouseIn, addWarehouseOut
  },
  methods: {
    addTableData() {
      if (!this.form.warehouse_id) {
        return this.$message.error('请先选择仓库')
      }
      this.addTable = true
    },
    sureAddTableData(data) { // 选择物料
      this.addTable = false
      this.tableData = data.map(m => {
        return Object.assign(m, {
          number: m.number ? m.number : 1,
          device_brand_name: m.device_brand_name ? m.device_brand_name : m.brand_name,
          device_brand: m.device_brand ? m.device_brand : m.brand_id,
          device_id: m.device_id ? m.device_id : m.id
        })
      })
    },
    async oper_user_remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.userList = data.user_list || []
      } else {
        this.userList = []
      }
    },
    async involved_user_remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.involved_userList = data.user_list || []
      } else {
        this.involved_userList = []
      }
    },
    before_warehouseChange(e) {
      if (e && this.tableData.length > 0) {
        this.$message.warning('切换库房，右侧物料将被清空')
      }
    },
    warehouseChange() {
      this.tableData = []
    },

    del(row) {
      const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData.splice(_index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 上传
    async httpRequest(file) {
      const currentfj = this.allFj.filter(f => f.uid === file.file.uid)[0]
      if (!currentfj) {
        this.saveLoading = false
        return
      }
      if (currentfj.fjType === 'files_t1') {
        this.upData.append('files_t1', file.file)
      } else if (currentfj.fjType === 'files_t2') {
        this.upData.append('files_t2', file.file)
      } else if (currentfj.fjType === 'files_t3') {
        this.upData.append('files_t3', file.file)
      }
      // upData getall的数组长度与filetotal的长度一致，就说明万事俱备，就差上传了
      if (this.upData.getAll('files_t1').length === this.fileTotal1 && this.upData.getAll('files_t2').length === this.fileTotal2 && this.upData.getAll('files_t3').length === this.fileTotal3) {
        try {
          this.saveIn()
        } catch (error) {
          console.log('上传文件出错', error)
        } finally {
          // 无论成功与失败
          // this.saveLoading = false
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
      // const type = row.type
      this.fileUrl = row.url
      window.open(this.fileUrl)
      // if (type === 'img') {
      //   this.isImg = true;
      //   // this.fileUrl = 'http://106.14.170.48:82/images/w200/THAF20200619/20210326/THAF20200619_20210326094419_g9NQeIhj.jpg'
      // } else if (type === 'pdf') {
      //   this.isPdf = true;
      //   // this.fileUrl = "http://47.105.218.26:8888/group1/M00/00/00/rB-LJlzT042AbKdCAAiu_35Yccs182.pdf"
      // } else {
      //   this.$message("当前文件暂不支持预览");
      // }
    },
    removeFJ(file, type) {
      this.photo_list[type] = this.photo_list[type].filter(f => !(f.file_path === file.file_path && f.file_name === file.file_name))
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
    save() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.saveLoading = true
          const flag = this.valiSaveDevice()
          if (flag) {
            this.saveLoading = false
            return this.$message({
              showClose: true,
              message: flag,
              type: 'warning',
              duration: 0,
              customClass: 'zZindex'
            })
          }

          if (this.orderType === 2) { // 出库没有附件保存时
            let errMsg = ''
            let succesMsg = ''
            let url = ''
            if (this.isEdit) {
              url = '/device/order/output/edit'
              errMsg = '修改失败'
              succesMsg = '修改成功'
            } else {
              url = '/device/order/output/add'
              errMsg = '新增失败'
              succesMsg = '新增成功'
            }
            const order_info = {
              order_id: this.currentRow.order_id,
              project_code: this.project_code,
              oper_user: this.form.oper_user_id,
              order_code: this.form.order_code,
              involved_user: this.form.involved_user_id,
              create_user: this.$store.state.userInfo.id,
              oper_time: this.form.oper_time + '',
              warehouse_id: this.form.warehouse_id,
              device_list: this.tableData.map(m => {
                return {
                  device_id: m.device_id,
                  device_brand: m.device_brand,
                  number: Number(m.number)
                }
              })
            }
            this.upData.append('order_info', JSON.stringify(order_info))
            const { code, message } = await this.$pub.post(url, this.isEdit ? this.upData : order_info)
            if (code === 200) {
              this.$message.success(succesMsg)
              this.$emit('successEdit')
            } else {
              this.$message.error(message || errMsg)
            }
            this.upData.delete('order_info')
          } else {
            let sizes = 0
            this.fileTotal1 = 0
            this.fileTotal2 = 0
            this.fileTotal3 = 0
            this.allFj.forEach(f => {
              sizes += f.size// 总和
              if (f.fjType === 'files_t1') {
                this.fileTotal1++
              } else if (f.fjType === 'files_t2') {
                this.fileTotal2++
              } else if (f.fjType === 'files_t3') {
                this.fileTotal3++
              }
            })
            if (sizes / 1024 / 1024 > 80) {
              this.$message({
                type: 'error',
                message: '本次上传所有文件大小总和不能超过80M',
                showClose: true,
                customClass: 'uploadMessage'
              })
              this.saveLoading = false
              return false
            } else {
              if (this.fileTotal1 > 0) { // 有附件先上传再保存
                this.$refs.uploadFilefiles_t1[0].submit()
              }
              if (this.fileTotal2 > 0) { // 有附件先上传再保存
                this.$refs.uploadFilefiles_t2[0].submit()
              }
              if (this.fileTotal3 > 0) { // 有附件先上传再保存
                this.$refs.uploadFilefiles_t3[0].submit()
              }
              if (this.fileTotal1 <= 0 && this.fileTotal2 <= 0 && this.fileTotal3 <= 0) { // 无附件直接保存
                this.saveIn()
              }
            }
          }
        }
      })
    },
    async saveIn() {
      let errMsg = ''
      let succesMsg = ''
      let url = ''
      if (this.isEdit) {
        url = '/device/order/input/edit'
        errMsg = '修改失败'
        succesMsg = '修改成功'
      } else {
        url = '/device/order/input/add'
        errMsg = '新增失败'
        succesMsg = '新增成功'
      }

      const order_info = {
        order_id: this.currentRow.order_id,
        project_code: this.project_code,
        oper_user: this.form.oper_user_id,
        order_code: this.form.order_code,
        // involved_user: this.form.involved_user_id,//经办对象
        supply: this.form.supply, // 供应方
        create_user: this.$store.state.userInfo.id,
        oper_time: this.form.oper_time + '',
        warehouse_id: this.form.warehouse_id,
        device_list: this.tableData.map(m => {
          return {
            device_id: m.device_id,
            device_brand: m.device_brand,
            number: Number(m.number),
            unit: m.unit
          }
        }),
        photo_list: this.photo_list
      }
      this.screenLoading = true
      this.upData.append('order_info', JSON.stringify(order_info))
      const { code, message } = await this.$pub.post(url, this.upData)

      if (code === 200) {
        this.$message.success(succesMsg)
        this.$emit('successEdit')
      } else {
        this.$message.error(message || errMsg)
        this.saveLoading = false
        this.$refs.uploadFilefiles_t1[0].clearFiles()
        this.$refs.uploadFilefiles_t2[0].clearFiles()
        this.$refs.uploadFilefiles_t3[0].clearFiles()
      }
      this.upData.delete('files_t1')
      this.upData.delete('files_t2')
      this.upData.delete('files_t3')
      this.allFj = []
      this.upData.delete('order_info')
      this.screenLoading = false
      this.saveLoading = false
    },
    valiSaveDevice() {
      let flag = false
      for (let i = 0; i < this.tableData.length; i++) {
        const row = this.tableData[i]
        if (row.error) {
          flag = '出库数量必须为大于0的正整数，且不能大于库存数量'
          return flag
        }
        this.tableData.some((s, k) => {
          if (s.id === row.id && s.device_model === row.device_model && s.device_name === row.device_name && (s.device_brand_name === row.device_brand_name && s.device_brand_name !== '未知') && i !== k) {
            flag = '1.同一个物料品牌不能相同 2.相同的物料品牌不能都为空，请修改'
            return true
          }
        })
        if (flag) {
          return flag
        }
      }
      return flag
    },
    addWarehouse() {
      const h = this.$createElement
      let inp_value = ''
      this.$msgbox({
        title: '新增仓库',
        message: h('p', { style: 'display: flex', class: { 'el-input': true, 'el-input--mini': true } }, [
          h('span', { style: 'width: 80px' }, '仓库名称:'),
          h('input', {
            class: { 'el-input__inner': true },
            domProps: {
              value: ''
            },
            on: {
              input: (event) => {
                inp_value = event.target.value
              }
            }
          })
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            if (!inp_value) {
              instance.confirmButtonLoading = false
              return this.$message.error('请输入仓库名称')
            }
            if (this.warehouseList.map(m => m.name).includes(inp_value)) {
              instance.confirmButtonLoading = false
              return this.$message.error('仓库名称已经存在')
            }
            const params = {
              project_code: this.project_code,
              warehouse: inp_value,
              create_user: this.$store.state.userInfo.id
            }
            const { code } = await this.$pub.post('/device/order/warehouse/add', params)
            if (code !== 200) {
              instance.confirmButtonLoading = false
              return this.$message.error('新增仓库失败')
            }
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
              this.$emit('getwarehouseList')
            }, 300)
          } else {
            done()
          }
        }
      }).catch(err => { console.log(err) })
    },
    change(e, scope) {
      scope.row.number = e
      const test = /\D|^0/g
      if (scope.row.number === '' || new RegExp(test).test(scope.row.number)) {
        scope.row.error = '请输入大于0的整数'
      } else if (this.orderType === 2 && Number(scope.row.number) > Number(scope.row.stock_number)) {
        scope.row.error = '不能大于库存数量'
      } else {
        scope.row.error = false
      }
      this.$set(this.tableData, scope.$index, scope.row)
    }
  }
}
</script>
<style lang="scss">
.order_add{
  display: block;
  .el-drawer__header{
    margin-bottom:10px;
  }
  ._top{
    display:flex;
    flex-direction:row-reverse;
    position:absolute;
    top: -37px;
    right: 60px;
  }
  .wrap{
    width:100%;
    display:flex;
    justify-content:space-between;
    height:calc(100% - 20px);
    border-top:1px solid #eee;
    padding:10px 20px;
    box-sizing: border-box;
    ._left{
      width: 320px;
      height: 100%;
      border-right:1px solid #eee;
      padding-right:10px;
    }
    ._right{
      width: calc(100% - 360px);
      height:100%;
      overflow: auto;
      padding-right:10px;
      .cursor{
        cursor: pointer;
      }
    }
    .line{
      margin-right:4px;
    }
  }
  .cell{
    .el-button{
      padding:0;
    }
  }
  .el-table td{
      padding:4px;
  }
  .el-drawer__body{
    overflow:visible;
    height: calc(100% - 55px);
  }
}
.el-popover.clover_popover{
  min-width:20px;
  padding: 0;
  .brand_click{
    transition: opacity 0.1s ease;
    li{
      padding:10px 14px;
      cursor: pointer;
      &:hover{
        background:#ecf1f5;
      }
    }
    li.selected{
      background:#c8def5;
    }
  }
}
.addWarehouse{
  .el-drawer__header{
    margin-bottom:10px;
  }
}
.clover_outadd{
    margin-top: -20px;
   .el-upload{
     margin-left: 60px;
    .el-icon-close-tip{
      display:none!important;
    }
    .el-button{
      padding:0
    }
  }
  .el-upload-list__item.focusing .el-icon-close-tip{
    display:none!important;
  }
  li{
    cursor: pointer;
  }
  .isThree{
    margin-left: -10px;
  }
}
.fj_wrap{
  font-size: 14px;
  height:calc(100% - 320px);
  overflow: auto;
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
      width:210px;
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
.zZindex {
  z-index:9999999 !important;
}
.clover_prview{
  height:calc(100% - 20px);
  margin-top:10px!important;
  margin-bottom:0px!important;
  .el-dialog__body{
    height:calc(100% - 60px)
  }
}
.clover_prview_img{
  height:calc(100% - 20px);
  margin-top:10px!important;
  margin-bottom:0px!important;
  .el-dialog__body{
    min-height:calc(100% - 60px)
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
