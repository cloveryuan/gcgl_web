<!-- 库存查询 -->
<template>
  <div class="query_warehouseWrap">
    <el-form size="small"  :inline="true" :model="form" label-width="82px" label-position="left">
      <el-form-item label="项目">
        <el-select
          v-model="form.project_code"
          style="width:180px;"
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
      <el-form-item label="出入库类型">
        <el-select
          v-model="form.order_type"
          style="width:180px;"
          placeholder="请选择"
          clearable
          @clear="handleQuery"
        >
          <el-option
            v-for="item in orderTypeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="过程单号">
        <el-input v-model="form.order_code"  style="width:180px;" clearable @clear="handleQuery"  @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <span class="iconfont icon-gaojichaxun" @click="toggleGJsearch"></span>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" >重置</el-button>
      <div style="float:right;">
        <el-button size="mini" @click="exportOrder" type="primary" v-if="tableData.length>0" v-loading="exportLoading">导出</el-button>
      </div>

      <!-- 高级查询区 -->
      <div class="gSearch" v-if="isGJsearch">
        <el-form-item label="物料类型">
          <el-select
            v-model="form.device_id"
            style="width:180px;"
            clearable
            @clear="handleQuery"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="getDeviceCategoryList"
            :loading="loading"
          >
            <el-option
              v-for="item in device_categoryList"
              :key="item.device_id"
              :label="item.device_name"
              :value="item.device_id"
            >
            </el-option>
          </el-select>
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
        <el-form-item label="所在库房">
          <el-select
            v-model="form.warehouse_id"
            style="width:180px;"
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
        <el-form-item label="经办对象">
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
        <el-form-item label="经办对象组织" label-width="96px">
          <treeselect
            v-model="form.involved_dept"
            :options="orgOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="请选择"
            style=" width:200px;"
          />
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
            style="width:220px;"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleQuery"
          >
          </el-date-picker>
        </el-form-item>
      </div>
    </el-form>

    <!-- 列表table -->
    <el-table :data="tableData" :height="isGJsearch?tableHeight-102:tableHeight" v-loading="tableLoading" style="width: 100%">
      <af-table-column prop="order_type" label="类型" align="center"></af-table-column>
      <el-table-column prop="order_code" label="过程单号" width="170px" align="center">
        <template slot-scope="scope">
          <span style="color:#409EFF;">{{scope.row.order_code}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="device_name" label="物料类型" width="240px">
        <template slot-scope="scope">
          <span style="font-weight:550;">{{scope.row.device_name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="device_model" label="规格型号" width="240px">
        <template slot-scope="scope">
          <span style="font-weight:550;">{{scope.row.device_model}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="oper_user_name" label="经办人" align="center" min-width="80"> </el-table-column>
      <el-table-column  prop="involved_user_name" label="经办对象" align="center" min-width="80">
         <template slot-scope="scope">
          <span>{{scope.row.order_type==="出库"?scope.row.device_model:''}}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="involved_dept_name" label="经办对象组织 / 供应方" align="center" min-width="200">
        <template slot-scope="scope">
          <span>{{scope.row.order_type==="出库"?scope.row.involved_dept_name:scope.row.supply}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="oper_time" label="发生时间" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.oper_time) }}</span>
        </template>
      </el-table-column>
      <af-table-column  prop="unit" label="单位" align="center"></af-table-column>
      <af-table-column  prop="brand_name" label="品牌"></af-table-column>
      <af-table-column  prop="number" label="出入库数量" align="center"></af-table-column>
      <af-table-column  prop="warehouse_name" label="所在库房" align="center"></af-table-column>
      <el-table-column label="操作" width="80px">
        <template slot-scope="scope">
          <el-button type="text" @click="showInfo(scope.row)">详情</el-button>
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

    <!-- 出入库单详情 -->
    <el-dialog
      :title="currentRow.order_type+ '单详情'"
      :visible.sync="InfoShow"
      width="70%"
      custom-class="order_info"
      :append-to-body="true"
    >
      <in-order-info
        v-if="InfoShow&&currentRow.order_type==='入库'"
        :currentRow="currentRow"
        :project_code="form.project_code"
        :isSeting="false"></in-order-info>
      <out-order-info
        v-if="InfoShow&&currentRow.order_type==='出库'"
        :currentRow="currentRow"
        :project_code="form.project_code"
        :isSeting="false"></out-order-info>
      <return-order-info
        v-if="InfoShow&&currentRow.order_type==='退库'"
        :currentRow="currentRow"
        :project_code="form.project_code"
        :isSeting="false"></return-order-info>
    </el-dialog>

  </div>
</template>

<script>
// import qs from 'qs'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import inOrderInfo from './components/inOrderInfo'
import outOrderInfo from './components/outOrderInfo'
import returnOrderInfo from './returnStock/orderInfo'
import { parseTime, downloadFile } from '@/utils/tool'

export default {
  name: 'warehouseQuery',
  provide () {
    return {
      orderType: this.currentRow.order_type,
      project_code: this.form.project_code
    }
  },
  watch: {
    'form.involved_dept'(val) {
      if (val === undefined) {
        this.handleQuery()
      }
    }
  },
  data () {
    return {
      form: {
        project_code: '',
        order_type: '',
        order_code: '',
        device_id: '',
        device_brand: '',
        time: '',
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        involved_dept: null, // 经办对象组织
        warehouse_id: ''// 所在库房
      },
      rules: {
        project_code: [{ required: true, message: '请选择项目', trigger: 'change' }]
      },
      orderTypeList: [{ code: 1, name: '入库' }, { code: 2, name: '出库' }, { code: 3, name: '退库' }],
      tableData: [],
      tableLoading: false,
      projectList: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      isGJsearch: false,
      tableHeight: window.innerHeight - 225,
      currentRow: {},
      InfoShow: false,
      device_categoryList: [], // 物料类型
      warehouseList: [], // 所在库房
      orgOptions: [], // 经办对象组织
      userList: [],
      involved_userList: [],
      loading: false,
      exportLoading: false
    }
  },
  created() {
    this.getProjectList()
    this.getOrg()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 225
    }
  },
  components: {
    inOrderInfo, outOrderInfo, Treeselect, returnOrderInfo
  },
  methods: {
    parseTime,
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
    async getDeviceCategoryList(query) {
      if (query !== '') {
        this.loading = true
        const { code, message, data } = await this.$pub.post('/device/stock/device-cond', { project_code: this.form.project_code, device_name: query })
        this.loading = false
        if (code !== 200) {
          return this.$message.error(message || '查询物料类型失败')
        }
        this.device_categoryList = data.list || []
      } else {
        this.device_categoryList = []
      }
    },
    async getwarehouseList() {
      const { code, message, data } = await this.$pub.post('/device/order/warehouse/list', { project_code: this.form.project_code })
      if (code !== 200) {
        return this.$message.error(message || '查询所有库房失败')
      }
      this.warehouseList = data.list || []
    },
    async getOrg() {
      this.orgOptions = []
      const { code, message, data } = await this.$pub.post('/sys/dept/list', { dept_name: '' })
      if (code !== 200) {
        return this.$message.error(message || '查询所有组织失败')
      }

      // const data = [
      //   {id:1,dept_name:'桑达'}
      // ]
      this.orgOptions.push(data.dept)
    },
    /** 转换数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.child
      }
    },
    async getTableData() {
      this.tableLoading = true
      const { project_code, order_type, order_code, device_id, time, oper_user, involved_user, involved_dept, warehouse_id, device_brand } = this.form
      const params = {
        project_code,
        order_code,
        device_id: device_id ? Number(device_id) : 0,
        order_type: order_type || 0,
        oper_user: oper_user || 0,
        involved_user: involved_user || 0,
        warehouse_id: warehouse_id || 0,
        device_brand: device_brand || 0,
        involved_dept: involved_dept || 0,
        begin_time: time ? time[0] : '',
        end_time: time ? time[1] : '',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data } = await this.$pub.post('/device/order/list', params)
      if (code !== 200) {
        return this.$message.error('查询列表失败')
      }
      this.tableData = data.list
      this.total = data.total
      this.tableLoading = false
    },
    handleProjectChange() {
      Object.assign(this.form, {
        device_brand: '',
        order_type: '',
        order_code: '',
        device_category: '',
        time: '',
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        involved_dept: null, // 经办对象组织
        warehouse_id: ''
      })

      this.warehouseList = []
      this.tableData = []
      this.getwarehouseList()
      this.handleQuery()
    },
    resetSearch() {
      Object.assign(this.form, {
        order_type: '',
        order_code: '',
        device_category: '',
        time: '',
        oper_user: '', // 经办人
        involved_user: '', // 经办对象
        involved_dept: null, // 经办对象组织
        warehouse_id: ''
      })
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
      const url = row.order_type === '入库' ? '/device/order/input/info' : '/device/order/output/info'
      const params = { order_id: row.order_id }
      this.tableLoading = true
      const { code, data } = await this.$pub.post(url, params)
      this.tableLoading = false
      if (code !== 200) {
        return this.$message.error('获取详情失败')
      }
      data.order_id = row.order_id
      data.order_type = row.order_type
      this.currentRow = data
      this[type] = true
    },
    showInfo(row) {
      this.currentRow = {}
      this.getInfo(row, 'InfoShow')
    },
    async exportOrder() {
      this.exportLoading = true
      const { project_code, order_type, order_code, device_id, time, oper_user, involved_user, involved_dept, warehouse_id, device_brand } = this.form
      const params = {
        project_code,
        order_code,
        device_id: device_id ? Number(device_id) : 0,
        order_type: order_type || 0,
        oper_user: oper_user || 0,
        involved_user: involved_user || 0,
        warehouse_id: warehouse_id || 0,
        device_brand: device_brand || 0,
        involved_dept: involved_dept || 0,
        begin_time: time ? time[0] : '',
        end_time: time ? time[1] : '',
        page_no: 1,
        page_size: 999999
      }
      const result = await this.$pub.post(
        '/device/order/list-exp',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = project_code + '_' + '出入库物料查询表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.query_warehouseWrap{
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
.vue-treeselect__menu{
  overflow: auto!important;
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
