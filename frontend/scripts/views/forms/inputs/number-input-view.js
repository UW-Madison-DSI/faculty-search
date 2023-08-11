/******************************************************************************\
|                                                                              |
|                             number-input-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for a toolbar number input element.             |
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

	template: template(`
		<% if (!values) { %>
		<input type="number" value="<%= value %>" style="width:<%= size %>em">
		<% } else { %>
		<div class="input-group">
			<input type="number" value="<%= value %>" style="width:<%= size %>em">
			<div class="input-group-btn">
				<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<span class="caret"></span>
				</button>
				<ul class="dropdown-menu dropdown-menu-right" style="min-width:<%= Math.max(values[values.length - 1].toString().length + 1, 4) %>em">
				<% for (let i = 0; i < values.length; i++) { %>
					<li><a value="<%= values[i] %>"><%= values[i] %></a></li>
				<% } %>
				</ul>
			</div>
		</div>
		<% } %>
	`),

	events: {
		'change input[type="number"]': 'onChangeNumber'
	},

	//
	// input attributes
	//

	size: 2,

	//
	// constructor
	//

	initialize: function() {

		// set attributes
		//
		if (this.options.value != undefined) {
			this.value = this.options.value;
		}
		if (this.options.max != undefined) {
			this.size = this.numChars(this.options.max);
		}
	},

	//
	// attribute methods
	//

	className: function() {
		if (this.options.values) {
			return 'input selectable';
		} else {
			return 'input';
		}
	},

	//
	// counting methods
	//

	numChars: function(value) {
		if (value) {
			return value.toString().length;
		} else {
			return 1;
		}
	},

	//
	// getting methods
	//

	getValue: function() {
		return parseFloat(this.$el.find('input[type="number"]').val());
	},
	
	//
	// setting methods
	//

	setValue: function(value) {
		this.$el.find('input[type="number"]').val(Math.round(value));
	},

	setMax: function(max) {
		this.$el.find('input').css('width', this.numChars(max) + 'em');
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			size: this.size,
			value: this.value,
			values: this.options.values
		};
	},

	//
	// event handling methods
	//

	onChange: function() {

		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange();
		}
	},

	onChangeNumber: function() {
		this.onChange();
	}
});
