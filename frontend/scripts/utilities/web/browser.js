/******************************************************************************\
|                                                                              |
|                                  browser.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains utilities for detecting differences between             |
|        different browsers.                                                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default class Browser {

	//
	// browser detection methods
	//

	static getName() {
		if (window.navigator.userAgent.indexOf("Edge") > -1) {
			return 'Edge';
		} else if (navigator.userAgent.indexOf('MSIE') > -1 ||
			navigator.userAgent.indexOf('.NET') > -1) {
			return 'Explorer';
		} else if (navigator.userAgent.indexOf('Chrome') > -1) {
			return 'Chrome';
		} else if (navigator.userAgent.indexOf('Firefox') > -1) {
			return 'Firefox';
		} else if (navigator.userAgent.indexOf("Safari") > -1) {
			return 'Safari';
		}
	}

	//
	// device detection methods
	//

	static getDevice() {
		let userAgent = navigator.userAgent || navigator.vendor || window.opera;
		let platform = navigator.platform;

		// check for iPhones
		//
		if (/iPhone/.test(userAgent) || /iPhone/.test(platform)) {
			return 'phone';

		// check for iPads
		//
		} else if (/iPad/.test(userAgent)) {
			return 'tablet';

		// check for other branded tablets
		//
		} else if (/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(userAgent)) {
			return $(window).width() < 480 || $(window).height() < 480? 'phone' : 'tablet';

		// check for other mobile devices
		//
		} else if (/Mobile/.test(userAgent)) {
			return $(window).width() < 480 || $(window).height() < 480? 'phone' : 'tablet';

		// assume desktop
		//
		} else {
			return 'desktop';
		}
	}

	static isTouchEnabled() {
		return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0) || this.isMobile();
	}

	static isMobile() {
		return ['phone', 'tablet'].includes(this.getDevice());
	}

	static isInIFrame() {
		return window.location !== window.parent.location;
	}

	//
	// OS detection methods
	//

	static getOs() {
		let userAgent = navigator.userAgent || navigator.vendor || window.opera;
		let platform = navigator.platform;

		if (userAgent.indexOf('iPhone') > -1 ||
			userAgent.indexOf('iPad') > -1 ||
			platform.indexOf('iPhone') > -1 || (
			platform.indexOf('iPad') > -1 ||
			platform.indexOf('iPod') > -1)) {
			return 'iOS';
		} else if (userAgent.indexOf('Windows') > -1) {
			return 'Windows';
		} else if (userAgent.indexOf('Macintosh') > -1) {
			return this.isTouchEnabled()? 'iOS' : 'Macintosh';
		} else if (userAgent.indexOf('Linux') > -1) {
			return 'Linux';
		} else if (userAgent.indexOf('Android') > -1) {
			return 'Android';
		}
	}

	static getMobileOs() {
		let userAgent = navigator.userAgent || navigator.vendor || window.opera;
		// Windows Phone must come first because its UA also contains "Android"
		//
		if (/windows phone/i.test(userAgent)) {
			return 'Windows Phone';
		} else if (/android/i.test(userAgent)) {
			return 'Android';
		} else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return 'iOS';
		}
	}

	//
	// feature detection methods
	//

	static isDarkModeEnabled() {
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	static onChangeColorScheme(callback) {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			callback(event.matches ? "dark" : "light")
		});
	}

	static supportsCors() {
		if ("withCredentials" in new XMLHttpRequest()) {
			return true;
		} else if (window.XDomainRequest) {
			return true;
		} else {
			return false;
		}
	}

	static supportsHTTPRequestUploads() {
		return window.XMLHttpRequest && ('upload' in new XMLHttpRequest());
	}

	static supportsFormData() {
		return (window.FormData !== null);
	}

	//
	// browser security querying methods
	//

	static sameDomain(url) {
		let a = document.createElement('a');
		a.href = url;

		return location.hostname === a.hostname && location.protocol === a.protocol;
	}

	static xFramesAllowed(headers) {
		for (let i = 0; i < headers.length; i++) {

			// split on first colon
			//
			let header = headers[i].split(/:(.+)/);

			// check key value pair
			//
			if (header.length > 1) {
				let key = header[0].toLowerCase();
				let value = header[1].trim();

				switch (key) {

					case 'x-frame-options':
						value = value.toLowerCase();
						if (value == 'sameorigin' || value == 'deny') {
							return false;
						}
						break;

					case 'access-control-allow-origin':
						if (value != '*' && value != '') {
							return false;
						}
						break;

					case 'x-xss-protection':
					case 'content-security-policy':
						return false;
				}
			}
		}
		return true;
	}

	//
	// mobile accessibility methods
	//

	static hideMobileKeyboard() {
		document.activeElement.blur();
	}

	//
	// downloading methods
	//

	static download(url) {

		// check if argument is an array
		//
		if (Array.isArray(url)) {
			this.downloadAll(url);
			return;
		}

		// create temporary link to simulate user event
		//
		let a = document.createElement("a");
		a.setAttribute('href', url);
		a.setAttribute('download', '');
		a.setAttribute('target', '_blank');
		a.click();
	}

	static downloadAll(urls) {

		// check arguments
		//
		if (!urls) {
			throw new Error('Browser::download: `urls` parameter is required.');
		}

		// download items with a delay between each one
		//
		let interval = setInterval((urls) => {
			let url = urls.pop();

			this.download(url);

			if (urls.length == 0) {
				clearInterval(interval);
			}
		}, 300, urls);
	}

	//
	// static attributes
	//

	static name = this.getName();
	static device = this.getDevice();
	static os = this.getOs();
	static mobile_os = this.getMobileOs();
	static is_dark_mode_enabled = this.isDarkModeEnabled();
	static color_scheme = this.isDarkModeEnabled()? 'dark' : 'light';
	static support_cors = this.supportsCors();
	static supports_http_request_uploads = this.supportsHTTPRequestUploads();
	static supports_form_data = this.supportsFormData();

	// flags
	//
	static is_mobile = this.isMobile();
	static is_touch_enabled = this.isTouchEnabled();
	static is_edge = window.navigator.userAgent.indexOf("Edge") > -1;
	static is_explorer = navigator.userAgent.indexOf('MSIE') > -1 ||
		navigator.userAgent.indexOf('.NET') > -1;
	static is_chrome = window.chrome != undefined;
	static is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
	static is_safari = navigator.userAgent.indexOf("Safari") > -1 && !window.chrome;
}