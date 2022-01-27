<template>
  <div class="f-betw" v-loading="leftLoading">
    <el-form class="search" size="small"  :inline="true" :model="form" >
      <!-- <el-form-item label="项目" label-width="40px">
        <el-select
          v-model="form.project"
          placeholder="请选择"
          size="small"
          @change="handleProjectChange"
          @visible-change="beforeShowSelect"
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
      </el-form-item> -->
      <el-form-item label="物料类型名称" label-width="96px">
        <el-input v-model="form.device_name" placeholder="请输入物料类型名称"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item label="规格型号" label-width="80px">
        <el-input v-model="form.device_model" placeholder="请输入规格型号"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-button size="mini" @click="handleQuery" type="primary">查询</el-button>
      <el-button size="mini" @click="resetSearch" >重置</el-button>
      <el-button @click="save" type="primary" size="mini" style="margin: 3px 0 0 10px;">保存</el-button>
    </el-form>
    <div class="content">
      <ul   class="_left">
        <li v-for="item in data" :key="item.id" :class="{isActive:currentRow.id===item.id}" @click="clickStage(item)">
          <div class="font">
            <el-checkbox v-model="item.checked" @change="changeStage(item)"></el-checkbox>
            <span style="margin-left:20px;">{{item.stage_name}}</span>
          </div>
        </li>
      </ul>
      <div class="_right">
        <!-- 全部物料类型 -->
        <div class="wrap">
          <span class="tit">全部物料类型</span>
          <el-table
            ref="allDataTable"
            :data="tableData"
            v-loading="alltableLoading"
            :height="tableHeight"
            row-key="device_id"
            @select="handleSelectionChange"
            @select-all="handleAllSelectionChange">
            <el-table-column type="selection" width="25" :selectable="checkSelectable"></el-table-column>
            <el-table-column prop="device_name" label="物料类型名称" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{scope.row.device_name}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="device_model" label="规格型号"  show-overflow-tooltip>
              <template slot-scope="scope">
                <span >{{scope.row.device_model}}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="brand" label="品牌" width="50px" align="center" />
            <el-table-column prop="unit" label="单位" width="50px" align="center" /> -->
          </el-table>
          <div  style="display:flex;justify-content:space-between;">
            <span  style="color:#999;font-size:14px;margin-left:6px;">共 {{total}} 条记录</span>
            <el-pagination
              :total="total"
              :page-size="page.page_size"
              @current-change="pageChange"
              @size-change="sizeChange"
              :current-page="page.page_no"
              class="pagination"
              small
              background
              layout="prev, pager, next"
            >
            </el-pagination>
          </div>
        </div>
        <!-- 选中的物料类型 -->
        <div class="wrap">
          <div>
            <span class="tit">{{currentRow?currentRow.stage_name +'/ ':''}} 已选物料类型</span>
          </div>
          <el-table
            class="selected"
            :data="(currentRow&&currentRow.device_list)?currentRow.device_list : []"
            :height="tableHeight+38">
            <el-table-column prop="device_name" label="物料类型名称"  :show-overflow-tooltip="true" />
            <el-table-column prop="device_model" label="规格型号"  :show-overflow-tooltip="true" />
            <!-- <el-table-column prop="brand" label="品牌" width="50px" align="center" />
            <el-table-column prop="unit" label="单位" width="50px" align="center" /> -->
            <el-table-column prop="specs" label="操作" width="50px">
              <template slot-scope="scope">
                <span class="cursor color" @click="del(scope)">删除</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'stage_setting',
  props: {
    project_code: {
      required: true
    },
    project_id: {
      required: true
    },
    stageFlag: {
      require: true
    }
  },
  data () {
    return {
      projectList: [],
      leftLoading: false,
      data: [],
      form: {
        project: null,
        device_name: '',
        device_model: ''
      },
      tableData: [],
      tableHeight: window.innerHeight - 230,
      currentRow: null,
      alltableLoading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      allSelectData: [],
      qtDevices: []// 除当前阶段外的阶段下的已选物料集合
    }
  },
  created() {
    this.getAllData()
    this.getLeftData()
  },
  mounted() {
    this.getProjectList()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 230
    }
  },
  methods: {
    async getProjectList() {
      const params = {
        user_id: this.$store.state.userInfo.id
      }
      const { data, code, message } = await this.$pub.post('/project/project-list-by-user', params)
      if (code !== 200) {
        return this.$message.error(message || '查询失败')
      }
      this.projectList = data || []
      this.projectList.forEach(f => {
        if (f.id === this.project_id) {
          this.form.project = f
        }
      })
    },
    handleProjectChange(val) {
      this.form.project_code = val.projectCode
      this.form.project_id = val.id
      this.handleQuery()
      this.getLeftData()
    },
    beforeShowSelect(flag) {
      if (flag) {
        this.$message({
          type: 'error',
          message: '切换项目，之前操作将被清除',
          showClose: true
        })
      }
    },
    async getLeftData() {
      this.leftLoading = true
      const { data, code, message } = await this.$pub.post('/stage/project/list', { project_code: this.form.project_code ? this.form.project_code : this.project_code })

      if (code !== 200) {
        return this.$message.error(message || '获取物料分类出错了')
      }
      this.data = (data.list || []).map(m => {
        return {
          ...m, checked: m.is_use === 1
        }
      })
      if (this.data.length > 0) {
        this.clickStage(this.data[0])
      }
      this.leftLoading = false
    },
    async getAllData() {
      this.alltableLoading = true
      const params = {
        project_code: this.project_code,
        device_name: this.form.device_name,
        device_model: this.form.device_model,
        category_id: '1',
        page_no: this.page.page_no,
        page_size: this.page.page_size
      }
      const { data, code } = await this.$pub.post('/device/manage/list', params)
      if (code !== 200) {
        return this.$message.error('获取物料类型列表出错了')
      }
      this.tableData = (data.list || []).map(m => {
        return {
          ...m, device_id: m.id
        }
      })
      this.alltableLoading = false
      this.total = data.total
      if (this.currentRow && this.currentRow.device_list) {
        this.toggleSelect()
      }
    },
    toggleSelect() {
      const selectIds = (this.currentRow.device_list || []).map(m => m.device_id)
      this.$nextTick(() => {
        this.tableData.forEach(f => {
          if (selectIds.includes(f.device_id)) {
            this.$refs.allDataTable.toggleRowSelection(f, true)
          } else {
            this.$refs.allDataTable.toggleRowSelection(f, false)
          }
        })
      })
    },
    checkSelectable(row) {
      return !this.qtDevices.includes(row.device_id)
    },
    handleQuery() {
      this.page.page_no = 1
      this.getAllData()
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
      this.getAllData()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getAllData()
    },
    clickStage(item) {
      const sure = () => {
        this.currentRow = item
        this.currentRow.device_list = item.device_list ? item.device_list : []
        let allSelect = []
        this.data.forEach(f => {
          if (f.id !== item.id) {
            allSelect = allSelect.concat((f.device_list || []).map(m => m.device_id))
          }
        })
        this.qtDevices = [...allSelect]
        this.toggleSelect()
      }
      if (this.currentRow && this.currentRow.id !== item.id && this.currentRow.is_use === 0 && this.currentRow.device_list.length > 0) {
        this.$confirm('没有选中该阶段，切换阶段将会清空该阶段下的已选物料，是否确认切换阶段为"' + item.stage_name + '?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          this.currentRow.device_list = []// 清空
          sure()
        }).catch(() => {
          this.$notify.error({
            title: '取消切换',
            message: ''
          })
        })
      } else {
        sure()
      }
    },
    changeStage(item) {
      if (!item.checked && item.device_list.length > 0) {
        this.$confirm('取消选中该阶段，将会清空该阶段下的已选物料，是否确认取消"' + item.stage_name + '?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          item.device_list = []// 清空
          this.currentRow = item
          this.toggleSelect()
        }).catch(() => {
          this.$notify.error({
            title: '取消切换',
            message: ''
          })
          item.checked = true
        })
      }
    },
    handleSelectionChange(selection, row) {
      const selectIds = selection.map(m => m.device_id)
      const list = this.currentRow.device_list
      selectIds.includes(row.device_id)
        ? list.push(row)
        : list.splice(list.findIndex(item => item.device_id === row.device_id), 1)
      if (list.length > 0) {
        this.currentRow.checked = true
      }
    },
    handleAllSelectionChange(selection) {
      const selectIds = this.currentRow.device_list.map(m => m.device_id)
      const list = this.currentRow.device_list
      if (selection.length > 0) { // 全选
        selection.forEach(f => {
          if (!selectIds.includes(f.device_id)) {
            list.push(f)
          }
        })
        if (list.length > 0) {
          this.currentRow.checked = true
        }
      } else {
        this.tableData.forEach(f => {
          if (selectIds.includes(f.device_id)) {
            list.splice(list.findIndex(item => item.device_id === f.device_id), 1)
          }
        })
      }
    },
    del(row) {
      const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.currentRow.device_list.splice(_index, 1)
        this.$nextTick(() => {
          this.tableData.forEach(f => {
            if (f.device_id === row.row.device_id) {
              this.$refs.allDataTable.toggleRowSelection(f, false)
            }
          })
        })
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
    async save() {
      const list = []
      this.data.forEach(m => {
        if (m.checked) {
          list.push({
            project_id: m.project_id ? m.project_id : this.project_id,
            project_code: m.project_code ? m.project_code : this.project_code,
            stage_code: m.stage_code,
            create_user: m.create_user,
            device_ids: (m.device_list || []).map(m => m.device_id)
          })
        }
      })

      const { code } = await this.$pub.post('/stage/project/add', { list })
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '保存失败',
          showClose: true
        })
      } else {
        this.$emit('update:stageFlag', false)
        this.$message({
          type: 'success',
          message: '保存成功',
          showClose: true
        })
      }
    }
  }
}
</script>

