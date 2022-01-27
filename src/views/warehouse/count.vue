<!-- 库存统计 -->
<template>
  <div class="query_warehouseWrap diao">
    <el-form size="small"  :inline="true" :model="form" label-position="left">
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

      <el-form-item label="物料类型名称">
        <el-input v-model="form.device_name"  style="width:180px;" clearable @clear="getTableData"  @keyup.enter.native="getTableData"></el-input>
      </el-form-item>
      <el-form-item label="规格型号">
        <el-input v-model="form.device_model"  style="width:180px;" clearable placeholder="请输入" @clear="getTableData" @keyup.enter.native="getTableData"></el-input>
      </el-form-item>
      <el-form-item label="所在库房">
        <el-select
          v-model="form.warehouse_id"
          style="width:180px;"
          placeholder="请选择"
          clearable
          @clear="getTableData"
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

      <el-button size="mini" @click="getTableData" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" style="margin-left:4px;">重置</el-button>
      <div style="float:right;">
        <el-button size="mini" @click="exportOrder" :loading="exportLoading" type="primary" v-if="tableData.length>0">导出</el-button>
      </div>
    </el-form>

    <!-- 列表table -->
    <el-table :data="tableData" :height="tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="DeviceName" label="物料类型" width="240px">
        <template slot-scope="scope">
          <span style="font-weight:550;">{{scope.row.DeviceName}}</span>
        </template>
      </el-table-column>
      <af-table-column prop="DeviceModel" label="规格型号" width="240px">
        <template slot-scope="scope">
          <span style="font-weight:550;">{{scope.row.DeviceModel}}</span>
        </template>
      </af-table-column>
      <af-table-column  prop="Unit" label="单位" align="center"></af-table-column>
      <af-table-column  prop="InNumber" label="入库数量" align="center"></af-table-column>
      <af-table-column  prop="OutNumber" label="出库数量" align="center"></af-table-column>
      <af-table-column  prop="RtnNumber" label="退库数量" align="center"></af-table-column>
      <af-table-column  prop="StockNumber" label="库存数量" align="center"></af-table-column>

      <el-table-column
        v-for="row in depts"
        :key="row.DeptId"
        :prop="row.DeptId + ''"
        :label="row.DeptName"
        min-width="150px"
      >
        <template slot-scope="{ row, column }">
          <span>{{ row[column.property] }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80px" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="showInfo(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 物料库存详情 -->
    <!-- <el-dialog
      title="物料库存详情"
      :visible.sync="InfoShow"
      width="50%"
      custom-class="device_info"
    > -->
    <el-drawer
      title="物料库存详情"
      :visible.sync="InfoShow"
      :size="450"
      custom-class="device_info"
      :append-to-body="true"
    >
      <ul class="device_info_ul">
        <li>
          <span>物料类型</span>
          <span>{{currentRow.DeviceName}}</span>
        </li>
        <li>
          <span>规格型号</span>
          <span>{{currentRow.DeviceName}}</span>
        </li>
      </ul>
      <el-timeline v-loading="loading">
        <el-timeline-item v-for="(log,i) in logList" :key="i+'clo'" :timestamp="log.order_type + ' ' + parseTime(log.oper_time,'{y}.{m}.{d}')" placement="top">
          <span>{{log.order_type}}数量</span>
          <span style="margin-right:4px;">{{log.number}}个</span>
          <span style="margin-right:4px;">({{log.brand}})</span>
          <el-button type="text" size="mini"  @click="lookDJ(log)">查看单据</el-button>
          <div>
            <span>经办对象:</span>
            <span style="margin-right:4px;">{{log.involved_user}}</span>
            <span>({{log.involved_dept}})</span>
          </div>
           <!-- <template v-if="log.order_type==='出库'">
              <span>出库数量</span>
              <span style="margin-right:4px;">{{log.number}}个</span>
              <span style="margin-right:4px;">({{log.brand}})</span>
              <el-button type="text" size="mini" @click="lookDJ(log)">查看单据</el-button>
              <div>
                <span>经办对象:</span>
                <span style="margin-right:4px;">{{log.involved_user}}</span>
                <span>({{log.involved_dept}})</span>
              </div>
          </template> -->
        </el-timeline-item>
      </el-timeline>
    </el-drawer>

    <!-- 出入库单详情 -->
    <el-dialog
      :title="currentDJ.order_type+ '单详情'"
      :visible.sync="twoInfoShow"
      width="70%"
      custom-class="order_info"
      :append-to-body="true"
    >
      <in-order-info
        v-if="twoInfoShow&&currentDJ.order_type==='入库'"
        :currentRow="currentDJ"
        :project_code="form.project_code"
        :isSeting="false"></in-order-info>
      <out-order-info
        v-if="twoInfoShow&&currentDJ.order_type==='出库'"
        :currentRow="currentDJ"
        :project_code="form.project_code"
        :isSeting="false"></out-order-info>
      <return-order-info
        v-if="twoInfoShow&&currentDJ.order_type==='退库'"
        :currentRow="currentDJ"
        :project_code="form.project_code"
        :isSeting="false"></return-order-info>
    </el-dialog>

  </div>
</template>

<script>
// import qs from 'qs'
import inOrderInfo from './components/inOrderInfo.vue'
import outOrderInfo from './components/outOrderInfo.vue'
import returnOrderInfo from './returnStock/orderInfo'
import { parseTime, downloadFile } from '@/utils/tool.js'

export default {
  name: 'warehouseCount',
  data () {
    return {
      form: {
        project_code: '',
        device_name: '',
        device_model: '',
        warehouse_id: ''
      },
      tableData: [],
      tableLoading: false,
      loading: false,
      projectList: [],
      tableHeight: window.innerHeight - 190,
      currentRow: {},
      currentDJ: {}, // 查看单据
      InfoShow: false,
      twoInfoShow: false,
      warehouseList: [], // 所在库房
      depts: [], // 施工对
      logList: [],
      exportLoading: false
    }
  },
  created() {
    this.getProjectList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 190
    }
  },
  components: {
    inOrderInfo, outOrderInfo, returnOrderInfo
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
    async getwarehouseList() {
      const { code, message, data } = await this.$pub.post('/device/order/warehouse/list', { project_code: this.form.project_code })
      if (code !== 200) {
        return this.$message.error(message || '查询所有库房失败')
      }
      this.warehouseList = data.list || []
    },
    async getTableData() {
      if (!this.form.project_code) {
        return this.$message.error('请选择项目')
      }
      const { project_code, device_name, device_model, warehouse_id } = this.form
      const params = { project_code, device_name, device_model, warehouse_id: warehouse_id === '' ? 0 : warehouse_id }
      const { data, code } = await this.$pub.post('/device/stock/list', params)
      if (code !== 200) {
        return this.$message.error('获取物料类型列表出错了')
      }
      this.depts = data.dept_list ? data.dept_list : []
      this.tableData = data.stock_list ? data.stock_list : []
    },
    handleProjectChange() {
      Object.assign(this.form, {
        device_name: '',
        device_model: '',
        warehouse_id: ''
      })
      this.warehouseList = []
      this.tableData = []
      this.getwarehouseList()
      this.getTableData()
    },
    resetSearch() {
      Object.assign(this.form, {
        device_name: '',
        device_model: '',
        warehouse_id: ''
      })
      this.getTableData()
    },
    async showInfo(row) {
      this.currentRow = row
      this.InfoShow = true

      const params = this.form.warehouse_id === '' ? {
        project_code: this.form.project_code,
        device_id: row.DeviceId
      } : {
        project_code: this.form.project_code,
        device_id: row.DeviceId,
        warehouse_id: this.form.warehouse_id
      }
      const { data, code } = await this.$pub.post('/device/stock/schedule', params)
      if (code !== 200) {
        return this.$message.error('获取物料类型出入库进度信息出错了')
      }
      this.logList = data.list || []
    },
    async lookDJ(log) {
      const url = log.order_type === '入库' ? '/device/order/input/info' : '/device/order/output/info'
      const params = { order_id: log.order_id }
      this.loading = true
      const { code, data } = await this.$pub.post(url, params)
      this.loading = false
      if (code !== 200) {
        return this.$message.error('获取详情失败')
      }
      data.order_id = log.order_id
      data.order_type = log.order_type
      this.currentDJ = data
      this.twoInfoShow = true
    },
    async exportOrder() {
      this.exportLoading = true
      const { project_code, device_name, device_model, warehouse_id } = this.form
      const params = { project_code, device_name, device_model, warehouse_id: warehouse_id === '' ? 0 : warehouse_id }
      const result = await this.$pub.post(
        '/device/stock/list-exp',
        params,
        {
          headers: {
            'Content-Type': 'application/x-download'
          },
          responseType: 'blob'
        }
      )
      const title = project_code + '_' + '库存统计表'
      downloadFile(result, title, 'xlsx')
      this.exportLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.diao{
  box-sizing:border-box;
  height: 100%;
  width:100%;
  background: #fff;
}
.device_info_ul{
  margin-bottom:20px;
  li{
    width:100%;
    margin-bottom:10px;
    span:first-child{
      width:68px;
      display:inline-block;
      font-weight:500;
      vertical-align: middle;
    }
    span:nth-child(2){
      color: rgb(141, 135, 135);
      display:inline-block;
      width: calc(100% - 80px);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
}
</style>
<style lang="scss">
.device_info{
  .el-drawer__body{
    margin: 0 20px 10px;
    height: calc(100% - 45px);
    .el-timeline{
      height: calc(100% - 82px);
      overflow: auto;
    }
  }
  .el-drawer__header{
    margin-bottom:10px;
  }
}
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
</style>
