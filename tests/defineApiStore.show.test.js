import { beforeEach, expect, test, vi } from 'vitest'
import { userApiReset, mockUserApi, testUserStore, vueUpdates, ensureLoaded } from './testHelpers.js'

beforeEach(userApiReset)

test('ref is reactive', async () => {
  const showSpy = vi.spyOn(mockUserApi, 'show')
  const store = testUserStore()
  const person1 = store.show(1)

  expect(person1.value).toBe(undefined)

  await vueUpdates()

  expect(showSpy).toHaveBeenCalledTimes(1)

  expect(person1?.value.name).toBe('Kevin')
})

test('Only calls show on Api once', async () => {
  const show = vi.spyOn(mockUserApi, 'show')
  const store = testUserStore()

  ensureLoaded(store.show(1))
  ensureLoaded(store.show(1))

  expect(show).toHaveBeenCalledTimes(1) // TODO
})

test('ref is mutable', async () => {
  const store = testUserStore()
  const person1 = store.show(1)
  const another1 = store.show(1)

  ensureLoaded(person1)
  await vueUpdates()

  another1.value.name = 'Chuck'

  expect(person1?.value.name).toBe('Chuck')
})
