import { setActivePinia, createPinia } from 'pinia'

import defineApiStore from '../src/defineApiStore.js'
import mockUserApi from './usersApi.mock.js'
const testUserStore = defineApiStore('testUserStore', mockUserApi)
const vueUpdates = () => new Promise(setTimeout)

const userApiReset = () => {
  setActivePinia(createPinia())
  mockUserApi.reset()
}

export { mockUserApi, testUserStore, vueUpdates, userApiReset }