<style lang="scss">
.stage_wrap{
  .f-betw{
    width:100%;
    height:100%;

  }
  .content{
    display:flex;
    justify-content:space-between;
    height:calc(100% - 63px);
  }
  ._left{
    width: 205px;
    height:100%;
    border: 1px solid #eee;
    box-sizing: border-box;
    margin-top:10px;
    overflow: auto;
    .isActive{
      background: #4681BD;
    }
    li{
      cursor:pointer;
      width: 80%;
      height: 60px;
      overflow: hidden;
      background: #409EFF;
      color:#FBFFFF;;
      position: relative;
      // text-align:center;
      line-height: 60px;
      margin: 10px auto;
      .font{
        margin-left:30px;
        &::before {
          top: 15px;
          right: 5px;
          bottom: 15px;
          left: 5px;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
          transform: scale(0,1);
          -webkit-transform-origin: 0 0;
          transform-origin: 0 0;
        }
        &::after {
          top: 5px;
          right: 15px;
          bottom: 5px;
          left: 15px;
          border-right: 1px solid #fff;
          border-left: 1px solid #fff;
          transform: scale(1,0);
          transform-origin: 100% 0;
        }
      }
      .el-checkbox__inner{
        border: 2px;
      }
      .is-checked .el-checkbox__inner{
        background: #EDF2FC;
        border-color:#EDF2FC;
        &:after{
          border: 2px solid #409EFF;
          // 不覆盖下面的 会 导致对号变形
          box-sizing: content-box;
          content: "";
          border-left: 0;
          border-top: 0;
          height: 7px;
          left: 5px;
          position: absolute;
          top: 1px;
          width: 3px;
          //
          transform: rotate(45deg) scaleY(1);
        }
      }
      .el-checkbox__inner:hover {
          border-color: #EDF2FC;
      }
    }
    li .font::before,  li .font::after {
      position: absolute;
      content: '';
      opacity: 0;
      transition: all 0.5s;
    }
    li:hover .font::before,  li:hover .font::after {
      opacity: 1;
      transform: scale(1);
      transition: all 0.5s;
    }
  }
  ._right{
    width: calc(100% - 225px);
    display:flex;
    justify-content: space-between;
    margin-top:10px;
    height:100%;
    .wrap{
      width:calc(50% - 10px);
      border: 1px solid #eee;
      padding:10px 0;
      height:100%;
      box-sizing: border-box;
      .tit{
        padding: 7px 15px 7px 0;
        margin: 3px 0px 0px 10px;
      }
      .el-table{
        font-size:12px;
        .el-table-column--selection .cell{
          padding: 0 0px 0 8px;
        }
      }
    }
    .selected td{
      padding: 12px 0 13px 0;
    }
    .cursor{
      cursor:pointer;
    }
    .color{
      color: #409EFF;
    }
    .el-form-item--small.el-form-item{
      margin-bottom:6px;
    }
  }
}
</style>
