import { ref, computed } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'
import { userApiReset, mockUserApi, testUserStore, vueUpdates } from './testHelpers.js'

beforeEach(userApiReset)

test('calls index on Api', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  // necessary for to trigger computing the index at all
  store.index().value

  expect(indexSpy).toHaveBeenCalledTimes(1)
})

test('Only calls index on Api once', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  store.index().value
  store.index().value

  expect(indexSpy).toHaveBeenCalledTimes(1) // TODO
})

test('Parameters are passed through', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  store.index({ foo: 'bar', bin: 'baz' }).value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })
})

test('Parameters can change', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  store.index({ foo: 'bar', bin: 'baz' }).value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })

  store.index({ foo: 'alpha' }).value

  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'alpha' })
})

test('Parameters can be reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const fooIndex = store.index({ foo })
  fooIndex.value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  fooIndex.value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
})

test('Parameters can be in a computed object', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const params = computed(() => ({ foo }))
  const fooIndex = store.index(params)
  fooIndex.value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  fooIndex.value

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
})

test('ref is reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const fooIndex = store.index()

  expect(fooIndex.value.data).toBe(undefined)

  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledTimes(1)
  expect(fooIndex.value.data.length).toBe(2)
})

test('show merges over index', async () => {
  const store = testUserStore()
  store.show(1).value
  const userIndex = store.index()
  userIndex.value
  await vueUpdates()

  expect(userIndex.value.data[0].shown).toBeTruthy()
})
