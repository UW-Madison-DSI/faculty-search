/******************************************************************************\
|                                                                              |
|                                 scrollable.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a scrolling behavior.                                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	//
	// getting methods
	//

	getScroll: function() {
		return {
			left: this.el.scrollLeft,
			top: this.el.scrollTop
		};
	},

	//
	// scrolling methods
	//

	scrollElementTo: function(el, scroll) {
		if (el.scrollTo) {
			el.scrollTo(scroll.left, scroll.top);
		} else {
			el.scrollLeft = scroll.left;
			el.scrollTop = scroll.top;	
		}
	},

	scrollTo: function(scroll) {
		this.scrollElementTo(this.el, scroll);
	},

	scrollElementToElement(parent, el, options) {
		if (!this.elementContainsElement(parent, el)) {
			let margin = options && options.margin? options.margin : 10;
			
			// find element position
			//
			let offset = el.offsetTop - margin;

			// add container offsets
			//
			let container = el.parentElement;
			while (container && container.parentElement != this.el) {
				offset += container.offsetTop;
				container = container.parentElement;
			}

			// scroll to element top
			//
			this.scrollElementTo(parent, {
				left: 0,
				top: offset
			});
		}
	},

	scrollToElement: function(el, options) {
		this.scrollElementToElement(this.el, el, options);
	},

	scrollElementToView: function(element, view, options) {
		this.scrollElementToElement(element, view.el, options);
	},

	scrollToView: function(view, options) {
		this.scrollToElement(view.el, options);
	}
};