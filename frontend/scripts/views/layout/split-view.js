/******************************************************************************\
|                                                                              |
|                                  split-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view used for showing a split view.                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import Browser from '../../utilities/web/browser.js';
import '../../utilities/scripting/array-utils.js';
import '../../../vendor/split-js/split.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'split-view',
	template1: _.template('<div class="split sidebar"></div><div class="split mainbar"></div>'),
	template2: _.template('<div class="split mainbar"></div><div class="split sidebar"></div>'),

	regions: {
		sidebar: {
			el: '.sidebar',
			replaceElement: false
		},
		mainbar: {
			el: '.mainbar',
			replaceElement: false
		}
	},

	events: {
		'click > .gutter': 'onClickGutter',
		'dblclick > .gutter': 'onDoubleClickGutter'
	},

	// splitter sizes
	//
	sizes: [33, 67],
	gutter_size: 10,
	mobile_gutter_size: 20,
	prevSizes: [],
	minSizes: 0,
	orientation: 'horizontal',
	flipped: false,

	//
	// constructor
	//

	initialize: function() {

		// set attributes
		//
		if (this.options.orientation != undefined) {
			this.orientation = this.options.orientation;
		}
		if (this.options.sizes) {
			this.sizes = this.options.sizes;
		}
		if (this.options.minSizes) {
			this.minSizes = this.options.minSizes;
		}
		if (this.options.sidebar_size) {
			if (!this.flipped) {
				this.sizes = [this.options.sidebar_size, 100 - this.options.sidebar_size];
			} else {
				this.sizes = [100 - this.options.sidebar_size, this.options.sidebar_size];
			}
		}
		this.initialSizes = this.sizes.clone();
	},

	//
	// querying methods
	//

	isSideBarVisible: function() {
		return this.$el.find('> .sidebar').is(':visible');
	},

	isSideBarHidden: function() {
		return this.splitter.hidden;
	},

	isSideBarOpen: function() {
		if (!this.flipped) {
			return this.getSizes()[0] > this.getGutterSize();
		} else {
			return this.getSizes()[1] > this.getGutterSize();
		}
	},

	//
	// getting methods
	//

	getGutterSize: function() {
		return Browser.is_mobile? this.mobile_gutter_size : this.gutter_size;
	},

	getSizes: function() {
		return this.splitter.getSizes();
	},

	getInitialSideBarSize: function() {
		if (!this.flipped) {
			return this.initialSizes[0] || 50;
		} else {
			return this.initialSizes[1] || 50;
		}
	},

	//
	// setting methods
	//

	setModel: function(model) {
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').setModel) {
			this.getChildView('sidebar').setModel(model);
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').setModel) {
			this.getChildView('mainbar').setModel(model);
		}
	},

	setOrientation: function(orientation) {
		switch (orientation) {
			case 'horizontal':
				this.$el.find('> .split').removeClass('split-vertical').addClass('split-horizontal');
				break;
			case 'vertical':
				this.$el.find('> .split').removeClass('split-horizontal').addClass('split-vertical');
				break;
		}		
	},

	setSideBarSize: function(sidebarSize) {

		// compute sizes
		//
		if (this.flipped) {
			this.sizes = [(100 - sidebarSize), sidebarSize];
		} else {
			this.sizes = [sidebarSize, (100 - sidebarSize)];
		}

		// set pane sizes
		//
		this.splitter.setSizes(this.sizes);
		this.adjustSizes();
		this.onResize();
	},

	setSideBarMinSize: function(sidebarMinSize) {
		this.setMinSizes([sidebarMinSize, 0]);
	},

	setMinSizes: function(minSizes) {
		if (minSizes[0]) {
			switch (this.orientation) {
				case 'horizontal':
					this.$el.find('.sidebar').css('min-width', minSizes[0] + 'px');
					break;
				case 'vertical':
					this.$el.find('.sidebar').css('min-height', minSizes[0] + 'px');
					break;
			}
		}
		if (minSizes[1]) {
			switch (this.orientation) {
				case 'horizontal':
					this.$el.find('.mainbar').css('min-width', minSizes[1] + 'px');
					break;
				case 'vertical':
					this.$el.find('.mainbar').css('min-height', minSizes[1] + 'px');
					break;
			}	
		}
	},

	setSideBarVisibility: function(visibility) {
		if (visibility) {
			this.showSideBar();
		} else {
			this.hideSideBar();
		}
	},
	
	resetSideBar: function() {
		this.splitter.setSizes(this.options.sizes || this.sizes);
		this.onResize();
	},

	//
	// converting methods
	//

	pixelsToPercent: function(sizes) {

		// convert sizes from pixels to percentages
		//
		for (let i = 0; i < sizes.length; i++) {
			if (typeof sizes[i] == 'string' && sizes[i].contains('px')) {
				sizes[i] = parseInt(sizes[i].replace('px', '')) / this.$el.width() * 100;
			}
		}

		// redistribute remaining width
		//
		let sum = 0;
		let num = 0;
		for (let i = 0; i < sizes.length; i++) {
			if (sizes[i]) {
				sum += sizes[i];
				num++;
			}
		}
		if (sum < 100) {
			let size = (100 - sum) / (sizes.length - num);
			for (let i = 0; i < sizes.length; i++) {
				if (!sizes[i]) {
					sizes[i] = size;
				}
			}
		}

		return sizes;
	},

	//
	// sidebar opening / closing methods
	//

	openSideBar: function() {
		this.setSideBarSize(this.getInitialSideBarSize());
		this.onResize();
	},

	closeSideBar: function() {
		this.prevSizes = this.getSizes();
		this.setSideBarSize(0);
	},

	toggleSideBar: function() {
		if (this.isSideBarOpen()) {
			this.closeSideBar();
		} else {
			this.openSideBar();
		}
	},

	//
	// sidebar hiding / showing methods
	//

	hideSideBar: function() {
		if (!this.splitter.hidden) {
			this.closeSideBar();
			this.$el.find('> .sidebar').hide();
			this.$el.find('> .gutter').hide();
			this.$el.find('> .mainbar').css({
				'width': '100%',
				'height': '100%'
			});
			this.splitter.hidden = true;
		}
	},

	showSideBar: function() {
		if (this.splitter.hidden) {
			this.$el.find('> .sidebar').show();
			this.$el.find('> .gutter').show();
			this.openSideBar();
			this.onResize();
			this.splitter.hidden = false;
		}
	},

	//
	// rendering methods
	//

	getTemplate: function() {
		if (!this.flipped) {
			return this.template1;
		} else {
			return this.template2;
		}
	},

	onRender: function() {

		// show splitter
		//
		this.showSplitter();
		
		// show child views
		//
		if (this.getSideBarView) {
			this.showChildView('sidebar', this.getSideBarView());
		}
		if (this.getMainBarView) {
			this.showChildView('mainbar', this.getMainBarView());
		}

		// set initial state
		//
		if (this.show_sidebar == false) {
			this.hideSideBar();
		}
	},

	onAttach: function() {
		if (!this.splitter.hidden) {
			this.adjustSizes();
		}
	},

	showSplitter: function() {

		// set to horizontal or vertical
		//
		this.setOrientation(this.orientation);

		// create splitter 
		//
		this.splitter = Split(!this.flipped? [
			this.$el.find('> .sidebar')[0], 
			this.$el.find('> .mainbar')[0]
		] : [
			this.$el.find('> .mainbar')[0],
			this.$el.find('> .sidebar')[0]
		], {
			
			// options
			//
			direction: this.orientation,
			sizes: this.sizes,
			minSize: this.minSizes,
			gutterSize: this.getGutterSize(),

			// callbacks
			//
			onDrag: () => {
				this.onResize();
			}
		});

		// set min sizes
		//
		if (this.minSizes) {
			this.setMinSizes(this.minSizes);
		}
	},

	update: function() {

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').update) {
			this.getChildView('sidebar').update();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').update) {
			this.getChildView('mainbar').update();
		}
	},

	adjustWidths: function() {
		let gutterSize = this.getGutterSize();

		// adjust sidebar
		//
		if (!this.flipped) {
			if (this.sizes[0] == 100) {
				this.$el.find('> .sidebar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}

			// adjust mainbar
			//
			if (this.sizes[1] == 100) {
				this.$el.find('> .mainbar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
		} else {

			// adjust sidebar
			//
			if (this.sizes[1] == 100) {
				this.$el.find('> .sidebar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}

			// adjust mainbar
			//
			if (this.sizes[0] == 100) {
				this.$el.find('> .mainbar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}						
		}
	},

	adjustHeights: function() {
		let gutterSize = this.getGutterSize();

		if (!this.flipped) {

			// adjust sidebar
			//
			if (this.sizes[0] == 100) {
				this.$el.find('> .sidebar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}

			// adjust mainbar
			//
			if (this.sizes[1] == 100) {
				this.$el.find('> .mainbar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}	
		} else {

			// adjust sidebar
			//
			if (this.sizes[1] == 100) {
				this.$el.find('> .sidebar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}

			// adjust mainbar
			//
			if (this.sizes[0] == 100) {
				this.$el.find('> .mainbar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}			
		}
	},

	adjustSizes: function() {

		// adjust widths and height for completely open or closed sidebar
		//
		switch (this.orientation) {
			
			case "horizontal":
				this.adjustWidths();
				break;

			case "vertical":
				this.adjustHeights();
				break;
		}
	},

	//
	// event handling methods
	//

	onLoad: function() {

		// check that view still exists
		//
		if (this.isDestroyed()) {
			return;
		}
		
		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onLoad) {
			this.getChildView('sidebar').onLoad();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onLoad) {
			this.getChildView('mainbar').onLoad();
		}
	},

	onChange: function() {

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onChange) {
			this.getChildView('sidebar').onChange();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onChange) {
			this.getChildView('mainbar').onChange();
		}
	},

	//
	// mouse event handling methods
	//

	onClickGutter: function(event) {
		if (Browser.is_mobile) {
			this.resetSideBar();
		}

		// block from parent to prevent rubberband scroll
		//
		event.preventDefault();
	},

	onDoubleClickGutter: function() {
		this.resetSideBar();
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {

		// check menu keyboard shortcuts
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onKeyDown) {
			this.getChildView('sidebar').onKeyDown(event);
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onKeyDown) {
			this.getChildView('mainbar').onKeyDown(event);
		}
	},

	//
	// window event handling methods
	//

	onResize: function(event) {
		
		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onResize) {
			this.getChildView('sidebar').onResize(event);
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onResize) {
			this.getChildView('mainbar').onResize(event);
		}
	},
});