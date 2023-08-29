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

		<div class="kind form-group">
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
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="url">URL</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="pdf">PDF</label>
				</div>
			</div>
		</div>

		<div class="target form-group">
			<label class="control-label">Search For</label>
			<div class="controls">
				<div class="authors radio-inline">
					<label><input type="radio" name="search-for" value="authors" checked>Authors</label>
				</div>
				<div class="articles radio-inline">
					<label><input type="radio" name="search-for" value="articles">Articles</label>
				</div>
			</div>
		</div>

		<div class="top-k form-group">
			<label class="control-label">How Many Results?</label>
			<div class="controls">
				<input type="number" class="form-control" value="10" />
			</div>
		</div>

		<div class="weight-results form-group" style="display:none">
			<label class="control-label">Weight results by number of relevant publications?</label>
			<div class="controls">
				<input type="checkbox" checked>
			</div>
		</div>

		<% if (options == 'advanced') { %>

		<div class="n form-group">
			<label class="control-label">n</label>
			<div class="controls">
				<input type="number" class="form-control" value="500" step="100" />
			</div>
		</div>

		<div class="m form-group">
			<label class="control-label">m</label>
			<div class="controls">
				<input type="number" class="form-control" value="5" />
			</div>
		</div>

		<div class="since-year form-group">
			<label class="control-label">Since year</label>
			<div class="controls">
				<input type="number" class="form-control" value="1900" step="10" />
			</div>
		</div>

		<div class="distance-threshold form-group">
			<label class="control-label">Distance threshold</label>
			<div class="controls">
				<input type="number" class="form-control" value="0.2" step="0.1" />
			</div>
		</div>

		<div class="pow form-group">
			<label class="control-label">Relevance weighting (>1)</label>
			<div class="controls">
				<input type="number" class="form-control" value="3" step="0.5" />
			</div>
		</div>

		<div class="with-plot form-group">
			<label class="control-label">With plot</label>
			<div class="controls">
				<input type="checkbox" />
			</div>
		</div>

		<div class="with-evidence form-group">
			<label class="control-label">With evidence</label>
			<div class="controls">
				<input type="checkbox" />
			</div>
		</div>

		<% } %>
	`),

	events: {
		'change .kind input': 'onChangeKind',
		'change input': 'onChange',
		'keydown': 'onKeyDown'
	},

	//
	// querying methods
	//

	isAdvanced: function() {
		return localStorage.getItem('options') == 'advanced';
	},

	//
	// getting methods
	//

	getValue: function(key) {
		switch (key) {
			case 'kind':
				return this.$el.find('.kind input:checked').val();
			case 'target':
				return this.$el.find('.target input:checked').val();
			case 'top_k':
				return parseInt(this.$el.find('.top-k input').val());
			case 'weight_results':
				return this.$el.find('.weight-results input').is(':checked');
			case 'n':
				return parseInt(this.$el.find('.n input').val());
			case 'm':
				return parseInt(this.$el.find('.m input').val());
			case 'since_year':
				return parseInt(this.$el.find('.since-year input').val());
			case 'distance_threshold':
				return parseFloat(this.$el.find('.distance-threshold input').val());
			case 'pow':
				return parseFloat(this.$el.find('.pow input').val());
			case 'with_plot':
				return this.$el.find('.with-plot input').is(':checked');
			case 'with_evidence':
				return this.$el.find('.with-evidence input').is(':checked');
		}
	},

	getNames: function() {
		let names = [];
		let formGroups = this.$el.find('.form-group');
		for (let i = 0; i < formGroups.length; i++) {
			names.push($(formGroups[i]).attr('class').replace('form-group', '').trim().replace(/-/g, '_'));
		}
		return names;
	},

	getAllValues: function() {
		let values = {};
		let names = this.getNames();
		for (let i = 0; i < names.length; i++) {
			let name = names[i];
			values[name] = this.getValue(name);
		}
		return values;
	},

	getValues: function(which) {
		let values;

		if (this.isAdvanced()) {
			values = this.getAllValues();
		} else {
			values = {
				kind: this.getValue('kind'),
				target: this.getValue('target'),
				top_k: this.getValue('top_k'),
				with_plot: true
			};
		}

		// modify values
		//
		if (values.kind == 'name') {
			delete(values.top_k);
		}

		return values;
	},

	//
	// setting methods
	//

	setValue: function(key, value) {
		switch (key) {
			case 'kind':
				this.$el.find('.kind input[value="' + value + '"]').prop('checked', true);
				break;
			case 'target':
				this.$el.find('.target input[value="' + value + '"]').prop('checked', true);
				break;
			case 'top_k':
				this.$el.find('.top-k input').val(value);
				break;
			case 'weight_results':
				this.$el.find('.weight-results input').prop('checked', value);
				break;
			case 'n':
				this.$el.find('.n input').val(value);
				break;
			case 'm':
				this.$el.find('.m input').val(value);
				break;
			case 'since_year':
				this.$el.find('.since-year input').val(value);
				break;
			case 'distance_threshold':
				this.$el.find('.distance-threshold input').val(value);
				break;
			case 'pow':
				this.$el.find('.pow input').val(value);
				break;
			case 'with_plot':
				this.$el.find('.with-plot input').prop('checked', value);
				break;
			case 'with_evidence':
				this.$el.find('.with-evidence input').prop('checked', value);
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

	templateContext: function() {
		return {
			options: localStorage.getItem('options')
		};
	},

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
			this.$el.find('.articles').hide();
			this.$el.find('.limit').hide();
			this.setValue('target', 'authors');
		} else {
			this.$el.find('.articles').show();
			this.$el.find('.limit').show();
		}
	},

	//
	// mouse event handling methods
	//

	onChangeKind: function() {

		// update views
		//
		this.parent.parent.setSearchKind(this.getValue('kind'));
		this.update();
	},

	onChange: function() {

		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange();
		}
	}
});