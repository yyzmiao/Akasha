import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initSeedData } from './db'

async function bootstrap() {
  try {
    await initSeedData()
  } catch (err) {
    console.error('Failed to initialize seed database:', err)
  }
  createApp(App).mount('#app')
}

bootstrap()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
