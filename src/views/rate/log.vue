<template>
  <div class="rate_set">
    <el-form
      size="small"
      :inline="true"
      :rules="rules"
      :model="form"
      label-width="40px"
    >
      <el-form-item label="项目">
        <el-select
          v-model="form.project_code"
          width="200px;"
          placeholder="请选择"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectList"
            :key="item.projectCode"
            :label="item.projectName"
            :value="item.projectCode"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="日志类型" label-width="80px">
        <el-select
          v-model="form.log_type"
          width="200px;"
          placeholder="请选择"
          @change="handleLogChange"
          clearable
        >
          <el-option
            v-for="item in logList"
            :key="item.logCode"
            :label="item.logName"
            :value="item.logCode"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="标签" label-width="50px">
        <el-select
          v-model="form.tag"
          width="200px;"
          placeholder="默认所有标签"
          @change="handleLogChange"
          multiple
          clearable
          collapse-tags
        >
          <el-option
            v-for="item in tagList"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-button size="mini" style="margin-top: 3px;" @click="handleQuery"
        >刷新</el-button
      >
      <div style="float:right;">
        <el-button
          size="small"
          v-if="form.project_code"
          @click="newLog"
          type="primary"
          >新建</el-button
        >
      </div>
    </el-form>

    <el-table :data="logData" :height="tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column
        prop="log_type"
        label="日志类型"
        show-overflow-tooltip
        width="120px"
        height="30px"
      >
        <template slot-scope="scope">
          {{ selectDictLabel(logList, scope.row.log_type) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="begin_date"
        label="开始时间"
        min-width="200px"
        height="30px"
      />
      <af-table-column prop="end_date" label="结束时间" min-width="200px" />
      <el-table-column
        prop="create_time"
        label="创建时间"
        min-width="200px"
        height="30px"
      >
        <template slot-scope="scope">
          <span>{{ ftime(scope.row.create_time) }} </span>
        </template>
      </el-table-column>
      <el-table-column label="日志" align="center" width="100" height="30px">
        <template slot-scope="scope">
          <el-button type="text" @click="seeLog(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="附件" width="100" height="30px">
        <template slot-scope="scope">
          <el-button type="text" @click="seeFLog(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="display:flex;justify-content:space-between;" >
      <span style="color:#999;font-size:14px;">共 {{ total }} 条记录</span>
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

    <!-- 新建日志弹出框 -->
    <el-dialog
      class="log_dialog"
      title="新建项目日志"
      :visible.sync="log_dialogVisible"
      width="400px"
    >
      <el-form
        ref="addLog"
        label-position="left"
        :model="addLog"
        :rules="addLogRules"
        size="small"
        label-width="106px"
      >
        <el-form-item label="日志类型" label-width="100px">
          <el-select
            v-model="addLog.log_type"
            placeholder="请选择"
            @change="handleLogType"
            style="width: 220px;"
          >
            <el-option
              v-for="item in logList"
              :key="item.logCode"
              :label="item.logName"
              :value="item.logCode"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="月份" label-width="100px" v-if="show">
          <el-date-picker
            v-model="value3"
            type="month"
            placeholder="选择月份"
            :picker-options="pickerBeginDateBefore"
            popper-class="sjxz"
            @change="handleMonth"
          >
          </el-date-picker>
          <div style="color: red;" v-if="fontShow">请先选择月份</div>
        </el-form-item>
        <el-form-item label="自定义时间" label-width="100px" v-if="zdyshow">
          <el-date-picker
            v-model="value4"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerBeginDateBefore"
            style="width:222px;"
            popper-class="sjxz"
            @change="handleDate"
          >
          </el-date-picker>
          <div style="color: red;" v-if="fontDateShow">请先选择时间段</div>
        </el-form-item>
        <!-- <el-form-item label="标签" label-width="100px">
          <el-select
            v-model="addLog.tag"
            width="200px;"
            placeholder="默认所有标签"
            multiple
            clearable
            collapse-tags
          >
            <el-option
              v-for="item in tagList"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addLogCancle">取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="addLogSure"
          v-loading="addLogSureLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-drawer
      title="项目日志详情"
      :visible.sync="showTableInfo"
      :append-to-body="true"
      custom-class="showTablelog"
      size="80%"
      :destroy-on-close="true"
    >
      <show-table
        :showTableDetails="currentTD"
        :logType="xzLogType"
        :logList="logList"
        @fatherMethod="closeHc"
      />
    </el-drawer>
  </div>
</template>

<script>
// import qs from 'qs'
import dayjs from 'dayjs'
import showTable from './components/showTable'
export default {
  name: 'rateLog',
  data() {
    return {
      projectList: [],
      form: {
        project_code: '',
        log_type: '',
        tag: []
      },
      rules: {
        project_code: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ]
      },
      logList: [],
      tagList: [],
      logData: [],
      tableLoading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      selectProjsct: [],
      log_dialogVisible: false,
      addLog: {
        log_type: 1,
        tag: []
      },
      addLogRules: {
        log_type: [
          { required: true, message: '请选择日志类型', trigger: 'change' }
        ]
      },
      addLogSureLoading: false,
      showTableInfo: false,
      currentTD: {},
      xzLogType: 1,
      value3: '',
      value4: [],
      pickerBeginDateBefore: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      show: false,
      fontShow: false,
      zdyshow: false,
      fontDateShow: false,
      tableHeight: window.innerHeight - 235
    }
  },
  created() {
    this.init()
    this.getlogType()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 235
    }
  },
  watch: {
    value3(val) {
      var dTime = new Date(val)
      console.log(dTime.getFullYear())
      console.log(dTime.getMonth() + 1)
    }
  },
  components: {
    showTable
  },
  methods: {
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (result.code === 200) {
          if (result.data.length > 0) {
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
    handleProjectChange(value) {
      this.tagList = []
      this.form.tag = []
      const actions = []
      Object.keys(this.projectList).map(val => {
        if (this.projectList[val].projectCode === value) {
          actions.push(this.projectList[val])
          return false
        }
      })
      this.selectProjsct = actions[0]
      this.getLogList()
      this.getTagList()
    },
    handleLogChange() {
      this.getLogList()
    },
    async getTagList() {
      const params = {
        projectCode: this.form.project_code
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', params)
      if (code === 200) {
        this.tagList = data || []
      } else {
        this.tagList = []
        this.$message.error(message || '获取标签出错了')
      }
    },
    handleQuery() {
      this.page.page_no = 1
      this.getLogList()
    },
    async getLogList() {
      if (!this.form.project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.tableLoading = true
      const params = {
        log_type: this.form.log_type === '' ? 0 : this.form.log_type,
        user_id: this.$store.state.userInfo.id,
        project_code: this.form.project_code,
        tag: this.form.tag.join(',').trim(),
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const result = await this.$pub.post('/log/get-log-list', params)
      this.tableLoading = false
      if (result.code === 200) {
        if (result.data !== null) {
          this.logData = result.data.list
          this.total = result.data.total
        } else {
          this.logData = []
          this.total = 0
        }
      } else {
        this.$notify.error({
          title: '查询失败',
          message: result.message
        })
      }
    },
    ftime(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    selectDictLabel(datas, value) {
      const actions = []
      Object.keys(datas).map(key => {
        if (datas[key].logCode === value) {
          actions.push(datas[key].logName)
          return false
        }
      })
      return actions.join('')
    },
    pageChange(num) {
      this.page.page_no = num
      this.getLogList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getLogList()
    },
    seeLog(obj) {
      window.open(obj.attach_url, '_blank')
    },
    seeFLog(obj) {
      window.open(obj.detail_url, '_blank')
    },
    newLog() {
      this.addLog = {
        log_type: 1,
        tag: []
      }
      this.fontShow = false
      this.fontDateShow = false
      this.show = false
      this.zdyshow = false
      this.log_dialogVisible = true
    },
    async addLogSure() {
      // console.log(this.value4.length)
      // return false
      try {
        await this.$refs.addLog.validate()
        var params = {}
        if (this.addLog.log_type === 3) {
          if (this.value3) {
            const d = new Date(this.value3)
            this.fontShow = false
            params = Object.assign({
              project_code: this.selectProjsct.projectCode,
              project_name: this.selectProjsct.projectName,
              city_code: this.selectProjsct.cityCode,
              log_type: this.addLog.log_type.toString(),
              begin_date:
                d.getFullYear() +
                '-' +
                (d.getMonth() + 1) +
                '-' +
                d.getDate() +
                ' ' +
                '00' +
                ':' +
                '00' +
                ':' +
                '00',
              end_date:
                d.getFullYear() +
                '-' +
                (d.getMonth() + 1) +
                '-' +
                new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() +
                ' ' +
                '24' +
                ':' +
                '00' +
                ':' +
                '00'
            })
          } else {
            this.fontShow = true
            return false
          }
        } else if (this.addLog.log_type === 4) {
          if (this.value4.length > 0) {
            const ST = new Date(this.value4[0])
            const STY = ST.getDate() - 1 > 0 ? ST.getMonth() + 1 : ST.getMonth()
            const ET = new Date(this.value4[1])
            let begin_date = ''
            if (STY === 0) {
              begin_date =
                ST.getFullYear() -
                1 +
                '-' +
                12 +
                '-' +
                new Date(ST.getFullYear(), STY, 0).getDate() +
                ' ' +
                '19' +
                ':' +
                '00' +
                ':' +
                '00'
            } else {
              begin_date =
                ST.getFullYear() +
                '-' +
                STY +
                '-' +
                new Date(ST.getFullYear(), STY, 0).getDate() +
                ' ' +
                '19' +
                ':' +
                '00' +
                ':' +
                '00'
            }
            this.fontDateShow = false
            params = Object.assign({
              project_code: this.selectProjsct.projectCode,
              project_name: this.selectProjsct.projectName,
              city_code: this.selectProjsct.cityCode,
              log_type: this.addLog.log_type.toString(),
              begin_date,
              end_date:
                ET.getFullYear() +
                '-' +
                (ET.getMonth() + 1) +
                '-' +
                ET.getDate() +
                ' ' +
                '19' +
                ':' +
                '00' +
                ':' +
                '00'
            })
          } else {
            this.fontDateShow = true
            return false
          }
        } else {
          params = Object.assign({
            project_code: this.selectProjsct.projectCode,
            project_name: this.selectProjsct.projectName,
            city_code: this.selectProjsct.cityCode,
            log_type: this.addLog.log_type.toString()
          })
        }
        this.addLogSureLoading = true
        this.xzLogType = this.addLog.log_type
        params = { ...params, tag: this.addLog.tag.join(','.trim()) }
        const result = await this.$pub.post('/log/get-build-rate', params)
        console.log(this.currentTD)
        this.currentTD = (await result.data) ? result.data : {}
        this.showTableInfo = await true
        this.addLogSureLoading = false
        this.addLogCancle()
        // this.handleQuery()
      } catch (err) {}
    },
    addLogCancle() {
      this.log_dialogVisible = false
      this.addLog = {
        log_type: 1,
        tag: []
      }
      this.fontShow = false
      this.show = false
      this.$refs.addLog.resetFields()
    },
    closeHc() {
      this.showTableInfo = false
      this.getLogList()
    },
    handleLogType(val) {
      this.fontDateShow = false
      this.fontShow = false
      if (val === 3) {
        this.zdyshow = false
        this.show = true
      } else if (val === 4) {
        this.show = false
        this.zdyshow = true
      } else {
        this.show = false
        this.zdyshow = false
      }
    },
    handleMonth(val) {
      if (val) {
        this.fontShow = false
      } else {
        this.fontShow = true
      }
    },
    handleDate(val) {
      if (val) {
        this.fontDateShow = false
      } else {
        this.fontDateShow = true
      }
    },
    getlogType() {
      this.$dict(this, 'log').then(res => {
        if (res.code === 200) {
          this.logList = (res.data || []).map(m => {
            return {
              logCode: Number(m.value),
              logName: m.label
            }
          })
        } else {
          this.$message.error('字典获取出错了log')
          this.logList = []
        }
      })
    }
  }
}
</script>

<style lang="scss">
.rate_set {
  /* padding: 20px; */
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  background: #fff;
}
.showTablelog.rtl {
  overflow: auto;
}
.rate_set .el-table td,
.rate_set .el-table th {
  padding: 8px 0 !important;
}
.rate_set >>> .el-table td,
.el-table th {
  padding: 4px 0;
}
.el-date-picker.sjxz {
  left: 50% !important;
  /* top: 40% !important; */
  top: 40% !important;
  transform: translate(-50%, -40%) !important;
  margin-top: 138px !important;
}
.el-date-range-picker.sjxz {
  left: 50% !important;
  top: 40% !important;
  transform: translate(-50%, -40%) !important;
  margin-top: 166px !important;
}
.log_dialog .el-dialog {
  display: flex;
  flex-direction: column;
  // margin: 0 !important;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  /*height:600px;*/
  max-height: calc(100% - 30px);
  max-width: calc(100% - 30px);
  .el-dialog__body {
    padding: 10px 20px !important;
  }
}

</style>
