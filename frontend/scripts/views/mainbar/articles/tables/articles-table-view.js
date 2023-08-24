/******************************************************************************\
|                                                                              |
|                           articles-table-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a list of journal articles.                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import TableView from '../../../../views/collections/tables/table-view.js';
import ArticlesTableItemView from '../../../../views/mainbar/articles/tables/articles-table-item-view.js';

export default TableView.extend({

	//
	// attributes
	//

	childView: ArticlesTableItemView,

	template: _.template(`
		<thead>
			<th class="title">
				Title
			</th>
			<th class="doi">
				DOI
			</th>
			<th class="distance">
				Distance
			</th>
		</thead>
		<tbody>
		</tbody>
	`),
});