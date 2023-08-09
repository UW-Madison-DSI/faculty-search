/******************************************************************************\
|                                                                              |
|                             contact-form-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the contact us form of the application.                  |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Contact from '../../../models/utilities/contact.js';
import FormView from '../../../views/forms/form-view.js';

export default FormView.extend({

	//
	// attributes
	//

	className: 'form-horizontal wide',

	template: _.template(`
		<div class="name form-group">
			<label class="control-label"><i class="fa fa-font"></i>Name</label>
			<div class="controls">
				<div class="input-group">
					<input type="text" class="form-control" />
					<div class="input-group-addon">
						<i class="active fa fa-question-circle" data-toggle="popover" title="Name" data-content="This is your (real) name."></i>
					</div>
				</div>
			</div>
		</div>
		
		<div class="email form-group">
			<label class="control-label"><i class="fa fa-envelope"></i>Email</label>
			<div class="controls">
				<div class="input-group">
					<input type="email" class="form-control" />
					<div class="input-group-addon">
						<i class="active fa fa-question-circle" data-toggle="popover" title="Email" data-content="This is your email, if you'd like us to respond to your request or inquiry."></i>
					</div>
				</div>
			</div>
		</div>
		
		<div class="subject form-group">
			<label class="control-label"><i class="fa fa-info-circle"></i>Subject</label>
			<div class="controls">
				<select>
					<% for (let i = 0; i < subjects.length; i++) { %>
					<option><%= subjects[i] %></option>
					<% } %>
				</select>
		
				<i class="active fa fa-question-circle" data-toggle="popover" title="Subject" data-content="This is the subject of your message."></i>
			</div>
		</div>
		
		<div class="message wide form-group">
			<label class="required control-label"><i class="fa fa-quote-left"></i>Message</label>
			<div class="controls">
				<div class="input-group">
					<textarea class="required form-control" rows="10"></textarea>
		
					<div class="input-group-addon">
						<i class="active fa fa-question-circle" data-toggle="popover" title="Message" data-content="This is the message to send."></i>
					</div>
				</div>
			</div>
		</div>
		
		<div class="notes">
			<span class="required"></span>Fields are required
		</div>
	`),

	popover_container: 'body',

	//
	// constructor
	//

	initialize: function() {
		this.model = new Contact();
	},

	//
	// form methods
	//

	getValue: function(key) {
		switch (key) {
			case 'name':
				return this.$el.find('.name input').val();
			case 'email':
				return this.$el.find('.email input').val();
			case 'subject':
				return this.$el.find('.subject option:selected').text();
			case 'message':
				return this.$el.find('.message textarea').val();
		}
	},

	getValues: function() {
		return {
			name: this.getValue('name'),
			email: this.getValue('email'),
			subject: this.getValue('subject'),
			message: this.getValue('message')
		};
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			subjects: defaults.contact.subjects
		};
	}
});