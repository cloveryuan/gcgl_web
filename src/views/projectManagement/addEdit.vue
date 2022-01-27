<template>
  <div class="addedit_projectMana">
    <el-form ref="form" :model="form" :rules="rules" label-width="106px" v-loading="submit" size="small" >
      <el-form-item label="项目编码" prop="project_code">
        <el-input v-model="form.project_code" placeholder="请输入项目编码" />
      </el-form-item>
      <el-form-item label="招标项目编码" prop="biding_project_code">
        <el-input v-model="form.biding_project_code" placeholder="请输入招标项目编码" />
      </el-form-item>
       <el-form-item label="项目名称" prop="project_name">
        <el-input v-model="form.project_name" placeholder="请输入项目名称" />
      </el-form-item>
      <!-- <el-form-item label="项目负责人" prop="create_user_name">
        <el-select v-model="form.create_user_name" placeholder="请选择项目负责人" style="width:100%;">
          <el-option
            v-for="item in leaderList"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="所在城市" prop="city_code" v-loading="cityLoading">
        <treeselect
          search-nested
          v-model="form.city_code"
          :options="cityList"
          :normalizer="normalizer"
          :show-count="true"
          placeholder="选择上级菜单"
          :clearable="false"
        />
      </el-form-item>
      <el-form-item label="建设单位" prop="build_unit">
        <el-input v-model="form.build_unit"  placeholder="请输入建设单位"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status"  placeholder="请选择" style="width:100%;">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div  class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm" >确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'projectMana_addedit',
  data () {
    return {
      cityLoading: false,
      form: {
        project_code: '',
        biding_project_code: '',
        project_name: '',
        create_user_name: '',
        city_code: null,
        build_unit: '',
        status: null
      },
      rules: {
        project_code: [
          { required: true, message: '请输入项目编码', trigger: 'blur' }
        ],
        biding_project_code: [
          { required: true, message: '请输入招标项目编码', trigger: 'blur' }
        ],
        project_name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        create_user_name: [
          { required: true, message: '请选择项目负责人', trigger: 'blur' }
        ],
        city_code: [
          { required: true, message: '请选择所在城市', trigger: 'blur' }
        ],
        build_unit: [
          { required: true, message: '请输入建设单位', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择所在城市', trigger: 'blur' }
        ]
      },
      submit: false,
      leaderList: [],
      cityList: [],
      normalizer (node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.city_code,
          label: node.city_name,
          children: node.children
        }
      }
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    current: {
      type: Object || null,
      default: null
    },
    statusList: {
      type: Array,
      default: () => []
    }
  },
  computed: {

  },
  created() {
    this.getOptions()
    this.getCityList()
  },
  mounted() {
    this.init()
  },
  components: {
    Treeselect
  },
  methods: {
    async getOptions() {
      this.leaderList = [
        {
          name: '马园园',
          code: '001'
        },
        {
          name: '王健',
          code: '002'
        }
      ]
    },
    async getCityList() {
      this.cityLoading = true
      const { code, data } = await this.$pub.post('/project/city-list', { content: '' })
      if (code === 200) {
        this.cityList = data.children || []
      } else {
        this.$message({
          type: 'error',
          message: '查询城市列表失败',
          showClose: true
        })
      }
      this.cityLoading = false
    },
    init() {
      if (this.current) {
        const { id, project_code, biding_project_code, project_name, create_user_name, city_code, build_unit, status } = this.current
        this.form = { id, project_code, biding_project_code, project_name, create_user_name: create_user_name || '', city_code, build_unit, status }
      } else {
        this.reset()
      }
    },
    submitForm() {
      try {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submit = true
            const url = this.form.id !== undefined ? '/project/edit' : '/project/add'
            const msg = this.form.id !== undefined ? '修改' : '新增'

            const params = {
              ...this.current,
              ...this.form
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
              this.$emit('handleQuery')
              this.cancel()
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

<style lang=scss>
.dialog-footer{
  margin-top:50px;
  text-align:right;
}
</style>
