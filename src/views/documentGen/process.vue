<template>
  <div>
    <!-- 工序进度 -->
    <div id="top" style="padding:4px 0;">
      <!--表头项目状态，新增项目-->
      <div>
        <el-select
          v-model="value"
          placeholder="请选择项目状态"
          clearable
          @change="getgg(value)"
          size="mini"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button @click="getgg(freshvalue)"  size="mini" style="margin-left:10px">刷新</el-button>
      </div>
      <el-button type="primary" @click="open" v-hasPermi="['documentGenProcess:add']"  size="mini">新增</el-button>
    </div>
    <!--项目详情展示-->
    <div id="bottom">
      <template>
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :row-style="{ height: '30px' }"
          :cell-style="{ padding: '0px' }"
          :height="tableHeight"
        >
          <af-table-column
            prop="id"
            label="编号"
            align="center"
            width="80px"
          >
          </af-table-column>
          <af-table-column prop="file_name" label="文件名" align="center" width="220px"></af-table-column>
          <el-table-column prop="create_time" label="创建时间" align="center" width="170px">
            <template slot-scope="scope">
              <span>{{ ftime(scope.row.create_time) }} </span>
            </template>
          </el-table-column>
          <el-table-column prop="end_time" label="结束时间" align="center"  width="170px">
            <template slot-scope="scope">
              <span v-if="scope.row.status != 1"
                >{{ ftime(scope.row.end_time) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="70px" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.status === 1" style="color: orange">
                已创建
              </span>
              <span v-if="scope.row.status === 2" style="color: green">
                已生成</span
              >
              <span v-if="scope.row.status === 3" style="color: red">
                错误</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="message" label="执行信息" align="center">
          </el-table-column>
          <el-table-column
            prop="query_para"
            label="查询参数"
            align="center"
            style="display: flex; justify-content: space-around;"
            width="100px"
          >
            <template slot-scope="scope">
              <el-tooltip
                effect="dark"
                :content="scope.row.query_para"
                placement="top"
                :enterable="false"
                style="margin-left:8px"
              >
                <span style="border-bottom: 1px solid #719bff">参数</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80px">
            <template slot-scope="scope">
              <a
                :href="
                  scope.row.ftp_path.substr(0, scope.row.ftp_path.length - 1)
                "
                target="_blank"
                v-if="scope.row.status === 2"
                style="border-bottom: 1px solid #719bff ;text-decoration: none;"
                >下载</a
              >
            </template>
          </el-table-column>
        </el-table>
        <!--dialog弹框-->
        <el-dialog
          title="新增"
          :visible.sync="dialogFormVisible"
          @close="closeDialog"
        >
          <!--弹窗项目-->
          <el-form
            :model="form"
            size="small"
            ref="addFormRef"
            :rules="rules"
            label-position="right"
            label-width="70px"
          >
            <el-form-item label="项目" prop="project">
              <el-select
                v-model="form.project"
                placeholder="请选择"
                style="width: 100%"
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
            <!--弹窗子系统-->
            <el-form-item label="子系统" prop="childvalue">
              <el-select
                v-model="form.childvalue"
                multiple
                clearable
                collapse-tags
                style="width: 100%"
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
            <!--弹窗区域-->
            <el-form-item label="区域" prop="areavalue">
              <el-select
                v-model="form.areavalue"
                multiple
                clearable
                collapse-tags
                style="width: 100%"
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
            <!--弹窗工序-->
            <el-form-item label="工序" prop="procvalue">
              <el-cascader
                v-model="form.procvalue"
                :key="cascaderKey"
                :props="props"
                ref="myref"
                :options="procs"
                style="width: 100%"
                size="medium"
                clearable
                filterable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="点位状态" prop="status">
              <el-checkbox-group v-model="form.status">
                <el-checkbox v-for="item in statusList" :label="item.dict_label" :key="item.dict_label">{{item.dict_value}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="工序情况">
              <el-radio-group  v-model="form.audit_level">
                <el-radio v-for="item in proc_list" :label="item.dict_value" :key="item.dict_value">{{item.dict_label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button
                style="float: right; height: 40px"
                type="primary"
                @click="commit"
                >确认生成</el-button
              >
            </el-form-item>
          </el-form>
        </el-dialog>
      </template>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: '',
  data() {
    return {
      tableData: [],
      options: [],
      value: '',
      freshvalue: '',
      dialogFormVisible: false,
      projects: [],
      childs: [],
      areas: [],
      procs: [],
      cascaderKey: 1,
      props: { multiple: true },
      form: {
        project: null,
        project_id: '',
        projectvalue: '',
        childvalue: [],
        areavalue: [],
        procvalue: [],
        audit_level: 0,
        status: []
      },
      color: '',
      rules: {
        project: [
          {
            required: true,
            message: '请选择项目',
            trigger: 'change'
          }
        ],
        childvalue: [
          { required: false, message: '请选择子系统', trigger: 'change' }
        ],
        areavalue: [
          { required: false, message: '请输入区域', trigger: 'change' }
        ],
        procvalue: [
          { required: false, message: '请输入工序', trigger: 'change' }
        ]
      },
      area: '',
      proc_code: '',
      class_code: '',
      proc_list: [
        { dict_label: '已拍照', dict_value: 0 }, { dict_label: '已初审', dict_value: 1 }, { dict_label: '已终审', dict_value: 2 }
      ],
      statusList: [],
      tableHeight: window.innerHeight - 180
    }
  },
  mounted() {
    this.getgg()
    this.getStatusList()
    this.getOptions()
    this.init()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
  },
  methods: {
    // --日期格式--
    ftime(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    // --获取项目数据
    async getgg(value) {
      var req = {}
      this.freshvalue = value
      if (value === '' || value === 4) {
        req = {
          user_id: this.$store.state.userInfo.id,
          gen_type: 1
        }
      } else {
        req = {
          user_id: this.$store.state.userInfo.id,
          gen_type: 1,
          status: value
        }
      }
      const result = await this.$pub.post(
        '/gen/gen-list',
        JSON.stringify(req),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      this.tableData = result.data
    },
    // --dialog获取项目--
    open() {
      this.dialogFormVisible = true
    },
    closeDialog() {
      this.$refs.addFormRef.resetFields()
      this.dialogFormVisible = false
    },
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (result.code === 200) {
          if (result.data !== null) {
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
          return
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    // --dialog点击项目栏重置--
    handleProjectChange(value) {
      if (value !== null) {
        this.form.projectvalue = value.projectCode
        this.form.project_id = value.id

        this.form.childvalue = []
        this.childs = []
        this.form.areavalue = []
        this.areas = []
        this.form.status = []
        this.getChildSystemList()
        this.getAreaList()
        this.getProc()
      }
    },
    // --dialog获取子系统--
    async getChildSystemList() {
      if (this.form.projectvalue === null) {
        return
      }
      try {
        const result = await this.$pub.post('project/child-list', { project_id: this.form.project_id })
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
    },

    // --dialog获取区域--
    async getAreaList() {
      if (this.form.projectvalue === null) {
        return
      }
      try {
        const result = await this.$pub.post(
          'project/area-list',
          { project_id: this.form.project_id }
        )
        if (result.code === 200) {
          if (result.data !== null) {
            this.areas = result.data.map(item => {
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
    },
    async getStatusList() {
      try {
        const req = { dict_label: 'point_status' }
        const { data, code, message } = await this.$pub.post('/sys/dict/list-slt', req)
        if (Number(code) === 200) {
          this.statusList = (data || []).map(m => {
            return {
              dict_value: m.label,
              dict_label: Number(m.value)
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
    getOptions() {
      this.$dict(this, 'documentStatus').then(res => {
        if (res.code === 200) {
          this.options = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了documentStatus',
            showClose: true
          })
          this.options = []
        }
      })
    },
    getChildList(value) {
      var childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem, cindex) => {
          childs.push({ value: citem.procCode, label: citem.procName })
        })
      }
      // 添加子分类
      if (value.classChild !== undefined && value.classChild !== null) {
        value.classChild.map((sitem, sindex) => {
          var subChilds = []
          if (sitem.classChild !== null) {
            subChilds = this.getChildList(sitem.classChild)
          }
          childs.push({
            value: sitem.classCode,
            label: sitem.className,
            children: subChilds
          })
        })
      }
      return childs
    },
    // --获取工序列表--
    async getProc() {
      if (this.form.projectvalue === null) {
        return
      }
      try {
        const params = {
          project_code: this.form.projectvalue,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        if (code === 200) {
          var tmparr = [];
          (data || []).map((item, index) => {
            var childs = []
            childs = this.getChildList(item)
            var tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
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
    async sendMessage() {
      try {
        var req = {
          project_code: this.form.projectvalue,
          user_id: this.$store.state.userInfo.id,
          user_name: this.$store.state.userInfo.userName,
          proc_code: this.proc_code,
          class_code: this.class_code,
          area: this.area,
          audit_level: this.form.audit_level,
          status: this.form.status,
          child_code: this.form.childvalue.join(',')
        }
        const result = await this.$pub.post(
          '/gen/proc-table',
          JSON.stringify(req),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (result.code === 200) {
          this.$message({
            type: 'success',
            message: result.data || '新增成功',
            showClose: true
          })
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
      this.getgg()
    },
    commit() {
      // -- 处理所需参数proc_code，class_code--
      var proccode = ''
      var classcode = ''
      let checkArr = this.$refs.myref.getCheckedNodes()
      checkArr = checkArr.filter(
        (item) => !(item.parent && item.parent.checked)
      )
      if (checkArr.length) {
        for (var i = 0; i < checkArr.length; i++) {
          if (checkArr[i].level === 1) {
            classcode += checkArr[i].value + ','
          } else {
            proccode += checkArr[i].data.value + ','
          }
        }
      }
      classcode = classcode.substr(0, classcode.length - 1)
      proccode = proccode.substr(0, proccode.length - 1)
      this.proc_code = proccode
      this.class_code = classcode
      // -- 处理所需参数area--
      var areaString = ''
      if (this.form.areavalue.length) {
        for (var j = 0; j < this.form.areavalue.length; j++) {
          areaString += this.form.areavalue[j] + ','
        }
        areaString = areaString.substr(0, areaString.length - 1)
        this.area = areaString
      }
      var _self = this
      this.$refs.addFormRef.validate(function(isValid) {
        if (isValid) {
          _self.sendMessage()
          _self.$refs.addFormRef.resetFields()
          _self.dialogFormVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
#top {
  display: flex;
  justify-content: space-between;
}
</style>
<style>
.el-input__inner {
    border-radius: 0px !important;
}
</style>
