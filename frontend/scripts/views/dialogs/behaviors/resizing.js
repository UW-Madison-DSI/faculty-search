/******************************************************************************\
|                                                                              |
|                                   resizing.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a mixin for defining dialog behaviors.                        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	//
	// resizing methods
	//

	getDefaultSize: function() {
		return this.size;
	},

	//
	// methods
	//

	enableResize: function() {

		// make modal resizable
		//
		this.$el.find('.modal-dialog').resizable({
			handles: "all",

			// callbacks
			//
			start: (event) => {
				this.onResizeStart(event);
			},
			resize: (event) => {
				this.onResize(event);
			},
			stop: (event) => {
				this.onResizeStop(event);
			}
		});
	},

	saveSize: function() {

		// save size, including borders
		//
		let width = this.$el.find('.modal-dialog')[0].offsetWidth;
		let height = this.$el.find('.modal-dialog')[0].offsetHeight;
		this.options.size = [width, height];
	},

	setSize: function(size) {
		this.$el.find('.modal-dialog').css({
			'width': size? size[0] : '',
			'height': size? size[1] : ''
		});

		// respond to resize
		//
		this.onResize();
	},

	resetSize: function() {
		this.setSize(this.getDefaultSize());
	},

	restoreSize: function() {
		this.setSize(this.options.size);
	},

	//
	// window event handling methods
	//

	onResizeStart: function() {
		this.fixPosition();
		this.$el.find('.modal-dialog').addClass('resized');

		// perform callback
		//
		if (this.options.onResizeStart) {
			this.options.onResizeStart();
		}
	},

	onResize: function() {

		// perform callback
		//
		if (this.options.onResize) {
			this.options.onResize();
		}
	},

	onResizeStop: function() {

		// perform callback
		//
		if (this.options.onResizeStop) {
			this.options.onResizeStop();
		}
	}
};
