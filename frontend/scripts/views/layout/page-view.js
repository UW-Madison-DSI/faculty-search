/******************************************************************************\
|                                                                              |
|                                  page-view.js                                |
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
import FooterView from './footer-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	id: 'page',

	template: _.template(`
		<div id="header"></div>

		<div class="contents">
			<div class="content">
			</div>
		</div>
		
		<div class="footer">
			<div id="footer"></div>
		</div>
	`),

	regions: {
		header: "#header",
		content: '.content',
		footer: "#footer"
	},

	//
	// rendering methods
	//

	onRender: function() {
		if (this.options.nav) {
			this.$el.addClass(this.options.nav);
		}

		// show child views
		//
		this.showHeader();
		this.showContent();
		this.showFooter();

		// add effects
		//
		this.addLightBox();

		// limit width
		//
		if (!this.options || !this.options.full_width) {
			this.$el.find('.contents').addClass('container');
		}

		// perform callback
		//
		if (this.options && this.options.done) {
			this.options.done();
		}
	},

	showHeader: function() {
		this.showChildView('header', new HeaderView({
			nav: this.options? this.options.nav : undefined
		}));
	},

	showContent: function() {
		if (this.options.contentView) {
			this.showChildView('content', this.options.contentView);
		}
	},

	showFooter: function() {
		this.showChildView('footer', new FooterView());
	},

	addLightBox: function() {
		import(
			'../../../vendor/jquery/fancybox/jquery.fancybox.js'
		).then(() => {
			this.$el.find('.lightbox').fancybox({

				// options
				//
				padding: 0,
				margin: 20,
				openEffect: 'elastic',
				closeEffect: 'elastic',
				type : "image",

				// callbacks
				//
				afterShow: function() {

					// make image draggable
					//
					this.wrap.draggable();
					this.wrap.closest('.fancybox-overlay').css({
						'overflow-x': 'hidden',
						'overflow-y': 'hidden'
					});
				}
			});
		});
	}
});
