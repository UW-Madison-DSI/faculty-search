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

	getSearchQuery: function() {
		return this.getChildView('toolbar').getQuery();
	},

	getSearchKind: function() {
		return this.getChildView('contents sidebar search').getValue('kind');
	},

	getSearchTarget: function() {
		return this.getChildView('contents sidebar search').getValue('target');
	},

	getSearchLimit: function() {
		return this.getChildView('contents sidebar search').getValue('limit');
	},

	//
	// setting methods
	//

	setToolbarSearchKind: function(kind) {
		switch (kind) {
			case 'text':
			case 'doi':
			case 'url':
				this.getChildView('toolbar').showInput();
				break;
			case 'pdf':
				this.getChildView('toolbar').hideInput();
				break;
		}
	},

	setSearchKind: function(kind) {
		this.getChildView('contents mainbar').setSearchKind(kind);
		this.setToolbarSearchKind(kind);
	},

	//
	// searching methods
	//

	search: function() {
		switch (this.getSearchKind()) {
			case 'pdf':
				this.getChildView('contents mainbar').readFile((filename, data) => {
					// this.searchByFile(data);
					this.readPdf(data, {

						// callbacks
						//
						success: (text) => {
							this.searchByText(text);
						},
						error: () => {
							application.error({
								message: "Could not read PDF file."
							});
						}
					});
				});
				break;
			default:
				this.searchByText(this.getSearchQuery());
				break;
		}
	},

	searchByText: function(query) {
		switch (this.getSearchTarget()) {
			case 'authors':
				this.searchAuthors({
					query: query,
					top_k: this.getSearchLimit()
				});
				break;
			case 'articles':
				this.searchArticles({
					query: query,
					top_k: this.getSearchLimit()
				});
				break;
		}
	},

	searchByFile: function(file) {
		switch (this.getSearchTarget()) {
			case 'authors':
				this.searchAuthors({
					file: file,
					top_k: this.getSearchLimit()
				});
				break;
			case 'articles':
				this.searchArticles({
					file: file,
					top_k: this.getSearchLimit()
				});
				break;
		}
	},

	//
	// ajax methods
	//

	readPdf: function(data, options) {
		$.ajax({
			url: '/api/pdf',
			type: 'POST',
			data: data,
			contentType: 'application/pdf',
			processData: false,

			// callbacks
			//
			success: (data) => {
				if (options && options.success) {
					options.success(data);
				}
			},
			error: (response, textStatus, errorThrown) => {
				if (options && options.error) {
					options.error(response, textStatus, errorThrown);
				}
			}
		});
	},

	searchAuthors: function(options) {
		$.ajax({
			url: config.server + '/search_authors',
			type: 'POST',
			data: JSON.stringify(options),
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
		});
	},

	searchArticles: function(options) {
		$.ajax({
			url: config.server + '/search_articles',
			type: 'POST',
			data: JSON.stringify(options),
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
		});
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