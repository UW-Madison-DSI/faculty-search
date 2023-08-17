/******************************************************************************\
|                                                                              |
|                                  article.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a journal article.                            |
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

export default Backbone.Model.extend({

	//
	// attributes
	//

	defaults: {
		id: undefined,
		title: undefined,
		doi: undefined
	}
});