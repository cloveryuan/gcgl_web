<template>
  <div class="menu_index ">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="菜单名称" prop="menu_name">
        <el-input
          v-model="queryParams.menu_name"
          placeholder="请输入菜单名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
          @clear="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态"  @clear="handleQuery" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dict_value"
            :label="dict.dict_label"
            :value="dict.dict_value"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <div class="table_list">
    <div class="header">
      <el-button size="mini"   icon="el-icon-plus" type="primary" @click="handleAdd">新增</el-button>
      <el-button size="mini"   type="primary" @click="handleExpand">{{isExpand?'一键折叠':'一键展开'}}</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :height="tableHeight"
      ref="expandTable"
    >
      <el-table-column prop="name" label="菜单名称" :show-overflow-tooltip="true" min-width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="80">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" align="center" width="60"></el-table-column>
      <el-table-column prop="permission" label="权限标识"  :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="path" label="请求地址"  :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="hidden" label="是否隐藏" align="center" width="78">
         <template slot-scope="scope">
           <span>{{scope.row.hidden===1?'是':'否'}}</span>
         </template>
      </el-table-column>
      <el-table-column prop="i_frame" label="是否外链" align="center" width="78">
         <template slot-scope="scope">
           <span>{{scope.row.i_frame===1?'是':'否'}}</span>
         </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180px">
        <template slot-scope="scope">
          <el-button size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>

          <el-button
            v-if="scope.row.menu_type!=2"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <add-edit
        v-if="open"
        :open.sync="open"
        :current="current"
        :pid="parent_id"
        @handleQuery="handleQuery"></add-edit>
    </el-dialog>
  </div>
</template>

<script>
import addEdit from './addEdit.vue'
export default {
  name: 'managerMenu',
  components: { addEdit },
  data () {
    return {
      // 遮罩层
      loading: false,
      // 菜单表格树数据
      menuList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 显示状态数据字典
      always_showOptions: [],
      // 菜单状态数据字典
      statusOptions: [],
      // 所属模块字典数据
      moduleOptions: [],
      // 菜单类型字典数据
      menu_typeOptions: [],
      // 是否外链字典数据
      frameOptions: [],
      // 查询参数
      queryParams: {
        menu_name: undefined,
        visible: undefined
      },
      current: null,
      parent_id: 0,
      tableHeight: window.innerHeight - 245,
      isExpand: false
    }
  },
  created () {
    this.getManagerMenuList()
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 245
    }
  },
  methods: {
    async getManagerMenuList () {
      try {
        this.loading = true
        const { data, code } = await this.$pub.post('sys/menu/query', { name: this.queryParams.menu_name })
        if (code !== 200) {
          this.$message.error('查询菜单列表失败')
        } else {
          this.menuList = Array.isArray(data) ? data : [data]
        }
        this.loading = false
      } catch (err) {}
    },
    // 显示状态字典翻译
    visibleFormat (row, column) {
      if (row.menu_type === 2) {
        return ''
      }
      return this.$fn.selectDictLabel(this.always_showOptions, row.visible)
    },
    // 菜单状态字典翻译
    statusFormat (row, column) {
      if (row.menu_type === 2) {
        return ''
      }
      return this.$fn.selectDictLabel(this.statusOptions, row.status)
    },
    // 菜单所属模块字典翻译
    moduleFormat (row, column) {
      if (row.menu_type === 2) {
        return ''
      }
      return this.$fn.selectDictLabel(this.moduleOptions, row.module_type)
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.getManagerMenuList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.$fn.resetForm.call(this, 'queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd (row) {
      if (row != null) {
        this.parent_id = row.id
      } else {
        this.parent_id = 0
      }
      this.open = true
      this.title = '添加菜单'
      this.current = null
    },
    // 一键折叠，一键展开
    handleExpand() {
      this.isExpand = !this.isExpand
      this.handleChildExpand(this.menuList)
    },
    handleChildExpand(arr) {
      arr.forEach(row => {
        this.$refs.expandTable.toggleRowExpansion(row, this.isExpand)
        if (row.children && row.children.length > 0) {
          this.handleChildExpand(row.children)
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.open = true
      this.title = '修改菜单'
      this.current = row
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const id = row.id
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return this.$pub.post('sys/menu/del', { id })
      }).then(() => {
        this.handleQuery()
        this.$message.success('删除成功')
      }).catch(function () {})
    }
  }
}
</script>
<style lang="scss">
.menu_index {
  margin:0 auto;
  width:100%;
  .header{
    margin-bottom:10px;
    // border:1px solid #eee;
    // border-bottom:0;
    }
}
</style>
