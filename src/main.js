import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.performance = false
new Vue({
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
