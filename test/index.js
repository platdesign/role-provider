'use strict';


const Code = require('code');
const expect = Code.expect;


const RoleProvider = require('../');



describe('unit', () => {

	let roles;
	before(() => roles = new RoleProvider());



	it('should have method: define()', () => expect(roles.define).to.be.a.function());
	it('should have method: validateRole()', () => expect(roles.validateRole).to.be.a.function());
	it('should have method: validate()', () => expect(roles.validate).to.be.a.function());
	it('should have method: expectEvery()', () => expect(roles.expectEvery).to.be.a.function());
	it('should have method: expectSome()', () => expect(roles.expectSome).to.be.a.function());
	it('should have method: expectNone()', () => expect(roles.expectNone).to.be.a.function());
	it('should have method: _sanitizePermissions()', () => expect(roles._sanitizePermissions).to.be.a.function());



	describe('_sanitizePermissions()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());

		it('string -> object with every array', () => {

			let per = roles._sanitizePermissions('a');

			expect(per)
				.to.be.an.object()
				.to.equal({
					every: ['a']
				});

		});


		it('array -> object with every array', () => {

			let per = roles._sanitizePermissions(['a']);

			expect(per)
				.to.be.an.object()
				.to.equal({
					every: ['a']
				});

		});

		it('object -> object', () => {

			let per = roles._sanitizePermissions({
				every: 'a'
			});

			expect(per)
				.to.be.an.object()
				.to.equal({
					every: ['a']
				});

		});

	});



	describe('define()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());

		it('should return self', () => {
			let res = roles.define('test', () => true);

			expect(res).to.shallow.equal(roles);
		});

	});



	describe('validateRole()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());


		it('should resolve with result', () => {

			roles.define('a', () => 1);

			return roles.validateRole('a')
				.then((res) => {
					expect(res).to.equal(1);
				});

		});

		it('should resolve with result (promised)', () => {

			roles.define('a', () => Promise.resolve(1));

			return roles.validateRole('a')
				.then((res) => {
					expect(res).to.equal(1);
				});

		});


		it('should pass params to validator', () => {

			roles.define('a', (a, b, c) => [a, b, c]);

			return roles.validateRole('a', [1, 2, 3])
				.then((res) => {
					expect(res).to.equal([1, 2, 3]);
				});

		});


		it('should reject if result of validator is false', () => {

			roles.define('a', () => false);

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});



		it('should reject if result of validator is false (promise.resolve)', () => {

			roles.define('a', () => Promise.resolve(false));

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});



		it('should reject if result of validator is false (promise.reject)', () => {

			roles.define('a', () => Promise.reject(false));

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});


		it('should reject with default error if result of validator is true (promise.reject)', () => {

			roles.define('a', () => Promise.reject(true));

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});



		it('should reject if result of validator is empty (promise.reject)', () => {

			roles.define('a', () => Promise.reject());

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});



		it('should reject with error if validator rejects an error', () => {

			roles.define('a', () => Promise.reject(new Error('NOPE')));

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('NOPE');
				});

		});


		it('should reject with error if validator throws an error', () => {

			roles.define('a', () => {
				throw new Error('NOPE');
			});

			return roles.validateRole('a')
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('NOPE');
				});

		});

	});



	describe('expectEvery()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());

		it('should pass params into validators', () => {

			roles.define('a', (a) => a);
			roles.define('b', (a) => a);
			roles.define('c', (a) => a);


			return roles.expectEvery(['a', 'b', 'c'], [123])
				.then((res) => expect(res).to.equal({
					a: 123,
					b: 123,
					c: 123
				}));

		});


		it('should resolve', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => 3);


			return roles.expectEvery(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					a: 1,
					b: 2,
					c: 3
				}));

		});


		it('should reject with generated error if a validator returns: false', () => {

			roles.define('a', () => 1);
			roles.define('b', () => false);
			roles.define('c', () => 3);

			return roles.expectEvery(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should nor resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'b\'');
				});

		});


		it('should reject with generated error if a validator resolves with false', () => {

			roles.define('a', () => 1);
			roles.define('b', () => Promise.resolve(false));
			roles.define('c', () => 3);

			return roles.expectEvery(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should nor resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'b\'');
				});

		});



		it('should reject with generated error if a validator rejects with false', () => {

			roles.define('a', () => 1);
			roles.define('b', () => Promise.reject(false));
			roles.define('c', () => 3);

			return roles.expectEvery(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should nor resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'b\'');
				});

		});



		it('should reject with error if a validator throws same error', () => {

			roles.define('a', () => 1);
			roles.define('b', () => {
				throw new Error('NOPE');
			});
			roles.define('c', () => 3);

			return roles.expectEvery(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should nor resolve')), (err) => {
					expect(err).to.be.an.error('NOPE');
				});

		});

	});



	describe('expectSome()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());


		it('should not manipulate input roles array', () => {

			roles.define('a', () => false);
			roles.define('b', () => false);
			roles.define('c', () => 3);

			let rolesArray = ['a', 'b', 'c'];

			return roles.expectSome(rolesArray)
				.then((res) => {

					expect(res).to.equal({
						c: 3
					});

					expect(rolesArray).to.have.length(3);

				});

		});

		it('should pass params into validators', () => {

			roles.define('a', (a) => a);
			roles.define('b', (a) => a);
			roles.define('c', (a) => a);


			return roles.expectSome(['a', 'b', 'c'], [123])
				.then((res) => expect(res).to.equal({
					a: 123
				}));

		});

		it('should resolve with first expected role', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => 3);

			return roles.expectSome(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					a: 1
				}));
		});

		it('should resolve with first expected role', () => {

			roles.define('a', () => false);
			roles.define('b', () => 2);
			roles.define('c', () => 3);

			return roles.expectSome(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					b: 2
				}));
		});


		it('should resolve with first expected role', () => {

			roles.define('a', () => Promise.resolve(false));
			roles.define('b', () => 2);
			roles.define('c', () => 3);

			return roles.expectSome(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					b: 2
				}));
		});


		it('should resolve with first expected role', () => {

			roles.define('a', () => Promise.reject(false));
			roles.define('b', () => 2);
			roles.define('c', () => 3);

			return roles.expectSome(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					b: 2
				}));
		});


		it('should resolve with first expected role', () => {

			roles.define('a', () => Promise.reject(new Error('NOPE')));
			roles.define('b', () => 2);
			roles.define('c', () => 3);

			return roles.expectSome(['a', 'b', 'c'])
				.then((res) => expect(res).to.equal({
					b: 2
				}));
		});


		it('should reject if no role matches', () => {

			roles.define('a', () => Promise.reject(new Error('NOPEB')));
			roles.define('b', () => false);
			roles.define('c', () => {
				throw new Error('NOPEC');
			});

			return roles.expectSome(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('NOPEC');
				});
		});

	});


	describe('expectNone()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());



		it('should resolve', () => {

			roles.define('a', () => false);
			roles.define('b', () => false);
			roles.define('c', () => false);

			return roles.expectNone(['a', 'b', 'c'])
				.then((res) => {
					expect(res).to.equal({});
				});

		});



		it('should reject', () => {

			roles.define('a', () => 1);
			roles.define('b', () => false);
			roles.define('c', () => false);

			return roles.expectNone(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Permission for role \'a\' should not be available');
				});

		});



		it('should reject', () => {

			roles.define('a', () => false);
			roles.define('b', () => 2);
			roles.define('c', () => false);

			return roles.expectNone(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Permission for role \'b\' should not be available');
				});

		});



		it('should reject', () => {

			roles.define('a', () => false);
			roles.define('b', () => false);
			roles.define('c', () => 3);

			return roles.expectNone(['a', 'b', 'c'])
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Permission for role \'c\' should not be available');
				});

		});



	});


	describe('validate()', () => {

		let roles;
		beforeEach(() => roles = new RoleProvider());


		it('should inject params into validators', () => {

			roles.define('a', (a) => a);
			roles.define('b', (a) => a);

			return roles.validate({
					every: ['a'],
					some: ['b']
				}, [2])
				.then((res) => {
					expect(res).to.equal({
						a: 2,
						b: 2
					});
				});

		});


		it('should resolve', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => 3);
			roles.define('d', () => 4);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd']
				})
				.then((res) => {
					expect(res).to.equal({
						a: 1,
						b: 2,
						c: 3
					});
				});

		});


		it('should resolve', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => 4);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd']
				})
				.then((res) => {
					expect(res).to.equal({
						a: 1,
						b: 2,
						d: 4
					});
				});

		});



		it('should reject', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => 4);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c']
				})
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'c\'');
				});

		});



		it('should reject', () => {

			roles.define('a', () => 1);
			roles.define('b', () => false);
			roles.define('c', () => false);
			roles.define('d', () => 4);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd']
				})
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'b\'');
				});

		});



		it('should reject', () => {

			roles.define('a', () => false);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => 4);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd']
				})
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'a\'');
				});

		});



		it('should reject', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => false);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd']
				})
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Missing permissions for role \'d\'');
				});

		});



		it('should resolve', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => 4);
			roles.define('e', () => false);
			roles.define('f', () => false);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd'],
					none: ['e', 'f']
				})
				.then((res) => {
					expect(res).to.equal({
						a: 1,
						b: 2,
						d: 4
					});
				});


		});



		it('should reject', () => {

			roles.define('a', () => 1);
			roles.define('b', () => 2);
			roles.define('c', () => false);
			roles.define('d', () => 4);
			roles.define('e', () => 5);
			roles.define('f', () => false);

			return roles.validate({
					every: ['a', 'b'],
					some: ['c', 'd'],
					none: ['e', 'f']
				})
				.then(() => Promise.reject(new Error('Should not resolve')), (err) => {
					expect(err).to.be.an.error('Permission for role \'e\' should not be available');
				});

		});

	});



});
