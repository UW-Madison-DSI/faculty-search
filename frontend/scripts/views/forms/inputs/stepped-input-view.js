/******************************************************************************\
|                                                                              |
|                            steppped-input-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for a stepped slider input element.             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import RangeInputView from '../../../views/forms/inputs/range-input-view.js';

export default RangeInputView.extend({

	//
	// input attributes
	//

	scale: 'linear',
	step: 1,
	
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

		// set atributes
		//
		this.min = 0
		this.max = this.options.values.length - 1;
		this.value = this.options.value;
	},

	//
	// getting methods
	//

	getStepValue: function() {
		return this.options.values[this.getValue()];
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
			size: Math.max(this.numChars(this.options.values[this.options.values.length - 1]) + 1, 2),
			values: this.options.values,
			slider: this.options.slider,
			input: this.options.input,
			selectable: this.options.selectable
		};
	},

	onRender: function() {
		let index = this.options.values.indexOf(this.value);
		this.setRange(index);
	},

	//
	// event handling methods
	//

	onChange: function() {
		this.setNumber(this.getStepValue());

		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange(this.getStepValue());
		}
	}
});