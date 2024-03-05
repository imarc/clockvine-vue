import { beforeEach, expect, test } from 'vitest'
import { ref, toValue } from 'vue'
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

test('can get by ID', async () => {
  const person1 = store.show(1)

  toValue(person1)
  await flushPromises()

  expect(person1.value.name).toBe('Kevin')
})

test('calls API', async () => {
  const person1 = store.show(1)

  await flushPromises()
})

test('get same value for multiple refs', async () => {
  const person1 = store.show(1)
  const person2 = store.show(1)

  await flushPromises()

  expect(person1 === person2).toBeFalsy()
  expect(person1.value === person2.value).toBeTruthy()
})

test('ref is mutable', async () => {
  const person1 = store.show(1)
  const person2 = store.show(1)

  toValue(person1)
  toValue(person2)
  await flushPromises()

  person1.value.name = 'Chuck'
  expect(person2.value.name).toBe('Chuck')
})

test('ref is reactive to ID changes', async () => {
  mockJsonApi.reset()
  const id = ref(1)
  const person1 = store.show(id)

  toValue(person1)
  await flushPromises()

  expect(person1.value.name).toBe('Kevin')

  id.value = 2
  toValue(person1)
  await flushPromises()

  expect(person1.value.name).toBe('Test')
})
