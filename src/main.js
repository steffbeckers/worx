import Vue from 'vue'
import './plugins/vuetify'
import './plugins/axios'
import './plugins/filters'
import App from './App.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import router from './router'

// Set Authorization header, if token exists
var token = localStorage.getItem('token')
if (token) {
  Vue.prototype.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

// User object to Vue global
var user = localStorage.getItem('user')
if (user) {
  Vue.prototype.$user = JSON.parse(user)
}

// Response interceptor
Vue.prototype.$axios.interceptors.response.use(
  function(response) {
    return response
  },
  function(error) {
    // Log out on unauthorized
    if (error.response && error.response.status === 401) {
      delete Vue.prototype.user;      
      // Nav to root
      router.push('/')
    }

    return Promise.reject(error.response.data.error)
  }
)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
