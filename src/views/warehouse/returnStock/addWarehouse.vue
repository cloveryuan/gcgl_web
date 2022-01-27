<!-- 物料类型选择 -->
<template>
  <div style="height:100%;" class="f-betw">
    <div class="_left">
      <el-tree
        v-loading="treeLoading"
        ref="tree"
        class="tree"
        :data="treeData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :check-on-click-node="true">
        <span class="el-tree-node__content" slot-scope="{ node, data }" @click="selectDevice(data,node)">
          <span class="el-tree-node__label" :style="{fontSize:'14px',color: currentDevice &&(data.id === currentDevice.id)?'#409EFF':''}" >{{ data.name }}</span>
        </span>
      </el-tree>
    </div>
    <div class="_right f-betw">
      <!-- 查询区 -->
      <div style="width:500px;border-right:1px solid #eee;padding-right:10px;">
        <div class="module" style="margin-bottom:0px;display:flex;align-items: center;">
          <span class="line"></span>
          <span>查询区</span>
          <el-form size="small"  :inline="true" :model="form" style="display:inline-block;margin-bottom:0px;">
            <el-form-item label="物料类型名称" label-width="96px" style="margin-bottom:0px;">
              <el-input v-model="form.device_name" style="width:135px;" placeholder="请输入"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
            </el-form-item>
            <el-form-item label="规格型号" label-width="68px" style="margin-bottom:0px;">
              <el-input v-model="form.device_model" placeholder="请输入" style="width:135px;" clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-button size="mini" @click="handleQuery" type="primary" style="margin-top:4px;">查询</el-button>
        <el-table
          ref="multipleTable"
          :data="tableData"
          :row-class-name="tableRowClassName"
          v-loading="tableLoading"
          :max-height="tableHeight">
          <el-table-column  width="25" >
            <template slot-scope="scope">
              <span style="color:#409EFF;cursor:pointer;" v-if="!scope.row.isSelected" @click="addDevice(scope.row)"><i class="el-icon-plus"></i></span>
            </template>
          </el-table-column>
          <el-table-column prop="device_name" label="物料类型名称" min-width="110px" show-overflow-tooltip></el-table-column>
          <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color:#409EFF;">{{scope.row.device_model}}</span>
          </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="50"></el-table-column>
          <el-table-column  prop="device_brand_name" label="品牌" width="50"></el-table-column>
          <el-table-column prop="out_number" label="出库数量" width="80"></el-table-column>
        </el-table>
      </div>

      <!-- 选中的 -->
      <div style="width:calc(100% - 520px);">
        <div class="module" style="margin-bottom:0;">
          <div style="margin-bottom:6px;">
            <span class="line"></span>
            <span>已选物料类型</span>
          </div>
          <div>
            <el-button @click="save" type="primary" size="mini" style="margin-top: 3px 0 0 10px;">确认已选物料</el-button>
          </div>
        </div>
        <el-table
          :data="allSelectData"
          :max-height="tableHeight"
          style="margin-top: 11px;">
          <el-table-column prop="device_name" label="物料类型名称" min-width="110px" show-overflow-tooltip></el-table-column>
          <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color:#409EFF;">{{scope.row.device_model}}</span>
          </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="50"></el-table-column>
          <el-table-column prop="device_brand_name" label="品牌" width="50"></el-table-column>
          <el-table-column prop="out_number" label="出库数量" width="78"></el-table-column>
          <el-table-column prop="specs" label="操作" width="80px">
            <template slot-scope="scope">
              <el-button type="text" @click="del(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'add_warehouse_return',
  props: {
    defaultData: {
      required: true
    },
    project_code: {
      default: ''
    },
    dept_id: {
      required: true
    }
  },
  data () {
    return {
      form: {
        device_name: '',
        device_model: ''
      },
      treeData: [],
      treeLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      currentDevice: null,
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 180,
      allSelectData: [],
      leng: this.defaultData.length
    }
  },
  mounted() {
    this.getTreeData()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180
    }
    this.allSelectData = [...this.defaultData]
  },
  methods: {
    resetSearch() {
      this.form = {
        device_name: '',
        device_model: ''
      }
      this.getTableData()
    },
    selectDevice(data) {
      this.currentDevice = data
      this.tableData = []
      this.getTableData()
    },
    async getTreeData() {
      this.treeLoading = true
      const { data, code, message } = await this.$pub.post('/device/category/list', { project_code: this.project_code })
      if (code !== 200) {
        return this.$message.error(message || '获取物料分类出错了')
      }
      this.treeData = data ? Array.isArray(data) ? [] : [data] : []
      this.treeLoading = false
      this.selectDevice(this.treeData[0])
    },
    async getTableData() {
      if (!this.currentDevice) {
        return this.$message.error('请选择分类')
      }
      this.tableLoading = true
      const params = {
        project_code: this.project_code,
        device_name: this.form.device_name,
        device_model: this.form.device_model,
        category_id: this.currentDevice.id + '',
        dept_id: this.dept_id
      }
      const url = '/device/stock/list-device-rtn'
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message.error('获取物料类型列表出错了')
      }

      this.tableData = data.list || []
      this.tableLoading = false
      const selectIds = this.allSelectData.map(m => m.device_id)
      if (selectIds.length > 0) {
        this.$nextTick(() => {
          this.tableData.forEach((f, i) => {
            if (selectIds.includes(f.device_id)) {
              this.$refs.multipleTable.toggleRowSelection(f, true)
            }
          })
        })
      }
      this.tableLoading = false
    },
    handleQuery() {
      if (!this.currentDevice) {
        return this.$message.error('请选择分类')
      }
      this.tableData = []
      this.getTableData()
    },
    tableRowClassName({ row }) {
      if (this.allSelectData.length <= 0) {
        row.isSelected = false
      }
      this.allSelectData.some(s => {
        if (s.device_id === row.device_id && s.device_model === row.device_model && s.device_brand === row.device_brand) {
          row.isSelected = true
          return true
        } else {
          row.isSelected = false
        }
      })
      return row.isSelected ? 'selected_dev' : ''
    },
    addDevice(row) {
      this.allSelectData.push({
        category_id: row.category_id,
        device_model: row.device_model,
        device_name: row.device_name,
        device_brand: row.device_brand,
        device_brand_name: row.device_brand_name,
        device_id: row.device_id,
        leng: ++this.leng,
        sort: row.sort,
        unit: row.unit,
        out_number: row.out_number
      })
    },
    del(row) {
      const _index = row.$index
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.allSelectData.splice(_index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    save() {
      this.$emit('sureAddTableData', this.allSelectData)
    }
  }
}
</script>

