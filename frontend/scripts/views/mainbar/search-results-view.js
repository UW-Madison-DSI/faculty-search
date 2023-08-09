/******************************************************************************\
|                                                                              |
|                           search-results-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view used for viewing a collection of plots.           |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import Loadable from '../../views/behaviors/effects/loadable.js';
import ArticlesListView from '../../views/mainbar/articles-list/articles-list-view.js';
import AuthorsListView from '../../views/mainbar/authors-list/authors-list-view.js';

export default BaseView.extend(_.extend({}, Loadable, {

	//
	// attributes
	//

	className: 'search-results',
	template: template(`
		<div class="content"></div>
		<div class="full-size message overlay"></div>
	`),

	messageTemplate: template(`
		<div class="content">
			<h1><%= title %></h1>
			<h3><%= subtitle %></h3>
		</div>
	`),

	regions: {
		content: '.content',
		message: '.message'
	},

	message: {
		title: 'Data Science @ UW Community search.',
		subtitle: 'Search for authors or articles related to data science at UW-Madison.'
	},

	//
	// rendering methods
	//

	onAttach: function() {
		this.showMessage(this.message);
	},

	//
	// results rendering methods
	//

	showArticles: function(articles) {
		this.clearMessage();
		this.showChildView('content', new ArticlesListView({
			collection: articles
		}));
	},

	showAuthors: function(authors) {
		this.clearMessage();
		this.showChildView('content', new AuthorsListView({
			collection: authors
		}));
	},

	clear: function() {
		this.getChildView('content').$el.empty();
		this.showMessage(this.message);
	},

	//
	// message rendering methodsd
	//

	showMessage: function(options) {

		// clear previous message
		//
		if (this.message) {
			this.clearMessage();
		}

		// add message to dom
		//

		this.$el.find('.message').html(this.messageTemplate(options));
	},

	clearMessage: function() {

		// remove existing message from dom
		//
		if (this.message) {
			this.$el.find('.message').empty();
		}
	},
}));