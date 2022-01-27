<template>
  <div style="position:relitive">
    <span
      style="font-size:12px;z-index:1000;width:30%;height:30px;line-heigt:30px;background:#fff;color:#333;position:absolute;top:40px;left:0px;"
    >{{ area }}</span>
    <el-input
      size="mini"
      style="width:30%;position:absolute;top:0px;left:0px;z-index:1000"
      placeholder="请输入想要搜索的地区"
      prefix-icon="el-icon-search"
      v-model="searchArea"
      @change="change"
    ></el-input>
    <div class="input-card">
      <div class="input-item">
        <input type="radio" name="func" checked value="marker" />
        <span class="input-text">画点</span>
        <input type="radio" name="func" value="polyline" />
        <span class="input-text">画折线</span>
        <input type="radio" name="func" value="polygon" />
        <span class="input-text" style="width:5rem;">画多边形</span>
      </div>
      <div class="input-item">
        <input type="radio" name="func" value="rectangle" />
        <span class="input-text">画矩形</span>
        <input type="radio" name="func" value="circle" />
        <span class="input-text">画圆</span>
      </div>
      <div class="input-item">
        <input id="clear" @click="clear" type="button" class="btn" value="清除" />
        <input id="close" @click="close" type="button" class="btn" value="关闭绘图" />
      </div>
    </div>
    <div id="container1" style="height:100vh;width:100%;"></div>
  </div>
</template>

