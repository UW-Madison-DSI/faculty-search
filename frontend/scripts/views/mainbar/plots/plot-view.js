/******************************************************************************\
|                                                                              |
|                                 plot-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a plot.                                        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2022, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	id: 'vega',

	template: template(``),

	onAttach: function() {
		this.plot();
	},

	plot: function() {
		let width = this.$el.parent().parent().parent().width();

		vegaEmbed("#vega", this.options.json, {
				theme: "dark",
				actions: false,
				width: width
			})
			.then(function (result) {})
			.catch(console.error);
	},

	//
	// window event handling methods
	//

	onResize: function() {
		this.plot();
	}
});