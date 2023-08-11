/******************************************************************************\
|                                                                              |
|                                 base-collection.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a base collection and generic utility methods.      |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../library/backbone/backbone.js';

export default Backbone.Collection.extend({

	//
	// querying methods
	//

	contains: function(model) {
		for (let i = 0; i < this.length; i++) {
			if (this.at(i) == model) {
				return true;
			}
		}
		return false;
	},

	indexOf: function(model) {
		for (let i = 0; i < this.length; i++) {
			if (this.at(i) == model) {
				return i;
			}
		}
	},

	includes: function(model) {
		for (let i = 0; i < this.length; i++) {
			if (this.at(i).is(model)) {
				return true;
			}
		}
		return false;
	},

	indexOfValue: function(model) {
		for (let i = 0; i < this.length; i++) {
			if (this.at(i).is(model)) {
				return i;
			}
		}
	},
	
	//
	// getting methods
	//

	getAttributes: function(attribute) {
		let attributes = [];

		this.each((item) => {
			attributes.push(item.get(attribute));
		});

		return attributes;
	},

	getByRange: function(from, to) {

		// create empty collection
		//
		let collection = new this.constructor([], {
			model: this.model,
			comparator: this.comparator
		});

		// get items in specified range
		//
		for (let i = from; i <= to; i++) {
			collection.add(this.at(i));
		}

		return collection;
	},

	getByAttribute: function(attribute, value) {

		// create empty collection
		//
		let collection = new this.constructor([], {
			model: this.model,
			comparator: this.comparator
		});

		this.each((item) => {
			if (item.get(attribute).toLowerCase() == value) {
				collection.add(item);
			}
		});

		return collection;
	},

	getByNotAttribute: function(attribute, value) {

		// create empty collection
		//
		let collection = new this.constructor([], {
			model: this.model,
			comparator: this.comparator
		});

		this.each((item) => {
			if (item.get(attribute).toLowerCase() != value) {
				collection.add(item);
			}
		});

		return collection;
	},

	//
	// converting methods
	//

	toObject: function() {
		let array = [];
		for (let i = 0; i < this.length; i++) {
			array.push(this.at(i).toObject());
		}
		return array;
	},

	//
	// saving methods
	//

	save: function(options) {
		let count = 0, saves = 0, successes = 0, errors = 0;

		function saveItem(model, collection) {
			count++;

			// check if model needs saving
			//
			if (model.isNew() || model.hasChanged()) {
				saves++;
				model.save(undefined, {

					// callbacks
					//
					success: () => {
						successes++;

						// report success when completed
						//
						if (count === collection.length && successes === saves) {
							if (options && options.success) {
								options.success();
							}
						}
					},

					error: () => {
						errors++;

						// report first error
						//
						if (errors === 1) {
							if (options && options.error) {
								options.error();
							}
						}
					}
				});
			} else {

				// report success when completed
				//
				if (count === collection.length && successes === saves) {
					if (options && options.success) {
						options.success();
					}
				}
			}
		}

		// save models individually
		//
		for (let i = 0; i < this.length; i++) {
			saveItem(this.at(i), this);
		}

		// check for no changes
		//
		if (saves === 0) {

			// report success when completed
			//
			if (options && options.success) {
				options.success();
			}
		}
	},
	
	destroy: function(options) {
		let successes = 0, errors = 0, count = this.length;
		let destroyed = [];

		function destroyItem(item, collection) {
			item.destroy({

				// callbacks
				//
				success: (model) => {
					successes++;
					destroyed.push(model);

					// perform callback when complete
					//
					if (successes === count) {
						collection.reset();
						if (options && options.success) {
							options.success(destroyed);
						}
					}
				},

				error: (model, response) => {
					errors++;

					// report first error
					//
					if (errors === 1 && options && options.error) {
						options.error(model, response);
					}
				}
			});
		}

		// destroy models individually
		//
		for (let i = 0; i < count; i++) {
			destroyItem(this.pop(), this);
		}

		// check for no changes
		//
		if (count === 0) {

			// report success when completed
			//
			if (options && options.success) {
				options.success();
			}
		}
	},

	//
	// sorting methods
	//

	sortByAttribute: function(attribute, options) {
		this.reset(this.sortBy((item) => { 
			if (options && options.comparator) {
				return options.comparator(item.get(attribute));
			} else {
				return item.get(attribute);
			}
		}));
		if (options && options.reverse) {
			this.reverse();
		}
	},

	sortedByAttribute: function(attribute, options) {
		let sorted = new this.constructor(this.sortBy((item) => { 
			if (options && options.comparator) {
				return options.comparator(item.get(attribute));
			} else {
				return item.get(attribute);
			}
		}));
		if (options && options.reverse) {
			sorted.reverse();
		}
		return sorted;
	},

	//
	// ordering methods
	//

	reverse: function() {
		let models = this.models;
		this.reset();
		this.add(models.reverse());
	}
});