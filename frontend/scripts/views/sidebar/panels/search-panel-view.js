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

import FormView from '../../../views/forms/form-view.js';

export default FormView.extend({

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
					<label><input type="radio" name="search-by" value="text" checked>Text</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search By Text" data-content="Search using the intended meaning of the given text."></i>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="name">Name</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search By Name" data-content="Search using the author's name."></i>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="url">URL</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search By URL" data-content="Search using the information found in the specified URL."></i>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="search-by" value="pdf">PDF</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search By PDF" data-content="Search using the content within the first two pages of the provided PDF."></i>
				</div>
			</div>
		</div>

		<div class="target form-group">
			<label class="control-label">Search For</label>
			<div class="controls">
				<div class="authors radio-inline">
					<label><input type="radio" name="search-for" value="authors" checked>Authors</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search For Authors" data-content="Get a list of authors, sorted by the relevance of their papers and the frequency of citations for those papers."></i>
				</div>
				<div class="articles radio-inline">
					<label><input type="radio" name="search-for" value="articles">Articles</label><i class="active fa fa-info-circle" data-toggle="popover" title="Search For Articles" data-content="Get a list of articles, sorted by their relevance."></i>
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

		<div class="advanced"<% if (!is_advanced) { %> style="display:none"<% } %>>
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

			<div class="ks form-group">
				<label class="control-label">ks</label>
				<div class="controls">
					<input type="number" class="form-control" value="1" step="0.1" />
				</div>
			</div>

			<div class="ka form-group">
				<label class="control-label">ka</label>
				<div class="controls">
					<input type="number" class="form-control" value="1" step="0.1" />
				</div>
			</div>

			<div class="kr form-group">
				<label class="control-label">kr</label>
				<div class="controls">
					<input type="number" class="form-control" value="1" step="0.1" />
				</div>
			</div>

			<div class="filter-unit form-group">
				<label class="control-label">Department</label>
				<div class="controls">
					<select>
						<option>None</option>
					</select>
				</div>
			</div>

			<div class="with-plot form-group">
				<label class="control-label">With plot</label>
				<div class="controls">
					<input type="checkbox" checked />
				</div>
			</div>
		</div>
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
			case 'ks':
				return parseFloat(this.$el.find('.ks input').val());
			case 'ka':
				return parseFloat(this.$el.find('.ka input').val());
			case 'kr':
				return parseFloat(this.$el.find('.kr input').val());
			case 'filter_unit':
				return this.$el.find('.filter-unit select').val();
			case 'with_plot':
				return this.$el.find('.with-plot input').is(':checked');
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
			let value = this.getValue(name);
			if (value !== undefined && value != 'None') {
				values[name] = value;
			}
		}
		return values;
	},

	getValues: function() {
		let values;

		if (this.isAdvanced()) {
			values = this.getAllValues();
		} else {
			values = {
				kind: this.getValue('kind'),
				target: this.getValue('target'),
				top_k: this.getValue('top_k'),
				with_plot: undefined
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
			case 'ks':
				this.$el.find('.ks input').val(value);
				break;
			case 'ka':
				this.$el.find('.ka input').val(value);
				break;
			case 'kr':
				this.$el.find('.kr input').val(value);
				break;
			case 'with_plot':
				this.$el.find('.with-plot input').prop('checked', value);
				break;
			case 'filter_unit':
				this.$el.find('.filter-unit select').val(value);
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

	setAdvanced: function(isAdvanced) {
		if (isAdvanced) {
			this.$el.find('.advanced').show();
		} else {
			this.$el.find('.advanced').hide();
		}
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			options: localStorage.getItem('options'),
			is_advanced: this.isAdvanced(),
			departments: this.options.departments
		};
	},

	onLoad: function() {

		// show child views
		//
		this.showDepartmentSelector(application.departments);

		// set initial state
		//
		this.setValues(application.settings.attributes);
		this.setValues(this.options.values);

		// update panel
		//
		this.update();
	},

	showDepartmentSelector: function(departments) {
		let $selector = this.$el.find('.filter-unit select');
		for (let i = 0; i < departments.length; i++) {
			let department = departments.at(i);
			let id = department.get('id');
			let name = department.get('name');
			let option = $('<option>' + name + '</option>').attr('value', id);
			$selector.append(option);
		}
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
		this.getParentView('split-view').setSearchKind(this.getValue('kind'));
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