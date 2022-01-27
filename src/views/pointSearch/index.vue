<template>
  <div class="point_search">
    <el-form size="small"  :inline="true">
      <el-form-item label="项目" >
        <el-select
          v-model="form.project_code"
          placeholder="请选择"
          @change="handleProjectChange"
          filterable
          >
          <template v-if="AMap">
            <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
          </template>
          <li v-else>加载中</li>
        </el-select>
      </el-form-item>
      <el-form-item label="点位编码">
        <el-select
          v-model="form.point"
          placeholder="请选择"
          @change="handlePointCodeChange"
          :disabled="!form.project_code"
          value-key="point_code"
          filterable
          remote
          :remote-method="remoteMethod"
          :loading="pointLoading"
        >
          <el-option v-for="item in pointList" :key="item.point_code"  :value="item" :label="item.point_name">
            <span style="float: left">{{ item.point_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.point_code }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="" class="toolwrap">
        <span class="tit" @click="changeKJ">{{isKJsearch?'关闭工具':'空间查询'}}</span>
        <span class="toolBar" id="toolBar_clover">
          <i v-for="item in toolBar" :class="[selectTool===item.id?'active':'',item.icon]" :key="item.id" @click="selectToolBar(item.id)" ></i>
        </span>
      </el-form-item> -->
    </el-form>
    <!-- 地图 -->
    <div class="mapwrap" v-loading="mapLoading">
      <gd-map
        ref="gdMap"
        @haveAmap="haveAmap"
        @mapMovestart="mapMovestart"
        @getNearPoint="getNearPoint"
        :isKJsearch="isKJsearch"
      ></gd-map>
      <div v-show="visible" class="diago_clover" ref="diago_clover">
        <i class="el-icon-close" @click="visible=false"></i>
        <div class="wrap">
          <span>子系统名称:</span>
          <span>{{point_info.child_name}}</span>
        </div>
        <div  class="wrap">
          <span>点位编码:</span>
          <span>{{point_info.point_code}}</span>
        </div>
        <div  class="wrap">
          <span>点位名称:</span>
          <span>{{point_info.point_name}}</span>
        </div>
        <div  class="wrap">
          <span>状态说明:</span>
          <span>{{point_info.status_name}}</span>
        </div>
      </div>
      <!-- <ul class="toolBar">
        <li v-for="item in toolBar" :class="{active: selectTool===item.id}" :key="item.id" @click="selectToolBar(item.id)">
          <i :class="item.icon" ></i>
        </li>
      </ul> -->
    </div>
  </div>
</template>
<script>
// import qs from 'qs'
import GdMap from './GdMap'
import gcoord from '@/utils/gcoord.js'
export default {
  name: 'pointSearch',
  data () {
    return {
      form: {
        project_code: '',
        point: ''
      },
      projectList: [],
      pointList: [],
      AMap: null,
      markers: null,
      pointLoading: false,
      mapLoading: false,
      near_points: [],
      point_info: {},
      pos: {},
      position: {},
      visible: false,
      offset: {
        x: 0,
        y: -30
      },
      styleObjectArr: [],
      toolBar: [
        { icon: 'el-icon-search', id: 1 },
        { icon: 'el-icon-news', id: 2 }
      ],
      selectTool: 0,
      overlays: [],
      isKJsearch: false
    }
  },
  computed: {

  },
  mounted() {
    this.getProjectsList()
  },
  components: {
    GdMap
  },
  watch: {
    pos(newPos) {
      const GDMap = this.$refs.gdMap.GDMap
      this.position = GDMap.lngLatToContainer(newPos)
      if (this.position && this.position.x && this.position.y) {
        this.$nextTick(() => {
          const infoHeight = document.querySelector('.diago_clover').clientHeight
          this.$refs.diago_clover.style.left = this.position.x + this.offset.x + 'px'
          this.$refs.diago_clover.style.top = this.position.y - infoHeight / 2 + this.offset.y + 'px'
        })
      }
    }
  },
  methods: {
    haveAmap(AMap) {
      this.AMap = AMap
    },
    async getProjectsList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (Number(code) === 200 && data !== null) {
        this.projectList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    handleProjectChange() {
      this.pointList = []
      this.form.point = {}
      this.point_info = {}
      const GDMap = this.$refs.gdMap.GDMap
      if (this.markers !== null) {
        GDMap.clearMap()
        this.visible = false
      }
    },
    async remoteMethod(query) {
      if (query !== '') {
        this.pointLoading = true
        const params = {
          project_code: this.form.project_code,
          keywords: query
        }
        const { data } = await this.$pub.post('/point/search', params)
        this.pointList = data || []
        this.pointLoading = false
      }
    },
    async handlePointCodeChange() {
      const GDMap = this.$refs.gdMap.GDMap
      if (this.markers !== null) {
        GDMap.clearMap()
        this.visible = false
      }
      this.point_info = {}
      // 1.获取附件300米以内的点，生成icon在地图上
      this.mapLoading = true
      const params = {
        project_code: this.form.project_code,
        lng: this.form.point.lng,
        lat: this.form.point.lat,
        point_code: this.form.point.point_code
      }
      const { data } = await this.$pub.post('/point/near', params)
      this.near_points = data
      this.drawMarks(this.near_points, 2)

      // 2.勘测未知生成icon在地图上
      this.drawMarks([this.form.point], 1)
    },
    addMarker (point, index) {
      const data = {
        lnglat: [point.lng02, point.lat02],
        name: point.point_name,
        point: point,
        id: index,
        style: index
      }
      return data
    },
    drawMarks (arrs, type) {
      const AMap = this.AMap
      const GDMap = this.$refs.gdMap.GDMap
      const overlayList = []
      const currentMarkers = []
      this.styleObjectArr = []
      if (arrs.length <= 0 || !arrs[0]) {
        return
      }
      arrs.map((item, index) => {
        if (item.lng && item.lat) {
          const result02 = gcoord.transform([item.lng, item.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.GCJ02 // 目标坐标系
          )
          const po = Object.assign(item, { lng02: result02[0], lat02: result02[1] })
          currentMarkers.push(this.addMarker(po, index))
          overlayList.push({ lng: po.lng02, lat: po.lat02 })

          const icon = (type === 1 ? 'selstatus' : 'status') + (item.status !== undefined ? item.status : '9')
          const ur = require(`../../assets/images/${icon}.png`)
          // 创建样式对象
          const styleObject = {
            url: ur,
            size: new this.AMap.Size(40, 40),
            anchor: new this.AMap.Pixel(20, 20)
          }
          this.styleObjectArr.push(styleObject)
        }
      })
      // 绘制
      const massMarker = new AMap.MassMarks(currentMarkers, {
        zIndex: 999,
        style: this.styleObjectArr
      })

      massMarker.on('click', (e) => {
        this.point_info = e.data.point
        this.pos = [e.data.lnglat[0], e.data.lnglat[1]]
        this.visible = true
      })

      massMarker.setMap(GDMap)
      const center = this.form.point.lng02 ? [this.form.point.lng02, this.form.point.lat02] : gcoord.transform(
        [this.form.point.lng, this.form.point.lat], // 经纬度坐标
        gcoord.WGS84, // 当前坐标系
        gcoord.GCJ02 // 目标坐标系
      )
      GDMap.setZoomAndCenter(18, center)
      this.markers = massMarker
      this.mapLoading = false
    },
    mapMovestart() {
      this.visible = false
    },
    async getNearPoint(lng_lat) {
      // 传过来的是GCJ02坐标系
      if (this.form.project_code) {
        this.form.point = {}
        this.point_info = {}
        const GDMap = this.$refs.gdMap.GDMap
        if (this.markers !== null) {
          GDMap.clearMap()
          this.visible = false
        }
        // 获取附件300米以内的点，生成icon在地图上
        this.mapLoading = true
        const result84 = gcoord.transform(
          [lng_lat[0], lng_lat[1]], // 经纬度坐标
          gcoord.GCJ02, // 当前坐标系
          gcoord.WGS84 // 目标坐标系
        )
        const params = {
          project_code: this.form.project_code,
          lng: result84[0] + '',
          lat: result84[1] + ''
        }
        const { data } = await this.$pub.post('/point/slt-map', params)
        this.near_points = data
        if (data.length > 0) {
          this.form.point.lng = data[0].lng + 0
          this.form.point.lat = data[0].lat + 0
          this.drawMarks(this.near_points, 2)
        } else {
          this.mapLoading = false
          this.$message.success('此处附近无点位')
          GDMap.setZoomAndCenter(18, lng_lat)
        }
      }
    },
    changeKJ() {
      this.isKJsearch = !this.isKJsearch
      const el = document.getElementById('toolBar_clover')
      el.style.width = this.isKJsearch ? '75px' : '0px'
      this.overlays = []
      if (this.mouseTool) {
        this.mouseTool.close(true)
      }
    },
    selectToolBar(id) {
      this.overlays = []
      if (this.mouseTool) {
        this.mouseTool.close(true)
      }
      if (this.selectTool === id) {
        this.selectTool = 0
        return
      }
      this.selectTool = id
      const GDMap = this.$refs.gdMap.GDMap
      this.mouseTool = new this.AMap.MouseTool(GDMap)
      if (id === 1) {
        this.drawCircle()
      } else if (id === 2) {
        this.drawPolygon()
      }
    },
    drawPolygon () {
      // const GDMap = this.$refs.gdMap.GDMap
      this.mouseTool.polygon({
        strokeColor: '#409eff',
        strokeWeight: 2,
        strokeOpacity: 0.4,
        fillColor: '#1791fc',
        fillOpacity: 0.1,
        strokeStyle: 'solid'
      })
      this.mouseTool.on('draw', (e) => {
        // e.obj 为绘制出来的覆盖物对象
        // e.obj.getPath() 矢量图形获取路径
        // console.log(e.obj.getRadius());//获取半径
        // console.log(e.obj.getCenter());//获取中心点
        // console.log('覆盖物对象绘制完成', e.obj.getPath)
        const points = e.obj.getPath()
        this.overlays.push(e.obj)
        const newArr = []
        for (let i = 0; i < points.length; i++) {
          newArr.push([points[i].lng, points[i].lat])
          // 创建纯文本标记
          // const text = new this.AMap.Text({
          //   text: newArr[i],
          //   anchor: 'top-left', // 设置文本标记锚点
          //   // draggable: true,
          //   cursor: 'pointer',
          //   clickable: true,
          //   style: {
          //     padding: '10px',
          //     'border-radius': '5px',
          //     'background-color': 'white',
          //     'border-width': 0,
          //     'text-align': 'center',
          //     'font-size': '12px',
          //     color: 'blue'
          //   },
          //   position: newArr[i]
          // })
          // text.setMap(GDMap)
        }
        console.log(newArr)
      })
    },
    drawCircle () {
      // const GDMap = this.$refs.gdMap.GDMap
      this.mouseTool.circle({
        strokeColor: '#409eff',
        strokeWeight: 2,
        strokeOpacity: 0.4,
        fillColor: '#1791fc',
        fillOpacity: 0.1,
        strokeStyle: 'solid'
        // draggable: true
      })
      this.mouseTool.on('draw', (e) => {
        // e.obj 为绘制出来的覆盖物对象
        // e.obj.getPath() 矢量图形获取路径
        // console.log(e.obj.getRadius());//获取半径
        // console.log(e.obj.getCenter());//获取中心点
        // console.log('覆盖物对象绘制完成', e.obj.getPath)
        const radius = e.obj.getRadius()
        const center = e.obj.getCenter()
        console.log(radius, [center.lng, center.lat])
        this.overlays.push(e.obj)
      })
    }
  }
}
</script>

<style lang="scss">
.point_search{
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  .tit{
    padding: 0px 20px;
    height:33px;
    line-height: 33px;
    background: #409eff;
    opacity: 0.7;
    color:#fff;
    cursor:pointer;
    border-right:0;
  }
  .toolwrap{
    .el-form-item__content{
      display:flex;
      align-items: center;
    }
  }
  .toolBar{
    width:0;
    transition: width 0.3s ease;
    overflow: hidden;
    background: #fff;
    border: 1px solid #a2cbf5;
    border-left:0;
    display:inline-block;
    line-height: 31px;
    height:31px;
    i{
      font-size:20px;
      cursor: pointer;
      line-height: 31px;
      margin-left:10px;
      &:hover{
        color: #409eff;
      }
    }
    .active{
      color: #409eff;
    }
  }
  .mapwrap{
    height:calc(100% - 50px);
    width:100%;
    position:relative;
    .diago_clover{
      position:absolute;
      top:0;
      padding:20px;
      min-height:70px;
      border-radius: 5px;
      box-shadow: 0 15px 15px rgba(0, 0,0,0.25);
      background-color: #719bff;
      z-index: 10;
      transform: translate(-50%,-50%);
      color: #fff;
      &:after{
        content: "◆";
        font-size: 36px;
        height: 26px;
        color: #719bff;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }
      .wrap{
         display:flex;
        span:first-child{
          min-width: 90px;
          display: block;
        }
      }
      .el-icon-close{
        position: absolute;
        right:4px;
        top:4px;
        cursor:pointer;
      }
    }
    .toolBar{
      background: #fff;
      position:absolute;
      top:0;
      right:0px;
      border-radius: 4px;
      font-size:20px;
      .active{
        color: #409eff;
      }

      li{
        cursor: pointer;
        &:hover{
          color: #409eff;
        }
      }

    }
  }
}
</style>
