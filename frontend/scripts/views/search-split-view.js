/******************************************************************************\
|                                                                              |
|                             search-split-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the main split view of this application.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import SplitView from '../views/layout/split-view.js';
import SearchResultsView from '../views/mainbar/search-results-view.js';
import SideBarView from '../views/sidebar/sidebar-view.js';

export default SplitView.extend({

	//
	// attributes
	//

	orientation: $(window).width() < 960? 'vertical': 'horizontal',
	flipped: false,
	sizes: [30, 70],

	//
	// getting methods
	//

	getMainBarView: function() {
		return new SearchResultsView({
			model: this.model,
			parent: this
		});
	},

	getSideBarView: function() {
		return new SideBarView({
			parent: this,

			// callbacks
			//
			onchange: (attribute) => this.onChange(attribute)
		});
	},

	getLimit: function() {
		return this.getChildView('sideebar').getLimit();
	},

	//
	// window event handling methods
	//

	onResize: function() {
		if (this.hasChildView('mainbar')) {
			this.getChildView('mainbar').onResize();
		}
	}
});