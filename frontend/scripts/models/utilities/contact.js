/******************************************************************************\
|                                                                              |
|                                  contact.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of model of a contact message.               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseModel from '../../models/base-model.js';

export default BaseModel.extend({

	//
	// ajax attributes
	//

	urlRoot: config.server + '/contacts'
});