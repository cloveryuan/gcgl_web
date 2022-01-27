<template>
  <div class="lnglatclick">
    <gd-map ref="gdMap" :positions="positions" :_height="height"></gd-map>
    <el-table :data="tableData" size="mini" v-loading="loading">
      <el-table-column prop="title" label=""></el-table-column>
      <el-table-column prop="lng_lat" label="关键工序拍照经纬度" min-width="140"></el-table-column>
      <el-table-column prop="distance" label="距原位置距离" min-width="120">
         <template slot-scope="scope">
          <span :style="{color: scope.row.distance>=500?'#D9001B':''}">{{scope.row.distance>=500?(scope.row.distance/1000)+'公里' : scope.row.distance + '米'}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="distance_next" label="距下一工序拍照位置距离" min-width="160">
         <template slot-scope="scope">
          <span :style="{color: scope.row.distance>=500?'#D9001B':''}">{{scope.row.distance_next>=500?(scope.row.distance_next/1000)+'公里' : scope.row.distance_next + '米'}}</span>
        </template>
      </el-table-column>
      <el-table-column  label="">
        <template slot-scope="scope">
          <el-popconfirm
            title="请确认是否更新点位坐标"
            @confirm="formatPoint(scope.row)"
          >
            <el-button slot="reference" v-hasPermi="['points:checkPoint']" type="text" >校验点位</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import GdMap from './map'

export default {
  name: 'lnglat_index',
  props: {
    pointInfo: {
      required: true
    },
    project_code: {
      required: true
    }
  },
  data () {
    return {
      tableData: [],
      height: '300px',
      loading: false
    }
  },
  computed: {
    positions() {
      return this.pointInfo ? this.pointInfo.lng_lat : ''
    }
  },
  components: {
    GdMap
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code,
        point_id: Number(this.pointInfo.point_id)
      }
      this.loading = true
      // const params = {
      //  "project_code": "DFCG20180329",
      //   "point_code": "FX-HK-003",
      //   "point_id": 1
      // }
      this.tableData = []
      const { data, code, message } = await this.$pub.post('/point/manage/photo-coor', params)
      this.loading = false
      if (code !== 200) {
        return this.$message.error(message || '获取列表出错了')
      } else {
        const tempArr = []
        for (const i in data) {
          const item = data[i]
          // const obj = Object.assign({
          //   title: i==='install_coor'?'安装完成':i==='pole_coor'?'立杆完成':i==='water_coor'?'开挖浇筑完成':'',
          //   lng_lat:item.lng + ',' +item.lat
          // },item);
          if (i === 'install_coor') {
            tempArr[3] = {
              title: '设备安装完成',
              lng_lat: item.lng + ',' + item.lat,
              lng: item.lng,
              lat: item.lat,
              distance: item.distance,
              distance_next: item.distance_next
            }
          } else if (i === 'pole_coor') {
            tempArr[2] = {
              title: '立杆完成',
              lng_lat: item.lng + ',' + item.lat,
              lng: item.lng,
              lat: item.lat,
              distance: item.distance,
              distance_next: item.distance_next
            }
          } else if (i === 'water_coor') {
            tempArr[1] = {
              title: '开挖浇筑完成',
              lng_lat: item.lng + ',' + item.lat,
              lng: item.lng,
              lat: item.lat,
              distance: item.distance,
              distance_next: item.distance_next
            }
          } else if (i === 'survey_coor') {
            tempArr[0] = {
              title: '现场勘测',
              lng_lat: item.lng + ',' + item.lat,
              lng: item.lng,
              lat: item.lat,
              distance: item.distance,
              distance_next: item.distance_next
            }
          }
        }
        this.tableData = tempArr
      }
    },
    async formatPoint(row) {
      this.loading = true
      const params = {
        project_code: this.project_code,
        point_code: this.pointInfo.point_code,
        point_id: Number(this.pointInfo.point_id),
        lng: row.lng + '',
        lat: row.lat + ''
      }
      const { code } = await this.$pub.post('/point/manage/coor-edit', params)
      if (code === 200) {
        this.$message.success('校验成功')
        this.getData()
      } else {
        this.$message.error('校验失败')
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.lnglatclick{
  width:100%;
}
</style>
