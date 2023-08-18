/******************************************************************************\
|                                                                              |
|                            search-panel-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the sidebar search panel view.                           |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'search panel',

	template: _.template(`
		<div class="header">
			<label><i class="fa fa-search"></i>Options</label>
		</div>

		<br />

		<div class="search-by form-group">
			<label class="control-label">Search By</label>
			<div class="controls">
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="text" checked>Text</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="name">Name</label>
				</div>
				<div class="radio-inline" style="display:none">
					<label><input type="radio" name="search-by" value="doi">DOI</label>
				</div>
				<div class="radio-inline" style="display:none">
					<label><input type="radio" name="search-by" value="url">URL</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="pdf">PDF</label>
				</div>
			</div>
		</div>

		<div class="search-term form-group" style="display:none">
			<label class="control-label">Text</label>
			<div class="controls">
				<input type="text" class="form-control" />
			</div>
		</div>

		<div class="search-for form-group">
			<label class="control-label">Search For</label>
			<div class="controls">
				<div class="radio-inline">
					<label><input type="radio" name="search-for" value="authors" checked>Authors</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-for" value="articles">Articles</label>
				</div>
			</div>
		</div>

		<div class="limit form-group">
			<label class="control-label">How Many Results?</label>
			<div class="controls">
				<input type="number" class="form-control" value="10" style="width:100px" />
			</div>
		</div>

		<div class="weight-results form-group" style="display:none">
			<label class="control-label">Weight results by number of relevant publications?</label>
			<div class="controls">
				<input type="checkbox" checked>
			</div>
		</div>
	`),

	events: {
		'change .search-by input': 'onChangeSearchBy',
		'change .search-for input': 'onChange',
		'change .limit input': 'onChange',
		'keydown': 'onKeyDown'
	},

	//
	// getting methods
	//

	getValue: function(key) {
		switch (key) {
			case 'kind':
				return this.$el.find('.search-by input:checked').val();
			case 'target':
				return this.$el.find('.search-for input:checked').val();
			case 'limit':
				return parseInt(this.$el.find('.limit input').val());
		}
	},

	getValues: function() {
		let values = {
			kind: this.getValue('kind'),
			target: this.getValue('target')
		};

		if (values.kind != 'name') {
			values.limit = this.getValue('limit');
		}

		return values;
	},

	//
	// setting methods
	//

	setValue: function(key, value) {
		switch (key) {
			case 'kind':
				this.$el.find('.search-by input[value="' + value + '"]').prop('checked', true);
				break;
			case 'target':
				this.$el.find('.search-for input[value="' + value + '"]').prop('checked', true);
				break;
			case 'limit':
				this.$el.find('.limit input').val(value);
				break;
		}
	},

	setValues: function(values) {
		let keys = Object.keys(values);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let value = values[key];
			this.setValue(key, value);
		}
	},

	//
	// rendering methods
	//

	onRender: function() {
		if (!this.options.values) {
			return;
		}

		// set initial state
		//
		this.setValues(this.options.values);

		// update panel
		//
		this.update();
	},

	update: function() {
		let kind = this.getValue('kind');

		// hide show limit
		//
		if (kind == 'name') {
			this.$el.find('.limit').hide();
			this.setValue('target', 'authors');
		} else {
			this.$el.find('.limit').show();
		}
	},

	//
	// mouse event handling methods
	//

	onChangeSearchBy: function() {

		// update views
		//
		this.parent.parent.setSearchKind(this.getValue('kind'));
		this.update();
		this.onChange();
	},

	onChange: function() {

		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange();
		}
	}
});