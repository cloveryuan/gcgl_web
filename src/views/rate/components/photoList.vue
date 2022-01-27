<template>
  <el-drawer
    size="90%"
    :visible.sync="photoDrawer"
    :with-header="false"
    custom-class="demo-drawer"
    :close-on-press-escape="false"
    :wrapperClosable="false"
    >
    <div class="d-flex-between">
      <h3 style="font-weight:500" v-if="currentProc">
        <p style="margin-bottom:10px;">
          {{currentDeptInfo.dept_name}}
        </p>
        <i class="el-icon-camera"></i>
        {{currentProc.className}}--{{currentProc.procName}}
      </h3>
      <i class="el-icon-close" @click="cancle"></i>
    </div>
    <split-pane  :min-percent='25' :default-percent='25' split="vertical" v-loading="loading">
      <div slot="paneL" class="clover_left">
        <el-table class="tab_wrap" :max-height="tableHeight" :data="procList" @row-click="getPhotoList" :row-class-name="tableRowClassName">>
          <el-table-column label="点位编码"  width="110" align="left" prop="pointCode" :show-overflow-tooltip="true" />
          <el-table-column label="点位名称" align="left" prop="pointName" :show-overflow-tooltip="true" />
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="page.total"
          :page-size.sync="page.pageSize"
          :current-page.sync="page.pageNo"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          class="split_pagination"
          :pager-count="5"
          small
        >
        </el-pagination>
      </div>
      <div slot="paneR" class="clover_right">
        <div class="_top">
          <span class="tit">点位编码：<span>{{activePointCode}}</span></span>
          <span class="tit">点位名称：<span>{{activePointName}}</span></span>
          <el-button type="primary" size="mini" style="float:right;" @click="showInfo">{{isshowInfo?'关闭详情':'详情'}}</el-button>
        </div>

        <div class="photo">
           <!-- 照片 -->
          <div class="clover_wrap" :style="{width: isshowInfo?'50%':'100%'}"  v-viewer="options" v-if="photoList.length>0">
            <div class="box" v-for="img in photoList" :key="img.image_id" >
              <img
                @click="initPhotoSphere('全景照片',img.file_path)"
                :src="img.file_path_thumb"
                style="width: 120px;height:100px;cursor:pointer;"
                :key="img.file_path"
                v-if="Number(img.is_360)===1"
              />
              <img
                v-else
                :src="img.file_path_thumb"
                :data-source="img.file_path"
                :key="img.file_path_thumb"
                style="width: 120px;height:100px;cursor:pointer;"

              />
              <div
                class="text"
                :style="{color: img.audit===0? '#888' : (img.audit===2 ||img.audit===4) ? 'red':(img.audit===1 || img.audit===3) ?'green':'' }"
              >{{selectDictLabel(statusOptions, img.audit)}}</div>
              <div class="text">拍摄者: {{ img.submit }}</div>
            </div>
          </div>
          <div  v-if="photoList.length<=0&&!isshowInfo" class="noimg">
            <el-image
              :src="require(`@/assets/images/null.png`)"
              style="height: 50px; width: 80px"
            ></el-image>
            <p style="color: grey">暂无照片</p>
          </div>
          <!-- 详情 -->
          <div class="info_wrap" v-if="isshowInfo">
            <info :deviceList="deviceList" :procLists="procLists" :statusOptions="statusOptions"></info>
          </div>
        </div>
      </div>
    </split-pane>

    <!-- 全景照片 -->
    <el-dialog
      :title="photoSphereName"
      :visible.sync="photoSphereVisible"
      :footer="false"
      :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>
    <!-- <el-drawer
      v-if="photoSphereVisible"
       :title="photoSphereName"
      :visible.sync="photoSphereVisible"
      :append-to-body="true"
      size="90%"
      :destroy-on-close ="true"
      custom-class="photo_wrap"
    >
        <photo :bigImg="bigImg" v-if="photoSphereVisible"></photo>
    </el-drawer> -->
  </el-drawer>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import info from './info.vue'
