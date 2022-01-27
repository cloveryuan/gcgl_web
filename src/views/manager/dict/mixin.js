export default {
  data(){
    return {
      type:1,//1是字典，2是字典项
      total: 0,
      page: {
        page_no: 1,
        page_size: 10
      },
      tableData:[],
      dialog: false,
      isAdd: false,
      submitloading: false,
      loading: false,
      delLoading: false
    }
  },
  methods:{
    async getList() {
      this.loading = true
      const url = this.type===1?'sys/dict/list':'sys/dict/detail/list'//1是字典，2是字典项
      const params = Object.assign(
        this.page,
        this.type===1?{
        content:this.query
      }:{
        dict_id: this.currentDict.id
      })
      const { code, data, message } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message.error(message || '查询列表失败')
      }
      this.tableData = data.list || []
      this.total = data.total || 0
      this.loading = false
    },
    handleQuery() {
      this.page.page_no = 1
      this.getList()
    },
    pageChange(num) {
      this.page.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.page.page_size = val
      this.getList()
    },
    showAddFormDialog() {
      this.form = this.type===1?{
        name: '',
        remark: '',
        label: '',//字典标签
        id: null, 
      }:{
        id: null, 
        label: null, //字典项
        value: null, 
        sort: 999
      }
      this.dialog = true
      this.isAdd = true
    },
    showEditFormDialog(data) {
      this.isAdd = false
      if (data) {
        this.form = JSON.parse(JSON.stringify(data))
        if(this.type===2) this.form.sort = data.sort
      }
      this.dialog = true
    },
    async delMethod(id) {
      this.delLoading = true
      const url = this.type===1?'sys/dict/del':'sys/dict/detail/del'
      const params = this.type===1?{id}:{ids:id}
      const { code, data, message } = await this.$pub.post(url, params)
      if (code !== 200) {
        return this.$message.error(message || '删除失败')
        this.delLoading = false
      } else {
        this.delLoading = false
        if(this.type===1){
          this.$refs.dictDetail.tableData = []
        }
        this.handleQuery()
      }
      this.$refs[id].doClose()
    },
    cancel() {
      this.dialog = false
    },
    getFormTitle() {
      return this.isAdd ? `新增${this.title}` : `编辑${this.title}`
    },
    submitMethod() {
      if (this.$refs.form) {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            this.submitloading = true
            const url = this.isAdd ? 
            (this.type===1?'sys/dict/add' : 'sys/dict/detail/add')://新增
            (this.type===1?'sys/dict/edit' : 'sys/dict/detail/edit')//编辑
            const params = this.type===1?{
              id:this.form.id,
              name: this.form.name,
              label: this.form.label,
              remark: this.form.remark, 
            }:{
              dict_id: this.currentDict.id,
              id:this.form.id,
              label: this.form.label,
              value: this.form.value,
              sort: this.form.sort,
              dict_label: this.currentDict.label,
            }
            const msg =  this.isAdd ?'新增':'编辑'
            const { data,code } = await this.$pub.post(url, params)
            if(code===200){
              this.cancel()
              this.handleQuery()
              this.$message.success(msg+'成功')
            }else{
              this.$message.error(msg+'失败')
            }
            this.submitloading = false
           
          }
        })
      }
    }
  }
}