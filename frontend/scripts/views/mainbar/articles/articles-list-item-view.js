/******************************************************************************\
|                                                                              |
|                          articles-list-item-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a single journal article.                      |
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
		<div class="title"><%= title %></div>
		<% if (typeof doi != 'undefined') { %>
		<div class="doi"><%= doi %></div>
		<% } %>
	`),

	events: {
		'click a': 'onClickLink'
	},

	//
	// mouse event handling methods
	//

	onClickLink: function() {
	}
});