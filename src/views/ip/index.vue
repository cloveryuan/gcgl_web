<template>
  <div class="iplistconfig">
    <ul class="cloverLeft" >
      <li v-hasPermi="['ipcheck:list']"  @click="tabClick(1)" :style="{color: type===1?'#409eff':'rgb(56, 53, 53)'}">待审列表</li>
      <li v-hasPermi="['ipmatched:list']"  @click="tabClick(2)" :style="{color: type===2?'#409eff':'rgb(56, 53, 53)'}">待配列表</li>
    </ul>
     <div class="searchPoint">
      <el-form size="small" label-position="right"  label-width="40px" style="margin:0 10px;border-radius:4px;">
        <el-form-item label="项目" >
          <el-select style="width: 100%" v-model="form.project" placeholder="请选择" @change="handleProjectChange" value-key="id">
            <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="点位">
          <el-input  v-model="form.point_code" placeholder="请输入点位编号或名称" @input="inputChangePoint"></el-input>
        </el-form-item>
        <el-form-item label="IP" class="ipinput">
          <el-input v-model="form.ip" @blur="validateIPfn"/>
          <span class="error" v-if="form.error">{{form.error}}</span>
        </el-form-item>
        <el-form-item label="人员" v-if="type===1"  >
          <el-select
            v-model="form.user_id"
            clearable
            style="width:100%;"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="user_remoteMethod"
            :loading="user_loading"
            @change="handleSelectChange"
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
      </el-form>
      <el-table
        class="tableWrap"
        :show-header="false"
        :height="lefttableHeight"
        :data="pointTableData"
        :row-style="{ height: '30px' }"
        :cell-style="{ padding: '4px 0' }"
        @row-click="currentClick"
        v-loading="tableLoading"
        :row-class-name="tableRowClassName"
        ref="multipleTable"
      >
        <el-table-column  show-overflow-tooltip >
          <template slot-scope="scope">
            <h5>{{ scope.row.device_ip }}</h5>
            <span style="color:#BEBFBF;">点位编码：{{ scope.row.point_code }}</span>
            <span style="color:#BEBFBF;float: right;">{{scope.row.create_user}}</span>
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

    <!-- 待审列表的右侧内容 -->
    <check v-if="type===1" :point="currentPoint" @getPointList="getPointList"></check>
    <!-- 待配列表的右侧内容 -->
    <matched v-if="type===2" :point="currentPoint" @getPointList="getPointList"></matched>
  </div>
</template>

<script>
import check from './check'
import matched from './matched'
export default {
  name: 'ipList_config',
  data () {
    return {
      type: 1, // 1待审列表 2待配列表
      form: {
        error: '',
        project: null,
        project_id: '',
        project_code: '',
        point_code: '',
        ip: '',
        user_id: null
      },
      projectList: [],
      tableLoading: false,
      pointTableData: [],
      lefttableHeight: window.innerHeight - 337,
      total: 0,
      page: {
        page_no: 0,
        page_size: 10
      },
      timer: null,
      user_loading: false,
      userList: [],
      currentPoint: null

    }
  },
  computed: {

  },
  watch: {
    // type() {
    //   this.lefttableHeight = this.type === 1 ? window.innerHeight - 337 : window.innerHeight - 294
    // if (this.form.project) {
    //   this.handleProjectChange(this.form.project)
    // }
    // }
  },
  created() {
    this.getProjectsList()
  },
  mounted() {
    window.onresize = () => {
      this.lefttableHeight = this.type === 1 ? window.innerHeight - 337 : window.innerHeight - 294
    }
  },
  components: {
    check, matched
  },
  methods: {
    tabClick(type) {
      this.type = type
      this.lefttableHeight = this.type === 1 ? window.innerHeight - 337 : window.innerHeight - 294
      if (this.form.project_id) {
        this.handleProjectChange(this.form.project)
      } else {
        this.reset()
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
        this.projectList = []
        this.$notify.error({
          title: '查询失败',
          message: message
        })
      }
    },
    handleProjectChange(val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      this.reset()
      this.getPointList()
    },
    reset() {
      this.page.page_no = 1
      this.total = 0
      this.currentPoint = null
      // 清空，点位列表
      this.pointTableData = []
    },
    async getPointList() {
      this.tableLoading = true
      const param1 = {
        page_no: this.page.page_no,
        page_size: this.page.page_size,
        point_code: this.form.point_code,
        ip: this.form.ip,
        project_code: this.form.project_code
      }
      const param2 = Object.assign({
        user_id: this.form.user_id
      }, param1)
      const { data, code, message } = this.type === 1 ? await this.$pub.post('point/device/device-check-list', param2) : await this.$pub.post('point/device/device-conf-list', param1)
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
    },
    pageChange(num) {
      this.page.page_no = num
      this.getPointList()
    },
    inputChangePoint() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const self = this
      this.timer = setTimeout(function () {
        self.timer = null
        self.handleSelectChange()
      }, 500)
    },
    validateIPfn() {
      const ip = this.form.ip
      if (ip === '' || ip === undefined || ip == null) {
        this.form.error = null
        this.handleSelectChange()
      } else {
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if ((!reg.test(ip)) && ip !== '') {
          this.form.error = 'ip格式不正确'
        } else {
          this.form.error = null
          this.handleSelectChange()
        }
      }
    },
    handleSelectChange() {
      if (!this.form.project_code) {
        this.$message({
          type: 'error',
          message: '请选择项目',
          showClose: true
        })
        return
      }
      if (this.form.error) {
        this.$message({
          type: 'error',
          message: 'IP格式错误',
          showClose: true
        })
        return
      }
      this.currentPoint = null
      this.pageChange(1)
    },
    async user_remoteMethod(query) {
      if (query !== '') {
        this.user_loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.user_loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.userList = data.user_list
      } else {
        this.userList = []
      }
    },
    tableRowClassName ({ row }) {
      return this.currentPoint && row.id === this.currentPoint.id ? 'current-row' : ''
    },
    currentClick(row) {
      if (!row || (this.currentPoint && this.currentPoint.id === row.id)) {
        return
      }
      this.currentPoint = row
    }
  }
}
</script>

<style lang="scss">
.iplistconfig{
  display: flex;
  height:100%;
  width:100%;
  min-width:1200px;
  overflow: auto;
  box-sizing: border-box;
  background:#fff;
  padding:20px;
  .cloverLeft{
    width: 90px;
    height:100%;
    border-right: 1px solid #DCDFE6;
    li{
      margin-bottom: 20px;
      font-size:16px;
      font-weight:550;
      cursor: pointer;
    }
  }
  .searchPoint{
      width:340px;
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
      margin-bottom:10px;
    }
  }
  .wrap{
    width: calc(100% - 440px);
    display:flex;
    justify-content: space-between;
    height:100%;
  }
  .el-pagination{
    border-bottom: 1px solid #DCDFE6;
  }
  .tableWrap{
    border-top:1px solid #DCDFE6;
    // border-right:1px solid #DCDFE6;
    .el-table__body tr.current-row>td{
      background:rgb(68, 120, 241);
      color:#fff;
    }
    td{
      cursor: pointer;
    }
  }
  .ipinput{
    .el-form-item__content{
      display:flex;
      justify-content: space-around;
      .error{
        width: 115px;
        color:#f40;
        display:inline-block;
      }
    }
  }
}
</style>
