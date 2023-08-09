/******************************************************************************\
|                                                                              |
|                                 footer-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application footer and associated content.           |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import CreditsDialogView from '../../views/dialogs/credits-dialog-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="container">
			<a href="<%= defaults.application.organization.url%>" target="_blank"><img class="logo" src="<%= defaults.footer.image %>" /></a>
			<p>
				<%= defaults.application.name %>, Copyright &copy; <%= defaults.application.year %> <br />
				<a href="<%= defaults.application.author.url %>" target="_blank"><%= defaults.application.author.name %></a>,
				<a href="<%= defaults.application.organization.url %>" target="_blank"><%= defaults.application.organization.name %></a>
			</p>
		</div>
	`),

	events: {
		'click #credits': 'onClickCredits'
	},

	//
	// mouse event handling methods
	//

	onClickCredits: function() {
		application.show(new CreditsDialogView());
	}
});
