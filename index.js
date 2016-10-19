'use strict';

const is = require('is');
const extend = require('extend');

module.exports = class RoleProvider {



	constructor() {
		this._roles = {};
	}




	/**
	 * Define a role-validator
	 * @param  {String} name      role name
	 * @param  {Function} validator
	 * @return {Object}           self
	 */
	define(name, validator) {
		this._roles[name] = validator;

		return this;
	}




	/**
	 * validate a role with given params
	 * @param  {String} name   role name
	 * @param  {Array} params  parameters which will be injected into validator
	 * @return {Promise}       resolves with role-data if role is valid
	 */
	validateRole(name, params) {

		let validator = this._roles[name];

		if (!validator) {
			return Promise.reject(new Error(`Role '${name}' not defined`));
		}

		return Promise.resolve()
			.then(() => validator.apply(null, params))
			.then((res) => {
				if (res === false) {
					return Promise.reject(new Error(`Missing permissions for role '${name}'`));
				}
				return res;
			}, (err) => {
				if (err === false || !(err instanceof Error)) {
					return Promise.reject(new Error(`Missing permissions for role '${name}'`));
				}
				return Promise.reject(err);
			});
	}





	/**
	 * Validates a list of roles. Every validator needs to resolve to succeed.
	 * @param  {Array} roles   list of role-names
	 * @param  {Array} params  parameters which will be injected into each role validator
	 * @return {Promise}       resolves if every validation resolves
	 */
	expectEvery(roles, params) {

		let values = {};

		return roles.reduce((acc, name) =>
				acc.then(() => this.validateRole(name, params).then((res) => values[name] = res)),
				Promise.resolve()
			)
			.then(() => values);

	}




	/**
	 * Validates a list of roles. The first matching role resolves
	 * @param  {Array} roles   list of role-names
	 * @param  {Array} params  parameters which will be injected into each role validator
	 * @return {Promise}       resolves on first role-match
	 */
	expectSome(roles, params) {

		// Copy roles array to avoid config manipulation
		roles = roles.concat([]);

		let values = {};

		if(roles.length) {
			let next = () => {
				return Promise.resolve()
					.then(() => {
						let name = roles.shift();
						return this.validateRole(name, params)
							.then((res) => {
								values[name] = res;
							}, (err) => {
								if(roles.length) {
									return next();
								}
								throw err;
							});
					});
			};
			return next().then(() => values);
		}

		return Promise.resolve(values);
	}






	/**
	 * Validates a list of roles. No role must match
	 * @param  {Array} roles   list of role-names
	 * @param  {Array} params  parameters which will be injected into each role validator
	 * @return {Promise}       rejects on first matching role
	 */
	expectNone(roles, params) {

		return roles.reduce((acc, name) =>
				acc.then(() =>
					this.validateRole(name, params).then(() => Promise.reject(new Error(`Permission for role '${name}' should not be available`)), () => Promise.resolve(true))),
				Promise.resolve()
			)
			.then(() => { return {}; });

	}





	/**
	 * Validates a permissions object agains defined role-validators
	 * @param  {Object} permissions {every,none,some}
	 * @param  {Array} params      	parameters which will be injected into each role validator
	 * @return {Promise}            resolves with role-values if permissions-object matches
	 */
	validate(permissions, params) {

		permissions = this._sanitizePermissions(permissions);

		let promise = Promise.resolve();
		let values = {};


		if(permissions.every) {
			promise = promise.then(() => this.expectEvery(permissions.every, params))
				.then((res) => extend(values, res));
		}

		if(permissions.none) {
			promise = promise.then(() => this.expectNone(permissions.none, params));
		}

		if(permissions.some) {
			promise = promise.then(() => this.expectSome(permissions.some, params))
				.then((res) => extend(values, res));
		}

		return promise.then(() => values);
	}








	/**
	 * Transforms a given value into a valid permissions-object
	 * @param  {String|Array|Object} permissions
	 * @return {Object}              well-formed permissions-object
	 */
	_sanitizePermissions(permissions) {

		if (is.string(permissions)) {
			return {
				every: [permissions]
			};
		}

		if (is.array(permissions)) {
			return {
				every: permissions
			};
		}

		if (is.object(permissions)) {

			if (permissions.every) {

				if (is.object(permissions.every)) {
					throw new Error('Invalid permissions object');
				}

				if (is.string(permissions.every)) {
					permissions.every = [permissions.every];
				}

			}

			return permissions;
		}

		return permissions;
	}

};
