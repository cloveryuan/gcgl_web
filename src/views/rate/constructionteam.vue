<template>
  <div style="height:100%;" class="conteam_wrap">
    <div class="wrap" :class="{isColl:isColl}">
      <div class="grid-content bg-purple _left">
        <el-form size="small" style="padding-right:30px;" label-position="left" label-width="70px">
          <el-form-item label="项目">
            <el-select
              v-model="form.project"
              placeholder="请选择"
              style="width:100%"
              value-key="id"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projects"
                :key="item.id"
                :label="item.projectName"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子系统">
            <el-select
              v-model="form.child"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认所有子系统"
            >
              <el-option
                v-for="item in childs"
                :key="item.key"
                :label="item.value"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <el-select
              v-model="form.area"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="默认所有区域"
            >
              <el-option
                v-for="item in areas"
                :key="item.value"
                :label="item.value"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="施工单位" v-if="user_type===0">
            <el-select
              v-model="form.builder_dept_id"
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
          <el-form-item label="工序">
            <el-cascader
              v-model="form.proc_code"
              :options="procs"
              :props="procsProps"
              collapse-tags
              size="small"
              filterable
              style="width: 100%"
              :key="iscascaderShow"
              clearable></el-cascader>
          </el-form-item>
          <!-- <el-form-item label="标签">
            <el-select
              v-model="form.tag"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="请选择标签"
            >
              <el-option
                v-for="item in tags"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="周期">
            <el-date-picker
              v-model="form.range"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width:100%"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              :disabled="!form.project"
              @click="getList"
              :loading="submitLoading"
              >搜索</el-button
            >
            <el-button
              icon="el-icon-download"
              v-show="tableData.length > 0"
              @click="exportExcel"
              :loading="exportLoading"
              >导出</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <i :class="isColl?'el-icon-caret-right changeIcon':'el-icon-caret-left changeIcon'" @click="changeColl"></i>
      <vxe-table
        class="_right"
        v-if="tableData.length > 0 || tableHeader.length>0"
        v-loading="submitLoading || exportLoading"
        :element-loading-text="textL"
        :scroll-x="{enabled: false}"
        show-overflow
        border
        :height="tableHeight"
        :data="tableData">
        <!-- 列 ：点位编码 点位名称  -->
        <!-- <vxe-colgroup
          align="center"
          header-class-name="hidden-cell"
          title=""> -->
          <vxe-colgroup
            align="center"
            title=""
            width="160"
          header-class-name="custmer-span"
          >
            <template v-slot:header>
              <div style="display: flex;">
                <el-input placeholder="请输入点位编码" v-model="searchWords"></el-input>
                <el-button type="primary" @click="searchPoint">查询</el-button>
                <el-button type="default" style="margin-left:0;" @click="resetPoint">重置</el-button>
              </div>
            </template>
            <vxe-column
              align="center"
              field="point_code"
              title="点位编码"
              width="180">
              <template v-slot="{row}">
                <!-- <span :class="isHight(row.point_code)">{{row.point_code}}</span> -->
                <span v-html="row.point_code_hight"></span>
              </template>
            </vxe-column>
            <vxe-column
              align="center"
              field="point_name"
              title="点位名称"
              width="270">
            </vxe-column>
          </vxe-colgroup>
        <!-- </vxe-colgroup> -->

        <!-- 工序列 -->
        <vxe-colgroup
          v-for="proc in tableHeader"
          :key="proc.class_code"
          :field="proc.class_code"
          :title="proc.class_name"
          align="center">
          <!-- 工序步骤 -->
          <vxe-colgroup
            v-for="item in proc.proc_list"
            :key="item.proc_code"
            :title="item.proc_name"
            align="center">
            <!-- 方向数量（拍照 审核） -->
            <vxe-column
              :field="item.proc_code + 'photo_count'"
              title="拍照数量(方向)"
              min-width="120"
              align="center">
                <template slot-scope="{ row }">
                  <div
                  :class="{pointNum:row.point_code!=='all'}"
                  v-if="row[item.proc_code]&&row[item.proc_code].photo_count"
                  @click="showProcInfo(row,item.proc_code,proc.class_code)">{{row[item.proc_code].photo_count}}</div>
                </template>
            </vxe-column>
            <vxe-column
              :field="item.proc_code + 'audit_count'"
              title="审核数量(方向)"
              min-width="120"
              align="center">
              <template slot-scope="{ row }">
                  <div
                  :class="{pointNum:row.point_code!=='all'}"
                  v-if="row[item.proc_code]&&row[item.proc_code].audit_count"
                  @click="showProcInfo(row,item.proc_code,proc.class_code)">{{ row[item.proc_code].audit_count}}</div>
                  <!-- <div v-if="row[column.property]&&row[column.property].audit_count">{{ row[column.property].audit_count}}</div> -->
                </template>
            </vxe-column>
          </vxe-colgroup>
        </vxe-colgroup>
      </vxe-table>
      <div
        v-else
        class="nodata"
        v-loading="submitLoading"
        :element-loading-text="textL"
      >
        <el-image
          :src="require(`@/assets/images/null.png`)"
          style="height: 50px; width: 80px;"
        ></el-image>
        <p style="color: grey">暂无数据,请选择查询条件，进行搜索</p>
      </div>
    </div>

    <el-drawer
      title="详情"
      :visible.sync="info"
      size="40%"
      :append-to-body="true"
      :destroy-on-close="true"
      custom-class="construcDrawer"
    >
      <construc-info
        v-if="info"
        :currentProc="currentProc"
        :currentRow="currentRow"
        :user_type="user_type"
        :did="did"
      ></construc-info>
    </el-drawer>
  </div>
