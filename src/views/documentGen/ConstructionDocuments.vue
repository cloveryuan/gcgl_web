<template>
  <div>
    <!-- 施工文档 -->
    <el-row  style="padding:4px 0px">
      <el-col :span="12" >
        <el-select
          style="z-index: 2; position: relative"
          v-model="value"
          placeholder="请选择项目状态"
          clearable
          @change="getTableData(value)"
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
        <el-button  size="mini" @click="getTableData(freshvalue)" style="margin-left:10px">刷新</el-button >
      </el-col>
      <el-col :span="12">
        <!-- 文件生成弹框部分 -->
        <el-button size="mini"  style="float: right" type="primary" @click="foo">新增</el-button>
        <el-dialog
          title="新增"
          :visible.sync="dialogFormVisible"
          @close="closeDialog"
          append-to-body
        >
          <el-form
            ref="addFormRef"
            :model="form"
            size="medium"
            :rules="rules"
            label-position="right"
            label-width="100px"
          >
            <!-- 项目 -->
            <el-form-item label="项目 " prop="project">
              <el-select
                v-model="form.project"
                placeholder="请选择"
                style="width: 90%"
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
                style="width: 90%"
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
            <el-form-item label="区域 " prop="areavalue">
              <el-select
                v-model="form.areavalue"
                multiple
                clearable
                collapse-tags
                style="width: 90%"
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
            <el-form-item label="工序 " prop="procvalue">
              <el-cascader
                v-model="form.procvalue"
                :key="cascaderKey"
                :props="props"
                ref="myref"
                :options="procs"
                style="width: 90%"
                size="medium"
                clearable
                filterable
                @change="changepro"
              >
                <template slot-scope="{ node, data }">
                  <span>{{ data.label }}</span>
                  <span
                    v-if="data.isChild"
                    style="margin-left:40px;float:right"
                  >
                    全部照片:<el-checkbox
                      :value="node.checked ? data.isFull : false"
                      :disabled="!node.checked"
                      @change="(checked) => changeIsFull(data, checked)"
                    />
                  </span>
                </template>
              </el-cascader>
            </el-form-item>
            <el-form-item label="点位 " prop="pointvalue" class="selinset">
              <el-select
                v-model="form.pointvalue"
                :key="cascaderKey"
                multiple
                filterable
                remote
                reserve-keyword
                clearable
                style="width: 90%"
                placeholder="请输入点位"
                :remote-method="remoteMethod"
                :loading="loading"
                :popper-append-to-body="false"
              >
                <el-option
                  v-for="item in points"
                  :key="item.value"
                  :value="item.value"
                >
                  <div>
                    <span>{{ item.value }}</span>
                    <span style="margin-left:10px;"> / {{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="单独生成文件">
              <el-radio-group v-model="form.is_single">
                <el-radio label="yes">是</el-radio>
                <el-radio label="no">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="导出已审照片">
              <el-radio-group v-model="form.audit_status">
                <el-radio :label="statu.yes">已审</el-radio>
                <el-radio :label="statu.no">未审核</el-radio>
                <el-radio :label="statu.all">全部</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="commit">确 定</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
    <el-row>
      <el-table
        :data="tableData"
        :header-cell-style="{ 'text-align': 'center' }"
        :row-style="{ height: '30px' }"
        :cell-style="{ 'text-align': 'center', padding: '0px' }"
        border
        style="width: 100%; position: relative"
        :height="tableHeight"
      >
        <el-table-column prop="id"  width="80px" label="编号" align="center">
        </el-table-column>
        <el-table-column prop="file_name" label="文件名" width="220px" align="center" > </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="create_time"
          label="创建时间"
          width="170px"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ ftime(scope.row.create_time) }} </span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="end_time"
          label="结束时间"
          align="center"
          width="170px"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.status != 1"
              >{{ ftime(scope.row.end_time) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.status === 1" style="color: orange">
              已创建
            </span>
            <span v-if="scope.row.status === 2" style="color: green">
              已生成</span
            >
            <span v-if="scope.row.status === 3" style="color: red"> 错误</span>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行信息" align="center"> </el-table-column>
        <el-table-column label="操作" align="center" width="80px">
            <template slot-scope="scope">
              <a
                :href="scope.row.ftp_path.substr(0, scope.row.ftp_path.length - 1)"
                v-if="scope.row.status === 2"
                style="border-bottom: 1px solid #719bff ;text-decoration: none;"
                >下载</a>
              <!-- <span class="el-link el-link--primary" v-if="scope.row.status === 2"  style="border-bottom: 1px solid #719bff ;text-decoration: none;"  @click="importFile(scope.row)">导入模板</span> -->
            </template>
          </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { downFileA } from '@/utils/tool'
export default {
  name: '',
  data() {
    return {
      options: [],
      value: '',
      loading: false,
      tableData: [],
      dialogFormVisible: false,
      projects: [],
      points: [],
      childs: [],
      areas: [],
      procs: [],
      cascaderKey: 1,
      props: { multiple: true },
      form: {
        project: null,
        project_id: '',
        projectvalue: null,
        pointvalue: [],
        childvalue: [],
        areavalue: [],
        procvalue: [],
        is_single: 'no',
        audit_status: 'yes',
        proc_code: '',
        is_full: ''
      },
      statu: {
        yes: 'yes',
        no: 'no',
        all: 'all'
      },
      freshvalue: '',
      rules: {
        project: [
          { required: true, message: '请选择项目', trigger: 'blur' }
        ],
        childvalue: [
          { required: false, message: '请选择子系统', trigger: 'change' }
        ],
        areavalue: [
          { required: false, message: '请选择区域', trigger: 'change' }
        ],
        procvalue: [
          { required: false, message: '请选择工序', trigger: 'change' }
        ],
        pointvalue: [
          { required: false, message: '请选择点位', trigger: 'change' }
        ]
      },
      formLabelWidth: '120px',
      area: '',
      keywords: '',
      proc_code: '',
      class_code: '',
      pointCode: '',
      childCode: '',
      isCheckedData: [],
      tableHeight: window.innerHeight - 180
    }
  },
  computed: {},
  mounted() {
    this.getTableData()
    this.init()
    this.getOptions()
    this.list = this.points.map((item) => {
      return { value: `value:${item}`, label: `label:${item}` }
    })
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
  },
  components: {},
  methods: {
    downFileA,
    ftime(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    foo() {
      this.dialogFormVisible = true
    },
    closeDialog() {
      this.$refs.addFormRef.resetFields()
      this.form.project = null
      this.form.projectvalue = null
      this.form.project_id = ''
      this.form.childvalue = []
      this.form.areavalue = []
      this.form.pointvalue = []
      this.form.procvalue = []
      this.dialogFormVisible = false
      this.points = []
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
    async getTableData(value) {
      var req = {}
      this.freshvalue = value
      if (value === '' || value === 4) {
        req = {
          user_id: this.$store.state.userInfo.id,
          gen_type: 2
        }
      } else {
        req = {
          user_id: this.$store.state.userInfo.id,
          gen_type: 2,
          status: value
        }
      }
      const result = await this.$pub.post(
        '/gen/gen-list',
        JSON.stringify(req),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      this.tableData = result.data
    },
    // dialog项目数据
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (Number(result.code) === 200) {
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
          // return;
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
        this.form.pointvalue = []
        this.points = []
        this.form.procvalue = []
        this.getChildSystemList()
        this.getAreaList()
        this.getProc()
      }
    },
    // 获取点位下拉列表数据
    async remoteMethod(value) {
      if (this.form.projectvalue === null) {
        this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目!',
          showClose: true
        })
        return
      }
      if (value !== '') {
        this.loading = true
        this.keywords = value
        try {
          var req = {
            area: this.form.areavalue,
            childCode: this.form.childvalue,
            keywords: value,
            procCode: null,
            projectCode: this.form.projectvalue,
            type: 3,
            userId: this.$store.state.userInfo.id
          }
          const result = await this.$pub.post('/point/map/list', req)

          if (Number(result.code) === 200) {
            if (result.data.list !== null) {
              this.loading = true
              this.points = result.data.list.map((item, index) => {
                return {
                  value: item.pointCode,
                  label: item.pointName
                }
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
      }
    },
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

    // 获取具体工序（工序的子菜单）
    getChildList(value) {
      var childs = []
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem, cindex) => {
          childs.push({
            value: citem.procCode,
            label: citem.procName,
            isChild: true,
            isFull: false
          })
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
    async sendMessage() {
      try {
        const obj = {
          project_code: this.form.projectvalue,
          user_id: this.$store.state.userInfo.id,
          user_name: this.$store.state.userInfo.userName,
          area: this.area,
          class_code: this.class_code,
          // proc_code: this.proc_code,
          child_code: this.form.childvalue.join(','),
          point_code: this.form.pointvalue.join(','),
          is_single: this.form.is_single,
          proc_code: this.form.proc_code,
          is_full: this.form.is_full
        }
        const req = this.form.audit_status === 'yes' ? { // 已审
          ...obj,
          audit_status: [1, 3]
        } : this.form.audit_status === 'no' ? { // 未审
          ...obj,
          audit_status: [0]
        } : { // 全部
          ...obj,
          audit_status: [0, 1, 3]
        }
        const result = await this.$pub.post(
          '/gen/struct-doc',
          JSON.stringify(req),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (Number(result.code) === 200) {
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
      this.getTableData()
    },
    commit() {
      // -- 处理所需参数proc_code，class_code--

      var classcode = ''
      var isFull = ''
      var ProCode = ''
      const checkArr = this.$refs.myref.getCheckedNodes()
      // console.log(checkArr);
      checkArr.map(function(item) {
        // console.log(item);
        if (item.level === 1) {
          var flage = true
          for (var i = 0; i < item.children.length; i++) {
            if (item.children[i].data.isFull) {
              flage = false
              break
            }
          }
          if (flage === true) {
            classcode += item.data.value + ','
          }
          if (flage === false) {
            for (var j = 0; j < item.children.length; j++) {
              if (item.children[j].data.isFull) {
                isFull += item.children[j].data.value + ','
              } else if (!item.children[j].data.isFull) {
                ProCode += item.children[j].data.value + ','
              }
            }
          }
        }
      })
      const checkNow = checkArr.filter(
        (item) => !(item.parent && item.parent.checked)
      )
      if (checkNow.length) {
        for (var k = 0; k < checkNow.length; k++) {
          if (checkNow[k].level === 2) {
            if (checkNow[k].data.isFull === true) {
              isFull += checkNow[k].data.value + ','
            } else {
              ProCode += checkNow[k].data.value + ','
            }
          }
        }
      }
      classcode = classcode.substr(0, classcode.length - 1)
      isFull = isFull.substr(0, isFull.length - 1)
      ProCode = ProCode.substr(0, ProCode.length - 1)
      this.form.proc_code = ProCode
      this.form.is_full = isFull
      this.class_code = classcode
      console.log(this.class_code)
      console.log(this.form.is_full)
      console.log(this.form.proc_code)
      // -- 处理所需参数area--
      var areaString = ''

      if (this.form.areavalue.length) {
        for (var j = 0; j < this.form.areavalue.length; j++) {
          areaString += this.form.areavalue[j] + ','
        }
        areaString = areaString.substr(0, areaString.length - 1)
        this.area = areaString
      } else {
        this.area = ''
      }
      var _self = this
      this.$refs.addFormRef.validate(function(isValid) {
        if (isValid) {
          _self.sendMessage()
          // _self.$refs.addFormRef.resetFields();
          _self.form.childvalue = []
          _self.form.areavalue = []
          _self.form.pointvalue = []
          _self.dialogFormVisible = false
          _self.getTableData()
        } else {
          return false
        }
      })
    },
    changeIsFull(data, checked) {
      data.isFull = checked
    },
    changepro(arr) {
      if (this.isCheckedData.length > arr.length) {
        const node = this.isCheckedData.filter(
          (f) => !arr.some((s) => f.toString() === s.toString())
        )[0]
        this.procs.forEach((f, i) => {
          if (f.value === node[0]) {
            f.children.some((m) => {
              if (m.value === node[1]) {
                m.isFull = false
                return true
              }
            })
          }
        })
      }
      this.isCheckedData = arr
    },
    importFile(row) {
      const url = row.ftp_path.substr(0, row.ftp_path.length - 1)
      this.downFileA(url, row.file_name)
    }
  }
}
</script>

<style scoped>
.selinset
  .el-select-dropdown.is-multiple
  .el-select-dropdown__item.selected:after {
  position: absolute;
  right: 20px;
  top: 0px;
  font-family: element-icons;
  content: "\E6DA";
  font-size: 12px;
  font-weight: 700;
}
</style>
<style>
.el-input__inner {
    border-radius: 0px !important;
}
</style>
