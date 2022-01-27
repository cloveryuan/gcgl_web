<!-- 物料类型管理 -->
<template>
  <div class="device_type f-betw">
    <div class="_left">
      <div>
        <span>项目 </span>
        <el-select
          v-model="project"
          style="width:calc(100% - 45px);"
          placeholder="请选择"
          size="small"
          @change="handleProjectChange"
          value-key="id"
        >
          <el-option
            v-for="item in projectList"
            :key="item.projectCode"
            :label="item.projectName"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
      <div class="center">
        <span>物料分类</span>
      </div>
      <el-tree
        v-loading="treeLoading"
        ref="tree"
        class="tree"
        :data="data"
        draggable
        :props="defaultProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :check-on-click-node="true"
        @node-drop="handleDrop">
        <span class="el-tree-node__content" slot-scope="{ node, data }" @click="selectDevice(data,node)">
          <span class="el-tree-node__label" :style="{fontSize:'14px',color: currentDevice && data.id === currentDevice.id?'#409EFF':''}" >{{ data.name }}</span>
          <div class="_right" >
            <el-button type="text" size="mini" v-hasPermi="['warehouseClass:add']" v-if="node.level<4"  @click="() => adddevice(data)">新增</el-button>
            <el-button type="text" size="mini" v-hasPermi="['warehouseClass:eidt']" v-if="data.parent_id!==0" @click="() => editdevice(node, data)">编辑</el-button>
            <el-button type="text" size="mini" v-hasPermi="['warehouseClass:del']" v-if="data.parent_id!==0" @click="() => deldevice(data)">删除</el-button>
          </div>
        </span>
      </el-tree>
    </div>
    <div class="_right">
      <el-form size="small"  :inline="true" :model="form" >
        <el-form-item label="物料类型名称" label-width="96px">
          <el-input v-model="form.device_name" placeholder="请输入物料类型名称"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
        </el-form-item>
        <el-form-item label="规格型号" label-width="80px">
          <el-input v-model="form.device_model" placeholder="请输入规格型号"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
        </el-form-item>
        <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
        <el-button size="mini" @click="resetSearch" >重置</el-button>
        <div style="float:right;">
          <el-button size="mini" @click="addDeviceType" v-hasPermi="['warehouseType:add']"  v-if="project_code">新增物料类型</el-button>
        </div>
      </el-form>

      <!--选中的左侧分类  -->
      <div v-if="toptitle">
        <span style="color:#409EFF;font-size:14px;">{{toptitle}}</span>
      </div>

       <!-- 列表table -->
      <el-table :data="tableData" v-loading="tableLoading" style="width: 100%;" :height="tableHeight" :row-class-name="tableRowClassName">
        <el-table-column prop="device_name" label="物料类型名称">
          <template slot-scope="scope">
            <span>{{scope.row.device_name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="device_model" label="规格型号" align="center">
          <template slot-scope="scope">
            <span >{{scope.row.device_model}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category_name" label="物料分类" align="center">
          <template slot-scope="scope">
            <span >{{scope.row.category_name}}</span>
          </template>
         </el-table-column>
        <el-table-column prop="contract_nums" label="合同数" width="80px" align="center" />
        <el-table-column prop="camera_num" label="通道数" width="100px" align="center">
          <template slot-scope="scope" >
            <span
              :class="{cursor:scope.row.is_ip===1&&checkPermission(['warehouseType:edit']),color:checkPermission(['warehouseType:edit'])}"
              @click="cameraNumClick(scope.row)"
            >{{scope.row.camera_num}}</span>
          </template>
        </el-table-column>
        <el-table-column  prop="device_brand_name" label="品牌数量" width="80px" align="center">
          <template slot-scope="scope" >
            <span class="cursor color" @click="brandNameClick(scope.row)">{{scope.row.brand_count}}</span>
          </template>
        </el-table-column>
        <el-table-column  prop="child_name" label="子系统数量" width="90px" align="center">
          <template slot-scope="scope" >
            <span class="cursor color" @click="childNameClick(scope.row)">{{scope.row.child_num}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="100px" align="center">
          <template slot-scope="scope" >
            <span>{{scope.row.unit}}</span>
          </template>
         </el-table-column>
         <el-table-column prop="is_ip" label="IP" width="80px" align="center">
          <template slot-scope="scope">
            <span >{{scope.row.is_ip===0?'否':'是'}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="device_model" label="操作" width="100px">
          <template slot-scope="scope">
            <el-button type="text" @click="edit(scope.row)" v-hasPermi="['warehouseType:edit']">编辑</el-button>
            <el-button type="text" @click="del(scope.row)" v-hasPermi="['warehouseType:del']">删除</el-button>
          </template>
         </el-table-column>
      </el-table>
      <div  style="display:flex;justify-content:space-between;">
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
    </div>

    <!-- 编辑新增物料分类 -->
    <el-dialog
      :title="titleL"
      :visible.sync="device_dialogVisible"
      width="30%">
      <el-form ref="leftForm" :model="leftForm" :rules="leftRules" label-width="80px" size="small">
        <el-form-item label="上级分类" prop="parent_id">
          <treeselect
            v-model="leftForm.parent_id"
            :options="data"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级分类"
            @select="selectParent"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="leftForm.name"  clearable></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="leftForm.sort" :min="1" style="width:100%;"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="DeviceCancle">取 消</el-button>
        <el-button size="mini" type="primary" @click="DeviceSure" v-loading="DeviceSureLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新增物料类型 -->
    <el-dialog
      :title="typeTitle"
      :visible.sync="addType_dialogVisible"
      width="600px">
      <el-row :gutter="10">
        <el-form ref="addType" label-position="left" :model="addType" :rules="addTypeRules" size="small" label-width="78px" v-if="addType_dialogVisible">
          <el-form-item label="物料分类" prop="category_id">
            <treeselect
              v-model="addType.category_id"
              :options="data"
              :normalizer="normalizer"
              :show-count="true"
              placeholder="选择物料分类"
            />
          </el-form-item>
          <el-form-item label="类型名称" prop="device_name">
            <el-input v-model="addType.device_name" placeholder="请输入物料类型名称"  clearable></el-input>
          </el-form-item>
          <el-form-item label="规格型号">
            <el-input v-model="addType.device_model" placeholder="请输入规格型号"  clearable></el-input>
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-select v-if="unitList.length>0" v-model="addType.unit" placeholder="请选择单位" style="width:100%;">
              <el-option
                v-for="item in unitList"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
              <li style="text-align:right;">
                <el-button @click="addUnit" size="mini" style="margin-right:10px;background:#F59A23;color:#fff;" >新增</el-button>
              </li>
            </el-select>
            <el-button v-else @click="addUnit" size="mini" style="padding:10px 20px;background:#F59A23;color:#fff;" >新增</el-button>
          </el-form-item>
          <el-form-item label="物料类型" prop="device_type">
            <el-select v-model="addType.device_type" placeholder="请选择物料类型" style="width:100%;">
              <el-option
                v-for="item in device_typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-col :span="12">
            <el-form-item label="主要物料">
              <el-radio-group v-model="addType.is_core">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IP设备">
              <el-radio-group v-model="addType.is_ip">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同数" prop="contract_nums">
              <el-input-number v-model="addType.contract_nums"  :min="0" style="width:100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="Number(addType.is_ip)===1">
            <el-form-item label="通道数" prop="camera_num">
              <el-input-number v-model="addType.camera_num"  :min="0" :max="64" style="width:100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="addType.sort" controls-position="right" :min="1" style="width:100%;"></el-input-number>
            </el-form-item>
          </el-col>

        </el-form>
       </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addTypeCancle">取 消</el-button>
        <el-button size="mini" type="primary" @click="addTypeSure" v-loading="addTypeSureLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 单位管理 -->
    <el-dialog
      :visible.sync="showBindName"
      width="50%"
      :footer="false"
      top="2vh"
      :before-close="closetohandlequery"
    >
      <bind-setting :project_code="project_code" :device_id="currentRow.id" v-if="showBindName"></bind-setting>
    </el-dialog>
    <!-- 通道数修改 -->
    <el-dialog
      :visible.sync="showCameraNum"
      width="500px"
      :footer="false"
    >
      <camera-num
        :device_name="currentRow.device_name"
        :device_id="currentRow.id"
        :currentCameraNum="currentRow.camera_num"
        :visible.sync="showCameraNum"
        v-if="showCameraNum"
        @toQuery="handleQuery"
      ></camera-num>
    </el-dialog>
    <!-- 子系统修改 -->
    <el-dialog
      :visible.sync="showChildName"
      width="50%"
      :footer="false"
      top="2vh"
      :before-close="closetohandlequery"
    >
      <child-setting  :project_id="project_id" :project_code="project_code" :device_id="currentRow.id" v-if="showChildName"></child-setting>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import BindSetting from './components/BindSetting'
import ChildSetting from './components/ChildSetting'
import CameraNum from './components/CameraNum'
import { checkPermission } from '@/utils/tool'

export default {
  name: 'warehouseType',
  data () {
    return {
      // left
      project: null,
      project_code: '',
      project_id: '',
      projectList: [],
      data: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      currentDevice: null,
      titleL: '',
      device_dialogVisible: false, // 新增物料分类
      deviceOptions: [],
      leftForm: {
        parent_id: null,
        name: '',
        id: '',
        sort: 1,
        ancestors_name: '',
        ancestors_id: '',
        description: ''
      },
      treeLoading: false,
      leftRules: {
        parent_id: [{ required: true, message: '请选择上级分类', trigger: 'change' }],
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      DeviceSureLoading: false,
      // right
      toptitle: '',
      form: {
        device_name: '',
        device_model: ''
      },
      tableData: [],
      tableHeight: window.innerHeight - 225,
      currentRow: null,
      tableLoading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      unitList: [],
      addType_dialogVisible: false, // 新增物料类型
      addType: {
        category_id: null,
        device_name: '',
        device_model: '',
        device_type: '',
        unit: '',
        is_core: 0,
        sort: 1,
        contract_nums: 0,
        is_ip: 0,
        camera_num: 0
      },
      addTypeRules: {
        category_id: [{ required: true, message: '请选择物料分类', trigger: 'change' }],
        device_name: [{ required: true, message: '请输入物料类型名称', trigger: 'blur' }],
        // device_model: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
        unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
        device_type: [{ required: true, message: '请选择物料类型', trigger: 'change' }]
      },
      addTypeSureLoading: false,
      typeTitle: '新增物料类型',
      showBindName: false,
      showCameraNum: false,
      showChildName: false,
      device_typeList: []
    }
  },
  computed: {

  },
  created() {
    this.getDevice_type()
  },
  mounted() {
    this.getProjectList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 225
    }
  },
  components: {
    Treeselect, BindSetting, CameraNum, ChildSetting
  },
  methods: {
    checkPermission,
    getDevice_type() {
      this.$dict(this, 'device_type').then(res => {
        if (res.code === 200) {
          this.device_typeList = (res.data || []).map(m => {
            return {
              value: Number(m.value),
              label: m.label
            }
          })
        } else {
          this.$message({
            type: 'error',
            message: '字典获取出错了device_type',
            showClose: true
          })
          this.device_typeList = []
        }
      })
    },
    async getProjectList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (code !== 200) {
        return this.$message.error(message || '查询失败')
      }
      this.projectList = data || []
    },
    handleProjectChange(val) {
      this.form = {
        device_name: '',
        device_model: ''
      }
      this.project_code = val.projectCode
      this.project_id = val.id
      this.getLeftData()
    },
    async getLeftData(right) {
      this.treeLoading = true
      const { data, code, message } = await this.$pub.post('/device/category/list', { project_code: this.project_code })
      if (code !== 200) {
        return this.$message.error(message || '获取物料分类出错了')
      }
      this.data = data ? Array.isArray(data) ? [] : [data] : []
      if (this.data.length > 0) {
        this.selectDevice(right || this.data[0])
      }
      this.treeLoading = false
    },
    async getUnitList() {
      const { data, code, message } = await this.$pub.post('/device/unit')
      if (code !== 200) {
        return this.$message.error(message || '获取单位列表出错了')
      }
      this.unitList = data.unit ? data.unit : []
    },
    addUnit() {
      const h = this.$createElement
      let inp_value = ''
      this.$msgbox({
        title: '新增单位',
        message: h('p', { style: 'display: flex', class: { 'el-input': true, 'el-input--mini': true } }, [
          h('span', { style: 'width: 80px' }, '单位名称:'),
          h('input', {
            class: { 'el-input__inner': true },
            domProps: {
              value: ''
            },
            on: {
              input: (event) => {
                inp_value = event.target.value
              }
            }
          })
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            if (!inp_value) {
              instance.confirmButtonLoading = false
              return this.$message.error('请输入单位名称')
            }
            if (this.unitList.includes(inp_value)) {
              instance.confirmButtonLoading = false
              return this.$message.error('单位名称已经存在')
            }
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
              this.unitList.push(inp_value)
            }, 300)
          } else {
            done()
          }
        }
      }).catch(err => { console.log(err) })
    },
    async handleDrop(draggingNode, dropNode, dropType) {
      console.log(draggingNode, dropNode, dropType)
      if (dropType === 'inner') {
        // draggingNode.data.ancestors_id = dropNode.data.ancestors_id+'/'+draggingNode.data.id;
        draggingNode.data.ancestors_name = dropNode.data.ancestors_name + '/' + draggingNode.data.name
        draggingNode.data.parent_id = dropNode.data.id
        draggingNode.data.sort = 1
      } else {
        // let idArr = dropNode.data.ancestors_id.split(',');
        const nameArr = dropNode.data.ancestors_name.split('/')
        // idArr.pop();
        nameArr.pop()

        // idArr.push(draggingNode.data.id);
        nameArr.push(draggingNode.data.name)

        // draggingNode.data.ancestors_id = idArr.join(',');
        draggingNode.data.ancestors_name = nameArr.join('/')
        draggingNode.data.parent_id = dropNode.data.parent_id
        draggingNode.data.sort = dropNode.data.sort > 1 ? dropNode.data.sort - 1 : 1
      }
      const { code, message } = await this.$pub.post('/device/category/edit', draggingNode.data)
      if (code !== 200) {
        return this.$message.error(message || '编辑物料分类出错了')
      }
      this.getLeftData(draggingNode.data)
    },
    adddevice(row) {
      this.titleL = '新增物料分类'
      this.device_dialogVisible = true
      this.leftForm = {
        parent_id: row.id,
        name: '',
        id: '',
        sort: 1,
        ancestors_name: row.ancestors_name,
        ancestors_id: row.ancestors_id,
        description: ''
      }
    },
    editdevice(node, row) {
      this.titleL = '编辑物料分类'
      this.device_dialogVisible = true
      this.leftForm = Object.assign({}, row)
    },
    deldevice(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/device/category/delete', { ids: row.id + '' })
        if (code !== 200) {
          this.$message.error(message || '删除失败')
        } else {
          this.$message.success('删除成功')
          this.getLeftData()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    selectDevice(data) {
      this.currentDevice = data
      this.toptitle = data.ancestors_name
      this.handleQuery()
    },
    /** 转换数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    selectParent(node) {
      this.leftForm.ancestors_name = node.ancestors_name
      this.leftForm.ancestors_id = node.ancestors_id
    },
    DeviceCancle() {
      this.device_dialogVisible = false
      this.leftForm = {
        parent_id: '',
        name: '',
        id: '',
        sort: 1,
        ancestors_name: '',
        ancestors_id: '',
        description: ''
      }
      this.$refs.leftForm.resetFields()
    },
    async DeviceSure() {
      try {
        await this.$refs.leftForm.validate()
        this.DeviceSureLoading = true
        const flag = this.leftForm.id !== ''
        this.leftForm.description = this.leftForm.name
        this.leftForm.ancestors_name = this.leftForm.ancestors_name + (flag ? '/' + this.leftForm.name : '')
        const params = Object.assign({ project_code: this.project_code }, this.leftForm)

        const { code, message } = flag ? await this.$pub.post('/device/category/edit', params) : await this.$pub.post('/device/category/add', params)
        if (code !== 200) {
          return this.$message.error(message || flag ? '编辑物料分类出错了' : '新增物料分类出错了')
        }
        this.currentDevice.ancestors_name = this.leftForm.ancestors_name
        this.$message.success(flag ? '编辑物料分类成功' : '新增物料分类成功')
        this.DeviceSureLoading = false
        this.DeviceCancle()
        this.getLeftData(flag ? this.currentDevice : '')
      } catch (e) {}
    },
    async getRightData() {
      if (!this.project_code) {
        return this.$message.error('请先选择项目')
      }
      this.tableLoading = true
      const params = {
        project_code: this.project_code,
        device_name: this.form.device_name,
        device_model: this.form.device_model,
        category_id: this.currentDevice.id + '',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, code } = await this.$pub.post('/device/manage/list', params)
      if (code !== 200) {
        return this.$message.error('获取物料类型列表出错了')
      }
      this.tableData = data.list || []
      this.tableLoading = false
      this.total = data.total
    },
    tableRowClassName ({ row, rowIndex }) {
      row.$index = rowIndex
    },
    handleQuery() {
      this.page.page_no = 1
      this.getRightData()
    },
    closetohandlequery(done) {
      this.handleQuery()
      done()
    },
    resetSearch() {
      this.form = {
        device_name: '',
        device_model: ''
      }
      this.handleQuery()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getRightData()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getRightData()
    },
    // 物料类型删除
    del(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/device/manage/delete', { ids: row.id + '' })
        if (code !== 200) {
          this.$message.error(message || '删除失败')
        } else {
          this.$message.success('删除成功')
          this.handleQuery()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    edit(row) {
      this.typeTitle = '编辑物料类型'
      this.currentRow = row
      Object.assign(this.addType, row)
      this.getUnitList()
      this.addType_dialogVisible = true
    },
    // 新增物料类型
    addDeviceType() {
      this.typeTitle = '新增物料类型'
      this.addType_dialogVisible = true
      this.getUnitList()
      this.addType = {
        category_id: this.currentDevice.id,
        device_name: '',
        device_model: '',
        unit: '',
        device_type: '',
        is_core: 0,
        is_ip: 0,
        camera_num: 0,
        sort: 1,
        contract_nums: 0
      }
    },
    addTypeCancle() {
      this.addType_dialogVisible = false
      this.addTypeSureLoading = false
      this.addType = {
        category_id: null,
        device_name: '',
        device_model: '',
        unit: '',
        device_type: '',
        is_core: 0,
        is_ip: 0,
        sort: 1,
        camera_num: 0,
        contract_nums: 0
      }
      this.$refs.addType.resetFields()
    },
    async addTypeSure() {
      try {
        await this.$refs.addType.validate()
        this.addTypeSureLoading = true
        this.addType.is_core = this.addType.is_core + ''
        this.addType.is_ip = this.addType.is_ip + ''
        this.addType.camera_num = Number(this.addType.is_ip) === 1 ? this.addType.camera_num + '' : 0 + ''
        const params = Object.assign({ project_code: this.project_code }, this.addType)
        const flag = this.addType.id !== undefined
        const { code, message } = flag ? await this.$pub.post('/device/manage/edit', params) : await this.$pub.post('/device/manage/add', params)
        if (code !== 200) {
          return this.$message.error(message || flag ? '编辑物料类型出错了' : '新增物料类型出错了')
        }
        this.$message.success(flag ? '编辑物料类型成功' : '新增物料类型成功')
        this.addTypeSureLoading = false
        this.addTypeCancle()
        this.handleQuery()
      } catch (err) {}
    },
    brandNameClick(row) {
      this.currentRow = row
      this.showBindName = true
    },
    cameraNumClick(row) {
      if (row.is_ip === 0 || !this.checkPermission(['warehouseType:edit'])) return
      this.currentRow = row
      this.showCameraNum = true
    },
    childNameClick(row) {
      this.currentRow = row
      this.showChildName = true
    }
  }
}
</script>
<style lang="scss">
.device_type{
  .el-table {
    height: calc(100% - 115px);
    .el-button{
      padding:0;
    }
  }
  ._right .el-form-item--small.el-form-item{
    margin-bottom:6px;
  }
}
</style>
<style scoped lang="scss">
.f-betw{
  width:100%;
  display:flex;
  justify-content:space-between;
}
.device_type{
  height:100%;
  ._left{
    width: 300px;
    .center{
      margin:20px 0 10px;
      i{
        cursor:pointer;
        margin-left:8px;
        &:hover{
          color: #409EFF;
        }
      }
    }
    .tree{
      border: 1px solid #eee;
      height:calc(100% - 113px);
      overflow: auto;
      .el-tree-node__content{
        flex:1;
        ._right {
          flex:1;
          text-align: right;
          margin-right:10px;
        }
      }
    }
  }
  ._right{
    width: calc(100% - 320px);
    .cursor{
      cursor:pointer;
    }
    .color{
      color: #409EFF;
    }
  }
}
</style>
