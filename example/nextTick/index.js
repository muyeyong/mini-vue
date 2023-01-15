import { createApp } from '../../lib/mini-vue.es.js'
import { App } from './app.js'
const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)