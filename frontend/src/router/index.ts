import { createRouter, createWebHistory } from 'vue-router';
import CranesListView from '../views/CranesListView.vue';
import CraneDetailsView from '../views/CraneDetailsView.vue';
import CraneFormView from '../views/CraneFormView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/cranes' },
    { path: '/cranes', name: 'cranes-list', component: CranesListView },
    { path: '/cranes/new', name: 'crane-create', component: CraneFormView },
    { path: '/cranes/:id/edit', name: 'crane-edit', component: CraneFormView },
    { path: '/cranes/:id', name: 'crane-details', component: CraneDetailsView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
  ]
});

export default router;
