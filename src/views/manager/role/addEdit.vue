<template>
  <div class="addedit_role">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="submit">
      <el-form-item label="角色名称" prop="role_name">
        <el-input v-model="form.role_name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="菜单权限" class="roleqx is-required">
        <el-tree
          :data="menuOptions"
          show-checkbox
          ref="menu"
          node-key="id"
          empty-text="加载中，请稍后"
          :props="defaultProps"
          :default-checked-keys="form.menu_ids"
        ></el-tree>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div  class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm" v-loading="submit">确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'add_edit_role',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    menuOptions: {
      type: Array,
      default: () => []
    },
    current: {
      type: Object || null,
      default: null
    }
  },
  data () {
    return {
      submit: false,
      form: {}, // 表单参数
      rules: { // 表单校验
        role_name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    'current.menus': {
      handler(val) {
        this.form.menu_ids = val
      },
      deep: true
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.current) {
        this.form = {
          id: this.current.id,
          role_name: this.current.name,
          menu_ids: this.current.menus,
          remark: this.current.remark
        }
      } else {
        this.reset()
      }
    },
    submitForm() {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            const url = this.form.id !== undefined ? 'sys/role/edit' : 'sys/role/add'
            const msg = this.form.id !== undefined ? '修改基本信息' : '新增基本信息'
            const arr1 = this.$refs.menu.getCheckedKeys()
            const arr2 = this.$refs.menu.getHalfCheckedKeys()
            // this.form.menu_ids = [...new Set(arr1.concat(arr2))]

            if (arr1.length <= 0 && arr2.length <= 0) {
              return this.$message({
                type: 'error',
                message: '必须至少配置一个菜单',
                showClose: true,
                customClass: 'message3'
              })
            }
            this.submit = true
            const params = {
              id: this.form.id,
              name: this.form.role_name,
              remark: this.form.remark,
              create_user: this.$store.state.userInfo.id
              // menu_ids: this.form.menu_ids
            }
            const { code, data, message } = await this.$pub.post(url, params)
            this.submit = false
            if (code !== 200) {
              this.$message({
                type: 'error',
                message: message || msg + '失败',
                showClose: true
              })
            } else {
              if (data) this.form.id = data
              this.$emit('roleGrant', { role_id: this.form.id, menu_id: [...new Set(arr1.concat(arr2))] })
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
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.form = {
        id: undefined,
        role_name: undefined,
        menu_ids: [],
        remark: ''
      }
    }
  }
}
</script>

<style lang="scss">
.addedit_role{
  .dialog-footer{
    margin-top:50px;
    text-align:right;
  }
  .roleqx{
    .el-form-item__content{
      max-height: 300px;
      overflow: auto;
    }
  }
}
</style>
