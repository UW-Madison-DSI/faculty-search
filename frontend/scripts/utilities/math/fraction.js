/******************************************************************************\
|                                                                              |
|                                 fraction.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a class for helping with unit conversions.                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

//
// constructor
//

function Fraction(numerator, denominator) {

	// set attributes
	//
	this.numerator = numerator;
	this.denominator = denominator;
	return this;
}

_.extend(Fraction.prototype, {

	//
	// querying methods
	//

	value: function() {
		return this.numerator / this.denominator;
	},

	parse: function(string) {
		let terms = string.split('/');
		this.numerator = terms[0];
		this.denominator = terms[1];
		return this;
	},

	//
	// converting methods
	//

	toString: function() {
		return this.numerator + ' / ' + this.denominator;
	}
});

export default Fraction;
