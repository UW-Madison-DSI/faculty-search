/******************************************************************************\
|                                                                              |
|                              full-screenable.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a behavior for handling full screen mode.                |
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
	// full screen methods
	//

	isFullSize: function() {
		return window.innerWidth == screen.width &&
			window.innerHeight == screen.height;
	},

	isFullScreen: function() {
		return (document.fullScreenElement != undefined && document.fullScreenElement !== null) || 
			(document.mozFullScreen != undefined && document.mozFullScreen === true) || 
			(document.webkitIsFullScreen != undefined && document.webkitIsFullScreen === true);
	},

	requestFullScreen: function(element) {
		if (!element) {
			element = this.el;
		}
		if (!element) {
			element = document.documentElement;
		}

		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(element.ALLOW_KEYBOARD_INPUT);
		}
	},

	exitFullScreen: function() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	},

	toggleFullScreen: function(element) {
		if (this.isFullScreen()) {
			this.exitFullScreen();
		} else {
			this.requestFullScreen(element);
		}
	}
};