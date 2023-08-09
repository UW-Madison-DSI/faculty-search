/******************************************************************************\
|                                                                              |
|                                 string-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose string formatting utilities.      |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Chars from './chars.js';

//
// querying methods
//

String.prototype.isCapitalized = function() {
	return /^[A-Z]/.test(this);
};

String.prototype.isUpperCase = function() {
	return this === this.toUpperCase();
};

String.prototype.numWords = function() {
	return this.split(' ').length;
};

//
// inspecting methods
//

String.prototype.startsWith = function(prefix) {
	if (prefix) {
		let from = 0;
		let to = prefix.length;
		return prefix == this.substring(from, to);
	}
};

String.prototype.endsWith = function(suffix) {
	if (suffix) {
		let from = this.length - suffix.length;
		let to = this.length;
		return suffix == this.substring(from, to);
	}
};

String.prototype.contains = function(content, caseSensitive) {

	// set optional parameter defaults
	//
	if (caseSensitive == undefined) {
		caseSensitive = true;
	}
	if (Array.isArray(content)) {
		let string = this;
		if (!caseSensitive) {
			string = this.toLowerCase();
		}
		for (let i = 0; i < content.length; i++) {
			if (caseSensitive) {
				if (this.contains(content[i])) {
					return true;
				}
			} else {
				if (string.contains(content[i].toLowerCase())) {
					return true;
				}
			}
		}
		return false;
	} else {
		if (caseSensitive) {
			return this.indexOf(content) != -1;
		} else {
			return this.toLowerCase().indexOf(content.toLowerCase()) != -1;
		}
	}
};

String.prototype.firstWords = function(number) {
	if (this.numWords() > number) {
		return this.split(' ', number).join(' ') + '...';
	} else {
		return this;
	}
};

//
// editing methods
//

String.prototype.truncatedTo = function(maxChars) {
	if (this.length > maxChars) {
		return this.slice(0, maxChars) + '...';
	} else {
		return this;
	}
};

String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index, character.length);
};

String.prototype.ltrim = function(substring) {
	if (substring == undefined) {
		substring = '\\s';
	}
	return this.replace(new RegExp("^[" + substring + "]*"), '');
};

String.prototype.rtrim = function(substring) {
	if (substring == undefined) {
		substring = '\\s';
	}
	return this.replace(new RegExp("[" + substring + "]*$"), '');
};

String.prototype.ltrimmed = function() {
	let numLeadingChars = this.length - this.trimLeft().length;
	return this.substr(0, numLeadingChars);
};

String.prototype.rtrimmed = function() {
	let numTrailingChars = this.length - this.trimRight().length;
	return this.substr(this.length - numTrailingChars, this.length);
};

String.prototype.trimLines = function() {
	let lines = this.split("\n");
	let output = [];
	let indentation = undefined;
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// skip first blank line
		//
		if (i == 0 && line == "") {
			continue;
		}
		if (indentation == undefined) {
			indentation = line.ltrimmed();
		}
		line = line.replace(indentation, '');

		// skip last blank line
		//
		if (i == lines.length - 1 && line.trim().length == 0) {
			continue;
		}

		// add processed line
		//
		output.push(line);
	}
	return output.join("\n");
};

//
// converting methods
//

String.prototype.toTitleCase = function() {
	let words = this.split(' ');
	for (let i = 0; i < words.length; i++) {
		let word = words[i];
		let isAcronym = word.length > 1 && !word.contains(Chars.vowels2, false);
		if (isAcronym) {
			words[i] = word.toUpperCase();
		} else if (i == 1 || word.length > 2) {
			words[i] = word.capitalized();
		}		
	}
	return words.join(' ');
};

String.prototype.capitalized = function() {
	return this.replace( /(^|\s)([a-z])/g , (m, p1, p2) => {
		return p1 + p2.toUpperCase();
	});
};

String.prototype.toPlural = function(number) {
	if (number == 1) {
		return number + ' ' + this;
	} else {
		return number + ' ' + this + 's';
	}
};

String.prototype.toCodePoints = function() {
	let chars = [];
	for (let i = 0; i < this.length; i++) {
		let c1 = this.charCodeAt(i);
		if (c1 >= 0xD800 && c1 < 0xDC00 && i + 1 < this.length) {
			let c2 = this.charCodeAt(i + 1);
			if (c2 >= 0xDC00 && c2 < 0xE000) {
				chars.push(0x10000 + ((c1 - 0xD800) << 10) + (c2 - 0xDC00));
				i++;
				continue;
			}
		}
		chars.push(c1);
	}
	return chars;
};