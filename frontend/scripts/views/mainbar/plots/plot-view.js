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
import Browser from '../../../utilities/web/browser.js';

export default BaseView.extend({

	//
	// attributes
	//

	id: 'vega',

	template: template(``),

	//
	// getting methods
	//

	getWidth: function() {
		return this.parent.$el.width();
	},

	getHeight: function() {
		return this.parent.$el.height();
	},

	//
	// rendering methods
	//

	onAttach: function () {

		// wait for layout to finish
		//
		window.setTimeout(() => {
			this.update();
		}, 100);
	},

	update: function () {
		let width = this.getWidth();
		let height = this.getHeight();

		vegaEmbed("#vega", this.options.json, {
			theme: $('body').hasClass('dark')? 'dark' : 'light',
			actions: false,
			width: width - 10,
			height: height - 100
		})
			.then(function (result) { })
			.catch(console.error);
	},

	//
	// window event handling methods
	//

	onResize: function () {
		this.update();
	}
});