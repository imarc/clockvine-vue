import { setActivePinia, createPinia } from 'pinia'
import defineApiStore from '../src/defineApiStore.js'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { reactive, ref, toRef, computed, unref, isRef, isReactive, toRefs } from 'vue'


import mockUserApi from './usersApi.mock.js'

const testUserStore = defineApiStore('testUserStore', mockUserApi)

const vueUpdates = () => new Promise(setTimeout)

describe('testing .index', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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
    const params = computed(() => ({ foo: foo.value }))
    const fooIndex = store.index(params)
    fooIndex.value

    expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

    foo.value = 'biz'
    await vueUpdates()
    fooIndex.value

    expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
  })

  test('Parameters can be a pojo with a reactive key', async () => {
    const indexSpy = vi.spyOn(mockUserApi, 'index')
    const store = testUserStore()

    const foo = ref('bar')
    const params = computed(() => ({ foo }))
    const fooIndex = store.index(params)
    fooIndex.value

    expect(indexSpy).toHaveBeenCalledWith({ foo: 'bar' })

    foo.value = 'biz'
    await vueUpdates()
    fooIndex.value

    expect(indexSpy).toHaveBeenCalledWith({ foo: 'biz' })
  })

  test('ref is reactive', async () => {
    const indexSpy = vi.spyOn(mockUserApi, 'index')
    const store = testUserStore()
    const { data: elements } = store.index().value
    expect(elements.value).toBe(undefined)

    await vueUpdates()

    expect(indexSpy).toHaveBeenCalledTimes(1)
    expect(elements.value.length).toBe(2)
  })
})

describe('testing .show', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('ref is reactive', async () => {
    const showSpy = vi.spyOn(mockUserApi, 'show')
    const store = testUserStore()
    const person1 = store.show(1)

    expect(person1?.value?.name).toBe(undefined)

    await vueUpdates()

    expect(showSpy).toHaveBeenCalledTimes(1)

    expect(person1?.value.name).toBe('Kevin')
  })

  test('Only calls show on Api once', () => {
    const show = vi.spyOn(mockUserApi, 'show')
    const store = testUserStore()

    store.show(1)
    store.show(1)

    expect(show).toHaveBeenCalledTimes(1) // TODO
  })

  test('ref is mutable', async () => {
    const store = testUserStore()
    const person1 = store.show(1)
    const another1 = store.show(1)
    await vueUpdates()

    another1.value.name = 'Chuck'

    expect(person1?.value.name).toBe('Chuck')
  })
})

describe('testing .update', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockUserApi.reset()
  })

  test('can update', async () => {
    const store = testUserStore()
    const person1 = store.show(1)
    await vueUpdates()

    store.update({ id: 1, name: 'Chuck' })
    await vueUpdates()

    expect(person1.value.name).toBe('Chuck')
  })

  test('can update from clone object', async () => {
    const store = testUserStore()
    const person1 = store.show(1)
    await vueUpdates()

    const draftPerson = Object.assign({}, person1.value)
    draftPerson.full_name = 'Kevin "The Coder" Hamer'

    store.update(draftPerson)
    await vueUpdates()

    expect(person1.value.name).toBe('Kevin')
    expect(person1.value.full_name).toBe('Kevin "The Coder" Hamer')
  })
})

describe('testing .store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockUserApi.reset()
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
})

describe('testing .destroy', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockUserApi.reset()
  })

  test('can destroy an object', async () => {
    const store = testUserStore()

    store.index()
    await vueUpdates()

    store.destroy({ id: 1 })
    await vueUpdates()

    const person1 = store.show(1)
    await vueUpdates()

    expect(person1.value).toBe(null)
  })
})
