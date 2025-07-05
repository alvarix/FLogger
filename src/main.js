import { createApp } from 'vue'
import App from './App.vue'
import { VueShowdown } from 'vue-showdown'
import { registerServiceWorker } from './sw-register.js'

const app = createApp(App)

app.component('VueShowdown', VueShowdown);
app.mount('#app')

// Register service worker for PWA
registerServiceWorker()