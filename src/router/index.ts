import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../Views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../Views/HomeView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// ─── NAVIGATION GUARD ───────────────────────────────────────
// Replace `isLoggedIn` with your real auth check (Pinia store, localStorage, etc.)
function isLoggedIn(): boolean {
  return !!localStorage.getItem('auth_token')
}

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isLoggedIn()) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router