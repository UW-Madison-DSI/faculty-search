/******************************************************************************\
|                                                                              |
|                                container.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a base class for containing child views.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../utilities/scripting/array-utils.js';

//
// constructor
//

function Container(items) {
	return items;
}

Container.prototype = _.extend({}, Array.prototype, {

	//
	// querying methods
	//

	isEmpty: function() {
		return this.length == 0;
	},

	first: function() {
		return this[0];
	},

	last: function() {
		return this[this.length - 1];
	},

	findByIndex: function(index) {
		return this[index];
	},

	filter: function(isIncluded) {
		let items = [];
		for (let i = 0; i < this.length; i++) {
			let item = this[i];
			if (isIncluded(item)) {
				items.push(item);
			}
		}
		return items;
	},

	//
	// methods
	//

	add: function(item) {
		Array.prototype.push.call(this, item);
	},

	remove: function(item) {
		// remove children
		//
		if (item.children) {
			for (let i = 0; i < item.children.length; i++) {
				this.remove(item.children.findByIndex(i));
			}
		}
		let index = Array.prototype.indexOf.call(this, item);
		return Array.prototype.splice.call(this, index, 1);
	},

	each: function(callback) {
		for (let i = 0; i < this.length; i++) {
			if (callback(this[i]) == false) {
				break;
			}
		}
	}
});

export default Container;