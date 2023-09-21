/******************************************************************************\
|                                                                              |
|                                application.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application.                               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Router from './router.js';
import MainView from './views/layout/main-view.js';
import PageView from './views/layout/page-view.js';
import DialogView from './views/dialogs/dialog-view.js';
import Alertable from './views/dialogs/behaviors/alertable.js';
import Browser from './utilities/web/browser.js';

export default Marionette.Application.extend(_.extend({}, Alertable, {

	//
	// attributes
	//

	region: {
		el: 'body',
		replaceElement: false
	},

	//
	// constructor
	//

	initialize: function() {

		// add helpful class for mobile OS'es
		//
		$('body').attr('device', Browser.device);
		if (Browser.device == 'phone' || Browser.device == 'tablet') {
			$('body').addClass('mobile');
		}

		// store handle to application
		//
		window.application = this;

		// disable pinch zoom on touch devices
		//
		if (Browser.is_touch_enabled) {
			document.addEventListener('touchmove', (event) => {
				if (event.scale !== 1) {
					event.preventDefault();
				}
			}, false);
		}

		// listen for window resize
		//
		$(window).on('resize', (event) => {
			this.onResize(event);
		});

		// listen for color scheme changes
		//
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
			this.onThemeChange(event);
		});

		// create routers
		//
		this.router = new Router();
	},

	//
	// methods
	//

	start: function() {

		// call superclass method
		//
		Marionette.Application.prototype.start.call(this);

		// call initializer
		//
		this.initialize();

		// check to see if user is logged in
		//
		Backbone.history.start();
	},

	navigate: function(url, options) {
		this.router.navigate(url, options);
	},

	//
	// getting methods
	//

	getTheme: function() {
		return this.getView().getChildView('content sidebar options').getValue('theme');
	},

	//
	// setting methods
	//

	setTheme: function(theme) {
		switch (theme) {
			case 'light':
				$('body').removeClass('dark');
				break;
			case 'dark':
				$('body').addClass('dark');
				break;
			case 'auto':
				this.setTheme(Browser.isDarkModeEnabled()? 'dark' : 'light');
				break;
		}
		this.updatePlot();
	},

	//
	// rendering methods
	//

	show: function(view, options) {
		if (view instanceof DialogView) {

			// show modal dialog
			//
			this.showDialog(view, options);
		} else if (!options || !options.full_screen) {

			// show page view
			//
			this.showView(new PageView({
				contentView: view,
				nav: options? options.nav : undefined,
				full_width: options? options.full_width: undefined
			}));
		} else {

			// show main view
			//
			this.showView(new MainView({
				contentView: view,
				nav: options? options.nav : undefined
			}));
		}
	},

	updatePlot: function() {
		let plotView = this.getView().getChildView('content mainbar results plot');
		if (plotView) {
			plotView.update();
		}
	},

	//
	// window event handling methods
	//

	onResize: function(event) {
		let view = this.getView();
		if (view && view.onResize) {
			view.onResize(event);
		}
	},

	onThemeChange: function() {
		this.setTheme(this.getTheme());
	}
}));