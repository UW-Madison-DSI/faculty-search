/******************************************************************************\
|                                                                              |
|                              not-found-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the 404 / file not found view of the application.        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//
	

	template: template(`
		<h1><i class="fa fa-info-exclamation-triangle"></i>404</h1>
		
		<ol class="breadcrumb">
			<li><i class="fa fa-exclamation-triangle"></i>404</li>
		</ol>
		
		<div style="text-align:center">
			<h2>Oops!</h2>
			<a href="#home"><i class="fa fa-bug" style="font-size:100px"></i></a>
		</div>
		<br />
		
		<div class="content">
			<i class="alert-icon fa fa-3x fa-question-circle" style="float:left; margin:10px; margin-right:20px"></i>
			<h2><%= title %></h2>
			<% if (message) { %>
			<p><%= message %></p>
			<% } else { %>
			<p>The item that you are looking for can not be found.</p>
			<% } %>
		</div>
	`),

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			title: this.options.title || 'Item Not Found',
			message: this.options.message
		};
	}
});
