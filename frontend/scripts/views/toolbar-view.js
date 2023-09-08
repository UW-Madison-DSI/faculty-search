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
			<textarea class="form-control" rows="1" placeholder="Search terms or text"></textarea>
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
		return this.$el.find('.form-control').val();
	},

	//
	// rendering methods
	//

	onAttach: function() {
		this.$el.find('.btn-primary').focus();
	},

	showInput: function() {
		this.$el.removeClass('collapsed');
	},

	hideInput: function() {
		this.$el.addClass('collapsed');
	},

	//
	// event handling methods
	//

	onClickSearch: function() {
		this.parent.search();
	},

	onClickClear: function() {
		this.$el.find('.form-control').val('');
		this.parent.clear();
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {
		if (event.keyCode == 13 && !event.shiftKey) {
			this.onClickSearch();
			event.preventDefault();
		}
	}
});