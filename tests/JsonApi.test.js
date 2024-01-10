import { expect, test, vi } from 'vitest'

import JsonApi from '../src/JsonApi.js'

test('can construct a JsonApi instance', () => {
  const api = new JsonApi('/api/users')
  expect(api).toBeInstanceOf(JsonApi)
})

test('can call index', () => {
  JsonApi.config.fetch = vi.fn()
  JsonApi.config.fetch.mockResolvedValue({ json: () => ({ data: [] }) })

  const api = new JsonApi('/api/users/:id?')

  api.index()

  expect(JsonApi.config.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = JsonApi.config.fetch.mock.lastCall
  expect(options.method).toBe('get')
  expect(url).toBe('/api/users')
})

test('can call get', () => {
  JsonApi.config.fetch = vi.fn()
  JsonApi.config.fetch.mockResolvedValue({ json: () => ({ data: { name: 'kevin' } }) })

  const api = new JsonApi('/api/users/:id?')

  api.get({ id: 3 }).then(u => expect(u.name).toBe('kevin'))

  expect(JsonApi.config.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = JsonApi.config.fetch.mock.lastCall
  expect(options.method).toBe('get')
  expect(url).toBe('/api/users/3')
})

test('can work with URLs ending with .json', () => {
  JsonApi.config.fetch = vi.fn()
  JsonApi.config.fetch.mockResolvedValue({ json: () => ({ data: { name: 'kevin' } }) })

  const api = new JsonApi('/api/users/{:id.json}?')

  api.get({ id: 3 }).then(u => expect(u.name).toBe('kevin'))

  expect(JsonApi.config.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = JsonApi.config.fetch.mock.lastCall
  expect(options.method).toBe('get')
  expect(url).toBe('/api/users/3.json')
})

test('can post', () => {
  JsonApi.config.fetch = vi.fn()
  JsonApi.config.fetch.mockResolvedValue({ json: () => ({ data: { id: 1, name: 'kevin' } }) })

  const api = new JsonApi('/api/users/:id?')

  api.store({ name: 'kevin' }).then(u => expect(u.id).toBe(1))

  expect(JsonApi.config.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = JsonApi.config.fetch.mock.lastCall
  expect(options.method).toBe('post')
  expect(url).toBe('/api/users')
})

test('can update', () => {
  JsonApi.config.fetch = vi.fn()
  JsonApi.config.fetch.mockResolvedValue({ json: () => ({ data: { id: 1, name: 'kevin hamer' } }) })

  const api = new JsonApi('/api/users/:id?')

  api.update({ id: 1, name: 'kevin hamer' }).then(u => {
    expect(u.id).toBe(1)
    expect(u.name).toBe('kevin hamer')
  })

  expect(JsonApi.config.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = JsonApi.config.fetch.mock.lastCall
  expect(options.method).toBe('put')
  expect(url).toBe('/api/users/1')
})
