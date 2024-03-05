export default function StackObjects (...objs) {
  return new Proxy({}, {
    get (_, prop) {
      return objs.find(obj => prop in obj)?.[prop]
    },
    has (_, prop) {
      return objs.some(obj => prop in obj)
    }
  })
}
