import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.component('VueShowdown', VueShowdown);
app.mount('#app')
import { VueShowdown } from 'vue-showdown';