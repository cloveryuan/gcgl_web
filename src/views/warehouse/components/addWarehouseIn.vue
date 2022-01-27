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
      <div style="width:540px;border-right:1px solid #eee;padding-right:10px;">
        <div class="module" style="margin-bottom:0;">
          <div style="margin-bottom:6px;">
            <span class="line"></span>
            <span>查询区</span>
          </div>
          <el-form size="small"  :inline="true" :model="form" >
            <el-form-item label="物料类型名称" label-width="96px">
              <el-input v-model="form.device_name" style="width:150px;" placeholder="请输入物料类型名称"  clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
            </el-form-item>
            <el-form-item label="规格型号" label-width="68px">
              <el-input v-model="form.device_model" placeholder="请输入规格型号" style="width:150px;" clearable @clear="handleQuery" @keyup.enter.native="handleQuery"></el-input>
            </el-form-item>
            <el-button size="mini" @click="handleQuery" type="primary" style="margin-top:4px;">查询</el-button>
            <!-- <el-button size="mini" @click="resetSearch" >重置</el-button> -->
          </el-form>
        </div>
        <el-table
          ref="multipleTable"
          :data="tableData"
          v-loading="tableLoading"
          :row-class-name="tableRowClassName"
          :max-height="tableHeight">
          <el-table-column  width="36" >
            <template slot-scope="scope">
              <span style="color:#409EFF;cursor:pointer;" v-if="!scope.row.isSelected" @click="addDevice(scope.row)"><i class="el-icon-plus"></i></span>
            </template>
          </el-table-column>
          <el-table-column prop="device_name" label="物料类型名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color:#409EFF;">{{scope.row.device_model}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="brand_name" label="品牌"></el-table-column>
          <el-table-column prop="unit" label="单位" width="50"></el-table-column>
        </el-table>
      </div>

      <!-- 选中的 -->
      <div style="width:calc(100% - 560px);">
        <div class="module" >
          <div style="margin-bottom:6px;">
            <span class="line"></span>
            <span>已选物料类型</span>
          </div>
          <div>
            <el-button @click="save" type="primary" size="mini" style="margin: 3px 0 0 10px;">确认已选物料</el-button>
          </div>
        </div>
        <el-table
          :data="allSelectData"
          :max-height="tableHeight"
          style="margin-top: 11px;">
          <el-table-column prop="device_name" label="物料类型名称"  show-overflow-tooltip></el-table-column>
          <el-table-column prop="device_model" label="规格型号" show-overflow-tooltip>
            <template slot-scope="scope">
              <span style="color:#409EFF;">{{scope.row.device_model}}</span>
          </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="60px"></el-table-column>
          <el-table-column prop="brand_name" label="品牌"></el-table-column>
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
  name: 'add_warehouse_in',
  inject: ['orderType'],
  props: {
    defaultData: {
      required: true
    },
    project_code: {
      default: ''
    },
    warehouse_id: {
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
      // defaultProps: {
      //   children: 'children',
      //   label: 'device_name'
      // },
      currentDevice: null,
      tableData: [],
      tableLoading: false,
      tableHeight: window.innerHeight - 145,
      allSelectData: [],
      leng: this.defaultData.length
    }
  },
  mounted() {
    this.getTreeData()
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 145
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
        warehouse_id: this.warehouse_id,
        page_no: 1,
        page_size: 99999
      }
      const url = '/device/manage/list-input'
      const { data, code } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message.error('获取物料类型列表出错了')
      }
      this.tableData = data.list || []
      const selectIds = this.allSelectData.map(m => m.id)
      if (selectIds.length > 0) {
        this.$nextTick(() => {
          this.tableData.forEach((f, i) => {
            if (selectIds.includes(f.id)) {
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
        if (s.id === row.id && s.brand_id === row.brand_id) {
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
        device_name: row.device_name,
        device_model: row.device_model,
        id: row.id,
        leng: ++this.leng,
        sort: row.sort,
        unit: row.unit,
        brand_name: row.brand_name,
        brand_id: row.brand_id
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
    save() {
      // const datas = this.defaultData.concat(this.allSelectData)
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
