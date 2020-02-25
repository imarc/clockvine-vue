Decorated Element Methods
=========================

Beyond the methods provided by ElementComponent and CollectionComponent, Clockvine also decorates all indexes and elements returned by APIs before they're returned or stored in Vuex. It adds a handful of non-enumerable methods and properties. Because they're non-enumerable, they won't show up when interating and only occasionally show within Vue's dev tools.

These can be useful for snippets like this:

```vue
<input type="text" v-model="someUser.name" />
<button @click="someUser.$update">Save</button>
```

Methods
-------

### $index / $mustIndex (indexes only)

Equivalent to dispatching an index action to this indexes ApiModule. `$mustIndex` is the same except it sets the flag to tell the ApiModule to bypass the cache.


### $show / $mustShow (elements only)

Equivalent to dispatching a show action to this elements ApiModule. `$mustShow` is the same except it sets the flag to tell the ApiModule to bypass the cache.


### $store

Store this element as a new element.


### $update

Update this element back to the API.


### $destroy

Delete this element via the API.


Properties
----------

### $exists

A boolean that specifies whether this is an existing element.


### $params

An object that contains the parameters (typically URL parameters) that were
associated with this element when it was retrieved.
