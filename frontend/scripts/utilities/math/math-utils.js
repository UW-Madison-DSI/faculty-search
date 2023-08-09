/******************************************************************************\
|                                                                              |
|                                   math-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a set of miscillaneous math utilities.                        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

Math.epsilon = 1.0e-6;

//
// extend math prototype
//

Math.sqr = function(number) {
	return number * number;
};

Math.sign = function(number) {
	return typeof number === 'number' ? number ? number < 0 ? -1 : 1 : number === number ? 0 : NaN : NaN;
};

Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
};

Math.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

Math.even = function(number) {
	return number % 2 == 0;
};

Math.odd = function(number) {
	return number % 2 == 1;
};

//
// functions not available in IE
//

if (!Math.log2) {
	Math.log2 = function(number) {
		return Math.log(number) / Math.log(2);
	};
}

if (!Math.trunc) {
	Math.trunc = function(number) {
		return number > 0? Math.floor(number) : Math.ceil(number);
	};
}

if (!Math.sinh) {
	Math.sinh = function(number) {
		return (Math.exp(number) - Math.exp(-number)) / 2;
	};
}

if (!Math.cosh) {
	Math.cosh = function(number) {
		return (Math.exp(number) + Math.exp(-number)) / 2;
	};
}

if (!Math.tanh) {
	Math.tanh = function(value) {
		return Math.sinh(value) / Math.cosh(value);
	};
}