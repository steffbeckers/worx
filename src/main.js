import Vue from 'vue'
import './plugins/vuetify'
import './plugins/axios'
import App from './App.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import router from './router'

// Set Authorization header, if token exists
var token = localStorage.getItem('token')
if (token) {
  Vue.prototype.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

// User object to window.user global
var user = localStorage.getItem('user')
if (user) {
  window.user = JSON.parse(user)
}

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
