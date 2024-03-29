Clockvine – CollectionComponent
===============================

CollectionComponent is a renderless component meant to be used for a collection of elements. It makes sense for lists, grids and such.


## Using CollectionComponent

The way CollectionComponent works mirrors [ElementComponent](ElementComponent.md). Here's an example using it as a renderless component:

```vue
<collection-component vuex-module="newsArticles" v-slot="{ elements }">
  <div>
    <article v-for="article in elements" :key="article.id">
      ...
    </article>
  </div>
</collection-component>
```

You can also use it as a mixin to one of your own components.


## Nicer Ways to use CollectionComponent

### CollectionComponent.for

The sugariest way to use CollectionComponent is to use `CollectionComponent.for`, a factory method that returns a preconfigured instance of CollectionComponent:

```javascript
components: {
  featuredArticles: CollectionComponent.for('newsArticles')
}
```

The above makes `<featured-articles>` an instance of CollectionComponent that's associated with the `newsArticles` ApiModule (in Vuex) and adds `newsArticles` to the slot scope properties that references the associated elements. In other words, these two are equivalent:

```vue
<featured-articles v-slot="{ newsArticles }">
  ...
</featured-articles>

<collection-component vuex-module="newsArticles" v-slot="{ elements: newsArticles }">
  ...
</collection-component>
```


### CollectionComponent.with

`CollectionComponent.with` is another sugar method for using Clockvine's withHelper with CollectionComponent. For example, let's say I wanted my `<featured-articles>` component to always have the params as `{ featured: true }`:

```
{
  featuredArticles: CollectionComponent.with({
    vuexModule: 'newsArticles',
    params: { featured: true },
    slotParams() {
      return { featuredArticles: this.elements }
    }
  })
}
```

Then these two are equivalent:

```vue
<featured-articles v-slot="{ featuredArticles }">
  ...
</featured-articles>

<collection-component vuex-module="newsArticles" :params="{ featured: true }" v-slot="{ elements: newsArticles }">
  ...
</collection-component>
```


## API

### Props
#### vuexModule

Required; configures the associated Clockvine vuex module (ApiModule).


#### params

Specify parameters for URL building for the associated elements.


#### ignoreParams

Configure parameters to ignore within the `params` object. Both the key and value need to match. This allows for stripping out default parameters from URLs. If the value is a function, then Clockvine will call that function with the current value to determine whether or not to strip out that parameter.


#### requireParams (default false)

If set, no elements will be fetched unless there's at least one non-ignored parameter. Useful for search-result-like pages.


### Methods

#### query

Fetch elements!

### Slot Scope Properties

#### elements

Associated elements.

#### isLoading

Boolean flag, whether elements are being fetched. Useful for loaders. When this flag changes, the component also `$emit`s a 'is-loading' event with the new value.

#### meta

Meta information directly from the API response.


#### query

The search query itself for convenience.
