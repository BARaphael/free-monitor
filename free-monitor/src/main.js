import {createApp} from 'vue';
import App from './LabDraw.vue';

var app = createApp(App)

app.config.unwrapInjectedRef = true

app.mount('#lab-draw')
