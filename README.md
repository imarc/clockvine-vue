Clockvine
=========

This is a vue package meant to be paired with [imarc/clockvine](https://packagist.org/packages/imarc/clockvine), a tiny PHP lib for Laravel.

This is **enormously a work in progress** - it's a long ways from being ready to be adopted outside of Imarc.

Overview
--------

Clockvine-vue is an opinionated library that handles communicating between a RESTful API for CRUD actions and Vuex.

It has two main pieces – vuexModule and vueMixin. For each API endpoint (controller) you should instantiate a vuexModule and add it to your vuex store.

Each vue component that you'd like to communicate with these vuexModules should include vueMixin (or editableVueMixin) as a mixin.


Expected API
------------

This package doesn't require that you use imarc/clockvine or laravel, as long
as you build a compatible API.

1. First, all responses are **expected to be JSON**.
2. Second, all responses are expected to be a single object, with
3. the primary content stored the `data` attribute of that object.

The last two requirements are inspired by JSONAPI, and primarily meant to allow
for flexibility in the future.

A clockvine vuexModule requires two arguments, `indexUrl` and `primaryKey`.
Based on these, this is what it expects for the following REST actions.

| Action  | Method | URL Format              | Example URL  |
| ------- | ------ | ----------------------- | ------------ |
| index   | GET    | `indexUrl`              | /api/users   |
| show    | GET    | `indexUrl`/`primary key` | /api/users/1 |
| store   | POST   | `indexUrl`              | /api/users   |
| update  | PUT    | `indexUrl`/`primary key` | /api/users/1 |
| destroy | DELETE | `indexUrl`/`primary key` | /api/users/1 |

#### INDEX

An index action is a `GET` request to `indexUrl`. The primary content of the
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
  }]
}
```


#### SHOW

A show action is a `GET` request to `indexUrl`/`primary key`, where `primary key` is the primary key of the model you'd like to fetch. The primary content of the response should be a single object representing the model you're fetching.

Just as with index actions, it's important that the primary key is defined within the model.

Example response:

```json
{
  "data": {
    "id": 1,
    "name": "Imarc",
    "email": "info@imarc.com",
    "created_at": "2017-10-27 22:09:36",
    "updated_at": "2017-10-27 22:09:36",
    "phone": null,
    "deleted_at": null,
    "role": "Administrator"
  }
}

```

#### STORE

A store action is a `POST` request to `indexUrl`. This is used to store new models. All of the attributes of the model object within Vue are sent as parameters. Typically, no value for a primary key is sent, but that's only convention - you could have users or vue specify the primary key and send it along as long as your API supports that.

The response back is the same as a show action for the new model and should have at least the primary key filled in.


#### UPDATE

An update action is a `PUT` request to `indexUrl`/`primary key`, where `primary key` is the primary key of the model you'd like to update. Like store, all of the attributes of the model object are sent as parameters to the API.

**Note:** the primary key within the model object and within the URL may be different. This happens when trying to change the primary key. Serverside, you should always use the primary key *within the URL* to determine which model to update, and the value within the parameters as the desired new value for the primary key.

The response back is the same as a show action for the model and should reflect the updated attributes.


#### DESTROY

A destroy action is a `DELETE` request to `indexUrl`/`primary key`, where `primary key` is the primary key of the the model you'd like to delete. No additional parameters are necessarily sent.

The response back is the same as a show or update action for the deleted model.


## vuexModule

Each CRUD endpoint for your API should have it's own vuexModule.

### constructor(indexUrl, primaryKey='id', concurrency=8)

**indexUrl** is the base URL for this endpoint. indexUrl can also contain placeholders, surronded by {}, that can be populated by passing params when dispatching actions. For example,

```javascript
// When instantiating the vuexModule -

let categories = new vuexModule('/api/teams/{team}/categories');

// When dispatching vuex actions from within a component -

this.$store.dispatch('categories/index', {team: 4});
```

Lastly, there is untested support for passing in a function instead of a string for indexUrl as well. This function is passed two arguments, `action` and `params`, where action is the action dispatched (index, show, etc.) and params are simply the params that were originally dispatched.

**primaryKey** let's you specify whether you'd like to use a different field than "id" for as your primary key. (Clockvine doesn't support multi-field primary keys directly, but it may be possible to emulate this behavior by using a generated primary key that clockvine can use to communicate with the API.)

**concurrency** (0.3 only) let's you specify how many requests to run in concurrently. In 0.2, only one request per endpoint is run at a time, but 0.3 supports running multiple. It defaults to 8.


### Overrideable Methods

The following methods can be overloaded after instantiating a vuexModule.

#### indexUrl

Overloading this method is the same as passing in a function for indexUrl in the constructor.


#### getters.indexLoaded

This is called internally to determine whether or not to ignore a request. It takes one argument, `url`, which is the URL of the index it's checking. If you want to always fetch data (no caching), you can override this like this:

```js
someModule.getters.indexLoaded = () => false;
```



## vueMixin



## editableVueMixin


Release Notes
-------------

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
