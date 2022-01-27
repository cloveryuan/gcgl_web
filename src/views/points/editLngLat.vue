<template>
  <div class="addpoint_wrap">
    <div class="formwrap">
      <el-form ref="form" size="small" :model="form" :rules="rules" label-width="50px" >
          <el-form-item label="名称" class="read">
            <el-input v-model="form.point_name" readonly></el-input>
          </el-form-item>
          <el-form-item label="编码" class="read">
            <el-input v-model="form.point_code"  readonly></el-input>
          </el-form-item>
          <el-form-item label="经度" prop="lng">
            <el-input v-model="form.lng" placeholder="请输入点位经度或者地图选取" @input="$forceUpdate()"  @blur="codeTo"></el-input>
          </el-form-item>
          <el-form-item label="纬度" prop="lat">
            <el-input v-model="form.lat" placeholder="请输入点位纬度或者地图选取" @input="$forceUpdate()" @blur="codeTo"></el-input>
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" placeholder="经纬度转换地址" style="width:calc(100% - 70px)"></el-input>
            <el-button @click="addressTo" style="width:70px;padding:9px 2px;">转换经纬度</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :loading="saveLoading">保存</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
      </el-form>
    </div>
    <div class="mapwrap">
      <add-map
        ref="editMap"
        :noChangeCode="noChangeCode"
        :locationWGS="currentRow.lng_lat"
        @changeLocation="changeLocation"
        @changeAddress="changeAddress"
      ></add-map>
    </div>
  </div>
</template>

<script>
import addMap from './addPoint/addMap'
import gcoord from '@/utils/gcoord.js'
import { findUrlParams } from '@/utils/tool.js'
import config from '@/config/config.js'
export default {
  name: 'edit_lnglat',
  props: {
    currentRow: {
      required: true
    },
    project_code: {
      required: true
    },
    editLnglatShow: {
      required: true
    }
  },
  data () {
    const lngValidate = (rule, value, callback) => {
      var longrg = config.lng
      const lngBoolean = longrg.test(value)
      if (!lngBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    const latValidate = (rule, value, callback) => {
      var latreg = config.lat
      const latBoolean = latreg.test(value)
      if (!latBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    return {
      form: {
        address: '',
        lng: '',
        lat: '',
        point_name: '',
        point_code: ''
      },
      rules: {
        lng: [
          { required: true, message: '请输入点位经度', trigger: 'change' },
          { validator: lngValidate, trigger: 'blur' }
        ],
        lat: [
          { required: true, message: '请输入点位纬度', trigger: 'change' },
          { validator: latValidate, trigger: 'blur' }
        ]
      },
      noChangeCode: true,
      loading: false,
      saveLoading: false
    }
  },
  computed: {

  },
  mounted() {
    const tempArr = this.currentRow.lng_lat ? this.currentRow.lng_lat.split(',') : []
    this.form.lng = tempArr[0]
    this.form.lat = tempArr[1]
    this.form.point_name = this.currentRow.point_name
    this.form.point_code = this.currentRow.point_code
  },
  components: {
    addMap
  },
  methods: {
    async onSubmit() {
      try {
        await this.$refs.form.validate()
        this.saveLoading = true
        const { lng, lat, point_code } = this.form
        const { point_id } = this.currentRow

        const params = {
          project_code: this.project_code,
          point_code,
          point_id: Number(point_id),
          lng: lng + '',
          lat: lat + ''
        }
        const { code, message } = await this.$pub.post('/point/manage/coor-edit', params)
        this.saveLoading = false
        if (code !== 200) {
          return this.$message.error(message || '修改失败')
        }
        this.$message({
          type: 'success',
          message: '修改成功!',
          showClose: true
        })
        this.$emit('handleQuery')
        this.$emit('update:editLnglatShow', false)
      } catch (err) {
        this.$message.error(err || '修改失败')
        this.saveLoading = false
      }
    },
    reset() {
      this.$refs.form.resetFields()
    },
    changeLocation (location) {
      // this.form.lng = location[0]
      //  this.form.lat = location[1]
      this.form.lng = Math.floor(location[0] * 100000000) / 100000000
      this.form.lat = Math.floor(location[1] * 100000000) / 100000000
    },
    changeAddress (address) {
      this.form.address = address
    },
    codeTo(e) {
      /**
       * 左侧回填用84坐标系，地图上生成mark用gj102坐标系
       * 1.正常输入经度，纬度默认为84坐标系
       * 2.输入经度,纬度默认为84坐标系 ,(eg:120.33,33.379),这种情况要分割后，分别回填
       * 3.输入url地址默认为J02坐标系，获取其中经纬度，回填。(eg: url:https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&pointx=120.146&pointy=33.3985&name=%E5%95%86%E5%8E%A6%E7%AE%B1%E5%8C%85%E7%9A%AE%E5%85%B7&addr=%E6%B1%9F%E8%8B%8F%E7%9C%81%E7%9B%90%E5%9F%8E%E5%B8%82%E4%BA%AD%E6%B9%96%E5%8C%BA%E5%BC%80%E6%94%BE%E5%A4%A7%E9%81%9395%E5%8F%B7&ref=WeChat)
       */
      const val = e.target.value.replace(' ', '')
      const pointx = val.indexOf('pointx')
      const isDouhao = val.indexOf(',')
      const isDouhao2 = val.indexOf('，')
      if (pointx > 0) { // 输入为url情况
        const params = findUrlParams(val)
        const lng = params.pointx ? params.pointx : ''
        const lat = params.pointy ? params.pointy : ''
        const tempResult = gcoord.transform(
          [lng, lat], // 经纬度坐标
          gcoord.GCJ02, // 当前坐标系
          gcoord.WGS84 // 目标坐标系
        )
        this.form.lng = tempResult[0] || ''
        this.form.lat = tempResult[1] || ''
      } else if (isDouhao > 0) { // 输入为经度,纬度情况
        const params = val.split(',')
        this.form.lng = params[0] || ''
        this.form.lat = params[1] || ''
      } else if (isDouhao2 > 0) { // 输入为经度，（中文逗号）纬度情况
        const params = val.split('，')
        this.form.lng = params[0] || ''
        this.form.lat = params[1] || ''
      }

      this.noChangeCode = true
      const location = `${this.form.lng},${this.form.lat}`
      this.$refs.editMap.codeToLocaltion(location)
    },
    addressTo() {
      const address = this.form.address
      // this.$refs.editMap.isFlag = true
      this.$refs.editMap.localtionToCode(address)
    }
  }
}
</script>

<style>
.el-input__inner {
  border-radius: 0px !important;
}
.point_set .el-drawer__header{
  margin-bottom:0px;
}
.addpoint_wrap .el-form-item{
  margin-bottom:25px!important;
}
</style>
<style lang="scss">
.addpoint_wrap{
  height:100%;
  display:flex;
  justify-content: space-between;
  padding:20px;
  box-sizing:border-box;
  .formwrap{
    width:340px;
  }
  .mapwrap{
    width:calc(100% - 360px);
    height:100%;
  }
  .read{
    .el-input__inner{
      background: rgb(231, 230, 230);
      color:rgb(119, 115, 115);
      cursor: not-allowed;
    }
  }
}
</style>
