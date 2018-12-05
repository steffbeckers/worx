import Vue from 'vue'
import moment from 'moment'

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY')
  }
})

Vue.filter('formatDateShort', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM')
  }
})

Vue.filter('formatTime', function(value) {
  if (value) {
    return moment(String(value)).format('HH:mm')
  }
})

Vue.filter('formatDateTime', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY HH:mm')
  }
})

Vue.filter('formatDecimal', function(value) {
  if (value) {
    return Number(value).toFixed(2);
  }
})
