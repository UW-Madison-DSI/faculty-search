/******************************************************************************\
|                                                                              |
|                            articles-list-view.js                             |
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

import CollectionView from '../../../views/collections/collection-view.js';
import ArticlesListItemView from '../../../views/mainbar/articles/articles-list-item-view.js';

export default CollectionView.extend({

	//
	// attributes
	//

	tagName: 'ol',
	childView: ArticlesListItemView
});