<template>
  <div class="point_seting">
    <el-form size="small"  :inline="true" :rules="rules" :model="form"   label-width="40px">
      <el-form-item label="项目">
        <el-select
          v-model="form.project"
          width="200px;"
          placeholder="请选择"
          @change="handleProjectChange"
          value-key="id"
        >
          <el-option
            v-for="item in projectList"
            :key="item.projectCode"
            :label="item.projectName"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位">
        <el-input v-model="form.point_code"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <span class="iconfont icon-gaojichaxun" @click="toggleGJsearch"></span>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" >重置</el-button>
      <div style="float:right;">
        <el-button type="primary" size="small" @click="materialTable" v-hasPermi="['points:MaterialStatistics']">物料统计</el-button>
        <el-button type="primary" size="small" @click="addPoint" v-hasPermi="['points:add']">新增点位</el-button>
        <el-button size="small" @click="importExcel" :loading="importLoading" v-hasPermi="['points:imp']">导入</el-button>
        <el-button size="small" @click="exportSel" :loading="exportLoading" v-if="form.project_code">导出</el-button>
      </div>
    </el-form>
    <!-- 高级查询区 -->
    <div class="gSearch" v-if="isGJsearch">
      <div class="wrap">
        <h5>子系统:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="child.isIndeterminate" v-model="child.checkAll" @change="(val)=>handleCheckAllChange(val,'child')">全选</el-checkbox>
          <el-checkbox-group v-model="child.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'child')">
            <el-checkbox v-for="item in child.list" :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap">
        <h5>区域:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="area.isIndeterminate" v-model="area.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'area')">全选</el-checkbox>
          <el-checkbox-group v-model="area.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'area')">
            <el-checkbox v-for="(item,i) in area.list" :label="item" :key="i">{{item}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap">
        <h5>来源:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="origin.isIndeterminate" v-model="origin.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'origin')">全选</el-checkbox>
          <el-checkbox-group v-model="origin.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'origin')">
            <el-checkbox v-for="item in origin.list" :label="item.origin" :key="item.origin">{{item.origin_name}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap">
        <h5>状态:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="status.isIndeterminate" v-model="status.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'status')">全选</el-checkbox>
          <el-checkbox-group v-model="status.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'status')">
            <el-checkbox v-for="item in status.list" :label="item.status" :key="item.status">{{item.status_name}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap">
        <h5>标签:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="tag.isIndeterminate" v-model="tag.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'tag')">全选</el-checkbox>
          <el-checkbox-group v-model="tag.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'tag')">
            <el-checkbox v-for="item in tag.list" :label="item" :key="item">{{item}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <!-- 列表table -->
    <el-table :data="pointData" :height="isGJsearch?tableHeight-198:tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="point_code" label="点位编码" min-width="120px"></el-table-column>
      <el-table-column  prop="point_name" label="点位名称" min-width="220px">
        <template slot-scope="scope">
          <i class="el-icon-edit" @click="editPointName(scope.row)" style="cursor:pointer;" v-hasPermi="['points:nameEdit']"></i>
          <a href="javascript:void(0)" class="cursor"  @click="showInfoDrawer(scope.row)">{{scope.row.point_name}}</a>
        </template>
      </el-table-column>
      <el-table-column prop="lng_lat" label="经纬度" width="280px" >
        <template slot-scope="scope">
          <div v-if="scope.row.lng_lat" :style="{color:scope.row.isValidate?'#D9001B':'' }">
            <span class="cursor" @click="lnglatClick(scope.row)" :id="'copy'+scope.row.point_code">{{scope.row.lng_lat}}</span>
            <i class="el-icon-document-copy opera" @click="copyM(scope.row)"></i>
            <i class="el-icon-edit opera" @click="editM(scope.row)" v-hasPermi="['points:coorEdit']"></i>
          </div>
          <span v-else class="cursor" >
            <span @click="lnglatClick(scope.row)">无经纬度</span>
            <i class="el-icon-edit opera" @click="editM(scope.row)" v-hasPermi="['points:coorEdit']"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column  prop="distance" label="点位偏离" align="center" width="100px">
        <template slot-scope="scope">
          <span :style="{color: scope.row.distance>=500?'#D9001B':''}">{{scope.row.distance>=500?(scope.row.distance/1000)+'公里' : scope.row.distance + '米'}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="relation_count" label="方向数" width="80px" align="center">
        <template slot-scope="scope">
          <span class="cursor" style="padding:4px;" @click="directNumClick(scope.row)">{{scope.row.relation_count}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="child_name" label="子系统" min-width="120px">
        <template slot-scope="scope">
          <span class="cursor" @click="manyClick(scope.row, 'child_code')">{{scope.row.child_name}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="area" label="区域" min-width="100px" align="center">
        <template slot-scope="scope">
          <span class="cursor" @click="showAreaDiao(scope.row)">{{scope.row.area}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="origin" label="来源" align="center" min-width="120px">
        <template slot-scope="scope">
          <span class="cursor" @click="manyClick(scope.row, 'origin')" :style="{color: originColor(scope.row.origin),padding:'4px'}">{{selectOriginLabel(origin.list, scope.row.origin)}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="status" label="状态" align="center" min-width="120px">
        <template slot-scope="scope">
          <span class="cursor" @click="manyClick(scope.row, 'status')" :style="{color: statusColor(scope.row.status),padding:'4px'}">{{selectDictLabel(status.list, scope.row.status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100px">
        <template slot-scope="scope">
          <span class="cursor" style="margin-right:10px;" @click="deletePoint(scope.row)" v-hasPermi="['points:del']">删除</span>
          <span class="cursor" @click="showInfoDrawer(scope.row)">详情</span>
        </template>
      </el-table-column>
    </el-table>
    <div  style="display:flex;justify-content:space-between;">
      <span  style="color:#999;font-size:14px;">共 {{total}} 条记录</span>
      <el-pagination
        layout="prev, pager, next,sizes"
        :total="total"
        :page-size.sync="page.page_size"
        @current-change="pageChange"
        @size-change="sizeChange"
        :current-page.sync="page.page_no"
        class="pagination"
        small
        background
      >
      </el-pagination>
    </div>

    <!-- 新增点位 -->
    <el-drawer
      title="新增点位"
      :visible.sync="addShow"
      size="90%"
    >
      <add-point @handleQuery="handleQuery" v-if="addShow" :currentProject = "form.project"></add-point>
    </el-drawer>
    <!-- 编辑点位经纬度 -->
    <el-drawer
      title="修改经纬度"
      :visible.sync="editLnglatShow"
      size="90%"
    >
      <edit-lng-lat :editLnglatShow.sync="editLnglatShow" @handleQuery="handleQuery" :currentRow="currentp" :project_code="form.project_code" v-if="editLnglatShow"></edit-lng-lat>
    </el-drawer>
    <!-- 导入 -->
    <el-drawer
      title="导入点位"
      :visible.sync="importTable"
      :append-to-body="true"
      custom-class="importCl"
      :before-close="cancleImport"
    >
      <import-table ref="importEx" v-if="importTable" :project_code="form.project_code" :projectList="projectList" :statusList="status.list"></import-table>
    </el-drawer>
    <!-- 点击经纬度 -->
    <el-dialog
      :visible.sync="showLngLat"
      width="70%"
      :footer="false"
      top="2vh"
    >
      <lnglat :pointInfo="currentp"  :project_code="form.project_code" v-if="showLngLat">></lnglat>
    </el-dialog>
    <!-- 点击方向数 -->
    <el-dialog
      :visible.sync="showdirectNums"
      :footer="false"
      width="900px"
      title="方向位置"
      :before-close="handleCloseDirect"
    >
     <direct :pointInfo="currentp"  v-if="showdirectNums" :project_code="form.project_code" ></direct>
    </el-dialog>
    <!-- 点击子系统 来源 状态 -->
    <el-dialog
      :visible.sync="showMany"
      :footer="false"
      :title="click.title"
      width="40%"
    >
     <pubContainer
      ref="pubcontainer"
      v-if="showMany"
      :title="click.title"
      :pointInfo="currentp"
      :list="click.list"
      :project_code="form.project_code"
      :label="click.label"
      :value="click.value"
      :type="click.type"
      :permission="permission"
      @sureChange="sureChange"></pubContainer>
    </el-dialog>
    <!-- 点击区域 -->
    <el-dialog
      :visible.sync="showArea"
      :footer="false"
      title="区域"
    >
     <areaContainer v-if="showArea"  :pointInfo="currentp" :areaList="area.list" :project_code="form.project_code" @changeshowArea="changeshowArea"></areaContainer>
    </el-dialog>
    <!-- 点击详情 -->
    <el-drawer
      v-if="showInfo"
      title="点位建设详情"
      :visible.sync="showInfo"
      :append-to-body="true"
      custom-class="showInfo_wrap"
      size="90%"
      :destroy-on-close ="true"
    >
      <point-info  :pointInfo="currentp" :project_id="form.project_id" :project_code="form.project_code"></point-info>
    </el-drawer>
    <!-- 导出 -->
    <el-dialog
      custom-class="exportwraps"
      :visible.sync="showexport"
      :footer="false"
      title=""
    >
      <span style="margin-right:10px">坐标系:</span>
      <el-radio-group v-model="coordinate" >
        <el-radio  v-for="item in coordinateList"  :key="item.value" :label="item.value">{{item.label}}</el-radio>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="text" @click="exportcancel">取消</el-button>
        <el-button size="mini" :loading="exportLoading" type="primary" @click="exportExcel">确认</el-button>
      </div>
    </el-dialog>
    <!-- 施工队物料使用统计 -->
    <el-drawer
      title="施工队物料使用统计"
      :visible.sync="materialVisible"
      :append-to-body="true"
      :size="800"
    >
      <material-statistics
        v-if="materialVisible"
        :project="form.project"
        :projectList="projectList">
      </material-statistics>
    </el-drawer>
  </div>
</template>

<script>
import addPoint from './addPoint/index'
import importTable from './import'
import cellclick from './cellClick'
import lnglat from './lnglatInfo/index'
import direct from './directNums'
import pubContainer from './pubContainer'
import areaContainer from './areaContainer'
import pointInfo from './pointInfo'
import editLngLat from './editLngLat'
import MaterialStatistics from './MaterialStatistics'
import { downloadFile } from '@/utils/tool'
import config from '@/config/config.js'

export default {
  name: 'points',
  mixins: [cellclick],
  data () {
    return {
      form: {
        point_code: '',
        project: null,
        project_code: '',
        project_id: ''
      },
      rules: {
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      pointLoading: false,
      tableLoading: false,
      exportLoading: false,
      importLoading: false,
      projectList: [],
      pointData: [],
      tableHeight: window.innerHeight - 235,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      isGJsearch: false,
      child: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      area: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      status: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      origin: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      tag: {
        isIndeterminate: false,
        checkAll: false,
        list: [{ tag_code: 1, tag_name: '正常' }],
        checkedList: []
      },
      addShow: false,
      editLnglatShow: false,
      importTable: false,
      currentp: null,
      popoverStyle: {},
      showexport: false,
      coordinate: 0, // 坐标系
      coordinateList: [],
      materialVisible: false
    }
  },
  computed: {
  },
  created() {
    this.init()
    this.getStatusList()
    this.getOriginList()
    this.getDirectionList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 235
    }
  },
  components: {
    addPoint, importTable, lnglat, direct, pubContainer, areaContainer, pointInfo, editLngLat, MaterialStatistics
  },
  methods: {
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
    },
    handleProjectChange(val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id

      this.child.list = []
      this.area.list = []
      this.tag.list = []
      this.pointData = []

      this.resetSearch()

      this.getChildList()
      this.getAreaList()
      this.getTagList()
    },
    resetSearch() {
      this.form.point_code = ''
      Object.assign(this.child, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.area, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.status, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.origin, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.tag, { isIndeterminate: false, checkAll: false, checkedList: [] })
      this.handleQuery()
    },
    handleQuery() {
      this.page.page_no = 1
      this.getPointList()
    },
    async getPointList() {
      if (!this.form.project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.tableLoading = true
      const params = {
        child_array: this.child.checkedList,
        area_array: this.area.checkedList,
        status_array: this.status.checkedList,
        origin_array: this.origin.checkedList,
        tag_array: this.tag.checkedList,
        project_code: this.form.project_code,
        point_cond: this.form.point_code,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data, message } = await this.$pub.post('/point/manage/list', params)

      this.tableLoading = false
      if (code !== 200) {
        this.pointData = []
        this.total = 0
        return this.$message.error(message || '查询出错了')
      } else {
        this.pointData = (data.list || []).map(m => {
          if (m.lng_lat) {
            m.isValidate = this.validate(m)
          }
          return {
            ...m
          }
        })
        this.total = data.total
      }
    },
    validate(row) {
      let val = row.lng_lat.replace(/(\s*)|(\s*$)/g, '')
      val = val.replace('，', ',')
      let error = false
      if (val.indexOf(',') > -1 && val.indexOf(',') === val.lastIndexOf(',')) {
        const arrs = val.split(',')
        // 经度正则表达式:（-180 至 180） 纬度正则表达式(-90 至 90)
        var longrg = config.lng
        var latreg = config.lat

        // 中国经度：经度范围(73°33′E至135°05′E ，  73.33~135.05) 纬度范围(3°51′N至53°33′N ， 3.51~53.33)

        const lngBoolean = longrg.test(arrs[0])
        const latBoolean = latreg.test(arrs[1])
        if (!lngBoolean || !latBoolean) {
          error = true
        } else {
          error = false
        }
      } else {
        error = true
      }
      return error
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
        if (Number(code) === 200) {
          this.child.list = data || []
          if (data && data.length > 10) {
            this.popoverStyle = {
              height: '300px',
              overflowY: 'auto'
            }
          } else {
            this.popoverStyle = {}
          }
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
    async getAreaList() {
      try {
        var req = {
          project_code: this.form.project_code
        }
        const { data, code, message } = await this.$pub.post('/point/manage/area-list', req)
        if (Number(code) === 200) {
          this.area.list = data || []
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
    async getStatusList() {
      try {
        const req = { dict_label: 'point_status' }
        const { data, code, message } = await this.$pub.post('/sys/dict/list-slt', req)
        if (Number(code) === 200) {
          this.status.list = (data || []).map(m => {
            return {
              status: Number(m.value),
              status_name: m.label
            }
          })
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
    async getTagList() {
      const params = {
        projectCode: this.form.project_code
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', params)
      if (code === 200) {
        this.tag.list = data || []
      } else {
        this.tag.list = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    async getOriginList() {
      this.$dict(this, 'origin').then((res) => {
        if (res.code === 200) {
          this.origin.list = (res.data || []).map(m => {
            return {
              origin: Number(m.value),
              origin_name: m.label
            }
          })
        } else {
          this.$message.error('origin字典出错了')
          this.origin.list = []
        }
      })
    },
    selectDictLabel (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].status === (value)) {
          actions.push(datas[key].status_name)
          return false
        }
      })
      return actions.join('')
    },
    selectOriginLabel (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].origin === (value)) {
          actions.push(datas[key].origin_name)
          return false
        }
      })
      return actions.join('')
    },
    pageChange(num) {
      this.page.page_no = num
      this.getPointList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getPointList()
    },
    toggleGJsearch() {
      if (!this.form.project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.isGJsearch = !this.isGJsearch
      // if(!this.isGJsearch){
      //   Object.assign(this.child,{isIndeterminate: false,checkAll: false,checkedList: []});
      //   Object.assign(this.area,{isIndeterminate: false,checkAll: false,checkedList: []});
      //   Object.assign(this.status,{isIndeterminate: false,checkAll: false,checkedList: []});
      //   Object.assign(this.tag,{isIndeterminate: false,checkAll: false,checkedList: []});
      // }
    },
    // 全选start
    handleCheckAllChange(val, item) {
      if (val) {
        this[item].checkAll = true// 全选
        this[item].isIndeterminate = false// 半选
        let type = ''
        switch (item) {
          case 'child':
            type = 'key'
            break
          case 'status':
            type = 'status'
            break
          case 'origin':
            type = 'origin'
            break
          default:
            break
        };
        this[item].checkedList = this[item].list.map(m => {
          return m[type] !== undefined ? m[type] : m
        })
      } else {
        this[item].checkAll = false// 全选
        this[item].isIndeterminate = false// 半选
        this[item].checkedList = []
      }
    },
    handleCheckedCitiesChange(val, item) {
      const checkedCount = val.length
      this[item].checkAll = checkedCount === this[item].list.length
      this[item].isIndeterminate = checkedCount > 0 && checkedCount < this[item].list.length
    },
    // 全选end
    addPoint() {
      this.addShow = true
    },
    async getDirectionList() {
      this.$dict(this, 'GPS_TYPE').then((res) => {
        if (res.code === 200) {
          this.coordinateList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message.error('出错了GPS_TYPE')
          this.coordinateList = []
        }
      })
    },
    exportSel() {
      this.showexport = true
    },
    exportcancel() {
      this.showexport = false
      this.coordinate = 0
    },
    async exportExcel() {
      this.exportLoading = true
      const params = {
        project_code: this.form.project_code,
        child_array: this.child.checkedList,
        area_array: this.area.checkedList,
        status_array: this.status.checkedList,
        tag_array: this.tag.checkedList,
        point_cond: this.form.point_code,
        gps_type: this.coordinate
      }
      const result = await this.$pub.post(
        '/point/manage/export-points',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const val = this.coordinateList.find(f => f.value === this.coordinate)
      const type = val ? val.label + '坐标系' : ''
      const title = this.form.project_code + type + '点位列表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    },
    importExcel() {
      this.importTable = true
    },
    async cancleImport(done) {
      const file_name = this.$refs.importEx.file_name
      file_name && await this.$pub.post('/point/manage/import-init-del', { file_name })
      done()
    },
    statusColor(status) {
      let color = '#606266'
      switch (status) {
        case 0:
          color = '#87b1f7'
          break
        case 1:
          color = '#70B603'
          break
        case 2:
          color = '#f7b366'
          break
        case 3:
          color = '#eabaf5'
          break
        case 9:
          color = '#D9001B'
          break
      }
      return color
    },
    originColor(status) {
      let color = '#606266'
      switch (status) {
        case 0:
          color = '#87b1f7'
          break
        case 1:
          color = '#70B603'
          break
      }
      return color
    },
    handleCloseDirect(done) {
      this.handleQuery()
      done()
    },
    materialTable() {
      this.materialVisible = true
    }
  }
}
</script>

<style scoped lang="scss">
.point_seting{
  height: 100%;
  width:100%;
  background: #fff;
  padding: 20px 20px 0;
  box-sizing: border-box;
  .icon-gaojichaxun{
    line-height: 33px;
    cursor:pointer;
    padding: 0 10px;
    &:hover{
      color: #409EFF;
    }
  }
  .cursor{
    cursor: pointer;
    color:#409EFF;
    &:hover{
      color: #fff!important;
      background:#409EFF;
    }
  }
  .gSearch{
    border: 1px solid #eee;
    padding:10px 0 10px 40px;
    height:176px;
    overflow: auto;
    .wrap{
      display:flex;
      margin-bottom:15px;
      h5{
        width:60px;
      }
      .aside{
        flex:1;
        display:flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        >.el-checkbox{
          margin-right:30px;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.point_seting{
  // min-width: 1200px;
  overflow: auto;
  .el-form-item--small.el-form-item{
    margin-bottom:10px;
  }
  .el-table td, .el-table th{
    padding:4px 0;
  }
  .el-table{
    margin-top:20px;
  }
  .gSearch .el-checkbox{
    min-width: 150px;
  }
  i.opera{
    margin-left:4px;
    cursor: pointer;
    &:hover{
      color: #409eff;
    }
  }
}

.el-popover.clover_popover{
  min-width:20px;
  padding: 0;
  .status_click{
    transition: opacity 0.1s ease;
    li{
      padding:10px 14px;
      cursor: pointer;
      &:hover{
         background:#ecf1f5;
      }
    }
    li.selected{
      background:#c8def5;
    }
  }
}
.exportwraps{
  width:350px!important;
}
</style>
