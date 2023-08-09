/******************************************************************************\
|                                                                              |
|                                 hideable.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a behavior for hiding views.                             |
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
	// querying methods
	//

	isVisible: function() {
		return this.$el.is(':visible');
	},

	//
	// setting methods
	//

	setVisible: function(visibility) {
		if (visibility) {
			this.show();
		} else {
			this.hide();
		}
	},

	setVisibility: function(selector, visibility) {
		if (visibility) {
			this.$el.find(selector).show();
		} else {
			this.$el.find(selector).hide();
		}
	},

	//
	// rendering methods
	//

	hide: function() {
		this.$el.hide();
	},

	show: function() {
		this.$el.show();
	}
};