<template>
  <div v-loading="loading" class="project_info_all">
    <div
      class="box-area"
      v-for="(area, i) in projectList"
      :key="'area' + i"
    >
      <div class="header">
        <span class="line"></span>
        <span class="text">{{ area.city_name }}</span>
      </div>
      <el-row class="project_list" :gutter="20">
        <el-col
          v-for="project in area.project_list"
          :key="project.project_id"
          :xs="24"
          :sm="24"
          :md="12"
          :lg="8"
          :xl="6"
        >
          <div
            :class="{
              item: true,
              isActive: current && project.project_id === current.project_id,
            }"
            @click="clickProject(project)"
          >
            <span>{{ project.project_name }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详情 -->
    <el-drawer :title="projectTit" :visible.sync="flag" :size="1200">
      <info v-if="flag" :project="current"></info>
    </el-drawer>
  </div>
</template>

<script>
import info from './info.vue'
export default {
  name: 'projectStatistics_today',
  data() {
    return {
      loading: false,
      projectList: [],
      current: null,
      projectTit: '',
      flag: false
    }
  },
  components: {
    info
  },
  created() {
    this.getProject()
  },
  methods: {
    async getProject() {
      this.loading = true
      const { data, code } = await this.$pub.post('rate/project_survey_list')
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取项目列表出错了',
          showClose: true

        })
      }
      this.projectList = data.project_list || []
      this.loading = false
    },
    clickProject(project) {
      this.current = project
      this.projectTit = project.project_name
      this.flag = true
    }
  }
}
</script>

<style lang="scss">
.project_info_all {
  width:100%;
  .box-area {
    margin-bottom: 20px;
    .header{
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      .text{
        font-size:18px;
        font-weight: 550;
      }
      .line{
        display: inline-block;
        width: 4px;
        height:18px;
        background:#4DD2D2;
        vertical-align: middle;
        margin-right:8px;
      }

    }
    .project_list {
      .el-col {
        .item {
          height: 50px;
          line-height: 50px;
          text-align: center;
          border: 1px solid #ccc;
          box-shadow: 0 0px 1px #23b7bd;
          margin-bottom: 20px;
          cursor: pointer;
          display: inline-block;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          width:100%;
          padding:0 20px;
          box-sizing: border-box;
          &:hover {
            box-shadow: 0 0px 4px #23b7bd;
          }
        }
        .isActive {
          box-shadow: 0 0px 4px #23b7bd;
        }
      }
    }
  }
  .el-drawer__body{
    height:calc(100% - 110px);
    padding: 0 20px;
    box-sizing: border-box;
  }
  .el-drawer__header{
    &>span{
      color:#000;
      font-weight:550;
    }
  }
}
</style>
