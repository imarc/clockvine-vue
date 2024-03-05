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

test('can update an element', async () => {
  const person1 = store.show(1)

  toValue(person1)
  await flushPromises()

  expect(person1.value.name).toBe('Kevin')

  store.update({ id: 1, name: 'Devin' })
  await flushPromises()

  expect(person1.value.name).toBe('Devin')
})
