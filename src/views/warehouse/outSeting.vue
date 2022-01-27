<!-- 出库管理 -->
<template>
  <div class="out_stock">
    <outstock
      :orderType="2"
      :statusList="statusList"
    ></outstock>
  </div>
</template>

<script>
import outstock from './components/orderSeting.vue'
export default {
  name: 'warehouseout',
  data () {
    return {
      statusList: [
        { status: '1', status_name: '待出库' }, { status: '2', status_name: '已出库' }, { status: '3', status_name: '已作废' }
      ]
    }
  },
  components: {
    outstock
  },
  methods: {

  }
}
</script>

<style scoped lang="scss">
</style>
