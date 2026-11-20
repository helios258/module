import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import router from './router';
import App from './App.vue';
import './assets/style.css';

const app = createApp(App);
app.use(router);
app.use(VueQueryPlugin);
app.mount('#app');
