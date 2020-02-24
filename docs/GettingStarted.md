Clockvine – Getting Started
===========================

```
$ npm install clockvine-vue
```

First up, you'll need to have a JSON-based API. Clockvine has been tested with both craftcms/element-api as well as building endpoints using Laravel's resource controllers, but it should work with any endpoints that are close enough to [the implementation that Clockvine expects.](ExpectedAPI.md)

Assuming you've got that far, next is setting up your Vuex store. Clockvine uses Vuex to cache retrieved elements.

```javascript
import { LaravelApiModule } from 'clockvine-vue'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    users: new LaravelApiModule('/api/users')
  }
})
```

The above defines a Vuex module _users_, that's an instance of a Clockvine ApiModule. ApiModules only have one required argument to their constructor – `baseUrl` – but they also support a configuration object as well.


After this is setup, we can immediately jump into using Clockvine's components. There's a lot of ways to use Clockvine's components, but here's the most sugar-y way:

```javascript
import { CollectionComponent } from 'clockvine-vue';

new Vue({
  el: '#app',
  store,
  components: {
    users: CollectionComponent.for('users')
  }
})
```

This defines the component `<users>` within Vue and associates with the ApiModule _users_. In the template, we can use it like this:

```vue
<users v-slot="{ users }">
  <div class="users">
    <div class="user" v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</users>
```

Alternatively, here's how to use CollectionComponent directly:

```javascript
new Vue({
  el: '#app',
  store,
  components: {
    CollectionComponent
  }
})
```

and the template:

```
<collection-component vuex-module="users" v-slot="{ elements: users }">
  <div class="users">
    <div class="user" v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</collection-component>
```
