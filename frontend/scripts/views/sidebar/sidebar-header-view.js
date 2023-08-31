/******************************************************************************\
|                                                                              |
|                            sidebar-header-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application header and associated content.           |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="container">
		</div>
	`)
});
