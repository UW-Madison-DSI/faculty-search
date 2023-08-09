/******************************************************************************\
|                                                                              |
|                              tooltip-showable.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a selectable, unscaled marker element.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Browser from '../../../utilities/web/browser.js';
import '../../../../vendor/bootstrap/js/tooltip.js';

export default {

	// tooltip attributes
	//
	tooltip_title: 'Tooltip',
	tooltip_trigger: 'hover',
	tooltip_placement: 'top',
	tooltip_container: 'body',

	//
	// methods
	//

	showTooltips: function() {
		if (this.tooltips) {
			this.tooltips.tooltip('show');
		}
	},

	hideTooltips: function() {
		if (this.tooltips) {
			this.tooltips.tooltip('hide');
		}
	},

	//
	// rendering methods
	//

	addTooltips: function(options) {
		if (Browser.is_mobile) {
			return;
		}

		let $el = this.tooltip_target? this.$el.find(this.tooltip_target) : this.$el;

		this.tooltips = $el.find('[data-toggle="tooltip"]');

		// show tooltips on trigger
		//
		this.tooltips.addClass('tooltip-trigger').tooltip(_.extend(this.options, {
			trigger: this.tooltip_trigger,
			placement: this.tooltip_placement,
			container: this.tooltip_container
		}, options));
	},

	removeTooltips: function() {
		$('body').find('.tooltip').remove();
	}
};