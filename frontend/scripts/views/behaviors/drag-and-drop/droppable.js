/******************************************************************************\
|                                                                              |
|                                 droppable.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a drag and drop behavior for drop targets.               |
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

	//
	// attributes
	//

	events: {

		// drag and drop methods
		//
		'dragenter': 'onDragEnter',
		'dragover': 'onDragOver',
		'dragleave': 'onDragLeave',
		'drop': 'onDrop',
	},

	droppable: true,

	//
	// querying methods
	//

	containsFiles: function(event) {
		if (event.originalEvent) {
			if (event.originalEvent.dataTransfer) {

				// Safari / Firefox
				//
				if (event.originalEvent.dataTransfer.types) {
					for (let i = 0; i < event.originalEvent.dataTransfer.types.length; i++) {
						if (event.originalEvent.dataTransfer.types[i] == "Files") {
							return true;
						}
					}

				// Chrome
				//
				} else if (event.originalEvent.dataTransfer.items && event.originalEvent.dataTransfer.items.length > 0) {
					return true;
				}
			}
		}
		
		return false;
	},

	//
	// rendering methods
	//

	highlight: function() {
		this.$el.addClass('dropzone');
	},

	unhighlight: function() {
		this.$el.removeClass('dropzone');
	},

	//
	// drag event handling methods
	//

	onDragEnter: function(event) {
		if (this.droppable != false) {
			this.highlight();
		}

		// prevent default drag behavior
		//
		this.block(event);
	},

	onDragOver: function(event) {
		if (this.droppable != false) {
			this.highlight();
		}

		// prevent default drag behavior
		//
		this.block(event);
	},

	onDragLeave: function(event) {
		if (this.droppable != false) {
			this.unhighlight();
		}

		// prevent default drag behavior
		//
		this.block(event);
	},

	//
	// drop event handling methods
	//

	onDrop: function(event) {
		if (this.droppable != false) {
			this.unhighlight();	

			// perform callback
			//
			if (this.options.ondrop) {
				this.options.ondrop(this);
			}
		}

		// prevent default drop behavior
		//
		this.block(event);
	}
};