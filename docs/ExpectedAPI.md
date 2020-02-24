Clockvine – Expected API
========================

Clockvine will work for you as long as your API is compatible with the following details. This spec is meant to be fairly generic, works with both craftcms/element-api and Laravel, and is less strict than the JSONAPI spec.

1. First, all responses are **expected to be JSON**.
2. Second, all responses are expected to be a single object, with
3. the primary content stored the `data` attribute of that object.

The last two requirements are inspired by JSONAPI, and primarily meant to allow for flexibility in the future.


Expected Endpoints
------------------

A clockvine ApiModule requires two arguments, `baseUrl` and `idProperty`. Based on these, this is what it expects for the following REST actions.

| Action  | Method | URL Format               | Example URL  |
| ------- | ------ | ------------------------ | ------------ |
| index   | GET    | `baseUrl`                | /api/users   |
| show    | GET    | `baseUrl`/`id`           | /api/users/1 |
| store   | POST   | `baseUrl`                | /api/users   |
| update  | PUT    | `baseUrl`/`id`           | /api/users/1 |
| destroy | DELETE | `baseUrl`/`id`           | /api/users/1 |


### Expected Endpoints for ElementAPI

For Element API, the default behavior is slightly different. It's assumed that `baseUrl` ends with `.json` and that needs to be stripped off. For the table below, `baseNoSuffix` refers to `baseUrl` with the suffix stripped.

| Action  | Method | URL Format                         | Example URL  |
| ------- | ------ | ---------------------------------- | ------------ |
| index   | GET    | `baseUrl`                          | /api/users   |
| show    | GET    | `baseNoSuffix`/`id`.json           | /api/users/1 |
| store   | POST   | `baseUrl`                          | /api/users   |
| update  | PUT    | `baseNoSuffix`/`id`.json           | /api/users/1 |
| destroy | DELETE | `baseNoSuffix`/`id`.json           | /api/users/1 |


### Custom Endpoints

Clockvine also supports customizing the URL formats further, also the actions and methods can't be. The `baseUrl` argument to the ApiModule constructor can be a function, that is passed all parameters, as well as the action as the configurable `actionParameter` (default "action".)


### Endpoint Actions

#### INDEX

An index action is a `GET` request to `baseUrl`. The primary content of the
response must be an array of object, with each object representing a single
model for this endpoint.

It's important that each model object here has it's primary key as an attribute, and the name of the primary key field matches `idProperty`. By default, Clockvine will use "id" for `idProperty`, and therefore look for a "id" field on each object.

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

A show action is a `GET` request to `baseUrl`/`primary key`, where `primary key` is the primary key of the model you'd like to fetch. The primary content of the response should be a single object representing the model you're fetching.

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


#### STORE

A store action is a `POST` request to `baseUrl` with a payload of just a plain javascript object to store as a new element. The primary content of the response should be the successfully stored element, along with any other properties populated that are normally passed in the API.

Example POST:

```json
{
  "name": "Amesbury",
  "email": "amesbury@imarc.com"
}
```

Example response:

```json
{
  "id": 2,
  "name": "Amesbury",
  "email": "amesbury@imarc.com",
  "created_at": "2020-02-24 22:09:36",
  "updated_at": "2020-02-24 22:09:36",
  "phone": null,
  "deleted_at": null,
  "role": "User"
}
```


#### UPDATE

An update action is a `PUT` request to `baseUrl`/`primary key`, where `primary key` is the primary key of the model you'd like to update. The payload should be an updated element object, although the object does not need to be complete.


#### DESTROY

Finally, a destroy action is a `DELETE` request to `baseUrl`/`primary key`, where `primay key` is the primary key of the model you'd like to delete.




Release Notes
-------------

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
