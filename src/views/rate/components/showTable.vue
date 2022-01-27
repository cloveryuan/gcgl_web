<template>
  <div class="containerTable">
    <div class="logShow">
      <h2>项目日志({{ selectDictLabel(logList, logType) }})</h2>
      <div class="contable">
        <div>
          <span class="width150">项目名称</span>
          <span class="flex1">{{
            showTableDetails.project_name
              ? showTableDetails.project_name
              : '暂无数据'
          }}</span>
          <span class="width150">天气</span>
          <span class="flex1">{{
            showTableDetails.weather ? showTableDetails.weather : '暂无数据'
          }}</span>
        </div>
        <div>
          <span class="width150">日志周期</span>
          <span class="flex1"
            >{{
              showTableDetails.begin_date
                ? showTableDetails.begin_date
                : '暂无数据'
            }}
            至
            {{
              showTableDetails.end_date ? showTableDetails.end_date : '暂无数据'
            }}</span
          >
          <span class="width150">创建人</span>
          <span class="flex1">{{ $store.state.userInfo.userName }}</span>
        </div>
        <div>
          <span class="width150">项目状态</span>
          <span class="flex1">{{
            showTableDetails.project_status
              ? showTableDetails.project_status
              : '暂无数据'
          }}</span>
          <span class="width150">生成日期</span>
          <span class="flex1">{{ ftime(new Date().getTime()) }}</span>
        </div>
        <div>
          <span class="flex1">工序名称</span>
          <span class="jz flex1"
            >{{ selectDictLabel(wcName, logType) }}完成任务数</span
          >
          <span class="jz flex1">项目总任务数</span>
          <span class="jz flex1">累计完成任务数</span>
          <span class="jz flex1">完成比例</span>
        </div>
        <template v-if="showTableDetails.procs">
          <div v-for="(item, index) of showTableDetails.procs" :key="index+item.proc_name">
            <span class="flex1">
              {{ item.proc_name.substring(0, 4) }}
            </span>
            <span class="jz flex1">
              {{ item.point_nums }}
            </span>
            <span class="jz flex1">
              {{ item.total_nums }}
            </span>
            <span class="jz flex1">
              {{ item.acc_finish_nums }}
            </span>
            <span class="jz flex1">
              {{ (item.ratio * 100).toFixed(2) + '%' }}
            </span>
          </div>
        </template>
        <template v-else>
          <div>
            <span class="jz flex1">
              暂无数据
            </span>
          </div>
        </template>
        <div>
          <span class="jz flex1">主要物料清单</span>
        </div>
        <div>
          <span class="flex1">物料名称</span>
          <span class="jz width150">合同数</span>
          <span class="jz width150">到货数</span>
          <span class="jz width150">出货数</span>
          <span class="jz width150">安装(已审)数</span>
        </div>
        <template v-if="showTableDetails.devices">
          <div v-for="(i, ix) of showTableDetails.devices" :key="ix+i.device_name">
            <span class="flex1">{{ i.device_name }}</span>
            <span class="jz width150">{{ i.contract_nums }}</span>
            <span class="jz width150">{{ i.in_nums }}</span>
            <span class="jz width150">{{ i.out_nums }}</span>
            <span class="jz width150">{{ i.audit_nums }}</span>
          </div>
        </template>
        <template v-else>
          <div>
            <span class="jz flex1">
              暂无数据
            </span>
          </div>
        </template>
      </div>
    </div>
    <div style="margin-left: 15px;padding:0 20px;flex: 1;">
      <el-form
        style="margin-top: 70px;"
        ref="addDetails"
        label-position="left"
        :model="addDetails"
        :rules="addDetailsRules"
        size="small"
        label-width="140px"
      >
        <el-form-item label="其他施工内容" prop="other_task">
          <el-input
            type="textarea"
            style="width: 90%"
            v-model="addDetails.other_task"
          ></el-input>
        </el-form-item>
        <el-form-item label="存在的问题" prop="question">
          <el-input
            type="textarea"
            style="width: 90%"
            v-model="addDetails.question"
          ></el-input>
        </el-form-item>
        <el-form-item label="需协调解决的问题" prop="solve">
          <el-input
            type="textarea"
            style="width: 90%"
            v-model="addDetails.solve"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        size="mini"
        style="float: left;margin-top: 8px;"
        @click="addLogDetails"
        v-loading="tjLoading"
        >生成项目日志</el-button
      >
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  props: ['showTableDetails', 'logType', 'logList'],
  data() {
    return {
      addDetails: {
        other_task: '',
        question: '',
        solve: ''
      },
      addDetailsRules: {},
      tjLoading: false,
      wcName: [
        { logCode: 1, logName: '当日' },
        { logCode: 2, logName: '最近一周' },
        { logCode: 3, logName: '最近一个月' },
        { logCode: 4, logName: '自定义时间' }
      ]
    }
  },
  created() {
    console.log(this.showTableDetails)
  },
  methods: {
    async addLogDetails() {
      try {
        await this.$refs.addDetails.validate()
        this.tjLoading = await true
        const params = {
          project_code: this.showTableDetails.project_code,
          project_name: this.showTableDetails.project_name,
          weather: this.showTableDetails.weather,
          begin_date: this.showTableDetails.begin_date,
          end_date: this.showTableDetails.end_date,
          log_type: this.logType,
          user_id: this.$store.state.userInfo.id,
          user_name: this.$store.state.userInfo.userName,
          other_task: this.addDetails.other_task,
          question: this.addDetails.question,
          solve: this.addDetails.solve
        }
        const result = await this.$pub.post('/log/submit-log', params)
        if (result.code === 200) {
          this.tjLoading = false
          this.$message.success('新建成功')
          this.$refs.addDetails.resetFields()
          this.$emit('fatherMethod')
        } else {
          this.tjLoading = false
          this.$message.error('新建失败')
          this.$refs.addDetails.resetFields()
          this.$emit('fatherMethod')
        }
      } catch (error) {
        console.log(error)
      }
    },
    ftime(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    selectDictLabel(datas, value) {
      const actions = []
      Object.keys(datas).map(key => {
        if (datas[key].logCode === value) {
          actions.push(datas[key].logName)
          return false
        }
      })
      return actions.join('')
    }
  }
}
</script>

<style scoped>
.logShow {
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 0px 30px;
  border-right: 1px solid #000;
}
.logTable {
  margin-top: 20px;
  padding: 0 40px 0 0;
  border-right: solid 1px #ccc;
  height: 610px;
  overflow: auto;
}
.containerTable {
  display: flex;
  padding: 0 20px;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.el-drawer__body {
  overflow: auto;
}
.contable {
  width: 100%;
  margin-top: 20px;
  border: 1px solid #000;
  overflow: auto;
}
.contable > div {
  width: 100%;
  display: flex;
}
.contable > div > span {
  /* flex: 1; */
  border-top: 1px solid #000;
  border-left: 1px solid #000;
  padding: 0px 5px;
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}
.contable > div:first-child > span {
  border-top: none;
}
.contable > div > span:first-child {
  border-left: none;
}
span.jz {
  justify-content: center;
}
.width150 {
  width: 100px;
}
.flex1 {
  flex: 1;
}
</style>
