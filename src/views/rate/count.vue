<template>
  <div style="height:100%;" class="rate_wrap">
    <div class="wrap" :class="{isColl:isColl}">
      <div class="grid-content bg-purple _left">
        <!-- <i :class="isColl?'el-icon-s-unfold':'el-icon-s-fold'" @click="changeColl"></i> -->
        <el-form size="small" label-position="left" style="padding-right:30px;" label-width="70px">
          <el-form-item label="项目">
            <el-select
              v-model="project"
              placeholder="请选择"
              style="width:100%"
              value-key="id"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projects"
                :key="item.value"
                :label="item.label"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子系统">
            <el-select
              v-model="childvalue"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认所有子系统"
            >
              <el-option
                v-for="item in childs"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <el-select
              v-model="areavalue"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认所有区域"
            >
              <el-option
                v-for="item in areas"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="施工单位">
            <el-select
              v-model="builder_dept_id"
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认施工单位"
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
          <el-form-item label="标签">
            <el-select
              v-model="tipsvalue"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="请选择标签"
            >
              <el-option
                v-for="item in tips"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="周期">
            <el-date-picker
              v-model="range"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width:100%"
              @change="onChangeDate"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              v-bind:disabled="projectvalue === ''"
              @click="getRateList"
              :loading="submitLoading"
              >搜索</el-button
            >
            <el-button
              icon="el-icon-download"
              v-show="ratedata.length > 0"
              @click="exportExcel"
              :loading="exportLoading"
              >导出</el-button
            >
          </el-form-item>
        </el-form>
      </div>
       <i :class="isColl?'el-icon-caret-right changeIcon':'el-icon-caret-left changeIcon'" @click="changeColl"></i>
      <div class="grid-content bg-purple _right">
        <el-table
          :data="ratedata"
          v-if="ratedata.length > 0"
          v-loading="tableLoading"
          :height="tableHeight"
          border
          style="width: 100%;"
          :span-method="objectSpanMethod"
        >
          <el-table-column
            prop="className"
            label="工序名称"
            fixed
            min-width="100"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="procName"
            label="步骤名称"
            fixed
            min-width="130"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column :label="pointCounts" >
            <el-table-column
              prop="counts"
              label="点位数-已拍照"
              fixed
              min-width="120"
            >
              <template slot-scope="scope">
                <span
                  class="pointNum"
                  style="margin-left: 10px;font-size:15px;"
                  v-if="scope.row.counts > 0"
                  @click="showPhoto(scope.row)"
                  >{{ scope.row.counts }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              v-for="row in depts"
              :key="row.id"
              :prop="row.id + ''"
              :label="row.name"
              min-width="120"
            >
              <template slot-scope="{ row, column }">
                <span
                  class="pointNum"
                  style="margin-left: 10px;font-size:15px;"
                  v-if="row[column.property] > 0"
                  @click="showPhoto(row, column)"
                  >{{ row[column.property] }}</span
                >
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <div
          v-if="ratedata.length <= 0"
          class="rate_nodata"
          v-loading="tableLoading"
        >
          <el-image
            :src="require(`@/assets/images/null.png`)"
            style="height: 50px; width: 80px;margin-top:100px;"
          ></el-image>
          <p style="color: grey">暂无数据,请选择查询条件，进行搜索</p>
        </div>
      </div>
    </div>

    <el-drawer
      :title="title"
      :visible.sync="drawer"
      :direction="direction"
      size="350"
    >
      <div class="drawer-image" style="overflow:auto;width:100%;height:350px;">
        <v-chart
          :forceFit="true"
          :height="height"
          :data="tradedata"
          :scale="scale"
          :padding="padding"
        >
          <v-tooltip :shared="true"></v-tooltip>
          <v-axis />
          <v-interval position="submit_date*counts" opacity="1" :size="7">
          </v-interval>
        </v-chart>
      </div>
    </el-drawer>

    <!-- 点位拍照数 -->
    <div v-if="photoDrawer">
      <photo-list
        :photoDrawer.sync="photoDrawer"
        :currentProc="currentProc"
        :currentDeptInfo="currentDeptInfo"
        :projectvalue="projectvalue"
        :areavalue="areavalue"
        :childvalue="childvalue"
        :builder_dept_id="builder_dept_id"
        :date_selector="date_selector"
        :tagvalue="tipsvalue"
      ></photo-list>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import photoList from './components/photoList'
import { downloadFile } from '@/utils/tool'
export default {
  name: 'rateCount',
  data() {
    return {
      title: '进度趋势',
      height: 300,
      drawer: false,
      direction: 'btt',
      submitLoading: false,
      loading: false,
      project: null,
      projectvalue: '',
      project_id: '',
      projects: [],
      childvalue: [],
      childs: [],
      areavalue: [],
      areas: [],
      range: [],
      ratedata: [],
      // 标签
      tipsvalue: [],
      tips: [],
      date_selector: {
        start: '',
        end: ''
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const curdate = new Date()
              const end = curdate.setDate(curdate.getDate() - 1)
              const start = end
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本周',
            onClick(picker) {
              const now = new Date() // 当前日期
              const nowDayOfWeek = now.getDay() // 今天本周的第几天
              const nowDay = now.getDate() // 当前日
              const nowMonth = now.getMonth() // 当前月
              var nowYear = now.getYear() // 当前年
              nowYear += nowYear < 2000 ? 1900 : 0 //
              const end = new Date(
                nowYear,
                nowMonth,
                nowDay + (7 - nowDayOfWeek)
              )
              const start = new Date(
                nowYear,
                nowMonth,
                nowDay - nowDayOfWeek + 1
              )
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本月',
            onClick(picker) {
              const now = new Date() // 当前日期
              const nowMonth = now.getMonth() // 当前月
              var nowYear = now.getYear() // 当前年
              nowYear += nowYear < 2000 ? 1900 : 0 //
              var lastMonthDate = new Date() // 上月日期
              lastMonthDate.setDate(1)
              lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

              var monthStartDate = new Date(nowYear, nowMonth, 1)
              var monthEndDate = new Date(nowYear, nowMonth + 1, 1)
              var days =
                (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24)

              const end = new Date(nowYear, nowMonth, days)
              const start = new Date(nowYear, nowMonth, 1)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      tradedata: [],
      scale: [
        {
          dataKey: 'counts',
          alias: '已拍照点位数',
          tickInterval: 5
        }
      ],
      tmpIndex: [],
      padding: ['auto', 'auto', '30', '30'],
      tickLine: {
        alignWithLabel: false,
        length: 0
      },
      label: {
        textStyle: {
          fill: '#aaaaaa'
        }
      },
      photoDrawer: false,
      currentProc: null,
      tableHeight: window.innerHeight - 139,
      builder_dept_id: '',
      BuilderList: [],
      depts: [], // 表头
      pointCounts: '', // 点位数
      currentDeptInfo: {},
      tableLoading: false,
      exportLoading: false,
      isColl: false
    }
  },
  components: { photoList },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 139
    }
  },
  methods: {
    onChangeDate() {
      if (this.range && this.range[0] && this.range[1]) {
        this.date_selector.start = moment(this.range[0]).format('YYYY-MM-DD')
        this.date_selector.end = moment(this.range[1]).format('YYYY-MM-DD')
      } else {
        this.date_selector = {
          start: '',
          end: ''
        }
      }
    },
    handleProjectChange(value) {
      if (value !== null) {
        this.projectvalue = value.projectCode
        this.project_id = value.id

        this.childvalue = []
        this.childs = []
        this.areavalue = []
        this.areas = []
        this.BuilderList = []
        this.builder_dept_id = ''
        this.getChildSystemList()
        this.getAreaList()
        this.getBuilderList()
        this.getTagList()
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return {
          rowspan: this.tmpIndex[rowIndex],
          colspan: 1
        }
      }
    },
    async getRateList() {
      if (this.projectvalue === null) {
        this.$notify.error({
          title: '提醒',
          message: '项目未选择,请先选择项目'
        })
        return
      }
      this.ratedata = []
      this.depts = []
      this.pointCounts = ''
      this.submitLoading = true
      this.tableLoading = true
      var req = {
        project_code: this.projectvalue,
        child_code: this.childvalue.join(',').trim(),
        area: this.areavalue.length > 0 ? this.areavalue.join(',').trim() : '',
        begin_date: this.date_selector.start,
        end_date: this.date_selector.end,
        builder_dept_id: String(this.builder_dept_id),
        tag: this.tipsvalue.length > 0 ? this.tipsvalue.join(',').trim() : '',
        user_id: this.$store.state.userInfo.id
      }
      const result = await this.$pub.post('/rate/proc-rate-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.ratedata = result.data.list ? result.data.list : []
          const arr = result.data.list ? result.data.list : []
          const tempMergeIndex = []
          let pos
          for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
              tempMergeIndex.push(1)
              pos = 0
            } else {
              if (
                arr[i].classCode &&
                arr[i].classCode === arr[i - 1].classCode
              ) {
                tempMergeIndex[pos] += 1
                tempMergeIndex.push(0)
              } else {
                tempMergeIndex.push(1)
                pos = i
              }
            }
            this.tmpIndex = tempMergeIndex

            // 点数总数
            this.pointCounts = result.data.counts ? '点位总数: ' + result.data.counts : '点位总数: ' + 0
            // 处理表头
            this.depts = result.data.depts ? result.data.depts : []
            this.tableLoading = false
          }
          this.tmpIndex = tempMergeIndex

          // 处理表头
          this.depts = result.data.depts ? result.data.depts : []
          this.tableLoading = false
        }
      } else {
        this.$notify.error({
          title: '查询失败',
          message: result.message
        })
      }
      this.submitLoading = false
    },
    async getAreaList() {
      if (this.projectvalue === null) {
        return
      }
      this.loading = true
      try {
        const result = await this.$pub.post(
          'project/area-list',
          { project_id: this.project_id }
        )
        if (result.code === 200) {
          if (result.data !== null) {
            this.areas = result.data.map((item, index) => {
              return { value: item.key, label: item.value }
            })
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
      this.loading = false
    },
    async getChildSystemList() {
      if (this.projectvalue === null) {
        return
      }
      this.loading = true
      try {
        const result = await this.$pub.post('project/child-list', { project_id: this.project_id })

        if (result.code === 200) {
          if (result.data !== null) {
            this.childs = result.data.map((item, index) => {
              return { value: item.key, label: item.value }
            })
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
      this.loading = false
    },
    async getTagList() {
      const params = {
        projectCode: this.projectvalue
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', params)
      if (code === 200) {
        this.tips = data || []
      } else {
        this.tips = []
        this.$message.error(message || '获取标签出错了')
      }
    },
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (Number(result.code) === 200) {
          if (result.data !== null) {
            // console.log(result.data);
            var tmparr = []
            result.data.map((item, index) => {
              var tmpobj = { value: item.projectCode, label: item.projectName }
              tmparr.push({ ...item, ...tmpobj })
            })
            this.projects = tmparr
          }
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
      this.submitLoading = false
    },
    async getBuilderList() {
      var req = {
        project_code: this.projectvalue
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
    showPhoto(row, type) {
      this.currentProc = row
      this.photoDrawer = true
      if (type) {
        this.currentDeptInfo = {
          dept_id: type.property,
          dept_name: type.label
        }
      } else {
        this.currentDeptInfo = {
          dept_id: '',
          dept_name: '全部点位'
        }
      }
    },
    async exportExcel() {
      this.exportLoading = true
      const params = {
        project_code: this.projectvalue,
        child_code: this.childvalue.join(',').trim(),
        area: this.areavalue.length > 0 ? this.areavalue.join(',').trim() : '',
        begin_date: this.date_selector.start,
        end_date: this.date_selector.end,
        builder_dept_id: String(this.builder_dept_id)
      }
      const { code, data } = await this.$pub.post('/rate/export-proc-rate', params)
      if (code === 200) {
        const title = this.projectvalue + '_' + '工序进度统计表'
        downloadFile(data, title, 'csv')
        this.exportLoading = false
      } else {
        this.$message.error('导出失败')
      }
    },
    changeColl() {
      this.isColl = !this.isColl
    }
  },
  created() {
    this.init()
  }
}
</script>

<style scoped>
.drawer-image {
  padding: 0px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
<style lang="scss">
.el-table td,
.el-table th {
  padding: 5px 0;
}
:focus {
  outline: 0;
}
.el-drawer__header {
  margin-bottom: 20px;
}
.pointNum {
  display: inline-block;
  border-radius: 10px;
  padding: 5px 20px;
  cursor: pointer;
  opacity: 0.9;
}
.rate_nodata {
  width: 100%;
  text-align: center;
}
.rate_wrap{
  .wrap{
    height:100%;
    display:flex;
    justify-content: space-between;
    ._left{
      width:310px;
      opacity: 1;
      transition: all 0.3s ease;
      // height:100%;
      border-right:1px solid #eee;
       &>i{
        float:right;
        font-size:24px;
        margin-top:7px;
        cursor:pointer;
        &:hover{
          color: #409EFF;
        }
      }
    }
    ._right{
      width:calc(100% - 330px);
      transition: width 0.3s ease;
    }
  }
}

</style>
