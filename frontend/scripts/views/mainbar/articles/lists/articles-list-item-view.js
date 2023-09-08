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

import ListItemView from '../../../../views/collections/lists/list-item-view.js';

export default ListItemView.extend({

	//
	// attributes
	//

	template: _.template(`
		<% if (typeof doi != 'undefined') { %>
		<a href="https://doi.org/<%= doi %>" class="doi" target="_blank"><%= title %></a>
		<% } else { %>
		<div class="title"><%= title %></div>
		<% } %>
	`)
});