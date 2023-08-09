/******************************************************************************\
|                                                                              |
|                          articles-list-item-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of journal article.                               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	tagName: 'li',

	template: _.template(`
		<div class="name">
			<a>
				<span class="last"><%= last_name %></span>,
				<span class="first"><%= first_name %></span>
			</a>
		</div>
	`),

	events: {
		'click a': 'onClickLink'
	},

	//
	// getting methods
	//

	getName: function() {
		return this.model.get('first_name') + '+' + this.model.get('last_name');
	},

	//
	// mouse event handling methods
	//

	onClickLink: function() {
		let queryString = 'query=' + this.getName() + '&category=people';
		let url = 'https://datascience.sharedigm.com/cmap/';

		// open up profile view in new tab
		//
		window.open(url + '?' + queryString);
	}
});