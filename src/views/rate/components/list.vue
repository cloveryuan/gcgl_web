<template>
  <el-drawer
    size="90%"
    :visible.sync="listDrawer"
    :with-header="false"
    custom-class="peo_dev"
    :close-on-press-escape="false"
    :wrapperClosable="false"
    >
    <div class="d-flex-between">
      <h3 style="font-weight:500" v-if="currentProc">
        <p style="margin-bottom:10px;">
          {{currentUserInfo.name}} -- {{currentUserInfo.type}}
        </p>
        <i class="el-icon-camera"></i>
        {{currentProc.class_name}}--{{currentProc.proc_name}}
      </h3>
      <i class="el-icon-close" @click="cancle"></i>
    </div>
    <split-pane  :min-percent='30' :default-percent='40' split="vertical" v-loading="loading">
      <div slot="paneL" class="clover_left">
        <el-table class="tab_wrap" :max-height="tableHeight" :data="procList" @row-click="getPhotoList" :row-class-name="tableRowClassName">>
          <el-table-column label="点位编码"  min-width="80" align="left" prop="point_code" :show-overflow-tooltip="true" />
          <el-table-column label="点位名称" min-width="120" align="left" prop="point_name" :show-overflow-tooltip="true" />
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
          <el-button type="primary" size="mini" style="float:right;"  @click="showInfo">{{isshowInfo?'关闭详情':'详情'}}</el-button>
        </div>
        <!-- 照片 -->
        <div class="photo">
          <div class="clover_wrap" :style="{width: isshowInfo?'50%':'100%'}" v-viewer="options" v-if="photoList.length>0">
            <div class="box" v-for="img in photoList" :key="img.image_id" >
              <img
                @click="initPhotoSphere('全景照片',img.file_path)"
                :src="img.file_path_thumb"
                style="width: 120px;height: 120px;"
                :key="img.file_path"
                v-if="Number(img.is_360)===1"
              />
              <img
                :src="img.file_path_thumb"
                :data-source="img.file_path"
                :key="img.file_path_thumb"
                style="width: 120px;height: 120px;"
                v-else
              />
              <template v-if="currentUserInfo.isPhoto===1">
                <div class="text" :style="{color: img.status==='1'? 'green' : img.status==='0'  ? 'red': 'green' }">{{img.status_name}}</div>
                <div class="text">拍摄者: {{ img.create_user }}</div>
              </template>
              <div class="text">{{ img.create_time }}</div>
            </div>
          </div>
          <div v-if="photoList.length<=0&&!isshowInfo" class="noimg">
            <el-image
              :src="require(`@/assets/images/null.png`)"
              style="height: 50px; width: 80px"
            ></el-image>
            <p style="color: grey">暂无照片</p>
          </div>
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
  </el-drawer>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import info from './info.vue'
export default {
  name: 'sslist_proc',
  props: {
    currentProc: {
      required: true
    },
    currentUserInfo: {
      required: true
    },
    listDrawer: {
      type: Boolean,
      required: false
    },
    projectvalue: {
      required: true
    },
    date_selector: {
      required: true
    },
    tagvalue: {
      required: true
    }
  },
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
      tableHeight: window.innerHeight - 160,
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
      // 详情
      isshowInfo: false,
      deviceList: [],
      procLists: []

    }
  },
  components: { info },
  mounted() {
    this.getProcList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 160
    }
  },
  methods: {
    cancle () {
      this.$emit('update:listDrawer', false)
    },
    async getProcList() {
      this.loading = true
      const req = {
        project_code: this.projectvalue,
        proc_code: this.currentProc.proc_code,
        page_no: this.page.pageNo,
        page_size: this.page.pageSize,
        begin_date: this.date_selector[0],
        end_date: this.date_selector[1],
        tag: this.tagvalue.join(',').trim(),
        user_id: this.currentUserInfo.id + '',
        flag: this.currentUserInfo.isPhoto// 0是拍照数量，1为审核数量
      }
      const result = await this.$pub.post('/rate/submit-audit-point-list', req)
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
      this.activePointCode = row.point_code
      this.activePointName = row.point_name
      this.photoList = []

      const req = {
        project_code: this.projectvalue,
        point_code: row.point_code,
        proc_code: this.currentProc.proc_code,
        begin_date: this.date_selector[0],
        end_date: this.date_selector[1],
        user_id: this.currentUserInfo.id + '',
        flag: this.currentUserInfo.isPhoto // 0是拍照数量，1为审核数量
      }
      const result = await this.$pub.post('/rate/submit-audit-photo-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          // const env = process.env.NODE_ENV === 'production' ? '/doc' : ''
          // const baseurl = process.env.VUE_APP_BASE_URL + env
          this.photoList = result.data
          // .map(m => {
          //   return {
          //     ...m,
          //     file_path: baseurl + m.file_path + m.file_name,
          //     file_path_thumb: baseurl + '/' + m.file_path_thumb
          //   }
          // })
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
      if (row.point_code === this.activePointCode) {
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
      // img = img.replace('http://192.168.1.252:88/', '') + '?' + new Date().getTime()
      img = img + '?' + new Date().getTime()
      this.photoSphereName = name
      this.photoSphereVisible = true
      if (this.viewer) {
        this.viewer.destroy()
      }
      // img = 'https://gw.alicdn.com/tfs/TB1WSInRFXXXXXlXpXXXXXXXXXX-1200-600.jpg'
      this.$nextTick(() => {
        this.viewer = new Viewer({
          container: document.querySelector('#viewer'),
          panorama: img,
          size: {
            width: '100%',
            height: '600px'
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.peo_dev{
  .el-drawer{
    // display:block;
  }
  .vue-splitter-container{
    height:calc(100% - 100px)!important;
    // margin-top:60px;
  }
  .d-flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 20px 0px;
  }
  .d-flex-between .el-icon-close{
    font-size:16px;
    cursor:pointer;
  }
  .clover_left{
    padding:0px 20px 80px;
    height:100%;
    box-sizing: border-box;
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
}
</style>
