Clockvine
=========

**Clockvine 2 is under development and should be considered unstable.**

Clockvine is a Vue 3 library for providing reactive objects in front of back end APIs.


Documentation
-------------

### defineApiStore

defineApiStore returns a Pinia Store with the following actions:

* `index(paramsRef)` - Returns a Proxy object whose attributes are readonly reactive references to the respective keys in the API response. In practice, you can think of this as `{ data: ref<Array>, meta: ref<Object> }` and you'd use it like this:
```
const { data, meta } = clockvineStore.index()

// You can also use destructuring to use a better variable name than data:
const { data: users, meta } = clockvineStore.index()
```

* `indexAsRef(paramsRef)` - Returns a readonly reactive ref object for the index itself. You probably don't want to use this one, but in practice, you can think of this as `ref<{ data: Array, meta: Object}>`, where you need to get the value of the index before accessing attributes.

* `invalidateIndex(paramsRef)` - Invalidates the cached version of an index. If anything is using the index, a new API request will happen automatically.

* `invalidateAllIndexes()` - invalidates all indexes within the clockvine store.

* `show(idRef)` - Returns a readonly reactive ref object for the element with primary key `idRef`. if `idRef` is reactive, then `idRef` will be a reactive dependency.

* `store(element)` - Stores `element` in the back end and returns a readonly reactive ref object of the new element. Invalidates all cached indexes.

* `update(element)` - Updates `element` in the back end and returns a readonly reactive ref object of the updated element. Invalidates all cached indexes.

* `destroy(element)` - Deletes `element` in the back end and returns the element. Invalidates all cached indexes.

* `invalidate(elementOrIdRef)` - Invalidates the cached version of the element specified. If anything is using this element still, a new API request will happen automatically.

Clockvine is lazy - simply getting a reactive reference to an index or element will not cause any API queries to happen. API queries will happen when the values are used.


### JsonApi

JsonApi implements the back end 'interface' required by Clockvine and encapsulates all communication with the external API. JsonApi is a minimal example based on `fetch()`.

#### Planned Features

* Request Queueing
* Concurrency Management
* Set Request Headers


### JsonSingletonApi

JsonSingletonApi is similar to JsonApi but is meant for API endpoints that only manage a single element (no index or primary keys.) It doesn't work yet.
