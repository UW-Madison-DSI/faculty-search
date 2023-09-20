/******************************************************************************\
|                                                                              |
|                               department.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a department / institution unit.              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseModel from './base-model.js';

export default BaseModel.extend({

	//
	// attributes
	//

	defaults: {
		id: undefined,
		name: undefined
	}
});