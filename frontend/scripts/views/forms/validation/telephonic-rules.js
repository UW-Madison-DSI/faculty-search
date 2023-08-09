/******************************************************************************\
|                                                                              |
|                             telephonic-rules.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is collection of form validation rules.                          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Validatable from '../../../views/forms/validation/validatable.js';

Validatable.addRules({

	//
	// form validation rules
	//

	ITUE164Format: {
		method: (value, element) => { 

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			let form = $(element).closest('form');
			let countryCode = form.find('#country-code').val();
			let areaCode = form.find('#area-code').val();
			let phoneNumber = form.find('#phone-number').val();
			let number = countryCode + areaCode + phoneNumber;
			let numberWithoutSymbols = number.replace(/\D/g,'');
			return numberWithoutSymbols.length <= 15;
		},
		message: 'Country + Area + Phone # can\'t be longer than 15 digits'
	},

	usPhoneNumber: {
		method: (value, element) => {

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			let numberWithoutSymbols = value.replace(/\D/g,'');
			return numberWithoutSymbols.length == 7;
		},
		message: 'U.S. phone numbers must be 7 digits long'
	},

	usAreaCode: {
		method: (value, element) => {

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			return value.length == 3;
		},
		message: 'U.S. area codes must be 3 digits long'
	},

	threeDigit: {
		method: (value) => {
			return value.length == 3;
		},
		message: 'Must be 3 digits long'
	},

	fourDigit: {
		method: (value) => {
			return value.length == 4;
		},
		message: 'Must be 4 digits long'
	}
});
