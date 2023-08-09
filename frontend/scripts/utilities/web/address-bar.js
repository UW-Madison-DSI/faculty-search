/******************************************************************************\
|                                                                              |
|                                address-bar.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file contains some javascript utilities that are used to         |
|        deal with the browser address bar.                                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

function base(address) {
	let index;

	// get address before question mark symbol
	//
	index = address.indexOf('?');
	if (index != -1) {
		address = address.substr(0, index);
	}

	// get location before hash symbol
	//
	index = address.indexOf('#');
	if (index != -1) {
		address = address.substr(0, index);
	}

	return address;
}

function fragment(address) {

	// get address after hash mark symbol
	//
	if (address) {
		let strings = address.split('#');
		return strings[1];
	}
}

export default {

	// valid attributes for querying
	//
	attributes: [
		'location',
		'base',
		'fragment',
		'hash', 
		'host', 
		'hostname', 
		'href', 
		'origin', 
		'pathname', 
		'port', 
		'protocol'
	],

	//
	// getting methods
	//

	get: function(attribute) {
		switch (attribute) {
			case 'location':
				return window.top.location.href;
			case 'base':
				return base(window.top.location.href);
			case 'fragment':
				return fragment(window.top.location.href);
			default:
				return window.top.location[attribute];
		}
	},
	
	//
	// setting methods
	//

	set: function(address) {
		window.history.replaceState(null, '', address);
	},

	push: function(address) {
		window.history.pushState(null, '', address);
	},

	goto: function(address) {
		window.top.location.href = address;
	},

	clear: function(options) {
		if (options && options.silent) {
			this.set('#');
		} else {
			this.goto('#');
		}
	}
};