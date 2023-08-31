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

import BaseView from '../../views/base-view.js';
import SidebarHeaderView from '../../views/sidebar/sidebar-header-view.js';
import SidebarPanelsView from '../../views/sidebar/sidebar-panels-view.js';
import SidebarFooterView from '../../views/sidebar/sidebar-footer-view.js';

export default BaseView.extend({

	//
	// attributes
	//


	template: _.template(`
		<div class="header"></div>
		<div class="panels"></div>
		<div class="footer"></div>
	`),

	regions: {
		header: '.header',
		panels: '.panels',
		footer: '.footer'
	},

	//
	// rendering methods
	//

	onRender: function() {
		this.showHeader();
		this.showPanels();
		this.showFooter();
	},

	showHeader: function() {
		this.showChildView('header', new SidebarHeaderView());
	},

	showPanels: function() {
		this.showChildView('panels', new SidebarPanelsView(this.options));
	},

	showFooter: function() {
		this.showChildView('footer', new SidebarFooterView());
	},
});