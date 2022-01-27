import axios from "axios";
import config from "../config/config";
import Vue from 'vue'
const baseUrl = process.env.VUE_APP_BASE_URL;

// 创建axios实例
export const pub = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? baseUrl+'/doc' : '/pub', 
  timeout: 300000 // 请求超时时间
});

//请求拦截器
pub.interceptors.request.use(
  (req) => {
    // const { token } = window.vm.$store.state.userInfo
    const token = Vue.ls.get('userInfo')? Vue.ls.get('userInfo').token: '';
    req.headers[config.ACCESS_TOKEN] = token;
    return req;
  },
  (err) => {
    return Promise.reject(err);
  }
);

//响应拦截器
pub.interceptors.response.use(
  (res) => {
    if (res.data.code === 401) {
      window.vm.$notify({
        type: "warning",
        message: "用户信息异常,请重新登录",
        duration: 2000
      });
      window.vm.$store.commit("setUserInfo", {});
      setTimeout(() => {
        window.location.href = "/#/login";
      }, 2000);
    }
    return res.data;
  },
  (err) => {
    console.log(err.response.status)
    const code = err.response?err.response.status:''
    if (code === 401) {
      window.vm.$notify({
        type: "warning",
        message: "用户信息异常,请重新登录",
        duration: 2000
      });
      window.vm.$store.commit("setUserInfo", {});
      setTimeout(() => {
        window.location.href = "/#/login";
      }, 2000);
    } else if(code===404){
      window.vm.$notify.error({
        title: "不存在接口",
        message: err.message
      });
    } else{
      window.vm.$notify.error({
        title: code + "服务器请求失败",
        message: err.message
      });
    }

    throw new Error(err);
  }
);