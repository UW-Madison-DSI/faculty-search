/******************************************************************************\
|                                                                              |
|                           download-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for a type of modal dialog box.                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../views/dialogs/dialog-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="modal-header error">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<i class="fa fa-download"></i>
				Download
			</h1>
		</div>
		
		<div class="modal-body">
			<label>Please select a file format:</label>
			<div class="format">
				<div class="radio-inline">
					<label><input type="radio" name="<%= items %>" value="csv"<% if (format == 'csv') { %>checked<% } %>>CSV</label>
				</div>

				<div class="radio-inline">
					<label><input type="radio" name="<%= items %>" value="json"<% if (format == 'json') { %>checked<% } %>>JSON</label>
				</div>
			</div>
		</div>
		
		<div class="modal-footer">
			<a download='<%= items %>.<%= format %>' type='text/csv'>
			<button id="download" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-download"></i>Download</button> 
			</a>
		</div>
	`),

	events: {
		'click .close': 'onClickClose',
		'click input': 'onClickFormatInput'
	},

	//
	// constructor
	//

	initialize: function() {
		if (!this.options.items) {
			this.options.items = 'items';
		}
		if (!this.options.format) {
			this.options.format = 'csv';
		}
	},

	//
	// getting methods
	//

	getFormat: function() {
		return this.$el.find('.format input:checked').val();
	},

	getFilename: function() {
		return this.options.items + '.' + this.getFormat();
	},

	//
	// setting methods
	//

	setDownloadLink: function(format) {
		let data = this.options.view.toData(format);

		this.$el.find('.content a').attr({
			'href': URL.createObjectURL(new Blob([data])),
			'download': this.getFilename()
		});
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			items: this.options.items,
			format: this.options.format
		};
	},

	onRender: function() {
		this.setDownloadLink(this.getFormat());
	},

	//
	// mouse event handling methods
	//

	onClickFormatInput: function() {

		// update download link
		//
		this.setDownloadLink(this.getFormat());
	}
});