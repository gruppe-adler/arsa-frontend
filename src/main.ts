import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './plugins/router';
import './style.css';
import App from './App.vue';
import { useAuthStore } from './stores/auth.ts';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const bootstrap = async () => {
    const auth = useAuthStore();
    await auth.init();
    app.mount('#app');
};

void bootstrap();
