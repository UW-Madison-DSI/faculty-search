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
			<img class="logo" src="<%= defaults.footer.image %>" />
			<div class="credits">
				<a href="#"><%= defaults.application.name %></a>, Copyright &copy; <%= defaults.application.year %> <br />
				<a href="<%= defaults.application.author.url %>" target="_blank"><%= defaults.application.author.name %></a>,
				<a href="<%= defaults.application.organization.url %>" target="_blank"><%= defaults.application.organization.name %></a>
			</div>
			<div class="links">
				<% if (defaults.navbar.navs) { %>
					<% let keys = Object.keys(defaults.navbar.navs); %>
					<% for (let i = 0; i < keys.length; i++) { %>
					<% let key = keys[i]; %>
					<% let item = defaults.navbar.navs[key]; %>
					<a href="#<%= key %>">
						<i class="<%= item.icon %>"></i>
						<%= item.text %>
					</a>
					<% if (i < keys.length - 1) { %>
					<span class="separator"> | </span><% } %>
					<% } %>
				<% } %>
			</div>
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
