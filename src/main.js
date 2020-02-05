import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.performance = false

import RamViewer  from './WorkRamViewer.vue'
import VRamViewer from './VRamViewer.vue'
Vue.component('work-ram-viewer', RamViewer )
Vue.component('v-ram-viewer'   , VRamViewer)

new Vue({
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
