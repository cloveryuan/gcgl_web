<!-- 入库管理 -->
<template>
  <div class="in_stock">
    <instock
      :orderType="1"
      :statusList="statusList"
    ></instock>
  </div>
</template>

<script>
import instock from './components/orderSeting.vue'
export default {
  name: 'warehouseIn',
  data () {
    return {
      statusList: [
        { status: '1', status_name: '待入库' }, { status: '2', status_name: '已入库' }, { status: '3', status_name: '已作废' }, { status: '4', status_name: '已归档' }
      ]
    }
  },
  components: {
    instock
  },
  methods: {

  }
}
</script>

<style scoped lang="scss">
</style>
