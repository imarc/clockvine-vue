import defineApiStore from './defineSingleApiStore'

const defineSingleApiStore = function defineSingleApiStore (name, api, options) {
  return defineApiStore(
    name,
    api,
    {
      ApiOptions: {
        FormatOptions: {
          format: (_, url) => url
        }
      },
      ...options
    }
  )
}

export default defineSingleApiStore
