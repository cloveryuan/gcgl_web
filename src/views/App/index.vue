<template>
  <div>
    <div class="btns">
      <el-button size="mini" icon="el-icon-plus" type="primary" @click="handleAdd">新增</el-button>
      <el-button size="mini" icon="el-icon-delete" type="danger" :disabled="selectedData.length<=0" :loading="deleteLoading" @click="handleDelete(selectedData)">删除</el-button>
    </div>

    <el-table ref="table" v-loading="loading" :height="tableHeight" :data="tableData" size="small" style="width: 100%;" @selection-change="selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column  prop="id" width="50" label="主键" />
      <el-table-column width="100" prop="appVersionIndex" label="app版本索引" />
      <el-table-column  width="100" prop="appVersionName" label="app版本名称" />
      <el-table-column  prop="appStatus" label="app启用状态" width="90" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.appStatus"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            :active-value="1"
            :inactive-value="2"
            @change="changeStatus(scope.row, scope.row.appStatus)"
          />
          <!-- 1启用 2停用 -->
        </template>
      </el-table-column>
      <el-table-column prop="appUrl" min-width="200" label="app下载地址" />
      <el-table-column width="100" prop="appDownloadCount" label="app下载次数" />
      <el-table-column prop="appDesc" label="app描述" />
      <el-table-column prop="createId" label="数据录入人" />
      <el-table-column width="140" prop="createTime" label="数据录入时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <el-button
            slot="reference"
            class="border"
            type="text"
            @click="handleInfo(scope.row)"
          >
            详情
          </el-button>
          <el-popconfirm
            title="确定删除本条数据吗？"
            @onConfirm="handleDelete([scope.row],1)"
          >
            <el-button slot="reference" class="border" style="margin-left:6px" type="text" :loading="scope.row.delLoading">删除</el-button>
          </el-popconfirm>
          <el-button slot="reference" class="border" style="margin-left:6px" type="text" @click="handleDownLoad(scope.row)">下载</el-button>
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

    <!-- 新增 详情 -->
    <el-dialog :close-on-click-modal="false"  :visible.sync="dialogVisible" :title="title" width="700px">
      <add
      :dialogVisible.sync="dialogVisible"
       @handleQuery="handleQuery"
       @parseTime="parseTime"
       :isAdd="isAdd"
       :detailData="detailData"></add>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'
import add from './add.vue'
export default {
  name: 'appSeting',
  data () {
    return {
      loading: false,
      tableData: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      dialogVisible: false,
      title: '新增',
      isAdd: false,
      detailData: null,
      baseUrl: 'http://36.133.34.40:82/',
      deleteLoading: false,
      selectedData: [],
      tableHeight: window.innerHeight - 200
    }
  },
  computed: {

  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200
    }
    this.getList()
  },
  components: {
    add
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      // const { code } = await this.$pub('')
      const params = {
        child_array: [],
        area_array: [],
        status_array: [],
        origin_array: [],
        tag_array: [],
        project_code: 'TEST20200610',
        point_cond: '',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data } = await this.$pub.post('/point/manage/list', params)
      if (code === 200) {
        // this.tableData = [
        //   {
        //     appDesc: '升级说明：\n1) 修复申请改派处理BUG。\n2) 优化消息阅读、删除功能。',
        //     appDownloadCount: null,
        //     appStatus: 1,
        //     appUrl: 'version/v1.5.0/sed_gcgl.apk',
        //     appVersionIndex: 205,
        //     appVersionName: 'V2.0.5',
        //     createId: 1,
        //     createTime: 1624583981000,
        //     id: 22
        //   },
        //   {
        //     appDesc: '升级日志：\n1）添加派出所工单查询功能。\n2）添加通道导航功能。\n3）添加通道坐标更新功能。\n4）优化按钮操作。',
        //     appDownloadCount: null,
        //     appStatus: 2,
        //     appUrl: 'appVersion/21/dfyw-2021062205284967.apk',
        //     appVersionIndex: 204,
        //     appVersionName: 'V2.0.4',
        //     createId: 1,
        //     createTime: 1624354129000,
        //     id: 21
        //   }
        // ]
        this.tableData = data.list
        this.total = data.total
      } else {
        this.tableData = []
        this.total = 0
      }
      this.loading = false
    },
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    selectionChangeHandler(val) {
      this.selectedData = val
    },
    changeStatus(data, val) {
      const currentStatus = val === 2 ? '停用' : '启用'
      this.$confirm('此操作将app版本名称为"' + data.appVersionName + '"的状态改为"' + currentStatus + '" ' + ',是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

      }).catch(() => {
        data.appStatus = data.appStatus === 1 ? 2 : 1
      })
    },
    handleAdd() {
      this.dialogVisible = true
      this.isAdd = true
      this.title = '新增'
    },
    handleDelete(arrs, type) {
      if (type === 1) {
        arrs[0].delLoading = true
      }
      this.deleteLoading = true
      const ids = arrs.map(m => m.id)
      this.$confirm('是否确认删除数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('/proc/step/del', { ids })
        this.deleteLoading = false
        if (type === 1) {
          arrs[0].delLoading = false
        }
        if (code === 200) {
          this.$message({
            type: 'success',
            message: message || '删除成功',
            showClose: true
          })
          this.handleQuery()
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(() => {
        this.deleteLoading = false
        if (type === 1) {
          arrs[0].delLoading = false
        }
      })
    },
    handleInfo(row) {
      this.dialogVisible = true
      this.isAdd = false
      this.title = '详情'
      this.detailData = row
    },
    downloadFile(obj, name, suffix) {
      const url = this.baseUrl + obj
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      const fileName = this.parseTime(new Date()) + '-' + name + '.' + suffix
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleDownLoad(val) {
      const arr = val.appUrl.split('.')
      this.downloadFile(val.appUrl, arr[0], arr[1])
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    }
  }
}
</script>

<style scoped>

</style>
