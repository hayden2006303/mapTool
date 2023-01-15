<template>
  <div>
    <div width="100%" max-width="100%" class="mb-5">
      <div>
        <a-input-search
          placeholder="请输入地点名称"
          enter-button="搜索"
          size="large"
          v-model="formData.location"
          @search="getLocation"
        />
      </div>
    </div>
    <div class="map-box">
      <div class="map-tool">
        <span>地图上范围点的坐标:</span>
        <div class="longlat">
          <ul>
            <li v-for="(item, index) in lnglatpoints[pIdx]" :key="index">
              {{ item.longitude }} , {{ item.latitude }}
            </li>
          </ul>
          <a-button
            type="primary"
            @click="copyPoints"
            style="margin-right: 10px"
          >
            复制
          </a-button>
          <a-button type="primary" @click="subMit"> 提交数据 </a-button>
        </div>
      </div>
      <div class="map" id="map">
        <el-amap
          ref="map"
          bubble
          :plugin="plugin"
          :zoom="map.zoom"
          :center="map.center"
          :events="events"
          vid="amap"
        >
          <el-amap-polygon
            v-for="(polygon, index) in polygons"
            :vid="index"
            :ref="`polygon_${index}`"
            :path="polygon.path"
            :draggable="polygon.draggable"
            :events="polygon.events"
            :key="`polygon_${index}`"
            editable="true"
            :fillColor="polygonColor"
            fillOpacity="0.5"
            :strokeWeight="0"
            strokeColor="#2b83f9"
            strokeOpacity="0.5"
          ></el-amap-polygon>

          <!-- 中心点 -->
          <!-- v-for="(center, index) in centerMaker[pIdx]" -->
          <el-amap-marker
            v-for="(center, index) in showCenterMaker"
            :position="center.position"
            vid="centerMaker"
            :key="`centerMaker-${index}`"
            :label="center.label"
            :events="center.events"
            :icon="center.icon"
          ></el-amap-marker>
          <!-- 范围点 -->
          <el-amap-marker
            v-for="(marker, index) in markers[pIdx]"
            :key="`${pIdx}-${index}`"
            :position="marker.position"
            :events="marker.events"
            :visible="marker.visible"
            :draggable="marker.draggable"
            :label="marker.label"
            :vid="`${pIdx}-${index}`"
            :icon="marker.icon"
          ></el-amap-marker>

          <!-- 标记点 -->
          <el-amap-marker
            v-for="(marker, index) in markerPoint"
            :key="`point-${index}`"
            :position="marker.position"
            :events="marker.events"
            :visible="marker.visible"
            :draggable="marker.draggable"
            :label="marker.label"
            :vid="`point-${index}`"
            :icon="marker.icon"
          ></el-amap-marker>
        </el-amap>
      </div>
      <div style="width: 360px; position: absolute; top: 0px; right: 0px">
        <a-card class="box-card">
          <a-table
            :columns="columns"
            :data-source="polygons"
            :pagination="false"
            :scroll="{ y: 240 }"
            :rowKey="(record, index) => index"
          >
            <template slot="name" slot-scope="text, record, index">
              <div v-if="isAble">
                {{ record.name || `范围区域${index + 1}` }}
              </div>
              <a-input
                v-model="record.name"
                v-else
                :placeholder="`范围区域${index + 1}`"
              />
            </template>
            <template slot="action" slot-scope="text, record, index">
              <a-button
                @click="editStart(index)"
                type="link"
                size="small"
                :disabled="!isAble"
                v-if="isAble"
                >编辑</a-button
              >

              <a-button
                @click="end()"
                type="link"
                size="small"
                :disabled="!polyEditor"
                v-else
                >结束编辑</a-button
              >
              <a-button
                @click="del(index)"
                type="link"
                size="small"
                :disabled="isDel"
                >删除</a-button
              >
            </template>
          </a-table>
          <!-- <el-table :data="polygons" border size="mini" style="width: 100%">
            <el-table-column align="center" label="名称">
              <template slot-scope="scope">
                <div v-if="isAble">{{ scope.row.name || `范围区域${scope.$index + 1}` }}</div>
                <a-input
                  v-model="scope.row.name"
                  v-else
                  :placeholder="`范围区域${scope.$index + 1}`"
                />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  @click="editStart(scope.$index)"
                  type="text"
                  size="small"
                  :disabled="!isAble"
                  v-if="isAble"
                  >编辑</el-button
                >

                <el-button @click="end()" type="text" size="small" :disabled="!polyEditor" v-else
                  >结束编辑</el-button
                >
                <el-button @click="del(scope.$index)" type="text" size="small" :disabled="isDel"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table> -->
        </a-card>
      </div>
      <div class="my-tools">
        <a-row>
          <a-button
            type="primary"
            @click="addPoint"
            :disabled="isPoint"
            style="margin-right: 10px"
          >
            生成标记点
          </a-button>
          <a-button type="primary" @click="addArea" :disabled="!lock">
            生成范围
          </a-button>
          <!-- <a-button type="primary" @click="end()" :disabled="!polyEditor"> 编辑结束 </a-button> -->
          <!-- <a-button type="primary" @click="editStart(pIdx)" :disabled="lock"> 开始编辑 </a-button> -->
          <!-- <a-button type="primary" @click="sure" :disabled="!isEdit"> 确定区域 </a-button> -->
        </a-row>
      </div>
    </div>
  </div>
