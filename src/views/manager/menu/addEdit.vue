<template>
  <div class="add_edit_menu">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group size="mini" v-model="form.type">
              <el-radio-button label="1">目录</el-radio-button>
              <el-radio-button label="2">菜单</el-radio-button>
              <el-radio-button label="3">按钮</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="上级菜单">
            <treeselect
              v-model="form.pid"
              :options="menuOptions"
              :normalizer="normalizer"
              :show-count="true"
              placeholder="选择上级菜单"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="form.type !== '3'" label="菜单图标">
            <el-popover
              placement="bottom-start"
              width="460"
              trigger="click"
              @show="$refs['iconSelect'].reset()"
            >
              <IconSelect ref="iconSelect" @selected="selected" />
              <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" >
                <svg-icon
                  v-if="form.icon"
                  slot="prefix"
                  :icon-class="form.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
              </el-input>
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12" >
          <el-form-item label="菜单名称" prop="name" v-if="form.type !== '3'">
            <el-input v-model="form.name" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item v-if="form.type === '3'" label="按钮名称" prop="name">
            <el-input v-model="form.name" placeholder="按钮名称"  />
          </el-form-item>
        </el-col>
        <el-col :span="12" >
          <el-form-item label="权限规则" v-if="form.type !== '1'" prop="permission">
            <el-input v-model="form.permission" placeholder="请输入权限规则名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type !== '3'" label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12"  v-if="form.type !== '3'&&form.i_frame==='0'">
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-show="form.type === '2'" label="组件名称" prop="component_name">
            <el-input v-model="form.component_name"  placeholder="匹配组件内Name字段" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type !== '3'" label="是否外链">
            <el-radio-group size="mini" v-model="form.i_frame">
              <el-radio-button label="1">是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type !== '3'" label="是否隐藏">
            <el-radio-group size="mini" v-model="form.hidden">
              <el-radio-button label="1">是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
         <el-col :span="12">
          <el-form-item v-if="form.type === '2'" label="是否缓存">
            <el-radio-group size="mini" v-model="form.cache">
              <el-radio-button label="1">是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type !== '3'" label="所属平台">
            <el-radio-group size="mini" v-model="form.is_app">
              <el-radio-button label="1">移动</el-radio-button>
              <el-radio-button label="0">PC</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div  class="dialog-footer">
      <el-button size="mini" :loading="submitLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
export default {
  name: 'add_edit_menu',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    current: {
      type: Object || null,
      default: null
    },
    pid: {
      type: Number,
      default: 0
    }
  },
  data () {
    var nameValid = (rule, value, callback) => {
      if (value && value.length > 50) {
        callback(new Error('请输入50字以内'))
      } else {
        callback()
      }
    }
    var pathValid = (rule, value, callback) => {
      const reg = /^[A-Za-z\-0-9\/\.]+$/
      if (value && value.length > 100) {
        callback(new Error('请输入100字以内'))
      } else if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('输入的不符合要求，请重输'))
      }
    }
    var permissionValid = (rule, value, callback) => {
      if (value && value.length > 50) {
        callback(new Error('请输50字以内'))
      } else {
        callback()
      }
    }
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: nameValid, trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' },
          { validator: pathValid, trigger: 'blur' }
        ],
        permission: [
          { required: true, message: '请输入权限规则', trigger: 'blur' },
          { validator: permissionValid, trigger: 'blur' }
        ],
        component_name: [
          { validator: permissionValid, trigger: 'blur' }
        ],
        component: [
          { required: true, message: '请输入组件路径', trigger: 'blur' },
          { validator: pathValid, trigger: 'blur' }
        ]
      },
      /** 转换菜单数据结构 */
      normalizer (node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.id,
          label: node.label,
          children: node.children
        }
      },
      menuList: [],
      menuOptions: [],
      submitLoading: false
    }
  },
  computed: {

  },
  mounted() {
    this.init()
  },
  components: { Treeselect, IconSelect },
  methods: {
    init() {
      if (this.current) {
        const row = this.current
        this.form = {
          id: row.id,
          pid: row.pid,
          permission: row.permission,
          name: row.name,
          icon: row.icon,
          type: '' + row.type,
          sort: row.sort,
          i_frame: '' + row.i_frame,
          hidden: '' + row.hidden,
          path: row.path,
          component: row.component,
          component_name: row.component_name,
          remark: row.remark,
          is_app: row.is_app ? row.is_app : 0,
          cache: row.cache ? row.cache + '' : '0'
        }
      } else {
        this.reset()
        this.form.pid = this.pid
      }
      this.getTreeselect()
    },
    async getTreeselect () {
      const { code, data } = await this.$pub.post('sys/menu/tree')
      if (code === 200) {
        this.menuList = data || []
      } else {
        this.menuList = []
      }
      const menu = { id: 0, label: '主类目', children: this.menuList }
      this.menuOptions.push(menu)
    },
    // 选择图标
    selected (name) {
      this.form.icon = name
    },
    // 表单重置
    reset () {
      this.form = {
        id: undefined,
        pid: 0,
        permission: '',
        name: undefined,
        icon: undefined,
        type: '1',
        sort: 0,
        i_frame: '0',
        hidden: '0',
        path: '',
        component: '',
        component_name: null,
        remark: '',
        is_app: 0,
        cache: '0'
      }
    },
    cancel () {
      this.$emit('update:open', false)
      this.reset()
    },
    submitForm () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitLoading = false
          console.log(this.form)
          const url = this.form.id !== undefined ? 'sys/menu/edit' : 'sys/menu/add'
          const msg = this.form.id !== undefined ? '编辑' : '新增'
          this.form.sort = this.form.sort + ''
          this.form.pid = this.form.pid + ''
          this.form.component = this.form.component ? this.form.component : '-'
          this.form.path = this.form.path ? this.form.path : '-'
          this.form.is_app = this.form.is_app ? this.form.is_app + '' : '0'
          this.form.cache = Number(this.form.cache) === 1 ? this.form.cache + '' : '0'
          this.form.icon = this.form.icon ? this.form.icon : '0'
          const { code } = await this.$pub.post(url, this.form)
          this.submitLoading = false
          if (code !== 200) {
            this.$message.error(msg + '失败')
          } else {
            this.cancel()
            this.$message.success(msg + '成功')
            this.$emit('handleQuery')
          }
        }
      })
    }
  }
}
</script>
<style lang="scss">
.add_edit_menu{
  .dialog-footer{
    margin-top:50px;
    text-align:right;
  }
  .el-form-item{
    margin-bottom:15px;
    .el-form-item__error{
      padding-top:0;
    }
  }
  .el-form-item__content{
    line-height: 32px;
    .el-input__inner{
      height:32px;
    }
  }
  .vue-treeselect__control{
    height:30px!important;
  }
  .vue-treeselect__placeholder{
    line-height: 30px;
    font-size:14px;
  }
  .vue-treeselect--single .vue-treeselect__input-container{
    height:30px;
  }
  .el-input-number.is-controls-right .el-input-number__decrease{
    bottom:4px;
  }
  .el-input-number__decrease, .el-input-number__increase{
    top:4px;

  }
  .el-input-number.is-controls-right .el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase{
    line-height: 15px;
  }
}
</style>
