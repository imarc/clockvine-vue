import { expect, test, vi } from 'vitest'

import UrlExp from '../src/UrlExp.js'

test('can construct a static UrlExp', () => {
  const urlexp = new UrlExp('/api/users')

  expect(urlexp.format()).toBe('/api/users')
})

test('can construct a dynamic UrlExp', () => {
  const urlexp = new UrlExp('/api/users/:user')

  expect(urlexp.format({ user: 3 })).toBe('/api/users/3')
})

test('can construct a dynamic UrlExp with query params', () => {
  const urlexp = new UrlExp('/api/users/:user')

  expect(urlexp.format({ user: 3, dir: 'asc' })).toBe('/api/users/3?dir=asc')
})

test('only appends required params', () => {
  const urlexp = new UrlExp('/api/users/:user')

  expect(urlexp.format({ user: 3 }, { ignored: 'field' })).toBe('/api/users/3')
})

test('can use optional params', () => {
  const urlexp = new UrlExp('/api/users/:user')

  expect(urlexp.format({}, { user: 3, ignored: 'field' })).toBe('/api/users/3')
})
