/******************************************************************************\
|                                                                              |
|                           author-profile-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a profile view of a article author.                      |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import FormView from '../../../views/forms/form-view.js';
import ArticlesListView from '../../../views/mainbar/articles/lists/articles-list-view.js';

export default FormView.extend({

	//
	// attributes
	//

	className: 'author form-horizontal panel',

	template: _.template(`
		<div class="buttons" style="float:right">
			<button class="close warning btn btn-sm" data-toggle="tooltip" title="Close" style="opacity:1"><i class="fa fa-close"></i></button>
		</div>

		<h1><%= first_name %> <%= last_name %></h1>

		<div class="form-group" id="first-name" style="display:none">
			<label class="control-label">First Name</label>
			<div class="controls">
				<%= first_name %>
			</div>
		</div>

		<div class="form-group" id="last-name" style="display:none">
			<label class="control-label">Last Name</label>
			<div class="controls">
				<%= last_name %>
			</div>
		</div>

		<% if (community) { %>
		<div class="form-group" id="community">
			<label class="control-label">Community</label>
			<div class="controls">
				<%= community || 'none' %>
			</div>
		</div>
		<% } %>

		<% if (score) { %>
		<div class="form-group" id="score">
			<label class="control-label">Score</label>
			<div class="controls">
				<%= score || 'none' %>
			</div>
		</div>
		<% } %>

		<div class="form-group" id="articles">
			<label class="control-label">Articles</label>
			<div class="controls">
				<div class="articles-list"></div>
			</div>
		</div>
	`),

	regions: {
		articles: '.articles-list'
	},

	events: {
		'click .close': 'onClickClose'
	},

	//
	// rendering methods
	//

	onRender: function() {
		this.showChildView('articles', new ArticlesListView({
			collection: this.model.get('articles')
		}));
	},

	//
	// mouse event handing methods
	//

	onClickClose: function() {

		// perform callback
		//
		if (this.options.onclose) {
			this.options.onclose();
		}
	}
});