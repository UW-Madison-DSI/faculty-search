/******************************************************************************\
|                                                                              |
|                           options-panel-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the sidebar options panel view.                          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'display panel',

	template: _.template(`
		<div class="header">
			<label><i class="fa fa-desktop"></i>Display</label>
		</div>

		<br />

		<div class="theme form-group">
			<label class="control-label">Theme</label>
			<div class="controls">
				<div class="radio-inline">
					<label><input type="radio" name="theme" value="auto"<% if (theme == 'auto') { %> checked<% } %>>Auto</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="theme" value="light"<% if (theme == 'light') { %> checked<% } %>>Light</label>
				</div>
				<div class="radio-inline">
					<label><input type="radio" name="theme" value="dark"<% if (theme == 'dark') { %> checked<% } %>>Dark</label>
				</div>
			</div>
		</div>
	`),

	events: {
		'change .theme input': 'onChangeTheme'
	},

	//
	// getting methods
	//

	getValue: function(key) {
		switch (key) {
			case 'theme':
				return this.$el.find('.theme input:checked').val();
		}
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			theme: localStorage.getItem('theme') || 'auto'
		};
	},

	onRender: function() {
		application.setTheme( this.getValue('theme'))
	},

	//
	// mouse event handling methods
	//

	onChangeTheme: function() {
		let theme = this.getValue('theme');

		// save value for later
		//
		localStorage.setItem('theme', theme);

		// update view
		//
		application.setTheme(theme);
	}
});