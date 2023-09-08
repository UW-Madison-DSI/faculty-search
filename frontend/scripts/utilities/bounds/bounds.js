/******************************************************************************\
|                                                                              |
|                                    bounds.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a one dimensional set of bounds.                         |
|                                                                              |
|******************************************************************************|
|                Opticosm - Copyright (c) 2015, Abe Megahed                    |
\******************************************************************************/

export default class Bounds {

	constructor(min, max) {

		// set attributes
		//
		this.min = min;
		this.max = max;
	}

	//
	// setting methods
	//

	extendTo(value) {
		if (!this.min || value < this.min) {
			this.min = value;
		}
		if (!this.max || value > this.max) {
			this.max = value;
		}
	}

	//
	// querying methods
	//

	mean() {
		return (this.min + this.max) / 2;
	}

	size() {
		return this.max - this.min;
	}

	contains(value) {
		return (value >= this.min && value <= this.max);
	}

	overlaps(bounds) {
		return this.contains(bounds.min) || this.contains(bounds.max) || 
			bounds.contains(this.max) || bounds.contains(this.min);
	}
}