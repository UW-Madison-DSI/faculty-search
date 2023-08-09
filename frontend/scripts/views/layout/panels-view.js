/******************************************************************************\
|                                                                              |
|                               panels-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an view for showing a set of panels.                     |
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

export default BaseView.extend({

	//
	// attributes
	//

	className: 'panels',
	replaceElement: true,

	//
	// selecting methods
	//

	select: function(which, options) {
		let item = this.getSelectedChildView(which);

		// select item
		//
		if (item) {
			this.deselectAll();
			item.select(options);
		}

		// scroll to item
		//
		if (this.scrollToView) {
			this.scrollToView(item);
		}
	},

	//
	// rendering methods
	//

	regions: function() {
		let regions = {};
		for (let i = 0; i < this.panels.length; i++) {
			let panel = this.panels[i];
			regions[panel] = {
				el: '.' + panel.replace(/_/g, '-'),
				replaceElement: this.replaceElement
			};
		}
		return regions;
	},

	getTemplate: function() {
		let html = '';
		let keys = Object.keys(this.regions);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let className = key.replace(/_/g, '-');
			html += '<div class="' + className + '"></div>';
		}
		return template(html);	
	},

	onRender: function() {

		// set attributes
		//
		this.app = this.getParentView('app');

		// show child views
		//
		this.showPanels();
	},

	showPanels: function(panels) {
		let regions = panels || Object.keys(this.regions);
		for (let i = 0; i < regions.length; i++) {
			let region = regions[i];
			this.showPanel(region);
		}
	},

	showPanel: function(panel) {
		if (this.hasChildView(panel)) {
			this.getChildView(panel).show();
			return;
		}

		// show specified panel
		//
		let panelView = this.getPanelView(panel);
		if (panelView) {
			this.showChildView(panel, panelView);
		}

		// add panel to array
		//
		if (this.options.panels) {
			this.options.panels.push(panel);
		}
	},

	hidePanel: function(name) {
		this.getRegion(name).empty();

		// remove panel from array
		//
		if (this.options.panels) {
			this.options.panels.splice(this.options.panels.indexOf(name), 1);
		}
	},

	//
	// event handling methods
	//

	onChange: function() {
		
		// perform callback
		//
		if (this.options.onchange) {
			this.options.onchange();
		}
	}
});