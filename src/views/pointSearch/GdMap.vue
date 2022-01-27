<template>
  <div id="GDMap" class="amap-wrapper"  v-loading="loading">
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
export default {
  name: 'GDMap',
  props: {
    isKJsearch: {
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
      AMap: null
    }
  },
  created () {
    this.initmap()
  },
  methods: {
    initmap () {
      loadMap(this.plugins).then(res => {
        const { AMap } = res
        this.AMap = AMap
        this.$emit('haveAmap', AMap)
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
        zoom: 18,
        zooms: [3, 20],
        features: ['bg', 'road', 'building', 'point'],
        isHotspot: false,
        showBuildingBlock: true
      })
      this.GDMap.on('complete', () => {
        this.loading = false
      })
      // this.GDMap.disableDoubleClickZoom()
      // this.GDMap.addControl(new this.AMap.ToolBar())
      this.GDMap.addControl(new this.AMap.Scale())
      // this.GDMap.addControl(new this.AMap.MapType())

      this.GDMap.on('zoomchange', () => {
        // if (this.GDMap.getZoom() < 10) {
        //   this.visible = false
        // }
      })

      this.GDMap.on('movestart', this.mapMovestart)

      if (!this.geocoder) {
        this.geocoder = new this.AMap.Geocoder({ radius: 1000 })
      }
      this.GDMap.on('click', (e) => {
        if (this.isKJsearch) return// 是否需要点击事件
        const lng_lat = [e.lnglat.getLng(), e.lnglat.getLat()]
        this.$emit('getNearPoint', lng_lat)
      })
    },
    mapMovestart() {
      this.$emit('mapMovestart')
    },
    destroyed () {
      this.GDMap.destroy()
      this.GDMap = null
      this.marker = null
      this.geocoder = null
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
