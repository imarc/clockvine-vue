import { setActivePinia, createPinia } from 'pinia'

import defineApiStore from '../src/defineApiStore.js'
import mockUserApi from './usersApi.mock.js'
const testUserStore = defineApiStore('testUserStore', mockUserApi)
const vueUpdates = () => new Promise(setTimeout)

const userApiReset = () => {
  setActivePinia(createPinia())
  mockUserApi.reset()
}

const ensureLoaded = ref => ref.value

export {
  ensureLoaded,
  mockUserApi,
  testUserStore,
  userApiReset,
  vueUpdates
}
