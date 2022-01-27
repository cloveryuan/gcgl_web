<!-- 新增退库单 -->
<template>
  <div style="height:100%;position:relative;">
    <p class="_top">
      <el-button type="primary" size="mini" @click="save" v-loading="saveLoading">保存</el-button>
    </p>
    <div class="wrap">
      <div class="_left">
        <div class="module">
          <span class="line"></span>
          <span>退库信息</span>
        </div>
        <el-form :model="form" ref="form"  size="small"  label-width="82px" :rules="rules">
          <el-form-item label="过程单号:" prop="order_code" v-if="isEdit">
            <el-input
              style="width:220px;"
              v-model="form.order_code"
              placeholder="请输入过程单号"
              clearable
              disabled
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
          <el-form-item label="经办对象:" prop="involved_user_id">
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
              @visible-change="before_involved_userChange($event)"
              @change="changeinvolved_user"

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
            <el-select v-model="form.warehouse_id"  placeholder="请选择"  style="width220px">
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
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
          <el-table-column prop="device_name" label="物料类型名称" min-width="110px" show-overflow-tooltip></el-table-column>
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
          <el-table-column prop="out_number" label="出库数量" width="80"></el-table-column>
          <el-table-column prop="number" label="退库数量" min-width="120">
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
        <add-warehouse
          v-if="addTable"
          @sureAddTableData="sureAddTableData"
          :defaultData="tableData"
          :project_code="project_code"
          :dept_id="form.dept_id"
        ></add-warehouse>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import addWarehouse from './addWarehouse'
export default {
  name: 'return_add_order',
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
      photo_list: [],
      uploadFiles: [], // 待上传的文件列表
      fileTotal: 0, // 上传文件总数
      upData: new FormData(),
      saveLoading: false,
      fileUrl: '', // 预览的url
      isPdf: false,
      isImg: false
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
        } else if (Number(m.number) > Number(m.out_number)) {
          m.error = '不能大于出库数量'
        } else {
          m.error = false
        }
        return m
      })
      this.photo_list = this.currentRow.photo_list ? this.currentRow.photo_list.map(m => {
        const isPdf = m.file_name.toLowerCase().search('.pdf') > -1
        const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
        const baseurl = process.env.VUE_APP_BASE_URL + env
        console.log(baseurl)
        const url = baseurl + m.file_path + m.file_name
        return Object.assign(m, { type: isPdf ? 'pdf' : 'img', url })
      }) : []
      this.userList.push({
        user_id: this.form.oper_user_id,
        user_name_dept: this.form.oper_user_name
      })
      this.involved_userList.push({
        user_id: this.form.involved_user_id,
        dept_id: this.form.dept_id,
        user_name_dept: this.form.involved_user_name
      })
    }
  },
  components: {
    addWarehouse
  },
  methods: {
    addTableData() {
      if (!this.form.involved_user_id) {
        return this.$message.error('请先选择经办对象')
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
    before_involved_userChange(e) {
      if (e && this.tableData.length > 0) {
        this.$message({
          type: 'warning',
          message: '切换的经办对象不属于同部门，右侧物料将被清空!',
          showClose: true
        })
      }
    },
    changeinvolved_user(val) {
      const dep_id = this.involved_userList.find(f => f.user_id === val).dept_id
      if (dep_id !== this.form.dept_id) {
        this.tableData = []
      }
      this.form.dept_id = dep_id
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

          let errMsg = ''
          let succesMsg = ''
          let url = ''
          if (this.isEdit) {
            url = '/device/order/return/edit'
            errMsg = '修改失败'
            succesMsg = '修改成功'
          } else {
            url = '/device/order/return/add'
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
                number: Number(m.number),
                unit: m.unit
              }
            })
          }
          const { code, message } = await this.$pub.post(url, order_info)
          if (code === 200) {
            this.$message.success(succesMsg)
            this.$emit('successEdit')
          } else {
            this.$message.error(message || errMsg)
          }
          this.upData.delete('order_info')
        }
      })
    },
    valiSaveDevice() {
      let flag = false
      for (let i = 0; i < this.tableData.length; i++) {
        const row = this.tableData[i]
        if (row.error) {
          flag = '退库数量必须为大于0的正整数，且不能大于出库数量'
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
    change(e, scope) {
      scope.row.number = e
      const test = /\D|^0/g
      if (scope.row.number === '' || new RegExp(test).test(scope.row.number)) {
        scope.row.error = '请输入大于0的整数'
      } else if (Number(scope.row.number) > Number(scope.row.out_number)) {
        scope.row.error = '不能大于出库数量'
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
      height:100%;
      border-right:1px solid #eee;
      overflow: auto;
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
   .el-upload{
    .el-icon-close-tip{
      display:none!important;
    }
  }
  .el-upload-list__item.focusing .el-icon-close-tip{
    display:none!important;
  }
  li{
    cursor: pointer;
  }
}
.fj_wrap{
  font-size: 14px;
  li{
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
.order_add  .el-drawer__body{
    overflow:visible;
    height: calc(100% - 55px);
  }
</style>
