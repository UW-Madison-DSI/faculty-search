/******************************************************************************\
|                                                                              |
|                                   base-model.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a backbone base model.                        |
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

export default Backbone.Model.extend({

	//
	// querying methods
	//

	is: function(model) {
		if (!model) {
			return false;
		}
		if (this == model) {
			return true;
		}
		let id = this.get(this.idAttribute);
		return id && id == model.get(model.idAttribute);
	},

	hasIndex: function() {
		return this.collection || this.has('index');
	},

	//
	// getting methods
	//

	getClassName: function() {
		if (this.constructor.name) {
			return this.constructor.name;
		} else {
			return 'model';
		}
	},

	getIndex: function() {
		if (this.collection) {
			return this.collection.indexOf(this);
		} else {
			return this.get('index');
		}
	},

	//
	// setting methods
	//

	setIndex: function(index, options) {
		if (this.collection) {
			let collection = this.collection;
			if (this.collection.indexOf(this) !== index) {

				// reorder collection
				//
				collection.remove(this, {
					silent: true
				});
				collection.add(this, {
					at: index,
					silent: true
				});
				if (!options || !options.silent) {
					collection.trigger('change');
				}
			}
		} else {
			this.set({
				index: index,
				silent: options && options.silent
			});
		}
	},

	//
	// converting methods
	//

	toObject: function() {
		return this.attributes;
	},

	//
	// updating methods
	//

	update: function(attributes) {
		for (let key in attributes) {
			let value = attributes[key];
			if (value) {
				this.set(key, value);
			}
		}
	}
});