/******************************************************************************\
|                                                                              |
|                                toolbar-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a top / header toolbar view.                             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	id: 'toolbar',

	template: _.template(`
		<div class="input-group">
			<div class="input-group-btn">
				<button class="search btn btn-primary">
					<i class="fa fa-search"></i>
					<span class="hidden-xs">Search</span>
				</button>
			</div>
			<input type="text" class="form-control" />
			<div class="input-group-btn">
				<button class="clear btn">
					<i class="fa fa-xmark"></i>
					<span class="hidden-xs">Clear</span>
				</button>
			</div>
		</div>
	`),

	events: {
		'click .search': 'onClickSearch',
		'click .clear': 'onClickClear',
		'keydown': 'onKeyDown'
	},

	//
	// getting methods
	//

	getQuery: function() {
		return this.$el.find('input').val();
	},

	//
	// rendering methods
	//

	onAttach: function() {
		this.$el.find('.btn-primary').focus();
	},

	//
	// event handling methods
	//

	onClickSearch: function() {
		this.parent.searchFor(this.getQuery());
	},

	onClickClear: function() {
		this.$el.find('input').val('');
		this.parent.clear();
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {
		if (event.keyCode == 13) {
			this.onClickSearch();
		}
	}
});