# role-provider

A `validator` based role-management. Define some role-`validators` and validate `permission`-objects agains them.


[![Build Status](https://travis-ci.org/platdesign/role-provider.svg?branch=master)](https://travis-ci.org/platdesign/role-provider)
[![Current Version](https://img.shields.io/npm/v/role-provider.svg)](https://www.npmjs.com/package/role-provider)



# Install

`npm install --save role-provider`


# Example

```js
const RoleProvider = require('role-provider');

// Create instance
const roles = new RoleProvider();

// Exemplary user object
const user = {
	id: 1,
	active: true,
	confirmedSince: '11-12-2013'
};

// Define role validators
roles.define('active', () => user.active);
roles.define('confirmed', () => user. confirmedSince);

// Validate a permission demand (success)
roles.validate({
	every: ['active', 'confirmed']
}).then((res) => expect(res).to.equal({
	active: true,
	confirmed: '11-12-2013'
}));

// Validate a permission demand (deny)
roles.validate({
	every: ['active'],
	none: ['confirmed']
}).then(() => { throw new Error('Should not resolve'); }, (err) => {
	expect(err).to.be.an.error('Permission for role \'confirmed\' should not be available')
});
```

<br><br><br>


# Api

### `define(role, validator)`

Defines a `validator` on a specific role name.

- `role` Name of role.
- `validator` Function which returns `true` or some other value to confirm permission or `false` to deny. Could also return a Promise which could resolve with `true`, any value or `false`.
  

### `validateRole(role, [params])`

Executes a defined `validator` and returns a promise which resolves with result or rejects if invalid.

- `role` Name of role.
- `params` Optional array of parameters. Will be injected into `validator` function.


### `expectEvery(roles, [params])`

Validates given `roles` and returns a promise which resolves if all validations resolve. In case of first rejection result promise will reject. **Every given `role` needs to be valid.**


- `roles` Array of role names.
- `params` Optional array of parameters. Will be injected into `validator` function.


### `expectSome(roles, [params])`

Validates given `roles` and returns a promise which resolves on the first resolving `validator` result. It will reject if no role `validator` resolves. **At least one of the `roles` needs to be valid.**

- `roles` Array of role names.
- `params` Optional array of parameters. Will be injected into `validator` function.


### `expectNone(roles, [params])`

Validates given `roles` and returns a promise which resolves if no validator resolves. It will reject on first resolving `validator`. **No given `role` needs to be valid.**

- `roles` Array of role names.
- `params` Optional array of parameters. Will be injected into `validator` function.



### `validate(permissions, [params])`

Validates given `permissions`-object and returns promise which resolves if all `permissions` are given.

- `permissions` Object which should be validated.

	- `every` Array of `role`-names which need all to be valid. See [expectEvery](#expecteveryroles-params)
	- `none` Array of `role`-names which must not be valid. See [expectNone](#expectnomeroles-params)
	- `some` Array of `role`-names which should contain at least one valid role. See [exepctSome](#expectsomeroles-params)

- `params` Optional array of parameters. Will be injected into `validator` function.



<br><br><br>


# Author

[@platdesign](https://twitter.com/platdesign)

# License
