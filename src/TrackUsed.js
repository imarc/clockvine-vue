export default function TrackUsed (obj) {
  const usedKeys = new Set()
  return new Proxy(obj, {
    get (target, key) {
      if (key === 'getUsed') {
        return () => Object.fromEntries(Object.entries(obj).filter(([k]) => usedKeys.has(k)))
      } else if (key === 'getUnused') {
        return () => Object.fromEntries(Object.entries(obj).filter(([k]) => !usedKeys.has(k)))
      } else {
        usedKeys.add(key)
        return target[key]
      }
    }
  })
}
