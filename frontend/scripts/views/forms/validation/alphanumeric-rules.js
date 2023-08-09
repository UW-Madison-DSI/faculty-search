/******************************************************************************\
|                                                                              |
|                            alphanumeric-rules.js                             |
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

	numericOnly: {
		method: (value, element) => { 

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			return (/^[0-9]+$/.test(value));
		},
		message: 'Please only enter numeric values (0-9)'
	},

	numericOrDashesOnly: {
		method: (value, element) => {

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			return (/^[0-9,-]+$/.test(value));
		},
		message: 'Please only enter numeric values (0-9) or dashes'
	},

	alphaOnly: {
		method: (value, element) => {

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			return (/^[-\sa-zA-Z]+$/.test(value));
		},
		message: 'Please only enter alphabet characters (letters, hyphens, and spaces)'
	},

	alphanumericOnly: {
		method: (value, element) => {

			// allow empty values for optional fields
			//
			if (value == '') {
				return !$(element).hasClass('required');
			}

			return (/^[0-9\sa-zA-Z]+$/.test(value));
		},
		message: 'Please only enter alphabet characters (letters, hyphens, and spaces) or numbers'
	}
});
