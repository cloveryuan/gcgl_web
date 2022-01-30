<template>
  <div class="wrap">
    <ul class="_left" v-loading="pointLoading">
      <!-- <li>
        <el-button type="primary" icon="el-icon-plus" @click="addPoint">新增付款记录点位</el-button>
      </li> -->
      <li>
        <el-input v-model="searchWords"  placeholder="请输入" prefix-icon="el-icon-search" style="width:150px;" @blur="searchPoint" @change="searchPoint"></el-input>
      </li>
      <li
        v-for="p in points"
        :key="p.pay_point_code"
        :class="{point:true,isRed:p.type===2,isBlue:p.type===1,isActive_tree_item:active&&(p.pay_point_code&&active.pay_point_code===p.pay_point_code)}"
        @click="clickPoint(p)">
        <div class="item">
          <span v-html="p.pay_point_code_hight"></span>
          <span class="del" @click.stop="delPoint(p)">
            <i class="el-icon-delete"></i>
          </span>
        </div>
      </li>
    </ul>
    <div class="_right">
      <el-tree
        class="proc"
        :data="procList"
        v-loading="procLoading"
        node-key="id"
        empty-text="点击点位切换工序"
        :default-expanded-keys="defaultShowNodes"
        @node-click="clickProc"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse">
        <span  slot-scope="{ node,data }" :class="{'custom-tree-node':true,isRed:data.type===2,isBlue:data.type===1,isActive:active&&(data.procCode&&active.procCode===data.procCode)}" >
          <span>{{ node.label }}</span>
          <span v-if="data.procCode">
            <el-button  size="mini" @click.stop="canclePay(data)" v-if="data.type===1">取消</el-button>
            <el-button  size="mini" @click.stop="surePay(data)" v-if="data.type===2 || data.type===0">付款</el-button>
          </span>
        </span>
      </el-tree>
      <div class="info">
        <div class="info_wrap" v-loading="infoLoading" v-if="active">
          <p style="font-weight: 700;font-size:18px;"><span>点位编码:{{active.pay_point_code}}</span></p>
          <p style="font-weight: 700;font-size:18px;margin:10px 0 15px 0;"><span>点位名称:{{active.pay_point_name}}</span></p>
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
              <el-table-column prop="pay_title" label="标题"  :show-overflow-tooltip="true" align="center"></el-table-column>
              <el-table-column prop="create_user" label="操作人" width="90" :show-overflow-tooltip="true" align="center"></el-table-column>
              <el-table-column prop="create_time" label="操作时间"  :show-overflow-tooltip="true" align="center">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.create_time) }}</span>
                </template>
              </el-table-column>
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
import { parseTime } from '@/utils/tool'
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
      defaultShowNodes: [], // 这里存放要默认展开的节点 id
      active: null,
      allProcs: [], // 全部工序步骤详情
      oneProcLists: [], // 当前选择的一个工序详情
      deviceList: [],
      statusOptions: config.statusOptions,
      infoLoading: false,
      payList: [],
      payLoading: false,
      prePar: null
    }
  },
  components: { info },
  mounted() {
    this.getPoints()
  },
  methods: {
    parseTime,
    async getPoints() {
      this.pointLoading = true
      const { code, data, message } = await this.$pub.post('project/pay/point-list', { id: this.current.id })

      this.pointLoading = false
      if (code !== 200) {
        this.points = []
        return this.$message.error(message || '查询出错了')
      } else {
        this.points = (data.list || []).map(m => {
          return {
            ...m,
            pay_point_code_hight: m.pay_point_code
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
            row.pay_point_code_hight = row.pay_point_code
            if (i === this.points.length - 1) {
              this.pointLoading = false
            }
          })
        }, 100)
      }
    },
    isHight(row) {
      let num = -1; const pay_point_code = row.pay_point_code
      num = pay_point_code.toLowerCase().indexOf(this.searchWords.toLowerCase())
      if (num > -1) {
        const searchName = pay_point_code.substr(num, this.searchWords.length)
        const replaceReg = new RegExp(this.searchWords, 'ig')
        const replaceString = '<span class="keyword-lighten">' + searchName + '</span>'
        row.pay_point_code_hight = (pay_point_code || '').replace(replaceReg, replaceString)
        // tempArr.push(row)
      } else {
        row.pay_point_code_hight = row.pay_point_code
      }
    },
    clickPoint(point) {
      this.active = point
      this.oneProcLists = []
      this.defaultShowNodes = []

      this.getIAllProcList()// 全部工序详情
      this.getDeviceList()// 获取物料详情
      this.getProcList()// 当前点位下工序列表
    },
    async getProcList() {
      this.payList = []
      this.procLoading = true
      this.procList = []
      const { data, code, message } = await this.$pub.post('project/pay/proc-detail', { pay_id: this.current.id, pay_point_code: this.active.pay_point_code })

      if (code !== 200) {
        return this.$message.error(message || '获取工序出错了')
      }
      if (data.list && data.list.length > 0) {
        this.getProc(data.list)
      }
      this.procLoading = false
    },
    getProc(data) {
      data.map((m, i) => {
        const tmpobj = {
          label: m.className,
          children: this.getChild(m.procList, m.classCode),
          ...m
        }
        this.procList.push(tmpobj)
        if (i === data.length - 1) {
          this.clickProc(this.active)
        }
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
        point_code: this.active.pay_point_code,
        project_code: this.current.pay_project_code
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
        point_code: this.active.pay_point_code,
        project_code: this.current.pay_project_code
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
    // 树节点展开
    handleNodeExpand (data) {
      // 保存当前展开的节点
      let flag = false
      this.defaultShowNodes.some(item => {
        if (item === data.id) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultShowNodes.push(data.id)
      }
    },
    // 树节点关闭
    handleNodeCollapse (data) {
      this.defaultShowNodes.some((item, i) => {
        if (item === data.id) {
          // 删除关闭节点
          this.defaultShowNodes.splice(i, 1)
        }
      })
      this.removeChildrenIds(data) // 这里主要针对多级树状结构，当关闭父节点时，递归删除父节点下的所有子节点
    },
    // 删除树子节点
    removeChildrenIds(data) {
      if (data.children) {
        data.children.forEach((item) => {
          const index = this.defaultShowNodes.indexOf(item.id)
          if (index > 0) {
            this.defaultShowNodes.splice(index, 1)
          }
          this.removeChildrenIds(item)
        })
      }
    },
    clickProc(item) {
      if (item.procCode) {
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
          // 去掉上一次选中的行样式
          if (this.prePar) {
            this.prePar.classList.remove('isActive_tree_item')
          }
          // 给当前选中的行样式
          const el = document.querySelector('.isActive')
          if (el) {
            this.prePar = el.parentNode
            this.prePar.classList.add('isActive_tree_item')
          }
          this.infoLoading = false
        })
      }
    },
    async getPayLog() {
      this.payLoading = true
      const params = {
        keyword: '',
        pay_project_code: this.current.pay_project_code,
        begin_time: '',
        end_time: '',
        pay_ids: this.active.pay_id ? this.active.pay_id : '-1'
      }
      const { code, data, message } = await this.$pub.post('project/pay/list', params)

      this.payLoading = false
      if (code !== 200) {
        this.payList = []
        return this.$message.error(message || '查询付款记录出错了')
      } else {
        this.payList = data.list || []
      }
    },
    // 点位上面操作
    addPoint() {
      // project/pay/add-point
    },
    delPoint(row) {
      const pay_id = row.id
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code, message } = await this.$pub.post('project/pay/del-point', { pay_id })
        if (code === 200) {
          this.getPoints()
          this.$message({
            type: 'success',
            message: message || '删除成功',
            showClose: true
          })
        } else {
          this.$message({
            type: 'error',
            message: message || '删除失败',
            showClose: true
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          showClose: true
        })
      })
    },
    // 工序上面操作
    canclePay(row) {
      const params = {
        pay_id: this.current.id,
        pay_point_code: this.active.pay_point_code,
        proc_code: row.procCode
      }
      this.$confirm('确定取消当前工序的付款记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.procLoading = true
        const { code, message } = await this.$pub.post('project/pay/del-detail', params)
        if (code === 200) {
          this.$message({
            type: 'success',
            message: message || '取消付款成功',
            showClose: true
          })
          this.getPoints()
          this.getProcList()// 当前点位下工序列表
        } else {
          this.$message({
            type: 'error',
            message: message || '取消付款失败',
            showClose: true
          })
        }
        this.procLoading = false
      }).catch(() => {
        this.procLoading = false
        // this.$message({
        //   type: 'info',
        //   message: '已取消付款',
        //   showClose: true
        // })
      })
    },
    async surePay(row) {
      this.procLoading = true
      const params = {
        pay_id: this.current.id,
        pay_point_code: this.active.pay_point_code,
        proc_code: row.procCode
      }
      const { code, message } = await this.$pub.post('project/pay/add-detail', params)

      if (code !== 200) {
        return this.$message.error(message || '工序添加付款记录失败')
      }
      this.getPoints()
      this.getProcList()// 当前点位下工序列表
      this.procLoading = false
    }
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
    .isActive_tree_item {
      background-color:#F5F7FA!important;
    }
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
        background-color:#F5F7FA!important;
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
    .el-button{
      width:100%;
      padding: 12px 0;
    }
    .el-input__inner{
      border-left:0;
      border-right:0;
      border-top:0;
    }
    .point{
      .item{
        position: relative;
      }
      line-height:50px;
      border-bottom:1px solid #DCDFE6;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      padding-left:20px;
      cursor: pointer;
      &:hover{
        background: #F5F7FA;
      }
      .del{
        position: absolute;
        top: -20px;
        right: -20px;
        line-height: 0px;
        width: 40px;
        height:40px;
        border-radius: 50%;
        background: #409eff;
        font-size:12px;
        .el-icon-delete{
          position:absolute;
          top: 22px;
          right: 22px;
          color:#fff;
        }
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
    font-weight: 700;
  }
  .isBlue{
    color:#02A7F1;
    font-weight: 700;
  }
}
</style>
