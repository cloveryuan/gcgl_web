<template>
  <div class="construcInfo" v-loading="loading">
    <p><span>点位编码:{{currentRow.point_code}}</span></p>
    <p style="margin-top:10px;"><span>点位名称:{{currentRow.point_name}}</span></p>
    <info
      :user_type="user_type"
      :did="did"
      :deviceList="deviceList"
      :procLists="procLists"
      :statusOptions="statusOptions"
      :showPhotoBtn="true"
      @getImageList="getImageList"></info>
  </div>
</template>

<script>
import info from './info.vue'
export default {
  name: 'construcInfo',
  props: {
    currentProc: {
      required: true
    },
    currentRow: {
      required: true
    },
    user_type: { // 为0就展示物料清单
      default: 0
    },
    did: { // proc_submit_web_list接口：user_type为1时就传员工部门did，user_type为0就传0，默认传0
      default: 0
    }
  },
  data () {
    return {
      loading: false,
      statusOptions: [
        { dict_label: '未审核', dict_value: 0 },
        { dict_label: '初审通过', dict_value: 1 },
        { dict_label: '未通过', dict_value: 2 },
        { dict_label: '终审通过', dict_value: 3 },
        { dict_label: '未通过', dict_value: 4 }
      ],
      procLists: [],
      deviceList: []
    }
  },
  components: { info },
  mounted() {
    this.getImageList()
    if (this.user_type === 0) {
      this.getDeviceList()
    }
  },
  methods: {
    // 获取详情里面的物料规格
    async getDeviceList(row) {
      this.deviceList = []
      const params = {
        project_code: this.currentRow.project_code,
        point_code: this.currentRow.point_code
      }
      const { code, message, data } = await this.$pub.post('/device/build-reg-info', params)
      if (code !== 200) {
        this.$notify.error({
          title: '物料规格列表查询失败',
          message: message
        })
      } else {
        this.deviceList = data.device_list || []
      }
    },
    // 获取详情里面的工序步骤及其详情
    async getImageList() {
      this.loading = true
      this.procLists = []
      const params = {
        point_code: this.currentRow.point_code,
        project_code: this.currentRow.project_code,
        dept_id: this.user_type === 0 ? 0 : this.did
      }
      const result = await this.$pub.post('/point/proc_submit_web_list', params)
      if (result.code === 200) {
        if (result.data && result.data.length > 0) {
          result.data.some(s => {
            if (s.classCode === this.currentProc.class_code) {
              s.procList = s.procList.filter(f => f.procCode === this.currentProc.proc_code)
              this.procLists.push(s)
              console.log(s)
              return true
            } else {
              console.log(11)
            }
          })
        } else {
          this.procLists = []
        }
      } else {
        this.$notify.error({
          title: '查询失败',
          message: result.message
        })
      }
      try {
      } catch (e) {
        console.log(e)
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.construcDrawer{
  .el-drawer__header{
    margin-bottom:10px;
  }
}
.construcInfo{
  width:100%;
  padding: 0 20px 10px;
  box-sizing:border-box;
}
</style>
