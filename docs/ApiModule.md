Clockvine – ApiModules
======================

## constructor(baseUrl, options = {})

ApiModule, ElementApiModule, and LaravelApiModule classes all have a single required argument, `baseUrl`. Typically this is a string, like `"/api/users"` and it defines the base URL for all API requests for this module.

baseUrl can also be a function for the base ApiModule class, which takes the current parameters as an argument and is expected to return a URL.

ApiModule also supports a number of configuration options:

### idProperty (default "id")

Configure the property used for primary keys for this module elements.


### pageParameter (default "page")

Configure the parameter used to specify which page of results to return when API results are paginated.


### pqueueOptions (default `{concurrency: 2}`)

Configure PQueue, the library used to handle queuing and running concurrent API requests. Clockvine defaults to allowing two requests in parallel but not more.


### actionParameter (default "action")

Configure the parameter which will contain the API action (index/store/update/destroy/show). Usually only used if you're also overriding `baseURL` with a function.


### debounce (default 0)

Set this to a positive number to turn on Clockvine's builtin debouncing for this module. The benefit of using Clockvine's debouncing (besides simplicity) is that the debouncing is tied to the endpoint instead of individual vue components, and can have a consistent debounce timer for all components.


### debounceOptions (default `{}`)

Configure debounce with additional options.


### relatedElements (default `{}`)

Configure special handling for additional elements that are 'nested' within the JSON responses for elements for this endpoint. For example, perhaps your User elements have associated Company elements embedded within the User API responses; you could configure with closures like this:

```javascript
new LaravelApiModule('/api/users', {
  relatedElements: {
    companies: user => ({ elements: user.companies })
  }
})
```

Along with `elements`, your closure's response object can also provide a `params` key that would contain parameters to be passed along for your related elements.


### parseResponse (default `response => response`)

The `parseResponse` configuration option allows you to override the default parsing that Clockvine uses on all API responses with your own function. For example, let's say the API you want to connect to doesn't use a wrapper object with `data`/`meta` attributes but `jobs`/`meta` instead:

```javascript
new LaravelApiModule('/api/users', {
parseResponse: response => {
  response.data.data = response.data.jobs
  return response
}
})
```

parseResponse is passed the HTTP response object and is expected to return a response object with a `.data.data` attribute. Technically you should be able to use this functionality to do even more wild things (like, handle non-JSON responses.)

That said, the default API format that Clockvine uses (the wrapper object with `data`/`meta` attributes) is considered good practice, and is consistent many JSON APIs.
