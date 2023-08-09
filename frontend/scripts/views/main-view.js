/******************************************************************************\
|                                                                              |
|                                 main-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level view of our application.                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Articles from '../collections/articles.js';
import Authors from '../collections/authors.js';
import BaseView from '../views/base-view.js';
import ToolbarView from '../views/toolbar-view.js';
import SearchSplitView from '../views/search-split-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	id: 'main-view',

	template: _.template(`
		<div id="toolbar"></div>
		<div id="contents"></div>
	`),

	regions: {
		toolbar: {
			el: '#toolbar',
			replaceElement: true
		},
		contents: {
			el: '#contents',
			replaceElement: true
		}
	},

	//
	// getting methods
	//

	getSearchKind: function() {
		return this.getChildView('contents sidebar search').getValue('kind');
	},

	getLimit: function() {
		return this.getChildView('contents sidebar search').getValue('limit');
	},

	//
	// searching methods
	//

	searchFor: function(query) {
		switch (this.getSearchKind()) {
			case 'authors':
				this.searchAuthors(query);
				break;
			case 'articles':
				this.searchArticles(query);
				break;
		}
	},

	searchAuthors: function(query) {
		$.ajax({
			url: config.server + '/search_authors',
			type: 'POST',
			data: JSON.stringify({
				'query': query,
				'top-k': this.getLimit()
			}),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				let authors = new Authors(data.authors);
				this.getChildView('contents mainbar').showAuthors(authors);
			},
			error: (response, textStatus, errorThrown) => {
				application.error({
					message: response.responseText || 'Could not connect to server.'
				});
			}
		})
	},

	searchArticles: function(query) {
		$.ajax({
			url: config.server + '/search_articles',
			type: 'POST',
			data: JSON.stringify({
				'query': query,
				'top-k': this.getLimit()
			}),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				let articles = new Articles(data.articles);
				this.getChildView('contents mainbar').showArticles(articles);
			},
			error: (response, textStatus, errorThrown) => {
				application.error({
					message: response.responseText || 'Could not connect to server.'
				});
			}
		})
	},

	clear: function() {
		this.getChildView('contents mainbar').clear();
	},

	//
	// rendering methods
	//

	onRender: function() {
		this.showToolbar();
		this.showContents();
	},

	showToolbar: function() {
		this.showChildView('toolbar', new ToolbarView());
	},

	showContents: function() {
		this.showChildView('contents', new SearchSplitView({
			model: this.model
		}));
	},

	//
	// window event handling methods
	//

	onResize: function() {
		if (this.hasChildView('contents')) {
			this.getChildView('contents').onResize();
		}
	}
});