import { createRouter, createWebHistory } from '@ionic/vue-router';
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import StartPage from '../views/StartPage.vue';
import useAuth from '@/composables/auth';

const { isAuthenticated } = useAuth();

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!(await isAuthenticated())) {
      return next('/login');
    }
  }
  next();
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: StartPage,
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/unlock',
    component: () => import('@/views/UnlockPage.vue'),
  },
  {
    path: '/tabs/',
    component: () => import('@/views/TabsPage.vue'),
    children: [
      {
        path: '',
        redirect: '/tabs/teas',
      },
      {
        path: 'teas',
        component: () => import('@/views/TeasPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'vault-control',
        component: () => import('@/views/VaultControlPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'about',
        component: () => import('@/views/AboutPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