</template>

<script>
import mixin from '@/mixins/common.js'
import { downloadFile } from '@/utils/tool'
import construcInfo from './components/construcInfo.vue'
export default {
  name: 'rateConstructionTeam',
  mixins: [mixin],
  data () {
    return {
      ischeckAllproject: true,
      form: {
        project: null,
        child: null,
        area: null,
        builder_dept_id: '',
        tag: null,
        range: [],
        proc_code: []
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
              const start = new Date(end)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, start])
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
      procsProps: {
        multiple: true
      },
      tableData: [],
      tableHeader: [],
      tableHeight: window.innerHeight - 139,
      textL: '数据量太大拼命加载中',
      submitLoading: false,
      exportLoading: false,
      iscascaderShow: 0,
      isColl: false,
      info: false,
      currentProc: null,
      currentRow: null,
      searchWords: ''
    }
  },
  components: { construcInfo },
  computed: {
    user_type() {
      return this.$store.state.userInfo.user_type
    },
    did() {
      return this.$store.state.userInfo.did
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 139
    }
  },
  methods: {
    handleProjectChange() {
      this.iscascaderShow++
      const obj = {
        child: null,
        area: null,
        builder_dept_id: '',
        tag: null,
        proc_code: [],
        range: []
      }
      Object.assign(this.form, obj)
      this.childs = []
      this.areas = []
      this.BuilderList = []
      this.tags = []
      this.procs = []

      this.getChildList()
      this.getAreaList()
      this.getTagList()
      this.getProcList(false)
      if (this.user_type === 0) {
        this.getBuilderList()
      }
    },
    async getList() {
      this.searchWords = ''
      this.tableData = []
      this.tableHeader = []
      this.submitLoading = true
      const time = this.form.range || []
      const proc_code = []
      this.form.proc_code.map(m => {
        proc_code.push(m[1])
      })
      const req = {
        project_code: this.project_code,
        child_code: (this.form.child && this.form.child.length > 0) ? this.form.child : [],
        area: (this.form.area && this.form.area.length > 0) ? this.form.area : [],
        begin_time: time[0] ? time[0] + ' 00:00:00' : '',
        end_time: time[1] ? time[1] + ' 23:59:59' : '',
        dept_id: this.user_type === 0 ? String(this.form.builder_dept_id) : String(this.did),
        // tag: (this.form.tag && this.form.tag.length > 0) ? this.form.tag.join(',').trim() : '',
        proc_code
        // user_id: this.$store.state.userInfo.id
      }

      const { data } = await this.$pub.post('rate/reg-device-dept-list', req)
      this.tableHeader = data.proc_list || []
      this.tableData = (data.data_list || []).map(m => {
        return {
          ...m,
          point_code_hight: m.point_code
        }
      })
      this.submitLoading = false
    },
    async exportExcel() {
      this.exportLoading = true
      const time = this.form.range || []
      const proc_code = []
      this.form.proc_code.map(m => {
        proc_code.push(m[1])
      })
      const params = {
        project_code: this.project_code,
        child_code: (this.form.child && this.form.child.length > 0) ? this.form.child : [],
        area: (this.form.area && this.form.area.length > 0) ? this.form.area : [],
        begin_time: time[0] ? time[0] + ' 00:00:00' : '',
        end_time: time[1] ? time[1] + ' 23:59:59' : '',
        dept_id: this.user_type === 0 ? String(this.form.builder_dept_id) : String(this.did),
        // tag: (this.form.tag && this.form.tag.length > 0) ? this.form.tag.join(',').trim() : '',
        proc_code
        // user_id: this.$store.state.userInfo.id
      }
      const result = await this.$pub.post(
        '/rate/reg-device-dept-list-export',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = this.form.project.projectName + '_' + '施工队工作量统计表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    },
    changeColl() {
      this.isColl = !this.isColl
    },
    showProcInfo(row, proc_code, class_code) {
      if (row.point_code === 'all') {
        return
      }
      this.info = true
      this.currentRow = row
      this.currentRow.project_code = this.form.project.projectCode
      this.currentProc = {
        proc_code,
        class_code
      }
    },
    resetPoint() {
      if (this.searchWords) {
        this.searchWords = ''
        this.tableData = JSON.parse(JSON.stringify(this.deepcloneData))
      }
    },
    searchPoint() {
      if (this.searchWords) {
        this.submitLoading = true
        setTimeout(() => {
          // 备份tableData
          this.deepcloneData = JSON.parse(JSON.stringify(this.tableData))
          const tempArr = []

          this.tableData.forEach((row, i) => {
            this.isHight(row, tempArr)
            if (i === this.deepcloneData.length - 1) {
              this.submitLoading = false
              this.tableData = tempArr
            }
          })
        }, 100)
      }
    },
    isHight(row, tempArr) {
      let num = -1; const point_code = row.point_code
      num = point_code.toLowerCase().indexOf(this.searchWords.toLowerCase())
      if (num > -1) {
        const searchName = point_code.substr(num, this.searchWords.length)
        const replaceReg = new RegExp(this.searchWords, 'ig')
        const replaceString = '<span class="keyword-lighten">' + searchName + '</span>'
        row.point_code_hight = (point_code || '').replace(replaceReg, replaceString)
        tempArr.push(row)
      } else {
        row.point_code_hight = row.point_code
      }
    }
  }
}
</script>

<style lang="scss">
.conteam_wrap{
  .wrap{
    width: 100%;
    height:100%;
    display:flex;
    position: relative;
    justify-content: space-between;
    ._left{
      width:310px;
      transition: width 0.1s ease-in;
      // height:100%;
      border-right:1px solid #eee;
      transition: none;
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
      transition: width 0.1s ease-in;
      width:calc(100% - 330px);
      // height: calc(100% - 6px);
    }
  }
  .nodata{
    margin: 50px auto;
    text-align: center;
  }
  .wrap.isColl{
    ._left{
      width:10px;
      .el-form{
        display:none;
      }
    }
    ._right{
      width:calc(100% - 30px);
    }
  }
  .wrap{
    .changeIcon{
      position: absolute;
      top:50%;
      left:285px;
      cursor:pointer;
      font-size:40px;
      color: #999;
    }
    .el-icon-caret-right{
      top:50%;
      left:-6px;
    }
  }
  .hidden-cell {
    // display: none;
    visibility: hidden;
  }
  .keyword-lighten {
    color: #000;
    background-color: #ff0;
  }
}

</style>
