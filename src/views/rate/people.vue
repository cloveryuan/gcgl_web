<template>
  <div class="rate_people">
    <div class="wrap" :class="{isColl:isColl}">
      <div class="grid-content bg-purple _left">
        <!-- <i :class="isColl?'el-icon-s-unfold':'el-icon-s-fold'" @click="changeColl"></i> -->
        <el-form  size="small" style="padding-right:30px;" label-position="left" label-width="40px">
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
          <el-form-item label="人员">
            <el-select
              v-model="form.user"
              clearable
              style="width:100%;"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              multiple
              collapse-tags
              value-key="user_id"
              :remote-method="user_remoteMethod"
              :loading="loading"
            >
              <el-option
                v-for="item in userList"
                :key="item.user_id"
                :label="item.user_name_dept"
                :value="item"
              >
                <span>{{item.user_name_dept}}</span>
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
            <!-- format="yyyy-MM-dd" -->
              <!-- value-format="yyyy-MM-dd" -->
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
            <!-- <el-button
              icon="el-icon-download"
              v-show="tableData.length > 0"
              @click="exportExcel"
              :loading="exportLoading"
              >导出</el-button
            > -->
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
          <!-- 合计列 -->
          <el-table-column
            align="center"
            prop="sum"
            min-width="120"
            label="合计">
            <el-table-column
              prop="sum.photo_count"
              label="拍照数量"
              min-width="120"
              align="center">
              <template slot-scope="{ row,column }">
                <div>
                  <span v-if="cols.includes(row.class_code)&&row.sum.photo_count" class="pointNum" style="margin-left: 10px;font-size:15px;" @click="showInfo(row,column,2)">{{ row.sum.photo_count }}</span>
                  <span v-else>{{ row.sum.photo_count }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="sum.audit_count"
              label="审核数量"
              min-width="120"
              align="center">
              <template slot-scope="{ row,column }">
                <div>
                  <span v-if="cols.includes(row.class_code)&&row.sum.audit_count" class="pointNum" style="margin-left: 10px;font-size:15px;" @click="showInfo(row,column,2)">>{{ row.sum.audit_count }}</span>
                  <span v-else>{{ row.sum.audit_count }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table-column>

            <!-- 人员 -->
            <el-table-column
              v-for="per in person"
              :key="per.id"
              :prop="per.id+''"
              :label="per.name"
              align="center">
              <el-table-column
                :prop="per.id+''"
                label="拍照数量"
                min-width="120"
                align="center">
                <template slot-scope="{ row,column }">
                  <div>
                    <div v-if="row[column.property]">
                      <!--没有点击事件： 为0和空 || 为合计行all-->
                      <span v-if="!row[column.property].photo_count || row.class_code === 'all'" class="normalpot">
                        {{ row[column.property].photo_count===0&&row.class_code!=='allregCount'&&row.class_code!=='all'?'':row[column.property].photo_count }}
                      </span>
                      <span v-else class="pointNum" style="margin-left: 10px;font-size:15px;" @click="showInfo(row, column,0)">
                        {{ row[column.property].photo_count }}
                      </span>
                    </div>
                    <span v-if="!row[column.property]&&row.class_code === 'all' || !row[column.property]&&cols.includes(row.class_code)">0</span>
                  </div>

                </template>
              </el-table-column>
              <el-table-column
                :prop="per.id+''"
                label="审核数量"
                min-width="120"
                align="center">
                <template slot-scope="{ row,column }">
                  <div>
                    <div v-if="row[column.property]">
                      <!--没有点击事件： 为0和空 || 为合计行all-->
                      <span v-if="!row[column.property].audit_count || row.class_code === 'all'" class="normalpot">
                        {{ row[column.property].audit_count===0&&row.class_code!=='allregCount'&&row.class_code!=='all'?'':row[column.property].audit_count }}
                      </span>
                      <span v-else class="pointNum" style="margin-left: 10px;font-size:15px;" @click="showInfo(row, column,1)">
                        {{ row[column.property].audit_count }}
                      </span>
                    </div>
                    <span v-if="!row[column.property]&&row.class_code === 'all' || !row[column.property]&&cols.includes(row.class_code)">0</span>
                  </div>
                  <!-- <span v-if="!row[column.property]&&row.class_code === 'all' || !row[column.property]&&row.class_code === 'allregCount'">0</span> -->
                </template>
              </el-table-column>
            </el-table-column>
        </el-table>
      </div>
      <div
        v-else
        class="nodata"
        v-loading="tableLoading"
      >
        <el-image
          :src="require(`@/assets/images/null.png`)"
           style="height: 50px; width: 80px;"
        ></el-image>
        <p style="color: grey">暂无数据,请选择查询条件，进行搜索</p>
    </div>
  </div>

  <!-- 照片 ：审核列表 上传列表 -->
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
  <!-- 物料登记点位数 -->
  <div v-if="deviceDrawer">
    <device-reg
      :deviceDrawer.sync="deviceDrawer"
      :currentUserInfo="currentUserInfo"
      :projectvalue="form.project_code"
      :date_selector="[form.start,form.end]"
      :tagvalue="form.tag"
      :uservalue="form.user"
    ></device-reg>
  </div>
  <!-- 完工移交填报IP数量 -->
  <div v-if="ipDrawer">
    <ip-num
      :ipDrawer.sync="ipDrawer"
      :currentUserInfo="currentUserInfo"
      :projectvalue="form.project_code"
        :date_selector="[form.start,form.end]"
      :tagvalue="form.tag"
      :uservalue="form.user"
    ></ip-num>
  </div>
  </div>
</template>

<script>
// import qs from 'qs'
import ssList from './components/list'
import deviceReg from './components/deviceReg'
import ipNum from './components/ipNum'
import moment from 'moment'
export default {
  name: 'ratePeople',
  data() {
    return {
      tableData: [],
      person: [
        // { id: 'sum', name: '合计' }, // 列
        // { id: 1, name: '王亮(桑达南京研发中心)' },
        // { id: 3, name: '谢超(桑达徐州工程部)' },
        // { id: 8, name: '孙苏鹏(桑达徐州|盐城公安工程部)' }
      ],
      tableLoading: false,
      exportLoading: false,
      spanArr: [],
      position: 0,
      projectList: [],
      peopleList: [],
      tagList: [],
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
        user: '',
        tag: '',
        range: [],
        start: '',
        end: ''
      },
      loading: false,
      userList: [],
      tableHeight: window.innerHeight - 139,
      listDrawer: false,
      deviceDrawer: false,
      ipDrawer: false,
      currentProc: null,
      currentUserInfo: {},
      cols: ['allregCount', 'allIPSumbit'],
      isColl: false
    }
  },
  components: {
    ssList, deviceReg, ipNum
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 139
    }
    this.getProjectList()
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
      if (rowIndex + 1 === leng || rowIndex + 2 === leng) { // 最后一行合并列
        if (columnIndex % 2 === 0) {
          return [1, 2]
        } else {
          return [0, 0]
        }
      } else if (rowIndex + 3 >= leng) { // 倒数第二行合并列
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
      this.peopleList = []
      this.getTagList()
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
    async user_remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.userList = [...data.user_list, ...this.form.user] || [...this.form.user]
      } else {
        this.userList = []
      }
    },
    async getTableData() {
      this.tableLoading = true
      this.tableData = []
      const params = {
        project_code: this.form.project_code,
        user_ids: this.form.user.map(m => m.user_id).join(',').trim(),
        tag: this.form.tag.join(',').trim(),
        begin_date: this.form.start,
        end_date: this.form.end
      }
      const { code, message, data } = await this.$pub.post('/rate/proc-rate-user-list', params)
      this.tableLoading = false
      if (code !== 200) {
        this.$notify.error({
          title: '列表查询失败',
          message: message
        })
        return
      }
      this.tableData = data.list || []
      this.person = data.user_list ? data.user_list : []
      // this.tableData = [
      //   {
      //     1: { audit_count: 0, photo_count: 14 },
      //     16: { audit_count: 0, photo_count: 20 },
      //     class_code: 'CLS100',
      //     class_name: '现场勘测',
      //     count: 9,
      //     proc_code: 'CLS100-01',
      //     proc_name: '现场勘测照片',
      //     sum: { audit_count: 0, photo_count: 3146 }
      //   },
      //   {
      //     119: { audit_count: 0, photo_count: 8 },
      //     29: { audit_count: 587, photo_count: 1 },
      //     class_code: 'CLS011',
      //     class_name: '完工移交',
      //     count: 2,
      //     proc_code: 'CLS011-04',
      //     proc_name: 'IP详表',
      //     sum: { audit_count: 587, photo_count: 9 }
      //   }, {
      //     1: { audit_count: 5, photo_count: 15 },
      //     16: { audit_count: 0, photo_count: 20 },
      //     class_code: 'all',
      //     class_name: '合计',
      //     count: 0,
      //     proc_code: '',
      //     proc_name: '',
      //     sum: { audit_count: 17003, photo_count: 4634 }
      //   }, {
      //     1: { photo_count: 1 },
      //     19: { photo_count: 100 },
      //     class_code: 'allregCount',
      //     class_name: '物料登记点位数',
      //     count: 4,
      //     proc_code: '',
      //     proc_name: '',
      //     sum: { audit_count: 0, photo_count: 177 }
      //   }
      // ]
      // this.person = [
      //   {
      //     id: 1,
      //     name: '桑达南京研发中心',
      //     user_list: [
      //       { id: 119, name: '马如飞' },
      //       { id: 16, name: '周涛' }
      //     ]
      //   },
      //   {
      //     id: 3,
      //     name: '桑达徐州工程部',
      //     user_list: [
      //       { id: 1, name: '殷祥' },
      //       { id: 29, name: '孙海兵' }
      //     ]
      //   }
      // ]
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
    showInfo(row, type, flag) {
      // flag为0是拍照数量，1为审核数量，2(为物料登记总点位数,完工移交填报IP数量)
      const tempArr = this.person.filter(m => (m.id + '') === type.property)
      this.currentUserInfo = tempArr[0] ? tempArr[0] : {}
      this.currentUserInfo.type = type.label.replace('数量', '列表')
      if (flag === 2) { // 2 合计列里面的为物料登记总点位数，完工移交填报IP数量
        this.currentUserInfo.id = 'sum'
      }
      if (row.class_code === 'allregCount') { // 物料登记总点位数
        this.deviceDrawer = true
        this.currentUserInfo.isPhoto = flag
      } else if (row.class_code === 'allIPSumbit') { // 完工移交填报IP数量
        this.ipDrawer = true
      } else {
        this.currentUserInfo.isPhoto = flag
        this.listDrawer = true
        this.currentProc = row
      }
    },
    async exportExcel() {
      this.exportLoading = true
      // const params = {
      //   project_code: this.form.project_code,
      //   user_ids: this.form.user.map(m => m.user_id).join(',').trim(),
      //   tag: this.form.tag.join(',').trim(),
      //   begin_date: this.form.range ? this.form.range[0] : '',
      //   end_date: this.form.range ? this.form.range[1] : ''
      // }
      // const { code, data } = await this.$pub.post('/rate/export-proc-rate', params)
      // if (code === 200) {
      //   const title = this.projectvalue + '_' + '工序进度统计表'
      //   downloadFile(data, title, 'csv')
      //   this.exportLoading = false
      // } else {
      //   this.$message.error('导出失败')
      // }
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
    width: 100%;
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
    .clover_left .tab_wrap{
      td{
        cursor: pointer;
      }
    }
    .nodata{
      margin: auto;
      text-align:center;
    }
  }
}

</style>
