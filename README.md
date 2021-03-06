Clockvine
=========

Clockvine is a JavaScript library that provides some CRUD-like functionality for elements and collections on top of a JSON-based API. Currently it supports RESTful JSON endpoints, such as those provided by craftcms/element-api or easily built with Laravel's resource controllers.

There is a PHP package, [imarc/clockvine](https://packagist.org/packages/imarc/clockvine), that's a middleware designed to normalize responses from Laravel to be compatible, but that library is deprecated and unnecessary.

0.4 is **out of beta**, but still young - we're using the existing functionality, but it hasn't quite hit the stability we'd associate with a 1.0 release. Any backwards compatibility breaks are being documented in the release notes, and we're following semver.

Docs
----

* [Expected API](docs/ExpectedAPI.md)
* [Getting Started](docs/GettingStarted.md)
* [ApiModule](docs/ApiModule.md)
* [ElementComponent](docs/ElementComponent.md)
* [CollectionComponent](docs/CollectionComponent.md)
* [Decorated Element Methods](docs/DecoratedElementMethods.md)


Exports
-------

Clockvine provides constructors for Vuex modules, constructors for Vue components, and regular Vue components.


**[Modules](docs/ApiModule.md)**

* ApiModule (previously vuexModule) - class used to construct Vuex modules that are backed by a RESTful API endpoint.
* ElementApiModule - subclass of ApiModule configured specifically for craftcms/element-api endpoints.

**Components**

* [ElementComponent](docs/ElementComponent.md) - used for a single element.
* [CollectionComponent](docs/CollectionComponent.dm) (previously ElementsCompononet) - used for a collection of elements.
* PaginatedCollectionComponent - subclass of CollectionComponent that is built for paginated elements.
* ContinuousCollectionComponent - subclass of CollectionComponent that is built for paginated elements displayed as a 'growing list' (Load More buttons, etc) instead of page by page.
* LiveSearch - constructs a Vue component for a live search field.
* PaginationNav - constructors a Vue component for pagination.

**Mixins**

* ResetsPage - Watches a data property (`params`) and resets properties within it (`params.page`) when other properties change.
* SyncsWithUrl - Syncs URL params back and forth with a data property.




Release Notes
-------------

### 0.9.1

* Added as commonjs built file as well.

### 0.9.0

Clockvine now builds as a ESM module, thanks to switching from Webpack to Rollup. The version produced should be much easier to use in projects where you need IE11 compatibility now.

* Change build from webpack to rollup
* Switch to standard for code formattting

### 0.8.0

* Package clockvine using purtuga/esm-webpack-plugin

### 0.7.2

* Fix critical bug with calling $update multiple times on the same element

### 0.7.1

* Fix bug with indexes

### 0.7.0

* Add support for parseResponse, a hook that can be used to make clockvine work with APIs that don't match the format clockvine expects.

### 0.6.0

* Don't use this version.

### 0.5.0

* Major cleanup to how parameters are handled within URL generation; separation into params/availableParams
* Add parseResponse configuration option

### 0.4.4

* Critical fix for debouncing functionality

### 0.4.3

* Critical fix for subsequent shows after updates

### 0.4.2

* Critical fix for PaginatedCollectionComponent

### 0.4.0

This has backwards compatibility breaks with beta.1.

* Change store and update actions to accept a payload of `{ params, data }`
  instead of just `data`.
* Make sure elements are decorated even when using `no-fetching`.
* Add a new configuration option to ApiModules, `relatedElements`, to configure
  decorating and updating vuex with elements that are embedded within a
  response. For example, child elements.
* Rename ElementsComponent to CollectionComponent and related. Old names are
* deprecated but will continue to work for now.

### 0.4.0-beta.2

This has backwards compatibility breaks with beta.1.

* Change store and update actions to accept a payload of `{ params, data }`
  instead of just `data`.
* Make sure elements are decorated even when using `no-fetching`.
* Add a new configuration option to ApiModules, `relatedElements`, to configure
  decorating and updating vuex with elements that are embedded within a
  response. For example, child elements.
* Rename ElementsComponent to CollectionComponent and related. Old names are
* deprecated but will continue to work for now.

### 0.4.0-beta.1

* Add support for passing `params` to ElementComponent

### 0.4.0-alpha.13

This has backwards compatibility breaks with alpha.12.

* Fix issue so that you can `import { ElementComponent} from 'clockvine-vue'`
  now instead of having to import the whole object every time.
* Add ElementComponent.with, ElementComponent.for, ElementsComponent.with, ElementsComponent.for
* Add debouncing in between vuex events and API requests for store, update, and index calls
* Add support a pseudo template string format to LaraevlApiModule (may change more)

### 0.4.0-alpha.12

* Fix bug with isLoading events

### 0.4.0-alpha.11

* Fix bug with .store promise

### 0.4.0-alpha.10

* Add require-params prop

### 0.4.0-alpha.8

This has backwards compatibility breaks with alpha.7.

* Change implementation to decoate elements (objects) returned by clockvine with methods/properties. These include `$show`, `$mustShow`, `$update`, `$store`, `$destroy`, `$index`, `$mustIndex`, and `$exists` for different objects.
* Add `syncsWithUrl` property to disable URL syncing for ElementsComponent.

### 0.4.0-alpha.7

* Add functionality to 'clear out' data using `newElement` after triggering a `store`

### 0.4.0-alpha.6

This has backwards compatibility breaks with alpha.5.

* Rework Vue Components so they're no longer JS classes. This was necessary because there were assumptions made about how instances work that were wrong.
* Make store/update/destroy work.

### 0.4.0-alpha.5

* Make it so that vuex module can be passed as a param

### 0.4.0-alpha.4

* Add LaravelApiModule
* Bug fixes for LiveSearch and SyncsWithUrl

### 0.4.0-alpha.3

This has backwards compatibility breaks with alpha.2.

* Bug fixes and adopting airbnb and vue style guide conventions
* Rename nearly all classes and mixins for clarity and consistency


### 0.4.0-alpha.2

This has backwards compatibility breaks with 0.3.

* Read only functionality is mostly complete; tested primarily with ElementApi.


### 0.3

This has backwards compatibility breaks with 0.2.

* This version makes some significant internal architecture changes, switching
  to storing indices (collections) by URL along with individual models within
  Vuex.
* It also changes how urlParams should be passed, and flatted more of these
  params together.
* Also significant, you can provide a function to override indexUrl in
  vuexModules so that, based on action and params, you can use a different
  endpoint.


### 0.2

You should at least use this version, because I don't think 0.1 even worked.

#### 0.2.12

* Added support for simple pagination. These changes are not available in 0.3 yet.
