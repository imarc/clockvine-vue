import { beforeEach, expect, test } from 'vitest'
import { userApiReset, testUserStore, vueUpdates, ensureLoaded } from './testHelpers.js'

beforeEach(userApiReset)

test('can update', async () => {
  const store = testUserStore()
  const person1 = store.show(1)

  store.update({ id: 1, name: 'Chuck' })
  await vueUpdates()

  expect(person1.value.name).toBe('Chuck')
})

test('can update from clone object', async () => {
  const store = testUserStore()
  const person1 = store.show(1)

  ensureLoaded(person1)
  await vueUpdates()

  const draftPerson = Object.assign({}, person1.value)
  draftPerson.full_name = 'Kevin "The Coder" Hamer'

  store.update(draftPerson)
  await vueUpdates()

  expect(person1.value.name).toBe('Kevin')
  expect(person1.value.full_name).toBe('Kevin "The Coder" Hamer')
})

test('can store a new object', async () => {
  const store = testUserStore()
  store.store({ id: 3, name: 'Jim', full_name: 'Jim Halpert' })
  await vueUpdates()

  const person3 = store.show(3)
  await vueUpdates()

  expect(person3.value.name).toBe('Jim')
})

test('can have a reference to an object before its created', async () => {
  const store = testUserStore()
  const person3 = store.show(3)
  await vueUpdates()

  store.store({ id: 3, name: 'Jim', full_name: 'Jim Halpert' })
  await vueUpdates()

  expect(person3.value.name).toBe('Jim')
})

test('can destroy an object', async () => {
  const store = testUserStore()

  store.show(1)
  await vueUpdates()

  store.destroy({ id: 1 })
  await vueUpdates()

  const person1 = store.show(1)
  await vueUpdates()

  expect(person1.value).toBe(undefined)
})
