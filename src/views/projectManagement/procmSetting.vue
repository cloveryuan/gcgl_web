<template>
  <div style="width:100%;height:100%;">
    <el-form class="search" size="small"  :inline="true" :model="form" >
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
      <el-tree
        class="_left"
        :data="procList"
        v-loading="procLoading"
        node-key="id"
        @node-click="clickProc">
        <span class="custom-tree-node" slot-scope="{ node,data }" :class="{isActive:currentRow&&(data.procCode&&currentRow.procCode===data.procCode)}">
          <span
            :style="{cursor: data.is_fill_device===0?'not-allowed':'pointer',color:data.is_fill_device===0?'#ccc':''}"
          >{{ node.label }}</span>
        </span>
      </el-tree>
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
            <el-table-column type="selection" width="25"></el-table-column>
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
            <span class="tit">{{currentRow?currentRow.label +'/ ':''}} 已选物料类型</span>
          </div>
          <el-table
            class="selected"
            :data="(currentRow&&currentRow.device_list)?currentRow.device_list : []"
            :height="tableHeight+38">
            <el-table-column prop="device_name" label="物料类型名称"  :show-overflow-tooltip="true" />
            <el-table-column prop="device_model" label="规格型号"  :show-overflow-tooltip="true" />
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
  name: 'procm_setting',
  props: {
    project_code: {
      required: true
    },
    project_id: {
      required: true
    },
    procMFlag: {
      require: true
    }
  },
  data () {
    return {
      form: {
        project: null,
        device_name: '',
        device_model: ''
      },
      procList: [],
      procLoading: false,
      tableData: [],
      tableHeight: window.innerHeight - 230,
      currentRow: null,
      tableLoading: false,
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      allSelectData: [],
      prePar: null
    }
  },
  created() {
    this.getMaterData()
    this.getProcList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 230
    }
  },
  methods: {
    async getProcList() {
      this.procLoading = true
      this.procList = []
      const { data, code, message } = await this.$pub.post('/proc/device/proc_list_device', { project_code: this.form.project_code ? this.form.project_code : this.project_code, point_code: '' })

      if (code !== 200) {
        return this.$message.error(message || '获取工序出错了')
      }
      if (data.length > 0) {
        this.getProc(data)
        // this.clickProc(this.procList[0])
      }
      this.procLoading = false
    },
    getProc(data) {
      data.map(m => {
        const tmpobj = {
          label: m.className,
          children: this.getChild(m.procList),
          ...m
        }
        this.procList.push(tmpobj)
      })
    },
    getChild(arr) {
      return (arr || []).map(m => {
        return {
          label: m.procName,
          ...m
        }
      })
    },
    async getMaterData() {
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
    // 回填全部物料table表
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
    handleQuery() {
      this.page.page_no = 1
      this.getMaterData()
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
      this.getMaterData()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getMaterData()
    },
    clickProc(item) {
      if (item.is_fill_device === 0) {
        return
      }
      if (item.procCode && (!this.currentRow || this.currentRow.procCode !== item.procCode)) { // 必须是工序步骤
        this.currentRow = item
        this.currentRow.device_list = item.device_list ? item.device_list : []
        this.toggleSelect()
        this.$nextTick(() => {
          // 去掉上一次选中的行样式
          if (this.prePar) {
            this.prePar.classList.remove('isActive_tree_item')
          }
          // 给当前选中的行样式
          const el = document.querySelector('.isActive')
          if (el) {
            this.prePar = el.parentNode
            this.prePar.classList.add('isActive_tree_item')
          }
        })
      }
    },
    handleSelectionChange(selection, row) {
      this.currentRow.isEdit = true
      const selectIds = selection.map(m => m.device_id)
      const list = this.currentRow.device_list
      selectIds.includes(row.device_id)
        ? list.push(row)
        : list.splice(list.findIndex(item => item.device_id === row.device_id), 1)
    },
    handleAllSelectionChange(selection) {
      this.currentRow.isEdit = true
      const selectIds = this.currentRow.device_list.map(m => m.device_id)
      const list = this.currentRow.device_list
      if (selection.length > 0) { // 全选
        selection.forEach(f => {
          if (!selectIds.includes(f.device_id)) {
            list.push(f)
          }
        })
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
        this.currentRow.isEdit = true
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
      const classList = []
      this.procList.forEach(m => {
        const procList = this.getEditProc(m.children)
        if (procList.length > 0) {
          classList.push({
            classCode: m.classCode,
            procList
          })
        }
      })
      const params = {
        project_code: this.project_code,
        classList
      }
      const { code } = await this.$pub.post('/proc/device/add_proc_device', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '保存失败',
          showClose: true
        })
      } else {
        // this.$emit('update:procMFlag', false)
        this.$message({
          type: 'success',
          message: '保存成功',
          showClose: true
        })
        this.clickProc(this.currentRow)
      }
    },
    getEditProc(procList) {
      const list = []
      procList.forEach(f => {
        if (f.isEdit) {
          list.push({
            procCode: f.procCode,
            device_ids: (f.device_list || []).map(m => m.device_id)
          })
        }
      })
      return list
    }
  }
}
</script>

<style lang="scss">
.procm_wrap{
  width:100%;
  height:100%;
  .content{
    display:flex;
    justify-content:space-between;
    height:calc(100% - 63px);
  }
  ._left{
    width: 300px;
    height:100%;
    border: 1px solid #eee;
    box-sizing: border-box;
    margin-top:10px;
    overflow: auto;
    font-size: 16px;
    color: #000;
    .isActive_tree_item{
      color:#fff;
      background-color: #409EFF!important;
    }
    .el-tree-node__content{
      height: 36px;
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
    .el-tree-node__content:hover {
      background-color: #EBF5FE;
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
    width: calc(100% - 320px);
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
