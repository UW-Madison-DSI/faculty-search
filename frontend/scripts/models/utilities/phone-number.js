/******************************************************************************\
|                                                                              |
|                                 phone-number.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an international phone number.                |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseModel from '../base-model.js';

export default BaseModel.extend({

	//
	// attributes
	//

	defaults: {
		'country-code': undefined,
		'area-code': undefined,
		'phone-number': undefined
	},

	//
	// query methods
	//

	hasAttributes: function() {
		for (let attribute in this.attributes) {
			if (this.has(attribute)) {
				return true;
			}
		}
		return false;
	},

	//
	// overridden Backbone methods
	//

	initialize: function(attributes) {
		if (attributes) {
			this.set({
				'country-code': attributes['country-code'],
				'area-code': attributes['area-code'],
				'phone-number': attributes['phone-number']
			});
		}
	},

	toString: function() {
		if (this.has('country-code') || this.has('area-code')) {
			let countryCode = this.get('country-code') || '';
			let areaCode = this.get('area-code') || '';
			let phoneNumber = this.get('phone-number') || '';

			// concatenate into string
			//
			return countryCode + ' ' + areaCode + ' ' + phoneNumber;
		} else {
			return this.get('phone-number');
		}
	},

	parse: function(response) {
		if (response && typeof(response) === 'string') {
			let substrings = response.split(' ');
			if (substrings.length >= 3) {
				return {
					'country-code': (substrings[0] != '' ? substrings[0] : undefined),
					'area-code': (substrings[1] != '' ? substrings[1] : undefined),
					'phone-number': (substrings[2] != '' ? substrings[2] : undefined)
				};
			} else {
				return {
					'phone-number': (substrings[0] != '' ? substrings[0] : undefined)
				};
			}
		} else {
			return response
		}
	}
});