/******************************************************************************\
|                                                                              |
|                            authors-list-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a list of journal article authors.             |
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
import AuthorsListItemView from '../../../views/mainbar/authors/authors-list-item-view.js';

export default CollectionView.extend({

	//
	// attributes
	//

	tagName: 'ol',
	childView: AuthorsListItemView,

	childViewOptions: function() {
		return {
			onclick: this.options.onclick
		};
	}
});