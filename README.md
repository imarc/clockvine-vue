Clockvine
=========

Clockvine is a JavaScript library that provides some CRUD-like functionality
for collections and models on top of a JSON-based API. Currently it supports
RESTful JSON endpoints, such as those provided by craftcms/element-api.

There is a PHP package,
[imarc/clockvine](https://packagist.org/packages/imarc/clockvine), that's a
middleware designed to normalize responses from Laravel to be compatible, but
that library is currently out of date.

0.4 is currently an **alpha** - we're using the existing functionality, but
there's still additional functionality planned for completion before the next
stable release and backwards-compatibility breaks may be introduced between any
versions.


Exports
-------

Clockvine provides constructors for Vuex modules, constructors for Vue components, and regular Vue components.


**Modules**

* ApiModule (previously vuexModule) - class used to construct Vuex modules that are backed by a RESTful API endpoint.
* ElementApiModule - subclass of ApiModule configured specifically for craftcms/element-api endpoints.

**Components**

* ElementComponent (previously vueMixin) - used for a single element.
* ElementsComponent - used for a collection of elements.
* PaginatedElementsComponent - subclass of ElementsComponent that is built for paginated elements.
* ContinuousElementsComponent - subclass of ElementsComponent that is built for paginated elements displayed as a 'growing list' (Load More buttons, etc) instead of page by page.
* LiveSearch - constructs a Vue component for a live search field.
* PaginationNav - constructors a Vue component for pagination.

**Mixins**

* ResetsPage - Watches a data property (`params`) and resets properties within it (`params.page`) when other properties change.
* SyncsWithUrl - Syncs URL params back and forth with a data property.


Expected API
------------

This package doesn't require that you use imarc/clockvine or laravel, as long
as you build a compatible API.

1. First, all responses are **expected to be JSON**.
2. Second, all responses are expected to be a single object, with
3. the primary content stored the `data` attribute of that object.

The last two requirements are inspired by JSONAPI, and primarily meant to allow
for flexibility in the future.

A clockvine vuexModule requires two arguments, `baseUrl` and `primaryKey`.
Based on these, this is what it expects for the following REST actions.

| Action  | Method | URL Format               | Example URL  |
| ------- | ------ | ------------------------ | ------------ |
| index   | GET    | `baseUrl`                | /api/users   |
| show    | GET    | `baseUrl`/`primary key`  | /api/users/1 |
| store   | POST   | `baseUrl`                | /api/users   |
| update  | PUT    | `baseUrl`/`primary key`  | /api/users/1 |
| destroy | DELETE | `baseUrl`/`primary key`  | /api/users/1 |

### Expected API for ElementApi endpoints

For Element API, the default behavior is slightly different. It's assumed that
`baseUrl` ends with `.json` and that needs to be stripped off. For the table
below, `baseNoSuffix` refers to `baseUrl` with the suffix stripped.

| Action  | Method | URL Format                         | Example URL  |
| ------- | ------ | ---------------------------------- | ------------ |
| index   | GET    | `baseUrl`                          | /api/users   |
| show    | GET    | `baseNoSuffix`/`primary key`.json  | /api/users/1 |
| store   | POST   | `baseUrl`                          | /api/users   |
| update  | PUT    | `baseNoSuffix`/`primary key`.json  | /api/users/1 |
| destroy | DELETE | `baseNoSuffix`/`primary key`.json  | /api/users/1 |


#### INDEX

An index action is a `GET` request to `baseUrl`. The primary content of the
response must be an array of object, with each object representing a single
model for this endpoint.

It's important that each model object here has it's primary key as an attribute, and the name of the primary key field matches `primaryKey`. By default, Clockvine will use "id" for `primaryKey`, and therefore look for a "id" field on each object.

Example response:
```json
{
  "data": [{
    "id": 1,
    "name": "Imarc",
    "email": "info@imarc.com",
    "created_at": "2017-10-27 22:09:36",
    "updated_at": "2017-10-27 22:09:36",
    "phone": null,
    "deleted_at": null,
    "role": "Administrator"
  }, {
    "id": 2,
    "name": "Kevin Hamer",
    "email": "kevin+example@imarc.com",
    "created_at": "2017-10-27 22:09:37",
    "updated_at": "2017-10-27 22:09:37",
    "phone": "978 426 8848",
    "deleted_at": null,
    "role": "User"
  }, {
    "id": 3,
    "name": "First Lastername",
    "email": "fake-person@imarc.com",
    "created_at": "2017-10-27 22:09:37",
    "updated_at": "2017-10-27 22:09:37",
    "phone": null,
    "deleted_at": null,
    "role": "User"
  }],
  "meta": {
    "pagination": {
      "total_pages": 5
    }
  }
}
```


#### SHOW

A show action is a `GET` request to `indexUrl`/`primary key`, where `primary key` is the primary key of the model you'd like to fetch. The primary content of the response should be a single object representing the model you're fetching.

Just as with index actions, it's important that the primary key is defined within the model.

Example response:

```json
{
  "id": 1,
  "name": "Imarc",
  "email": "info@imarc.com",
  "created_at": "2017-10-27 22:09:36",
  "updated_at": "2017-10-27 22:09:36",
  "phone": null,
  "deleted_at": null,
  "role": "Administrator"
}
```


Release Notes
-------------

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
