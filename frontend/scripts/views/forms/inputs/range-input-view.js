/******************************************************************************\
|                                                                              |
|                              range-input-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for a toolbar slider input element.             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import NumberInputView from '../../../views/forms/inputs/number-input-view.js';

export default NumberInputView.extend({

	//
	// attributes
	//

	template: template(`
		<% if (input) { %>
		<% if (!values) { %>
		<div class="values">
			<span class="min"><%= min %></span>
			<input type="number" value="<%= value != undefined? value : min %>">
			<span class="max"><%= max %></span>
		</div>

		<% } else { %>
		<div class="input-group">
			<input type="number" value="<%= value != undefined? value : min %>" style="width:<%= size %>em">
			<% if (selectable) { %>
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
			<% } %>
		</div>
		<% } %>
		<% } %>
		
		<% if (slider) { %>
		<input type="range" min="<%= min %>" max="<%= max %>" <% if (step != undefined) { %> step="<%= step %>"<% } %>value="<%= range != undefined? range : min %>" />
		<% } %>
	`),

	events: {
		'change input[type="number"]': 'onChangeNumber',
		'change input[type="range"]': 'onChangeRange',
		'mouseup input[type="range"]': 'onMouseUp',
		'input input[type="range"]': 'onInputRange',
		'click .dropdown-menu li': 'onClickMenuItem'
	},

	//
	// input attributes
	//

	scale: 'linear',
	min: 0,
	max: 100,
	step: undefined,
	
	//
	// constructor
	//

	initialize: function() {

		// set optional parameter defaults
		//
		if (this.options.slider == undefined) {
			this.options.slider = true;
		}
		if (this.options.input == undefined) {
			this.options.input = true;
		}
		if (this.options.selectable == undefined) {
			this.options.selectable = true;
		}
		if (this.options.size == undefined) {
			this.options.size = 3;
		}

		// set atributes
		//
		if (this.options.min != undefined) {
			this.min = this.options.min;
		}
		if (this.options.max != undefined) {
			this.max = this.options.max;
		}
		if (this.options.step != undefined) {
			this.step = this.options.step;
		}
		if (this.options.value != undefined) {
			this.value = this.options.value;
		}
		if (this.options.scale != undefined) {
			this.scale = this.options.scale;
		}
	},

	//
	// attribute methods
	//

	className: function() {
		if (this.options.values && this.options.selectable) {
			return 'input selectable';
		} else {
			return 'input';
		}
	},

	//
	// getting methods
	//

	getNumber: function() {
		return parseFloat(this.$el.find('input[type="number"]').val());
	},

	getRange: function() {
		return parseFloat(this.$el.find('input[type="range"]').val());
	},

	getRangeValue: function() {
		return this.rangeToValue(this.getRange());
	},

	getValue: function() {
		let value;

		if (this.options.input) {
			value = this.getNumber();
		}
		if (this.options.slider || isNaN(value)) {
			value = this.getRangeValue();
		}

		return value;
	},
	
	//
	// setting methods
	//

	setValue: function(value) {
		if (this.options.input) {
			this.setNumber(value);
		}
		if (this.options.slider) {
			this.setRange(value);
		}
	},

	setNumber: function(value) {
		this.$el.find('input[type="number"]').val(value.toPrecision(this.options.size));
	},

	setRange: function(value) {
		if (typeof value != 'number') {
			return;
		}
		switch (this.scale) {
			case 'linear':
				this.$el.find('input[type="range"]').val(value);
				break;
			case 'logarithmic':
				this.$el.find('input[type="range"]').val(this.valueToRange(value));
				break;
		}
	},

	setOption: function(option) {
		this.setValue(option);
	},

	//
	// converting methods
	//

	valueToRange: function(value) {	
		switch (this.scale) {
			case 'linear':
				return value;
			case 'logarithmic': {
				let min = Math.log(this.min);
				let max = Math.log(this.max);
				return this.min + (Math.log(value) - min) / (max - min) * (this.max - this.min);
			}
		}		
	},

	rangeToValue: function(range) {
		switch (this.scale) {
			case 'linear':
				return range;
			case 'logarithmic': {
				let min = Math.log(this.min);
				let max = Math.log(this.max);
				let t = (range - this.min) / (this.max - this.min);
				return Math.exp(min + t * (max - min));
			}
		}
	},

	valueToInput: function(value) {
		if (this.step) {
			return Math.round(value / this.step) * this.step;
		} else {
			return Math.round(value);
		}
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			min: this.min,
			max: this.max,
			step: this.step || 'any',
			value: this.valueToInput(this.value),
			range: this.valueToRange(this.value),
			size: this.options.size || Math.max(this.numChars(this.max), 2),
			values: this.options.values,
			slider: this.options.slider,
			input: this.options.input,
			selectable: this.options.selectable
		};
	},

	update: function() {
		if (this.options.input) {
			switch (this.scale) {
				case 'linear':
					this.setNumber(this.getRange());
					break;
				case 'logarithmic':
					this.setNumber(this.getRangeValue());
					break;
			}
		}
	},

	//
	// event handling methods
	//

	onChangeNumber: function() {
		let number = this.getNumber();

		if (isNaN(number)) {

			// set number to range slider
			//
			this.setNumber(this.getRangeValue());			
		} else if (number < this.min) {

			// clamp to min
			//
			this.setValue(this.min);
		} else if (number > this.max) {

			// clamp to max
			//
			this.setValue(this.max);
		} else {

			// set range slider to number
			//
			this.setRange(number);
		}

		this.onChangeRange();
	},

	onInputRange: function() {

		// update input from slider
		//
		this.update();

		// perform callback
		//
		if (this.options.oninput) {
			this.options.oninput(this.getValue());
		}
	},

	onClickMenuItem: function(event) {
		this.setOption($(event.target).attr('value'));
	},

	onChangeRange: function() {

		// update input from slider
		//
		this.update();

		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange(this.getValue());
		}
	}
});