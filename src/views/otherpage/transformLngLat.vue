<template>
  <div id="GDMap" class="amap-wrapper"  v-loading="loading">
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'transformLngLat',
  data () {
    return {
      GDMap: null,
      loading: true,
      marker: null,
      plugins: [
        // 'AMap.ToolBar',
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
      const pos = this.$route.query.position ? this.$route.query.position : ''
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
        isHotspot: true,
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
            position: this.showLngLat
            // icon: new AMap.Icon({
            //     size: new AMap.Size(22, 28.5),
            // }),
            // offset: new AMap.Pixel(-5,-38)
          })
        }
      })
      // this.GDMap.addControl(new this.AMap.ToolBar())
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
body,#app,.amap-wrapper{
  width:100%;
  height: 100%;
}
</style>
