import { expect, test, vi } from 'vitest'

import AccessObserver from '../src/AccessObserver.js'


test('observes fires when attributes are acccessed', () => {
  const obj = { name: 'kevin' }
  const callback = vi.fn()
  const observer = new AccessObserver(callback)
  const observed = observer.observe(obj)

  console.log(`Accessing ${observed.name}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('tracks key access', () => {
  const obj = { firstname: 'kevin', lastname: 'hamer' }

  const observer = new AccessObserver()
  const observed = observer.observe(obj)

  console.log(`Accessing ${observed.firstname} and ${observed.age}.`)

  expect(observer.accessedKeys()).toStrictEqual(['firstname'])
})
