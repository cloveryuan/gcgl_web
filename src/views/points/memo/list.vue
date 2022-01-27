<template>
  <div class="memo_wrapList">
    <div class="search">
      <el-form size="small" label-position="left" inline>
        <el-form-item label="时间">
          <el-date-picker
            @change="changeTime"
            v-model="search.time"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="分类">
          <el-select
              v-model="search.memo_type"
              clearable
              placeholder="请选择分类"
              @clear="handleQuery"
            >
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="search.memo_content" placeholder="请输入关键字" clearable  @clear="handleQuery"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleQuery" size="mini">查询</el-button>
        <el-button type="primary" @click="add" size="mini" style="float:right;" v-hasPermi="['points:memoListOpera']">新增</el-button>
      </el-form>
    </div>

    <el-table :data="tableData" :height="tableHeight" v-loading="tableLoading" style="width: 100%">
      <el-table-column prop="memo_type_name" label="分类" width="100px"></el-table-column>
      <el-table-column prop="create_user_name" label="录入人" width="100px"></el-table-column>
      <el-table-column prop="create_time" label="时间" min-width="120px">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.create_time)}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="memo_title" label="标题" min-width="100px" show-overflow-tooltip></el-table-column>
      <el-table-column prop="memo_content" label="内容" min-width="150px" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <span class="cursor" @click="info(scope.row)">详情</span>
          <span v-if="scope.row.create_user === user_id">
            <span class="cursor" @click="edit(scope.row)" v-hasPermi="['points:memoListOpera']">编辑</span>
            <span class="cursor" @click="del(scope.row)" v-hasPermi="['points:memoListOpera']">删除</span>
          </span>
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

    <!-- 详情 -->
    <el-dialog append-to-body :close-on-click-modal="false"  :visible.sync="infoDialog"  title="备忘录详情" width="700px" >
      <el-descriptions direction="vertical" :column="4" border v-loading="infoLoading" v-if="currentRow" size="mini" class="memo_infowrap">
        <el-descriptions-item label="标题" :span="2">{{currentRow.memo_title?currentRow.memo_title:'-'}}</el-descriptions-item>
        <el-descriptions-item label="分类">{{currentRow.memo_type_name?currentRow.memo_type_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="录入人">{{currentRow.create_user_name?currentRow.create_user_name:'-'}}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="4">{{currentRow.memo_content?currentRow.memo_content:'-'}}</el-descriptions-item>
        <el-descriptions-item label="时间">{{currentRow.create_time?parseTime(currentRow.create_time):'-'}}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 新增 编辑 -->
    <el-dialog append-to-body :close-on-click-modal="false"  :visible.sync="operaDialog"  :title="operaTitle" width="700px" class="memo_opera" @close="()=>operaLoading=false">
      <el-form  ref="form" :model="form" :rules="rules" size="small" label-width="75px"  >
        <el-row>
          <el-col :span="12">
            <el-form-item label="标题" prop="memo_title">
              <el-input v-model="form.memo_title" placeholder="请输入标题"  style="width:100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="memo_type">
              <el-select
                v-model="form.memo_type"
                clearable
                placeholder="请选择分类"
                style="width:100%;"
              >
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容" prop="memo_content">
              <el-input v-model="form.memo_content" type="textarea" :rows="6" placeholder="请输入内容"  style="width:100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="btns" >
        <el-button type="primary" @click="save" size="mini" :loading="operaLoading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils/tool'
export default {
  name: 'memo_list',
  inject: ['pointInfo', 'project_code'],
  data () {
    return {
      search: {
        time: '',
        memo_type: null,
        memo_content: ''
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      typeList: [],
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 180,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      infoDialog: false,
      infoLoading: false,
      currentRow: null,
      form: {
        memo_title: '',
        memo_type: '',
        memo_content: ''
      },
      operaDialog: false,
      operaTitle: '新增备忘录',
      operaLoading: false,
      rules: {
        memo_title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        memo_type: [
          { required: true, message: '请选择分类', trigger: 'blur' }
        ],
        memo_content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    user_id() {
      return this.$store.state.userInfo.id
    }
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
    this.getDirectionList()
    this.handleQuery()
  },
  methods: {
    parseTime,
    async getDirectionList() {
      this.$dict(this, 'memo_type').then((res) => {
        if (res.code === 200) {
          this.typeList = (res.data || []).map(m => {
            return {
              ...m,
              value: Number(m.value)
            }
          })
        } else {
          this.$message.error('出错了字典memo_type')
          this.typeList = []
        }
      })
    },
    async getList() {
      this.tableLoading = true
      const time = this.search.time || []
      const params = {
        content: this.search.memo_content,
        begin_time: time[0] ? time[0] + ' 00:00:00' : null,
        end_time: time[1] ? time[1] + ' 23:59:59' : null,
        memo_type: this.search.memo_type ? this.search.memo_type : null,
        project_code: this.project_code,
        point_code: this.pointInfo.point_code,
        ...this.page
      }
      const { code, data } = await this.$pub.post('/point/memo/list', params)
      this.tableLoading = false
      if (code === 200) {
        this.tableData = data.list || []
        this.total = data.total
      } else {
        this.$message.error('出错了')
        this.tableData = []
      }
    },
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    changeTime(val) {
      if (!val) {
        this.handleQuery()
      }
    },
    info(row) {
      this.currentRow = row
      this.infoDialog = true
    },
    add() {
      this.form = {
        memo_title: '',
        memo_type: '',
        memo_content: ''
      }
      this.currentRow = null
      this.operaTitle = '新增备忘录'
      this.operaDialog = true
    },
    edit(row) {
      this.currentRow = row
      this.form = { ...row }
      this.operaTitle = '编辑备忘录'
      this.operaDialog = true
    },
    del(row) {
      this.$confirm('是否确认删除数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.tableLoading = true
          const { code, message } = await this.$pub.post('/point/memo/del', { id: row.id })
          this.tableLoading = false
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
        } catch (err) {
          this.tableLoading = false
        }
      }).catch(function () {})
    },
    save() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.operaLoading = true
          const base = {
            memo_title: this.form.memo_title,
            memo_type: this.form.memo_type,
            memo_content: this.form.memo_content
          }
          const params = !this.currentRow ? {
            project_code: this.project_code,
            point_code: this.pointInfo.point_code,
            ...base
          } : {
            id: this.currentRow.id,
            ...base
          }
          const url = !this.currentRow ? '/point/memo/add' : '/point/memo/edit'
          const { code, message } = await this.$pub.post(url, params)
          if (code === 200) {
            this.$message({
              type: 'success',
              message: '保存成功',
              showClose: true
            })
            this.operaDialog = false
            this.handleQuery()
          } else {
            this.$message({
              type: 'error',
              message: message || '保存出错了',
              showClose: true
            })
          }
          this.operaLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.memo_wrapList{
  height:calc(100% - 45px);
  padding:0 20px 20px;
  box-sizing:border-box;
  .cursor{
    cursor: pointer;
    color: #409eff;
    margin-right: 10px;
  }
}
.memo_infowrap{
  .el-descriptions-item__label{
    font-size:14px;
    color: rgb(97, 96, 96);
  }
  .el-descriptions-item__content{
    font-size:14px;
    color: rgb(155, 153, 153);
  }
}
.memo_opera{
  .btns{
    text-align:right;
  }
}
</style>
