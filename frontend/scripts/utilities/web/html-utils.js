/******************************************************************************\
|                                                                              |
|                                html-utils.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose HTML formatting utilities.        |
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
	// string formatting methods
	//

	returnify: function(string) {
		if (!string) {
			return;
		}

		// replace carriage returns
		//
		return string.replace(/(?:\r\n|\r|\n)/g, '<br />');
	},

	htmlToText: function(html) {
		html = html.replace(/<br>/g, '\n');
		let tmp = document.createElement('div');
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	},

	textToHtml: function(text) {
		if (text) {
			text = text.replace(/\n/g, '<br>');
		}
		return text;
	},

	breakify: function(string) {
		if (!string) {
			return;
		}

		// allow strings to break after dashes
		//
		string = string.replace(/-/g, '-<wbr>');

		// allow strings to break after slashes
		//
		string = string.replace(/\//g, '/<wbr>');

		// allow strings to break before dots
		//
		string = string.replace(/\./g, '<wbr>.');

		// allow strings to break before underscores
		//
		string = string.replace(/_/g, '<wbr>_');

		// allow strings to break before at signs
		//
		string = string.replace(/@/g, '<wbr>@');

		return string;
	},

	breakifyCamelCase: function(string) {
		if (!string) {
			return;
		}

		let substrings = [];
		let i = 0;
		while (i < string.length - 1) {
			let lowercase = /[a-z]/.test(string[i]);
			if (lowercase) {
				let uppercase = /[A-Z]/.test(string[i + 1]);
				if (uppercase) {

					// break at case change
					//
					substrings.push(string.substring(0, i + 1));
					string = string.substring(i + 1, string.length);
					i = 0;
				} else {
					i++;
				}
			} else {
				i++;
			}
		}
		// add remainder of string
		//
		if (substrings.length > 0) {
			substrings.push(string);
		}
		// reassemble string
		//
		if (substrings.length > 0) {
			string = this.concat(substrings);
		}
		return string;
	},

	concat: function(substrings) {
		let string = '';
		for (let i = 0; i < substrings.length; i++) {
			string += substrings[i];
			if (i < substrings.length - 1) {
				string += '<wbr>';
			}
		}
		return string;
	},

	linkify: function(text) {

		// URLs starting with http://, https://, or ftp://
		//
		text = text.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, '<a href="$1" target="_blank">$1</a>');

		// URLs starting with www. (without // before it, or it'd re-link the ones done above)
		//
		text = text.replace(/(^|[^\/])(www\.[\S]+(\b|$))/gim, '$1<a href="http://$2" target="_blank">$2</a>');
		
		// change email addresses to mailto:: links
		//
		text = text.replace(/(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim, '<a href="mailto:$1">$1</a>');
		return text;
	},

	encode: function(string) {
		if (!string) {
			return;
		}

		// convert carriage returns
		//
		string = this.returnify(string);

		// allow strings to break at breakpoints
		//
		string = this.breakify(string);

		// allow strings to break at case changes
		//
		//string = this.breakifyCamelCase(string);
		return string;
	},

	encodeEmail: function(email) {
		if (!email) {
			return;
		}
		return '<a href="mailto:' + email + '">' + this.encode(email) + '</a>';
	}
};