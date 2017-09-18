Clockvine
=========

This is a vue package meant to be paired with [imarc/clockvine](https://packagist.org/packages/imarc/clockvine), a tiny PHP lib for Laravel.

This is **enormously a work in progress** - it's a long ways from being ready to be adopted outside of Imarc.


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