</template>
<script>
import iconPath from '../../public/images/zb.png';

export default {
  name: 'toolsMap',
  data() {
    const _this = this;
    return {
      columns: [{
        title: '名称',
        key: 'name',
        scopedSlots: { customRender: 'name' },
        align: 'center'

      },
      {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
        align: 'center',
        width: 150
      },
      ],
      // iconImg: iconPath,
      lngLat: '',
      location: '',
      ifFalg: true,
      map: {
        zoom: 15,
        center: this.center,
      },
      label: {
        content: '',
        offset: [0, -20],
      },
      polygon: [], // 新生成的多边形
      polygons: [],
      pIdx: 0,// 多边形索引
      path: [[]],
      pathArr: [],
      draggable: false,
      lnglatpoints: [[]],
      formData: {
        location: '',
        longitude: '',
        latitude: '',
      },
      plugin: {
        pName: 'Geolocation',
        events: {
          click: (e) => this.mapClickCallback(e),
          mouseover: (e) => {

          }
        },
      },
      events: {
        init: (o) => {
          o.addControl(new AMap.ToolBar({ position: 'RT', direction: false, offset: new AMap.Pixel(30, 150) }));
        },
        click: (e) => {
          this.mapClickCallback(e);
        }
      },
      centerMaker: [[]], // 范围中心点
      showCenterMaker: [],
      markers: [[]],// 范围点标记
      markerPoint: [],// 单独点标记
      lock: true,// 用锁来防止多次点击编辑
      polyEditor: undefined,
      isEdit: false,
      isAble: false,
      isPoint: false,// 控制添加点按钮
      count: 1,
      isDel: true,
      subArr: []// 提交的数组数据
    };
  },
  props: {
    // 初始数据
    intArr: {
      type: Array,
      default: () => [
        // { address: "重庆市人民政府", name: "标记点1", type: "point", value: { latitude: 29.5629, longitude: 106.549571 } },
        // { address: "聚兴大厦", name: "标记点2", type: "point", value: { latitude: 29.559503, longitude: 106.549271 } },
        // {
        //   name: "范围区域1", type: "range", rangePoint: [{ address: "龙湖重庆春森星悦荟", location: [106.544701, 29.570276] }, { address: "江北区观音桥消防救援站", location: [106.543875, 29.569651] }],
        //   value: [{ latitude: 29.573202, longitude: 106.538714 }, { latitude: 29.573724, longitude: 106.545838 }, { latitude: 29.567379, longitude: 106.539186 }, { latitude: 29.569357, longitude: 106.550902 }]
        // },
        // {
        //   name: "范围区域2", type: "range", rangePoint: [{ address: "龙湖重庆", location: [106.562558, 29.568697] }, { address: "观音桥消防救", location: [106.56185, 29.567465] }],
        //   value: [{ latitude: 29.56203, longitude: 106.566985 }, { latitude: 29.573702, longitude: 106.56314 }, { latitude: 29.567587, longitude: 106.55326 }]
        // }
      ],
    },
    //地图中心点
    center: {
      type: Array,
      default: () => [106.55073, 29.56471]
    },

    // 标记点颜色
    makerPointColor: {
      type: String,
      default: 'red'
    },

    // 范围标记点颜色
    rangePointColor: {
      type: String,
      default: 'orange'
    },

    // 范围中心覆盖点颜色
    centerPointColor: {
      type: String,
      default: 'green'
    },

    // 多边形背景颜色
    polygonColor: {
      type: String,
      default: '#2b83f9'
    },

    // 标记点图标
    iconImg: {
      type: String,
      default: iconPath
    },

    // 范围覆盖物标记点图标
    iconImg2: {
      type: String,
      default: ''
    }
  },
  mounted() {
    const _this = this
    if (!this.intArr.length) return
    let time = null
    const pointArr = this.intArr.filter(item => item.type === 'point')
    const rangeArr = this.intArr.filter(item => item.type === 'range')
    const len = rangeArr.length
    for (let i = 0; i < len; i++) {
      this.markers.push([])
      this.centerMaker.push([])
      this.lnglatpoints.push([])
    }

    // 初始化标记点
    if (pointArr.length) {
      pointArr.map(item => {
        const pointObj = { visible: true, draggable: true, icon: this.iconImg, address: item.name }
        pointObj.label = {
          offset: [12, -20], // 设置文本标注偏移量
          content: `<div style='background-color:${this.makerPointColor}; padding:2px;z-index:999' >${item.name}</div>`, // 设置文本标注内容
        }
        pointObj.position = [item.value.longitude, item.value.latitude]
        this.markerPoint.push(pointObj)
      })
      this.addPoint()
    }



    // 初始化范围
    if (rangeArr.length) {
      rangeArr.map((item, i) => {
        const polygonObj = {};
        polygonObj.rangePoint = item.rangePoint
        polygonObj.name = item.name
        polygonObj.path = item.value.map(e => ({ lng: e.longitude, lat: e.latitude }))
        polygonObj.events = {
          click(e) {
            _this.clickEdit(e);
          },
        }
        this.polygons.push(polygonObj)
        this.pIdx = this.polygons.length - 1
        item.value.map((e, index) => {
          const makerObj = { visible: true, draggable: true, icon: this.iconImg }
          makerObj.position = [e.longitude, e.latitude]
          makerObj.label = {
            offset: [12, -20], // 设置文本标注偏移量
            content: `<div style='background-color: ${_this.rangePointColor}; padding:2px'>${index + 1}</div>`, // 设置文本标注内容
          }
          makerObj.events = {
            dblclick: (e) => {
              const lnglat = e.target.getPosition();
              this.lnglatpoints[this.pIdx] = this.lnglatpoints[this.pIdx].filter(itt => itt.latitude !== lnglat.lat && itt.longitude !== lnglat.lng)
              this.markers[this.pIdx] = this.markers[this.pIdx].filter(itt => itt.position[1] !== lnglat.lat && itt.position[0] !== lnglat.lng)
              this.markers[this.pIdx].map((ite, index) => {// 重写这个让坐标内容标识数字从新渲染
                ite.label = {
                  offset: [12, -20], // 设置文本标注偏移量
                  content: `<div style='background-color: ${this.rangePointColor}; padding:2px'>${index + 1}</div>`, // 设置文本标注内容
                }
              })
              this.$forceUpdate()
              if (_this.polygons.length) _this.draw(_this.pIdx)
            },
            dragend(e) {
              const lnglat = e.target.getPosition();
              makerObj.position = [lnglat.lng, lnglat.lat];
              if (_this.polygons.length) {
                _this.isAble = false  // 禁止编辑按钮
                _this.draw(_this.pIdx)
              }
            }
          }
          this.markers[i].push(makerObj)
        })
        item.rangePoint.map((e) => {// { address: "龙湖重庆春森星悦荟", location: [106.544701, 29.570276] }
          const rangeObj = { icon: this.iconImg2 }
          rangeObj.label = {
            offset: [12, -20], // 设置文本标注偏移量
            content: `<div style='background-color: ${this.centerPointColor}; padding:2px'>${e.address}</div>`, // 设置文本标注内容
          }
          rangeObj.address = e.address
          rangeObj.position = [e.location[0], e.location[1]]
          rangeObj.events = {
            click() {
              // 取消上次延时未执行的方法
              clearTimeout(time);
              // 执行延时
              time = setTimeout(() => {  // 双击时不触发单击事件
                const dom = document.createElement('div');
                dom.innerHTML = this.getLabel().content;
                const test3 = prompt("是否修改标记点名称", dom.innerText) || dom.innerText;
                rangeObj.address = test3
                e.address = test3
                this.setLabel({// label默认蓝框白底左上角显示，样式className为：amap-marker-label
                  // offset: new AMap.Pixel(-60, -25),// 修改label相对于maker的位置
                  content: `<div style='background-color: ${_this.centerPointColor}; padding:2px;z-index:999' >${test3}</div>`
                });
              }, 300);
            }, dblclick: () => {
              clearTimeout(time);
              _this.centerMaker[i] = _this.centerMaker[i].filter(itt => itt.position[1] !== rangeObj.position[1] && itt.position[0] !== rangeObj.position[0])
              _this.polygons[i].rangePoint = _this.polygons[i].rangePoint.filter(itt => itt.location[0] !== rangeObj.position[0] && itt.location[1] !== rangeObj.position[1])
              _this.showCenterMaker = _this.centerMaker.flat(Infinity)
              _this.$forceUpdate()
            }
          }
          this.centerMaker[i].push(rangeObj)
          _this.showCenterMaker = _this.centerMaker.flat(Infinity)
        })
      })
      this.polygons.map((ite, i) => {
        this.draw(i)
      })
    }
    this.count = this.markerPoint.length + 1
    this.pIdx = this.polygons.length// 初始化让点标记消失
    this.lock = true   // 放开添加区域按钮
    this.isAble = true // 放开编辑按钮
    this.isPoint = false // 放开添加点按钮
    this.isDel = false// 放开删除按钮

  },
  methods: {
    /**
       * 单机地图的事件回调
       * */
    mapClickCallback(e) {
      this.addMarker(e.lnglat.lng, e.lnglat.lat);
    },
    addMarker(longitude, latitude) {
      if (this.polyEditor) {
        this.polyEditor.close()
      }
      const self = this
      // 范围数组
      this.markers[this.pIdx].push({
        position: [longitude, latitude],
        visible: true,
        draggable: true, // 是否可拖拽
      });
      this.markers[this.pIdx].map((item, i) => {
        item.icon = this.iconImg
        item.label = {
          offset: [12, -20], // 设置文本标注偏移量
          content: `<div style='background-color: ${this.rangePointColor}; padding:2px'>${i + 1}</div>`, // 设置文本标注内容
        }

        item.events = {
          dblclick: () => {
            this.lnglatpoints[this.pIdx] = this.lnglatpoints[this.pIdx].filter(itt => itt.latitude !== item.position[1] && itt.longitude !== item.position[0])
            this.markers[this.pIdx] = this.markers[this.pIdx].filter(itt => itt.position[1] !== item.position[1] && itt.position[0] !== item.position[0])
            this.markers[this.pIdx].map((ite, index) => {// 重写这个让坐标内容标识数字从新渲染
              ite.label = {
                offset: [12, -20], // 设置文本标注偏移量
                content: `<div style='background-color: ${this.rangePointColor}; padding:2px'>${index + 1}</div>`, // 设置文本标注内容
              }
            })
            this.$forceUpdate()
            if (self.polygons.length) self.draw(self.pIdx)
          },
          dragend(e) {
            const lnglat = e.target.getPosition();
            item.position = [lnglat.lng, lnglat.lat];
            if (self.polygons.length) {
              this.isAble = false  // 禁止编辑按钮
              self.draw(self.pIdx)
            }
          }
        }
      })
      this.$forceUpdate()  // 让maker标记点实时出现在地图上
    },

    // 添加点
    addPoint() {
      // this.lock = false  // 禁止添加区域按钮
      let time = null
      const _this = this
      this.isEdit = true  // 放开确定按钮
      this.markers[this.pIdx].map((item, i) => {
        // item.address = `标记点${i + this.markerPoint.length}`
        item.address = `标记点${this.count}`
        this.count++
      })
      this.markerPoint.push(...this.markers[this.pIdx])
      // 点数组
      this.markerPoint.map((item, i) => {
        item.icon = this.iconImg
        item.label = {
          offset: [12, -20], // 设置文本标注偏移量
          content: `<div style='background-color: ${this.makerPointColor}; padding:2px;z-index:999' >${item.address}</div>`, // 设置文本标注内容
        }
        item.events = {
          click() {
            // 取消上次延时未执行的方法
            clearTimeout(time);
            // 执行延时
            time = setTimeout(() => {  // 双击时不触发单击事件
              const dom = document.createElement('div');
              dom.innerHTML = this.getLabel().content;
              const test3 = prompt("是否修改标记点名称", dom.innerText) || dom.innerText;
              item.address = test3
              this.setLabel({// label默认蓝框白底左上角显示，样式className为：amap-marker-label
                // offset: new AMap.Pixel(-60, -25),// 修改label相对于maker的位置
                content: `<div style='background-color: ${_this.makerPointColor}; padding:2px;z-index:999' >${item.address}</div>`
              });
            }, 300);
          },
          dblclick: () => {
            clearTimeout(time);
            // setTimeout(() => {
            this.markerPoint = this.markerPoint.filter(itt => itt.position[1] !== item.position[1] && itt.position[0] !== item.position[0])
            this.markerPoint.map(ite => {// 重新给label赋值，否则修改名称后，双击删除，名称不会马上改变。
              ite.label = {
                offset: [12, -20], // 设置文本标注偏移量
                content: `<div style='background-color: ${_this.makerPointColor}; padding:2px;z-index:999' >${ite.address}</div>`, // 设置文本标注内容
              }
            })
            // }, 400)
          },
          dragend(e) {
            const lnglat = e.target.getPosition();
            item.position = [lnglat.lng, lnglat.lat];
          }
        }
      })
      this.markers[this.pIdx] = []
      this.$forceUpdate()
    },
    // 添加多边形区域
    addArea() {
      const _this = this
      if (this.markers[this.pIdx].length < 3) {
        this.$message.error('如果生成区域请至少标记3个坐标点')
        return
      }
      if (this.isEdit && this.polyEditor) {
        this.end();
      }
      const obj = {
        rangePoint: [],
        name: '',
        path: [],
        events: {
          click(e) {
            _this.clickEdit(e);
            return e.target._amap_id
          },
        },
      };
      this.polygons.push(obj);
      if (this.polygons.length > 0) {
        this.draw(this.polygons.length - 1);
      }
      this.pIdx = this.polygons.length - 1
      this.sure()
      console.log(this.polygons)
    },

    clickEdit(e) {
      this.mapClickCallback(e)
    },
    // 删除多边形区域
    del(idx) {
      this.polygons.splice(idx, 1);
      this.markers.splice(idx, 1);
      this.path.splice(idx, 1);
      this.polygon.splice(idx, 1);
      this.lnglatpoints.splice(idx, 1);
      this.centerMaker.splice(idx, 1);
      this.showCenterMaker = this.centerMaker.flat(Infinity)
      if (this.pIdx > 0) this.pIdx--
      if (this.pIdx === 0) {  // 防止第一个还没确定就删除时，再加点报错
        this.markers[this.pIdx] = []
        this.lock = true  // 放开添加按钮
        // this.isEdit = false;// 禁止确定按钮
        this.isPoint = false // 放开添加点按钮
      }
    },
    // 结束编辑
    end() {
      this.polyEditor.close();
      // this.isEdit = true;// 放开确定按钮
      this.isAble = true // 放开编辑按钮
      this.polyEditor = undefined // 禁止结束编辑按钮
      this.draw(this.pIdx);
      this.sure()
    },
    /**
     * 画多边形
     */
    draw(idx) {
      if (this.polyEditor) {
        this.polyEditor.close()
      }
      this.pIdx = idx;
      this.lnglatpoints[idx] = []
      this.path[idx] = []
      this.markers[idx].map((val, index) => {
        const arr = val.position;
        this.path[idx].push(arr)
      });
      if (this.path[idx].length >= 3) {
        this.path[idx].map(item => {
          this.lnglatpoints[idx].push({ longitude: item[0], latitude: item[1] })
        })
        this.polygons[idx].path = this.path[idx]
        this.lock = false   // 禁止添加区域按钮
        // this.isEdit = true  // 放开确定按钮
        if (this.isAble) this.isAble = true  // 放开编辑按钮,在编辑状态时不放开
        this.isPoint = true  // 禁止添加点按钮
        this.isDel = true // 禁止删除按钮
      } else {
        this.$message.error('如果生成区域请至少标记3个坐标点')
      }
    },


    editStart(idx) {
      this.pIdx = idx// 所在索引的组显示出makers标记点
      // this.isEdit = false // 禁止确定按钮
      this.lock = false  // 禁止添加按钮
      this.isAble = false  // 禁止编辑按钮
      this.isPoint = true  // 禁止添加点按钮
      this.isDel = true // 禁止删除按钮
      const vm = this
      const map = this.$refs.map.$$getInstance()
      this.path[idx] = this.polygons[idx].path
      const polygonOld = this.$refs[`polygon_${idx}`][0].$$getInstance()
      map.remove(polygonOld)// 原来有的polygon移除，下面新建一个，否则小圆点不能拖动
      const polygon = new AMap.Polygon({
        path: vm.path[idx],
        strokeColor: this.polygonColor,
        strokeWeight: 0,
        strokeOpacity: 0.5,
        fillOpacity: 0.5,
        fillColor: this.polygonColor,
        zIndex: 0,
      });
      polygon.on('click', function (e) {
        // vm.mapClickCallback(e)
        AMap.service(["AMap.Geocoder"], () => {
          // 加载地理编码
          const geocoder = new AMap.Geocoder({
            radius: 200,
            extensions: "all"
          });
          //  vm.centerMaker[idx].map(item => {
          // 步骤三：通过服务对应的方法回调服务返回结果，本例中通过逆地理编码方法getAddress回调结果
          geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
            // 如果服务请求状态为“error”
            if (status === 'error') {
              alert("服务请求出错啦！ ");
            }
            // 如果服务请求状态为“no_data”， “no_data”是指服务请求正常，但根据检索条件无结果返回，建议更换检索条件
            if (status === 'no_data') {
              alert("无数据返回，请换个关键字试试～～");
            }
            // 如果请求状态为“complete”，则取回服务返回结果，并打印
            else {
              const pareData = vm.pareMapResult(result, [e.lnglat.lng, e.lnglat.lat])[0]
              let time = null
              const obj = {
                icon: vm.iconImg2,
                label: {
                  offset: [12, -20], // 设置文本标注偏移量
                  content: `<div style='background-color: ${vm.centerPointColor}; padding:2px'>${pareData.address}</div>`, // 设置文本标注内容
                },
                address: pareData.address,
                position: [e.lnglat.lng, e.lnglat.lat],
                events: {
                  click() {
                    // 取消上次延时未执行的方法
                    clearTimeout(time);
                    // 执行延时
                    time = setTimeout(() => {  // 双击时不触发单击事件
                      const dom = document.createElement('div');
                      dom.innerHTML = this.getLabel().content;
                      const test3 = prompt("是否修改标记点名称", dom.innerText) || dom.innerText;
                      obj.address = test3
                      pareData.address = test3
                      this.setLabel({// label默认蓝框白底左上角显示，样式className为：amap-marker-label
                        // offset: new AMap.Pixel(-60, -25),// 修改label相对于maker的位置
                        content: `<div style='background-color: ${vm.centerPointColor}; padding:2px;z-index:999' >${test3}</div>`
                      });
                    }, 300);
                  }, dblclick: () => {
                    clearTimeout(time);
                    vm.centerMaker[idx] = vm.centerMaker[idx].filter(itt => itt.position[1] !== obj.position[1] && itt.position[0] !== obj.position[0])
                    vm.polygons[idx].rangePoint = vm.polygons[idx].rangePoint.filter(itt => itt.location[0] !== pareData.location[0] && itt.location[1] !== pareData.location[1])
                    vm.showCenterMaker = vm.centerMaker.flat(Infinity)
                    vm.$forceUpdate()
                  }
                }
              }
              vm.centerMaker[idx].push(obj)
              vm.showCenterMaker = vm.centerMaker.flat(Infinity)
              vm.polygons[idx].rangePoint.push(pareData)
              vm.$forceUpdate()
            }
          });
        });
        // })
      })
      this.polygon[idx] = polygon
      map.add(polygon);
      // 缩放地图到合适的视野级别
      map.setFitView([this.polygon[idx]])
      this.polyEditor = new AMap.PolyEditor(map, polygon)
      this.polyEditor.open()

      // 多边形编辑结束关闭
      this.polyEditor.on('end', function (event) {
        vm.centerMaker[idx].map(item => {// 结束保存中心点名称
          item.label = {
            offset: [12, -20], // 设置文本标注偏移量
            content: `<div style='background-color: ${vm.centerPointColor}; padding:2px'>${item.address}</div>`, // 设置文本标注内容
          }
        })
        vm.showCenterMaker = vm.centerMaker.flat(Infinity)
        map.remove(vm.polygon[idx])
        map.add(vm.$refs[`polygon_${idx}`][0].$$getInstance())
        const pointArr = event.target.getPath();
        vm.lnglatpoints[idx] = [];
        pointArr.forEach((point) => {
          vm.lnglatpoints[idx].push({ latitude: point.lat, longitude: point.lng });
        });
        vm.path[idx] = [];
        vm.lnglatpoints[idx].map((val, index) => {
          const arr = [val.longitude, val.latitude];
          vm.path[idx].push(arr);
        });

        vm.markers[idx] = []
        vm.lnglatpoints[idx].map((item, i) => {
          vm.markers[idx].push({
            position: [item.longitude, item.latitude],
            visible: true,
            draggable: true, // 是否可拖拽
            icon: vm.iconImg
          });
        })
        vm.markers[idx].map((val, i) => {
          val.label = {
            offset: [12, -20], // 设置文本标注偏移量
            content: `<div style='background-color: ${vm.rangePointColor}; padding:2px'>${i + 1}</div>`, // 设置文本标注内容
          }
          val.events = {
            dblclick: () => {
              vm.lnglatpoints[idx] = vm.lnglatpoints[idx].filter(itt => itt.latitude !== val.position[1] && itt.longitude !== val.position[0])
              vm.markers[idx] = vm.markers[idx].filter(itt => itt.position[1] !== val.position[1] && itt.position[0] !== val.position[0])
              vm.markers[idx].map((ite, index) => {// 重写这个让坐标内容标识数字从新渲染
                ite.label = {
                  offset: [12, -20], // 设置文本标注偏移量
                  content: `<div style='background-color: ${vm.rangePointColor}; padding:2px'>${index + 1}</div>`, // 设置文本标注内容
                }
              })
              if (vm.polygons.length) vm.draw(idx) // 添加区域后才用这个方法
            },
            dragend(e) {
              const lnglat = e.target.getPosition();
              val.position = [lnglat.lng, lnglat.lat];
              if (vm.polygons.length) {
                vm.isAble = false  // 禁止编辑按钮
                vm.draw(idx)
              }
            }
          }
        })
      })

    },
    sure() {
      this.draw(this.pIdx);
      const map = this.$refs.map.$$getInstance()
      this.lock = true   // 放开添加区域按钮
      this.isAble = true // 放开编辑按钮
      // this.isEdit = false // 禁止确定按钮
      this.isPoint = false // 放开添加点按钮
      this.isDel = false// 放开删除按钮
      map.setZoom(15);
      this.pIdx = this.polygons.length
      this.markers.push([])
      this.markers.length = this.pIdx + 1  // 防止多次点击确定的时候增加多个空数组
      this.lnglatpoints.push([])
      this.lnglatpoints.length = this.pIdx + 1  // 防止多次点击确定的时候增加多个空数组
      this.centerMaker.push([])
      this.centerMaker.length = this.pIdx + 1  // 防止多次点击确定的时候增加多个空数组
      // const { polygons } = this;
      // this.$emit("update", polygons);
    },

    // 提交数据
    subMit() {
      // [{name:111,type:'点'，value:[{longitude:'',latitude:''}]}]
      // this.subArr
      const markerArr = []; const polygonArr = [];
      this.markerPoint.map(item => {
        const markerObj = {};

        // 根据坐标生成地址
        AMap.service(["AMap.Geocoder"], () => {
          // 加载地理编码
          const geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
          });
          // 步骤三：通过服务对应的方法回调服务返回结果，本例中通过逆地理编码方法getAddress回调结果
          geocoder.getAddress(item.position, (status, result) => {
            // 如果服务请求状态为“error”
            if (status === 'error') {
              alert("服务请求出错啦！ ");
            }
            // 如果服务请求状态为“no_data”， “no_data”是指服务请求正常，但根据检索条件无结果返回，建议更换检索条件
            if (status === 'no_data') {
              alert("无数据返回，请换个关键字试试～～");
            }
            // 如果请求状态为“complete”，则取回服务返回结果，并打印
            else {
              const pareData = this.pareMapResult(result, item.position)[0]
              // markerObj.address = result.regeocode.formattedAddress
              markerObj.address = pareData.address
            }
          });
        });
        markerObj.name = item.address
        markerObj.type = 'point'
        markerObj.value = { longitude: item.position[0], latitude: item.position[1] }
        markerArr.push(markerObj)
      })
      this.polygons.map((item, i) => {
        const polygonObj = {}
        polygonObj.name = item.name ? item.name : `范围区域${i + 1}`
        polygonObj.type = 'range'
        polygonObj.value = item.path.map(itt => ({ longitude: itt.lng, latitude: itt.lat }))
        polygonObj.rangePoint = item.rangePoint
        polygonArr.push(polygonObj)
      })
      this.subArr = [...markerArr, ...polygonArr]
      this.$emit("update", this.subArr);
      console.log(this.subArr)
    },

    /**
     * 地理编码（地址 -> 坐标）
     */
    getLocation() {
      const loc = this.formData.location;
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(loc, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            const { lat, lng } = result.geocodes[0].location;
            if (lat && lng) {
              this.map.center = [lng, lat];
              // this.map.center = [lat, lng];
              this.formData.longitude = lng;
              this.formData.latitude = lat;
            }
          }
        });
      });
    },
    pareMapResult(res, location) {
      // eslint-disable-next-line array-callback-return
      const regeocodes = [res.regeocode]
      return regeocodes.map((item) => {
        const { addressComponent } = item
        let { city } = addressComponent
        if (typeof city === 'string' && !city) {
          city = addressComponent.province
        } else if (typeof city !== 'string' && city.length === 0) {
          city = addressComponent.province
        }
        let shortAddress = ''
        if (item.aois && item.aois.length > 0) {
          shortAddress = item.aois[0].name
        } else if (item.pois && item.pois.length > 0) {
          shortAddress = item.pois[0].name
        } else {
          shortAddress = res.regeocode.formattedAddress
        }
        const pois = []
        if (item.pois) {
          item.pois.forEach((item) => {
            pois.push({
              title: item.name,
              address: item.address,
              location: {
                longitude: item.location.lng,
                latitude: item.location.lat
              },
              distance: item.distance
            })
          })
        }
        const addressComponentInfo = {
          formattedAddress: res.regeocode.formattedAddress,
          area: `${addressComponent.province}-${city}-${addressComponent.district}`,
          province: addressComponent.province,
          district: addressComponent.district,
          city,
          address: shortAddress,
          location,
          alias: ''
        }
        return addressComponentInfo
      })

    },
    copyPoints() {
      const vm = this;
      let pointsString = '';
      vm.lnglatpoints[this.pIdx].map((e) => {
        pointsString = `${pointsString + e.longitude} , ${e.latitude}\n`;
      });
      return this.copyText(pointsString);
    },
    copyText(str) {
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.value = str;
      textarea.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy');
        this.$message.success('复制成功');
      } else {
        this.$message.error('复制失败');
      }
      document.body.removeChild(textarea);
    },
    back() {
      this.$router.go(0);
    },
  },
};
</script>
<style lang="scss" scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.claer {
  margin-top: 15px;
  position: absolute;
}
$map_height: calc(100vh - 1px - 25px - 75px - 15px);
.map-box {
  position: relative;
  height: $map_height;
  .map-tool {
    position: absolute;
    width: 240px;
    z-index: 170;
    top: 0;
    left: 0;
    max-height: 100%;
    box-sizing: border-box;
    padding: 10px;
    overflow-y: auto;
    background-color: #fff;
    box-shadow: 2px 4px 7px 1px #dedede;
  }
  .my-tools {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
  }
  .map {
    transition: all 0.6s;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

.hide-text-area {
  transform: translateX(-100%);
}
.gray-map {
  filter: grayscale(90%);
}
.longlat {
  margin-top: 15px;
  padding-bottom: 15px;
  ul {
    li {
      padding: 6px;
      background-color: #ddd;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
      color: #666;
      position: relative;
    }
  }
}
.my-button {
  margin-bottom: 10px;
}
</style>
<style>
.amap-marker-label {
  position: absolute;
  z-index: 2;
  border: none;
  background-color: transparent;
  white-space: nowrap;
  padding: 3px;
  font-size: 12px;
  line-height: 14px;
  color: #fff;
  margin-left: -2px;
  border-radius: 3px;
}
</style>
