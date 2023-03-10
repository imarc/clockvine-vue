import { ref, computed } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'
import { userApiReset, mockUserApi, testUserStore, vueUpdates, ensureLoaded } from './testHelpers.js'

beforeEach(userApiReset)

test('calls index on Api', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  // necessary for to trigger computing the index at all
  ensureLoaded(store.index())

  expect(indexSpy).toHaveBeenCalledTimes(1)
})

test('Only calls index on Api once', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index())
  ensureLoaded(store.index())

  expect(indexSpy).toHaveBeenCalledTimes(1) // TODO
})

test('Parameters are passed through', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index({ foo: 'bar', bin: 'baz' }))

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })
})

test('Parameters can change', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index({ foo: 'bar', bin: 'baz' }))

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })

  ensureLoaded(store.index({ foo: 'alpha' }))

  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'alpha' })
})

test('Parameters can be reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const fooIndex = store.index({ foo })
  ensureLoaded(fooIndex)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  ensureLoaded(fooIndex)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
})

test('Parameters can be in a computed object', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const params = computed(() => ({ foo }))
  const fooIndex = store.index(params)
  ensureLoaded(fooIndex)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  ensureLoaded(fooIndex)

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
  ensureLoaded(store.show(1))
  const userIndex = store.index()
  ensureLoaded(userIndex)
  await vueUpdates()

  expect(userIndex.value.data[0].shown).toBeTruthy()
})
