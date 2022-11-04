<<<<<<< HEAD
# mycomponments

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 数据传递 props
    1. 初始数据：intArr，默认[],格式：[
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
      ]

    2.初始地图中心点：
    center:默认[106.55073, 29.56471]

    3.标记点信息背景颜色：在地图上点击后，再点击右下角生成标记点，即可生成标记点。单击修改maker信息名称，双击删除点。
    makerPointColor:默认"red"

    4.范围标记点背景颜色:
    rangePointColor:默认"orange"

    5.标记点图标：
    iconPath ：默认在公共文件引入 import iconPath from '../../public/images/zb.png';

    6.范围中心覆盖点颜色：编辑多边形的时候在多边表区域内点击，可生成多边形内的覆盖点。单击修改maker信息名称，双击删除点。
    centerPointColor:默认"green"

    7.范围覆盖物标记点图标：
    iconPath2 ：默认为空，用的是高德默认图标;

    8.多边形背景颜色：在地图上点击至少3个坐标点后，再点击右下角生成范围，即可生成范围。
    centerPointColor:默认"#2b83f9"
   
    9.提交数据方法
    @update ：  //this.$emit("update", this.subArr);
=======
# 地图工具组件

#### 介绍
1:支持地图画多个电子围栏
2:可以对单个电子围栏命名
3:可以对单个电子围栏删除
4:可以对单个电子围栏修改
5:地图支持点标记点
6:地图支持删除点标记点
7:地图支持标记点自定义命名
name 第一次新增的时候默认类型+长度取名字默认格式：范围0，标记点1，可以修改
自定义单个范围拥有权限：
  编辑，删除，修改名字，
自定义单个点拥有权限
      修改名字，删除

#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request



