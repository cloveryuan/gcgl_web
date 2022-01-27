<template>
  <div id="GDMap" class="amap-wrapper"  v-loading="loading">
    <div class="input-card" style="width:290px;" v-if="isShowPick">
      <el-radio-group v-model="radioValue" @change="onModeChange" >
        <el-radio label="dragMarker">拖拽点击Marker模式</el-radio>
        <el-radio label="dragMap">拖拽地图模式</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
import gcoord from '@/utils/gcoord.js'
import config from '@/config/config.js'
export default {
  name: 'addMap',
  props: {
    locationWGS: { // 84坐标系
      type: String,
      default: null
    },
    isShowPick: { // 84坐标系
      type: Boolean,
      default: true
    },
    noChangeCode: { // 只有拖动地图和点击地图才会根据此时生产的地图mark重新渲染经纬度，认为输入不去渲染
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      GDMap: null,
      loading: true,
      marker: null,
      geocoder: null,
      plugins: [
        'AMap.ToolBar',
        'AMap.MapType',
        'AMap.MouseTool',
        'AMap.PlaceSearch',
        'AMap.DistrictLayer',
        'AMap.CustomLayer',
        'AMap.Scale',
        'AMap.Geocoder'
      ],
      showLngLat: this.locationWGS,
      address: '',
      AMap: null,
      AMapUI: null,
      positionPicker: null,
      radioValue: 'dragMarker',
      isFlag: this.noChangeCode
    }
  },
  watch: {
    noChangeCode() {
      this.isFlag = this.noChangeCode
    }
  },
  created () {
    this.initmap()
  },
  methods: {
    initmap () {
      loadMap(this.plugins).then(res => {
        const { AMap, AMapUI } = res
        this.AMap = AMap
        this.AMapUI = AMapUI
        this.init()
      }).catch(() => {
        this.loading = false
        console.log('地图加载失败')
      })
    },
    init () {
      this.loading = true
      const res = this.showLngLat ? this.showLngLat.split(',') : [0, 0]
      const center = Number(res[0]) !== 0 && Number(res[1]) !== 0 ? gcoord.transform(
        res, // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.GCJ02 // 目标坐标系
      ) : []
      // 加载地图
      this.GDMap = new this.AMap.Map('GDMap', {
        resizeEnable: true,
        expandZoomRange: true,
        zoom: 16,
        zooms: [3, 20],
        features: ['bg', 'road', 'building', 'point'],
        isHotspot: false,
        showBuildingBlock: true
      })
      this.GDMap.on('complete', () => {
        this.loading = false
      })
      // this.GDMap.addControl(new this.AMap.ToolBar())
      this.GDMap.addControl(new this.AMap.Scale())
      // this.GDMap.addControl(new this.AMap.MapType())

      this.GDMap.on('zoomchange', () => {
        if (this.GDMap.getZoom() < 10) {
          this.visible = false
        }
      })

      if (!this.geocoder) {
        this.geocoder = new this.AMap.Geocoder({ radius: 1000 })
      }
      this.GDMap.on('click', (e) => {
        this.isFlag = false// 需要更改经纬度
        this.positionPicker.start(new this.AMap.LngLat(e.lnglat.getLng(), e.lnglat.getLat()))
      })
      this.GDMap.on('dragstart', (e) => {
        this.isFlag = false// 需要更改经纬度
      })
      // 加载ui组件
      this.AMapUI.loadUI(['misc/PositionPicker'], (PositionPicker) => {
        // 创建地图拖拽
        this.positionPicker = new PositionPicker({
          mode: this.radioValue,
          map: this.GDMap
        })
        this.positionPicker.on('success', (positionResult) => {
          const { address, position } = positionResult
          const tempResult = gcoord.transform(
            [position.lng, position.lat], // 经纬度坐标
            gcoord.GCJ02, // 当前坐标系
            gcoord.WGS84 // 目标坐标系
          )
          this.showLngLat = tempResult[0] + ',' + tempResult[1]
          this.address = address
          if (!this.isFlag) {
            this.$emit('changeLocation', tempResult)
            this.$emit('changeAddress', address)
          }
        })
        this.positionPicker.on('fail', function (positionResult) {
          console.log(positionResult)
        })
        if (center.length > 0) {
          this.positionPicker.start(new this.AMap.LngLat(center[0], center[1]))
        } else {
          this.positionPicker.start()
        }
      })
    },
    onModeChange (e) {
      this.positionPicker.setMode(e)
    },
    codeToLocaltion (location) { // 输入84坐标系 转为高德坐标系 再反编码出地址
      if (!location) {
        return
      }
      if (location.indexOf(',') > -1 && location.indexOf(',') === location.lastIndexOf(',')) {
        location = location.split(',')
        var longrg = config.lng
        var latreg = config.lat

        const lngBoolean = longrg.test(location[0])
        const latBoolean = latreg.test(location[1])
        if (!lngBoolean || !latBoolean) {
          this.$message({
            type: 'error',
            message: config.msg2,
            showClose: true
          })
        } else {
          const tempResult = gcoord.transform(
            location, // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.GCJ02 // 目标坐标系
          )

          this.positionPicker.start(new this.AMap.LngLat(tempResult[0], tempResult[1]))
          this.GDMap.setCenter(tempResult)
        }
      } else {
        this.$message({
          type: 'error',
          message: '经纬度之间逗号隔开!',
          showClose: true
        })
      }
    },
    localtionToCode (address) { // 地址转为高德经纬度 再转为84经纬度展示
      if (!address) {
        return
      }
      this.geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length) {
          const obj = result.geocodes[0].location
          const location = [obj.lng, obj.lat]
          const tempResult = gcoord.transform(
            location, // 经纬度坐标
            gcoord.GCJ02, // 当前坐标系
            gcoord.WGS84 // 目标坐标系
          )

          this.positionPicker.start(new this.AMap.LngLat(location[0], location[1]))
          this.GDMap.setCenter(location)
          this.showLngLat = tempResult[0] + ',' + tempResult[1]
          this.$emit('changeLocation', tempResult)
        } else {
          this.$message.error('根据地址查询位置经纬度失败')
        }
      })
    },
    destroyed () {
      this.GDMap.destroy()
      this.GDMap = null
      this.marker = null
      this.geocoder = null
      this.positionPicker = null
    }
  }
}
</script>

<style scoped>
.amap-wrapper{
  width:100%;
  height: 100%;
}
.input-card{
  background: #fff;
  position:absolute;
  bottom:5px;
  right:5px;
  z-index: 999;
  padding: 6px 10px;
  border-radius: 4px;
}
.ant-input-group-wrapper{
  margin-top:10px;
}
.ant-input[disabled]{
  background:#fff;
  color:rgba(0, 0, 0, 0.65);
  cursor:pointer;
}

.regeo{
  margin-top:10px;
  margin-right: 10px;
}

</style>
