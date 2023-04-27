export default function Params (params, optionalParams) {
  const usedKeys = []
  return new Proxy(params, {
    get (target, prop) {
      if (prop === 'getAll') {
        return () => Object.fromEntries(Object.entries(params).filter(([k]) => !usedKeys.includes(k)))
      } else if (prop in target) {
        usedKeys.push(prop)
        return target[prop]
      } else if (prop in optionalParams) {
        return optionalParams[prop]
      }
    }
  })
}
