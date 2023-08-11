/******************************************************************************\
|                                                                              |
|                                    url.js                                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file contains some javascript utilities that are used to         |
|        deal with strings used for urls.                                      |
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
	
	encode: function(string) {
		if (!string) {
			return;
		}

		/*
		if (encodeURIComponent) {
			return encodeURIComponent(string);	
		}
		*/

		// This function uses a regular expression to specify
		// a global search and replace within the string.
		//
		// The syntax takes the form of: string.replace(/findstring/g, newstring)
		// where the "g" signifies the global search and replace.
		//
		// There are 11 special "metacharacters" that are used in regular
		// expressions that require an extra backslash in front of them to specify.
		// These characters include: the opening square bracket [, the backslash \, 
		// the caret ^, the dollar sign $, the period or dot ., the vertical bar 
		// or pipe symbol |, the question mark ?, the asterisk or star *, the plus 
		// sign +, the opening round bracket ( and the closing round bracket ). 
		//

		let url = string;
		url = url.replace(/%/g, '%25');
		url = url.replace(/ /g, '%20');
		// url = url.replace(/~/g, '%7E');
		url = url.replace(/`/g, '%60');
		// url = url.replace(/!/g, '%33'); 
		url = url.replace(/@/g, '%40'); 
		url = url.replace(/#/g, '%23'); 
		url = url.replace(/\$/g, '%24');
		url = url.replace(/\^/g, '%5E'); 
		url = url.replace(/&/g, '%26');
		url = url.replace(/\*/g, '%2A');
		url = url.replace(/\(/g, '%28');
		url = url.replace(/\)/g, '%29');
		// url = url.replace(/-/g, '%2D');							
		url = url.replace(/\+/g, '%2B');
		url = url.replace(/=/g, '%3D'); 
		url = url.replace(/{/g, '%7B'); 
		url = url.replace(/}/g, '%7D'); 
		url = url.replace(/\[/g, '%5B'); 
		url = url.replace(/]/g, '%5D'); 
		url = url.replace(/\|/g, '%7C'); 
		url = url.replace(/\\/g, '%5C'); 
		url = url.replace(/:/g, '%3A'); 
		url = url.replace(/;/g, '%3B');
		url = url.replace(/"/g, "%22"); 
		url = url.replace(/'/g, "%27"); 
		url = url.replace(/</g, '%3C'); 
		url = url.replace(/>/g, '%3E'); 
		url = url.replace(/,/g, '%2C');
		// url = url.replace(/\./g, '%2E'); 
		url = url.replace(/\?/g, '%3F');  
		url = url.replace(/\//g, '%2F'); 

		return url;
	},

	encodeAll: function(strings) {
		let urls = new Array(strings.length);
		for (let i = 0; i < strings.length; i++) {
			urls[i] = this.encode(strings[i]);
		}
		return urls;
	},

	decode: function(url) {
		if (!url) {
			return;
		}
		
		/*
		if (decodeURIComponent) {
			return decodeURIComponent(string);	
		}
		*/

		let string = url;
		string = string.replace(/%20/g, ' ');
		// string = string.replace(/%7E/g, '~');
		string = string.replace(/%60/g, '`');
		// string = string.replace(/%33/g, '!'); 
		string = string.replace(/%40/g, '@'); 
		string = string.replace(/%23/g, '#'); 
		string = string.replace(/%24/g, '$');
		string = string.replace(/%5E/g, '^'); 
		string = string.replace(/%26/g, '&');
		string = string.replace(/%2A/g, '*');
		// string = string.replace(/%28/g, '(');
		// string = string.replace(/%29/g, ')');
		string = string.replace(/%2D/g, '-');							
		string = string.replace(/%2B/g, '+');
		string = string.replace(/%3D/g, '='); 
		string = string.replace(/%7B/g, '{'); 
		string = string.replace(/%7D/g, '}'); 
		string = string.replace(/%5B/g, '['); 
		string = string.replace(/%5D/g, ']'); 
		string = string.replace(/%7C/g, '|'); 
		string = string.replace(/%5C/g, '\\');
		string = string.replace(/%3A/g, ':'); 
		string = string.replace(/%3B/g, ';');
		string = string.replace(/%22/g, '"'); 
		string = string.replace(/%27/g, "'"); 
		string = string.replace(/%3C/g, '<'); 
		string = string.replace(/%3C/g, '>'); 
		string = string.replace(/%2C/g, ',');
		// string = string.replace(/%2E/g, '.'); 
		string = string.replace(/%3F/g, '?');   
		string = string.replace(/%2F/g, '/'); 
		string = string.replace(/%25/g, '%');
		
		return string;
	},

	decodeAll: function(urls) {
		let strings = new Array(urls.length);
		for (let i = 0; i < urls.length; i++) {
			strings[i] = this.decode(urls[i]);
		}
		return strings;
	},

	encodeText: function(text) {
		if (typeof(text) == 'string') {
		
			// string text
			//
			return this.encode(text);
		} else if (text.length == 1) {
		
			// single line text
			//
			return this.encode(text[0]);
		} else {
			
			// multi line text
			//  
			let url = '';
			for (let i = 0; i < text.length; i++) {
				url += this.encode(text[i]);
				if (i < text.length - 1) {
					url += '%12';
				}
			}
		
			return url;
		}
	},

	decodeText: function(url) {
		let words = url.split('%');
		let text = [];
		let lines = 1;
		text[lines - 1] = words[0];
		
		for (let i = 1; i < words.length; i++) {
			let code = '%' + words[i].substring(0, 2);
			
			// check each escape code
			//
			if (code == '%12') {
				
				// start new line
				//
				lines += 1;
				text[lines - 1] = words[i].substring(2, words[i].length);	  
			} else {
			
				// add to existing line
				//
				text[lines - 1] += this.decode(code) + words[i].substring(2, words[i].length);
			}
		}
		
		return text;
	},

	getHostname: function(url) {
		let hostname;

		if (!url) {
			return;
		}

		// find & remove protocol (http, ftp, etc.) and get hostname
		//
		if (url.indexOf("//") > -1) {
			hostname = url.split('/')[2];
		} else {
			hostname = url.split('/')[0];
		}

		// find & remove port number
		//
		hostname = hostname.split(':')[0];

		// find & remove "?"
		//
		hostname = hostname.split('?')[0];

		return hostname;
	},

	getHostUrl: function(url) {
		let protocol;

		if (!url) {
			return;
		}

		// add local domain
		//
		if (url.startsWith('#')) {
			url = application.getUrl() + '/' + url;
		}

		// find & remove protocol (http, ftp, etc.) and get hostname
		//
		if (url.indexOf("//") > -1) {
			protocol = url.split('//')[0] + '//';
			url = url.split('//')[1];
		} else {
			protocol = 'http://';
		}

		// find & remove deferences
		//
		if (url.indexOf("/") > -1) {
			url = url.split('/')[0];
		}

		// find & remove port number
		//
		url = url.split(':')[0];

		// find & remove "?"
		//
		url = url.split('?')[0];

		return protocol + url;
	},
};