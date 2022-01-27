<template>
  <el-drawer
    size="80%"
    :visible.sync="ipDrawer"
    :with-header="false"
    custom-class="ip-photo"
    :close-on-press-escape="false"
    :wrapperClosable="false"
    >
    <div class="d-flex-between">
      <h3 style="font-weight:500" v-if="currentUserInfo">
        <p style="margin-bottom:10px;">
          {{currentUserInfo.name?currentUserInfo.name:'合计'}} -- 完工移交IP详情
        </p>
      </h3>
      <i class="el-icon-close" @click="cancle"></i>
    </div>
    <split-pane  :min-percent='30' :default-percent='40' split="vertical" v-loading="loading">
      <div slot="paneL" class="clover_left">
        <el-table class="tab_wrap" :max-height="tableHeight" :data="pointList" @row-click="getIpPhotoList" :row-class-name="tableRowClassName">>
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
        <div style="margin-bottom:10px;">
          <strong style="margin:0 10px;color:#409eff;">IP地址详情</strong>
          <div style="margin:10px 0 0 10px;">
            <span style="margin-right:6px;">网关:</span>
            <span :class="{isno: !complate.gateway}">{{complate.gateway?complate.gateway:'未填报'}}</span>
            <span style="margin:0 10px;">掩码:</span>
            <span :class="{isno: !complate.mask}">{{complate.mask?complate.mask:'未填报'}}</span>
          </div>
        </div>
        <div class="cardwrap">
          <el-card class="box-card" v-for="(dev,k) in ip_addr.list" :key="dev.device_id + k">
            <div slot="header" class="clearfix">
              <h4 style="margin:0px 0 10px 0px;">{{dev.device_name}}</h4>
              <span>IP:</span>
              <span :class="{isno: !dev.ip}">{{dev.ip?dev.ip:'未上报'}}</span>
              <span style="margin-left:10px;">特征备注:</span>
              <span :class="{isno: !dev.remark}">{{dev.remark?dev.remark:'未上报'}}</span>
            </div>
            <div class="list--picture-card" v-viewer="options" v-if="dev.attachment_list&&dev.attachment_list.length>0">
              <div class="list__item" v-for="image in dev.attachment_list" :key="image.id">
                <img
                  class="list__item-thumbnail"
                  :src="image.file_path_thumb"
                  :data-source="image.file_path"
                  style="width: 100px; height: 100px"
                  :key="image.file_path"
                />
              </div>
            </div>
            <div v-else>
              暂无图片
            </div>
          </el-card>
        </div>

      </div>
    </split-pane>
  </el-drawer>
</template>

<script>
export default {
  name: 'ip_num',
  props: {
    currentUserInfo: {
      required: true
    },
    ipDrawer: {
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
      pointList: [],
      ip_addr: {},
      complate: {
        gateway: '', // 网关
        mask: '' // 掩码
      },
      page: {
        total: 0,
        pageSize: 10,
        pageNo: 1
      },
      activePointCode: '',
      tableHeight: window.innerHeight - 150,
      options: {
        toolbar: true,
        url: 'data-source'
      }
    }
  },
  mounted() {
    this.getPointList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 150
    }
  },
  methods: {
    cancle () {
      this.$emit('update:ipDrawer', false)
    },
    async getPointList() {
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
        flag: 2// 0是拍照数量，1为审核数量,2:登记的点位,ip数量
      }
      const result = await this.$pub.post('/rate/submit-ip-photo-list', req)
      if (Number(result.code) === 200) {
        if (result.data !== null) {
          this.pointList = result.data.list ? result.data.list : []
        }
      } else {
        this.$notify.error({
          title: '列表查询失败',
          message: result.message
        })
      }
      this.loading = false
      this.page.total = result.data.total
      if (this.pointList[0]) {
        this.activePointCode = this.pointList[0].point_code
        this.getIpPhotoList(this.pointList[0])
      }
    },
    async getIpPhotoList(row) {
      this.loading = true
      this.activePointCode = row.point_code
      const params = {
        project_code: this.projectvalue,
        point_code: row.point_code
      }
      const { code, message, data } = await this.$pub.post('/point/device/ip/list', params)
      if (code !== 200) {
        this.$notify.error({
          title: '详情查询失败',
          message: message
        })
        this.ip_addr = {}
        this.complate = {
          gateway: '', // 网关
          mask: '' // 掩码
        }
      } else {
        this.ip_addr = data.ip_addr
        this.complate = {
          gateway: this.ip_addr.gateway, // 网关
          mask: this.ip_addr.mask, // 掩码
          isEdit: false,
          error: null
        }
      }
      this.loading = false
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.getPointList()
    },
    handleCurrentChange(val) {
      this.page.pageNo = val
      this.getPointList()
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
.ip-photo{
  .d-flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 20px 10px;
  }
  .vue-splitter-container{
    height:calc(100% - 100px)!important;
  }
  .d-flex-between .el-icon-close{
    font-size:16px;
    cursor:pointer;
  }
  .clover_left,.clover_right{
    padding:0px 20px 20px;
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
  .isno{
    color: #f40;
  }
  .cardwrap{
    height:calc(100% - 60px);
    overflow: auto;
  }
  .box-card{
    margin-bottom:10px;
    .list--picture-card .list__item{
      width: 100px;
      height: 100px;
      border-radius: 0;
     margin: 0 8px 8px 0;
         display: inline-block;
    }
  }
}

</style>
