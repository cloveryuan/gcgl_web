<template>
  <div class="app_map_wrap">
    <div id="GDMap" class="amap-wrapper"  v-loading="loading">
    </div>
    <div class="infos">
      <p>{{info.name}}</p>
      <span>{{info.code}}</span>
      <img src="@/assets/images/localtion.png" @click="goToGD">
    </div>
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
// import gcoord from '@/utils/gcoord.js'
export default {
  name: 'app_map_show',
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
      AMap: null,
      info: {
        name: '吴台路民权村八组与大冈交界',
        code: 'TH-BJ-0001'
      },
      position: this.$route.query.position ? this.$route.query.position : ''
    }
  },
  created () {
    this.initmap()
  },
  computed: {
    showLngLat() {
      const pos = this.$route.query.position ? this.$route.query.position : ''
      return pos.split(',')
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
          })
        }
      })
      this.GDMap.addControl(new this.AMap.Scale())
      this.GDMap.addControl(new this.AMap.MapType())

      this.GDMap.on('zoomchange', () => {
        if (this.GDMap.getZoom() < 10) {
          this.visible = false
        }
      })
    },
    goToGD() {
      window.location.href = `
        https://uri.amap.com/marker?position=${this.position}&name=${this.info.name}&src=mypage&coordinate=gaode&callnative=0
      `
    },
    destroyed () {
      this.GDMap.destroy()
      this.GDMap = null
      this.marker = null
    }
  }
}
</script>

<style lang="scss">
.app_map_wrap{
  display: flex;
  flex-direction: column;
}
body,#app,.app_map_wrap{
  width:100%;
  height: 100%;
  .amap-wrapper{
    width:100%;
    flex:1
  }
  .infos{
    padding:20px;
    position:relative;
    p{
      margin-bottom:10px;
    }
    span{
      font-size:14px;
      color:#999;
    }
    img{
      width: 40px;
      position:absolute;
      right:20px;
      top:50%;
      margin-top:-20px;
    }
  }
}
</style>
