import { createRouter, createWebHashHistory } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import CalendarView from '@/views/CalendarView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView
    }
  ]
})

export default router
