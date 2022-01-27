<template>
  <div class="check_content wrap">
    <div class="ip" v-loading="ipLoading">
      <div class="tit">
        <span>IP信息审核</span>
        <div class="btns" v-if="form.device_ip">
          <el-button  size="mini" @click="toOpera(2)">作废</el-button>
          <el-button type="primary" size="mini" @click="toOpera(1)">确认</el-button>
        </div>
      </div>
      <el-form v-if="form.device_ip" ref="form" size="small" :model="form" :rules="rules" label-width="80px" >
        <el-form-item label="添加描述" >
          <el-input v-model="form.remark" type="textarea" :disabled="true"/>
        </el-form-item>
        <el-form-item label="设备名称" prop="device_name" >
          <el-input v-model="form.device_name" />
        </el-form-item>
        <el-form-item label="IP地址" prop="device_ip" >
          <el-input v-model="form.device_ip" />
        </el-form-item>
        <el-form-item label="设备类型" prop="device_model" >
          <el-input v-model="form.device_model" />
        </el-form-item>
        <el-form-item label="设备编码" prop="device_code" >
          <el-input v-model="form.device_code" />
        </el-form-item>
        <el-form-item label="序列号" prop="device_sn" >
          <el-input v-model="form.device_sn" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="device_mask" >
          <el-input v-model="form.device_mask" />
        </el-form-item>
        <el-form-item label="网关" prop="device_gateway" >
          <el-input v-model="form.device_gateway" />
        </el-form-item>
        <el-form-item label="Mac地址" prop="device_mac" >
          <el-input v-model="form.device_mac" />
        </el-form-item>
        <el-form-item label="端口" prop="device_port" >
          <el-input v-model="form.device_port" />
        </el-form-item>
        <el-form-item label="账号" prop="device_account" >
          <el-input v-model="form.device_account" />
        </el-form-item>
        <el-form-item label="密码" prop="device_pass" >
          <el-input v-model="form.device_pass" />
        </el-form-item>
        <el-form-item label="行车方向" prop="device_car_direction">
          <el-select  v-model="form.device_car_direction" style="width:100%;" placeholder="请选择行车方向" >
            <el-option
              v-for="item in directList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备朝向" prop="device_direction">
          <el-select  v-model="form.device_direction" style="width:100%;"  placeholder="请选择设备朝向" >
            <el-option
              v-for="item in device_directList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div v-else class="empty">
        <span>暂无数据</span>
      </div>
    </div>
    <div class="assets">
      <div class="tit">
        <span>已维护设备</span>
      </div>
      <el-table
        class="tableWrap"
        :max-height="maintainedHeight"
        :data="maintainedData"
        :row-style="{ height: '30px' }"
        :cell-style="{ padding: '4px 0' }"
        @row-click="currentClick"
        v-loading="maintainedLoading"
        :row-class-name="tableRowClassName"
      >
        <el-table-column  show-overflow-tooltip  label="设备名称" prop="device_name"></el-table-column>
        <el-table-column prop="device_model" label="设备型号" width="140"></el-table-column>
        <el-table-column prop="device_ip" label="IP地址" width="120"></el-table-column>
        <el-table-column prop="status_name" label="状态" width="80"></el-table-column>
      </el-table>
      <template v-if="maintainedInfo">
        <div class="tit noborder">
          <span>详情</span>
        </div>
        <el-descriptions title="" direction="vertical" :column="4" border size="mini">
          <el-descriptions-item label="设备名称" :span="4">{{maintainedInfo.device_name?maintainedInfo.device_name:'-'}}</el-descriptions-item>
          <el-descriptions-item label="设备型号名称">{{maintainedInfo.device_model_name?maintainedInfo.device_model_name:'-'}}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{maintainedInfo.device_ip?maintainedInfo.device_ip:'-'}}</el-descriptions-item>
          <el-descriptions-item label="设备型号" >{{maintainedInfo.device_model?maintainedInfo.device_model:'-'}}</el-descriptions-item>
          <el-descriptions-item label="序列号">{{maintainedInfo.device_sn?maintainedInfo.device_sn:'-'}}</el-descriptions-item>
          <el-descriptions-item label="子网掩码">{{maintainedInfo.device_mask?maintainedInfo.device_mask:'-'}}</el-descriptions-item>
          <el-descriptions-item label="网关" >{{maintainedInfo.device_gateway?maintainedInfo.device_gateway:'-'}}</el-descriptions-item>
          <el-descriptions-item label="Mac地址">{{maintainedInfo.device_mac?maintainedInfo.device_mac:'-'}}</el-descriptions-item>
          <el-descriptions-item label="端口">{{maintainedInfo.device_port?maintainedInfo.device_port:'-'}}</el-descriptions-item>
          <el-descriptions-item label="账号" >{{maintainedInfo.device_account?maintainedInfo.device_account:'-'}}</el-descriptions-item>
          <el-descriptions-item label="密码">{{maintainedInfo.device_pass?maintainedInfo.device_pass:'-'}}</el-descriptions-item>
          <el-descriptions-item label="状态">{{maintainedInfo.status_name?maintainedInfo.assets_code:'-'}}</el-descriptions-item>
          <el-descriptions-item label="接入平台" >-</el-descriptions-item>
          <el-descriptions-item label="行车方向">{{maintainedInfo.device_car_direction_name?maintainedInfo.device_car_direction_name:'-'}}</el-descriptions-item>
          <el-descriptions-item label="设备朝向" >{{maintainedInfo.device_direction_name?maintainedInfo.device_direction_name:'-'}}</el-descriptions-item>
        </el-descriptions>
        <div class="tdinfo">
          <el-table :data="camera_list" :height="tdHeight" style="width: 100%" border  :row-style="{ height: '30px' }" :cell-style="{ padding: '4px 0' }">
            <el-table-column prop="camera_sn" label="国标编码" width="80" align="center"></el-table-column>
            <el-table-column prop="camera_code" label="通道编号" show-overflow-tooltip  align="center"></el-table-column>
            <el-table-column prop="camera_name" label="通道名称" show-overflow-tooltip align="center"></el-table-column>
            <el-table-column prop="camera_num" label="通道信号" width="80" align="center"></el-table-column>
          </el-table>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'check_content',
  props: {
    point: {
      type: Object || null,
      default: null
    }
  },
  data () {
    var ipValid = (rule, value, callback) => {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if ((!reg.test(value)) && value !== '') {
        callback(new Error('ip格式不正确'))
      } else {
        callback()
      }
    }
    return {
      form: {
        device_name: '',
        remark: '',
        device_ip: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        device_car_direction: '',
        device_direction: '',
        device_code: '',
        device_model: '',
        device_sn: '',
        status: '0'
      },
      rules: {
        device_ip: [
          { required: true, message: '请输入IP', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ],
        device_mask: [
          { required: true, message: '请输入子网掩码', trigger: 'blur' }
        ],
        device_gateway: [
          { required: true, message: '请输入网关', trigger: 'blur' }
        ],
        device_mac: [
          { required: true, message: '请输入mac地址', trigger: 'blur' }
        ],
        device_account: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        device_pass: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      // IP信息
      ipLoading: false,
      directList: [],
      device_directList: [],
      // 已维护设备
      maintainedData: [],
      maintainedLoading: false,
      currentMaintained: null,
      maintainedInfo: null,
      maintainedHeight: 300,
      camera_list: [],
      tdHeight: 150
    }
  },
  watch: {
    point: {
      handler(val) {
        if (val) {
          this.currentMaintained = null
          this.getIPinfo()
          this.getMaintainedData()
        } else {
          this.reset()
        }
      },
      deep: true
    }
  },
  created() {
    this.getDictList()
  },
  mounted() {
  },
  methods: {
    getDictList() {
      this.$dict(this, 'device_car_direction').then((res) => {
        if (res.code === 200) {
          this.directList = res.data || []
        } else {
          this.$message({
            type: 'error',
            message: '出错了device_car_direction',
            showClose: true
          })
          this.directList = []
        }
      })
      this.$dict(this, 'device_direction').then((res) => {
        if (res.code === 200) {
          this.device_directList = res.data || []
        } else {
          this.$message({
            type: 'error',
            message: '出错了device_direction',
            showClose: true
          })
          this.device_directList = []
        }
      })
    },
    // 获取IP信息
    async getIPinfo() {
      this.ipLoading = true
      const { code, data } = await this.$pub.post('/point/device/device-info', { id: this.point.id })
      if (code === 200) {
        this.form = data.device_info
      } else {
        this.$message({
          type: 'error',
          message: '出错了获取ip信息point/device/device-info',
          showClose: true
        })
      }

      this.ipLoading = false
    },
    // 获取已维护设备
    async getMaintainedData() {
      this.maintainedLoading = true
      const { code, data } = await this.$pub.post('/point/device/device-list', { point_id: Number(this.point.point_id) })
      if (code === 200) {
        this.maintainedData = data.list || []
        if (this.maintainedData.length > 0) {
          this.currentClick(this.maintainedData[0])
        } else {
          this.maintainedHeight = 300
        }
      } else {
        this.$message.error('出错了/point/device/device-list')
        this.maintainedData = []
      }

      this.maintainedLoading = false
    },
    tableRowClassName ({ row }) {
      return this.currentMaintained && row.id === this.currentMaintained.id ? 'current-row' : ''
    },
    async currentClick(row) {
      this.currentMaintained = row
      const { code, data } = await this.$pub.post('/point/device/device-info', { id: row.id })
      if (code === 200) {
        this.maintainedInfo = data.device_info
        this.camera_list = data.camera_list
      } else {
        this.$message.error('出错了获取ip信息point/device/device-info')
      }

      this.$nextTick(() => {
        const baseHeight = 75
        const _el = document.getElementsByClassName('assets')
        if (_el[0]) {
          const toplen = this.maintainedData.length
          const bottomlen = this.camera_list.length
          const _info = _el[0].getElementsByClassName('el-descriptions')
          const __infoheight = _info[0].offsetHeight
          const _height = _el[0].offsetHeight

          if ((toplen + bottomlen) * 32 + 100 <= _height - baseHeight - __infoheight) {
            this.tdHeight = bottomlen < 1 ? 100 : bottomlen * 32 + 50
            const syHeight = _height - baseHeight - __infoheight - this.tdHeight
            this.maintainedHeight = syHeight
          } else {
            this.tdHeight = bottomlen > 4 ? 250 : bottomlen < 1 ? 100 : (bottomlen * 32 + 50)
            const syHeight = _height - baseHeight - __infoheight - this.tdHeight
            // this.maintainedHeight = syHeight > 200 ? ((syHeight / 32 > toplen) ? toplen * 32 : syHeight) : 200
            this.maintainedHeight = syHeight > 200 ? syHeight : 200
          }
        }
      })
    },
    reset() {
      // 清空ip信息 已维护设备列表 通道详情 通道列表
      this.form = {
        device_name: '',
        remark: '',
        device_ip: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        device_car_direction: '',
        device_direction: '',
        device_code: '',
        device_model: '',
        device_sn: '',
        status: '0',
        id: ''
      }
      this.maintainedData = []
      this.currentMaintained = null
      this.maintainedInfo = null
      this.camera_list = []
    },
    // 确认 作废IP详情
    toOpera(type) {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.ipLoading = true
          const {
            id, device_code, device_model, device_sn, device_name, device_ip, device_mask, device_gateway, device_mac, device_port, device_account, device_pass, device_car_direction, device_direction, status
          } = this.form
          const params = {
            id, // 主键
            device_code, // 设备编码
            device_model, // 设备类型
            device_name, // 设备名称
            device_ip, // 设备ip
            device_port, // 设备端口
            device_mask, // 子网掩码
            device_gateway, // 网关
            device_mac, // mac地址
            device_sn, // 序列号
            device_account, // 账号
            device_pass, // 密码
            device_direction: device_direction === '' ? 0 : Number(device_direction), // 朝向
            device_car_direction: device_car_direction === '' ? 0 : Number(device_car_direction), // 行车方向
            status, // 状态
            update_user: this.$store.state.userInfo.id,
            oper_type: type // 1 通过  2作废
          }
          const { code } = await this.$pub.post('point/device/device-check-confirm', params)
          if (code === 200) {
            this.reset()
            this.$emit('getPointList')
            this.$message({
              type: 'success',
              message: '审核成功',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: '审核失败',
              showClose: true
            })
          }
          this.ipLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.check_content{
  .tit.noborder{
    border-bottom:0;
  }
  .tit{
    display:flex;
    justify-content: space-between;
    align-items: center;
    border-bottom:1px solid #DCDFE6;
    font-size: 18px;
    padding-bottom:4px;
    >span{
       &:before{
         display:inline-block;
        font-size: 0px;
        content: '';
        height:10px;
        width:0px;
        border:2px solid #409EFF;
        margin-right:6px;
      }
    }
    .el-button{
      // border-bottom: 0;
    }
    .el-button+.el-button{
      margin-left: 0;
    }
  }
  .ip{
    padding: 0 10px;
    width:340px;
    height:100%;
    box-sizing:border-box;
    border-left:1px solid #DCDFE6;
    border-right:1px solid #DCDFE6;
    overflow: auto;
    .el-form{
      margin-top:10px;
      .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
        margin-bottom:15px;
      }
    }
    .empty{
      min-height: 60px;
      text-align: center;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom:1px solid #DCDFE6;
      span{
        line-height: 60px;
        width: 50%;
        color: #909399;
        font-size:14px;
      }
    }
  }
  .tableWrap{
    border-top:0!important;
    margin-bottom:10px;
    border:1px solid #DCDFE6;
    border-bottom:0!important;
  }
  .assets{
    padding-left: 10px;
    width:calc(100% - 340px);
    height:100%;
    box-sizing:border-box;
    .el-descriptions-item__label{
      font-size: 16px;
      // color: #000;
    }
    .tdinfo{
      margin-top:10px;
    }
  }
}
</style>
