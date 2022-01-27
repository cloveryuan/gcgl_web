<template>
  <div id="GDMap" class="amap-wrapper" :style="{height: _height}"  v-loading="loading">
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'point_map_index',
  props: {
    positions: {
      type: String
    },
    _height: {
      type: String,
      default: '100%'
    }
  },
  data () {
    return {
      GDMap: null,
      loading: true,
      marker: null,
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
      AMap: null
    }
  },
  created () {
    this.initmap()
  },
  computed: {
    showLngLat() {
      let pos = ''
      if (this.positions) {
        pos = this.positions
      }
      const gc = gcoord.transform(
        pos.split(','), // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.GCJ02 // 目标坐标系
      )
      return gc
    }
  },
  methods: {
    initmap () {
      loadMap(this.plugins).then(res => {
        const { AMap } = res
        this.AMap = AMap
        this.init()
      }).catch(() => {
        this.loading = false
        console.log('地图加载失败')
      })
    },
    init () {
      this.loading = true
      // 加载地图
      this.GDMap = new this.AMap.Map('GDMap', {
        resizeEnable: true,
        expandZoomRange: true,
        zoom: 17.13,
        zooms: [3, 20],
        features: ['bg', 'road', 'building', 'point'],
        isHotspot: false,
        showBuildingBlock: true
        // center: this.showLngLat
      })
      if (this.showLngLat) {
        this.GDMap.setCenter(this.showLngLat)
      }
      this.GDMap.on('complete', () => {
        this.loading = false
        if (this.showLngLat) {
          this.marker = new this.AMap.Marker({
            map: this.GDMap,
            position: this.showLngLat,
            icon: new this.AMap.Icon({
              size: new this.AMap.Size(32, 32),
              image: require('../../../assets/images/position-picker.png'),
              imageSize: new this.AMap.Size(32, 32)
            })
            // offset: new AMap.Pixel(16, 32)
          })
        }
      })
      this.GDMap.addControl(new this.AMap.ToolBar())
      this.GDMap.addControl(new this.AMap.Scale())
      this.GDMap.addControl(new this.AMap.MapType())

      this.GDMap.on('zoomchange', () => {
        if (this.GDMap.getZoom() < 10) {
          this.visible = false
        }
      })
    },
    destroyed () {
      this.GDMap.destroy()
      this.GDMap = null
      this.marker = null
    }
  }
}
</script>

<style>
.amap-wrapper{
  width:100%;
}
</style>
