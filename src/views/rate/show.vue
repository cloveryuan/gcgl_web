<template>
  <div class="rate_set">
    <el-form size="small"  :inline="true" :rules="rules" :model="form"   label-width="40px">
      <el-form-item label="项目">
        <el-select
          v-model="form.project"
          width="200px;"
          placeholder="请选择"
          value-key="id"
          @change="handleProjectChange"
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
        <el-input @keyup.enter.native="handleQuery" v-model="form.point_code"  clearable @clear="handleQuery"></el-input>
      </el-form-item>
      <span class="iconfont icon-gaojichaxun" @click="toggleGJsearch"></span>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" >重置</el-button>
      <div style="float:right;">
        <el-button size="small" @click="exportExcel" :loading="exportLoading" v-if="form.project_code">导出</el-button>
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
            <el-checkbox v-for="item in area.list" :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
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
      <div class="wrap">
        <h5>施工情况:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="buildStatus.isIndeterminate" v-model="buildStatus.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'buildStatus')">全选</el-checkbox>
          <el-checkbox-group v-model="buildStatus.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'buildStatus')">
            <el-checkbox v-for="item in buildStatus.list" :label="item.dict_value" :key="item.dict_value">{{item.dict_label}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap">
        <h5>施工单位:</h5>
        <div class="aside">
          <el-select
            multiple
            collapse-tags
            v-model="buildTeam"
            clearable
            @clear="handleQuery"
            style="width:50%;"
            size="small"
            placeholder="默认施工单位"
          >
            <el-option
              v-for="item in buildTeamList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 列表table -->
    <el-table :data="pointData" :height="isGJsearch?tableHeight-210:tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="point_code" label="点位编码">
        <template slot-scope="scope">
          <span @click="showInfoDrawer(scope.row)" style="cursor:pointer;color:#409eff">{{scope.row.point_code}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="point_name" label="点位名称"  min-width="150px">
        <template slot-scope="scope">
          {{scope.row.point_name}}
        </template>
      </el-table-column>
      <af-table-column  prop="relation_count" label="方向数" align="center"></af-table-column>
      <af-table-column  prop="child_name" label="子系统"></af-table-column>
      <af-table-column  prop="area" label="区域" align="center"></af-table-column>
      <el-table-column  prop="status" label="状态" align="center" width="100px">
        <template slot-scope="scope">
         <span slot="reference" :style="{color: scope.row.status===9?'#D9001B':'#70B603'}">{{selectDictLabel(status.list, scope.row.status)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" v-for="item in buildStatus.list" :min-width="item.width" :key="item.dict_value" :prop="item.dict_value" :label="item.dict_label"> </el-table-column>
      <el-table-column prop="dept_name" label="施工队" show-overflow-tooltip min-width="180px">
        <template slot-scope="scope">
          {{scope.row.dept_name}}
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
      <point-info  :pointInfo="currentp"  :project_code="form.project_code"></point-info>
    </el-drawer>
  </div>
</template>

<script>
import { downloadFile } from '@/utils/tool'
import pointInfo from '../points/pointInfo.vue'

export default {
  name: 'rateShow',
  data () {
    return {
      form: {
        project_code: '',
        point_code: '',
        project: null,
        project_id: ''
      },
      rules: {
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      tableLoading: false,
      exportLoading: false,
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
      tag: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      buildStatus: { // 施工情况
        isIndeterminate: false,
        checkAll: false,
        list: [
          { dict_label: '开挖完成', dict_value: 's_1', width: '80' }, { dict_label: '立杆完成', dict_value: 's_2', width: '80' }, { dict_label: '设备安装完成', dict_value: 's_3', width: '110' },
          { dict_label: '取电完成', dict_value: 's_4', width: '80' }, { dict_label: '取网完成', dict_value: 's_5', width: '80' }, { dict_label: '链路完成', dict_value: 's_6', width: '80' },
          { dict_label: '平台接入完成', dict_value: 's_7', width: '110' }
        ],
        checkedList: []
      },
      buildTeam: null,
      buildTeamList: [],
      currentp: null,
      showInfo: false
    }
  },
  components: {
    pointInfo
  },
  created() {
    this.init()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 235
    }
    this.getStatusList()
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
      this.buildTeamList = []

      this.pointData = []

      this.resetSearch()

      this.getChildList()
      this.getAreaList()
      this.getTagList()
      this.getBuilderList()
    },
    resetSearch() {
      this.form.point_code = ''
      Object.assign(this.child, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.area, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.status, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.tag, { isIndeterminate: false, checkAll: false, checkedList: [] })
      Object.assign(this.buildStatus, { isIndeterminate: false, checkAll: false, checkedList: [] })

      this.buildTeam = []
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
        tag_array: this.tag.checkedList,
        build_status_array: this.buildStatus.checkedList.map(m => Number(m.split('_')[1])),
        build_team_array: this.buildTeam,
        project_code: this.form.project_code,
        point_cond: this.form.point_code,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data, message } = await this.$pub.post('/point/schedule/list', params)
      this.tableLoading = false
      if (code !== 200) {
        this.pointData = []
        this.total = 0
        return this.$message.error(message || '查询出错了')
      } else {
        this.pointData = data.list || []
        this.total = data.total
      }
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
        if (Number(code) === 200) {
          this.child.list = data || []
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
        const { data, code, message } = await this.$pub.post('project/area-list', { project_id: this.form.project_id })
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
        this.$message.error(message || '获取标签出错了')
      }
    },
    async getBuilderList() {
      const params = { project_code: this.form.project_code }
      const result = await this.$pub.post('/rate/builder-dept-list', params)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.buildTeamList = result.data
        } else {
          this.buildTeamList = []
        }
      } else {
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
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
      //   Object.assign(this.buildStatus,{isIndeterminate: false,checkAll: false,checkedList: []});
      //   this.buildTeamList = [];
      //   this.buildTeam = [];
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
          case 'buildStatus':
            type = 'dict_value'
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
    async exportExcel() {
      this.exportLoading = true
      const params = {
        project_code: this.form.project_code,
        child_array: this.child.checkedList,
        area_array: this.area.checkedList,
        status_array: this.status.checkedList,
        tag_array: this.tag.checkedList,
        point_cond: this.form.point_code,
        build_status_array: this.buildStatus.checkedList.map(m => Number(m.split('_')[1])),
        build_team_array: this.buildTeam
      }
      const result = await this.$pub.post(
        '/point/manage/export-points-schedule',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.form.project_code + '进度列表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    },
    showInfoDrawer(row) {
      this.currentp = row
      this.showInfo = true
    }
  }
}
</script>

<style scoped lang="scss">
.rate_set{
  height: 100%;
  width:100%;
  background: #fff;
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
    &:hover{
      color: #409EFF;
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
.rate_set{
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
</style>
