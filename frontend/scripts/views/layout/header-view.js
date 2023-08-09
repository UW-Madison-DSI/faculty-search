/******************************************************************************\
|                                                                              |
|                                 header-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application header and associated content.           |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="navbar navbar-default navbar-fixed-top navbar-inverse">

			<a id="brand" href="#" id="brand" class="active navbar-brand">
				<img class="icon" src="<%= defaults.navbar.icon %>" />
				<div class="title"><%= defaults.navbar.title %></div>
			</a>

			<% if (defaults.navbar.navs) { %>
			<ul class="nav navbar-nav">
				<% let keys = Object.keys(defaults.navbar.navs); %>
				<% for (let i = 0; i < keys.length; i++) { %>
				<% let key = keys[i]; %>
				<% let item = defaults.navbar.navs[key]; %>
				<li<% if (nav == key) {%> class="active" <% } %>>
					<a href="#<%= key %>">
						<i class="<%= item.icon %>"></i>
						<span class="hidden-xs"><%= item.text %></span>
					</a>
				</li>
				<% } %>
			</ul>
			<% } %>
		</div>
	`),

	events: {
		'click #brand': 'onClickBrand'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			nav: this.options.nav,
			user: application.session? application.session.user : undefined
		};
	},

	//
	// event handling methods
	//

	onClickBrand: function() {

		// go to welcome view
		//
		Backbone.history.navigate('#', {
			trigger: true
		});
	}
});
