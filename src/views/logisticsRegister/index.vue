<template>
  <div class="clover_logreg_container">
    <ul class="cloverLeft" >
      <li v-hasPermi="['materialDesign:list']"  @click="tabClick(1)" :style="{color: regType===1?'#409eff':'rgb(56, 53, 53)'}">深化设计</li>
      <li v-hasPermi="['materialBuild:list']"  @click="tabClick(2)" :style="{color: regType===2?'#409eff':'rgb(56, 53, 53)'}">施工登记</li>
    </ul>
    <div class="searchPoint" v-loading="tableLoading">
      <el-form size="small" label-position="right"  :label-width="regType===2?'68px':'54px'" style="margin:0 10px;border-radius:4px;">
        <el-form-item label="项目" >
          <el-select style="width: 100%" v-model="form.project" placeholder="请选择" @change="handleProjectChange" value-key="id">
            <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="点位">
          <el-input  v-model="form.pointCode" placeholder="请输入点位编号或名称" @input="inputChangePoint"></el-input>
        </el-form-item>
        <el-form-item label="标签">
            <el-select
              v-model="form.tag"
              style="width:100%"
              clearable
              placeholder="请选择标签"
              @change="handleSelectChange"
            >
              <el-option
                v-for="item in tagList"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="子系统" v-if="regType===1">
            <el-select
              v-model="form.child"
              style="width:100%"
              clearable
              placeholder="请选择子系统"
              multiple
              collapse-tags
              @change="handleSelectChange"
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
        <el-form-item label="区域" v-if="regType===1">
            <el-select
              v-model="form.area"
              style="width:100%"
              clearable
              placeholder="请选择区域"
              multiple
              collapse-tags
              @change="handleSelectChange"
            >
              <el-option
                v-for="item in areaList"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="施工单位" v-if="regType===2">
            <el-select
              v-model="form.dept_id"
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认施工单位"
              @change="handlePointChange"
            >
              <el-option
                v-for="item in BuilderList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="拍照日期" v-if="regType===2">
          <el-date-picker
            v-model="form.phototime"
            @change="handlePointChange"
            type="daterange"
            placeholder="选择拍照日期"
            style="width:100%"
            range-separator="至"
            start-placeholder="开始日期"
            value-format="yyyy-MM-dd"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态"  v-if="regType===1" label-width="40px">
          <el-radio-group  v-model="form.status"  @change="handlePointChange">
            <el-radio v-for="item in statusList" :label="item.dict_value" :key="item.dict_value">
              {{item.dict_label}}
              <span v-if="item.dict_value!==2">({{item.count}})</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态"  v-if="regType===2">
          <el-radio-group  v-model="form.hasNew"  @change="handlePointChange">
            <el-radio v-for="item in hasNewList" :label="item.dict_value" :key="item.dict_value">
              {{item.dict_label}}
              <span v-if="item.dict_value!==1">({{item.count}})</span>
            </el-radio>
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
        @row-click="currentClick"
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
    <div class="rightWrap">
      <!-- 工序 -->
      <div class="clover_proc-main"  v-loading="centerLoading">
        <div class="moreText" v-if="currentPoint">
          <span class="tit">
            {{currentPoint.pointCode}} {{currentPoint.pointName}}
          </span>
          <div style="font-size:18px;" >
            <el-button-group>
              <el-button type="primary" size="small" v-if="(regType===1&&checkPermission(['materialDesgin:verify'])) || (regType===2&&checkPermission(['materialBuild:verify']))"   @click="plsp" class="spbtn">批量审批</el-button>
              <el-button size="small" v-if="regType===2"  icon="el-icon-tickets" @click="changeIsList('0')" :style="{color:isStatus==='0'?'#409EFF':''}"></el-button>
              <el-button size="small" v-if="regType===2&&(first || second)"  icon="el-icon-document-delete" @click="changeIsList('1')" :style="{color:isStatus!=='0'?'#409EFF':''}"></el-button>
            </el-button-group>
          </div>
        </div>
        <div class="wrap" v-if="procLists.length>0">
          <el-collapse :value="activeClassName">
            <el-collapse-item
              v-for="item in procLists"
              :key="item.class_Name"
              :title="item.class_name"
              :name="item.class_name"
            >
              <div slot="title">{{ item.class_name }}</div>
              <div class="proc-item"  v-for="procitem in item.proc_list" :key="procitem.proc_code">
                <span class="subtitle">
                  <i class="el-icon-camera"></i>
                  <span :style="{fontWeight: procitem.is_core===1?'600':'normal',marginLeft:'4px'}">{{ procitem.proc_name }}</span>
                  <el-tooltip effect="dark" content="关键工序" v-if="procitem.is_core===1">
                    <img src="../../assets/images/guanj.png"  style="width:16px;margin-left:10px;">
                  </el-tooltip>
                </span>
                <div v-for="(pointDirect,i) in procitem.pointList" :key="pointDirect.direction?pointDirect.direction + i + 'point' : i+'point'">
                  <div v-if="pointDirect.direction" class="dir">
                    <span>方向：</span>
                    <span>{{pointDirect.direction}}</span>
                    <template v-if="procitem.isDesign===0 && (item.class_code!=='CLS100')">
                      <el-tooltip v-if="!pointDirect.transfer" v-hasPermi="['logisticsRegister:procTransfer']" effect="dark" content="迁移照片">
                        <img class="img" src="../../assets/images/transfer.png"  @click="showTransfer(pointDirect,true)" style="width:15px;margin-left:10px;">
                      </el-tooltip>
                      <template v-if="pointDirect.transfer">
                        <span @click="sureTransfer(procitem,pointDirect)" class="img_wrap">
                          <img class="img" src="../../assets/images/transfer.png" style="width:14px;">
                          迁移
                        </span>
                        <span  @click="showTransfer(pointDirect,false)" class="img_wrap">
                          <img class="img" src="../../assets/images/transfercancle.png" style="width:14px;">
                          取消
                        </span>
                      </template>
                    </template>
                  </div>
                  <div class="clover_wrap"  v-viewer="options" v-if="pointDirect.attach_list.length>0">
                    <div class="box" v-for="img in pointDirect.attach_list" :key="img.image_id" >
                      <div class="box_img">
                        <img
                          :src="img.file_path_thumb"
                          :data-source="img.file_path"
                          :key="img.file_path"
                          style="width: 140px;"
                          v-if="img.is360!==1"
                        />
                        <img
                          :src="img.file_path_thumb"
                          style="width: 140px;height:140px;"
                          :key="img.file_path"
                          v-if="img.is360===1"
                          @click="initPhotoSphere(procitem.procName,img.file_path)"
                        />
                        <el-checkbox
                          v-if="pointDirect.transfer"
                          class="check"
                          :true-label="1"
                          :false-label="0"
                          v-model="img.isTransfer"></el-checkbox>
                        </div>
                      <div class="sett" @click="materSetting(img,procitem)" v-hasPermi="['logisticsRegister:proc']" v-if="regType===2 && img.is_fill_device===1 && (img.audit===0 || img.audit===1)">
                        <i class="el-icon-setting"></i>
                      </div>
                      <div class="user">
                        <span>拍摄: {{img.submit}}</span>
                        <span v-if="regType===1 || (regType===2&&procitem.is_core===1)" :style="{fontWeight:'bold',color:img.audit===0?'Orange':(img.audit===1 ||img.audit===3 )?'#70b617':'#F56C6C'}"> {{selectDictLabel(imgAudit, img.audit)}}</span>
                      </div>
                      <div v-if="regType===1 || (regType===2&&procitem.is_core===1&&procitem.procCode!=='CLS000-04')" >
                        <el-radio-group v-model="img.num" @change="changeImgAudit(img,pointDirect.proc_code)" class="imgRadio" v-if="(first&&[0,1,2].includes(img.audit)) || (imgExamine_f.includes(img.audit)&&second)">
                        <!-- v-if="(imgExamine.includes(img.audit)&&checkPermission(['logisticsRegister:photoExamine'])) || (imgExamine_f.includes(img.audit)&&checkPermission(['logisticsRegister:photoExamine_f']))" -->
                          <el-radio :label="true">通过</el-radio>
                          <el-radio :label="false">不通过</el-radio>
                        </el-radio-group>
                      </div>
                    </div>
                  </div>
                  <!-- 拓展信息 -->
                  <template v-if="pointDirect.extand&&pointDirect.extand.length > 0">
                    <span class="remarktitle" >
                      <i class="el-icon-s-operation"></i>
                      拓展信息
                    </span>
                    <ul class="remarkRow">
                      <li v-for="item in pointDirect.extand" :key="item.code">
                        <span>{{item.name}}:</span>
                        <span>{{item.value}}</span>
                      </li>
                    </ul>
                  </template>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <!-- 工序 无数据 -->
        <div v-if="procLists.length<=0" class="nodata" >
          <el-image
            :src="require(`@/assets/images/null.png`)"
            style="height: 50px; width: 80px;margin-top:100px;"
            v-loading="centerLoading"
          ></el-image>
          <p style="color: grey">
            {{regType===1?'暂无点位深化设计图':'暂无点位工序拍照数据'}}
          </p>
        </div>
      </div>

      <!-- 物料清单 -->
      <div class="clover_device-main"  v-loading="devloading">
        <div style=" padding:10px;border-bottom:1px solid #ccc;box-sizing:border-box;">
          <div class="_top">
            <h4>物料清单</h4>
            <span class="statusText" v-if="log_info.status">
              {{selectDictLabel(statusList, log_info.status)}}
            </span>
            <el-button type="primary"  size="small" style="margin-left: auto;" v-if="regType===2" @click="saveData">保存</el-button>
          </div>
          <div class="sub">
            <p class="info">
              <span>最后更新人：{{log_info.userName?log_info.userName:'暂无数据'}}</span>
              <span>操作时间：{{log_info.updateTim?log_info.updateTime:'暂无数据'}}</span>
            </p>
          </div>
          <div class="opear">
            <el-checkbox v-if="regType===1" v-model="status" style="margin:4px 6px 0 0;">已完成</el-checkbox>
            <span :style="{fontSize:regType===1?'16px':'14px',marginRight:'6px'}">备注:</span>
            <el-input size="mini" v-model="log_info.remark" style="flex:1;"></el-input>
            <el-button v-if="regType===1" type="primary" style="margin-left:6px;"  size="small" @click="saveData">保存</el-button>
          </div>
        </div>
        <p style="margin-top:10px;display:flex;align-items:center;" v-if="regType===1&&currentPoint" >
          <span style="font-size: 14px;margin: 0px 6px 0 10px;">子系统：</span>
          <el-radio-group v-model="child" @change="getRightDeviceList">
            <el-radio :label="currentPoint.childCode">当前点位子系统</el-radio>
            <el-radio label="-1">全部</el-radio>
          </el-radio-group>
        </p>
        <div style="display:flex;">
          <el-table
            class="deviceTable"
            :height="deviceHeight"
            :data="deviceLists"
            :row-style="{ height: '30px' }"
            :cell-style="{ padding: '0' }"
            highlight-current-row
            :style="{width: regType===1?'100%':'calc( 100% -145px)'}"
          >
            <el-table-column label="物料规格" prop="deviceName" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>
                  <span
                    v-if="scope.row.status===3 || scope.row.status===2"
                    :style="{margin:'0 2px 0 0',padding: '4px 6px',background: scope.row.status===3? 'blue': 'green',color:'#fff'}"
                  >{{statusFormat(stage_device_status,scope.row.status)}}</span>
                  <span v-if="regType===1&&scope.row.regNums>0&&scope.row.status===1" style="margin:0 2px 0 0;padding: 4px 6px;background:red;color:#fff">已填报</span>
                  <span v-if="regType===1" :class="{isWeight: (scope.row.regNums>0&&scope.row.status===1) ||scope.row.status===2 || scope.row.status===3 }" :style="{color:(scope.row.regNums>0&&scope.row.status===1)?'red':scope.row.status===2?'green':scope.row.status===3?'blue':'#606266'}">{{scope.row.deviceName}}</span>
                  <span v-else :class="{isWeight: scope.row.status===2 || scope.row.status===3 }" :style="{color:scope.row.status===2?'green':scope.row.status===3?'blue':'#606266'}">{{scope.row.deviceName}}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="规格型号" prop="deviceModel" width="150" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{scope.row.deviceModel}}</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" prop="unit" width="50" align="center" />
            <el-table-column v-if="regType===1"  label="数量"  align="center" prop="regNums" width="80">
              <template slot-scope="scope" >
                <el-input
                  v-model="scope.row.regNums"
                  :disabled="scope.row.status===3&&!checkPermission(['logisticsRegister:examine'])"
                  oninput ="value=value.replace(/[^\d]/g,'')" style="width:60px;"></el-input>
              </template>
            </el-table-column>
            <template v-if="regType===2">
              <el-table-column label="设计数量" prop="regNums" align="center" width="80" />
              <el-table-column  label="安装数量" prop="finishNums" align="center" width="80">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.finishNums"
                    :disabled="scope.row.status===3&&!checkPermission(['logisticsRegister:examine'])"
                    @blur="valiAnzhuangNum(scope.row,scope.$index)"
                    style="width:60px;"
                    :class="{noFinish:scope.row.regNums>scope.row.finishNums}"
                  ></el-input>
                  <span v-if="scope.row.error" style="color:#f40;">{{scope.row.error}}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
            <!-- <el-checkbox-group v-if="regType===2" v-model="status_info" style="width:100px;" class="checkGroups">
              <el-checkbox v-for="i in buildStatusList" :key="i.dict_value" :label="i.dict_value" @change="buildStatusChange"></el-checkbox>
            </el-checkbox-group> -->
          <div class="checkGroupself">
            <div v-for="i in stage_list" :key="i.id" class="el-checkboxs" :class="{isSelect:currentStage&&currentStage.stage_code===i.stage_code}" >
              <el-checkbox v-model="i.checked" v-if="regType===2&&!i.noCkeck"  @change="buildStatusChange(i)"  :disabled="i.disabled"></el-checkbox>
              <span :style="{color:i.color,fontWeight:(i.status === 3 || i.status === 2 ) ?700:'normal',}" class="isLine" @click="clickStage(i)">{{i.stage_name}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全景照片 -->
    <el-dialog
      :title="photoSphereName"
      :visible.sync="photoSphereVisible"
      :footer="false"
      :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog>

    <!-- 工序里面的图片配置物料 -->
    <el-dialog
      title=""
      :visible.sync="settingMaterFlag"
      :footer="false"
      :append-to-body="true"
      custom-class="proc-mac-setting"
      :show-close="false"
      width="70%">
      <proc-mar
        v-if="settingMaterFlag"
        :settingMaterFlag.sync="settingMaterFlag"
        :current="currentSettingImg"
        :project_code="form.projectCode"
        :point_code="currentPoint.pointCode"
        @getRightDeviceList="getRightDeviceList"></proc-mar>
    </el-dialog>

    <!-- 工序里面的图片迁移 -->
    <el-drawer
      title=""
      :visible.sync="showAllProc"
      :append-to-body="true"
      custom-class="proc-transfer-setting"
      size="800px">
      <proc-transfer
        v-if="showAllProc"
        :showAllProc.sync="showAllProc"
        :transferData="transferData"
        @refreshCenter="refreshCenter"></proc-transfer>
    </el-drawer>
  </div>
</template>

<script>
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import { checkPermission } from '@/utils/tool'
import procMar from './procMar.vue'
import procTransfer from './procTransfer.vue'

export default {
  name: 'logisticsRegister',
  data () {
    return {
      form: {
        project: '',
        id: '',
        projectCode: '',
        pointCode: '',
        tag: '',
        hasNew: 0,
        status: 0,
        dept_id: '',
        begin_time: '',
        end_time: '',
        area: null,
        child: null
      },
      projectList: [],
      tagList: [],
      pointList: [],
      BuilderList: [],
      childList: [],
      areaList: [],
      pointTableData: [],
      total: 0,
      page: {
        page_no: 0,
        page_size: 10
      },
      regType: 1,
      hasNewList: [
        { dict_label: '待审', dict_value: 0, count: 0 }, { dict_label: '全部', dict_value: 1, count: 0 }
      ],
      statusList: [
        { dict_label: '未登记', dict_value: 0, count: 0 }, { dict_label: '已登记', dict_value: 1, count: 0 }, { dict_label: '已完成', dict_value: 2, count: 0 }
      ],
      imgExamine: [0, 2],
      imgExamine_f: [1, 3, 4],
      imgAudit: [
        { dict_label: '未审核', dict_value: 0 }, { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '初审未通过', dict_value: 2 }, { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '终审未通过', dict_value: 4 }
      ],
      buildStatusList: [
        { dict_label: '开挖完成', dict_value: 1 }, { dict_label: '立杆完成', dict_value: 2 }, { dict_label: '设备安装完成', dict_value: 3 },
        { dict_label: '取电完成', dict_value: 4 }, { dict_label: '取网完成', dict_value: 5 }, { dict_label: '链路完成', dict_value: 6 },
        { dict_label: '平台接入完成', dict_value: 7 }
      ],
      stage_device_status: [
        { dict_label: '无需审核', dict_value: 0 }, { dict_label: '待审核', dict_value: 1 },
        { dict_label: '已初审', dict_value: 2 }, { dict_label: '已终审', dict_value: 3 }
      ],
      tableHeight: window.innerHeight - 145 - 278,
      deviceHeight: window.innerHeight - 145 - 155,
      currentPoint: null,
      activeClassName: null,
      procLists: [], // 工序列
      deviceLists: [], // 物料规格
      stage_list: [], // 阶段数据
      stage_0: { stage_code: '0', stage_name: '全部数据', status: 0, noCkeck: true }, // 全部和其他
      stage_0_2: { stage_code: '0', stage_name: '全部数据', status: 0, noCkeck: true },
      stage_t: { stage_code: '-1', stage_name: '未配阶段', status: 0, noCkeck: true },
      options: {
        toolbar: true,
        url: 'data-source'
      },
      tableLoading: false,
      centerLoading: false,
      status: false, // 深化设计是否完成的状态标志 1已登记，2已完成
      log_info: {
        status: 0, // 深化设计是否完成的状态标志 1已登记，2已完成
        userID: '',
        userName: '',
        updateTime: '',
        remark: ''
      },
      status_info: [], // 施工登记的状态
      timer: null,
      isStatus: '0', // 查看所有列表
      // 全景照片
      viewer: '',
      photoSphereVisible: false,
      photoSphereName: '',
      operArr: [], // 通过不通过的数组
      child: '-1',
      devloading: false,
      currentStage: null, // 当前选择的阶段
      currentSettingImg: null, // 当前待配置物料的图片信息
      settingMaterFlag: false, // 图片配置物料的弹窗
      showAllProc: false, // 迁移工序
      transCurrentPintDirect: null, // 前端选中的迁移这条数据
      transferData: {} // 迁移的传递数据信息
    }
  },
  computed: {
    first() {
      return this.checkPermission(['logisticsRegister:photoExamine'])// 初审权限
    },
    second() {
      return this.checkPermission(['logisticsRegister:photoExamine_f'])// 终审权限
    }
  },
  components: { procMar, procTransfer },
  created() {
    this.getProjectsList()
  },
  watch: {
    regType() {
      this.tableHeight = this.regType === 1 ? window.innerHeight - 145 - 278 : window.innerHeight - 145 - 278
      this.deviceHeight = this.regType === 1 ? window.innerHeight - 145 - 155 : window.innerHeight - 145 - 134
      if (this.form.projectCode) {
        this.handleProjectChange(this.form)
      }
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = this.regType === 1 ? window.innerHeight - 145 - 278 : window.innerHeight - 145 - 278
      this.deviceHeight = this.regType === 1 ? window.innerHeight - 145 - 155 : window.innerHeight - 145 - 134
    }
  },
  methods: {
    checkPermission,
    tsFn(fn) {
      if (this.operArr.length > 0) {
        this.$confirm('当前的审批还未提交，切换将会放弃本次审批操作,确定切换吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.operArr = []
          fn()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消切换',
            showClose: true
          })
        })
      } else {
        fn()
      }
    },
    tabClick(key) {
      const tabchange = () => {
        this.regType = key
        this.resetQuery()
        this.form.pointCode = ''
        this.log_info = {
          status: '',
          userID: '',
          userName: '',
          updateTime: '',
          remark: ''
        }
        this.isStatus = '0'
      }
      this.tsFn(tabchange)
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.id })
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
    },
    async getAreaList() {
      try {
        var req = {
          project_code: this.form.projectCode
        }
        const { data, code, message } = await this.$pub.post('/point/manage/area-list', req)
        if (code === 200) {
          this.areaList = data || []
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
    },
    async getProjectsList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (code === 200 && data !== null) {
        this.projectList = data
      } else {
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    handleProjectChange(val) {
      if (val) {
        const changeProject = () => {
          this.form.projectCode = val.projectCode
          this.form.id = val.id
          this.form.pointCode = ''
          this.tagList = []
          this.childList = []
          this.areaList = []
          this.BuilderList = []
          this.form.dept_id = ''
          this.form.tag = ''
          this.form.child = null
          this.form.area = null

          this.resetQuery()
          this.getTagList()

          if (this.regType === 2) {
            this.getBuilderList()
          }
          if (this.regType === 1) {
            this.getChildList()
            this.getAreaList()
          }
          this.handlePointChange()
          this.getStatusCount()
        }
        changeProject()
        // this.tsFn(changeProject)
      }
    },
    resetQuery() {
      this.page.page_no = 1
      this.total = 0
      this.currentPoint = null
      this.currentStage = null
      // 清空，点位列表
      this.pointTableData = []

      // 清空工序
      this.procLists = []
      this.operArr = []
      // 清空物料清单,阶段信息
      this.deviceLists = []
      this.stage_list = []
      this.log_info = {
        status: '',
        userID: '',
        userName: '',
        updateTime: ''
      }
      this.status_info = []
      this.status = false
    },
    handlePointChange(val) {
      if (!this.form.projectCode) {
        this.$message({
          type: 'error',
          message: '请选择项目',
          showClose: true
        })
        this.form.pointCode = ''
        return
      }
      this.resetQuery()
      this.getPointList()
      this.getStatusCount()
    },
    handleSelectChange() {
      if (!this.form.projectCode) {
        this.$message({
          type: 'error',
          message: '请选择项目',
          showClose: true
        })
        this.form.pointCode = ''
        return
      }
      this.resetQuery()
      this.getPointList()
      this.getStatusCount()
    },

    inputChangePoint() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const self = this
      this.timer = setTimeout(function () {
        self.timer = null
        self.handlePointChange()
      }, 500)
    },
    async getTagList() {
      const params = {
        projectCode: this.form.projectCode
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', params)
      if (code === 200) {
        this.tagList = data || []
      } else {
        this.tagList = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    async getBuilderList() {
      var req = {
        project_code: this.form.projectCode
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.BuilderList = result.data
        }
      } else {
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
    },
    async getPointList() {
      this.operArr = []
      this.tableLoading = true
      const params = {
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode

      }
      const param = Object.assign({
        status: this.form.status,
        child_array: this.form.child,
        area_array: this.form.area
      }, params)
      const build_param = Object.assign({
        has_new: this.form.hasNew,
        dept_id: this.form.dept_id ? this.form.dept_id : 0,
        begin_time: this.form.phototime ? this.form.phototime[0] : '',
        end_time: this.form.phototime ? this.form.phototime[1] : ''
      }, params)
      const { data, code, message } = this.regType === 2 ? await this.$pub.post('/device/build-point-list', build_param) : await this.$pub.post('/device/design-point-list', param)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取点位列表失败',
          showClose: true
        })
        return
      }
      this.pointTableData = data.list ? data.list : []
      this.total = data.total
      this.tableLoading = false
      // if (!this.pointTableData[0]) return
      // this.currentClick(this.pointTableData[0])
      // this.$refs.multipleTable.setCurrentRow(this.pointTableData[0])
    },
    tableRowClassName ({ row }) {
      return this.currentPoint && row.pointCode === this.currentPoint.pointCode ? 'current-row' : ''
    },
    currentClick(row) {
      if (!row || (this.currentPoint && this.currentPoint.pointCode === row.pointCode)) {
        return
      }

      const changePoint = () => {
        this.currentPoint = row
        this.centerLoading = true
        this.activeClassName = null
        this.status = false
        this.procLists = []
        this.currentStage = null

        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode
        }
        if (this.regType === 2) {
          this.child = '-1'
          /* 0全部
            1初审未审核
            2终审未审核
            3全部未审核
          */
          const isStatus = this.isStatus === '0' ? '0' : this.first && this.second ? '3' : this.first ? '1' : this.second ? '2' : '0'
          // 中间图表列表
          this.$pub.post('/point/proc_submit_web_list', { ...params, isStatus }).then(res => {
            (res.data || []).forEach(f => {
              (f.procList || []).forEach(k => {
                (k.pointList || []).map(m => {
                  m.transfer = false // 是否展示迁移checkbox
                  const tempObj = {
                    attach_list: m.attachmentList.map(s => {
                      return {
                        audit: s.audit,
                        file_path: s.filePath,
                        file_path_thumb: s.filePathThumb,
                        image_id: s.id,
                        submit: s.submit,
                        create_time: s.updateTime,
                        isTransfer: 0,
                        ...s
                      }
                    }),
                    proc_code: k.procCode,
                    proc_name: k.procName
                  }
                  Object.assign(m, tempObj)
                  return m
                })
                k.proc_code = k.procCode
                k.proc_name = k.procName
              })
              this.procLists.push({
                class_name: f.className,
                class_code: f.classCode,
                proc_list: f.procList
              })
            })
            // this.procLists = res.data?res.data:[]
            this.activeClassName = this.procLists[0] ? this.procLists[0].class_name : ''
            this.centerLoading = false
          })
          // 右侧信息
          this.getRightDeviceList()
        } else {
          // this.child = this.currentPoint.childCode
          this.child = '-1'
          // 中间图表列表
          this.$pub.post('/device/design-point-photo-list', params).then(res => {
            (res.data || []).forEach(f => {
              (f.proc_list || []).map(k => {
                k.pointList = [{
                  attach_list: k.attach_list,
                  proc_code: k.proc_code,
                  proc_name: k.proc_name
                }]
                delete k.attach_list
                return k
              })
              this.procLists.push(f)
            })
            // this.procLists = res.data?res.data:[]
            this.activeClassName = this.procLists[0] ? this.procLists[0].class_name : ''
            this.centerLoading = false
          })
          // 右侧信息
          this.getRightDeviceList()
        }
      }
      this.tsFn(changePoint)
    },
    getRightDeviceList() {
      // 获取最右侧信息
      this.devloading = true
      if (this.regType === 1) {
        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode,
          child_code: this.child,
          stage_code: this.currentStage ? this.currentStage.stage_code : ''
        }
        this.$pub.post('/device/design-reg-info', params).then(res => {
          try {
            this.deviceLists = res.data.device_list ? res.data.device_list : []
            this.log_info = res.data.log_info ? res.data.log_info : {
              status: '',
              userID: '',
              userName: '',
              updateTime: '',
              remark: ''
            }
            this.status = this.log_info.status === 2
            const arr = res.data.stage_list || []
            arr.unshift(this.stage_0)
            arr.push(this.stage_t)
            this.stage_list = arr.map(m => {
              return {
                ...m,
                color: m.status === 3 ? 'blue' : m.status === 2 ? 'green' : '#606266'
              }
            })
            this.devloading = false
          } catch (err) {
            this.devloading = false
          }
        })
      } else {
        const params = {
          project_code: this.form.projectCode,
          point_code: this.currentPoint.pointCode,
          stage_code: this.currentStage ? this.currentStage.stage_code : ''
        }
        this.$pub.post('/device/build-reg-info', params).then(res => {
          try {
            this.deviceLists = res.data.device_list ? res.data.device_list : []
            this.log_info = res.data.log_info ? res.data.log_info : {
              status: '',
              userID: '',
              userName: '',
              updateTime: '',
              remark: ''
            }
            this.status_info = res.data.status_info ? res.data.status_info.map(m => m.status) : []
            const arr = res.data.stage_list || []
            arr.unshift(this.stage_0_2)
            arr.push(this.stage_t)
            this.stage_list = arr.map(m => {
              return {
                ...m,
                checked: m.status === 3, // 选中
                color: m.status === 3 ? 'blue' : m.status === 2 ? 'green' : '#606266',
                disabled: (m.status === 3) && this.checkPermission(['logisticsRegister:examine']) ? false : ((m.status !== 2) || (!this.checkPermission(['logisticsRegister:examine_f'])))// 是否可以操作终审
              }
            })
            this.devloading = false
          } catch (err) {
            this.devloading = false
          }
        })
      }
    },
    pageChange(num) {
      this.page.page_no = num
      this.getPointList()
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
    statusFormat (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    changeInput(row, type) {
      const pattern = /^[1-9][0-9]*$/ // 正整数的正则表达式
      // 不符合正整数时
      if (!pattern.test(this.num)) {
        // input 框绑定的内容为空
        row[type] = 0
      }
    },
    valiAnzhuangNum(val, i) {
      const reg = /[^\d]/g
      const regNums = val.regNums
      const finishNums = val.finishNums
      if (reg.test(finishNums)) {
        val.error = '安装数量必须数字'
      } else if (Number(finishNums) > regNums) {
        val.error = '安装数量不能大于设计数量'
      } else {
        val.error = ''
      }
      this.$set(this.deviceLists, i, val)
    },
    async saveData() {
      if (!this.currentPoint) return
      const status = this.status ? 2 : this.log_info.status === 0 ? 0 : 1
      const devices = this.deviceLists.filter(f => this.regType === 1 ? !(f.regNums <= 0 && f.status === 0) : !(f.finishNums <= 0 && f.status === 0))
      let flag = true
      if (this.regType === 2) {
        devices.some(s => {
          if (s.error) {
            flag = false
            return true
          }
        })
      }
      if (this.regType === 2 && !flag) {
        this.$message({
          type: 'error',
          message: '当前物料表有错，请修改后再保存',
          showClose: true
        })
        return
      }
      // 登记时安装数量=设计数量 status传2；安装数量小于设计数量 status传1，前提是this.deviceLists过滤掉status为0并且安装数量为0的物料
      const isStatus = (status, regNums, finishNums) => {
        let _status = status
        if (regNums === finishNums) {
          _status = '2'
        } else if (regNums > finishNums) {
          _status = '1'
        }
        return _status
      }
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        user_id: Number(this.$store.state.userInfo.id),
        status: this.regType === 1 ? status : null,
        reg_type: this.regType,
        devices: devices.map(m => {
          return {
            device_id: Number(m.id),
            reg_nums: this.regType === 1 ? Number(m.regNums) : Number(m.finishNums),
            status: this.regType === 1 ? String(m.status) : isStatus(String(m.status), Number(m.regNums), Number(m.finishNums))
          }
        }),
        build_status: this.status_info.join(','),
        remark: this.log_info.remark
      }
      const { code } = await this.$pub.post('/device/save-reg-info', params)
      if (code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功',
          showClose: true
        })// 成功后刷新左侧列表点位
        this.getRightDeviceList()
        // this.resetQuery()
        // this.handlePointChange()
        // this.log_info = {
        //   status: '',
        //   userID: '',
        //   userName: '',
        //   updateTime: '',
        //   remark: ''
        // }
      } else {
        this.$message({
          type: 'error',
          message: '保存失败',
          showClose: true
        })
      }
    },
    async buildStatusChange(val) {
      this.devloading = true
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        stage_code: val ? val.stage_code : '',
        status: val.checked ? '3' : '2',
        user_id: Number(this.$store.state.userInfo.id)
      }
      const { code } = await this.$pub.post('device/stage/submit', params)
      if (code === 200) {
        this.$message.success('操作成功')
        this.currentStage = null
        this.getRightDeviceList()
      } else {
        val.checked = false
        this.$message.error('操作失败')
      }
      this.devloading = false
    },
    clickStage(i) {
      this.currentStage = i
      this.getRightDeviceList()
    },
    changeImgAudit(img, proc_code) {
      const ids = this.operArr.map(m => m.image_id)
      img.proc_code = proc_code
      if (ids.includes(img.image_id)) {
        this.operArr.forEach(f => {
          if (f.image_id === img.image_id) {
            f.num = img.num
          }
        })
      } else {
        this.operArr.push(img)
      }
    },
    async plsp () {
      if (this.operArr.length <= 0) return
      // 1初审通过 3终审通过 4终审未通过   0未审核2初审未通过
      const agree = []// 初审通过集合
      const dis_agree = [] // 初审不通过集合
      const agree_again = []// 终审通过集合
      const dis_agree_again = []// 终审不通过集合

      let design_audit_type = '0'

      this.operArr.forEach(f => {
        if (this.first && this.second) { // 有终审 和 初审权限的
          if (f.num) { // num为true是通过
            (f.audit === 1 || f.audit === 3 || f.audit === 4)
              ? agree_again.push(f.image_id)
              : agree.push(f.image_id)
          } else { // num为false是不通过
            (f.audit === 1 || f.audit === 3 || f.audit === 4)
              ? dis_agree_again.push(f.image_id)
              : dis_agree.push(f.image_id)
          }
        } else if (this.first) { // 只有初审权限的,不管状态都是 ：初审通过agree或者初审不通过dis_agree
          if (f.num) { // num为true是通过
            agree.push(f.image_id)
          } else { // num为false是不通过
            dis_agree.push(f.image_id)
          }
        } else { // 只有终审权限的，上面template里面展示已经限制只有1初审通过 3终审通过 4终审未通过才能出现终审按钮，所以不管状态都是 ：终审通过agree_again或者终审不通过dis_agree_again
          if (f.num) { // num为true是通过
            agree_again.push(f.image_id)
          } else { // num为false是不通过
            dis_agree_again.push(f.image_id)
          }
        }

        /*
          1.初始值design_audit_type = 0
          2.如果审核深化设计照片初审通过 design_audit_type = 1
          3.如果审核深化设计照片初审未通过 design_audit_type = 2
          4.如果存在多张深化设计照片，以初审通过为准 design_audit_type = 1
        */
        if (design_audit_type !== '1' && f.proc_code === 'CLS000-04') { // 深化设计并且还不是1，防止多张照片
          if (f.num && (f.audit === 0 || f.audit === 2)) { // 如果审核深化设计照片初审通过 design_audit_type = 1
            design_audit_type = '1'
          } else if (!f.num && (f.audit === 0 || f.audit === 2)) { // 如果审核深化设计照片初审未通过 design_audit_type = 2
            design_audit_type = '2'
          }
        }
      })
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        audit_level: '1',
        user_id: this.$store.state.userInfo.id,
        user_name: this.$store.state.userInfo.userName,
        agree: agree.join(','), // 初审通过集合
        dis_agree: dis_agree.join(','), // 初审不通过集合
        agree_again: agree_again.join(','), // 终审通过集合
        dis_agree_again: dis_agree_again.join(','), // 终审不通过集合
        design_audit_type
      }
      console.log(params)
      const { code, message } = await this.$pub.post('/audit/proc-audit', params)
      if (code === 200) {
        this.$message.success('处理成功')
        if (this.regType === 1) {
          this.refresh()
        } else {
          this.refreshCenter()
        }
        this.operArr = []
      } else {
        this.$message({
          type: 'error',
          message: message || '处理失败',
          showClose: true
        })
      }
    },
    // 深化设计
    refresh() {
      this.centerLoading = true
      this.activeClassName = null
      this.procLists = []
      const params = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      // 中间图表列表
      this.$pub.post('/device/design-point-photo-list', params).then(res => {
        if (res.code === 200) {
          (res.data || []).forEach(f => {
            (f.proc_list || []).map(k => {
              k.pointList = [{
                attach_list: k.attach_list,
                proc_code: k.proc_code,
                proc_name: k.proc_name
              }]
              delete k.attach_list
              return k
            })
            this.procLists.push(f)
          })
          // this.procLists = res.data?res.data:[]
          this.activeClassName = this.procLists[0] ? this.procLists[0].class_name : ''
          this.centerLoading = false
        } else {
          this.centerLoading = false
          this.procLists = []
          this.$message({
            type: 'error',
            message: '获取工序列表出错了',
            showClose: true
          })
        }
      })
    },
    // 施工登记
    refreshCenter() {
      this.centerLoading = true
      this.transCurrentPintDirect = null
      /* 0全部
        1初审未审核
        2终审未审核
        3全部未审核
      */
      const isStatus = this.isStatus === '0' ? '0' : this.first && this.second ? '3' : this.first ? '1' : this.second ? '2' : '0'
      const obj = {
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode,
        isStatus
      }
      this.$pub.post('/point/proc_submit_web_list', obj).then(res => {
        if (res.code === 200) {
          this.procLists = [];
          (res.data || []).forEach(f => {
            (f.procList || []).forEach(k => {
              (k.pointList || []).map(m => {
                m.transfer = false // 是否展示迁移checkbox
                const tempObj = {
                  attach_list: m.attachmentList.map(s => {
                    return {
                      audit: s.audit,
                      file_path: s.filePath,
                      file_path_thumb: s.filePathThumb,
                      image_id: s.id,
                      submit: s.submit,
                      create_time: s.updateTime,
                      isTransfer: 0,
                      ...s
                    }
                  }),
                  proc_code: k.procCode,
                  proc_name: k.procName
                }
                Object.assign(m, tempObj)
                return m
              })
              k.proc_code = k.procCode
              k.proc_name = k.procName
            })
            this.procLists.push({
              class_name: f.className,
              class_code: f.classCode,
              proc_list: f.procList
            })
          })
          this.centerLoading = false
        } else {
          this.centerLoading = false
          this.procLists = []
          this.$message({
            type: 'error',
            message: '获取工序列表出错了',
            showClose: true
          })
        }
      })
    },
    changeIsList(isStatus) {
      const changeStatus = () => {
        this.isStatus = isStatus
        // 获取列表
        this.refreshCenter()
      }
      this.tsFn(changeStatus)
    },
    async getStatusCount() {
      const params = {
        page_no: 1,
        page_size: 1,
        project_code: this.form.projectCode,
        tag: this.form.tag,
        point_name: this.form.pointCode
      }
      const param = Object.assign({
        status: 0,
        child_array: this.form.child,
        area_array: this.form.area
      }, params)// status随便传啥
      const build_param = Object.assign({
        has_new: 0,
        dept_id: this.form.dept_id ? this.form.dept_id : 0,
        begin_time: this.form.phototime ? this.form.phototime[0] : '',
        end_time: this.form.phototime ? this.form.phototime[1] : ''
      }, params)// has_new随便传啥
      const { data, code, message } = this.regType === 2 ? await this.$pub.post('/device/build-point-count', build_param) : await this.$pub.post('/device/design-point-count', param)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取状态对应合计数据出错了',
          showClose: true
        })
      }
      if (this.regType === 2) { // 施工登记的待审
        this.hasNewList[0].count = data.no_audit
      } else {
        this.statusList.forEach(f => {
          if (f.dict_value === 0) { // 深化设计的未登记
            f.count = data.no_reg
          } else { // 深化设计的已登记
            f.count = data.reg
          }
        })
      }
    },
    initPhotoSphere(name, img) {
      this.photoSphereName = name
      this.photoSphereVisible = true
      if (this.viewer) {
        this.viewer.destroy()
      }
      // console.log(img)
      // img = img.replace('http://36.133.34.40:82/', '')
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
    materSetting(img, proc) {
      this.currentSettingImg = img
      this.currentSettingImg.proc_code = proc.procCode
      this.settingMaterFlag = true
      console.log(this.currentSettingImg)
    },
    // 迁移 start
    showTransfer(pointDirect, flag) {
      if (this.transCurrentPintDirect) { // 还原之前的
        this.transCurrentPintDirect.transfer = false
        this.transCurrentPintDirect.attach_list.map(m => {
          m.isTransfer = 0
        })
      }
      this.transCurrentPintDirect = pointDirect
      pointDirect.transfer = flag
      if (!flag) {
        pointDirect.attach_list.map(m => {
          m.isTransfer = 0
        })
      }
      // this.procLists.forEach(f => {

      // })
    },
    sureTransfer(proc, pointDirect) {
      const { proc_code, proc_name } = proc
      this.transferData = {
        proc_code,
        proc_name,
        direction: pointDirect.direction,
        project_code: this.form.projectCode,
        point_code: this.currentPoint.pointCode
      }
      this.transferData.images = []
      pointDirect.attach_list.map(m => {
        if (m.isTransfer === 1) {
          this.transferData.images.push(m)
        }
      })

      if (this.transferData.images.length > 0) {
        this.showAllProc = true
      } else {
        this.$message({
          message: '必须选中照片才可以迁移',
          type: 'error',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
    }
    // 迁移end
  }
}
</script>

<style lang="scss">
.clover_logreg_container{
  display: flex;
  /* justify-content: space-between; */
  height:100%;
  width:100%;
  box-sizing: border-box;
  background:#fff;
  padding:20px;
  .cloverLeft{
    width: 90px;
    height:100%;
    border-right: 1px solid #ccc;
  }
  .cloverLeft li{
    margin-bottom: 20px;
    font-size:16px;
    font-weight:550;
    cursor: pointer;
  }
  .searchPoint{
    width:350px;
    border-bottom: 1px solid #ccc;
     .el-pagination--small{
      border:0;
      border-top: 1px solid #ccc;
    }
  }
  .searchPoint .el-radio {
    margin-right:15 px;
  }
  .searchPoint .el-radio__label {
    padding-left:0;
    font-size:13px;
  }
  .searchPoint .el-form-item{
    margin-bottom:10px;
  }
  .tableWrap {
    /* margin-top:20px; */
  }
  .tableWrap .el-table__body tr.current-row>td{
    background:rgb(68, 120, 241);
    color:#fff;
  }
  .rightWrap{
    width: calc(100% - 440px);
    display:flex;
    justify-content: space-between;
    // height: calc(100% - 20px);
    height:100%;
  }
  .rightWrap .clover_wrap{
    height:100%;
    overflow: auto;
    margin-top:10px;
  }
  .rightWrap .box{
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 0;
    margin-right: 10px;
    .box_img{
      width:140px;
      position: relative;
      border:1px solid #eee;
      height: 140px;
      img{
        width: 140px;
        height: 140px;
      }
    }
    .sett{
      position:absolute;
      top: -30px;
      left: -30px;
      width: 60px;
      height:60px;
      border-radius: 50%;
      background: #fff;
      font-size:18px;
      cursor:pointer;
      .el-icon-setting{
        position:absolute;
        top: 34px;
        left: 33px;
        color:#000;
      }
    }
    .check{
      position: absolute;
      top: 118px;
      right:0px;
      .el-checkbox__inner{
        width:20px;
        height:20px;
        &:after{
          height: 10px;
          width: 3px;
          left:8px;
          top:2px;
        }
      }
    }
    .user{
      width:100%;
      display: flex;
      justify-content: space-around;
      margin-top:4px;
    }
  }
  .rightWrap .clover_proc-main{
    width: 40%;
    /* margin-right:20px; */
    border-left: 1px solid #ccc;
    padding:10px 10px 0;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
  }
  .clover_device-main{
    width: 60%;
    border-left: 1px solid #ccc;
    // padding:10px;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }
  .clover_proc-main .wrap{
    height:calc(100% - 34px);
    overflow: auto;
    >.el-collapse{
      border-top: none;
    }
  }
  .clover_proc-main .moreText{
    width:100%;
    // margin-bottom:10px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #EBEEF5
  }
  .clover_proc-main .moreText .tit{
    display:inline-block;
    width:calc(100% - 190px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 32px;
  }
  .clover_proc-main .moreText .el-button{
    padding: 6px 15px;
  }
  .clover_proc-main .moreText .spbtn{
    cursor:pointer;
    margin-left:6px;
    padding: 9px 15px;
  }
  .clover_proc-main .moreText i{
    cursor:pointer;
    font-size: 18px;
  }
  .clover_proc-main .el-collapse-item__header{
    font-size:16px;
    font-weight:550;
  }
  .clover_proc-main .subtitle{
    color: #409eff;
    display:block;
    display:flex;
    align-items:center;
    margin-bottom: 10px;
  }
  .clover_proc-main .dir{
    display: flex;
    align-items: center;
  }
  .clover_device-main ._top{
    display:flex;
    align-items: center;
  }
  .clover_device-main ._top .statusText{
    padding:2px 6px;
    background:#70B617;
    border-radius:2px;
    color:#fff;
    margin-left:8px;
    font-size:12px;
  }
  .clover_device-main .sub{
    margin-top:10px;
    .info{
      padding:0;
    }
  }
  .clover_device-main .opear{
    margin-top:10px;
    display:flex;
    align-items: center;
    justify-content: space-between;
  }
  .clover_device-main .opear .el-checkbox__label{
    font-size:16px;
    color:#000;
  }
  .clover_device-main .info{
    display:flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    color:#848484;
    font-weight:500;
    margin-top:10px;
    font-size:14px;
  }
  .clover_device-main .deviceTable{
    width:100%;
    .noFinish{
      .el-input__inner{
        color:#f40;
      }
    }
    .isWeight{
      font-weight:700;
    }
  }
  .clover_device-main .deviceTable .el-input__inner{
    padding: 0 5px;
    border-radius:0;
    height:30px;
    line-height:30px;
  }
  .clover_device-main .deviceTable thead{
    color:#000;
  }
  .clover_device-main .checkGroupself{
    margin-top:15px;
    // margin-left:10px;
    border-left: 1px solid #ccc;
    .el-checkboxs.isSelect{
      border-bottom:1px solid #4478f1;
      .isLine{
        &:before{
          border:1px solid #4478f1;
          background: #4478f1;
        }
      }
    }
    .el-checkboxs{
      border-bottom:1px solid transparent;
       margin-left: 10px;
      .isLine{
        padding:4px 6px 4px 2px;
        font-size: 14px;
        cursor: pointer;
        margin-left:4px;
        &:before{
          width:1px;
          height:10px;
          display:inline-block;
          border:1px solid transparent;
          content:'';
          vertical-align: middle;
          margin-right:4px;
        }
      }
    }
  }
  .clover_device-main .checkGroupself .el-checkboxs{
    margin-right:0px;
    margin-bottom:4px;
    display: flex;
    align-items: center;
    &:hover{
      .isLine{
        background:rgb(209, 230, 247);
      }
    }
  }
  .clover_device-main .checkGroupself .el-checkbox__label{
    padding-left:4px;
    display: none;
  }
  .nodata{
    width: 100%;
    text-align:center;
  }
  .imgRadio .el-radio:first-child{
    margin-right:15px;
  }
  .remarktitle {
    font-family: "Microsoft YaHei", "微软雅黑";
    display: block;
    font-size: 14px;
    color: red;
    width:100%;
    text-align:left;
    margin-top:10px;
  }
  .remarkRow{
    width:100%;
    text-align:left;
    margin-bottom:10px;
  }
}
</style>
<style lang="scss">
.clover_logreg_container{
  .more {
    text-overflow: ellipsis;
    overflow: hidden;
    width:auto !important;
    white-space: nowrap;
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
  .el-input__inner {
      border-radius: 0px !important;
      height: 30px !important;
      line-height: 30px !important;
  }
  .tableWrap td{
    cursor: pointer;
  }
  .dir :nth-child(3){
    margin-left:10px;
  }
  .img_wrap{
    height:21px;
    display: flex;
    align-items: center;
    border:1px solid #EBEEF5;
    padding: 0 10px;
    cursor: pointer;
  }
  .img{
    cursor: pointer;
    margin-right:5px;
  }
}

</style>
