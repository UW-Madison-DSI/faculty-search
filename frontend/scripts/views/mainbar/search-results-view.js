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
import Droppable from '../../views/behaviors/drag-and-drop/droppable.js';
import ArticlesListView from '../../views/mainbar/articles-list/articles-list-view.js';
import AuthorsListView from '../../views/mainbar/authors-list/authors-list-view.js';

export default BaseView.extend(_.extend({}, Loadable, Droppable, {

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
			<br />
			<button class="select-file btn btn-primary"><i class="fa fa-mouse-pointer"></i>Select File</button>
			<input type="file" id="file" class="form-control" style="display:none" />
		</div>
	`,

	regions: {
		content: '.content',
		message: '.message'
	},

	events: _.extend({}, Droppable.events, {
		'click .select-file': 'onClickSelectFile',
		'change input[type="file"]': 'onChangeFile',
	}),

	droppable: false,

	//
	// getting methods
	//

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
		this.$el.find('.content').empty();
		switch (this.kind) {
			case 'pdf':
				this.showHtmlMessage(this.pdfUploadMessage);
				break;
			default:
				this.showMessage(this.message);
				break;
		}
	},

	//
	// drag-n-drop rendering methods
	//

	highlight: function() {
		this.$el.find('> .content').addClass('dropzone');
	},

	unhighlight: function() {
		this.$el.find('> .content').removeClass('dropzone');
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
	// event handling methods
	//

	onChangeFile: function() {
		this.$el.find('input[type="file"]').show();
		this.$el.find('h3').text("Click the search button to search for the contents of this file.");
		this.$el.find('.select-file').hide();
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