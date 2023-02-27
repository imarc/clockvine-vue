const mockUsersInitialState = {
  1: { id: 1, name: 'Kevin', full_name: 'Kevin Hamer' },
  2: { id: 2, name: 'Test', full_name: 'Test test' }
}
let mockUsers = Object.assign({}, mockUsersInitialState)

const mockUserApi = {
  key: (action, params) => {
    const queryStr = (new URLSearchParams(params)).toString()
    console.log(`mockUserapi.key() ${action}?${queryStr}`)
    return `${action}?${queryStr}`
  },
  index: () => Promise.resolve({
    data: Object.values(mockUsers).map(e => Object.assign({}, e))
  }),
  show: id => Promise.resolve(id in mockUsers ? Object.assign({}, mockUsers[id]) : null),
  update: element => {
    mockUsers[element.id] = element
    return Promise.resolve(Object.assign({}, element))
  },
  store: element => {
    mockUsers[element.id] = element
    return Promise.resolve(Object.assign({}, element))
  },
  destroy: element => {
    element = mockUsers[element.id]
    delete mockUsers[element.id]
    return Promise.resolve(Object.assign({}, element))
  },

  /* Testing only */
  reset: () => {
    mockUsers = Object.assign({}, mockUsersInitialState)
  }
}

export default mockUserApi
