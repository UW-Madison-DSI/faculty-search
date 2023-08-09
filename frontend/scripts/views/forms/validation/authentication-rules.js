/******************************************************************************\
|                                                                              |
|                          authentication-rules.js                             |
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
import '../../../utilities/security/password-policy.js';

Validatable.addRules({

	//
	// form validation rules
	//

	username: {
		method: (value) => { 
			return typeof(value) == 'string' && /^[\u0040-\u1FE0\u2C00-\uFFC00-9 ._-]+$/i.test(value);
		},
		message: 'Usernames must contain only letters and numbers, the period, underscore, and hyphen.'
	},

	passwordStrongEnough: {
		method: (value, element) => {
			if ($(element).attr('name') == 'confirm-password') {
				return true;
			}
			let form = $(element).closest('form');
			let username = form.find('[name="username"]').val();
			let rating = $.validator.passwordRating(value, username);
			return (rating.messageKey === 'strong');
		},
		message: "Your password must be stronger."
	},

	uwEmail: {
		method: (value) => {
			return value.endsWith('@wisc.edu');
		},
		message: "Your may only use your UW email address."
	},

	passwordMetered: {
		method: (value, element) => {
			if ($(element).attr('name') == 'confirm-password') {
				return true;
			}
			let form = $(element).closest('form');
			let username = form.find('[name="username"]').val();
			let rating = $.validator.passwordRating(value, username);

			// update meter
			//
			let meter = form.find('.password-meter', element.form);
			meter.show();
			meter.find('.password-meter-bar').removeClass().addClass('password-meter-bar')
				.addClass('password-meter-' + rating.messageKey);
			meter.find('.password-meter-message').removeClass().addClass('password-meter-message')
				.addClass('password-meter-message-' + rating.messageKey)
				.text($.validator.passwordRating.messages[rating.messageKey]);

			return (rating.messageKey === 'strong');
		},
		message: "Your password must be stronger."
	}
});
