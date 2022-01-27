<template>
  <div class="iplistWrap">
    <div class="btns">
      <el-button type="primary" @click="add" size="mini">新增IP</el-button>
    </div>
    <el-table :data="tableData" v-loading="tableLoading" :height="tableHeight" style="width: 100%">
      <el-table-column type="index" label="序号" ></el-table-column>
      <el-table-column prop="device_name" label="设备名称" ></el-table-column>
       <el-table-column prop="device_model_name" label="设备型号名称" ></el-table-column>
      <el-table-column prop="device_model" label="设备型号" width="200"></el-table-column>
      <el-table-column prop="device_account" label="账号" width="200"></el-table-column>
      <el-table-column prop="device_ip" label="IP地址" width="200"></el-table-column>
      <el-table-column prop="status_name" label="状态" width="100"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <span class="cursor" @click="showInfo(scope.row)">详情</span>
          <el-dropdown @command="handleCommand">
            <span class="cursor">更多</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'edit',2)" v-if="editPerm.includes(scope.row.status)"><i class="el-icon-edit"></i>编辑</el-dropdown-item>
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'register',3)" v-if="scope.row.status==='0'"><i class="el-icon-s-platform"></i>登记</el-dropdown-item>
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'check',4)" v-if="scope.row.status==='1'"><i class="el-icon-check"></i>审核</el-dropdown-item>
              <!-- <el-dropdown-item :command="beforeHandleCommand(scope.row,'pass',5)"><i class="el-icon-files"></i>通道</el-dropdown-item> -->
              <el-dropdown-item :command="beforeHandleCommand(scope.row,'delete')"><i class="el-icon-delete"></i>删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 详情 -->
    <el-dialog append-to-body :close-on-click-modal="false"  :visible.sync="infoDialog"  title="设备详情" width="700px" class="lpdes">
      <el-descriptions title="设备信息" direction="vertical" :column="4" border v-loading="infoLoading" v-if="currentRow" size="mini">
        <el-descriptions-item label="设备名称" :span="4">{{currentRow.device_name?currentRow.device_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="设备型号名称">{{currentRow.device_model_name?currentRow.device_model_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{currentRow.device_ip?currentRow.device_ip:'-'}}</el-descriptions-item>
        <el-descriptions-item label="设备型号" >{{currentRow.device_model?currentRow.device_model:'-'}}</el-descriptions-item>
        <el-descriptions-item label="序列号">{{currentRow.device_sn?currentRow.device_sn:'-'}}</el-descriptions-item>
        <el-descriptions-item label="子网掩码">{{currentRow.device_mask?currentRow.device_mask:'-'}}</el-descriptions-item>
        <el-descriptions-item label="网关" >{{currentRow.device_gateway?currentRow.device_gateway:'-'}}</el-descriptions-item>
        <el-descriptions-item label="Mac地址">{{currentRow.device_mac?currentRow.device_mac:'-'}}</el-descriptions-item>
        <el-descriptions-item label="端口">{{currentRow.device_port?currentRow.device_port:'-'}}</el-descriptions-item>
        <el-descriptions-item label="账号" >{{currentRow.device_account?currentRow.device_account:'-'}}</el-descriptions-item>
        <el-descriptions-item label="密码">{{currentRow.device_pass?currentRow.device_pass:'-'}}</el-descriptions-item>
        <el-descriptions-item label="状态">{{currentRow.status_name?currentRow.status_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="接入平台" >-</el-descriptions-item>
        <el-descriptions-item label="行车方向">{{currentRow.device_car_direction_name?currentRow.device_car_direction_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="设备朝向" >{{currentRow.device_direction_name?currentRow.device_direction_name:'-'}}</el-descriptions-item>
      </el-descriptions>
      <div class="tdinfo">
        <h4 class="el-descriptions__header">通道信息</h4>
        <el-table :data="camera_list" :height="cameraHeight" v-loading="infoLoading" style="width: 100%" border>
          <el-table-column prop="camera_sn" label="国标编码" width="80" align="center"></el-table-column>
          <el-table-column prop="camera_code" label="通道编号" show-overflow-tooltip  align="center"></el-table-column>
          <el-table-column prop="camera_name" label="通道名称" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="camera_num" label="通道信号" width="80" align="center"></el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <!-- 编辑 新增等模块 -->
    <el-dialog append-to-body :close-on-click-modal="false"  :visible.sync="dialog" :title="title" width="850px" @closed="cancle" class="editIP">
      <el-row v-loading="modalLoading">
        <el-form ref="form" size="small" :model="form" :rules="rules" label-width="80px" >
          <el-col :span="24" v-if="type===4">
            <el-form-item label="添加描述" >
              <el-input v-model="form.remark" type="textarea" :disabled="true"/>
            </el-form-item>
          </el-col>

          <!-- 是新增才有 -->
          <template v-if="type===1">
            <el-col :span="12" >
              <span class="item__label">IP开始</span>
              <el-form-item prop="ipD.o" class="inp" label-width="0">
                <el-input v-model="form.ipD.o" />
              </el-form-item>
              <span class="squar"></span>
              <el-form-item prop="ipD.t" class="inp" label-width="0">
                <el-input v-model="form.ipD.t"  />
              </el-form-item>
              <span class="squar"></span>
              <el-form-item prop="ipD.th" class="inp" label-width="0">
                <el-input v-model="form.ipD.th" />
               </el-form-item>
               <span class="squar"></span>
              <el-form-item prop="ipD.f" class="inp" label-width="0">
                <el-input v-model="form.ipD.f" />
              </el-form-item>
            </el-col>
            <el-col :span="12" >
              <span class="item__label">IP结束</span>
              <el-form-item prop="ipD.o" class="inp" label-width="0">
                <el-input v-model="form.ipD.o" disabled />
              </el-form-item>
              <span class="squar"></span>
              <el-form-item prop="ipD.t" class="inp" label-width="0">
                <el-input v-model="form.ipD.t" disabled  />
              </el-form-item>
              <span class="squar"></span>
              <el-form-item prop="ipD.th" class="inp" label-width="0">
                <el-input v-model="form.ipD.th" disabled />
               </el-form-item>
               <span class="squar"></span>
              <el-form-item prop="ipD.five" class="inp" label-width="0">
                <el-input v-model="form.ipD.five" />
              </el-form-item>
            </el-col>
          </template>
           <!-- 不是新增才有 -->
           <template v-else>
            <el-col :span="12">
              <el-form-item label="设备名称" prop="device_name" >
                <el-input v-model="form.device_name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="IP地址" prop="device_ip" >
                <el-input v-model="form.device_ip" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备类型" prop="model" >
                <el-select v-model="form.model" value-key="device_model" style="width:100%;" clearable @change="deviceChange">
                  <el-option
                    v-for="item in device_modelList"
                    :key="item.id"
                    :label="item.device_name"
                    :value="item"
                    >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备编码" prop="device_code" >
                <el-input v-model="form.device_code" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="序列号" prop="device_sn" >
                <el-input v-model="form.device_sn" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Mac地址" prop="device_mac" >
                <el-input v-model="form.device_mac" />
              </el-form-item>
            </el-col>
           </template>

          <!-- 全部都有 -->
          <el-col :span="12">
            <el-form-item label="子网掩码" prop="device_mask" >
              <el-input v-model="form.device_mask" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网关" prop="device_gateway" >
              <el-input v-model="form.device_gateway" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂商平台" prop="sys" >
              <el-select v-model="form.sys"  value-key="id" style="width:100%;" filterable @change="sysChange">
                <el-option
                  v-for="item in sysList"
                  :key="item.id"
                  :label="item.sys_name"
                  :value="item"
                  >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="device_port" >
              <el-input v-model="form.device_port" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号" prop="device_account" >
              <el-input v-model="form.device_account" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="device_pass" >
              <el-input v-model="form.device_pass" />
            </el-form-item>
          </el-col>

          <!-- 不是新增才有 -->
          <template v-if="type!==1">
            <el-col :span="12">
              <el-form-item label="行车方向" prop="device_car_direction">
                <el-select  v-model="form.device_car_direction" clearable style="width:100%;" placeholder="请选择行车方向" >
                  <el-option
                    v-for="item in directList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备朝向" prop="device_direction">
                <el-select  v-model="form.device_direction" style="width:100%;" clearable  placeholder="请选择设备朝向" >
                  <el-option
                    v-for="item in device_directList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </template>
          <ul v-if="errorList.length>0" style="color:#f40;">
            <li>插入错误：</li>
            <li v-for="(item,i) in errorList" :key="i">{{item}}</li>
          </ul>

        </el-form>
        <el-col :span="24" class="modalBtns">
          <!-- 新增 编辑 -->
          <template v-if="type===1 || type===2">
            <el-button type="primary" @click="addEditSave" size="mini">保存</el-button>
            <el-button @click="cancle" size="mini">取消</el-button>
          </template>

          <!-- 登记 -->
          <template v-if="type===3">
            <el-button type="primary" @click="configRegister" size="mini">登记</el-button>
            <el-button @click="cancle" size="mini">取消</el-button>
          </template>

          <!-- 审核 -->
          <template v-if="type===4">
            <el-button type="primary" @click="approved(1)" size="mini">通过</el-button>
            <el-button type="primary" @click="approved(2)" size="mini">作废</el-button>
            <el-button @click="cancle" size="mini">取消</el-button>
          </template>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'iplist',
  inject: ['pointInfo', 'project_id', 'project_code'],
  data () {
    return {
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 130,
      dialog: false,
      form: {
        ip_start: null,
        ip_end: null,
        ipD: {
          o: '',
          t: '',
          th: '',
          f: '',
          five: ''
        },
        sys: null,
        device_name: '',
        remark: '',
        device_ip: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        device_car_direction: '',
        device_direction: '',
        device_code: '',
        model: null,
        device_id: '',
        device_model: '',
        device_sn: '',
        status: '0',
        id: ''
      },
      type: 1, // 1新增，2编辑，3登记，4审核，5通道
      sysList: [],
      directList: [],
      device_directList: [],
      device_modelList: [],
      title: '设备信息',
      modalLoading: false,
      currentRow: null,
      infoDialog: false,
      infoLoading: false,
      camera_list: [],
      cameraHeight: 300,
      editPerm: ['0', '1'],
      errorList: []
    }
  },
  computed: {
    rules() {
      var ipValid = (rule, value, callback) => {
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if ((!reg.test(value)) && value !== '') {
          callback(new Error('格式不正确'))
        } else {
          callback()
        }
      }
      var protValid = (rule, value, callback) => {
        const reg = /^\d*$/ // ^[0-9]*$
        if ((!reg.test(value)) && value !== '') {
          callback(new Error('端口号格式不正确'))
        } else {
          callback()
        }
      }
      var ipDO = (rule, value, callback) => {
        // const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        const reg = /^([1-9]{0,1}\d|1\d\d|2[0-4]\d|25[0-5])$/
        if ((!reg.test(value)) && value !== '') {
          callback(new Error('必须0-255'))
        } else {
          callback()
        }
      }
      var ipFValid = (rule, value, callback) => {
        if (!this.form.ipD.five) {
          callback()
        } else {
          if ((Number(this.form.ipD.f) > Number(this.form.ipD.five))) {
            callback(new Error('须<=结束IP'))
          } else if ((Number(this.form.ipD.f) + 20) < Number(this.form.ipD.five)) {
            callback(new Error('IP区间<=20'))
          } else {
            callback()
          }
        }
      }
      var ipFiveValid = (rule, value, callback) => {
        if (!this.form.ipD.f) {
          callback()
        } else {
          this.$refs.form.validateField('ipD.f')
          if ((Number(this.form.ipD.f) > Number(this.form.ipD.five))) {
            callback(new Error('须>=开始IP'))
          } else if ((Number(this.form.ipD.f) + 20) < Number(this.form.ipD.five)) {
            callback(new Error('IP区间<=20'))
          } else {
            callback()
          }
        }
      }
      const tempArr = {
        device_ip: [
          { required: true, message: '请输入IP', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ],
        device_mask: [
          { required: true, message: '请输入子网掩码', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ],
        device_port: [
          { required: true, message: '请输入端口号', trigger: 'blur' },
          { validator: protValid, trigger: 'blur' }
        ],
        device_gateway: [
          { required: true, message: '请输入网关', trigger: 'blur' },
          { validator: ipValid, trigger: 'blur' }
        ],
        device_account: [
          { required: true, message: '请输入账号', trigger: 'change' }
        ],
        device_pass: [
          { required: true, message: '请输入密码', trigger: 'change' }
        ]
      }
      if (this.type === 1) { // 1新增
        return {
          ...tempArr,
          'ipD.o': [
            { required: true, message: '请输入IP', trigger: 'change' },
            { validator: ipDO, trigger: 'change' }
          ],
          'ipD.t': [
            { required: true, message: '请输入IP', trigger: 'change' },
            { validator: ipDO, trigger: 'change' }
          ],
          'ipD.th': [
            { required: true, message: '请输入IP', trigger: 'change' },
            { validator: ipDO, trigger: 'change' }
          ],
          'ipD.f': [
            { required: true, message: '请输入IP', trigger: 'blur' },
            { validator: ipDO, trigger: 'blur' },
            { validator: ipFValid, trigger: 'blur' }
          ],
          'ipD.five': [
            { required: true, message: '请输入IP', trigger: 'blur' },
            { validator: ipDO, trigger: 'blur' },
            { validator: ipFiveValid, trigger: 'blur' }
          ]
        }
      } else if (this.type === 3) { // 设备朝向必填
        return {
          ...tempArr,
          device_direction: [
            { required: true, message: '请选择设备朝向', trigger: 'blur' }
          ]
        }
      } else if (this.type === 4) { // 审核
        return {
          ...tempArr
        }
      } else { // 2编辑
        return tempArr
      }
    }
  },
  created() {
    this.getDictList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 130
    }
    this.getTableData()
  },
  components: {

  },
  methods: {
    getDictList() {
      this.$dict(this, 'device_car_direction').then((res) => {
        if (res.code === 200) {
          this.directList = res.data || []
        } else {
          this.$message.error('出错了device_car_direction')
          this.directList = []
        }
      })
      this.$dict(this, 'device_direction').then((res) => {
        if (res.code === 200) {
          this.device_directList = res.data || []
        } else {
          this.$message.error('出错了device_direction')
          this.device_directList = []
        }
      })
    },
    async getSysList() {
      const params = {
        status: '0',
        project_code: this.project_code,
        sys_name: ''
      }
      const { code, data } = await this.$pub.post('/project/sys/list-slt', params)
      if (code === 200) {
        this.sysList = data.list || []
      } else {
        this.$message({
          type: 'error',
          message: '获取厂商列表失败',
          showClose: true
        })
      }
    },
    async getTableData() {
      this.tableLoading = true
      const { code, data } = await this.$pub.post('/point/device/device-list', { point_id: Number(this.pointInfo.point_id) })
      if (code === 200) {
        this.tableData = data.list || []
      } else {
        this.$message.error('出错了/point/device/device-list')
        this.tableData = []
      }
      this.tableLoading = false
    },
    async showInfo(row) {
      this.infoLoading = true
      this.infoDialog = true
      const { code, data } = await this.$pub.post('/point/device/device-info', { id: row.id })
      if (code === 200) {
        this.currentRow = data.device_info
        this.camera_list = data.camera_list
        this.infoLoading = false
        this.$nextTick(() => {
          const _el = document.getElementsByClassName('lpdes')
          if (_el[0]) {
            const _header = _el[0].getElementsByClassName('el-descriptions')
            const top_height = _header[0].offsetHeight
            const _height = window.innerHeight
            this.cameraHeight = _height - 240 - top_height
          }
        })
      } else {
        this.$message.error('出错了point/device/device-info')
      }
    },
    /**
     * 动态设置Dropdown的command
    */
    beforeHandleCommand(row, command, type) {
      return {
        row: row,
        type: type,
        command: command
      }
    },
    async handleCommand(command) {
      this.currentRow = command.row
      this.type = command.type
      if (command.command === 'delete') {
        this.delete()
      } else if (command.command === 'pass') {
      } else {
        this.modalLoading = true
        this.getSysList()
        this.dialog = true
        const msg = this.type === 2 ? '编辑' : this.type === 3 ? '登记' : this.type === 4 ? '审核' : ''
        this.title = msg + '设备信息'
        const params = {
          point_id: Number(this.pointInfo.point_id)
        }
        const { code, data } = await this.$pub.post('/point/device/device-design-list', params)
        if (code === 200) {
          this.device_modelList = data.list || []
          this.form.model = this.currentRow.device_model ? {
            id: Number(this.currentRow.device_id),
            device_name: this.currentRow.device_model_name,
            device_model: this.currentRow.device_model
          } : null
          this.form = { ...this.form, ...this.currentRow }
          this.form.device_direction = this.currentRow.device_direction === '0' ? '' : this.currentRow.device_direction// 朝向
          this.form.device_car_direction = this.currentRow.device_car_direction === '0' ? '' : this.currentRow.device_car_direction // 行车方向
        } else {
          this.$message({
            type: 'error',
            message: '获取设备列表失败',
            showClose: true
          })
        }
        this.modalLoading = false
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    sysChange() {
      this.form.device_account = this.form.sys.sys_account
      this.form.device_pass = this.form.sys.sys_pass
      this.form.device_port = this.form.sys.sys_port
    },
    deviceChange() {
      this.form.device_id = this.form.model.id
      this.form.device_model = this.form.model.device_model
    },
    add() {
      this.getSysList()
      this.dialog = true
      this.type = 1
      this.title = '新增设备信息'
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    async delete() {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await this.$pub.post('point/device/device-del', { id: this.currentRow.id })
        if (code === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!',
            showClose: true
          })
          this.getTableData()
        } else {
          this.$message({
            type: 'error',
            message: '删除失败',
            showClose: true
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    async addEditSave() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.modalLoading = true
          const url = this.type === 1 ? 'point/device/device-add' : 'point/device/device-edit'
          const msg = this.type === 1 ? '新增' : '编辑'
          const {
            device_code, device_model, device_id, device_sn, device_name, device_ip, device_mask, device_gateway, device_mac, device_port, device_account, device_pass, device_car_direction, device_direction, status
          } = this.form
          const params = {
            device_port, // 设备端口
            device_mask, // 子网掩码
            device_gateway, // 网关
            device_account, // 账号
            device_pass // 密码
          }
          const allparams = this.type === 1 ? {
            ...params,
            project_id: this.project_id, // 项目Id
            project_code: this.project_code, // 项目编号
            point_id: Number(this.pointInfo.point_id), // 点位id
            point_code: this.pointInfo.point_code, // 点位编号
            child_code: this.pointInfo.child_code, // 子系统变很好
            create_user: this.$store.state.userInfo.id,
            device_start_ip: this.form.ipD.o + '.' + this.form.ipD.t + '.' + this.form.ipD.th + '.' + this.form.ipD.f,
            device_end_ip: this.form.ipD.o + '.' + this.form.ipD.t + '.' + this.form.ipD.th + '.' + this.form.ipD.five
          } : {
            ...params,
            device_code, // 设备编码
            device_model, // 设备类型
            device_id: Number(device_id), // 设备类型id
            device_name, // 设备名称
            device_ip, // 设备ip
            device_mac, // mac地址
            device_sn, // 序列号
            device_direction: device_direction === '' ? 0 : Number(device_direction), // 朝向
            device_car_direction: device_car_direction === '' ? 0 : Number(device_car_direction), // 行车方向
            status, // 状态
            id: this.form.id, // 主键
            update_user: this.$store.state.userInfo.id
          }
          const { code, data } = await this.$pub.post(url, allparams)
          if (code === 200) {
            if (this.type === 1 && data.err_list && data.err_list.length > 0) {
              this.errorList = data.err_list
            } else {
              this.cancle()
              this.$message({
                type: 'success',
                message: msg + '成功',
                showClose: true
              })
            }
            this.getTableData()
          } else {
            this.$message({
              type: 'error',
              message: msg + '失败',
              showClose: true
            })
          }
          this.modalLoading = false
        }
      })
    },
    // 登记
    async configRegister() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.modalLoading = true
          const {
            device_code, device_model, device_id, device_sn, device_name, device_ip, device_mask, device_gateway, device_mac, device_port, device_account, device_pass, device_car_direction, device_direction
          } = this.form
          const params = {
            device_code, // 设备编码
            device_model, // 设备类型
            device_id: Number(device_id), // 设备类型id
            device_name, // 设备名称
            device_ip, // 设备ip
            device_port, // 设备端口
            device_mask, // 子网掩码
            device_gateway, // 网关
            device_mac, // mac地址
            device_sn, // 序列号
            device_account, // 账号
            device_pass, // 密码
            device_direction: device_direction === '' ? 0 : Number(device_direction), // 朝向
            device_car_direction: device_car_direction === '' ? 0 : Number(device_car_direction), // 行车方向
            status: '2', // 状态
            id: this.form.id, // 主键
            update_user: this.$store.state.userInfo.id
          }
          const { code } = await this.$pub.post('point/device/device-edit', params)
          if (code === 200) {
            this.cancle()
            this.getTableData()
            this.$message({
              type: 'success',
              message: '登记成功',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: '登记失败',
              showClose: true
            })
          }
          this.modalLoading = false
        }
      })
    },
    // 审核同意 作废
    async approved(type) {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.modalLoading = true
          const {
            id, device_code, device_model, device_sn, device_name, device_ip, device_mask, device_gateway, device_mac, device_port, device_account, device_pass, device_car_direction, device_direction, status
          } = this.form
          const params = {
            id, // 主键
            device_code, // 设备编码
            device_model, // 设备类型
            device_name, // 设备名称
            device_ip, // 设备ip
            device_port, // 设备端口
            device_mask, // 子网掩码
            device_gateway, // 网关
            device_mac, // mac地址
            device_sn, // 序列号
            device_account, // 账号
            device_pass, // 密码
            device_direction: device_direction === '' ? 0 : Number(device_direction), // 朝向
            device_car_direction: device_car_direction === '' ? 0 : Number(device_car_direction), // 行车方向
            status, // 状态
            update_user: this.$store.state.userInfo.id,
            oper_type: type // 1 通过  2作废
          }
          const { code } = await this.$pub.post('point/device/device-check-confirm', params)
          if (code === 200) {
            console.log(this.form)
            this.cancle()
            this.getTableData()
            this.$message({
              type: 'success',
              message: '审核成功',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: '审核失败',
              showClose: true
            })
          }
          this.modalLoading = false
        }
      })
    },
    cancle() {
      this.dialog = false
      this.form = {
        ip_start: null,
        ip_end: null,
        ipD: {
          o: '',
          t: '',
          th: '',
          f: '',
          five: ''
        },
        sys: null,
        device_name: '',
        remark: '',
        device_ip: '',
        device_mask: '',
        device_gateway: '',
        device_mac: '',
        device_port: '',
        device_account: '',
        device_pass: '',
        device_car_direction: '',
        device_direction: '',
        device_code: '',
        model: null,
        device_id: '',
        device_model: '',
        device_sn: '',
        status: '0',
        id: ''
      }
      this.errorList = []
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss">
.iplistWrap{
  width:100%;
  height: 100%;
  padding:0 20px 20px;
  box-sizing:border-box;
  .btns{
    width:100%;
    border-bottom:1px solid #eee;
  }
  .cursor{
    cursor: pointer;
    color: #409EFF;
    margin-right:10px;
  }
}
.modalBtns{
  text-align:right;
}
.lpdes{
  .el-dialog{
    margin-top:50px!important;
  }
  .el-descriptions__header {
    margin-bottom: 0;
    justify-content: start;
    &:before{
      content: '';
      height:12px;
      width:0px;
      border:2px solid #409EFF;
      margin-right:6px;
    }
  }
  .el-descriptions-item__label{
    font-size: 16px;
    // color: #000;
  }
  .tdinfo{
    margin-top:20px;
    h4{
      font-size: 16px;
      font-weight: 700;
    }
  }
}
.editIP{
  .inp{
     width:72px;
     display:inline-block;
     margin-bottom:25px;
  }
  .item__label{
    display:inline-block;
    width:80px;
    text-align:right;
    padding-right:12px;
    box-sizing:border-box;
    &:before{
      content: '*';
      color: #F56C6C;
      margin-right: 4px;
    }
  }
  .squar{
    display:inline-block;
    width:4px;
    height:4px;
    background:#000;
    margin:0 4px;
    vertical-align: -10px;
  }
}
</style>
