/******************************************************************************\
|                                                                              |
|                             credits-dialog-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an notification dialog that is used to show a            |
|        modal notifiction / alert dialog box displaying an error.             |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../views/dialogs/dialog-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="modal-header error">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<i class="fa fa-star" style="color:goldenrod"></i>
				Credits
			</h1>
		</div>
		
		<div class="modal-body">
			<div class="credits">
				<% let keys = Object.keys(defaults.credits); %>
				<% for (let i = 0; i < keys.length; i++) { %>
				<p>
					<span class="credit"><%= keys[i] %></span>
					<span class="name"><%= defaults.credits[keys[i]] %></span>
				</p>
				<% } %>
			</div>
		</div>
		
		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
		</div>
	`),

	events: {
		'keydown': 'onKeyDown'
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function() {
		this.hide();
	}
});
