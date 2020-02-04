import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.performance = false

import RamViewer from './RamViewer.vue'
Vue.component('ram-viewer', RamViewer)

new Vue({
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
