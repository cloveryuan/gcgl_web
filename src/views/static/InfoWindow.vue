<template>
  <div class="info-window"
    ref="infoWindow">
    <div class="top">
      <span class="title">{{ info.pointName }}</span>
      <span class="close" @click="handleClose"><i class="el-icon-close" circle></i></span>
    </div>
    <div class="content">
      <div class="content-info">
        <div style="flex:1;">编号：{{info.pointCode}}</div>
        <div style="width:120px;">拍照数量:{{info.picNum}}张</div>
      </div>
      <div class="imglist" >
        <el-button style="float:left;" size="mini" icon="el-icon-search" round @click.native="handleZoomToPoint">放大</el-button>
        <el-button style="float:right;" size="mini" icon="el-icon-view" round @click.native="handleShowImageList">详情查看</el-button>
      </div>
    </div>

    <div class="footer">
    </div>
  </div>

</template>

<script>
export default {
  props: {
    // 像素坐标
    pos: Object,
    // 窗口信息
    info: Object,
    // 信息窗口偏移
    offset: {
      type: Object,
      default: () => {
        return {
          x: 0,
          y: -20
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleShowImageList() {
      this.$parent.handleShowImageList(this.info)
    },
    handleZoomToPoint() {
      this.$parent.handleZoomToPoint(this.info)
    }
  },
  watch: {
    pos: {
      handler(newPos) {
        if (newPos && newPos.x && newPos.y) {
          this.$nextTick(() => {
            const infoHeight = document.querySelector('.info-window').clientHeight
            this.$refs.infoWindow.style.left = newPos.x + this.offset.x + 'px'
            this.$refs.infoWindow.style.top = newPos.y - infoHeight / 2 + this.offset.y + 'px'
          })
        }
      },
      immediate: true
    }
  }
}

</script>

<style scoped>
.info-window {
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 10px;
  min-width: 300px;
  border-radius: 5px;
  box-shadow: 0 15px 15px rgba(0, 0, 0, 0.25);
  background-color: #719bff;
  z-index: 10;
  transform: translate(-50%, -50%);
  color:#fff;
}
.info-window::after {
  content: "◆";
  font-size: 36px;
  height: 26px;
  color: #719bff;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.info-window .top {
  padding-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-window .top .title {
  color:#fff;
  font-size: 15px;
  padding:0 10px;
}

.info-window .top .close {
  width: 20px;
  font-size: 15px;
  cursor: pointer;
  color:#fff;
}
.info-window .content {
  color:#fff;
  font-size:14px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content:space-between;
  text-align: left;
}
.el-image{
  margin-right:5px;
  border:2px solid #f2f2f2;
}

.info-window .content .content-info{
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content:flex-start;
  text-align: left;
  padding:5px 10px;
}
.info-window .imglist{
  height:30px;
  line-height: 30px;
  text-align: right;
  padding:10px 12px 5px 15px;
  color:#fff;

}
.el-link.el-link--default {
    color: #fff;
}
.info-window .footer {
  font-size: 12px;
  color: #cccccc;
  text-align: right;
}
</style>
