<template>
  <div class="rate_people">
    <div class="wrap" :class="{isColl:isColl}">
      <div class="grid-content bg-purple _left">
        <!-- <i :class="isColl?'el-icon-s-unfold':'el-icon-s-fold'" @click="changeColl"></i> -->
        <el-form size="small" label-position="left" style="padding-right:30px;" label-width="40px">
          <el-form-item label="项目">
            <el-select
              v-model="form.project_code"
              placeholder="请选择"
              style="width:100%"
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
          <el-form-item label="部门">
            <!-- <treeselect
              style="width:100%"
              v-model="form.dept"
              :options="deptOptions"
              :normalizer="normalizer"
              :multiple="true"
              placeholder="请选择归属部门"
              :value-consists-of="valueConsistsOf"
            /> -->
            <el-select
              v-model="form.dept"
              clearable
              collapse-tags
              multiple
              style="width:100%"
              placeholder="请选择归属部门"
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
              v-model="form.tag"
              multiple
              clearable
              collapse-tags
              style="width:100%"
              placeholder="请选择标签"
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
              :picker-options="pickerOptions"
              @change="onChangeDate"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              v-bind:disabled="!form.project_code "
              @click="getTableData"
              :loading="tableLoading"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <i :class="isColl?'el-icon-caret-right changeIcon':'el-icon-caret-left changeIcon'" @click="changeColl"></i>
      <div class="grid-content bg-purple _right"  v-if="tableData.length > 0">
        <el-table
          :data="tableData"
          :span-method="arraySpanMethod"
          border
          :height="tableHeight"
          style="width: 100%">
          <el-table-column
            align="center"
            prop="class_name"
            label="工序名称"
            width="180">
          </el-table-column>
          <el-table-column
            align="center"
            prop="proc_name"
            min-width="120"
            label="步骤名称">
          </el-table-column>
          <!-- 合计 -->
          <el-table-column
            align="center"
            prop="sum.photo_count"
            min-width="180"
            label="合计拍照数量">
            <template slot-scope="{ row }">
              <span >{{ row.sum.photo_count }}</span>
            </template>
          </el-table-column>

          <!-- 部门 -->
          <el-table-column
            v-for="dept in depts"
            :key="dept.dept_id"
            :prop="dept.dept_id+''"
            :label="dept.dept_name"
            align="center">
            <!-- 人员 -->
            <el-table-column
              v-for="per in dept.user_list"
              :key="per.id"
              :prop="per.id+''"
              :label="per.name + '拍照数量'"
              min-width="180"
              align="center">
                <template slot-scope="{ row,column }">
                  <div>
                    <div v-if="row[column.property]">
                      <!--没有点击事件： 为0和空 || 为合计行all-->
                      <span v-if="!row[column.property].photo_count || row.class_code === 'all'" class="normalpot">
                        {{ row[column.property].photo_count===0&&row.class_code!=='allregCount'&&row.class_code!=='all'?'':row[column.property].photo_count }}
                      </span>
                      <span v-else class="pointNum" style="margin-left: 10px;font-size:15px;" @click="showInfo(row, column,0,dept)">
                        {{ row[column.property].photo_count }}
                      </span>
                    </div>
                    <span v-if="!row[column.property]&&row.class_code === 'all' || !row[column.property]&&row.class_code === 'allregCount'">0</span>
                  </div>

                </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <div
        v-else
        style="width:calc(100% - 330px);text-align:center;"
        v-loading="tableLoading"
      >
        <el-image
          :src="require(`@/assets/images/null.png`)"
          style="height: 50px; width: 80px;margin-top:100px;"
        ></el-image>
        <p style="color: grey">暂无数据,请选择查询条件，进行搜索</p>
      </div>
    </div>
    <!--  上传列表 -->
    <div v-if="listDrawer">
      <ss-list
        :listDrawer.sync="listDrawer"
        :currentProc="currentProc"
        :currentUserInfo="currentUserInfo"
        :projectvalue="form.project_code"
        :date_selector="[form.start,form.end]"
        :tagvalue="form.tag"
      ></ss-list>
    </div>
  </div>
</template>

<script>
import ssList from './components/list'
import moment from 'moment'

