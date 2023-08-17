/******************************************************************************\
|                                                                              |
|                                  author.js                                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a journal author.                             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../library/backbone/backbone.js';
import Articles from '../collections/articles.js';

export default Backbone.Model.extend({

	//
	// attributes
	//

	defaults: {
		first_name: undefined,
		last_name: undefined,
		community: undefined,
		score: undefined,
		articles: []
	},

	//
	// parsing methods
	//

	parse: function(data) {

		// parse attributes
		//
		if (data.articles) {
			data.articles = new Articles(data.articles);
		}

		return data;
	}
});