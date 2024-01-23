import { beforeEach, expect, test } from 'vitest'
import { ref, toValue, isRef, isReactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import defineApiStore from '../src/defineApiStore.js'
import mockJsonApi from './JsonApi.mock.js'

const useMockStore = defineApiStore('testUsers', mockJsonApi)
let store = null

beforeEach(() => {
  setActivePinia(createPinia())
  mockJsonApi.reset()
  store = useMockStore()
})

test('can load an index', async () => {
  const index = store.index()

  toValue(index.data)
  await flushPromises()

  expect(toValue(index.data).length).toBe(2)
})

test('index is reactive', async () => {
  const index = store.index()

  toValue(index.data)
  await flushPromises()

  expect(toValue(index.data).length).toBe(2)

  store.store({ id: 3, name: 'Chuck', full_name: 'Chuck Norris' })
  await flushPromises()
  toValue(index.data)
  await flushPromises()

  expect(toValue(index.data).length).toBe(3)
})
