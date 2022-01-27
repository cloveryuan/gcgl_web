<template>
  <div class="static_wrap">
    <div class="left-bar" v-loading="tableLoading">
      <div class="left-top">
        <el-form size="small" style="height:200px;" label-width="55px">
          <el-form-item label="项目" >
            <el-select style="width:250px" v-model="project" placeholder="请选择" @change="handleProjectChange" value-key="id">
              <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工序">
            <el-cascader
              v-model="procvalue"
              :key="cascaderKey"
              :options="procs"
              @change="handleProcChange"
              size="small"
              filterable
              style="width:250px"
              ref="gxSel"
            >
            </el-cascader>
          </el-form-item>
          <el-form-item label="子系统" >
            <el-select
              v-model="childValue"
              style="width:250px"
              clearable
              placeholder="请选择子系统"
              multiple
              collapse-tags
              @change="handleChildChange"
            >
              <el-option
                v-for="item in childList"
                :key="item.key"
                :label="item.value"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <el-select
              v-model="areavalue"
              placeholder="区域选择"
              style="width:250px"
              multiple
              collapse-tags
              @change="handleAreaChange"
              :loading="loading"
            >
              <el-option
                v-for="item in areaList"
                :key="item.key"
                :label="item.value"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="拍照">
            <el-radio-group v-model="hasphoto" @change="handlehasPhotoChange">
              <el-radio label="3">全部</el-radio>
              <el-radio label="1">已拍照</el-radio>
              <el-radio label="2">未拍照</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-table
          class="tableWrap"
          :show-header="false"
          :height="tableHeight"
          :data="pointTableData"
          :row-style="{ height: '30px' }"
          :cell-style="{ padding: '4px 0' }"
          @row-click="onPointClick"
          v-loading="tableLoading"
          :row-class-name="tableRowClassName"
          ref="multipleTable"
        >
          <el-table-column  show-overflow-tooltip >
            <template slot-scope="scope">
              <h5>{{ scope.row.pointName }}</h5>
              <span style="color:#BEBFBF;">点位编码：{{ scope.row.pointCode }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="total>0"
          layout="prev, pager, next"
          :total="total"
          :page-size.sync="page.page_size"
          @current-change="pageChange"
          :current-page.sync="page.page_no"
          class="pagination"
          small
        >
        </el-pagination>
      </div>
    </div>
    <div id="GDMap" v-loading="loading" class="amap-wrapper">
      <info-window
        v-if="visible"
        :pos="position"
        :info="info"
        @close="visible = false"
      >
      </info-window>
    </div>
    <el-drawer
      v-if="point !== null"
      :title="point.pointName"
      :visible.sync="drawer"
      :direction="direction"
      size="40%"
    >
      <div class="drawer-image">
        <div class="proc-lnglat">
          经纬度坐标 (WGS84):
          <br />
          {{ point.lng84 }},{{ point.lat84 }}
        </div>
        <div class="proc-class">
          <i class="el-icon-camera" style="margin-bottom:10px;"></i>
          工序拍照清单:
        </div>
        <div v-for="procmain in procLists" :key="procmain.classCode">
          <h3>{{procmain.className}}</h3>
          <div class="proc-item" v-for="(procitem,i) in procmain.procList" :key="procitem.procCode + i">
            <span class="subtitle">
              <i class="el-icon-camera"></i>
              {{ procitem.procName }}
            </span>
            <div v-for="(pointDirect,i) in procitem.pointList" :key="pointDirect.direction?pointDirect.direction + i + 'point' : i+'point'">
              <template v-if="pointDirect.direction">
                <span>方向：</span>
                <span>{{pointDirect.direction}}</span>
              </template>
              <div class="container" v-viewer="options">
                <div class="block" v-for="imageitem in pointDirect.attachmentList" :key="imageitem.id">
                  <el-tooltip effect="dark" :content="imageitem.remark" placement="top-start" v-if="imageitem.remark">
                    <!--  有备注信息的  照片or全场景照片  -->
                    <img
                      :src="imageitem.filePathThumb"
                      :data-source="imageitem.filePath"
                      style="width: 100px; height:  100px"
                      :key="imageitem.filePath"
                      v-if="imageitem.is360===0"
                    />
                    <img
                      :src="imageitem.filePathThumb"
                      style="width: 100px; height: 100px"
                      :key="imageitem.filePath"
                      v-if="imageitem.is360===1"
                      @click="initPhotoSphere(procitem.procName,imageitem.filePath)"
                    />
                  </el-tooltip>
                  <!-- 无备注信息的 照片or全场景照片-->
                  <template v-else>
                    <img
                      :src="imageitem.filePathThumb"
                      :data-source="imageitem.filePath"
                      style="width: 100px; height: 100px"
                      :key="imageitem.filePath"
                      v-if="imageitem.is360===0"
                    />
                    <img
                      :src="imageitem.filePathThumb"
                      style="width: 100px; height: 100px"
                      :key="imageitem.filePath"
                      v-if="imageitem.is360===1"
                      @click="initPhotoSphere(procitem.procName,imageitem.filePath)"
                    />
                  </template>
                  <div class="submit-info"
                    :style="{color: imageitem.audit===0? '#888' : (imageitem.audit===2 ||imageitem.audit===4) ? 'red':(imageitem.audit===1 || imageitem.audit===3) ?'green':'' }">
                  {{selectDictLabel(statusOptions, imageitem.audit)}}
                  </div>
                    <div class="submit-info">拍摄者: {{ imageitem.submit }}</div>
                    <div class="submit-action" >
                      <el-popconfirm
                        v-show="imageitem.audit!==3 &&(imageitem.user_id === currentUserId || checkPermission(['points:proPhotoDel']))"
                        title="请确认是否删除该图片？"
                        icon="el-icon-info"
                        @confirm="handleDeleteImage(imageitem)"
                      >
                        <el-link
                          type="danger"
                          icon="el-icon-delete"
                          slot="reference"
                          >删除</el-link
                        >
                      </el-popconfirm>
                    </div>
                </div>
              </div>
              <!-- 拓展信息 -->
              <template v-if="pointDirect.extand&&pointDirect.extand.length > 0">
                <span class="remarktitle" >
                  <i class="el-icon-s-operation"></i>
                  拓展信息
                </span>
                <ul style="margin-left:10px;margin-bottom:10px;">
                  <li v-for="(item,l) in pointDirect.extand" :key="item.code + l">
                    <span>{{item.name}}:</span>
                    <span>{{item.value}}</span>
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>

      </div>
    </el-drawer>

      <!-- 全景照片 -->
    <el-dialog
      :title="photoSphereName"
      :visible.sync="photoSphereVisible"
      :footer="false"
      :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
import { calculateCenter } from '../../public/util/util'
import InfoWindow from './InfoWindow'
import coord from 'coordtransform'
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import { checkPermission } from '@/utils/tool'

export default {
  name: 'static',
  components: {
    InfoWindow
  },
  data() {
    return {
      styleObjectArr: [],
      drawer: false,
      direction: 'rtl',
      cascaderKey: 1, // 防止key问题报错
      markers: null,
      projectList: [],
      project_id: '',
      projectvalue: [],
      project: null,
      pointname: '',
      currentUserId: '',
      procs: [],
      procvalue: [],
      proccode: '',
      childValue: '',
      childList: [],
      areaList: [],
      areavalue: '',
      hasphoto: '3',
      points: [],
      point: null,
      thumbList: [],
      pathList: [],
      remarkList: [],
      // 地图实例
      GDMap: null,
      AMap: null,
      plugins: [
        'AMap.ToolBar',
        'AMap.MapType',
        'AMap.MouseTool',
        'AMap.PlaceSearch',
        'AMap.DistrictLayer',
        'AMap.CustomLayer',
        'AMap.Scale'
      ],
      key: '2438a10510400a807d823902ea003742',
      v: '1.4.15',
      loading: true,
      pos: [118.783889, 32.041838],
      position: {},
      visible: false,
      info: {},
      statusOptions: [
        { dict_label: '未审核', dict_value: 0 },
        { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '未通过', dict_value: 4 }
      ],
      procLists: [],
      ispointCode: '',
      options: {
        toolbar: true,
        url: 'data-source'
      },
      publicPath: process.env.BASE_URL,
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      tableHeight: 400,
      pointTableData: [],
      tableLoading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      }
    }
  },
  computed: {
    opened() {
      return this.procLists.map((i) => {
        return i.direction
      })
    }
  },
  methods: {
    checkPermission,
    inimap() {
      loadMap(this.plugins).then(res => {
        const { AMap } = res
        this.AMap = AMap
        this.GDMap = new AMap.Map('GDMap', {
          zoom: 16,
          // center: [118.783889, 32.041838],
          features: ['bg', 'road', 'building'],
          isHotspot: false,
          showBuildingBlock: true
          // viewMode:"3D",
          // pitch:45,
          // rotation:45,
        })
        this.GDMap.on('complete', () => {
          this.loading = false
        })
        this.GDMap.addControl(new AMap.ToolBar())
        this.GDMap.addControl(new AMap.Scale())
        this.GDMap.addControl(new AMap.MapType())

        this.initStyleObject()
        // this.GDMap.addControl(new AMap.Scale());
        this.GDMap.on('zoomchange', () => {
          if (this.GDMap.getZoom() < 10) {
            this.visible = false
          }
        })
      })
        .catch((err) => {
          this.loading = false
          console.log(err || '地图加载失败')
        })
    },
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (Number(result.code) === 200) {
          if (result.data !== null) {
            this.projectList = result.data
          } else {
            this.projectList = []
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.submitLoading = false
    },
    async handleSearchChild() {
      if (!this.projectvalue) {
        this.$notify.error({
          title: '提醒',
          message: '项目未选择,请先选择项目'
        })
        return
      }
      this.tableLoading = true
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.project_id })
        if (code === 200) {
          this.childList = data || []
        } else {
          this.childList = []
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.tableLoading = false
    },
    async handleSearchArea() {
      if (!this.projectvalue) {
        this.$notify.error({
          title: '提醒',
          message: '项目未选择,请先选择项目'
        })
        return
      }
      this.tableLoading = true
      try {
        const { data, code, message } = await this.$pub.post('/project/area-list', { project_id: this.project_id })
        if (code === 200) {
          (data || []).unshift({
            key: 'all',
            value: '全部区域(' + data.length + ')'
          })
          this.areaList = data
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
          this.areaList = []
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.tableLoading = false
    },
    async handleSearchProc() {
      if (!this.projectvalue) {
        this.$notify.error({
          title: '提醒',
          message: '项目未选择,请先选择项目'
        })
        return
      }
      this.tableLoading = true
      try {
        const params = {
          project_code: this.projectvalue,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        if (code === 200) {
          const tmparr = [];
          (data || []).map(item => {
            let childs = []
            childs = this.getChildList(item)
            const tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '出错了',
          message: e.message
        })
      }
      this.tableLoading = false
    },
    getChildList(value) {
      const childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map(citem => {
          childs.push({
            value: citem.procCode,
            label: citem.procName,
            isDesgin: citem.isDesgin,
            isCore: citem.isCore,
            id: citem.id,
            is360: citem.is360,
            isIP: citem.isIP
          })
        })
      }
      return childs
    },
    async handleSearchPoint() {
      this.total = 0
      if (
        // this.childValue === '' ||
        this.proccode === ''
        // || this.areavalue === ''
      ) {
        return
      }
      // 解析区域字段
      // var area = this.areavalue.split('#')

      this.loading = true
      try {
        const req = {
          procCode: this.proccode,
          projectCode: this.projectvalue,
          type: Number(this.hasphoto),
          childCode: this.childValue === '' ? [] : this.childValue,
          userId: this.$store.state.userInfo.id
        }

        const params = this.areavalue.includes('all') ? {
          ...req
        } : {
          ...req,
          area: this.areavalue === '' ? [] : this.areavalue
          // keywords: area[1]
        }
        const { data, code } = await this.$pub.post('point/map/list', params)
        if (code === 200) {
          var overlayList = []
          if (data !== null) {
            var currentMarkers = []
            var currentPoints = [];
            (data.list || []).map((item, index) => {
              if (
                !(
                  typeof item.lng === 'undefined' ||
                  typeof item.lat === 'undefined' ||
                  item.lng.trim() === '' ||
                  item.lat.trim() === ''
                )
              ) {
                var gpspoint = coord.wgs84togcj02(
                  parseFloat(item.lng),
                  parseFloat(item.lat)
                )

                item.lng84 = item.lng
                item.lat84 = item.lat
                // var curitem = item;
                item.lng = gpspoint[0]
                item.lat = gpspoint[1]

                currentMarkers.push(this.addCustomPoint(item, index))
                currentPoints.push(item)
                overlayList.push({ lng: item.lng, lat: item.lat })
              }
            })
            // 绘制
            if (this.markers !== null) {
              this.markers.clear()
            }
            var massMarker = new this.AMap.MassMarks(currentMarkers, {
              zIndex: 5,
              zooms: [3, 19],
              style: this.styleObjectArr
            })
            massMarker.on('click', (e) => {
              // console.log(e)
              this.info = e.data.point
              this.pos = [e.data.lnglat.lng, e.data.lnglat.lat]
              // todo 这里需要做请求，获取当前点的照片
              this.visible = true
              this.GDMap.panTo(this.pos)
            })
            massMarker.setMap(this.GDMap)
            // 海量点绘制不是覆盖物，而是图层，中心点需要计算出来
            var centerpoint = null
            if (overlayList.length > 2) {
              debugger
              centerpoint = calculateCenter(overlayList)
              this.GDMap.setZoomAndCenter(9, centerpoint)
            } else if (overlayList.length === 1) {
              centerpoint = new this.AMap.LngLat(
                overlayList[0].lng,
                overlayList[0].lat
              )
            } else {
              this.$notify.info({
                title: '提示',
                message: '没有发现任何点位'
              })
            }
            this.markers = massMarker
            this.points = currentPoints
            this.total = this.points.length
            this.pageChange(1)
          } else {
            this.$notify.error({
              title: '暂无数据',
              message: '暂无数据'
            })
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: '查询失败'
          })
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.loading = false
    },
    async handleSearchImageList(pointCode) {
      this.ispointCode = pointCode
      if (
        // this.childValue === '' || this.areavalue === '' ||
        this.proccode === ''

      ) {
        return
      }
      this.loading = true
      const params = {
        point_code: pointCode,
        project_code: this.projectvalue
      }
      const result = await this.$pub.post('/point/proc_submit_web_list', params)
      if (Number(result.code) === 200) {
        if (result.data && result.data.length > 0) {
          this.procLists = result.data
        } else {
          this.procLists = []
        }
      } else {
        this.$notify.error({
          title: '查询失败',
          message: result.message
        })
      }
      try {
      } catch (e) {
        console.log(e)
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.loading = false
    },
    handleProjectChange(value) {
      if (value !== null) {
        this.project_id = value.id
        this.projectvalue = value.projectCode

        this.childValue = ''
        this.childList = []
        this.procvalue = []
        this.proccode = ''
        this.areaList = []
        this.areavalue = ''
        if (this.markers !== null) {
          this.markers.clear()
        }
        this.visible = false
        this.drawer = false
        this.points = []
        this.pointTableData = []
        ++this.cascaderKey
        this.handleSearchChild()
        this.handleSearchProc()
        this.handleSearchArea()
      }
    },
    handleProcChange(value) {
      if (value !== null) {
        this.proccode = value[value.length - 1]
        this.handleSearchPoint()
        this.thumbList = []
        this.pathList = []
        this.remarkList = []
        this.visible = false
        this.drawer = false
        this.points = []
      }
    },
    handleChildChange() {
      this.handleSearchPoint()
      this.thumbList = []
      this.pathList = []
      this.remarkList = []
      this.visible = false
      this.drawer = false
      this.points = []
    },
    handleAreaChange(value) {
      if (value !== null) {
        const len = value.length
        if (value[0] === 'all' && len > 1) {
          this.areavalue = value.slice(1)
        } else if (value[len - 1] === 'all' && len > 1) {
          this.areavalue = ['all']
        } else {
          this.areavalue = value
        }

        this.handleSearchPoint()
        this.thumbList = []
        this.pathList = []
        this.remarkList = []
        this.visible = false
        this.drawer = false
        this.points = []
      }
    },
    handlehasPhotoChange(value) {
      if (value !== null) {
        this.visible = false
        this.handleSearchPoint()
        this.thumbList = []
        this.pathList = []
        this.remarkList = []
      }
    },
    handleShowImageList(point) {
      this.point = point
      this.handleSearchImageList(point.pointCode)
      this.drawer = true
    },
    onPointClick(point) {
      this.info = point
      this.pos = [point.lng, point.lat]
      // todo 这里需要做请求，获取当前点的照片
      this.visible = true
      this.GDMap.panTo(this.pos)
    },
    addCustomPoint(point, index) {
      var curPos = new this.AMap.LngLat(point.lng, point.lat)
      var data = {
        lnglat: curPos,
        name: point.pointName,
        point: point,
        id: index,
        style: point.areaId - 1
      }
      return data
    },
    handleZoomToPoint() {
      this.GDMap.setZoomAndCenter(18, this.pos)
    },
    mapmove() {
      this.position = this.GDMap.lngLatToContainer(this.pos)
    },
    initStyleObject() {
      for (var i = 1; i < 21; i++) {
        var styleObject = {
          url: this.publicPath + 'images/point/point' + i + '.png',
          // url: require(`../../assets/images/point/point${i}.png`),
          size: new this.AMap.Size(20, 25),
          anchor: new this.AMap.Pixel(10, 10)
        }
        this.styleObjectArr.push(styleObject)
      }
    },
    selectDictLabel (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    async handleDeleteImage(img) {
      try {
        const id = img.id
        const req = { attr_id: id, user_id: this.$store.state.userInfo.id }
        const url = (img.audit === 0 && img.userId === this.currentUserId) ? '/attach/photo_remove' : '/attach/delete_attr'
        const result = await this.$pub.post(url, req)
        if (result.code === 200) {
          this.handleSearchImageList(this.ispointCode)
          this.handleSearchProc()
          this.handleSearchPoint()
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
          // return;
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.submitloading = false
    },
    initPhotoSphere(name, img) {
      this.photoSphereName = name
      this.photoSphereVisible = true
      if (this.viewer) {
        this.viewer.destroy()
      }
      this.$nextTick(() => {
        this.viewer = new Viewer({
          container: document.querySelector('#viewer'),
          panorama: img,
          size: {
            width: '100%',
            height: '500px'
          }
        })
      })
    },
    pageChange(num) {
      this.page.page_no = num
      this.pointTableData = this.points.slice((num - 1) * this.page.page_size, num * this.page.page_size)
    },
    tableRowClassName ({ row }) {
      return this.info && row.pointCode === this.info.pointCode ? 'current-row' : ''
    }
  },
  created() {
    this.init()
    this.inimap()
  },
  mounted() {
    // var prj = this.$store.state.project
    // if (prj !== null) {
    //   this.projectvalue = [prj.projectCode, prj.childCode]
    // }
    this.currentUserId = this.$store.state.userInfo.id + ''
  },
  watch: {
    pos(newPos) {
      this.position = this.GDMap.lngLatToContainer(newPos)
    },
    visible(newVisible) {
      if (this.GDMap) {
        if (newVisible) {
          // 绑定地图平移事件
          this.GDMap.on('mapmove', this.mapmove)
        } else {
          // 移除事件绑定
          this.GDMap.off('mapmove', this.mapmove)
        }
      }
    }
  }
}
</script>

<style scoped>
.title {
  font-size: 18px;
  color: #303133;
}
.left-bar {
  width: 300px;
  margin-right:10px;
}
.left-top {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}
.static_wrap{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding:20px;
  height: 100%;
  box-sizing: border-box;
}
.container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  height: 100%;
  box-sizing: border-box;
}
.point-item {
  padding: 5px 0px;
}
.point-code {
  font-size: 14px;
  color: #bbb;
}
.drawer-image {
  padding: 0px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow:auto;
  height:calc(100% - 30px);
}
.image-distance {
  position: absolute;
  top: 0;
  left: 0;
  width: 90px;
  height: 90px;
  line-height: 90px;
  text-align: center;
  font-size: 13px;
  color: #f2f2f2;
}
.amap-wrapper {
  width: 100%;
}
.amap-marker-label {
  vertical-align: middle;
  color: #555;
  background-color: #fffeef;
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid #8e8e8e;
  width: auto;
  border-radius: 5px 5px 5px 0;
}
.map-icon {
  display: flext;
  justify-content: center;
  align-items: center;
  margin: 15px 20px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  color: #fff;
  background-color: red;
}
.remarktitle {
  font-family: "Microsoft YaHei", "微软雅黑";
  display: block;
  font-size: 14px;
  color: red;
  margin-left: 5px;
}

.container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.containerwrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.submit-info {
  /* text-align: left; */
  font-size: 12px;
  color: #aaa;
}
.submit-action {
  height: 25px;
  line-height: 25px;
  vertical-align: center;
}
.block {
  padding: 10px 5px;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
}
.remark-info {
  text-align: left;
}
.container-drawer {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
}

::-webkit-scrollbar {
  width: 12px;
  background-color: #e5e9ec;
}
::-webkit-scrollbar-thumb {
  /* border-radius: 10px; */
  /* background-color: #789ff8; */
}
.submit-info {
  /* text-align: left; */
  font-size: 8px;
  color: #aaa;
}
.submit-action {
  height: 25px;
  line-height: 25px;
  vertical-align: center;
}
.remark-info {
  text-align: left;
}
.remark-submit {
  color: #888;
  font-size: 12px;
}
.remarktitle {
  font-family: "Microsoft YaHei", "微软雅黑";
  display: block;
  font-size: 14px;
  color: red;
  margin-top: 15px;
}
.proc-class {
  display: block;
  font-size: 15px;
  color: #409eff;
  margin-left: 5px;
  /* margin-top:5px; */
}
.proc-lnglat {
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
<style lang="scss">
:focus {
  outline: 0;
}
.el-drawer__header {
  margin-bottom: 20px;
}
.left-top{
  .tableWrap .el-table__body tr.current-row>td{
    background:rgb(68, 120, 241);
    color:#fff;
  }
  .tableWrap td{
    cursor: pointer;
  }
  .el-pagination--small .btn-next, .el-pagination--small .btn-prev, .el-pagination--small .el-pager li, .el-pagination--small .el-pager li.btn-quicknext, .el-pagination--small .el-pager li.btn-quickprev, .el-pagination--small .el-pager li:last-child {
        border-color: transparent;
        font-size: 12px;
        line-height: 22px;
        height: 22px;
        min-width: 20px !important;
    }
    .el-pagination {
      white-space: nowrap;
      padding: 2px 0px !important;
      color: #303133;
      font-weight: 700;
    }
}
.clover-main{
  .el-drawer__body{
    height:calc(100% - 45px);
  }
}
</style>
