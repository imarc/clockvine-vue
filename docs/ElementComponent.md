Clockvine – ElementComponent
============================

ElementComponent is a renderless component meant to be used with a single Element. It's best used for elements that need to be displayed, updated, and deleted from the front end.

## Using ElementComponent

Please read through the nicer ways to use ElementComonent as well, but the most basic way to use ElementComponent is as a renderless component;

```vue
<element-component vuex-module="someModule" v-slot="{ element }">
    <div>Hello, {{ element.name }}!</div>
</element-component>
```

You can also use it as a mixin:

```
<template>
  <div>Hello, {{ element.name }}!</div>
</template>
<script>
import { ElementComponent } from 'clockvine-vue'

export default {
  mixins: [ ElementComponent ]
}
```


## Nicer Ways to use ElementComponent

### ElementComponent.for

The sugariest way to use ElementComponent is to use `ElementComponent.for`, a factory method that returns an preconfigured instance of ElementComponent:

```javascript
components: {
  exampleThing: ElementComponent.for('someThings')
}
```

The above example makes `<example-thing>` an instance of ElementComponent that's associated with the `someThings` ApiModule (in Vuex) and adds `someThing` to the slot scope properties that references the associated element. In other words, these two are equivalent:

```vue
<example-thing id="3" v-slot="{ someThing }">
  <div>{{ someThing.name }}</div>
</example-thing>

<element-component vuex-module="someThings" v-slot="{ element: someThing }">
  <div>{{ someThing.name }}</div>
</element-component>
```

And you can use `ElementComponent.for` as a mixin too:

```vue
export default {
  mixins: [
    ElementComponent.for('someThings')
  ]
}
```


### ElementComponent.with

`ElementComponent.with` is another sugar method for using Clockvine's withHelper with elementCopmonent for a nicer way to quickly create Elements on the fly. It's mostly useful if you need to override ElementComponent's props or computed properties in a way that you can't using it as a mixin.


## API

### Props

#### vuexModule

Required; configures the associated Clockvine vuex module (ApiModule).


#### params (default `{}`)

Specify parameters for URL building for the associated element.


#### id

The primary key for the associated element.


#### noFetching (default: false)

Disables fetching the associated element if it hasn't been fetched yet. You can use this to delay loading elements.


#### newElement

A function that returns a new object to serve as a new element. This is called if this component is loaded without an id or after storing a new element to reset this element.

### Methods

#### show

Fetch the associated element.


#### store

Stores the associated element as a new element.


#### update

Updates the associated element.


#### destroy

Deletes the associated element.


### Slot Scope Properties

#### element (Object)

The associated element. You can use JavaScript's destructuring to change this element too:

```vue
<element-component v-slot="{ element: somethingElse }">
  <div>{{ somethingElse.name }}</div>
</element-component>

<!-- or even the nested destructuring: -->

<element-component v-slot="{ element: { name } }">
  <div>{{ name }}</div>
</element-component>
```

#### isLoading (Boolean)

Boolean flag, whether this element is being fetched. Useful for loaders. When this flag changes, the component also `$emit`s a 'isLoading' event with the new value.

#### error (Object)

The current error object, if there was one fetching data from the API, false otherwise.

#### hasError (Boolean)

A sugar version of `error` - literally just `Boolean(this.error)` under the hood.


### show (Function)

The `show` method exposed to the slot. You could use this, but you likely want `refresh`.

#### store (Function)

The `store` method exposed to the slot.

#### update (Function)

The `update` method exposed to the slot.

#### destroy (Function)

The `destroy` method exposed to the slot.

#### refresh (Function)

A sugar method that calls show with `mustGet` set `true`. Useful to refresh this component from the API.


### Events

#### isLoading

Fired (with a payload of true) when starting to fetch data and again (with a payload of false) when it's done.

#### error

Fired if there's an error returned trying to fetch from the API. The payload for this event is an object containing all the slot scope properties above, so that you can access `error` to get details or do fancier things like retry.
