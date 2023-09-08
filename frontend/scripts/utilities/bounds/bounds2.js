/******************************************************************************\
|                                                                              |
|                                    bounds2.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines two dimensional set of bounds.                           |
|                                                                              |
|******************************************************************************|
|                Opticosm - Copyright (c) 2015, Abe Megahed                    |
\******************************************************************************/

import Vector2 from '../../utilities/math/vector2.js';
import Bounds from '../../utilities/bounds/bounds.js';

export default class Bounds2 {

	constructor(x, y) {
		if (x == undefined) {
			x = new Bounds();
		}
		if (y == undefined) {
			y = new Bounds();
		}

		// set attributes
		//
		this.x = x;
		this.y = y;
	}

	//
	// setting methods
	//

	extendTo(value) {
		this.x.extendTo(value.x);
		this.y.extendTo(value.y);
	}

	//
	// querying methods
	//

	center() {
		return new Vector2(this.x.mean(), this.y.mean());
	}

	size() {
		return new Vector2(this.x.size(), this.y.size());
	}

	contains(value) {
		return this.x.contains(value.x) && this.y.contains(value.y);
	}

	overlaps(bounds) {
		return this.x.overlaps(bounds) && this.y.overlaps(bounds);
	}
}