/******************************************************************************\
|                                                                              |
|                                 boundable.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a type of behavior for containers.                       |
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
	// querying methods
	//

	containsElement: function(element) {
		return this.elementContainsElement(this.el, element);
	},

	overlapsElement: function(element) {
		return this.elementOverlapsElement(this.el, element);
	},

	containsEvent: function(event) {
		let rect = this.el.getBoundingClientRect();
		return event.clientX >= rect.left && event.clientX <= rect.right &&
			event.clientY >= rect.top && event.clientY <= rect.bottom;
	},

	inView: function(fully) {
		let pageTop = $(window).scrollTop();
		let pageBottom = pageTop + $(window).height();
		let elementTop = this.$el.offset().top;
		let elementBottom = elementTop + this.$el.height();

		if (fully) {
			return ((pageTop < elementTop) && (pageBottom > elementBottom));
		} else {
			return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
		}
	},

	//
	// getting methods
	//

	getWidth: function() {
		return this.el.clientWidth;
	},

	getHeight: function() {
		return this.el.clientHeight;
	},

	getSize: function() {
		return {
			width: this.getWidth(),
			height: this.getHeight()
		};
	},

	//
	// bounding methods
	//

	elementContainsElement: function(element1, element2) {
		let rect1 = element1.getBoundingClientRect();
		let rect2 = element2.getBoundingClientRect();
		return rect2.left >= rect1.left &&
			rect2.right <= rect1.right &&
			rect2.top >= rect1.top &&
			rect2.bottom <= rect1.bottom;
	},

	elementOverlapsElement: function(element1, element2) {
		let rect1 = element1.getBoundingClientRect();
		let rect2 = element2.getBoundingClientRect();
		return !(rect2.left > rect1.right || 
			rect2.right < rect1.left || 
			rect2.top > rect1.bottom ||
			rect2.bottom < rect1.top);
	},

	windowContainsEvent: function(event) {
		return event.clientX >= 0 && event.clientX <= $(window).width() &&
			event.clientY >= 0 && event.clientY <= $(window).height();
	}
};