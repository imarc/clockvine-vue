import { beforeEach, expect, test, vi } from 'vitest'
import { userApiReset, mockUserApi, testUserStore, vueUpdates } from './testHelpers.js'

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

  store.show(1).value
  store.show(1).value

  expect(show).toHaveBeenCalledTimes(1) // TODO
})

test('ref is mutable', async () => {
  const store = testUserStore()
  const person1 = store.show(1)
  const another1 = store.show(1)

  person1.value
  await vueUpdates()

  another1.value.name = 'Chuck'

  expect(person1?.value.name).toBe('Chuck')
})
