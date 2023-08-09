/******************************************************************************\
|                                                                              |
|                                  main-view.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the main single column outer container view.             |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import HeaderView from './header-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'full-screen',

	template: _.template(`
		<div id="header"></div>
		<div id="main"></div>
	`),

	regions: {
		header: "#header",
		content: '#main'
	},

	//
	// rendering methods
	//

	onRender: function() {

		// show child views
		//
		this.showHeader();
		this.showContent();
	},

	showHeader: function() {

		// use default template
		//
		this.showChildView('header', new HeaderView({
			nav: this.options? this.options.nav : undefined
		}));

		// perform callback
		//
		if (this.options && this.options.done) {
			this.options.done();
		}
	},

	showContent: function() {
		if (this.options.contentView) {
			this.showChildView('content', this.options.contentView);
		}
	}
});
