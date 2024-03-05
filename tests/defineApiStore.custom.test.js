import { beforeEach, expect, test } from 'vitest'
import { ref, toValue, isRef, isReactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import defineApiStore from '../src/defineApiStore.js'
import mockJsonApi from './JsonApi.mock.js'

beforeEach(() => {
  setActivePinia(createPinia())
  mockJsonApi.reset()
})

test('can define a custom action', async () => {
  const useMockStore = defineApiStore('testUsers', mockJsonApi, {}, {
    publish: {
      apiAction: 'post',
      url: '/report'
    }
  })
  const store = useMockStore()
  expect(store).toBeDefined()

  store.publish({ id: 10, name: 'Frank' })
  await flushPromises()

  const person10 = store.show(10)

  expect(toValue(person10).name).toBe('Frank')
})