<script>
import { loadMap } from '@/utils/map'
export default {
  data() {
    return {
      map: '',
      AMap: null,
      plugins: [
        'AMap.ToolBar',
        'AMap.MapType',
        'AMap.MouseTool',
        'AMap.PlaceSearch',
        'AMap.DistrictLayer',
        'AMap.CustomLayer',
        'AMap.Scale',
        'AMap.Geocoder'
      ],
      // 鼠标画覆盖物--start
      overlays: [],
      mouseTool: {},
      radios: [],
      // 鼠标画覆盖物--end
      flag: true, // 判断在地图上神魔时候开始和结束
      area: '', // 点击某处显示当前地点的地名
      searchArea: '', // 搜索输入的内容
      locationData: [],
      drawData: [], // 存放鼠标在地图上戍边按下时的数据
      lnglatData: [
        {
          id: Math.random(),
          state: 1,
          position: [116.7, 39.52]
        },
        {
          id: Math.random(),
          state: 2,
          position: [116.4, 39.9]
        },
        {
          id: Math.random(),
          state: 3,
          position: [117.00634, 39.76133]
        }
      ]
    }
  },
  created () {
    this.initmap()
  },
  mounted() {

  },
  methods: {
    initmap () {
      loadMap(this.plugins).then(res => {
        const { AMap } = res
        this.AMap = AMap
        this.init()
      }).catch(() => {
        this.loading = false
        console.log('地图加载失败')
      })
    },
    init() {
      this.map = new this.AMap.Map('container1', {
        zoom: 11, // 级别
        resizeEnable: true,
        showLabel: true,
        // viewMode: "3D",
        center: [116.335183, 39.941735],
        expandZoomRange: true
      //   center: [116.7, 39.52], //设置中心点坐标
      })
      this.map.clearMap() // 渲染之前先清一下覆盖物，防止覆盖物叠加
      // -------start   当需要监听某个事件，实时画marker时，将mass和marker定义为全局，每次先清空一下否则会出现图标叠加
      // _this.map.remove(this.mass);
      // _this.map.remove(this.marker);
      // -------end
      this.getAddressName(this.map)
      // this.addMoreMarkers(this.map); //使用AMap.Marker
      // this.addMassMarks(this.map, this.lnglatData) // 使用AMap.MassMarks
      // this.addPolyline(this.map) // 使用折线覆盖物
      // this.addPolygon(this.map); //多边形覆盖物
      // this.drawPoly(this.map); //实现在地图上画覆盖物
      // this.drawCanvasArc(this.map);
      // this.drawCanvasRect(this.map);
      this.useMouseDraw(this.map)// 使用框选
    },
    //   根据输入的内容定位到相应的位置---正向地理编码
    getLocation(searchArea, map) {
      const _this = this
      map.clearMap() // 每次搜索的时候先清除地图，防止下次搜索还露着上次的 marker
      const geocoder = new _this.AMap.Geocoder({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
        city: '010'
      })
      geocoder.getLocation(searchArea, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
          // result中对应详细地理坐标信息
          const lng = result.geocodes[0].location.lng
          const lat = result.geocodes[0].location.lat
          map.setCenter([lng, lat])
          // const marker = new _this.AMap.Marker({
          //   map: map,
          //   position: [lng, lat] // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          // })
        }
      })
    },
    // 在高德地图上点击某个点，获取当前点的地名--逆向地理编码
    getAddressName(map) {
      const _this = this
      map.on('click', function (e) {
        const geocoder = new _this.AMap.Geocoder({
          // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
          city: '010'
        })
        geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], function (
          status,
          result
        ) {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            _this.area = result.regeocode.formattedAddress
          }
        })
      })
    },
    // 为高德地图添加多个marker标记，使用这个方法绘制标记点会出出现marker覆盖label的问题，后期改为使用海量点
    addMoreMarkers(map) {
      const _this = this
      for (let i = 0; i < this.lnglatData.length; i++) {
        const marker = new _this.Marker({
          map: map,
          position: this.lnglatData[i].position
        })
        // marker的点击事件
        marker.on('click', () => {
          console.log(this.lnglatData[i])
        })
        // 鼠标经过marker
        marker.on('mouseover', () => {
          marker.setLabel({
            offset: new _this.Pixel(20, 20), // 设置文本标注偏移量
            content: `<div class='info'>${this.lnglatData[i].position}</div>`, // 设置文本标注内容
            direction: 'right' // 设置文本标注方位
          })
        })
        // 鼠标离开marker
        marker.on('mouseout', () => {
          marker.setLabel(null)
        })
      }
    },
    // 添加海量点的方式，可以避免marker覆盖label
    addMassMarks(map, data) {
      let status = 0
      const style = [
        {
          // state == 1 top-center anchor: new AMap.Pixel(16, 16),
          url: require('../../assets/images/point.png'),
          anchor: new this.AMap.Pixel(0, 0),
          size: new this.AMap.Size(20, 20)
        },
        {
          // state == 2
          url: require('../../assets/images/point2.png'),
          anchor: new this.AMap.Pixel(0, 0),
          size: new this.AMap.Size(20, 20)
        },
        {
          // state == 3
          url: require('../../assets/images/position-picker.png'),
          anchor: new this.AMap.Pixel(0, 0),
          size: new this.AMap.Size(20, 20)
        }
      ]
      for (let i = 0; i < data.length; i++) {
        if (data[i].state === 1) {
          status = 0
        } else if (data[i].state === 2) {
          status = 1
        } else {
          status = 2
        }
        this.locationData.push({
          // position: data[i].position,  这里必须是lnglat，否则报// Error in mounted hook: "TypeError: Cannot read property 'Q' of undefined"
          lnglat: data[i].position,
          style: status,
          obj: data[i]
        })
      }
      const mass = new this.AMap.MassMarks(this.locationData, {
        opacity: 1,
        zIndex: 111,
        cursor: 'pointer',
        style: style,
        // 表示是否在拖拽缩放过程中实时重绘，默认true，建议超过10000的时候设置false
        alwaysRender: true
      })
      const marker = new this.AMap.Marker({
        content: ' ',
        map: map,
        offset: new this.AMap.Pixel(0, -10)
      })
      mass.on('mouseover', function (e) {
        const arr = [e.data.lnglat.lng, e.data.lnglat.lat]
        marker.setPosition(arr)
        marker.setLabel({
          content: `<span>${e.data.obj.id}</span>`,
          direction: 'top' // 设置文本标注方位
        })
      })
      mass.on('mouseout', function (e) {
        const arr = [e.data.lnglat.lng, e.data.lnglat.lat]
        marker.setPosition(arr)
        marker.setLabel(null)
      })
      mass.on('click', function (e) {
        // const arr = [e.data.lnglat.lng, e.data.lnglat.lat]
        // 做点击marker的处理
      })
      mass.setMap(map)
    },
    // 使用折线覆盖物   https://lbs.amap.com/api/javascript-api/guide/overlays/vector-overlay
    addPolyline(map) {
      var path = [
        ['116.368904', '39.913423'],
        ['116.382122', '39.901176'],
        ['116.387271', '39.912501'],
        ['116.398258', '39.9046']
      ]
      var polyline = new this.AMap.Polyline({
        map: map,
        path: path, // 设置线覆盖物路径
        strokeColor: '#3366FF', // 线颜色
        strokeOpacity: 1, // 线透明度
        strokeWeight: 2, // 线宽
        strokeStyle: 'solid', // 线样式
        strokeDasharray: [10, 5], // 补充线样式
        geodesic: true, // 绘制大地线
        lineJoin: 'round' // 折线拐点连接处样式
      })
      // map.remove(polyline); //移除覆盖物
      polyline.show() // 覆盖物的显示
      // polyline.hide(); //覆盖物的隐藏
    },
    // 多边形覆盖物
    addPolygon(map) {
      var path = [
        ['116.7', '39.52'],
        ['116.4', '39.9'],
        ['117.00634', '39.76133']
      ]
      var polygon = new this.AMap.Polygon({
        map: map,
        path: path,
        fillColor: '#fff', // 多边形填充颜色
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: 'red' // 线条颜色
      })
      polygon.show()
    },
    // 实现在地图上画覆盖物
    drawPoly(map) {
      const drawPolyData = []
      // 鼠标在地图上单击按下时触发
      map.on('mousedown', function (e) {
        this.flag = false
        console.log([e.lnglat.lng, e.lnglat.lat], 'mousedown')
      })
      // 鼠标在地图上移动时触发
      map.on('mousemove', function (e) {
        if (this.flag) {
          drawPolyData.push([e.lnglat.lng, e.lnglat.lat])
          var polygon = new this.AMap.Polygon({
            map: map,
            path: drawPolyData,
            fillColor: '#fff', // 多边形填充颜色
            borderWeight: 2, // 线条宽度，默认为 1
            strokeColor: 'red' // 线条颜色
          })
          polygon.show()
        }
      })
      map.on('mouseup', function (e) {
        this.flag = true
      })
    },
    // 在高德地图上使用canvas图层,闪动圆点。自建图层https://lbs.amap.com/api/javascript-api/reference/self-own-layers#canvaslayer
    drawCanvasArc(map) {
      const _this = this
      var bar = new _this.AMap.ControlBar()
      map.addControl(bar)
      // 画canvas
      var draw = function (context, radious) {
        context.clearRect(0, 0, 400, 400)
        context.globalAlpha = (context.globalAlpha - 0.01 + 1) % 1
        radious = (radious + 1) % 100

        context.beginPath()
        context.arc(100, 100, radious, 0, 2 * Math.PI)
        context.fill()
        context.stroke()

        // 2D视图时可以省略
        // CanvasLayer.reFresh();

        _this.AMap.Util.requestAnimFrame(function () {
          draw(context, radious)
        })
      }
      var point = [
        [
          [116.328911, 39.937229],
          [116.342659, 39.946275]
        ],
        [
          [116.319384, 39.941683],
          [116.329384, 39.951683]
        ]
      ]
      var canvas = []
      var CanvasLayer = []
      var context = []
      var radious = []
      for (let i = 0; i < point.length; ++i) {
        canvas[i] = document.createElement('canvas')
        canvas[i].width = canvas[i].height = 200
        context[i] = canvas[i].getContext('2d')
        context[i].fillStyle = 'rgb(0,100,255)'
        context[i].strokeStyle = 'white'
        context[i].globalAlpha = 1
        context[i].lineWidth = 2
        radious[i] = 0
        CanvasLayer[i] = new _this.AMap.CanvasLayer({
          canvas: canvas[i],
          bounds: new _this.AMap.Bounds(point[i][0], point[i][1]),
          zooms: [3, 18]
        })
        CanvasLayer[i].setMap(map)
        draw(context[i], radious[i])
      }
    },
    // 绘制矩形
    drawCanvasRect(map) {
      const _this = this
      var bar = new _this.AMap.ControlBar()
      map.addControl(bar)
      // 画canvas
      var draw = function (context, width, height) {
        context.clearRect(0, 0, 400, 400)
        context.globalAlpha = (context.globalAlpha - 0.01 + 1) % 1 // 调节透明度
        width = (width + 1) % 100
        height = (height + 1) % 100
        context.beginPath()
        context.rect(20, 20, width, height)
        context.fill()
        context.stroke()

        // 2D视图时可以省略
        // CanvasLayer.reFresh();

        _this.AMap.Util.requestAnimFrame(function () {
          draw(context, width, height)
        })
      }
      var point = [
        [
          [116.328911, 39.937229],
          [116.342659, 39.946275]
        ],
        [
          [116.319384, 39.941683],
          [116.329384, 39.951683]
        ]
      ]
      var canvas = []
      var CanvasLayer = []
      var context = []
      var width = []
      var height = []
      for (let i = 0; i < point.length; ++i) {
        canvas[i] = document.createElement('canvas')
        canvas[i].width = canvas[i].height = 200
        context[i] = canvas[i].getContext('2d')
        context[i].fillStyle = 'rgb(0,100,255)'
        context[i].strokeStyle = 'white'
        context[i].globalAlpha = 1
        context[i].lineWidth = 2
        width[i] = 0
        height[i] = 0
        CanvasLayer[i] = new _this.AMap.CanvasLayer({
          canvas: canvas[i],
          bounds: new _this.AMap.Bounds(point[i][0], point[i][1]),
          zooms: [3, 18]
        })
        CanvasLayer[i].setMap(map)
        draw(context[i], width[i], height[i])
      }
    },
    // 地图中使用鼠标绘制覆盖物
    // https://lbs.amap.com/api/javascript-api/example/mouse-operate-map/mouse-draw-overlayers
    // 鼠标工具插件 https://lbs.amap.com/api/javascript-api/reference/plugin#AMap.PolyEditor
    useMouseDraw(map) {
      const _this = this
      this.mouseTool = new _this.AMap.MouseTool(map)
      // 监听draw事件可获取画好的覆盖物
      this.overlays = []
      this.mouseTool.on('draw', function (e) {
        console.log(e)
        _this.overlays.push(e.obj)
      })
      this.radios = document.getElementsByName('func')
      for (let i = 0; i < this.radios.length; i++) {
        this.radios[i].onchange = (e) => {
          this.draw(e.target.value, this.mouseTool)
        }
      }
      map.on('click', function(e) {
        console.log([e.lnglat.lng, e.lnglat.lat], 'click')
      })
    },
    draw(type, mouseTool) {
      console.log(type, 'type')
      switch (type) {
        case 'marker': {
          mouseTool.marker({
            // 同Marker的Option设置
          })
          break
        }
        case 'polyline': {
          mouseTool.polyline({
            strokeColor: '#80d8ff'
            // 同Polyline的Option设置
          })
          break
        }
        case 'polygon': {
          mouseTool.polygon({
            fillColor: '#00b0ff',
            strokeColor: '#80d8ff'
            // 同Polygon的Option设置
          })
          break
        }
        case 'rectangle': {
          mouseTool.rectangle({
            fillColor: '#00b0ff',
            strokeColor: '#80d8ff'
            // 同Polygon的Option设置
          })
          break
        }
        case 'circle': {
          mouseTool.circle({
            strokeColor: '#409eff',
            strokeWeight: 2,
            strokeOpacity: 0.4,
            fillColor: '#1791fc',
            fillOpacity: 0.1,
            strokeStyle: 'solid'
          })
          break
        }
      }
    },
    clear() {
      this.map.remove(this.overlays)
      this.overlays = []
    },
    close() {
      this.mouseTool.close(true) // 关闭并清除覆盖物
      for (let i = 0; i < this.radios.length; i++) {
        this.radios[i].checked = false
      }
    },
    change(e) {
      //  e.lnglat.lng e.lnglat.lat
      this.getLocation(e, this.map)
    }
  }
}
</script>

<style lang="scss" scoped>
.input-card {
  width: 200px;
  right: 20px;
  bottom: 30px;
  z-index: 1000;
  padding: 10px 20px;
  position: absolute;
  background: #ffffff;
}
</style>
