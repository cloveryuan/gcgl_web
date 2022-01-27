<template>
  <div class="clover_logreg_container">
    <div class="searchPoint" style="border: none;">
      <el-form size="small" label-position="right"  label-width="40px">
        <el-form-item label="项目" >
          <el-select
            style="width: 100%"
            v-model="form.project"
            value-key="id"
            placeholder="请选择"
            @change="handleProjectChange"
            >
            <template v-if="AMap">
              <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item" ></el-option>
            </template>
            <li v-else>加载中</li>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" class="survey">
          <el-date-picker
            style="width: 100%"
            v-model="form.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="人员">
          <el-select
            v-model="form.user"
            multiple
            collapse-tags
            clearable
            style="width:100%;"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="user_remoteMethod"
            :loading="user_loading"
          >
            <el-option
              v-for="item in userList"
              :key="item.user_id"
              :label="item.user_name_dept"
              :value="item.user_id"
            >
            </el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="内容">
           <el-input v-model="form.content" clearable placeholder="请输入关键词"></el-input>
         </el-form-item>
        <el-form-item label="状态" class="survey">
          <el-radio-group  v-model="form.status" @change="searchHandle">
            <el-radio v-for="item in statusList" :label="item.dict_value" :key="item.dict_value">{{item.dict_label}}</el-radio>
          </el-radio-group>
          <el-button type="primary" size="mini" style="float:right" @click="searchHandle">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="listWrap" style="height: calc(100% - 239px)" v-loading="pointDataLoading" >
        <div v-for="item in pointData" :key="item.id" :class="{card:true,isActive:currentP.id===item.id}" @click="currentClick(item)" >
          <h3 class="survey_title many" :title="item.address">{{item.address}} </h3>
          <div v-if="item.point_code" style="margin-bottom:10px;">
            <span style="font-size:13px;font-weight:550;color:#7F7F7F">{{item.point_code}}</span>
          </div>
          <h4 v-if="item.point_name" style="font-size:14px;font-weight:550;margin-bottom:10px;color:#7F7F7F">{{item.point_name}}</h4>
          <p class="_bottom">
            <span>{{item.user_name}}</span>
            <span>{{item.create_time}}</span>
          </p>
        </div>

        <div v-if="pointData.length<=0" style="text-align:center;">
          <el-image
            :src="require(`@/assets/images/null.png`)"
            style="height: 50px; width: 80px;margin-top:50%">
          </el-image>
          <p style="color: #888">暂无数据</p>
        </div>
      </div>
      <el-pagination
        small
        :pager-count="5"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="page.page_no"
        :page-size="page.page_size"
        layout="total, prev, pager, next"
        :total="page.total">
      </el-pagination>
    </div>

    <div class="main_container_clover" v-show="Object.keys(currentP).length>0" v-loading="centerLoading">
      <div class="main_left">
        <div class="d-between">
          <div style="width:calc(100% - 250px);">
            <span class="havePoint" :style="{background: currentP.status===1?'#70B603':currentP.status===2?'#02A7F0':'#EC808D'}">{{selectDictLabel(statusList, currentP.status)}}</span>
            <span class="many" :title="currentP.address" style="margin-left:6px;width:calc(100% - 60px);display:inline-block;font-size:14px;font-weight:500;color:#606266;vertical-align: middle;">{{currentP.address}}</span>
          </div>
          <div>
            <el-button type="danger" v-hasPermi="['surveyPoint:del']" size="mini" v-if="currentP.status===0"  @click="delSurvey">删除</el-button>
            <el-button type="success" v-hasPermi="['surveyPoint:mount']" size="mini" v-if="currentP.status===0" @click="nongpsChange">挂载点位</el-button>
            <el-button type="primary" v-hasPermi="['surveyPoint:pointAdd']" size="mini" v-if="currentP.status===0" @click="addPoint">新增点位</el-button>
          </div>
        </div>
        <div class="_sbottom">
          <span v-if="currentP.status===0" style="display:inline-block;">
            <span>经度:</span>
            <span>{{currentP.lng}}</span>
            <span style="margin-left:10px;">纬度:</span>
            <span>{{currentP.lat}}</span>
          </span>
          <span>
            <span >勘测人:{{currentP.user_name}}</span>
            <span style="margin-left:10px;">勘测时间:{{currentP.create_time}}</span>
          </span>
        </div>
        <!-- 地图 -->
        <div class="mapwrap">
          <gd-map
            ref="gdMap"
            :locationWGS="locationWGS"
            @changeLocation="changeLocation"
            @changeAddress="changeAddress"
            @haveAmap="haveAmap"
            :isShowPick="isShowPick"
          ></gd-map>
        </div>
        <!-- 勘测照片 -->
        <div style="margin-top:15px;">
          <h4 class="survey_title">勘测照片</h4>
          <div class="clover_wrap"  v-viewer="options" v-if="currentP.photos&&currentP.photos.length>0">
            <div class="box" v-for="img in currentP.photos" :key="img.id" >
              <img
                :src="img.file_path_thumb"
                :data-source="img.file_path"
                :key="img.file_path"
                style="width: 100px;height:100px;"
                v-if="img.is_360!==1"
              />
              <img
                :src="img.file_path_thumb"
                style="width: 100px;height:100px;"
                :key="img.file_path"
                v-if="img.is_360===1"
                @click="initPhotoSphere(img.file_path)"
              />
              <!-- <span class="submit_info">拍摄者: {{img.submit}}</span> -->
            </div>
          </div>
          <div v-else class="nodataFormat">
            暂无照片
          </div>
        </div>
        <!-- 勘测备注 -->
        <div style="margin-top:15px;">
          <h4 class="survey_title">勘测备注</h4>
          <p class="remark" v-if="currentP.remark">{{currentP.remark}}</p>
          <p v-else class="nodataFormat">暂无备注</p>
        </div>
      </div>
      <div class="main_right">
        <!-- 1.无数据并且不是新增 -->
        <div v-if="!point_info&&!isadd" class="nodata clover_proc-main">
          <el-image
            :src="require(`@/assets/images/null.png`)"
            style="height: 50px; width: 80px;margin-top:100px;"
          ></el-image>
          <p style="color: #888">
            <span v-if="near_points.length>0">点击地图上勘测点位附近点选点</span>
            <span v-else class="nodataFormat">
              <h4 class="survey_title"> 勘测点位附近暂无点位</h4>
            </span>
          </p>
        </div>
         <!-- 2.有数据并且不是新增 点位详情 -->
        <div v-if="point_info&&!isadd">
          <h4 class="survey_title">点位信息</h4>
          <p class="rowStyle">
            <span>点位编码：</span>
            <span>{{point_info.point_code}}</span>
          </p>
          <p class="rowStyle">
            <span>点位名称：</span>
            <span>{{point_info.point_name}}</span>
          </p>
          <p class="rowStyle">
            <span>子系统：</span>
            <span>{{point_info.child_name}}</span>
          </p>
          <p class="rowStyle">
            <span>区域：</span>
            <span>{{point_info.area}}</span>
          </p>
          <p class="rowStyle">
            <span>经度：</span>
            <span>{{point_info.lng}}</span>
          </p>
          <p class="rowStyle">
            <span>纬度：</span>
            <span>{{point_info.lat}}</span>
          </p>
          <p class="rowStyle">
            <span>地址：</span>
            <span>{{point_info.address}}</span>
          </p>
          <template v-if="currentP.add_user">
            <h4 class="survey_title">点位新增日志</h4>
            <p class="rowStyle">
              <span>新增人</span>
              <span>{{currentP.add_user}}</span>
            </p>
            <p class="rowStyle">
              <span>操作时间</span>
              <span>{{currentP.add_time}}</span>
            </p>
          </template>
          <el-popover
            placement="right"
            width="340"
            trigger="click"
            v-model="sureexitsSureyshow">
            <div v-if="pointCodeDirectList.length>1" style="text-align:center;">
              <span >该点位存在多个施工位置，请选择哪个方向位置的勘测</span>
              <div>
                <span>方向:</span>
                <el-select style="margin-top:20px;" v-model="point_info.point_code_direct" placeholder="请选择方向" >
                  <el-option
                    v-for="item in pointCodeDirectList"
                    :key="item.point_code"
                    :label="item.direct"
                    :value="item.point_code">
                      <span style="float: left">{{item.direct}}</span>
                      <span style="float: right; color: #8492a6; font-size: 11px">{{item.point_code}}</span>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div v-else style="text-align:center;">
              请确认当前勘测信息是否为该点位的勘测!
            </div>
            <div style="text-align:center;margin-top:50px;">
              <el-button type="primary" size="mini" @click="isSureExistPoint" :loading="sureexitsSureyLoading">确认</el-button>
              <el-button @click="cancleSure" size="mini" type="text">取消</el-button>
            </div>
            <el-button
              slot="reference"
              style="margin-top:20px;"
              type="primary"
              size="small"
              v-if="currentP.status===0"
              v-hasPermi="['surveyPoint:sure']"
              @click="sureSurvey" plain>确认当前所选点位的勘测</el-button>
          </el-popover>
        </div>
        <!-- 3.新增点位 or 挂载无坐标点位 -->
        <div v-if="isadd">
          <!-- ①新增点位 -->
          <template v-if="!nongps">
            <h4 class="survey_title" style="margin-left:15px;">新增点位</h4>
            <el-form ref="addForm" size="small" :model="addForm" :rules="rules" label-width="80px" >
              <el-form-item label="子系统" prop="child_code">
                <el-select
                  v-model="addForm.child_code"
                  placeholder="请选择子系统"
                  style="width:100%"
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
              <el-form-item label="区域"  prop="area">
                <el-input v-model="addForm.area" placeholder="请输入区域"></el-input>
              </el-form-item>
              <el-form-item label="点位编码" prop="point_code">
                <el-input v-model.trim="addForm.point_code" placeholder="请输入点位编码"></el-input>
              </el-form-item>
              <el-form-item label="点位名称" prop="point_name">
                <el-input v-model.trim="addForm.point_name" placeholder="请输入点位名称"></el-input>
              </el-form-item>
              <el-form-item label="方向"  prop="direction">
                <el-radio-group v-model="addForm.radio">
                  <el-select v-model="addForm.direction" collapse-tags value-key="value" multiple placeholder="请选择方向" >
                    <el-option
                      v-for="item in directionList"
                      :key="item.value"
                      :label="item.label"
                      :value="item">
                        <span style="float: left" class="directSel">
                          <span class="checkbox"></span>
                          <span class='label-name-box'>{{item.label}}</span>
                        </span>
                        <span style="float: right; color: #8492a6; font-size: 11px" class="directSel">
                          <el-radio @click.native="radioDirectClick" :label="item.value" :disabled="!addForm.direction.map(m=>m.value).includes(item.value)">勘测此方向</el-radio>
                        </span>
                    </el-option>
                  </el-select>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="经度" prop="lng" style="margin-bottom:25px;">
                <el-input v-model="addForm.lng" placeholder="请输入点位经度或者地图选取" @input="$forceUpdate()"  @change="codeTo"></el-input>
              </el-form-item>
              <el-form-item label="纬度" prop="lat" style="margin-bottom:25px;">
                <el-input v-model="addForm.lat" placeholder="请输入点位纬度或者地图选取" @input="$forceUpdate()" @change="codeTo"></el-input>
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="addForm.address" placeholder="经纬度转换地址" @blur="addressTo"></el-input>
              </el-form-item>
              <div style="text-align:center;">
                <el-button type="primary" size="mini" @click="onSubmit" :loading="saveLoading">保存</el-button>
                <el-button @click="reset" size="mini">重置</el-button>
                <el-button @click="cancle" size="mini" type="text">取消</el-button>
              </div>
            </el-form>
          </template>
          <!-- ②挂载无坐标点位 -->
          <template v-else>
            <h4 class="survey_title" style="margin-left:15px;">挂载无坐标点位</h4>
            <span>点位:</span>
            <el-select
              style="margin-top:20px;"
              v-model="nongpsToPs"
              placeholder="请输入点位编码/名称"
              filterable
              remote
              reserve-keyword
              :remote-method="nongpsRemoteMethod"
              :loading="noposLoading"
              collapse-tags
              value-key="point_code"
            >
              <el-option
                v-for="item in nopointDirectList"
                :key="item.point_code"
                :label="item.direct + item.direct?'-':'' +item.point_code"
                :value="item">
                  <span style="float: left">
                    {{item.direct}}
                    <template v-if="item.direct">-</template>
                    {{item.point_code}}
                  </span>
                  <span style="float: right; color: #8492a6; font-size: 11px">
                    {{item.point_name}}
                  </span>
              </el-option>
            </el-select>
            <div style="text-align:center;margin-top:60px;">
              <el-button type="primary" size="mini" @click="onNoPointsubmit" :loading="saveLoading">确认</el-button>
              <el-button @click="cancle" size="mini" type="text">取消</el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if="Object.keys(currentP).length<=0" style="text-align:center; width:calc(100% - 288px);">
      <el-image
        :src="require(`@/assets/images/null.png`)"
        style="height: 50px; width: 80px;margin-top:200px;">
      </el-image>
      <p style="color: #888">暂无数据</p>
    </div>
    <!-- 全景照片 -->
    <el-dialog
      title="全景照片"
      :visible.sync="photoSphereVisible"
      :footer="false"
      :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>
  </div>
