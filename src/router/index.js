import Vue from 'vue'
import Router from 'vue-router'

// Pages
const Ractuals = () => import('@/pages/Ractuals')
const Settings = () => import('@/pages/Settings')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    // Settings
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    // Ractuals
    {
      path: '/ractuals',
      name: 'Ractuals',
      component: Ractuals
    }
  ]
})
