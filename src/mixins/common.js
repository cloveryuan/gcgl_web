import { checkPermission } from '@/utils/tool'
export default {
  data(){
    return {
      projects: [],
      childs: [],
      areas: [],
      BuilderList: [],
      tags: [],
      procs: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
    }
  },
  computed: {
    project_id(){
      return this.form.project ? this.form.project.id : null
    },
    project_code(){
      return this.form.project ? this.form.project.projectCode : null
    },
  },
  created(){
    this.getProjectList()
  },
  methods: {
    checkPermission,
    async getProjectList() {
      try {
        const have = this.checkPermission(['pointAuthorization:project-slt'])
        let url = '/project/project-list-by-user'
        let params = {
          user_id: this.$store.state.userInfo.id
        }

        if (this.ischeckAllproject && have){//ischeckAllproject表示是否需要校验
          url = '/project/list-slt' 
          params = { content: '' } 
        }

        const result = await this.$pub.post(url, params)
        if (result.code === 200) {
          if (result.data !== null) {
            this.projects = (result.data).map(m=>{
              return {
                ...m,
                projectCode: m.projectCode?m.projectCode:m.project_code,
                projectName: m.projectName?m.projectName:m.project_name
              }
            })
          } else {
            this.projects = []
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    async getChildList() {
      if (this.project_id === null) {
        return
      }
      try {
        const { data, code, message } = await this.$pub.post('project/child-list', { project_id: this.project_id })
        if (code === 200) {
          this.childs = data || []
        } else {
          this.childs = []
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    async getAreaList() {
      if (this.project_id === null) {
        return
      }
      try {
        const { data, code, message } = await this.$pub.post('/project/area-list', { project_id: this.project_id })
        if (code === 200) {
          this.areas = data || []
        } else {
          this.areas = []
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    // 获取施工队列表
    async getBuilderList() {
      if (this.project_code === null) {
        return
      }
      const req = {
        project_code: this.project_code
      }
      const result = await this.$pub.post('/rate/builder-dept-list', req)
      if (result.code === 200) {
        if (result.data !== null) {
          this.BuilderList = result.data
        }
      } else {
        this.BuilderList = []
        this.$notify.error({
          title: '施工单位查询失败',
          message: result.message
        })
      }
    },
    async getTagList() {
      if (this.project_code === null) {
        return
      }
      const { data, code, message } = await this.$pub.post('/point/get-tag-list', {
        projectCode: this.project_code
      })
      if (code === 200) {
        this.tags= data || []
      } else {
        this.tags = []
        this.$message({
          type: 'error',
          message: message || '获取标签出错了',
          showClose: true
        })
      }
    },
    // --获取工序列表--
    async getProcList(flag=true) {
      //flag=false就是不需要深化设计施工图这道工序
      if (this.project_code === null) {
        return
      }
      try {
        const params = {
          project_code: this.project_code,
          point_code: ''
        }
        const { code, data, message } = await this.$pub.post('/point/proc/list-design', params)
        if (code === 200) {
          var tmparr = [];
          (data || []).map((item, index) => {
            var childs = []
            childs = this.getprocChildList(item,flag)
            var tmpobj = {
              value: item.classCode,
              label: item.className,
              children: childs
            }
            tmparr.push(tmpobj)
          })
          this.procs = tmparr
        } else {
          this.$notify.error({
            title: '查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    getprocChildList(value,flag) {
      var childs = []
      // 添加具体工序
      if (value.procList !== null && value.procList !== undefined) {
        value.procList.map((citem, cindex) => {
          if(flag){
            childs.push({ value: citem.procCode, label: citem.procName })
          }else{
            if(citem.procCode!=='CLS000-04'){
              childs.push({ value: citem.procCode, label: citem.procName })
            }
          }
        })
      }
      // 添加子分类
      // if (value.classChild !== undefined && value.classChild !== null) {
      //   value.classChild.map((sitem, sindex) => {
      //     var subChilds = []
      //     if (sitem.classChild !== null) {
      //       subChilds = this.getChildList(sitem.classChild)
      //     }
      //     childs.push({
      //       value: sitem.classCode,
      //       label: sitem.className,
      //       children: subChilds
      //     })
      //   })
      // }
      return childs
    }
  }
}