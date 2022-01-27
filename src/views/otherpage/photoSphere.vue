<template>
  <div id="viewer"></div>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
export default {
  name: 'photo_sphere',
  data () {
    return {
      // 全景照片
      viewer: '',
      imgUrl: decodeURIComponent(this.$route.query.img)
    }
  },
  mounted() {
    this.initPhotoSphere(this.imgUrl)
  },
  watch: {
    $route: {
      handler(val) {
        this.imgUrl = decodeURIComponent(val.query.img)
        this.initPhotoSphere(this.imgUrl)
      },
      deep: true
    }
  },
  methods: {
    initPhotoSphere(img) {
      if (this.viewer) {
        this.viewer.destroy()
      }
      this.$nextTick(() => {
        this.viewer = new Viewer({
          container: document.querySelector('#viewer'),
          panorama: img,
          size: {
            width: '100vw',
            height: '100vh'
          },
          navbar: [
            'autorotate',
            'zoom',
            'caption',
            'fullscreen'
          ],
          autorotateDelay: false,
          defaultZoomLvl: 1
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
