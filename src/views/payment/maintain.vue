<template>
  <div class="wrap">
    <ul class="_left" v-loading="pointLoading">
      <li>
        <el-input v-model="searchWords"  placeholder="请输入" prefix-icon="el-icon-search" style="width:150px;" @blur="searchPoint" @change="searchPoint"></el-input>
      </li>
      <li
        v-for="p in points"
        :key="p.point_code"
        :class="{point:true,isRed:p.status===2,isBlue:p.status===1}"
        @click="clickPoint(p)">
        <span class="shou" v-if="active&&(active.point_code===p.point_code)">
          <i class="el-icon-thumb"></i>
        </span>
        <span v-html="p.point_code_hight"></span>
      </li>
    </ul>
    <div class="_right">
      <el-tree
        class="proc"
        :data="procList"
        v-loading="procLoading"
        node-key="id"
        empty-text="点击点位切换工序"
        @node-click="clickProc">
        <span  slot-scope="{ node,data }" :class="{'custom-tree-node':true,isRed:data.status===2,isBlue:data.status===1}" >
          <!-- :class="{isActive:active&&(data.procCode&&active.procCode===data.procCode)}" -->
          <span class="shou">
            <i class="el-icon-thumb" v-if="active&&(data.procCode&&active.procCode===data.procCode)"></i>
            <span>{{ node.label }}</span>
          </span>
          <span v-if="data.procCode">
            <el-button  size="mini" @click="canclePay(data)">取消</el-button>
            <el-button  size="mini" @click="surePay(data)">付款</el-button>
          </span>
        </span>
      </el-tree>
      <div class="info">
        <div class="info_wrap" v-loading="infoLoading" v-if="procInfo">
          <p><span>点位编码:{{active.point_code}}</span></p>
          <p style="margin-top:10px;"><span>点位名称:{{active.point_name}}</span></p>
          <info
            :deviceList="deviceList"
            :procLists="oneProcLists"
            :statusOptions="statusOptions"
          ></info>
          <!-- 付款记录 -->
          <div class="payment_log">
            <h2>付款记录</h2>
            <el-table
              v-loading="payLoading"
              :data="payList"
              :row-style="{ height: '30px' }"
              :cell-style="{ padding: '0' }"
              highlight-current-row
              border
            >
              <el-table-column label="标题" prop="title" align="center" />
              <el-table-column label="操作人" align="center" prop="user"></el-table-column>
              <el-table-column label="操作时间"  align="center"  prop="time"></el-table-column>
            </el-table>
          </div>
        </div>
        <div v-else class="nodata">
          <el-image
            :src="require(`@/assets/images/null.png`)"
            style="width: 80px;"></el-image>
          <p style="color: grey"> 点击工序切换</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import info from '../rate/components/info.vue'
