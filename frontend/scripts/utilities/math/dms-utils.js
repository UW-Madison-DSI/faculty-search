/******************************************************************************\
|                                                                              |
|                                dms-utils.js                                  |
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

import Fraction from '../../utilities/math/fraction.js';

export default {

	//
	// array to degrees conversion
	//

	toDegrees: function(dms, format) {
		switch (format) {

			// convert dms string array in the form: 
			// [float float float]
			//
			case 'decimal':
				return this.toDegrees([
					parseFloat(dms[0]),
					parseFloat(dms[1]),
					parseFloat(dms[2])
				]);

			// convert dms string array in the form: 
			// [<float> deg <float>' <float>"]
			//
			case 'units':
				return this.toDegrees([
					dms[0],
					dms[2].replace("'", ''),
					dms[3].replace('"', '')
				], 'decimal');

			// convert dms string array in the form: 
			// [<fraction> <fraction> <fraction>]
			//
			case 'fractions':
				return this.toDegrees([
					new Fraction().parse(dms[0]).value(),
					new Fraction().parse(dms[1]).value(),
					new Fraction().parse(dms[2]).value()
				]);

			// convert dms string array in the form: 
			// [<fraction> deg <fraction>' <fraction>"]
			//
			case 'fractions/units':
				return this.toDegrees([
					dms[0],
					dms[2].replace("'", ''),
					dms[3].replace('"', '')
				], 'fractions');

			// convert numerical dms array to degrees
			//
			default:
				return dms[0] + (dms[1] / 60) + (dms[2] / 3600);
		}
	},

	//
	// string to degrees conversions
	//

	parse: function(string, format) {
		return this.toDegrees(string.split(' '), format);
	}
};
