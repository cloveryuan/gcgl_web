<template>
  <div class="addedit_person" v-loading="roleLoading">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户账号" prop="user_account" >
              <el-input style="width:100%" v-model="form.user_account" placeholder="请输入用户账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名称" prop="user_name">
              <el-input style="width:100%" v-model="form.user_name" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select style="width:100%" v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="dept_id">
              <treeselect
                style="width:100%"
                v-model="form.dept_id"
                :normalizer="normalizer"
                placeholder="输入搜索词查询归属部门"
                noOptionsText="输入搜索词查询归属部门"
                searchPromptText="输入搜索词查询归属部门"
                noResultsText="没有含搜索词的部门"
                :options="deptOptions"
                :async="iscbAsync"
                :load-options="iscbAsync ? loadOptions : null"
                @open="treeOpen"
                />
            </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item style="width:100%" label="用户类型" prop="user_type">
              <el-radio-group v-model="form.user_type">
                <el-radio
                  v-for="dict in user_typeOptions"
                  :key="dict.dict_value"
                  :label="dict.dict_value"
                  >{{ dict.dict_label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" size="mini" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel" size="mini">取 消</el-button>
      </div>
  </div>
</template>

<script>
import Treeselect, { ASYNC_SEARCH } from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'add_edit_person',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    statusOptions: {
      type: Object,
      default: () => {}
    },
    current: {
      type: Object || null,
      default: null
    },
    currentDept: {
      type: Object || null,
      default: null
    }
  },
  data () {
    return {
      form: {
        id: undefined,
        dept_id: undefined,
        user_account: undefined,
        user_name: undefined,
        roleIds: [],
        user_type: 0
      },
      rules: {
        user_account: [
          { required: true, message: '用户账户不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码作为用户账户',
            trigger: 'blur'
          }
        ],
        user_name: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' }
        ],
        dept_id: [
          { required: true, message: '归属部门不能为空', trigger: 'blur' }
        ],
        visit_type: [
          { required: true, message: '请选择访问类型', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: '角色不能为空', trigger: 'blur' }
        ],
        user_type: [
          { required: true, message: '用户类型必选', trigger: 'blur' }
        ]
      },
      // 用户类型数据字典 0内部 1施工单位
      user_typeOptions: [
        {
          dict_label: '施工单位',
          dict_value: 1
        },
        {
          dict_label: '内部',
          dict_value: 0
        }
      ],
      roleOptions: [],
      submitLoading: false,
      roleLoading: false,
      deptOptions: [],
      iscbAsync: false
    }
  },
  computed: {

  },
  mounted() {
    this.init()
  },
  components: {
    Treeselect
  },
  methods: {
    init() {
      this.getroleOptions()
      if (this.current) {
        const { user_id, dept_id, dept_name, user_account, user_name, role_id, user_type } = this.current
        this.form = {
          id: user_id,
          dept_id,
          user_account,
          user_name,
          roleIds: role_id.split(',').map(m => Number(m)),
          user_type: user_type
        }
        this.deptOptions.push({
          jc: dept_name,
          id: dept_id
        })
      } else {
        this.reset()
        this.deptOptions.push(this.currentDept)
      }
    },
    treeOpen() {
      this.iscbAsync = true
    },
    // 查询部门列表
    async loadOptions({ action, searchQuery, callback }) {
      if (action === ASYNC_SEARCH) {
        const params = {
          mc: searchQuery.trim()
        }
        let deptOptions = []
        const { data, code, msg } = await this.$pub.post('/sys/dept/list-tree', params)
        if (code !== 200) {
          this.$message.error(msg || '获取部门出错了')
          deptOptions = []
        } else {
          deptOptions = Array.isArray(data.dept) ? data.dept : [data.dept]
        }
        callback(null, deptOptions)
      }
    },
    async getroleOptions() {
      this.roleLoading = true
      const params = {
        name: '',
        page_no: 1,
        page_size: 99999999999
      }
      const { data, msg, code } = await this.$pub.post('sys/role/list', params)
      if (code === 200) {
        this.roleOptions = data.list
      } else {
        this.roleOptions = []
        this.$message.error(msg || '获取角色列表出错了')
      }
      this.roleLoading = false
    },
    // 取消按钮
    cancel() {
      this.$emit('update:open', false)
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        dept_id: this.currentDept.id,
        user_account: undefined,
        user_name: undefined,
        roleIds: [],
        user_type: 0
      }
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if ((node.child && !node.child.length) || node.child === null) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.jc, // mc
        children: node.child
      }
    },
    /** 提交按钮 */
    submitForm() {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submitLoading = true
            const url = this.form.id !== undefined ? 'sys/user/manage/edit' : 'sys/user/manage/add'
            const msg = this.form.id !== undefined ? '修改' : '新增'
            const params = {
              id: this.form.id,
              user_account: this.form.user_account,
              user_name: this.form.user_name,
              mobile: this.form.user_account,
              dept_id: this.form.dept_id + '',
              role_id: this.form.roleIds.map(m => Number(m)),
              user_type: this.form.user_type + ''
            }

            const { code, message } = await this.$pub.post(url, params)
            this.submitLoading = false
            if (code !== 200) {
              this.$message.error(message || msg + '失败')
            } else {
              this.cancel()
              this.$message.success(msg + '成功')
              this.$emit('handleQuery')
            }
          }
        })
      } catch (err) {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style  lang="scss">
.addedit_person{
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
    // line-height: 32px;
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
}
</style>
