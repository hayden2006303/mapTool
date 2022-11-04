import Vue from 'vue';
import Router from 'vue-router';
import map from '../Tools/map.vue';
Vue.use(Router);
const router = new Router({
    routes: [
        {
            path: '/',
            component: map,
        },
        {
            path: 'toolsMap',
            name: 'toolsMap',
            component: map,
            meta: {
                title: '地图工具',
            },
        },
    ]
})
export default router;