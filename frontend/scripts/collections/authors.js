/******************************************************************************\
|                                                                              |
|                                  authors.js                                  |
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
import Author from '../models/author.js';

export default BaseCollection.extend({

	//
	// attributes
	//

	model: Author
});