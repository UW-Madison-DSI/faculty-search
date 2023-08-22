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

import Author from '../models/author.js';
import Articles from '../collections/articles.js';
import Authors from '../collections/authors.js';
import SplitView from '../views/layout/split-view.js';
import SearchView from '../views/mainbar/search-view.js';
import SideBarView from '../views/sidebar/sidebar-view.js';
import QueryString from '../utilities/web/query-string.js';

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
			query: QueryString.getValue('query'),
			model: this.model,
			parent: this
		});
	},

	getSideBarView: function() {
		let values = QueryString.getValues();

		// if debug not specified by query string, then
		// allow it to be specified by the config file.
		//
		if (!values.debug && config.debug) {
			values.debug = config.debug;
		}

		return new SideBarView({
			parent: this,
			values: values,

			// callbacks
			//
			onchange: () => this.onChange()
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

	getSearchParams: function() {
		let params = this.getChildView('sidebar').getSearchParams();

		// add query to params
		//
		let query = this.getSearchQuery();
		let kind = this.getSearchKind();
		if (query && kind != 'pdf') {
			params.query = query;
		}

		return params;
	},

	getQueryParams: function() {
		let params = this.getSearchParams();

		// remove params pertaining to search type
		//
		delete(params.kind);
		delete(params.target);
		delete(params.debug);

		return params;
	},

	//
	// converting methods
	//

	stringToName: function(string) {
		let terms = string.split(' ');

		if (terms.length >= 2) {
			return {
				first_name: terms[0],
				last_name: terms[terms.length - 1]
			};
		} else {
			return null;
		}
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
			case 'name':
				this.searchByName(this.getSearchQuery());
				break;
			default:
				this.searchByText(this.getSearchQuery());
				break;
		}
		this.updateQueryString();
	},

	searchByText: function(query) {
		let params = this.getQueryParams();
		switch (this.getSearchTarget()) {
			case 'authors':
				this.searchAuthors(_.extend(params, {
					query: query
				}));
				break;
			case 'articles':
				this.searchArticles(_.extend(params, {
					query: query
				}));
				break;
		}
	},

	searchByName: function(query) {
		let params = this.getQueryParams();
		switch (this.getSearchTarget()) {
			case 'authors':
				let name = this.stringToName(query);
				if (name) {
					this.searchAuthorsByName(name, params);
				} else {
					application.error({
						message: "Search by name requires a first name and a last name."
					});
				}
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
					let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
					this.getChildView('mainbar').showAuthors(authors, plot);
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
					let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
					this.getChildView('mainbar').showArticles(articles, plot);
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

	searchAuthorsByName: function(name, options) {
		$.ajax({
			url: config.server + '/get_author',
			type: 'POST',
			data: JSON.stringify(name),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				if (data.articles && data.articles.length > 0) {

					// remove ids since they don't parse properly as integers
					//
					for (let i = 0; i < data.articles.length; i++) {
						delete data.articles[i].id;
					}

					// parse author from data
					//
					let author = data.author;
					author.articles = data.articles;
					author = new Author(author, {
						parse: true
					});

					this.getChildView('mainbar').showAuthorProfile(author);
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Articles Found.",
						subtitle: "No articles were found by this author."
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

	onAttach: function() {

		// set initial state
		//
		let values = QueryString.getValues();

		if (values) {
			if (values.kind == 'pdf') {
				this.setSearchKind(values.kind);
			}
			if (values.query) {
				this.search();
			}
		}
	},

	clear: function() {
		this.getChildView('mainbar').clear();
	},

	updateQueryString: function() {
		let params = this.getSearchParams();
		QueryString.setValues(params);
	},

	//
	// event handling methods
	//

	onChange: function() {
		this.updateQueryString();
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