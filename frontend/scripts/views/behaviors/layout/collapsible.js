/******************************************************************************\
|                                                                              |
|                               collapsible.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a behavior for collapsible views.                        |
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

	events: {
		'click .expander .expand': 'onClickExpand',
		'click .expander .collapse': 'onClickCollapse'
	},

	//
	// collapsing methods
	//

	collapse: function() {
		this.$el.addClass('collapsed');
	},

	expand: function() {
		this.$el.removeClass('collapsed');
	},

	//
	// mouse event handling methods
	//

	onClickExpand: function(event) {
		this.expand();
		event.stopPropagation();
	},

	onClickCollapse: function(event) {
		this.collapse();
		event.stopPropagation();
	}
};