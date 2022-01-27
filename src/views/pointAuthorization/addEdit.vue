<template>
  <div class="addedit_projectMana">
    <el-form ref="form" :model="form" :rules="rules" label-width="110px" v-loading="submit" size="small">
      <el-form-item label="角色名称" prop="role_name">
        <el-input v-model="form.role_name"  placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="授权规则描述" prop="desc">
        <el-input v-model="form.desc" type="textarea" placeholder="请输入授权规则描述" />
      </el-form-item>
      <el-form-item label="状态" prop="status" >
        <el-select v-model="form.status"  placeholder="请选择"  style="width:100%;">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="授权模式" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="item.code" v-for="item in typeList" :key="item.code">{{item.name}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="wrap1" v-if="form.type===config.child">
        <h5>子系统:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="child.isIndeterminate" v-model="child.checkAll" @change="(val)=>handleCheckAllChange(val,'child')">全选</el-checkbox>
          <el-checkbox-group v-model="child.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'child')">
            <el-checkbox v-for="item in child.list" :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap1" v-if="form.type===config.area">
        <h5>区域:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="area.isIndeterminate" v-model="area.checkAll" label="全选" @change="(val)=>handleCheckAllChange(val,'area')">全选</el-checkbox>
          <el-checkbox-group v-model="area.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'area')">
            <el-checkbox v-for="item in area.list" :label="item.key" :key="item.key">{{item.value}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="wrap" v-if="form.type===config.point">
        <div class="_left">
          <div class="module">
            <div>
              <span class="line"></span>
              <span>自定义点位</span>
            </div>
            <div class="search">
              <el-form-item label="点位名称/编码" label-width="105px" >
                <el-input v-model="leftSearch" style="width:250px;" placeholder="请输入"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
              </el-form-item>
              <el-button size="mini" @click="handleQuery" type="primary" >查询</el-button>
            </div>
          </div>
          <el-table :data="leftData" :height="tableHeight-40" ref="multipleTable" :row-class-name="tableRowClassName" v-loading="leftLoading" style="width: 100%">
            <el-table-column  width="36" >
              <template slot-scope="scope">
                <span style="color:#409EFF;cursor:pointer;" v-if="!scope.row.isSelected" @click="addPoint(scope.row)"><i class="el-icon-plus"></i></span>
              </template>
            </el-table-column>
            <el-table-column prop="point_code" label="点位编码" width="110px" show-overflow-tooltip></el-table-column>
            <el-table-column  prop="point_name" label="点位名称" min-width="220px" show-overflow-tooltip></el-table-column>
          </el-table>
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
        <div  class="_right">
          <div class="module">
            <div>
              <span class="line"></span>
              <span>已选点位</span>
            </div>
            <div class="search">
              <el-form-item label="点位名称/编码" label-width="105px" >
                <el-input v-model="rightSearch" style="width:250px;" placeholder="请输入"  clearable></el-input>
              </el-form-item>
              <el-button size="mini" @click="searchSelected" type="primary" >查询</el-button>
            </div>
          </div>
          <el-table :data="rightData" :height="tableHeight"  style="width: 100%">
            <el-table-column prop="point_code" label="点位编码" width="120px">
              <template slot-scope="scope">
                <span v-html="getPointShow(scope.row,'point_code')"></span>
              </template>
            </el-table-column>
            <el-table-column  prop="point_name" label="点位名称" min-width="220px">
               <template slot-scope="scope">
                <span v-html="getPointShow(scope.row,'point_name')"></span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80px">
              <template slot-scope="scope">
                <el-button type="text" @click="del(scope)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="wrap1" v-if="form.type===config.tag">
        <h5>标签:</h5>
        <div class="aside">
          <el-checkbox :indeterminate="tag.isIndeterminate" v-model="tag.checkAll" @change="(val)=>handleCheckAllChange(val,'tag')">全选</el-checkbox>
          <el-checkbox-group v-model="tag.checkedList" @change="(val)=>handleCheckedCitiesChange(val,'tag')">
            <el-checkbox v-for="item in tag.list" :label="item" :key="item">{{item}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-form>
    <div  class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm" >确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'pointAutho_addedit',
  data () {
    return {
      form: {
        role_name: '',
        desc: '',
        type: 1,
        status: 0,
        project_id: this.project
      },
      child: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      area: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      tag: {
        isIndeterminate: false,
        checkAll: false,
        list: [],
        checkedList: []
      },
      config: {
        child: 2,
        point: 3,
        area: 4,
        tag: 5
      },
      rules: {
        role_name: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        child: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择', trigger: 'blur' }
        ]
      },
      tableHeight: window.innerHeight - 420,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      leftLoading: false,
      leftData: [],
      rightData: [],
      leftSearch: '',
      rightSearch: '',
      allSelectData: [],
      submit: false,
      statusList: [
        { value: 0, label: '正常' }, { value: 1, label: '停用' }
      ]
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    current: {
      type: [Object, null],
      default: null
    },
    project: {
      type: [String, Number],
      default: ''
    },
    project_code: {
      type: String,
      default: ''
    },
    typeList: {
      type: Array,
      default: () => []
    }
  },
  computed: {

  },
  mounted() {
    this.getChildList()
    this.getAreaList()
    this.getTagList()
    this.getPointList()
    this.init()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 420
    }
  },
  components: {

  },
  methods: {
    // 全选start
    handleCheckAllChange(val, item) {
      if (val) {
        this[item].checkAll = true// 全选
        this[item].isIndeterminate = false// 半选
        this[item].checkedList = this[item].list.map(m => {
          return m.key !== undefined ? m.key : m
        })
      } else {
        this[item].checkAll = false// 全选
        this[item].isIndeterminate = false// 半选
        this[item].checkedList = []
      }
    },
    handleCheckedCitiesChange(val, item) {
      const checkedCount = val.length
      this[item].checkAll = checkedCount === this[item].list.length
      this[item].isIndeterminate = checkedCount > 0 && checkedCount < this[item].list.length
    },
    async getChildList() {
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.project })
        if (Number(code) === 200) {
          this.child.list = data || []
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
    async getAreaList() {
      try {
        const { data, code, message } = await this.$pub.post('/project/area-list', { project_id: this.project })
        if (Number(code) === 200) {
          this.area.list = data || []
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
    async getTagList() {
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', {
        projectCode: this.project_code
      })
      if (code === 200) {
        this.tag.list = data || []
      } else {
        this.tag.list = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    async init() {
      this.child.checkedList = []
      this.rightData = []
      this.area.checkedList = []
      if (this.current) {
        this.submit = true
        const { data, code } = await this.$pub.post('project/project-role-detail', { id: this.current.id })
        this.submit = false
        if (code === 200) {
          const { id, role_name, desc, type, status, ids, project_id } = data
          this.form = { id, role_name, desc, type, status, project_id }

          if (type === this.config.child) {
            this.child.checkedList = (ids || []).map(m => m.detail_id)
          } else if (type === this.config.point) {
            this.rightData = (ids || []).map(m => {
              return {
                point_id: Number(m.detail_id),
                point_code: m.key,
                point_name: m.value
              }
            })
          } else if (type === this.config.area) {
            this.area.checkedList = (ids || []).map(m => m.detail_id)
          } else if (type === this.config.tag) {
            this.tag.checkedList = (ids || []).map(m => m.detail_id)
          }
        } else {
          this.$message({
            type: 'error',
            message: '获取详情失败',
            showClose: true
          })
        }
      } else {
        this.reset()
      }
    },
    async getPointList() {
      this.leftLoading = true
      const params = {
        project_id: this.project,
        point_name: this.leftSearch,
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { code, data, message } = await this.$pub.post('project/project-point', params)
      this.leftLoading = false
      if (code !== 200) {
        this.leftData = []
        this.total = 0
        return this.$message.error(message || '查询出错了')
      } else {
        this.leftData = data.list || []
        this.total = data.total

        const selectIds = this.rightData.map(m => Number(m.point_id))
        if (selectIds.length > 0) {
          this.$nextTick(() => {
            this.leftData.forEach((f, i) => {
              if (selectIds.includes(f.point_id)) {
                this.$refs.multipleTable.toggleRowSelection(f, true)
              }
            })
          })
        }
      }
    },
    handleQuery() {
      this.page.page_no = 1
      this.getPointList()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getPointList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getPointList()
    },
    searchSelected() {
      const tempData = []
      const otherData = []
      this.rightData.forEach(f => {
        if (f.point_name.indexOf(this.rightSearch) > -1 || f.point_code.indexOf(this.rightSearch) > -1) {
          tempData.push(f)
        } else {
          otherData.push(f)
        }
      })
      this.rightData = tempData.concat(otherData)
    },
    getPointShow(row, type) {
      const value = row[type]
      let show = row[type]
      const num = value ? value.toLowerCase().indexOf(this.rightSearch.toLowerCase()) : -1
      if (num > -1) {
        const searchName = value.substr(num, this.rightSearch.length)
        const replaceReg = new RegExp(this.rightSearch, 'ig')
        const replaceString = '<span style="background: #ffff00;">' + searchName + '</span>'
        show = (value || '').replace(replaceReg, replaceString)
      }
      return show
    },
    tableRowClassName({ row }) {
      if (this.rightData.length <= 0) {
        row.isSelected = false
      }
      this.rightData.some(s => {
        if (s.point_id === Number(row.point_id)) {
          row.isSelected = true
          return true
        } else {
          row.isSelected = false
        }
      })
      return row.isSelected ? 'selected' : ''
    },
    addPoint(row) {
      this.rightData.push(row)
    },
    del(row) {
      const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rightData.splice(_index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!',
          showClose: true
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    submitForm() {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submit = true
            const url = this.form.id !== undefined ? 'project/project-role-edit' : 'project/project-role-add'
            const msg = this.form.id !== undefined ? '修改' : '新增'

            const type = this.form.type
            let ids = []
            switch (type) { // type为1存项目id,type为2存子系统id,type为3存点位id,type为4存区域名称,type为5存标签名称
              case 1:
                ids = [this.project + '']
                break
              case 2:
                ids = this.child.checkedList
                break
              case 3:
                ids = this.rightData.map(m => m.point_id + '')
                break
              case 4:
                ids = this.area.checkedList
                break
              case 5:
                ids = this.tag.checkedList
                break
              default:
                break
            }
            const params = {
              ...this.form,
              create_user: this.$store.state.userInfo.id,
              type,
              ids
            }
            const { code, message } = await this.$pub.post(url, params)
            this.submit = false
            if (code !== 200) {
              this.$message({
                type: 'error',
                message: message || msg + '失败',
                showClose: true
              })
            } else {
              this.$message({
                type: 'success',
                message: msg + '成功',
                showClose: true
              })
              this.cancel()
              this.$emit('handleQuery')
            }
          }
        })
      } catch (err) {
        this.submit = false
      }
    },
    // 取消按钮
    cancel () {
      this.$emit('update:open', false)
      this.reset()
    },
    // 表单重置
    reset () {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss">
.addpointAu{
  .el-drawer__header{
    margin-bottom: 0px;
  }
  .el-drawer__body{
    overflow-y: auto;
  }

}
.addedit_projectMana{
  padding:20px 20px 0;
  box-sizing: border-box;
  .wrap1{
    margin-top:20px;
    display:flex;
    width:100%;
    border:1px solid #eee;
    padding: 10px;
    box-sizing: border-box;
    .aside{
      margin-left:10px;
      flex:1;
      display:flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      >.el-checkbox{
        margin-right:30px;
      }
      .el-checkbox{
        min-width: 150px;
      }
    }
  }
  .wrap{
    margin-top:20px;
    display:flex;
    width:100%;
    border:1px solid #eee;
    padding: 0 10px;
     box-sizing: border-box;
    .module{
      .el-form-item{
        margin-bottom:0;
      }
      .line{
        display: inline-block;
        width: 3px;
        height:14px;
        background:#4DD2D2;
        vertical-align: middle;
        margin-right:4px;
      }
      span{
        vertical-align: middle;
      }
      .search{
        margin:10px 0;
        display:flex;
        align-items:center;
        .el-button--mini{
          padding: 8px 15px;
        }
      }
    }
    .el-table td{
      padding: 7px 0;
    }
    ._left{
      border-right:1px solid #eee;
      padding-right:10px;
      width:50%;
      .el-table__row.selected{
        background:#535457;
        color:#fff!important;
        i,span{
          color:#fff!important;
        }
      }
      .el-table--enable-row-hover .el-table__body .selected:hover>td {
        background-color: #535457;
        color:#fff!important;
        i,span{
          color:#fff!important;
        }
      }
    }
    ._right{
       padding-left:10px;
      width:50%;
      .cell .el-button {
        padding: 0;
      }
    }

  }
  .dialog-footer{
    margin-top:20px;
    text-align:right;
  }
}

</style>
