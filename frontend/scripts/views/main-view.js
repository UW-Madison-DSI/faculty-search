/******************************************************************************\
|                                                                              |
|                             search-split-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the main split view of this application.                 |
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
import SplitView from '../views/layout/split-view.js';
import SearchView from '../views/mainbar/search-view.js';
import SideBarView from '../views/sidebar/sidebar-view.js';

export default SplitView.extend({

	//
	// attributes
	//

	orientation: $(window).width() < 960? 'vertical': 'horizontal',
	flipped: false,
	sizes: [30, 70],

	//
	// getting methods
	//

	getMainBarView: function() {
		return new SearchView({
			model: this.model,
			parent: this
		});
	},

	getSideBarView: function() {
		return new SideBarView({
			parent: this,

			// callbacks
			//
			onchange: (attribute) => this.onChange(attribute)
		});
	},

	//
	// getting methods
	//

	getSearchQuery: function() {
		return this.getChildView('mainbar').getQuery();
	},

	getSearchKind: function() {
		return this.getChildView('sidebar search').getValue('kind');
	},

	getSearchTarget: function() {
		return this.getChildView('sidebar search').getValue('target');
	},

	getSearchLimit: function() {
		return this.getChildView('sidebar search').getValue('limit');
	},

	getFile: function() {
		return this.getChildView('mainbar').getFile();
	},

	getLimit: function() {
		return this.getChildView('sideebar').getLimit();
	},

	//
	// setting methods
	//

	setSearchKind: function(kind) {
		this.getChildView('mainbar').setSearchKind(kind);
	},

	//
	// searching methods
	//

	search: function() {
		switch (this.getSearchKind()) {
			case 'pdf':
				this.searchByFile(this.getFile());
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
		this.readFile(file, {

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
	},

	//
	// ajax methods
	//

	readFile: function(file, options) {

		// get form data
		//
		let formData = new FormData();
		formData.append('file', file);

		$.ajax({
			url: '/api/pdf',
			type: 'POST',
			data: formData,
			contentType: false,
			processData: false,
			cache: false,

			// callbacks
			//
			success: (data) => {
				if (data && data.length > 0) {
					if (options && options.success) {
						options.success(data);
					}
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-file"></i>',
						title: "PDF Error.",
						subtitle: "The PDF file '" + file.name + "' could not be parsed."
					});
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
				if (data.authors && data.authors.length > 0) {
					let authors = new Authors(data.authors);
					this.getChildView('mainbar').showAuthors(authors);
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Authors Found.",
						subtitle: "No authors were found that met your search criteria."
					});
				}
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
				if (data.articles && data.articles.length > 0) {
					let articles = new Articles(data.articles);
					this.getChildView('mainbar').showArticles(articles);
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Articles Found.",
						subtitle: "No articles were found that met your search criteria."
					});
				}
			},
			error: (response, textStatus, errorThrown) => {
				application.error({
					message: response.responseText || 'Could not connect to server.'
				});
			}
		});
	},

	//
	// rendering methods
	//

	clear: function() {
		this.getChildView('mainbar').clear();
	},

	//
	// window event handling methods
	//

	onResize: function() {
		if (this.hasChildView('mainbar')) {
			this.getChildView('mainbar').onResize();
		}
	}
});