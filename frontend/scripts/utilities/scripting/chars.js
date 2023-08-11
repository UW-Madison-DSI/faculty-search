/******************************************************************************\
|                                                                              |
|                                    chars.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose character definitions.            |
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
	vowels: ['a', 'e', 'i', 'o', 'u'],
	vowels2: ['a', 'e', 'i', 'o', 'u', 'y'],

	// special chars
	//
	space: ' ',
	backspace: '\b',
	carriageReturn: '\n',
	formFeed: '\f',
	tab: '\t',
	verticalTab: '\v',
	whitespace: [' ', '\t'],
	blank: [' ', '\b', '\n', '\f', '\t',  '\v'],
	break: ['\n', '\f']
};