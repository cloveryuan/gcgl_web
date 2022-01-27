<template>
  <div class="page">
    <div class="login-form">
      <p class="title">桑达公共安全视频监控类工程管理系统</p>
      <el-form
        @keyup.enter.native="submit"
        :model="form"
        status-icon
        ref="loginForm"
        :rules="rules"
        v-if="isNoApp"
      >
        <el-form-item prop="mobile">
          <el-input
            type="text"
            v-model="form.mobile"
            prefix-icon="el-icon-mobile-phone"
            placeholder="请输入手机号"
            auto-complete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" :error="valicodeErr">
          <el-input
            type="password"
            v-model="form.password"
            prefix-icon="el-icon-news"
            placeholder="请输入密码"
            auto-complete="off"
          ></el-input>
        </el-form-item>
        <el-form-item class="submit-box">

          <el-button style="margin-left:0px;" class="button" @click="submit" :loading="submitLoading" type="primary">登录</el-button>
           <span style="float:right;margin:10px 2px 15px 0;color:#409EFF;cursor:pointer;" @click="enter">下载app</span>
        </el-form-item>
      </el-form>
      <div v-else class="code_wrap" >
        <div class="qrcode" ref="qrCodeUrl" v-loading="loading"></div>
        <span class="export" style="">请扫描二维码进行下载</span>
        <a style="margin-left:15px;cursor:pointer;" :href="url">直接下载</a>
        <el-button :loading="loading"   style="width:100%;margin-top:10px" @click="leave">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
export default {
  data() {
    const validateMobile = (rule, value, callback) => {
      if (value === '') {
        this.getMsgDisabled = true
        callback(new Error('请输入手机号'))
      } else if (!(/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value))) {
        this.getMsgDisabled = true
        callback(new Error('请输入正确的手机号'))
      } else {
        this.getMsgDisabled = false
        callback()
      }
    }
    return {
      form: {
        mobile: '',
        password: '',
        type: '0'
      },
      rules: {
        mobile: [{ validator: validateMobile, trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'change' }]
      },
      submitLoading: false,
      getMsgDisabled: true,
      valicodeErr: '',
      isNoApp: true,
      loading: false,
      qrcode: null,
      url: null,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    var mobile = this.$store.state.mobile
    if (mobile !== null) {
      this.form.mobile = mobile
    }
    this.$store.commit('SET_MENUS', [])
  },
  methods: {
    submit() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const result = await this.$pub.post('/sys/login', this.form)
            if (result.code === 200) {
              this.$store.commit('setUserInfo', result.data)
              const _path = this.redirect || '/'
              this.$router.push({ path: _path })
            } else {
              this.$notify.error({
                title: '登录失败',
                message: result.message
              })
              // return;
            }
          } catch (e) {
            this.$notify.error({
              title: '登录服务器请求失败',
              message: e.message
            })
          }
          this.submitLoading = false
        }
      })
    },
    async getAppUrl() {
      this.loading = true
      const { code, data, message } = await this.$pub.post('/sys/app/version')
      if (code === 200) {
        this.url = data.path
        this.$nextTick(() => {
          this.creatQrCode()
        })
      } else {
        this.$notify.error({
          title: '获取APP地址失败',
          message: message || ''
        })
      }
      this.loading = false
    },
    creatQrCode() {
      this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
        text: this.url, // 需要转换为二维码的内容
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    },
    enter() {
      this.getAppUrl()
      this.isNoApp = false
    },
    leave() {
      this.isNoApp = true
      if (this.qrcode) {
        this.url = null
        this.qrcode = null
      }
    }
  }
}
</script>

<style lang="scss">
.page {
    background: #fff;
    font-family: "PingFangSC-Regular";
    background-size: cover;
    position:relative;
    width:100%;
    height:100%;
  .login-form {
      width: 386px;
      height: 390px;
      // margin: 100px auto;
      background: #fff;
      opacity: 0.95;
      border-radius: 10px;
      margin: auto;
      position: absolute;
      top:50%;
      left:50%;
      margin-left:-193px;
      margin-top:-300px;
  }
  .title {
      text-align: center;
      font-size: 27px;
      color: #333333;
      padding: 27px 0;
  }

  .valicode-int {
      width: 58%;
  }
  .valicode-btn {
      width: 40%;
      float: right;
  }

  .submit-box .button {
      width: 100%;
      border-radius: 4px;
      font-size: 15px;
  }

  .desc {
      color: #666;
      font-size: 14px;
  }

  .desc a {
      color: #409EFF;
  }
}
.code_wrap{
  width:100%;
  height:307px;
  text-align:center;
  background: #23b7bd;
  padding-top:30px;
  .export {
    text-align: center;
    font-size: 14px;
    color: #fff;
  }
  .qrcode {

    height:250px;
    width:250px;
    margin:0 auto;
    img {
      margin:0 auto;
      width: 240px;
      height: 240px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
      box-sizing: border-box;
    }
  }
  a{
    color: #333;
  }
  .el-button {
    &:hover{
      color: #23b7bd;
    }
  }
}
</style>
