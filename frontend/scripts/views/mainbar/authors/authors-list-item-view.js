/******************************************************************************\
|                                                                              |
|                         authors-list-item-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a single journal article author.               |
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

	tagName: 'li',

	template: _.template(`
		<a class="name">
			<span class="last"><%= last_name %></span>,
			<span class="first"><%= first_name %></span>
		</a>

		<div class="details">
			<a href="<%= url %>" target="_blank">
				<i class="fa fa-user" data-toggle="tooltip" title="Show UW Profile"></i>
			</a>
			<a href="<%= search_url %>" target="_blank">
				<i class="fa fa-search" data-toggle="tooltip" title="Search UW Directory"></i>
			</a>
			<a href="<%= map_url %>" target="_blank">
				<i class="fa fa-map" data-toggle="tooltip" title="Show on Map"></i>
			</a>
		</div>
	`),

	events: {
		'click .name': 'onClickName'
	},

	//
	// getting methods
	//

	getName: function() {
		return this.model.get('first_name') + '+' + this.model.get('last_name');
	},

	getUrl: function() {
		let url = 'https://wisc.discovery.academicanalytics.com/search/stack';
		let queryString = 'query=' + this.getName() + '&searchType=Name';
		return url + '?' + queryString;
	},

	getSearchUrl: function() {
		let url = 'https://www.wisc.edu/search/';
		let queryString = 'q=' + this.getName();
		return url + '?' + queryString;
	},

	getMapUrl: function() {
		let url = 'https://datascience.sharedigm.com/cmap/';
		let queryString = 'query=' + this.getName() + '&category=people';
		return url + '?' + queryString;
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			url: this.getUrl(),
			map_url: this.getMapUrl(),
			search_url: this.getSearchUrl()
		}
	},

	onRender: function() {

		// add tooltip triggers
		//
		this.addTooltips();
	},

	//
	// mouse event handling methods
	//

	onClickName: function() {

		// perform callback
		//
		if (this.options.onclick) {
			this.options.onclick(this.model);
		}
	}
});