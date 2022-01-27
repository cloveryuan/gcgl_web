<template>
  <el-drawer
    size="80%"
    :visible.sync="deviceDrawer"
    :with-header="false"
    custom-class="peo_dev"
    :close-on-press-escape="false"
    :wrapperClosable="false"
    >
    <div class="d-flex-between">
      <h3 style="font-weight:500" v-if="currentUserInfo">
        <p style="margin-bottom:10px;">
          {{currentUserInfo.name?currentUserInfo.name:'合计'}} -- 物料登记
        </p>
      </h3>
      <i class="el-icon-close" @click="cancle"></i>
    </div>
    <split-pane  :min-percent='30' :default-percent='40' split="vertical" v-loading="loading">
      <div slot="paneL" class="clover_left">
        <el-table class="tab_wrap" :max-height="tableHeight" :data="procList" @row-click="getDeviceList" :row-class-name="tableRowClassName">>
          <el-table-column label="点位编码" align="left" min-width="80" prop="point_code" :show-overflow-tooltip="true" />
          <el-table-column label="点位名称" align="left" min-width="120" prop="point_name" :show-overflow-tooltip="true" />
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="page.total"
          :page-size.sync="page.pageSize"
          :current-page.sync="page.pageNo"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          class="split_pagination"
          :pager-count="5"
          small
        >
        </el-pagination>
      </div>
      <div slot="paneR" class="clover_right">
        <el-table
          class="deviceTable"
          :max-height="tableHeight+30"
          :data="deviceList"
          :row-style="{ height: '30px' }"
          :cell-style="{ padding: '0' }"
          highlight-current-row
        >
          <el-table-column label="物料规格" prop="deviceName" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{scope.row.deviceName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="50"  />
          <el-table-column label="数量"  prop="regNums" width="80"></el-table-column>
        </el-table>
      </div>
    </split-pane>
  </el-drawer>
</template>

<script>
export default {
  name: 'device_reg',
  props: {
    currentUserInfo: {
      required: true
    },
    deviceDrawer: {
      type: Boolean,
      required: false
    },
    projectvalue: {
      required: true
    },
    date_selector: {
      required: true
    },
    tagvalue: {
      required: true
    },
    uservalue: {
      required: true
    }
  },
  data () {
    return {
      loading: false,
      procList: [],
      deviceList: [],
      page: {
        total: 0,
        pageSize: 10,
        pageNo: 1
      },
      activePointCode: '',
      tableHeight: window.innerHeight - 150
    }
  },
  mounted() {
    this.getProcList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 150
    }
  },
  methods: {
    cancle () {
      this.$emit('update:deviceDrawer', false)
    },
    async getProcList() {
      this.loading = true
      const req = {
        project_code: this.projectvalue,
        proc_code: '',
        page_no: this.page.pageNo,
        page_size: this.page.pageSize,
        begin_date: this.date_selector[0],
        end_date: this.date_selector[1],
        tag: this.tagvalue.join(',').trim(),
        user_id: this.currentUserInfo.id === 'sum' ? this.uservalue.map(m => m.user_id).join(',').trim() : this.currentUserInfo.id + '',
        flag: 2// 0是拍照数量，1为审核数量,2:登记的点位
      }
      const result = await this.$pub.post('/rate/submit-audit-point-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.procList = result.data.list ? result.data.list : []
        }
      } else {
        this.$notify.error({
          title: '列表查询失败',
          message: result.message
        })
      }
      this.loading = false
      this.page.total = result.data.total
      if (this.procList[0]) {
        this.activePointCode = this.procList[0].point_code
        this.getDeviceList(this.procList[0])
      }
    },
    async getDeviceList(row) {
      this.loading = true
      this.activePointCode = row.point_code
      this.deviceList = []
      const params = {
        project_code: this.projectvalue,
        point_code: row.point_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info', params)
      if (code !== 200) {
        this.$notify.error({
          title: '列表查询失败',
          message: message
        })
      } else {
        this.deviceList = data.device_list || []
      }
      this.loading = false
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.getProcList()
    },
    handleCurrentChange(val) {
      this.page.pageNo = val
      this.getProcList()
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.point_code === this.activePointCode) {
        return 'cloverActive'
      }
      return ''
    }
  }
}
</script>

<style lang="scss">
.peo_dev{
  .d-flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 20px 10px;
  }
  .d-flex-between .el-icon-close{
    font-size:16px;
    cursor:pointer;
  }
  .clover_left{
    padding:0px 20px 80px;
    height:100%;
    box-sizing: border-box;
  }
  .clover_right{
    padding:0px 20px 0px;
    height:100%;
    box-sizing: border-box;
  }
  .split_pagination{
    text-align:right;
    margin-right:-20px;
    margin-top:10px;
  }
  .cloverActive{
    color: #409EFF;
  }
}

</style>
