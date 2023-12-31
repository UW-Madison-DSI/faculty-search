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
import Settings from '../models/settings.js';
import Articles from '../collections/articles.js';
import Authors from '../collections/authors.js';
import Departments from '../collections/departments.js';
import SplitView from '../views/layout/split-view.js';
import SearchView from '../views/mainbar/search-view.js';
import SideBarView from '../views/sidebar/sidebar-view.js';
import QueryString from '../utilities/web/query-string.js';

export default SplitView.extend({

	//
	// attributes
	//

	orientation: $(window).width() < 640? 'vertical': 'horizontal',
	flipped: false,
	sizes: [35, 65],

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
		return new SideBarView({
			parent: this,
			values: QueryString.getValues(),

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
		return this.getChildView('sidebar panels search').getValue('kind');
	},

	getSearchTarget: function() {
		return this.getChildView('sidebar panels search').getValue('target');
	},

	getParamValue: function(key) {
		return this.getChildView('sidebar panels search').getValue(key);
	},

	getFile: function() {
		return this.getChildView('mainbar').getFile();
	},

	getSearchParams: function() {
		let params = this.getChildView('sidebar panels').getSearchParams();

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

		return params;
	},

	//
	// converting methods
	//

	stringToName: function(string) {
		let terms = string.split(' ');

		if (terms.length >= 2) {
			return {
				first_name: terms[0].toTitleCase(),
				last_name: terms[terms.length - 1].toTitleCase()
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
			case 'name':
				this.searchByName(this.getSearchQuery());
				break;
			case 'url':
				this.searchByUrl(this.getSearchQuery());
				break;
			case 'pdf':
				this.searchByFile(this.getFile());
				break;
			default:
				this.searchByText(this.getSearchQuery());
				break;
		}
		this.updateQueryString();
	},

	searchByText: function(query) {

		// check for empty query
		//
		if (!query) {
			application.error({
				message: defaults.messages.errors.empty_text
			});
			return;
		}

		// search by text
		//
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

		// check for empty query
		//
		if (!query) {
			application.error({
				message: defaults.messages.errors.empty_name
			});
			return;
		}

		// search authors
		//
		let params = this.getQueryParams();
		switch (this.getSearchTarget()) {
			case 'authors': {
				let name = this.stringToName(query);
				if (name) {
					this.searchAuthorsByName(name, params);
				} else {
					application.error({
						message: defaults.messages.errors.name
					});
				}
				break;
			}
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
					message: defaults.messages.errors.file_read
				});
			}
		});
	},

	//
	// ajax methods
	//

	searchByUrl: function(url) {

		// check for empty url
		//
		if (!url) {
			application.error({
				message: defaults.messages.errors.empty_url
			});
			return;
		}

		// search by url
		//
		$.ajax({
			url: '/api/url',
			type: 'POST',
			data: JSON.stringify({
				url: url
			}),
			contentType: 'application/json',
			processData: false,
			cache: false,

			// callbacks
			//
			success: (data) => {
				this.searchByText(data);
			},
			error: () => {
				application.error({
					message: defaults.messages.errors.url_error
				});
			}
		});
	},

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
		this.showSpinner();
		$.ajax({
			url: config.server + '/search_authors',
			type: 'POST',
			data: JSON.stringify(options),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				this.hideSpinner();
				if (data.authors && data.authors.length > 0) {
					let authors = new Authors(data.authors);
					let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
					this.getChildView('mainbar').showAuthors(authors, plot);

					// show plot
					//
					if (!plot && options.with_plot === undefined) {
						this.showAuthorsPlot(options);
					}
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Authors Found.",
						subtitle: "No authors were found that met your search criteria."
					});
				}
			},
			error: () => {
				this.hideSpinner();
				application.error({
					message: defaults.messages.errors.connection
				});
			}
		});
	},

	showAuthorsPlot: function(options) {
		options.with_plot = true;
		$.ajax({
			url: config.server + '/search_authors',
			type: 'POST',
			data: JSON.stringify(options),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				let resultsView = this.getChildView('mainbar results');
				if (resultsView.showPlot) {
					let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
					resultsView.showPlot(plot);
				}
			}
		});
	},

	searchArticles: function(options) {
		this.showSpinner();
		$.ajax({
			url: config.server + '/search_articles',
			type: 'POST',
			data: JSON.stringify(options),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				this.hideSpinner();
				if (data.articles && data.articles.length > 0) {
					let articles = new Articles(data.articles, {
						parse: true
					});
					let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
					this.getChildView('mainbar').showArticles(articles, plot);

					// show plot
					//
					if (!plot && options.with_plot === undefined) {
						this.showArticlesPlot(options);
					}
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Articles Found.",
						subtitle: "No articles were found that met your search criteria."
					});
				}
			},
			error: () => {
				this.hideSpinner();
				application.error({
					message: defaults.messages.errors.connection
				});
			}
		});
	},

	showArticlesPlot: function(options) {
		options.with_plot = true;
		$.ajax({
			url: config.server + '/search_articles',
			type: 'POST',
			data: JSON.stringify(options),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				let plot = data.plot_json? JSON.parse(data.plot_json) : undefined;
				this.getChildView('mainbar results').showPlot(plot);
			}
		});
	},

	searchAuthorsByName: function(name) {
		this.showSpinner();
		$.ajax({
			url: config.server + '/get_author',
			type: 'POST',
			data: JSON.stringify(name),
			contentType: 'application/json',
			processData: false,

			// callbacks
			//
			success: (data) => {
				this.hideSpinner();
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

					// show list of authors
					//
					this.getChildView('mainbar').showAuthors(new Authors([author]));
				} else {
					this.getChildView('mainbar').showMessage({
						icon: '<i class="fa fa-search"></i>',
						title: "No Articles Found.",
						subtitle: "No articles were found by this author."
					});
				}
			},
			error: () => {
				this.hideSpinner();
				application.error({
					message: defaults.messages.errors.connection
				});
			}
		});
	},

	//
	// rendering methods
	//

	onRender: function() {

		// call superclass
		//
		SplitView.prototype.onRender.call(this);

		// fetch default settings
		//
		new Settings().fetch({

			// callbacks
			//
			success: (settings) => {
				application.settings = settings;

				// fetch departments from server
				//
				new Departments().fetch({

					// callbacks
					//
					success: (departments) => {
						application.departments = departments;

						// update
						//
						this.onLoad();
					}
				});
			}
		});
	},

	onLoad: function() {
		this.getChildView('sidebar panels search').onLoad();

		// set initial state
		//
		let values = QueryString.getValues();

		if (values) {
			if (values.kind) {
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

	showSpinner: function() {
		this.getChildView('mainbar').showSpinner();
	},

	hideSpinner: function() {
		this.getChildView('mainbar').hideSpinner();
	},

	//
	// event handling methods
	//

	onChange: function() {
		this.updateQueryString();
		this.getChildView('mainbar').setSearchKind(this.getSearchKind());
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