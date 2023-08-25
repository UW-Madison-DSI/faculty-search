/******************************************************************************\
|                                                                              |
|                               sidebar-view.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the sidebar view and its various panels.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import PanelsView from '../../views/layout/panels-view.js';
import SearchPanelView from '../../views/sidebar/panels/search-panel-view.js';
import OptionsPanelView from '../../views/sidebar/panels/options-panel-view.js';

export default PanelsView.extend({

	//
	// attributes
	//

	panels: ['search', 'options'],

	//
	// querying methods
	//

	visible: function() {
		return {
			search: true
		}
	},

	//
	// getting methods
	//

	getSearchParams: function() {
		return this.getChildView('search').getValues();
	},

	//
	// panel rendering methods
	//

	showPanel: function(panel, options) {

		// if panel has already been rendered, then show
		//
		if (this.hasChildView(panel)) {
			this.getChildView(panel).show();
			return;
		}

		// show specified panel
		//
		switch (panel) {
			case 'search':
				this.showSearchPanel();
				break;
			case 'options':
				this.showOptionsPanel();
				break;
		}
	},

	showSearchPanel: function() {
		this.showChildView('search', new SearchPanelView({
			values: this.options.values,
			onchange: this.options.onchange
		}));
	},

	showOptionsPanel: function() {
		this.showChildView('options', new OptionsPanelView({
			values: this.options.values,
			onchange: this.options.onchange
		}));
	}
});