export default {
  name: 'rateDept',
  data() {
    return {
      tableData: [],
      depts: [],
      tableLoading: false,
      exportLoading: false,
      spanArr: [],
      position: 0,
      projectList: [],
      tagList: [],
      deptOptions: [],
      BuilderList: [],
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
      form: {
        project_code: '',
        dept: null,
        tag: '',
        range: [],
        start: '',
        end: ''
      },
      tableHeight: window.innerHeight - 139,
      listDrawer: false,
      currentProc: null,
      currentUserInfo: {},
      valueConsistsOf: 'ALL',
      isColl: false
    }
  },
  components: {
    ssList
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 139
    }
    this.getProjectList()
    this.loadOptions()
  },
  methods: {
    onChangeDate() {
      if (this.form.range && this.form.range[0] && this.form.range[1]) {
        this.form.start = moment(this.form.range[0]).format('YYYY-MM-DD')
        this.form.end = moment(this.form.range[1]).format('YYYY-MM-DD')
      } else {
        this.form = {
          start: '',
          end: ''
        }
      }
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      const leng = this.tableData.length
      if (rowIndex + 1 === leng) { // 最后一行合并前两列
        if (columnIndex === 0) {
          return [1, 2]
        } else if (columnIndex === 1) {
          return [0, 0]
        }
      } else { // 合并第一列工序名称相同的行
        if (columnIndex === 0 && row.class_code) { // 第一列
          const _row = this.spanArr[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      }
    },
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
    handleProjectChange() {
      this.tagList = []
      this.BuilderList = []
      this.form.tag = []
      this.form.dept = []
      this.getTagList()
      this.getBuilderList()
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
    async getBuilderList() {
      const req = {
        project_code: this.form.project_code
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.BuilderList = result.data
        }
      } else {
        this.$notify.error({
          title: '部门查询失败',
          message: result.message
        })
      }
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if ((node.child && !node.child.length) || node.child === null) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.mc,
        children: node.child
      }
    },
    // 查询部门列表
    async loadOptions() {
      const params = {
        mc: ''
      }
      const { data, code, msg } = await this.$pub.post('/sys/dept/list-tree', params)
      if (code !== 200) {
        this.$message.error(msg || '获取部门出错了')
        this.deptOptions = []
      } else {
        this.deptOptions = Array.isArray(data.dept) ? data.dept : [data.dept]
      }
    },
    async getTableData() {
      this.tableLoading = true
      this.tableData = []
      const params = {
        project_code: this.form.project_code,
        dept_id: this.form.dept ? this.form.dept.join(',').trim() : '',
        tag: this.form.tag.join(',').trim(),
        begin_date: this.form.start,
        end_date: this.form.end,
        user_id: this.$store.state.userInfo.id
      }
      const { code, message, data } = await this.$pub.post('/rate/proc-rate-build-user-list', params)
      this.tableLoading = false
      if (code !== 200) {
        this.$notify.error({
          title: '列表查询失败',
          message: message
        })
        return
      }
      this.tableData = data.list || []
      this.depts = data.dept_list ? data.dept_list : []
      this.getSpanArr(this.tableData)
    },
    getSpanArr(data) {
      this.spanArr = [] // 避免表格错乱！
      data.forEach((item, index) => {
        if (index === 0) {
          this.spanArr.push(1)
          this.position = 0
        } else {
          if (data[index].class_code === data[index - 1].class_code) { // 这里是要合并行
            this.spanArr[this.position] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.position = index
          }
        }
      })
    },
    showInfo(row, type, flag, dept) {
      console.log(dept)
      // flag为0是拍照数量，1为审核数量，2为物料登记总点位数
      const tempArr = (dept.user_list || []).filter(m => (m.id + '') === type.property)
      this.currentUserInfo.id = tempArr[0] ? tempArr[0].id : ''
      this.currentUserInfo.name = dept.dept_name
      this.currentUserInfo.type = type.label.replace('数量', '列表')

      this.currentUserInfo.isPhoto = flag
      this.listDrawer = true
      this.currentProc = row
    },
    changeColl() {
      this.isColl = !this.isColl
    }
  }
}
</script>
<style lang="scss">
.rate_people{
  width:100%;
  height:100%;
  display:flex;
  justify-content:space-between;
  .wrap{
    height:100%;
    width:100%;
    display:flex;
    justify-content: space-between;
    ._left{
      width:310px;
      // height:100%;
      border-right:1px solid #eee;
      height: 100%;
      overflow: auto;
      opacity: 1;
      transition: all 0.3s ease;
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
    .clover_left .tab_wrap{
      td{
        cursor: pointer;
      }
    }
  }
}

</style>
