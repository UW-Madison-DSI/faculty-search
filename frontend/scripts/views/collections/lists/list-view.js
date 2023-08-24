/******************************************************************************\
|                                                                              |
|                                list-view.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an abstract view for displaying a generic list.          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';
import CollectionView from '../../../views/collections/collection-view.js';
import ListItemView from '../../../views/collections/lists/list-item-view.js';

export default CollectionView.extend({

	//
	// attributes
	//
	tagName: 'ol',

	// views
	//
	childView: ListItemView,

	emptyView: BaseView.extend({
		className: 'empty',
		template: template("No items.")
	})
});