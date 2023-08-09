/******************************************************************************\
|                                                                              |
|                                 loadable.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view behavior for displaying loading spinners.         |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	showSpinner: function(options) {

		// check if spinner is already shown
		//
		if (this.spinner) {
			return;
		}

		// check if there's a delay
		//
		if (options && options.delay) {

			// check if spinner is already shown
			//
			if (this.timeout) {
				return;
			}

			// show spinner after a slight delay
			//
			this.timeout = window.setTimeout(() => {
				this.showSpinner();
				this.timeout = null;
			}, options.delay);
		} else {
			this.spinner = $('<div class="spinner">');
			this.$el.append(this.spinner);
			this.$el.addClass('loading');
		}
	},

	hideSpinner: function() {
		if (this.spinner) {
			this.spinner.remove();
			this.spinner = null;
			this.$el.removeClass('loading');
		}
		this.cancelSpinner();
	},

	cancelSpinner: function() {

		// clear pending spinner
		//
		if (this.timeout) {
			window.clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
};