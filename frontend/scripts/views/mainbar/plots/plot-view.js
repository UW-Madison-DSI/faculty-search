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

import BaseView from "../../../views/base-view.js";
import Browser from "../../../utilities/web/browser.js";

export default BaseView.extend({
	//
	// attributes
	//

	id: "vega",

	template: template(``),

	//
	// constructor
	//

	initialize: function () {
		// listen for color scheme changes
		//
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (event) => {
				this.update();
			});
	},

	//
	// getting methods
	//

	getWidth: function () {
		let $el = this.$el;
		while ($el && $el.width() == 0) {
			$el = $el.parent();
		}
		return $el ? $el.width() : undefined;
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
		vegaEmbed("#vega", this.options.json, {
			theme: Browser.isDarkModeEnabled() ? "dark" : "light",
			actions: false,
			width: width - 145,
		})
			.then(function (result) { })
			.catch(console.error);
	},

	//
	// window event handling methods
	//

	onResize: function () {
		this.update();
	},
});
