/******************************************************************************\
|                                                                              |
|                               search-view.js                                 |
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
import Author from '../../models/author.js';
import Vote from '../../models/vote.js';
import Loadable from '../../views/behaviors/effects/loadable.js';
import Droppable from '../../views/behaviors/drag-and-drop/droppable.js';
import AuthorsView from '../../views/mainbar/authors/authors-view.js';
import ArticlesView from '../../views/mainbar/articles/articles-view.js';
import AuthorProfileView from '../../views/mainbar/authors/author-profile-view.js';

export default BaseView.extend(_.extend({}, Loadable, Droppable, {

	//
	// attributes
	//

	className: 'search',
	template: template(`
		<div class="content">
			<div class="message overlay"></div>
			<div class="notes well" style="display:none">
				<%= defaults.messages.notes %>
			</div>
			<div class="results" style="display:none"></div>
			<div class="voting buttons" style="display:none">
				Results quality: &nbsp;
				<button class="success upvote btn btn-sm" data-toggle="tooltip" title="Upvote">
					<i class="fa fa-thumbs-up"></i>
				</button>
				<button class="warning downvote btn btn-sm" data-toggle="tooltip" title="Downvote">
					<i class="fa fa-thumbs-down"></i>
				</button>
			</div>
		</div>
		<div class="search-bar">
			<div class="input">
				<div class="text" contenteditable="true"><%= query %></div>
				<div class="buttons">
					<button class="submit btn"><i class="fa fa-search" data-toggle="tooltip" title="Search" data-placement="top"></i></button>
					<button class="clear btn" style="display:none"><i class="fa fa-xmark" data-toggle="tooltip" title="Clear" data-placement="top"></i></button>
				</div>
			</div>
		</div>
	`),

	messageTemplate: template(`
		<div class="content">
			<% if (icon) { %><%= icon %><% } %>
			<h1><%= title %></h1>
			<h3><%= subtitle %></h3>
			<% if (typeof(body) != 'undefined') { %>
			<div class="body"><%= body %></div>
			<% } %>
		</div>
	`),

	pdfUploadMessageTemplate: template(`
		<div class="content">
			<%= defaults.messages.pdf_upload.icon %>
			<h1><%= defaults.messages.pdf_upload.title %></h1>
			<h3><%= defaults.messages.pdf_upload.message %></h3>

			<button class="select-file btn btn-primary"><i class="fa fa-mouse-pointer"></i>Select File</button>
			<input type="file" id="file" class="form-control" style="display:none" />

			<div class="search-for-file buttons" style="display:none">
				<button class="submit btn btn-primary"><i class="fa fa-search"></i>Search</button>
				<button class="clear btn" ><i class="fa fa-xmark"></i>Clear</button>
			</div>
		</div>
	`),

	introText: `
		<p>Unlike a standard search engine, you don’t need to use keywords or exact phrases. Instead, our AI-powered search is based on semantics. So your search can be based on entire paragraphs or documents. </p>

		<p>Your search can be based on: </p>
		<ul>
			<li>a few words or an entire paragraph</li>
			<li>the content of a webpage, just provide the URL</li>
			<li>the contents of a document, just drag and drop a PDF</li>
		</ul>

		<label>Benefits:</label>
		<ul>
			<li>Discover experts from across campus for any topic</li>
			<li>Find related research from your colleagues</li>
			<li>Understand the research landscape at UW-Madison.</li>
		</ul>
	`,

	regions: {
		results: '.results',
		message: '.message'
	},

	events: _.extend({}, Droppable.events, {
		'click .search-bar .submit': 'onClickSubmitText',
		'click .search-bar .clear': 'onClickClearText',

		'click .select-file': 'onClickSelectFile',
		'change input[type="file"]': 'onChangeFile',

		'click .search-for-file .submit': 'onClickSubmitFile',
		'click .search-for-file .clear': 'onClickClearFile',

		'click .upvote': 'onClickUpvote',
		'click .downvote': 'onClickDownvote',

		'keydown': 'onKeyDown'
	}),

	droppable: false,

	//
	// getting methods
	//

	getQuery: function() {
		return this.$el.find('.input').text().trim();
	},

	getFile: function() {
		return this.$el.find('#file')[0].files[0];
	},

	getParams: function() {
		return {

			// query params
			//
			kind: this.parent.getSearchKind(),
			target: this.parent.getSearchTarget(),
			query: this.parent.getSearchQuery(),

			// hyper params
			//
			top_k: this.parent.getParamValue('top_k'),
			weight_results: this.parent.getParamValue('weight_results'),
			n: this.parent.getParamValue('n'),
			m: this.parent.getParamValue('m'),
			since_year: this.parent.getParamValue('since_year'),
			distance_threshold: this.parent.getParamValue('distance_threshold'),
			pow: this.parent.getParamValue('pow'),
			with_plot: this.parent.getParamValue('with_plot')
		};
	},

	//
	// setting methods
	//

	setSearchKind: function(kind) {
		this.kind = kind;
		this.droppable = (kind == 'pdf');
		this.update();
	},

	setFiles: function(files) {
		const fileInput = this.$el.find('#file')[0];

		// set file input
		//
		if (fileInput) {
			fileInput.files = files;
		}

		// set input filename (required for Safari)
		//
		this.setFilename(files[0].name);

		// show files
		//
		this.onChangeFile();
	},

	setFilename: function(filename) {
		const fileInput = this.$el.find('#file')[0];

		// Help Safari out
		//
		if (fileInput.webkitEntries.length) {
			fileInput.dataset.file = filename;
		}
	},

	//
	// voting methods
	//

	vote: function(vote) {
		new Vote().save(_.extend(this.getParams(), {
			vote: vote
		}));
		this.disableVoting();
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			query: this.options.query
		}
	},

	onRender: function() {
		this.showIntroMessage();

		// add button tooltip triggers
		//
		this.addTooltips();
	},

	showAuthors: function(authors, plot) {
		this.clearMessage();
		this.showChildView('results', new AuthorsView({
			collection: authors,
			plot: plot,

			// callbacks
			//
			onclick: (author) => {
				Author.fetchById(author.get('id'), {

					// callbacks
					//
					success: (author) => {
						this.showAuthorProfile(author);
					}
				});
			}
		}));
		this.showResults();
		this.showClearResultsButton();
		this.showTextInput();
	},

	showArticles: function(articles, plot) {
		this.clearMessage();
		this.showChildView('results', new ArticlesView({
			collection: articles,
			plot: plot
		}));
		this.showResults();
		this.showClearResultsButton();
		this.showTextInput();
	},

	showAuthorProfile: function(author) {
		this.clearMessage();
		this.showChildView('results', new AuthorProfileView({
			model: author
		}));
		this.showResults();
		this.showClearResultsButton();
		this.showTextInput();
	},

	showTextInput: function() {
		this.$el.find('.search-bar').show();

		// configure search bar
		//
		if (this.kind == 'pdf') {
			this.$el.find('.search-bar .text').hide();
			this.$el.find('.search-bar .submit').hide();
		} else {
			this.$el.find('.search-bar .text').show();
			this.$el.find('.search-bar .submit').show();
		}
	},

	showResults: function() {
		this.$el.find('.message').hide();
		this.$el.find('.results').show();
		this.$el.find('.notes').show();
		this.$el.find('.voting').show();
	},

	hideResults: function() {
		this.$el.find('.results').hide();
		this.$el.find('.notes').hide();
		this.$el.find('.voting').hide();
	},

	hideTextInput: function() {
		this.$el.find('.search-bar').hide();
	},

	showClearResultsButton: function() {
		this.$el.find('.search-bar .clear').show();
	},

	hideClearResultsButton: function() {
		this.$el.find('.search-bar .clear').hide();
	},

	clear: function() {

		// update search view
		//
		this.$el.find('.results').empty();
		this.$el.find('.search-bar .text').empty();
		this.update();
	},

	update: function() {
		switch (this.kind) {
			case 'pdf':
				this.hideResults();
				this.showHtmlMessage(this.pdfUploadMessageTemplate());
				this.hideTextInput();
				break;
			default:
				this.hideResults();
				this.showIntroMessage();
				this.showTextInput();
				break;
		}
		this.hideClearResultsButton();
		this.updatePlaceholder();

		// update parent / sidebar
		//
		this.parent.updateQueryString();
	},

	updatePlaceholder: function() {

		// update search placeholder text
		//
		switch (this.kind) {
			case 'name':
				this.$el.find('.search-bar').addClass('name');
				this.$el.find('.search-bar').removeClass('url');
				break;
			case 'url':
				this.$el.find('.search-bar').removeClass('name');
				this.$el.find('.search-bar').addClass('url');
				break;
			default:
				this.$el.find('.search-bar').removeClass('name');
				this.$el.find('.search-bar').removeClass('url');
				break;
		}
	},

	//
	// drag-n-drop rendering methods
	//

	highlight: function() {
		this.$el.find('.results').addClass('dropzone');
	},

	unhighlight: function() {
		this.$el.find('.results').removeClass('dropzone');
	},

	//
	// message rendering methodsd
	//

	showHtmlMessage: function(html) {

		// clear previous message
		//
		if (this.message) {
			this.clearMessage();
		}

		// add message to dom
		//
		this.$el.find('.message').html(html);
		this.$el.find('.message').show();
	},

	showIntroMessage: function() {
		let message = defaults.messages.main;
		message.body = this.introText;
		this.showMessage(message);
	},

	showMessage: function(options) {
		this.hideResults();
		this.showHtmlMessage(this.messageTemplate(options));
	},

	clearMessage: function() {

		// remove existing message from dom
		//
		if (this.message) {
			this.$el.find('.message').empty();
		}
	},

	disableVoting: function() {
		this.$el.find('.voting').hide();
	},

	//
	// mouse event handling methods
	//

	onClickSubmitText: function() {
		this.parent.search();
	},

	onClickClearText: function() {
		this.parent.clear();
	},

	onClickSubmitFile: function() {
		this.parent.search();
	},

	onClickClearFile: function() {
		this.clear();
	},

	onClickUpvote: function() {
		this.vote('up');
	},

	onClickDownvote: function() {
		this.vote('down');
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {
		if (event.keyCode == 13 && !event.shiftKey) {
			this.onClickSubmitText();
			event.preventDefault();
		}
	},

	//
	// file event handling methods
	//

	onChangeFile: function(event) {

		// update view
		//
		this.$el.find('input[type="file"]').show();
		this.$el.find('h3').text("Click the search button to search for the contents of this file.");
		this.$el.find('.select-file').hide();
		this.$el.find('.search-for-file').show();

		// set input filename (required for Safari)
		//
		if (event) {
			let filename = event.target.files[0].name;
			this.setFilename(filename);
		}
	},

	onClickSelectFile: function() {
		this.$el.find('input[type="file"]').trigger('click');
	},

	//
	// drag and drop event handling methods
	//

	onDrop: function(event) {

		// call mixin method
		//
		Droppable.onDrop.call(this, event);

		// change file input
		//
		this.setFiles(event.originalEvent.dataTransfer.files);
	},

	//
	// window event handling methods
	//

	onResize: function() {
		if (this.hasChildView('results') && this.getChildView('results').onResize) {
			this.getChildView('results').onResize();
		}
	}
}));