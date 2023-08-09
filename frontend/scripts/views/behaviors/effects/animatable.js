/******************************************************************************\
|                                                                              |
|                                animatable.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a set of animation behaviors.                            |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	//
	// attributes
	//

	animated: true,

	//
	// animation methods
	//

	grow: function() {
		this.is_visible = true;

		// add style
		//
		this.$el.find('circle').addClass('growing-bounce');

		// wait for duration
		//
		window.setTimeout(() => {

			// remove style
			//
			this.$el.find('circle').removeClass('growing-bounce');
		}, 300);
	},

	shrink: function() {

		// add style
		//
		this.$el.find('circle').addClass('shrinking-bounce');

		// wait for duration
		//
		window.setTimeout(() => {

			// remove style
			//
			this.$el.find('circle').removeClass('shrinking-bounce');
			this.is_visible = false;
		}, 300);
	},

	//
	// hide / show methods
	//

	show: function(options) {
		if (this.animated) {
			if (this.is_visible != true) {
				this.$el.fadeIn(options);
				this.grow();
			}
		} else {
			this.$el.removeClass('hidden');
		}		
	},

	hide: function(options) {
		if (this.animated) {
			if (this.is_visible != false) {
				this.$el.fadeOut(options);
				this.shrink();
			}
		} else {
			this.$el.addClass('hidden');
		}		
	}
};