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
import Loadable from '../../views/behaviors/effects/loadable.js';
import Droppable from '../../views/behaviors/drag-and-drop/droppable.js';
import ArticlesListView from '../../views/mainbar/articles-list/articles-list-view.js';
import AuthorsListView from '../../views/mainbar/authors-list/authors-list-view.js';

export default BaseView.extend(_.extend({}, Loadable, Droppable, {

	//
	// attributes
	//

	className: 'search',
	template: template(`
		<div class="content">
			<div class="results"></div>
			<div class="message overlay"></div>
		</div>
		<div class="search-bar">
			<div class="input">
				<div class="text" contenteditable="true"></div>
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
		</div>
	`),
	message: {
		icon: '<i class="fa fa-search"></i>',
		title: 'Data Science @ UW <br /> Community Search',
		subtitle: 'Search for authors or articles related to data science at UW-Madison.'
	},

	pdfUploadMessage: `
		<div class="content">
			<i class="fa fa-file"></i>
			<h1>Search By PDF</h1>
			<h3>Drag and drop or select a PDF file to search for the contents of this file.</h3>

			<button class="select-file btn btn-primary"><i class="fa fa-mouse-pointer"></i>Select File</button>
			<input type="file" id="file" class="form-control" style="display:none" />

			<div class="search-for-file buttons" style="display:none">
				<button class="submit btn btn-primary"><i class="fa fa-search"></i>Search</button>
				<button class="clear btn" ><i class="fa fa-xmark"></i>Clear</button>
			</div>
		</div>
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

	//
	// setting methods
	//

	setSearchKind: function(kind) {
		this.kind = kind;
		this.droppable = (kind == 'pdf');
		this.clear();
	},

	//
	// rendering methods
	//

	onAttach: function() {
		this.showMessage(this.message);
	},

	showArticles: function(articles) {
		this.clearMessage();
		this.showChildView('results', new ArticlesListView({
			collection: articles
		}));
		this.showClearResultsButton();
		this.showTextInput();
	},

	showAuthors: function(authors) {
		this.clearMessage();
		this.showChildView('results', new AuthorsListView({
			collection: authors
		}));
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
		this.$el.find('.results').empty();
		switch (this.kind) {
			case 'pdf':
				this.showHtmlMessage(this.pdfUploadMessage);
				this.hideTextInput();
				break;
			default:
				this.showMessage(this.message);
				this.showTextInput();
				break;
		}
		this.hideClearResultsButton();
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
	},

	showMessage: function(options) {
		this.showHtmlMessage(this.messageTemplate(options));
	},

	clearMessage: function() {

		// remove existing message from dom
		//
		if (this.message) {
			this.$el.find('.message').empty();
		}
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

	onChangeFile: function() {
		this.$el.find('input[type="file"]').show();
		this.$el.find('h3').text("Click the search button to search for the contents of this file.");
		this.$el.find('.select-file').hide();
		this.$el.find('.search-for-file').show();
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

		// set file input
		//
		file.files = event.originalEvent.dataTransfer.files;

		// show files
		//
		this.onChangeFile();
	}
}));