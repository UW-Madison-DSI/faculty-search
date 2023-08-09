/******************************************************************************\
|                                                                              |
|                               contact-view.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the contact us view of the application.                  |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import ContactFormView from '../../views/info/forms/contact-form-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<h1><i class="fa fa-envelope"></i>Contact Us</h1>
		
		<div class="content">
			<p>For answers to questions or to submit comments, please fill out the contact form below: </p>
			<br />
			<div class="panel">
				<div class="contact-form"></div>
			</div>

			<div class="buttons">
				<button class="submit btn btn-primary btn-lg">
					<i class="fa fa-envelope"></i>Submit Question
				</button>
			</div>
		</div>
	`),

	regions: {
		form: '.contact-form'
	},

	events: {
		'click .submit': 'onClickSubmit'
	},

	//
	// rendering methods
	//

	onRender: function() {

		// show child views
		//
		this.showChildView('form', new ContactFormView());
	},

	//
	// mouse event handling methods
	//

	onClickSubmit: function() {
		this.getChildView('form').submit({

			// callbacks
			//
			success: () => {

				// show notification
				//
				application.notify({
					icon: 'fa fa-envelope',
					title: 'Message Sent',
					message: "Your message has been sent. Thank you for your feedback."
				});
			},

			error: () => {

				// show error
				//
				application.error({
					message: "Your message could not be sent."
				});
			}
		});
	}
});
