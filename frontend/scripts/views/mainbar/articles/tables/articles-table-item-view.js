/******************************************************************************\
|                                                                              |
|                         articles-table-item-view.js                          |
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

import TableItemView from '../../../../views/collections/tables/table-item-view.js';

export default TableItemView.extend({

	//
	// attributes
	//

	template: _.template(`
		<td class="title">
			<div class="title"><%= title %></div>
		</td>
		<td class="doi">
			<%= doi %>
		</td>
		<td class="distance">
			<%= distance.toPrecision(3) %>
		</td>
	`)
});