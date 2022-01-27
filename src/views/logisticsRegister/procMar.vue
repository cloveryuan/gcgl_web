<template>
  <div class="wrap">
    <div class="module">
      <div>
        <span class="line"></span>
        <span>配置物料</span>
      </div>
      <el-select
        v-model="selected"
        style="width:100%"
        value-key="device_id"
        multiple
        placeholder="请选择物料进行配置">
        <el-option
          v-for="item in materList"
          :key="item.device_id"
          :label="item.device_name"
          :value="item">
          <span style="float: left">{{ item.device_name }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.device_model }}</span>
        </el-option>
      </el-select>
    </div>
    <div class="module">
      <div>
        <span class="line"></span>
        <span>已配置物料</span>
      </div>
      <el-table
        class="device"
        height="500"
        :data="selected"
        :row-style="{ height: '30px' }"
        :cell-style="{ padding: '0' }"
        highlight-current-row
        empty-text="暂无配置物料"
      >
        <el-table-column label="物料规格" prop="device_name"  show-overflow-tooltip></el-table-column>
        <el-table-column label="规格型号" prop="device_model"  show-overflow-tooltip></el-table-column>
        <el-table-column label="设计数量" prop="design_ct"  width="120"  align="center"  />
        <el-table-column label="已安装数量" prop="ex_nums"  width="120"  align="center"  />
        <el-table-column  label="安装数量" prop="ex_ct"  width="120"  align="center" >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.ex_ct"
              @blur="valiAnzhuangNum(scope.row,scope.$index)"
            ></el-input>
            <span v-if="scope.row.error" style="color:#f40;">{{scope.row.error}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="btn">
      <el-button size="mini" type="primary" @click="submit" v-loading="submitLoading">确 定</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'procMar',
  props: {
    settingMaterFlag: {
      required: true
    },
    current: {
      required: true
    },
    point_code: {
      required: true
    },
    project_code: {
      required: true
    }
  },
  data () {
    return {
      materList: [],
      selected: [],
      deepSelect: [], // 初始化保留备份，保存的时候要取出被删除的一起保存
      submitLoading: false
    }
  },
  created() {
    this.getMaterList()
  },
  methods: {
    async getMaterList() {
      const params = {
        project_code: this.project_code,
        point_code: this.point_code,
        attach_id: this.current.image_id,
        proc_code: this.current.proc_code
      }
      const { data, code } = await this.$pub.post('/proc/device/attach_device_list', params)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '接口获取列表失败',
          showClose: true
        })
      } else {
        this.materList = (data.list || []).map(m => {
          return {
            ...m,
            ex_nums: m.install_ct,
            ex_ct: m.ct
          }
        })
        this.selected = this.materList.filter(f => f.ex_ct > 0)
        this.deepSelect = JSON.parse(JSON.stringify(this.selected))
      }
    },
    valiAnzhuangNum(val, i) {
      const reg = /[^\d]/g
      const design_ct = Number(val.design_ct)// 设计数量
      const ex_ct = Number(val.ex_ct)// 安装数量
      const ex_nums = Number(val.install_ct) + ex_ct - val.ct// 界面展示已完成安装数量
      if (reg.test(ex_ct)) {
        val.error = '安装数量必须数字'
      } else if (ex_nums > design_ct) {
        val.error = '全部安装数量不能大于设计数量'
      } else {
        val.error = ''
        val.ex_nums = ex_nums
      }
      this.$set(this.selected, i, val)
    },
    cancel() {
      this.$emit('update:settingMaterFlag', false)
    },
    async submit() {
      this.submitLoading = true
      let flag = true
      this.selected.some(s => {
        if (s.error) {
          flag = false
          return true
        }
      })
      if (!flag) {
        this.submitLoading = false
        return this.$message({
          type: 'error',
          message: '当前物料表有错，请修改后再保存',
          showClose: true,
          customClass: 'uploadMessage'
        })
      }
      const _list = this.selected.map(m => {
        return {
          count: Number(m.ex_ct),
          install_count: Number(m.ex_nums),
          project_code: this.project_code,
          device_id: m.device_id,
          proc_code: m.proc_code,
          point_code: this.point_code,
          attach_id: m.attach_id
        }
      })

      const selectId = this.selected.map(m => m.device_id)
      this.deepSelect.forEach(f => {
        if (!selectId.includes(f.device_id)) {
          _list.push({
            count: 0,
            install_count: f.install_ct - f.ct,
            project_code: this.project_code,
            device_id: f.device_id,
            proc_code: f.proc_code,
            point_code: this.point_code,
            attach_id: f.attach_id
          })
        }
      })
      const { code } = await this.$pub.post('/proc/device/add_project_proc_device_reg', _list)
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: '接口保存失败',
          showClose: true,
          customClass: 'uploadMessage'
        })
        this.submitLoading = false
      } else {
        this.$emit('getRightDeviceList')
        this.cancel()
      }
    }
  }
}
</script>

<style lang="scss">
.proc-mac-setting{
  .el-dialog__header{
    padding: 10px;
  }
  .wrap{
    position:relative;
    .btn{
      position: absolute;
      top:0px;
      right:0px;
      .el-button+.el-button {
        margin-left: 0px;
      }
      .el-button{
        // border-bottom:none;
      }
    }
  }
  .module{
    .line{
      display: inline-block;
      width: 3px;
      height:14px;
      background:#4DD2D2;
      vertical-align: middle;
      margin-right:4px;
    }
    span{
      vertical-align: middle;
    }
    .el-select{
      margin: 20px 0 30px 0;
    }
  }
}

</style>
