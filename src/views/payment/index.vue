<template>
  <div class="payment">
    <el-form size="small"  :inline="true">
      <el-form-item label="项目" >
        <el-select
          v-model="form.project_code"
          placeholder="请选择"
          filterable
        >
          <el-option v-for="item in projectList" :key="item.projectCode" :label="item.projectName" :value="item.projectCode" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input v-model="form.searchKey"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item label="周期">
        <el-date-picker
          v-model="form.time"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd"
          style="width:220px;"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :loading="tableLoading">查询</el-button>
        <el-button @click="handleAdd" v-hasPermi="['payment:opera']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="tableData"
      v-loading="tableLoading"
      :height="tableHeight"
      border
      style="width: 100%;"
    >
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="title" label="标题"  :show-overflow-tooltip="true" align="center"></el-table-column>
      <el-table-column prop="describe" label="描述" align="center" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="project_name" label="所属项目"  :show-overflow-tooltip="true" align="center"></el-table-column>
      <el-table-column prop="user" label="操作人" width="90" :show-overflow-tooltip="true" align="center"></el-table-column>
      <el-table-column prop="time" label="操作时间"  :show-overflow-tooltip="true" align="center"></el-table-column>
      <el-table-column prop="status_name" label="状态" width="80" align="center"></el-table-column>
      <el-table-column prop="opera" label="操作"  width="150px" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleMaintain(scope.row)" v-hasPermi="['payment:opera']">维护</el-button>
          <el-button type="text" @click="handleEdit(scope.row)" v-hasPermi="['payment:opera']">编辑</el-button>
          <el-button type="text" @click="handleDel(scope.row)" v-hasPermi="['payment:opera']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="display:flex;justify-content:space-between;">
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

    <!-- 新增 编辑 -->
    <el-dialog
      :title="current?'编辑':'新增'"
      :visible.sync="operaFlag"
      width="650px"
      custom-class="payment_opera"
      :append-to-body="true"
    >
      <opera :current="current" :projectList="projectList" :operaFlag.sync="operaFlag" @handleQuery="handleQuery" v-if="operaFlag"></opera>
    </el-dialog>

    <!-- 维护 -->
    <el-drawer
      :title="current?current.title:''"
      :visible.sync="maintainFlag"
      size="90%"
      custom-class="payment_maintain"
      :append-to-body="true"
    >
      <maintain :current="current"  :maintainFlag.sync="operaFlag" @handleQuery="handleQuery" v-if="maintainFlag"></maintain>
    </el-drawer>
  </div>
</template>

<script>
import opera from './opera.vue'
import maintain from './maintain.vue'
export default {
  name: 'payment',
  data () {
    return {
      form: {
        project_code: '',
        searchKey: '',
        time: null
      },
      projectList: [],
      tableLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 230,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
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
              nowYear += nowYear < 2000 ? 2000 : 0 //
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
      operaFlag: false, // 新增 编辑
      maintainFlag: false, // 维护
      current: null
    }
  },
  computed: {

  },
  created() {
    this.getProjectList()
    this.handleQuery()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 230
    }
  },
  components: {
    opera, maintain
  },
  methods: {
    async getProjectList() {
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
    async getList() {
      // if (!this.form.project_code) {
      //   return this.$message({
      //     type: 'error',
      //     message: '项目未选择,请先选择项目',
      //     showClose: true
      //   })
      // }
      this.tableLoading = true
      const time = this.form.time || []
      const params = {
        searchKey: this.form.searchKey,
        project_code: this.form.project_code,
        begin_time: time[0] ? time[0] + ' 00:00:00' : '',
        end_time: time[1] ? time[1] + ' 23:59:59' : '',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      console.log(params)
      this.tableData = [
        { status: 0, project_code: 'XZPA20200601', title: '徐州市公安局智能化社会治安防控体系项目一期（烽火台工程）', describe: '徐州市公安局智能化社会治安防控体系项目一期（烽火台工程）', project_name: '徐州市公安局智能化社会治安防控体系项目一期（烽火台工程）', user: '2021亭湖项目付款', time: '2021年10月10日', status_name: '已确认' },
        { status: 0, project_code: 'TEST20200610', title: '测试项目', describe: '测试项目', project_name: '测试项目', user: '测试项目', time: '2021年10月10日', status_name: '已确认' },
        { status: 1, project_code: 'THAF20200619', title: '亭湖区安防大数据三年行动计划建设项目', describe: '亭湖区安防大数据三年行动计划建设项目', project_name: '亭湖区安防大数据三年行动计划建设项目', user: '2021亭湖项目付款', time: '2021年10月10日', status_name: '已确认' },
        { status: 0, project_code: 'YCCG2011142', title: '盐城公安智慧节点监控网及智慧绿波带建设项目', describe: '盐城公安智慧节点监控网及智慧绿波带建设项目', project_name: '盐城公安智慧节点监控网及智慧绿波带建设项目', user: '2021亭湖项目付款', time: '2021年10月10日', status_name: '已确认' },
        { status: 0, project_code: 'YDGC2021-ZB055', title: '2021大丰项目付款', describe: '2021亭湖项目付款', project_name: '盐都区社会治安防控体系建设（一期）设备采购及安装项目', user: '2021亭湖项目付款', time: '2021年10月10日', status_name: '已确认' }
      ]
      this.total = 11
      this.tableLoading = false

      // const { code, data, message } = await this.$pub.post('', params)
      // this.tableLoading = false
      // if (code !== 200) {
      //   this.tableData = []
      //   this.total = 0
      //   return this.$message.error(message || '查询出错了')
      // } else {
      //   this.tableData = data.list || []
      //   this.total = data.total
      // }
    },
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    handleAdd() {
      this.operaFlag = true
      this.current = null
    },
    handleMaintain(row) {
      this.maintainFlag = true
      this.current = row
    },
    handleEdit(row) {
      this.operaFlag = true
      this.current = row
    },
    handleDel(row) {
      // const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    }
  }
}
</script>

<style lang="scss">
.payment{
  padding: 20px 20px 0 20px;
  box-sizing: border-box;
  .el-table{
    .el-button{
      padding: 0;
    }
  }
  .pagination{
    padding-right:0px;
    .el-pagination__sizes{
      margin-right:0px;
    }
    .el-select .el-input{
      margin-right:0px;
    }
  }
}
</style>
