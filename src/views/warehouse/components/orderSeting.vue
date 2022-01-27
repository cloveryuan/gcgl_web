<template>
  <div class="warehouseWrap out_warehouse">
    <el-form size="small"  :inline="true" :model="form"  label-position="left">
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
      <el-form-item label="过程单号">
        <el-input v-model="form.order_code"  clearable @clear="handleQuery"  @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <span class="iconfont icon-gaojichaxun" @click="toggleGJsearch"></span>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" >重置</el-button>
      <div style="float:right;">
        <el-button
        size="mini"
        @click="addOrder"
        type="primary"
        v-hasPermi="['warehouseIn:add']"
        v-if="form.project_code&&orderType===1">添加入库单</el-button>
        <el-button
          size="mini"
          @click="addOrder"
          type="primary"
           v-hasPermi="['warehouseOut:add']"
          v-if="form.project_code&&orderType===2">添加出库单</el-button>
      </div>

      <!-- 高级查询区 -->
      <div class="gSearch" v-if="isGJsearch">
        <el-form-item label="状态">
          <el-select
            v-model="form.order_status"
            width="200px;"
            placeholder="请选择"
            clearable
            @clear="handleQuery"
          >
            <el-option
              v-for="item in statusList"
              :key="item.status"
              :label="item.status_name"
              :value="item.status"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间">
          <el-date-picker
            v-model="form.time"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width:250px;"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleQuery"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="经办人">
          <el-select
            v-model="form.oper_user"
            clearable
            style="width:180px;"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="oper_user_remoteMethod"
            :loading="loading"
            @clear="handleQuery"
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
        <el-form-item label="经办对象" v-if="orderType===2">
          <el-select
            v-model="form.involved_user"
            clearable
            style="width:180px;"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="involved_user_remoteMethod"
            :loading="loading"
            @clear="handleQuery"
          >
            <el-option
              v-for="item in involved_userList"
              :key="item.user_id"
              :label="item.user_name_dept"
              :value="item.user_id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应方" v-if="orderType===1">
          <el-input v-model="form.supply"  clearable @clear="handleQuery"  @keyup.enter.native="handleQuery"></el-input>
        </el-form-item>
        <el-form-item label="所在库房">
          <el-select
            v-model="form.warehouse_id"
            width="200px;"
            placeholder="请选择"
            clearable
            @clear="handleQuery"
          >
            <el-option
              v-for="item in warehouseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <!-- 列表table -->
    <el-table
      :data="tableData"
      :height="isGJsearch?tableHeight-isWidth:tableHeight"
      v-loading="tableLoading"
      style="width: 100%"
      :default-sort = "{prop: 'oper_time', order: 'descending'}"
    >
      <el-table-column prop="order_code" label="过程单号" width="160px"></el-table-column>
      <el-table-column  prop="oper_user_name" label="经办人" align="center" min-width="80px"> </el-table-column>
      <el-table-column  prop="supply" label="供应方" align="center"  min-width="120px"  v-if="orderType===1"></el-table-column>
      <el-table-column  prop="involved_user_name" label="经办对象" align="center"  min-width="120px" v-if="orderType===2"></el-table-column>
      <el-table-column  prop="involved_dept_name"   label="经办对象组织"  min-width="240px" v-if="orderType===2"></el-table-column>
      <el-table-column  prop="order_status_name"  align="center" label="状态" min-width="70px">
        <template slot-scope="scope">
          <span :style="{color:scope.row.order_status===1?'#F59A23':scope.row.order_status===2?'#70B603':''}">{{scope.row.order_status_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="oper_time"  label="发生时间" width="200px"  sortable>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.oper_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="warehouse_name"  align="center" label="所在库房" min-width="100px"></el-table-column>
      <el-table-column  prop="file_count"  align="center" label="附件张数" min-width="80px"></el-table-column>
      <el-table-column  label="操作" min-width="130px" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="showInfo(scope.row)">详情</el-button>
          <el-button type="text" @click="toVoid(scope.row)" v-if="scope.row.order_status===2 && checkPermission(permissionVoid)">作废</el-button>
          <el-button type="text" @click="edit(scope.row)"  v-if="scope.row.order_status===1 && checkPermission(permissionedit)" >编辑</el-button>
          <el-button type="text" @click="del(scope.row)" v-if="scope.row.order_status===1 && checkPermission(permissiondel)" >删除</el-button>
          <el-button type="text" @click="addFjVoid(scope.row)" v-if="orderType === 1&&(scope.row.order_status===2 || scope.row.order_status===4) && checkPermission(permissionAddFj)">补充</el-button>
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

    <!-- 新增 编辑出入库单 -->
    <el-drawer
      :title="addEditTitle"
      :visible.sync="addShow"
      size="90%"
      custom-class="order_add"
      :append-to-body="true"
    >
      <add-order
        v-if="addShow"
        :addShow.sync="addShow"
        :warehouseList="warehouseList"
        :project_code="form.project_code"
        :isEdit="isEdit"
        @successEdit="successEdit"
        @getwarehouseList="getwarehouseList"
        :currentRow="currentRow"></add-order>
    </el-drawer>

    <!-- 出库单详情 -->
    <el-dialog
      :title="orderType===1?'入库单详情':'出库单详情'"
      :visible.sync="InfoShow"
      width="70%"
      custom-class="order_info"
      :append-to-body="true"
    >
      <in-order-info
        v-if="InfoShow&&orderType===1"
        :InfoShow.sync="InfoShow"
        :project_code="form.project_code"
        :currentRow="currentRow"
        :isSeting="true"
        @successInout="successInout"></in-order-info>
      <out-order-info
        v-if="InfoShow&&orderType===2"
        :InfoShow.sync="InfoShow"
        :project_code="form.project_code"
        :currentRow="currentRow"
        :isSeting="true"
        @successInout="successInout"></out-order-info>
    </el-dialog>

    <el-dialog
      title="补充附件"
      :visible.sync="addFJ"
      width="60%"
      custom-class="add_fj"
      :append-to-body="true"
    >
      <add-fj-info
        v-if="addFJ"
        :currentRow="currentRow"
        :addFJ.sync="addFJ"
        @successInout="successInout"
      ></add-fj-info>
    </el-dialog>

  </div>
</template>

<script>
// 出入库差不多，组件传入orderType，通过orderType区分出库2，入库1;
// import qs from 'qs'
import addOrder from './addOrder'
import inOrderInfo from './inOrderInfo.vue'
import outOrderInfo from './outOrderInfo.vue'
import addFjInfo from './addFj'
import { parseTime, checkPermission } from '@/utils/tool'

export default {
  name: 'out_in_warehouse',
  props: {
    orderType: {
      required: true
    },
    statusList: {
      required: true
    }
  },
  provide () {
    return {
      orderType: this.orderType
    }
  },
  data () {
    return {
      form: {
        project_code: '',
        order_code: '',
        order_status: '',
        time: '',
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        warehouse_id: '', // 所在库房
        supply: ''// 供应方
      },
      rules: {
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      tableData: [],
      tableLoading: false,
      projectList: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      isGJsearch: false,
      tableHeight: window.innerHeight - 215,
      showWidth: document.body.clientWidth,
      addShow: false,
      isEdit: false,
      currentRow: {},
      InfoShow: false,
      warehouseList: [],
      userList: [],
      involved_userList: [],
      loading: false,
      addFJ: false,
      permissionVoid: [this.orderType === 1 ? 'warehouseIn:cancel' : 'warehouseOut:cancel'],
      permissionedit: [this.orderType === 1 ? 'warehouseIn:edit' : 'warehouseOut:edit'],
      permissiondel: [this.orderType === 1 ? 'warehouseIn:del' : 'warehouseOut:del'],
      permissionAddFj: [this.orderType === 1 ? 'warehouseIn:supply' : 'warehouseOut:supply']
    }
  },
  computed: {
    addEditTitle() {
      if (this.isEdit) {
        return this.orderType === 1 ? '编辑入库单' : '编辑出库单'
      }
      return this.orderType === 1 ? '新增入库单' : '新增出库单'
    },
    isWidth() {
      return this.showWidth >= 1470 ? 52 : 102
    }
  },
  created() {
    this.getProjectList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 215
      this.showWidth = document.body.clientWidth
    }
  },
  components: {
    addOrder,
    inOrderInfo,
    outOrderInfo,
    addFjInfo
  },
  methods: {
    parseTime,
    checkPermission,
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
    async getTableData() {
      if (!this.form.project_code) {
        return this.$message.error('请先选择项目')
      }
      this.tableLoading = true
      const { project_code, order_code, order_status, time, oper_user, involved_user, warehouse_id, supply } = this.form
      const params = {
        project_code,
        order_code,
        order_status,
        warehouse_id: warehouse_id + '',
        oper_user: oper_user + '',
        start_time: time ? time[0] : '',
        end_time: time ? time[1] : '',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const req = this.orderType === 1 ? { ...params, supply: supply } : { ...params, involved_user: involved_user + '' }
      const url = this.orderType === 1 ? '/device/order/input/list' : '/device/order/output/list'
      const { code, data, message } = await this.$pub.post(url, req)
      if (code !== 200) {
        return this.$message.error(message || '查询列表失败')
      }
      this.tableData = data.list || []
      this.total = data.total || 0
      this.tableLoading = false
    },
    handleProjectChange() {
      Object.assign(this.form, {
        order_code: '',
        order_status: '',
        time: null,
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        warehouse_id: '', // 所在库房
        supply: ''
      })
      this.warehouseList = []
      this.tableData = []
      this.getwarehouseList()
      this.handleQuery()
    },
    async getwarehouseList() {
      const { code, message, data } = await this.$pub.post('/device/order/warehouse/list', { project_code: this.form.project_code })
      if (code !== 200) {
        return this.$message.error(message || '查询所有库房失败')
      }
      this.warehouseList = data.list || []
    },
    resetSearch() {
      this.form = {
        project_code: this.form.project_code,
        order_code: '',
        order_status: '',
        time: null,
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        warehouse_id: '', // 所在库房
        supply: ''
      }
      this.handleQuery()
    },
    handleQuery() {
      if (!this.form.project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.page.page_no = 1
      this.getTableData()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getTableData()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getTableData()
    },
    toggleGJsearch() {
      if (!this.form.project_code) {
        return this.$message({
          type: 'error',
          message: '项目未选择,请先选择项目',
          showClose: true
        })
      }
      this.isGJsearch = !this.isGJsearch
    },
    async getInfo(row, type) {
      const order_id = row.order_id
      const url = this.orderType === 1 ? '/device/order/input/info' : '/device/order/output/info'
      const params = { order_id }
      this.tableLoading = true
      const { code, data } = await this.$pub.post(url, params)
      this.tableLoading = false
      if (code !== 200) {
        return this.$message.error('获取详情失败')
      }
      data.order_id = order_id
      data.order_type = this.orderType === 1 ? '入库' : '出库'
      this.currentRow = data
      this[type] = true
    },
    addOrder() {
      this.addShow = true
      this.currentRow = {}
      this.isEdit = false
    },
    showInfo(row) {
      this.currentRow = {}
      this.getInfo(row, 'InfoShow')
    },
    edit(row) {
      this.currentRow = {}
      this.isEdit = true
      this.getInfo(row, 'addShow')
    },
    addFjVoid(row) {
      this.currentRow = {}
      this.getInfo(row, 'addFJ')
    },
    del(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const url = this.orderType === 1 ? '/device/order/input/del' : 'device/order/output/del'
        const { code } = await this.$pub.post(url, { id: row.order_id })
        if (code !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.handleQuery()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async toVoid(row) {
      const params = {
        order_id: row.order_id,
        create_user: this.$store.state.userInfo.id
      }
      const { code } = await this.$pub.post('/device/order/cancel', params)
      if (code !== 200) {
        return this.$message.error('操作失败')
      }
      this.handleQuery()
    },
    async oper_user_remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.userList = data.user_list || []
      } else {
        this.userList = []
      }
    },
    async involved_user_remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/sys/user/list', { user_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询所有用户失败')
        }
        this.involved_userList = data.user_list || []
      } else {
        this.involved_userList = []
      }
    },
    // 入库出库  成功
    successInout() {
      this.InfoShow = false
      this.addFJ = false
      this.handleQuery()
    },
    // 入库出库  编辑新增成功
    successEdit() {
      this.addShow = false
      this.handleQuery()
    }
  }
}
</script>

<style lang="scss" scoped>
.warehouseWrap{
  box-sizing:border-box;
  height: 100%;
  width:100%;
  background: #fff;
  .icon-gaojichaxun{
    line-height: 33px;
    cursor:pointer;
    padding: 0 10px;
    &:hover{
      color: #409EFF;
    }
  }
}
</style>
<style lang="scss">
.module{
  margin-bottom:10px;
  .line{
    display: inline-block;
    width: 3px;
    height:14px;
    background:#4DD2D2;
    vertical-align: middle;
  }
  span{
    vertical-align: middle;
  }
}
.cell{
  .el-button{
    padding:0;
  }
}
.order_info{
  margin-top:100px!important;
  height: calc(100% - 150px);
  .el-dialog__body{
    padding:10px 20px 20px;
    height: calc(100% - 60px);
  }
}
</style>
