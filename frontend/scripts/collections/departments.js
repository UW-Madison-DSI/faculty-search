/******************************************************************************\
|                                                                              |
|                               departments.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of journal authors.                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseCollection from '../collections/base-collection.js';
import Department from '../models/department.js';

export default BaseCollection.extend({

	//
	// attributes
	//

	model: Department,
	url: config.server + '/get_units',

	//
	// ajax methods
	//

	fetch: function(options) {
		$.get({
			url: this.url,

			// callbacks
			//
			success: (data) => {

				// parse data object
				//
				let keys = Object.keys(data);
				for (let i = 0; i < keys.length; i++) {
					let key = keys[i];
					this.add(new Department({
						id: key,
						name: data[key]
					}));
				}

				// perform callback
				//
				if (options && options.success) {
					options.success(this);
				}
			}
		});
	}
});