</template>

<script>
import GdMap from './GdMap'
import gcoord from '@/utils/gcoord.js'
import { parseTime } from '@/utils/tool'
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import config from '@/config/config.js'
export default {
  name: 'surveyPoint',
  data () {
    const lngValidate = (rule, value, callback) => {
      var longrg = config.lng
      const lngBoolean = longrg.test(value)
      if (!lngBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    const latValidate = (rule, value, callback) => {
      var latreg = config.lat
      const latBoolean = latreg.test(value)
      if (!latBoolean) {
        callback(new Error(config.msg2))
      } else {
        callback()
      }
    }
    return {
      form: {
        project: null,
        project_id: '',
        project_code: '',
        date: [],
        user: [],
        content: '',
        status: 0
      },
      projectList: [],
      statusList: [
        { dict_label: '无点', dict_value: 0 }, { dict_label: '已增', dict_value: 1 }, { dict_label: '已有', dict_value: 2 }
      ],
      pointData: [],
      listLoading: false,
      saveLoading: false,
      currentP: {},
      options: {
        toolbar: true,
        url: 'data-source'
      },
      isadd: false,
      addForm: {
        project_code: null,
        child_code: null,
        area: '',
        point_code: '',
        point_name: '',
        address: '',
        direction: [],
        radio: null,
        lng: '',
        lat: ''
      },
      directionList: [],
      rules: {
        child_code: [{ required: true, message: '请选择子系统', trigger: 'change' }],
        area: [{ required: true, message: '请输入区域', trigger: 'change' }],
        areaType: [{ required: true, message: '请选择区域类型', trigger: 'change' }],
        point_code: [{ required: true, message: '请输入点位编码', trigger: 'change' }],
        point_name: [{ required: true, message: '请输入点位名称', trigger: 'change' }],
        lng: [
          { required: true, message: '请输入点位经度', trigger: 'change' },
          { validator: lngValidate, trigger: 'blur' }
        ],
        lat: [
          { required: true, message: '请输入点位纬度', trigger: 'change' },
          { validator: latValidate, trigger: 'blur' }
        ]
      },
      childList: [],
      userList: [],
      user_loading: false,
      page: {
        page_no: 1,
        page_size: 10,
        total: 0
      },
      near_points: [],
      markers: null,
      locationWGS: '118.77894195537232,32.043864982702964', // 勘测的位置
      isShowPick: true, // 是否开启拖拽模式
      point_info: null,
      pointDataLoading: false,
      centerLoading: false,
      pointCodeDirectList: [],
      sureexitsSureyshow: false,
      sureexitsSureyLoading: false,
      nongps: false, // 挂载无坐标点位
      nopointDirectList: [],
      nongpsToPs: null, // 挂载的点
      noposLoading: false,
      jjmarker: null,
      AMap: null,
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: ''
    }
  },
  components: {
    GdMap
  },
  conputed: {

  },
  mounted() {
    this.$nextTick(() => {
      this.getProjectsList()
    })
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
    handleProjectChange(val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      this.childList = []
      // this.form.date = []
      this.currentP = {}
      this.pointData = []
      this.getChildList()
      this.searchHandle()
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
        if (Number(code) === 200) {
          this.childList = data || []
        } else {
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
    },
    async user_remoteMethod(query) {
      if (query !== '') {
        this.user_loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.user_loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询人员失败')
        }
        this.userList = data.user_list || []
      } else {
        this.userList = []
      }
    },
    async handleQuery() {
      if (!this.form.project_code) {
        this.$message.info('请选择项目')
        return
      }
      this.currentP = {}
      // this.pointData = []
      this.nopointDirectList = []
      this.nongpsToPs = ''

      // 获取勘测列表
      this.pointDataLoading = true
      const params = {
        project_code: this.form.project_code,
        status: this.form.status,
        begin_date: this.form.date ? this.form.date[0] : '',
        end_date: this.form.date ? this.form.date[1] : '',
        user_id: this.form.user,
        content: this.form.content,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data } = await this.$pub.post('/survey/get-survey-list', params)
      this.pointDataLoading = false
      this.pointData = data.list
      this.page.total = data.total
      if (data.list.length > 0) {
        this.currentClick(this.pointData[0])
      }
    },
    searchHandle() {
      this.handleCurrentChange(1)
    },
    handleSizeChange(val) {
      this.page.page_size = val
      this.handleQuery()
    },
    handleCurrentChange(val) {
      this.page.page_no = val
      this.handleQuery()
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
    async currentClick(row) {
      this.currentP = row
      this.centerLoading = true
      const AMap = this.AMap
      const params = {
        project_code: this.form.project_code,
        status: row.status,
        point_code: row.point_code,
        id: row.id,
        lng: row.lng,
        lat: row.lat
      }
      const { data } = await this.$pub.post('/survey/get-survey-info', params)

      this.centerLoading = false
      this.currentP.photos = data.photos ? data.photos : []
      this.near_points = data.near_points ? data.near_points : []// status:0
      this.point_info = data.point_info ? data.point_info : null// status:1||2
      await this.$refs.gdMap
      if (this.currentP.status !== 0) {
        this.isShowPick = false
        this.isadd = false
        this.$refs.gdMap.positionPicker.stop()
        // 有点位，渲染这点位在地图上
        if (!this.point_info) {
          return
        }
        // if (AMap) {
        //   this.drawMarks([this.point_info], 'isHave')
        // } else {
        //   setTimeout(() => {
        //     this.drawMarks([this.point_info], 'isHave')
        //   }, 500)
        // }
        this.drawMarks([this.point_info], 'isHave')
        const center = gcoord.transform(
          [this.point_info.lng, this.point_info.lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.GCJ02 // 目标坐标系
        )
        this.$refs.gdMap.GDMap.setZoomAndCenter(14, center)
      } else { // 1.无点位，获取周边1公里范围内的点位，渲染这些点位在地图上
        this.isShowPick = true
        const center = gcoord.transform(
          [this.currentP.lng, this.currentP.lat], // 经纬度坐标
          gcoord.WGS84, // 当前坐标系
          gcoord.GCJ02 // 目标坐标系
        )
        this.drawMarks(this.near_points)
        if (!this.$refs.gdMap.positionPicker) {
          return
        }
        this.$refs.gdMap.positionPicker.start(new AMap.LngLat(center[0], center[1]))
      }
    },
    async sureSurvey() {
      this.pointCodeDirectList = []
      const params = {
        project_code: this.form.project_code,
        point_code: this.point_info.point_code
      }
      const { data, code } = await this.$pub.post('/survey/get-direct-list', params)
      if (code !== 200) {
        this.pointCodeDirectList = []
        return this.$message.error('获取方向出错了')
      }
      if (data && data.length === 1) {
        this.point_info.point_code_direct = data[0].point_code
      } else if (data && data.length <= 0) {
        this.point_info.point_code_direct = this.point_info.point_code
      } else if (data && data.length > 1) {
        this.pointCodeDirectList = data
      }
    },
    cancleSure() {
      this.sureexitsSureyshow = false
      this.pointCodeDirectList = []
      this.point_info.point_code_direct = ''
    },
    // 勘测已经存在的
    async isSureExistPoint() {
      this.sureexitsSureyLoading = true
      const params = {
        child_code: this.point_info.child_code,
        point_code: this.point_info.point_code_direct,
        survey_id: this.currentP.id,
        address: this.currentP.address,
        user_id: this.currentP.user_id,
        create_time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        remark: this.currentP.remark
      }
      const { code } = await this.$pub.post('/survey/attach-exist-point', params)
      if (code !== 200) {
        this.$message.error('确认失败')
      } else {
        this.sureexitsSureyshow = false
        this.$message.success('确认成功')
        this.handleQuery()
      }
      this.sureexitsSureyLoading = false
    },
    changeLocation (location) {
      // this.addForm.lng = location[0]
      // this.addForm.lat = location[1]
      this.addForm.lng = Math.floor(location[0] * 100000000) / 100000000
      this.addForm.lat = Math.floor(location[1] * 100000000) / 100000000
    },
    changeAddress (address) {
      this.addForm.address = address
    },
    codeTo() {
      const location = `${this.addForm.lng},${this.addForm.lat}`
      this.$refs.gdMap.codeToLocaltion(location)
    },
    addressTo() {
      const address = this.addForm.address
      this.$refs.gdMap.localtionToCode(address)
    },
    async getDirectionList() {
      this.$dict(this, 'direction').then((res) => {
        if (res.code === 200) {
          this.directionList = res.data || []
        } else {
          this.$message.error('出错了direction')
          this.directionList = []
        }
      })
    },
    radioDirectClick(e) {
      e.stopPropagation()
    },
    // 新增点
    addPoint() {
      this.isadd = true
      this.nongps = false
      this.addForm.project_code = this.form.project_code
      this.jjmarker && this.$refs.gdMap.GDMap.remove(this.jjmarker)
      this.jjmarker = null
      this.getDirectionList()
    },
    reset() {
      this.$refs.addForm.resetFields()
      this.addForm.radio = null
      this.addForm.child_code = null
    },
    cancle() {
      this.isadd = false
      this.nongps = false
    },
    async onSubmit() {
      try {
        await this.$refs.addForm.validate()
        const formdata = {
          user_id: this.currentP.user_id,
          create_time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
          remark: this.currentP.remark,
          survey_id: this.currentP.id,
          add_user_id: this.$store.state.userInfo.id + '',

          project_code: this.addForm.project_code,
          child_code: this.addForm.child_code,
          point_code: this.addForm.point_code,
          point_name: this.addForm.point_name,
          area: this.addForm.area,
          address: this.addForm.address,
          lng: this.addForm.lng + '',
          lat: this.addForm.lat + ''
        }
        if (this.addForm.direction && this.addForm.direction.length > 0 && !this.addForm.radio) {
          return this.$message.error('请选择在哪个方向上勘测点位')
        }
        this.saveLoading = true
        formdata.direct = this.addForm.direction.map(m => {
          return {
            code: m.value,
            name: m.label,
            is_survey: m.value === this.addForm.radio
          }
        })

        const { code, message } = await this.$pub.post('/survey/attach-new-point', formdata)
        this.saveLoading = false
        if (code !== 200) {
          this.$message.error(message || '添加失败')
        } else {
          this.$message.success('添加成功')
          this.handleQuery()
        }
      } catch (err) {
        this.$message.error(err || '添加失败')
        this.saveLoading = false
      }
    },
    // 挂载点
    nongpsChange() {
      this.isadd = true
      this.nongps = true

      this.jjmarker && this.$refs.gdMap.GDMap.remove(this.jjmarker)
      this.jjmarker = null
    },
    async nongpsRemoteMethod(query) {
      if (query !== '') {
        this.noposLoading = true
        const params = {
          project_code: this.form.project_code,
          point_code: query
        }
        const { data } = await this.$pub.post('/survey/get-nongps-point-list', params)
        this.nopointDirectList = data
      } else {
        this.nopointDirectList = []
      }
      this.noposLoading = false
    },
    async onNoPointsubmit() {
      const params = {
        child_code: this.nongpsToPs.child_code,
        point_code: this.nongpsToPs.point_code,
        survey_id: this.currentP.id,
        address: this.currentP.address,
        user_id: this.currentP.user_id,
        create_time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        remark: this.currentP.remark,
        lng: this.currentP.lng,
        lat: this.currentP.lat
      }
      const { code } = await this.$pub.post('/survey/attach-nongps-point', params)
      if (code === 200) {
        this.$message.success('挂载成功')
        this.handleQuery()
      } else {
        this.$message.success('挂载失败')
      }
    },
    // 画点
    drawMarks (arrs, type = 'nohave') {
      // console.log(this.jjmarker)
      if (this.markers !== null) {
        // this.markers.clear()
        // this.markers.setData(currentMarkers)
        // return
        this.jjmarker = null
        this.$refs.gdMap.GDMap.clearMap()
      }
      if (arrs.length <= 0 || !arrs[0]) {
        return
      }
      const AMap = this.AMap
      const GDMap = this.$refs.gdMap.GDMap
      const overlayList = []
      const currentMarkers = []
      arrs.map((item, index) => {
        if (
          !(
            typeof item.lng === 'undefined' ||
            typeof item.lat === 'undefined' ||
            item.lng.trim() === '' ||
            item.lat.trim() === ''
          )
        ) {
          const result84 = gcoord.transform([item.lng, item.lat], // 经纬度坐标
            gcoord.WGS84, // 当前坐标系
            gcoord.GCJ02 // 目标坐标系
          )
          const po = Object.assign(item, { lng84: result84[0], lat84: result84[1] })
          currentMarkers.push(this.addMarker(po, index))
          overlayList.push({ lng: po.lng84, lat: po.lat84 })
        }
      })
      // 绘制
      // 创建样式对象
      const styleObject = {
        url: type === 'isHave' ? require('../../assets/images/position-picker.png') : require('../../assets/images/point.png'), // isHave勘测位置点位生成的，没有是渲染一公里范围内的点，图标有所区分
        size: type === 'isHave' ? new AMap.Size(32, 32) : new AMap.Size(48, 48),
        anchor: new AMap.Pixel(16, 32)
      }
      const massMarker = new AMap.MassMarks(currentMarkers, {
        zIndex: 999,
        // zooms: [3, 19],
        style: styleObject
      })

      if (this.form.status === 0) {
        massMarker.on('click', (e) => {
          this.point_info = e.data.point
          this.isadd = false
          const pos = [e.data.lnglat[0], e.data.lnglat[1]]
          // this.jjmarker.setPosition(pos);
          // this.jjmarker.setLabel({
          //   content: `<img src="../../assets/images/jj.png" />`,
          //   direction: "top",
          // });
          // const pos = [e.data.lnglat.lng, e.data.lnglat.lat]
          // GDMap.panTo(pos)
          if (this.jjmarker) {
            this.jjmarker.setPosition(pos)
            // GDMap.remove(this.jjmarker);
          } else {
            this.jjmarker = new AMap.Marker({
              map: GDMap,
              icon: require('../../assets/images/jj.png'),
              position: pos,
              offset: new AMap.Pixel(-20, -40)
            })
          }
        })
      }

      massMarker.setMap(GDMap)
      // 海量点绘制不是覆盖物，而是图层，中心点需要计算出来
      // let centerpoint = null
      // if (overlayList.length >= 2) {
      //   centerpoint = calculateCenter(overlayList)
      //   GDMap.setZoomAndCenter(9, centerpoint)
      // } else if (overlayList.length === 1) {
      //   debugger
      //   centerpoint = new AMap.LngLat(
      //     overlayList[0].lng,
      //     overlayList[0].lat
      //   )
      //   GDMap.setZoomAndCenter(9, centerpoint)
      // } else {
      //   this.$notify.info({
      //     title: '提示',
      //     message: '勘测点附近没有发现任何点位'
      //   })
      // }
      this.markers = massMarker
    },
    addMarker (point, index) {
      const data = {
        lnglat: [point.lng84, point.lat84],
        name: point.point_name,
        point: point,
        id: index
      }
      return data
    },
    // 删除
    delSurvey() {
      this.$confirm('请确定是否删除当前勘测信息!!', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.$pub.post('/survey/survey-del', { id: this.currentP.id })
        if (code === 200) {
          this.$message.success('删除成功')
          this.searchHandle()
        } else {
          this.$message.error('删除失败')
        }
      }).catch(function () {})
    },
    initPhotoSphere(img) {
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
    }
  }
}
</script>

<style>
.clover_logreg_container{
  display: flex;
  justify-content: space-between;
  height:100%;
  width:100%;
  box-sizing: border-box;
  background:#fff;
  padding:20px;
}
.searchPoint{
  width:328px;
  height: calc(100% - 2px);
  padding-right: 20px;
  box-sizing:border-box;

}
.searchPoint .survey .el-radio {
  margin-right:12px;
}
.searchPoint .survey .el-radio__label {
  padding-left:10px;
  font-size:13px;
}
.searchPoint .el-form-item{
  margin-bottom:10px!important;
}
/* .searchPoint .survey .el-range-editor--small .el-range-input{
  font-size:10px;
}
.searchPoint .survey .el-range-editor.el-input__inner{
  padding:3px 2px;
}
.searchPoint .survey .el-date-editor .el-range-input{
  width: calc(100% - 24px);
}
.searchPoint .survey .el-range__icon{
  display:none;
} */
.listWrap{
  margin-top:10px;
  border: 1px solid #ccc;
  border-bottom:none;
  overflow: auto;
}
.searchPoint .el-pagination--small{
  border: 1px solid #ccc;
  border-top:none;
}
.havePoint{
  color:#fff;
  background: #EC808D;
  padding: 4px 10px;
  font-size:12px;
  display:inline-block;
}
.listWrap .card{
  padding:10px;
  border-bottom: 1px solid #ddd;
  cursor:pointer;
}
.listWrap .isActive{
  background: #f2f2f2;
}
.listWrap .card ._bottom{
  font-size:12px;
  color:rgb(134, 133, 133);
  display:flex;
  justify-content: space-between;
}
.d-between{
  display:flex;
  justify-content: space-between;
  align-items:center;
}
.main_container_clover{
  display: flex;
  justify-content: space-between;
  width:calc(100% - 340px);
  border:1px solid #ccc;
  height: 100%;
  box-sizing:border-box;
}
.main_container_clover .main_left{
  width: calc(100% - 290px);
  padding:10px;
  height: 100%;
  overflow: auto;
  box-sizing:border-box;
  border-right:1px solid #ddd;
}
.main_container_clover .main_right{
  width: 290px;
  padding:20px 10px;
  height: 100%;
  overflow: auto;
  box-sizing:border-box;
}
.main_container_clover .main_left ._sbottom{
  font-size:14px;
  color:rgb(134, 133, 133);
  display:flex;
  justify-content: space-between;
  margin-top:10px;
}
.main_container_clover .main_left .mapwrap{
  margin:10px 0;
  height:60%;
  width:100%;
}
.survey_title{
  font-size:14px;
  font-weight:550;
  margin-bottom:10px;
  color: rgb(70, 68, 68);
}
.clover_logreg_container .many{
  text-overflow: ellipsis;
  overflow: hidden;
  width:100%;
  white-space: nowrap;
}
.main_container_clover .main_left .remark{
  color:#868585;
  font-size:14px;
  padding: 10px 5px;
}
.main_container_clover .main_left  .box{
  padding: 0px 5px;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
  margin-right: 6px;
}
.main_container_clover .main_left  .box img{
  border: 1px solid #ccc;
}
.submit_info{
  display:block;
  font-size: 12px;
  color: #aaa;
}
.main_container_clover .nodata{
  text-align:center;
}
.main_container_clover .rowStyle{
  color: rgb(134, 133, 133);
  margin-bottom:10px;
  font-size:14px;
  padding:2px 0;
  border-bottom:1px solid #ddd;
}
.main_container_clover .rowStyle span:first-child{
  width:70px;
  display:inline-block;
  color:#444;
}
.main_container_clover .main_right >div{
  /* height:100%; */
  /* overflow:auto; */
}
.directSel .el-radio__label,.directSel .el-checkbox__label{
  padding-left:2px;
  font-size: 12px;
}
.directSel .el-radio__inner,.directSel .el-checkbox__inner{
  width: 12px;
  height: 12px ;
}

/*清空原来的多选框样式*/
.el-select-dropdown.is-multiple .el-select-dropdown__item:after{
  content:"";
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected:after{
  content:"";
}
/*参考el-checkbox实现checkbox样式*/
.el-select-dropdown.is-multiple .el-select-dropdown__item .checkbox{
   vertical-align: middle;
  margin-right: 4px;
  display: inline-block;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  background-color: #fff;
  z-index: 1;
  transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected .checkbox{
  background-color:#409eff;
  border-color:#409eff;
}

/*参考el-select多选对号样式实现checkbox中对号的样式*/
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected .checkbox::after{
  position: absolute;
  top: -12px;
  font-family: element-icons;
  content: "\e6da";
  font-size: 11px;
  font-weight: 700;
  -webkit-font-smoothing: antialiased;
  color:#fff;
}

/*设置置灰内容样式*/
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected.is-disabled .checkbox{
  background-color:#f2f6fc;
  border-color:#dcdfe6;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected.is-disabled .checkbox::after{
  color:#c0c4cc;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected.is-disabled .label-name-box{
  color:#c0c4cc;
  font-weight:400;
  font-size:12px;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item .label-name-box{
  font-size:12px;
}
.nodataFormat{
  color:#888;
  font-size:14px;
}
.el-button--mini, .el-button--small {
    font-size: 12px;
    border-radius: 0px;
}
</style>
