<template>
  <div class="matched_content" v-loading="infoLoading">
    <div class="tit">
      <span>通道信息</span>
      <div class="btns">
        <el-button type="primary" size="mini" v-if="camera_list.length>0" @click="save">保存</el-button>
      </div>
    </div>
    <el-descriptions title="" direction="vertical" :column="5" border size="mini">
       <el-descriptions-item label="设备名称" :span="4" class="inp">
        <!-- {{maintainedInfo.device_name?maintainedInfo.device_name:'/'}} -->
        <el-input v-model="maintainedInfo.device_name" size="mini"></el-input>
       </el-descriptions-item>
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
        <el-descriptions-item label="状态">{{maintainedInfo.status_name?maintainedInfo.status_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="接入平台" >-</el-descriptions-item>
        <el-descriptions-item label="行车方向">{{maintainedInfo.device_car_direction_name?maintainedInfo.device_car_direction_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="设备朝向" >{{maintainedInfo.device_direction_name?maintainedInfo.device_direction_name:'-'}}</el-descriptions-item>
    </el-descriptions>
    <div class="tdinfo">
      <el-table :data="camera_list" :height="tdHeight" style="width: 100%" border  :row-style="{ height: '30px' }" :cell-style="{ padding: '4px 0' }">
        <el-table-column prop="camera_sn" label="国标编码" width="100" align="center"></el-table-column>
        <el-table-column prop="camera_code" label="通道编号"  align="center"></el-table-column>
        <el-table-column prop="camera_name" label="通道名称" align="center">
          <template slot-scope="{row}">
            <div class="error_wrap">
              <el-input v-model="row.camera_name" size="mini" @blur="validateName(row)"></el-input>
              <span v-if="row.error" class="error">{{row.error}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="camera_num" label="通道信号" width="80" align="center"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'matched_content',
  data () {
    return {
      infoLoading: false,
      maintainedInfo: {
        device_name: '',
        device_ip: '',
        device_model: '',
        device_sn: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        status_name: '',
        device_car_direction: '',
        device_direction: ''
      },
      camera_list: [],
      tdHeight: 100
    }
  },
  props: {
    point: {
      type: Object || null,
      default: null
    }
  },
  watch: {
    point: {
      handler(val) {
        if (val) {
          this.getInfo()
        } else {
          this.reset()
        }
      },
      deep: true
    }
  },
  methods: {
    async getInfo() {
      this.infoLoading = true
      const { code, data } = await this.$pub.post('/point/device/device-info', { id: this.point.id })
      if (code === 200) {
        this.maintainedInfo = data.device_info
        this.camera_list = data.camera_list.map(m => {
          return {
            ...m, error: '', create_user: this.$store.state.userInfo.id
          }
        })
      } else {
        this.$message.error('出错了获取ip信息point/device/device-info')
      }
      this.infoLoading = false
      this.$nextTick(() => {
        const baseHeight = 37
        const _el = document.getElementsByClassName('matched_content')
        if (_el[0]) {
          const _info = _el[0].getElementsByClassName('el-descriptions')
          const _height1 = _info[0].offsetHeight
          const _height = _el[0].offsetHeight
          this.tdHeight = _height - baseHeight - _height1
        }
      })
    },
    reset() {
      this.maintainedInfo = {
        device_name: '',
        device_ip: '',
        device_model: '',
        device_sn: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        status_name: '',
        device_car_direction: '',
        device_direction: ''
      }
      this.camera_list = []
    },
    validateName(row) {
      if (!row.camera_name) {
        row.error = '不能为空'
      } else {
        row.error = ''
      }
    },
    async save() {
      // this.infoLoading = true
      let flag = false
      this.camera_list.forEach(f => {
        if (!f.camera_name) {
          f.error = '不能为空'
          flag = true
        }
      })
      if (flag) {
        return
      }
      const params = {
        device_name: this.maintainedInfo.device_name,
        camera_list: this.camera_list
      }
      const { code } = await this.$pub.post('point/device/device-camera-add', params)
      if (code === 200) {
        this.reset()
        this.$emit('getPointList')
        this.$message({
          type: 'success',
          message: '操作成功',
          showClose: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '操作失败',
          showClose: true
        })
      }
      this.infoLoading = false
    }
  }
}
</script>

<style lang="scss">
.matched_content{
  width: calc(100% - 440px);
  height: 100%;
  padding-left: 10px;
  box-sizing: border-box;
  border-left: 1px solid #DCDFE6;
  // border-right: 1px solid #DCDFE6;
  .tit{
    display:flex;
    justify-content: space-between;
    align-items: center;
    border-bottom:1px solid #DCDFE6;
    font-size: 18px;
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
      border-bottom: 0;
    }
    .el-button+.el-button{
      margin-left: 0;
    }
  }
  .tdinfo{
    margin-top:10px;
  }
  .error_wrap{
    display:flex;
    justify-content: space-around;
    .error{
      width: 115px;
      color:#f40;
      display:inline-block;
    }
  }
}
</style>
