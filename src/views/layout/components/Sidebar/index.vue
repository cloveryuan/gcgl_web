<template>
    <div class="main_header">
      <template v-if="mode==='horizontal'">
        <div class="icontit">
          <router-link class="logo-box" to="/">
            <img src="../../../../assets/images/logo.png" alt="logo" />
          </router-link>
          <div class="title">{{title}}</div>
        </div>
        <div class="navbar" >
          <el-menu
            :default-active="activeMenu"
            :mode="mode"
            router
            :background-color="variables.menuBg"
            :text-color="variables.menuText"
            :active-text-color="variables.menuActiveText"
          >
            <sidebar-item v-for="route in permission_routers" :key="route.path" :item="route" />
          </el-menu>

        </div>
      </template>
      <div v-else class="leftright">
        <div class="wrap">
          <i :class="[isCollapse?'el-icon-s-unfold':'el-icon-s-fold']" @click="changeCollapse"></i>
          <span>欢迎进入 公共安全视频监控类工程管理系统</span>
        </div>
        <!-- <el-breadcrumb separator="/">
          <el-breadcrumb-item  v-for="item of breadListLast" :key="item.path">
            {{item.name}}
          </el-breadcrumb-item>
        </el-breadcrumb> -->
      </div>
      <ul class="tools">
        <li>
          <el-dropdown
            placement="bottom"
            trigger="click"
            @command="handleAccount"
          >
            <span class="topic">
              {{ userInfo.userName}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="editPassword" style="line-height: 30px;">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" style="line-height: 30px;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        <!-- <li>
          <i class="el-icon-setting" @click="changeMode"></i>
        </li> -->
      </ul>

      <el-dialog
        :visible.sync="dialog"
        :close-on-click-modal="false"
        title="修改密码"
        append-to-body
        width="500px"
        @close="cancel"
      >
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="88px">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input v-model="form.oldPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="form.newPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPass">
          <el-input v-model="form.confirmPass" type="password" auto-complete="on" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SidebarItem from './SidebarItem'
export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '桑达工程管理系统'
    },
    permission_routers: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: '/'
    },
    variables: {
      type: Object,
      default: () => {
        return {
          menuBg: '#23b7bd',
          menuText: '#8ffffe',
          menuActiveText: '#fff'
        }
      }
    },
    mode: {
      type: String,
      default: 'horizontal'
    }
  },
  data() {
    const confirmPass = (rule, value, callback) => {
      if (value) {
        if (this.form.newPass !== value) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请再次输入密码'))
      }
    }

    const some = (rule, value, callback) => {
      if (value) {
        const reg = /[\^]/g
        if (this.form.newPass === this.form.oldPass) {
          callback(new Error('新旧密码不可以一致'))
        } else if (reg.test(value)) {
          callback(new Error('密码不能包含^'))
        } else {
          console.log(value)
          callback()
        }
      } else {
        callback(new Error('请再次输入密码'))
      }
    }
    return {
      breadListLast: [],
      loading: false,
      dialog: false,
      form: { oldPass: '', newPass: '', confirmPass: '' },
      rules: {
        oldPass: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { required: true, validator: some, trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPass: [
          { required: true, validator: confirmPass, trigger: 'blur' }
        ]
      }
    }
  },
  components: { SidebarItem },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  watch: {
    $route(route) {
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    handleAccount(type) {
      if (type === 'logout') {
        this.$confirm('确定注销并退出系统吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('Logout').then(() => {
            location.reload()
            // this.$router.push('/login')
          })
        })
      } else if (type === 'editPassword') {
        this.dialog = true
      }
    },
    changeMode() {
      const mode = this.mode === 'horizontal' ? 'vertical' : 'horizontal'
      this.$store.commit('SET_MODE', mode)
    },
    changeCollapse() {
      this.$emit('changeCollapse')
    },
    getBreadcrumb() {
      const matched = this.$route.matched.filter(item => item.name)
      this.breadListLast = matched
    },
    // 修改密码
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          const params = {
            user_id: this.$store.state.userInfo.id,
            old_pwd: this.form.oldPass,
            new_pwd: this.form.newPass,
            new_pwd_again: this.form.confirmPass
          }
          const { code, message } = await this.$pub.post('/sys/change-pwd', params)
          if (Number(code) === 200) {
            this.$notify({
              title: '密码修改成功，请重新登录',
              type: 'success',
              duration: 1500
            })
            setTimeout(() => {
              this.$store.dispatch('Logout').then(() => {
                location.reload()
                this.$router.push('/login')
              })
            }, 1500)
          } else {
            this.loading = false
            this.$notify.error({
              title: '查询失败',
              message: message
            })
          }
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.dialog = false
      this.$refs.form.resetFields()
      this.form = { oldPass: '', newPass: '', confirmPass: '' }
    }
  }
}
</script>
<style lang="scss">
.ver-wrapper{
  .main_header {
    line-height: 60px;
  }
}
.main_header {
  padding: 0 10px 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  background:#23b7bd;
  box-sizing: border-box;
  min-width: 100%;
  width: fit-content;
  .el-menu--horizontal>.el-menu-item.is-active{
    // border-bottom-color: #73e5e4!important;
  }
  .navbar{
    .el-menu-item{
      padding: 0 15px;
    }
    .el-menu.el-menu--horizontal {
      display: flex;
      justify-content: flex-start;
      border-bottom: none;
    }
  }
  .icontit{
    display:flex;
    align-items: center;
  }
}
</style>
<style scoped lang="scss">
.main_header {
  // overflow: auto;
  .logo-box img {
    display: block;
  }
  .navbar {
    // flex: 1;
  }
  a:-webkit-any-link {
    text-decoration: none;
  }
  .title {
    max-width: 280px;
    min-width:170px;
    padding: 0 20px;
    color: white;
  }
  .menu {
    float: left;
    padding-left: 100px;
  }

  .tools {
    // display: flex;
    margin-left:auto;
    background: #23b7bd;
    min-width:90px;
    height:100%;
    li{
      height:100%;
      line-height: 60px;
    }
    .topic {
      text-decoration: none;
      cursor: pointer;
      color: #fff;
    }
    .setting{
       font-size: 16px;
    }
  }
  .tools > li {
    margin-right:20px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }
  .leftright{
    .wrap{
      // height:30px;
      display: flex;
      align-items: center;
    }
    i{
      font-size: 22px;
      line-height: 30px;
      margin-right: 18px;
      vertical-align: middle;
      cursor: pointer;
    }
    .el-breadcrumb {
      margin-left: 39px;
    }
  }
}
.el-drawer__header {
  span {
    outline: none!important;
  }
}
</style>
