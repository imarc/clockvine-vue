import { ref, computed, isRef, watch } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'
import { userApiReset, mockUserApi, testUserStore, vueUpdates, ensureLoaded } from './testHelpers.js'

beforeEach(userApiReset)

test('loading an index calls api.index', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  expect(indexSpy).toHaveBeenCalledTimes(0)

  // necessary for to trigger computing the index at all
  ensureLoaded(store.index().data)

  expect(indexSpy).toHaveBeenCalledTimes(1)
})

test('loading an index more than once only calls api.index once', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index().data)
  ensureLoaded(store.index().data)

  expect(indexSpy).toHaveBeenCalledTimes(1)
})

test('invalidating an index will recall api.index', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const userStore = testUserStore()

  const { data: users } = userStore.index()

  watch(users, () => {})
  userStore.invalidateIndex()
  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledTimes(2)
})

test('parameters are passed through to api.index', () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index({ foo: 'bar', bin: 'baz' }).data)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })
})

test('can call with different sets of parameters', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  ensureLoaded(store.index({ foo: 'bar', bin: 'baz' }).data)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar', bin: 'baz' })

  ensureLoaded(store.index({ foo: 'alpha' }).data)

  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'alpha' })
})

test('parameter properties can be reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const { users } = store.index({ foo })
  ensureLoaded(users)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  ensureLoaded(users)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
})

test('Parameters itself can be reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const foo = ref('bar')
  const params = computed(() => ({ foo }))

  const { data: users } = store.index(params)
  ensureLoaded(users)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

  foo.value = 'biz'
  ensureLoaded(users)

  expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
})

test('the returned value is reactive', async () => {
  const indexSpy = vi.spyOn(mockUserApi, 'index')
  const store = testUserStore()

  const { data: users } = store.index()

  expect(users.value).toBe(undefined)

  await vueUpdates()

  expect(indexSpy).toHaveBeenCalledTimes(1)
  expect(users.value.length).toBe(2)
})

test('api.show results merge over api.index', async () => {
  const store = testUserStore()
  ensureLoaded(store.show(1))
  const { data: users } = store.index()
  ensureLoaded(users)
  await vueUpdates()

  expect(users.value[0].shown).toBeTruthy()
})

test('index returns references', async () => {
  const store = testUserStore()
  const { data } = store.index()
  expect(isRef(data)).toBeTruthy()

  ensureLoaded(data)
  await vueUpdates()

  expect(data.value.length).toBe(2)
})

test('index references work properly', async () => {
  const store = testUserStore()
  const { data } = store.index()
  watch(data, () => {})
  await vueUpdates()

  expect(data.value.length).toBe(2)

  await store.store({ id: 10, name: 'Cheese', full_name: 'Brie' })
  await vueUpdates()

  expect(data.value.length).toBe(3)
})