// import photo from '@/views/3D/index'
export default {
  name: 'photo_proc',
  props: {
    currentProc: {
      required: true
    },
    currentDeptInfo: {
      required: true
    },
    photoDrawer: {
      type: Boolean,
      required: false
    },
    projectvalue: {
      required: true
    },
    areavalue: {
      required: true
    },
    childvalue: {
      required: true
    },
    builder_dept_id: {
      required: true
    },
    date_selector: {
      required: true
    },
    tagvalue: {
      required: true
    }
  },
  components: { info },
  data () {
    return {
      loading: false,
      procList: [],
      photoList: [],
      page: {
        total: 0,
        pageSize: 10,
        pageNo: 1
      },
      activePointCode: '',
      activePointName: '',
      options: {
        toolbar: true,
        url: 'data-source'
      },
      tableHeight: window.innerHeight - 150,
      statusOptions: [
        { dict_label: '未审核', dict_value: 0 },
        { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '未通过', dict_value: 4 }
      ],
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      bigImg: '',
      // 详情
      isshowInfo: false,
      deviceList: [],
      procLists: []
    }
  },
  mounted() {
    this.getProcList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 150
    }
  },
  methods: {
    cancle () {
      this.$emit('update:photoDrawer', false)
    },
    async getProcList() {
      this.loading = true
      var req = {
        project_code: this.projectvalue,
        proc_code: this.currentProc.procCode,
        page_no: this.page.pageNo,
        page_size: this.page.pageSize,
        begin_date: this.date_selector.start,
        end_date: this.date_selector.end,
        area: this.areavalue.join(',').trim(),
        tag: this.tagvalue.join(',').trim(),
        builder_dept_id: this.builder_dept_id ? this.builder_dept_id + '' : this.currentDeptInfo.dept_id,
        child_code: this.childvalue.join(',').trim()
      }
      const result = await this.$pub.post('/rate/proc-rate-point-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.procList = result.data.list ? result.data.list : []
        }
      } else {
        this.$notify.error({
          title: '列表查询失败',
          message: result.message
        })
      }
      this.loading = false
      this.page.total = result.data.total
      if (this.procList[0]) {
        this.getPhotoList(this.procList[0])
      }
    },
    async getPhotoList(row) {
      this.loading = true
      this.isshowInfo = false
      this.activePointCode = row.pointCode
      this.activePointName = row.pointName
      this.photoList = []

      var req = {
        project_code: this.projectvalue,
        point_code: row.pointCode,
        proc_code: this.currentProc.procCode,
        begin_date: this.date_selector.start,
        end_date: this.date_selector.end
      }
      const result = await this.$pub.post('/rate/point-photo-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.photoList = result.data
        }
      } else {
        this.$notify.error({
          title: '照片列表查询失败',
          message: result.message
        })
      }
      this.loading = false
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.getProcList()
    },
    handleCurrentChange(val) {
      this.page.pageNo = val
      this.getProcList()
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.pointCode === this.activePointCode) {
        return 'cloverActive'
      }
      return ''
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
    showInfo() {
      this.isshowInfo = !this.isshowInfo
      if (this.isshowInfo) {
        this.getImageList()
        this.getDeviceList()
      }
    },
    // 获取详情里面的物料规格
    async getDeviceList(row) {
      this.deviceList = []
      const params = {
        project_code: this.projectvalue,
        point_code: this.activePointCode
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info', params)
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        this.deviceList = data.device_list || []
      }
    },
    // 获取详情里面的工序步骤及其详情
    async getImageList() {
      this.loading = true
      const params = {
        point_code: this.activePointCode,
        project_code: this.projectvalue
      }
      const result = await this.$pub.post('/point/proc_submit_web_list', params)
      if (result.code === 200) {
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
    initPhotoSphere(name, img) {
      // img = 'https://gw.alicdn.com/tfs/TB1WSInRFXXXXXlXpXXXXXXXXXX-1200-600.jpg'
      this.photoSphereName = name
      this.photoSphereVisible = true
      // img = img === 'http://192.168.1.252:88/webimg/(2020)JSHW062/20211108/(2020)JSHW062_20211108163850_vbjDiu53.jpg'
      //   ? require('../../../assets/images/test4.jpg')
      //   : require('../../../assets/images/test5.jpg')
      // this.bigImg = img

      if (this.viewer) {
        this.viewer.destroy()
      }
      this.$nextTick(() => {
        this.viewer = new Viewer({
          container: document.querySelector('#viewer'),
          panorama: img,
          // panorama: require('../../../assets/images/test1.jpg'), // 5.83m
          // panorama: require('../../../assets/images/test2.jpeg'), // 3.05m
          size: {
            width: '100%',
            // height: '500px'
            height: '60vh'
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.d-flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 20px 10px;
}
.d-flex-between .el-icon-close{
  font-size:16px;
  cursor:pointer;
}
.clover_left{
  padding:20px 20px 80px;
  height:100%;
  box-sizing: border-box;
}
.clover_left .tab_wrap{
  td{
    cursor: pointer;
  }
}
.split_pagination{
  text-align:right;
  margin-right:-20px;
  margin-top:10px;
}
.cloverActive{
  color: #409EFF;
}
.clover_wrap .box{
  padding: 10px 5px;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
}
// .box img{
//   border: 1px solid #ccc;
// }
.clover_wrap .text{
  color: #888;
  font-size: 14px;
}
.demo-drawer .splitter-pane-resizer.vertical{
  width:12px!important;
}
.demo-drawer  .vue-splitter-container{
  height:calc(100% - 100px)!important;
}
.clover_right{
  padding:10px 20px 0px;
  height:100%;
  box-sizing: border-box;
  ._top{
    border-bottom:1px solid #EBEEF5;
    padding-bottom:9px;
    .tit{
      margin-right:10px;
      font-size:14px;
      color:rgb(99, 96, 96);
    }
  }
  .photo{
    width:100%;
    height:calc(100% - 30px);
    overflow: hidden;
    display:flex;
    justify-content: center;
    .noimg{
      width:100%;
      text-align:center;
      margin-top:100px;
    }
    .clover_wrap{
      width:100%;
      height:100%;
      overflow: auto;
    }
    .info_wrap{
      width:50%;
      height:100%;
      overflow: auto;
      border-left:1px solid #EBEEF5;
      box-sizing:border-box;
      padding:10px;
    }
  }
}
</style>
