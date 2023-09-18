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

	className: 'navbar navbar-default navbar-fixed-top navbar-inverse',

	template: _.template(`
		<a id="brand" href="/" id="brand" class="active navbar-brand">
			<div class="icon">
				<img src="<%= defaults.navbar.icon %>" />
			</div>
			<div class="title"><%= defaults.navbar.title %></div>
		</a>

		<% if (defaults.navbar.navs) { %>
		<ul class="nav navbar-nav hidden-xs">
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

		<ul class="mobile-navbar collapsed" id="navbar-collapse">
			<% let keys = Object.keys(defaults.navbar.navs); %>
			<% for (let i = 0; i < keys.length; i++) { %>
			<% let key = keys[i]; %>
			<% let item = defaults.navbar.navs[key]; %>
			<li<% if (nav == key) {%> class="active" <% } %>>
				<a href="#<%= key %>">
					<i class="<%= item.icon %>"></i>
					<span><%= item.text %></span>
				</a>
			</li>
			<% } %>
		</ul>

		<button type="button" id="navbar-toggle" class="btn navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">
			<span class="sr-only">Toggle navigation</span>
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
		</button>
	`),

	events: {
		'click #navbar-toggle': 'onClickNavbarToggle',
		'click .mobile-navbar a': 'onClickNavbarLink',
		'click #brand': 'onClickBrand'
	},

	//
	// querying methods
	//

	isCollapsed: function() {
		return this.$el.find('.mobile-navbar').hasClass('collapsed');
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
	// collapsing methods
	//

	collapse: function() {
		this.$el.find('.mobile-navbar').addClass('collapsed');
	},

	expand: function() {
		this.$el.find('.mobile-navbar').removeClass('collapsed');
	},

	toggle: function() {
		if (this.isCollapsed()) {
			this.expand();
		} else {
			this.collapse();
		}
	},

	//
	// event handling methods
	//

	onClickNavbarToggle: function() {
		this.toggle();
	},

	onClickNavbarLink: function() {
		this.collapse();
	},

	onClickBrand: function() {

		// go to welcome view
		//
		Backbone.history.navigate('#', {
			trigger: true
		});
	}
});
