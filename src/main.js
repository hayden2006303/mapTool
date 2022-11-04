import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import AMap from 'vue-amap';
import router from './router';
Vue.use(AMap);

AMap.initAMapApiLoader({
    key: 'de11407476712c64e661275642857e97',
    plugin: [
        'AMap.Autocomplete',
        'AMap.PlaceSearch',
        'AMap.Scale',
        'AMap.OverView',
        'AMap.ToolBar',
        'AMap.MapType',
        'AMap.PolyEditor',
        'AMap.CircleEditor',
        'AMap.Geocoder',
        'AMap.Geolocation',
        'AMap.Driving',
        'AMap.DragRoute',
    ],
    v: '1.4.10',
});

Vue.use(Antd);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