import config from '../../config/config'
export default {
  name: 'maintain_payment',
  props: {
    current: {
      require: true
    },
    maintainFlag: {
      require: true
    }
  },
  data () {
    return {
      pointLoading: false,
      points: [],
      searchWords: '',
      procLoading: false,
      procList: [],
      active: null,
      procInfo: null,
      allProcs: [], // 全部工序步骤详情
      oneProcLists: [], // 当前选择的一个工序详情
      deviceList: [],
      statusOptions: config.statusOptions,
      infoLoading: false,
      payList: [],
      payLoading: false
    }
  },
  components: { info },
  mounted() {
    this.getPoints()
  },
  methods: {
    async getPoints() {
      this.pointLoading = true
      const params = {
        child_array: [],
        area_array: [],
        status_array: [],
        origin_array: [],
        tag_array: [],
        project_code: this.current.project_code,
        point_cond: '',
        page_no: 1,
        page_size: 10
      }
      const { code, data, message } = await this.$pub.post('/point/manage/list', params)

      this.pointLoading = false
      if (code !== 200) {
        this.points = []
        return this.$message.error(message || '查询出错了')
      } else {
        this.points = (data.list || []).map(m => {
          return {
            ...m,
            point_code_hight: m.point_code
          }
        })
      }
    },
    searchPoint() {
      if (this.searchWords) {
        this.pointLoading = true
        setTimeout(() => {
          this.points.forEach((row, i) => {
            this.isHight(row)
            if (i === this.points.length - 1) {
              this.pointLoading = false
            }
          })
        }, 100)
      } else {
        this.pointLoading = true
        setTimeout(() => {
          this.points.forEach((row, i) => {
            row.point_code_hight = row.point_code
            if (i === this.points.length - 1) {
              this.pointLoading = false
            }
          })
        }, 100)
      }
    },
    isHight(row) {
      let num = -1; const point_code = row.point_code
      num = point_code.toLowerCase().indexOf(this.searchWords.toLowerCase())
      if (num > -1) {
        const searchName = point_code.substr(num, this.searchWords.length)
        const replaceReg = new RegExp(this.searchWords, 'ig')
        const replaceString = '<span class="keyword-lighten">' + searchName + '</span>'
        row.point_code_hight = (point_code || '').replace(replaceReg, replaceString)
        // tempArr.push(row)
      } else {
        row.point_code_hight = row.point_code
      }
    },
    clickPoint(point) {
      this.active = point
      this.active.project_code = this.current.project_code
      this.procInfo = null
      this.payList = []
      this.oneProcLists = []

      this.getIAllProcList()// 全部工序详情
      this.getDeviceList()// 获取物料详情
      this.getProcList()// 当前点位下工序列表
    },
    async getProcList() {
      this.procLoading = true
      this.procList = []
      const { data, code, message } = await this.$pub.post('/proc/device/proc_list_device', { project_code: this.current.project_code, point_code: this.active.point_code })

      if (code !== 200) {
        return this.$message.error(message || '获取工序出错了')
      }
      if (data.length > 0) {
        this.getProc(data)
      }
      this.procLoading = false
    },
    getProc(data) {
      data.map(m => {
        const tmpobj = {
          label: m.className,
          children: this.getChild(m.procList, m.classCode),
          ...m
        }
        this.procList.push(tmpobj)
      })
    },
    getChild(arr, class_code) {
      return (arr || []).map(m => {
        return {
          label: m.procName,
          ...m,
          class_code
        }
      })
    },
    // 获取全部工序步骤详情
    async getIAllProcList() {
      const params = {
        point_code: this.active.point_code,
        project_code: this.active.project_code
      }
      const result = await this.$pub.post('/point/proc_submit_web_list', params)
      if (result.code === 200) {
        if (result.data && result.data.length > 0) {
          this.allProcs = result.data
        } else {
          this.allProcs = []
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
    },
    // 获取详情里面的物料规格
    async getDeviceList() {
      this.deviceList = []
      const params = {
        point_code: this.active.point_code,
        project_code: this.active.project_code
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
    clickProc(item) {
      if (item.procCode && ((!this.active) || (this.active.procCode !== item.procCode))) {
        this.procInfo = null
        this.payList = []
        this.infoLoading = true
        this.oneProcLists = []
        this.active = { ...this.active, ...item }

        // 筛选出选择的工序对应的详情
        this.allProcs.some(s => {
          if (s.classCode === this.active.class_code) {
            const temp = s.procList.find(f => f.procCode === this.active.procCode)
            if (temp) {
              this.oneProcLists.push({
                ...s,
                procList: [temp]
              })
            }
            return true
          }
        })
        this.getPayLog()
        this.$nextTick(() => {
          this.procInfo = {
            proc_code: item.procCode,
            class_code: item.class_code
          }
          // // 去掉上一次选中的行样式
          // if (this.prePar) {
          //   this.prePar.classList.remove('isActive_tree_item')
          // }
          // // 给当前选中的行样式
          // const el = document.querySelector('.isActive')
          // if (el) {
          //   this.prePar = el.parentNode
          //   this.prePar.classList.add('isActive_tree_item')
          // }
          this.infoLoading = false
        })
      }
    },
    async getPayLog() {
      // this.payLoading = true
      // const params = {
      // }
      // const { code, data, message } = await this.$pub.post('', params)

      // this.payLoading = false
      // if (code !== 200) {
      //   this.getPayLog = []
      //   return this.$message.error(message || '查询付款记录出错了')
      // } else {
      //   this.getPayLog = data.list || []
      // }
      console.log(11)
      this.payList = [
        { title: '2021付款1期', user: '张三', time: '2021年10月10日' },
        { title: '2021付款2期', user: '张三', time: '2021年10月12日' },
        { title: '2021付款3期', user: '张三', time: '2021年10月16日' },
        { title: '2021付款4期', user: '张三', time: '2021年10月19日' }
      ]
    },
    canclePay(data) {},
    surePay(data) {}
  }
}
</script>

<style lang="scss">
.payment_maintain{
  .el-drawer__header{
    margin-bottom:20px;
  }
  .el-drawer__body{
    height:calc(100% - 50px);
  }
  .wrap{
    display:flex;
    justify-content: space-between;
    height: 100%;
    padding:0  20px 20px;
    box-sizing: border-box;
  }
  ._left{
    width:150px;
    border:1px solid #DCDFE6;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  ._right{
    width:calc(100% - 150px);
    height:100%;
    display:flex;
    justify-content: space-between;
    .proc{
      width: 340px;
      height: 100%;
      border: 1px solid #DCDFE6;
      overflow: auto;
      font-size: 16px;
      color: #000;
      margin: 0 20px;
      .el-tree-node__content{
        height: 36px;
      }
      .isActive_tree_item {
        color: #fff;
        background-color: #409eff!important;
      }
    }
    .info{
      width: calc(100% - 360px);
      height: 100%;
      border: 1px solid #DCDFE6;
      overflow: auto;
      font-size: 16px;
      color: #000;
    }
  }
  ._left{
    .el-input__inner{
      border-left:0;
      border-right:0;
      border-top:0;
    }
    .point{
      line-height:50px;
      border-bottom:1px solid #DCDFE6;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      padding-left:10px;
      cursor: pointer;
      &:hover{
        background: #F5F7FA;
      }
    }
    .keyword-lighten {
      color: #000;
      background-color: #ff0;
    }
    .ispointActive{
      color: #fff;
      background-color: #409eff!important;
    }
  }
  ._right{
    .info{
      position: relative;
      padding: 10px;
      box-sizing: border-box;
      .payment_log{
        margin-top:20px;
        h2{
          padding-bottom:4px;
          // border-bottom:2px solid #000;
          // margin-bottom:10px;
          font-size: 16px;
          color: #409eff;
        }
      }
    }
    .nodata{
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      color: #909399;
      font-size: 14px;
    }
  }
  // 滚动条一致
  ._left::-webkit-scrollbar, .info::-webkit-scrollbar {
    width: 2px;
    height: 2px;
  }
  ._left::-webkit-scrollbar-thumb, .info::-webkit-scrollbar-thumb {
    border-radius: 4px;
    box-shadow: inset 0 0 5px rgba(112, 110, 110, 0.2);
    background: rgba(144, 147, 153, 0.3);
  }
  ._left::-webkit-scrollbar-track, .info::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(235, 225, 225, 0.8);
    border-radius: 10px;
    background: #f7f5f5;
  }
  .shou{
    i{
      transform: rotate(90deg);
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
  }
  .isRed{
    color:#D9001B;
  }
  .isBlue{
    color:#02A7F1;
  }
}
</style>
