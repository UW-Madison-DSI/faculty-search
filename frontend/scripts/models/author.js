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
}, {

	//
	// static methods
	//

	fetchById: function(id, options) {
		$.ajax(_.extend({
			url: config.server + '/get_author_by_id',
			type: 'POST',
			data: JSON.stringify({
				author_id: id.toString()
			}),
			contentType: 'application/json',
			processData: false,
			cache: false,

			// callbacks
			//
			success: (data) => {
				if (options.success) {
					let object = data.author;
					object.articles = data.articles;
					let author = new this(object, {
						parse: true
					});
					options.success(author);
				}
			},

			error: () => {
				if (options.error) {
					options.error();
				}
			}
		}));
	}
});