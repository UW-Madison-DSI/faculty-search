/******************************************************************************\
|                                                                              |
|                                  array-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains some general purpose array handling utilities.          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

//
// querying methods
//

Array.prototype.equals = function(array) {
	if (this.length == array.length) {
		for (let i = 0; i < this.length; i++) {
			if (this[i] != array[i]) {
				return false;
			}
			return true;
		}
	} else {
		return false;
	}
};

Array.prototype.contains = function(item) {
	if (item && item.is) {
		for (let i = 0; i < this.length; i++) {
			if (item.is(this[i])) {
				return true;
			}
		}
		return false;
	} else {
		return this.includes(item);
	}
};

//
// computing methods
//

Array.prototype.max = function() {
	return Math.max.apply(Math, this);
};

Array.prototype.min = function() {
	return Math.min.apply(Math, this);
};

Array.prototype.last = function(offset) {
	return this[this.length - (offset? offset : 0) - 1];
};

//
// modifying methods
//

Array.prototype.removeAt = function(index) {
	return Array.prototype.splice.call(this, index, 1)[0];
};

Array.prototype.insertAt = function(index, item) {
	return Array.prototype.splice.call(this, index, 0, item);
};

Array.prototype.remove = function(item) {
	let index = this.indexOf(item);
	if (index != -1) {
		this.splice(index, 1);
	}
	return this;
};

Array.prototype.removeAll = function(items) {
	let array = this.clone();
	for (let i = 0; i < items.length; i++) {
		array = array.remove(items[i]);
	}
	return array;
};

//
// converting methods
//

Array.prototype.clone = function() {
	return Array.prototype.slice.call(this, 0);
};

Array.prototype.stringify = function(maxItems) {
	if (this.length > 0) {
		if (this.length == 1) {
			return this[0];
		} else if (!maxItems || this.length <= maxItems) {
			return this.slice(0, this.length - 1).join(', ') + ' and ' + 
				this[this.length - 1];
		} else {
			return this.slice(0, maxItems - 1).join(', ') + ' and ' +
				(this.length - maxItems) + ' others';
		}
	}
};

Array.prototype.trim = function() {
	let array = [];
	for (let i = 0; i < this.length; i++) {
		array[i] = this[i].trim();
	}
	return array;
};

Array.prototype.toList = function(separator) {
	// comma separated list by default
	//
	if (separator == undefined) {
		separator = ', ';
	}
	if (this.length > 0) {
		if (this.length > 1) {
			if (this.length > 2) {
				let list = this.slice(0, -1).join(separator);
				list += ' and ' + this[this.length - 1];
				return list;
			} else {
				return this.join(' and ');
			}
		} else {
			return this[0];
		}
	} else {
		return '';
	}
};