<style scoped lang="scss">
.f-betw{
  width:100%;
  display:flex;
  justify-content:space-between;
  ._left{
    width: 200px;
    height:calc(100% - 20px);
    border-right:1px solid #eee;
    overflow: auto;
    padding-right:10px;
    .tree{
      .el-tree-node__content{
        flex:1;
        ._right {
          flex:1;
          text-align: right;
          margin-right:10px;
        }
      }
    }
  }
  ._right{
    width: calc(100% - 200px);
    height:calc(100% - 20px);
    overflow: auto;
    padding:0 10px;
    .module{
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
      }
  }
}
</style>
<style lang="scss">
.f-betw{
  .el-table td{
    padding: 7px 0;
  }
  .el-form-item--small.el-form-item{
    margin-bottom:10px;
  }
  .el-form-item__label{
    padding-right:4px;
  }
  .el-form--inline .el-form-item{
    margin-right:4px;
  }
  .cell{
    .el-button{
      padding:0;
    }
  }
  .el-table__row.selected_dev{
    background:#535457;
    color:#fff!important;
    i,span{
      color:#fff!important;
    }
  }
  .el-table--enable-row-hover .el-table__body .selected_dev:hover>td {
    background-color: #535457;
    color:#fff!important;
    i,span{
      color:#fff!important;
    }
  }
}

</style>
