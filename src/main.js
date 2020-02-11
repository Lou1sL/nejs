import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.performance = false

import RamViewer  from './components/WorkRamViewer.vue'
import VRamViewer from './components/VRamViewer.vue'
Vue.component('work-ram-viewer', RamViewer )
Vue.component('v-ram-viewer'   , VRamViewer)

new Vue({
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
