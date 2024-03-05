const mockUsersInitialState = {
  1: { id: 1, name: 'Kevin', full_name: 'Kevin Hamer' },
  2: { id: 2, name: 'Test', full_name: 'Test test' }
}
let mockUsers = Object.assign({}, mockUsersInitialState)

const mockUserApi = {
  index: () => Promise.resolve({
    data: Object.values(mockUsers)
  }),
  get: element => Promise.resolve(mockUsers[element.id]),
  reset: () => {
    mockUsers = Object.assign({}, mockUsersInitialState)
  },
  key: (method, params) => {
    return `${method}:${JSON.stringify(params)}`
  },
  post: element => {
    mockUsers[element.id] = element
    return Promise.resolve(mockUsers[element.id])
  },
  put: element => {
    mockUsers[element.id] = { ...mockUsers[element.id] || {}, ...element }
    return Promise.resolve(mockUsers[element.id])
  }
}

export default mockUserApi
