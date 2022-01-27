<template>
  <div class="base_info">
    <h2 class="subtitle" v-if="user_type === 0">物料清单</h2>
    <el-table
      class="deviceTable"
      :data="deviceList"
      :row-style="{ height: '30px' }"
      :cell-style="{ padding: '0' }"
      highlight-current-row
      border
      v-if="user_type === 0"
    >
      <el-table-column label="物料规格" prop="deviceName" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{scope.row.deviceName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="单位" prop="unit" align="center" width="50"  />
      <el-table-column label="设计数量" align="center" prop="regNums" width="80"></el-table-column>
       <el-table-column label="安装数量"  align="center"  prop="finishNums" width="80"></el-table-column>
    </el-table>
    <div class="btns">
      <el-button type="primary" v-hasPermi="['rate:photo_archive']" @click="photoFile" size="mini" v-if="showPhotoBtn">归档</el-button>
    </div>
    <div v-for="procmain in procLists" :key="procmain.classCode" style="margin-top:10px;">
      <h4>{{procmain.className}}</h4>
      <div class="proc-item" v-for="(procitem,i) in procmain.procList" :key="procitem.procCode + i">
        <span class="subtitle">
          <i class="el-icon-camera"></i>
          {{ procitem.procName }}
        </span>
        <div v-for="(pointDirect,i) in procitem.pointList" :key="pointDirect.direction?pointDirect.direction + i + 'point' : i+'point'">
          <template v-if="pointDirect.direction">
            <span>方向：</span>
            <span>{{pointDirect.direction}}</span>
          </template>
          <div class="container" style="margin-top:10px;" v-viewer="options">
            <div class="block" v-for="imageitem in pointDirect.attachmentList" :key="imageitem.id">
              <el-tooltip effect="dark" :content="imageitem.remark" placement="top-start" v-if="imageitem.remark">
                <!--  有备注信息的  照片or全场景照片  -->
                <img
                  :src="imageitem.filePathThumb"
                  :data-source="imageitem.filePath"
                  style="width: 100px; height:  100px"
                  :key="imageitem.filePath"
                  v-if="imageitem.is360===0"
                />
                <img
                  :src="imageitem.filePathThumb"
                  style="width: 100px; height: 100px"
                  :key="imageitem.filePath"
                  v-if="imageitem.is360===1"
                  @click="initPhotoSphere(procitem.procName,imageitem.filePath)"
                />
              </el-tooltip>
              <!-- 无备注信息的 照片or全场景照片-->
              <template v-else>
                <img
                  :src="imageitem.filePathThumb"
                  :data-source="imageitem.filePath"
                  style="width: 100px; height: 100px"
                  :key="imageitem.filePath"
                  v-if="imageitem.is360===0"
                />
                <img
                  :src="imageitem.filePathThumb"
                  style="width: 100px; height: 100px"
                  :key="imageitem.filePath"
                  v-if="imageitem.is360===1"
                  @click="initPhotoSphere(procitem.procName,imageitem.filePath)"
                />
              </template>
              <el-checkbox
                v-if="showPhotoBtn"
                class="check"
                :true-label="1"
                :false-label="0"
                v-model="imageitem.isFile"
                @change="changeFill(imageitem)"></el-checkbox>
              <div class="submit-info"
                :style="{color: imageitem.audit===0? '#888' : (imageitem.audit===2 ||imageitem.audit===4) ? 'red':(imageitem.audit===1 || imageitem.audit===3) ?'green':'' }">
              {{selectDictLabel(statusOptions, imageitem.audit)}}
              </div>
                <div class="submit-info">拍摄者: {{ imageitem.submit }}</div>
            </div>
          </div>
          <!-- 拓展信息 -->
          <template v-if="pointDirect.extand&&pointDirect.extand.length > 0">
            <span class="remarktitle" >
              <i class="el-icon-s-operation"></i>
              拓展信息
            </span>
            <ul style="margin-left:10px;margin-bottom:10px;">
              <li v-for="(item,l) in pointDirect.extand" :key="item.code + l">
                <span>{{item.name}}:</span>
                <span>{{item.value}}</span>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>

    <el-dialog
      :title="photoSphereName"
      :visible.sync="visible"
      :footer="false"
      :append-to-body="true"
      custom-class="photo_wrap"
      width="70%">
      <photo :bigImg="bigImg" v-if="visible"></photo>
    </el-dialog>

    <!-- <el-dialog
      :title="photoSphereName"
      :visible.sync="visible"
      :footer="false"
      :append-to-body="true"
      width="70%">
      <div id="viewer"></div>
    </el-dialog> -->

  </div>
</template>

<script>
// import { Viewer } from 'photo-sphere-viewer'
// import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import photo from '@/views/3D/index'
export default {
  name: 'point_info_rate',
  props: {
    statusOptions: {
      required: true
    },
    procLists: {
      required: true
    },
    deviceList: {
      required: true
    },
    showPhotoBtn: {
      default: false
    },
    user_type: { // 为0就展示物料清单
      default: 0
    },
    did: { // proc_submit_web_list接口：user_type为1时就传员工部门did，user_type为0就传0，默认传0
      default: 0
    }
  },
  components: { photo },
  data () {
    return {
      options: {
        toolbar: true,
        url: 'data-source'
      },
      photoSphereName: '',
      visible: false,
      bigImg: '',
      attc_ids: [], // 归档本次选中的
      attc_ids_no: [] // 归档本次取消选中的
    }
  },
  methods: {
    selectDictLabel (datas, value) {
      const actions = []
      Object.keys(datas).map((key) => {
        if (datas[key].dict_value === (value)) {
          actions.push(datas[key].dict_label)
          return false
        }
      })
      return actions.join('')
    },
    initPhotoSphere(name, img) {
      // img = require('../../../assets/images/test1.jpg')
      // img = 'https://gw.alicdn.com/tfs/TB1WSInRFXXXXXlXpXXXXXXXXXX-1200-600.jpg'
      img = img.replace('http://36.133.34.40:82/', '') + '?' + new Date().getTime()
      // img = img + '?' + new Date().getTime()
      this.photoSphereName = name
      this.visible = true
      this.bigImg = img

      // if (this.viewer) {
      //   this.viewer.destroy()
      // }
      // this.$nextTick(() => {
      //   this.viewer = new Viewer({
      //     container: document.querySelector('#viewer'),
      //     panorama: img,
      //     size: {
      //       width: '100%',
      //       height: '60vh'
      //     }
      //   })
      // })
    },
    changeFill(img) {
      const _id = img.id
      const checkedId = this.attc_ids.indexOf(_id)
      const no_checkedId = this.attc_ids_no.indexOf(_id)
      if (img.isFile === 0) { // 取消选中
        if (checkedId > -1) { // 选中的里面删除掉这个id
          this.attc_ids.splice(checkedId, 1)
        }
        if (no_checkedId <= -1) { // 取消选中的里面加入这个id
          this.attc_ids_no.push(_id)
        }
      } else if (img.isFile === 1) { // 选中
        if (no_checkedId > -1) { // 取消选中的里面删除掉这个id
          this.attc_ids_no.splice(no_checkedId, 1)
        }
        if (checkedId <= -1) { // 取消选中的里面加入这个id
          this.attc_ids.push(_id)
        }
      }
    },
    async photoFile() {
      console.log(this.attc_ids_no)
      console.log(this.attc_ids)
      const params = {
        attc_ids: this.attc_ids,
        attc_ids_no: this.attc_ids_no
      }
      const { code } = await this.$pub.post('attach/photo_archive', params)
      if (code === 200) {
        this.$emit('getImageList')
      }
    }
  }
}
</script>

<style lang="scss">
.base_info{
  .subtitle {
    display: block;
    font-size: 16px;
    color: #409eff;
    margin-top: 10px;
    padding-bottom:4px;
    // border-bottom:2px solid #000;
    // margin-bottom:10px;
  }
  .remarktitle {
    font-family: "Microsoft YaHei", "微软雅黑";
    display: block;
    font-size: 14px;
    color: red;
    margin-left: 5px;
  }
  .submit-info {
    /* text-align: left; */
    font-size: 12px;
    color: #aaa;
  }
  .submit-action {
    height: 25px;
    line-height: 25px;
    vertical-align: center;
  }
  .block {
    // padding: 10px 5px;
    margin: 0 8px 8px 0;
    text-align: center;
    display: inline-block;
    box-sizing: border-box;
    position: relative;
    .check{
      position: absolute;
      top: 85px;
      right:0px;
    }
  }
  .remark-info {
    text-align: left;
  }
  .remark-submit {
    color: #888;
    font-size: 12px;
  }
  .drawer-image {
    padding: 0px 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .btns{
    margin-top: 10px;
    float: right;
  }
}
</style>
