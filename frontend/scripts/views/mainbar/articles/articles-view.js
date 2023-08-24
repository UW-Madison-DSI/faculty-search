/******************************************************************************\
|                                                                              |
|                                articles-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a collection of journal articles.              |
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
import ArticlesTableView from '../../../views/mainbar/articles/tables/articles-table-view.js';
import PlotView from '../../../views/mainbar/plots/plot-view.js';
import '../../../../vendor/bootstrap/js/tab.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'tabbed-content',

	template: _.template(`

		<ul class="nav nav-tabs" role="tablist">

			<li role="presentation" class="list-tab<% if (tab == 'list' || !tab) { %> active<% } %>">
				<a role="tab" data-toggle="tab" href=".list">
					<i class="fa fa-list"></i>
					<label>List</label>
				</a>
			</li>

			<% if (plot) { %>
			<li role="presentation" class="plot-tab<% if (tab == 'plot') { %> active<% } %>">
				<a role="tab" data-toggle="tab" href=".plot">
					<i class="fa fa-chart-line"></i>
					<label>Plot</label>
				</a>
			</li>
			<% } %>
		</ul>

		<div class="tab-content">

			<div role="tabpanel" class="list tab-pane<% if (tab == 'list' || !tab) { %> active<% } %>">
				<div class="list"></div>
			</div>

			<div role="tabpanel" class="plot tab-pane<% if (tab == 'plot') { %> active<% } %>">
				<div class="plot"></div>
			</div>
		</div>
	`),

	regions: {
		list: '.tab-pane .list',
		plot: '.tab-pane .plot'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			tab: this.options.tab,
			plot: this.options.plot
		}
	},

	onRender: function() {
		this.showList();
	},

	onAttach: function() {
		if (this.options.plot) {
			this.showPlot(this.options.plot);
		}
	},

	showList: function() {
		this.showChildView('list', new ArticlesTableView({
			collection: this.collection
		}));
	},

	showPlot: function(plot) {
		this.showChildView('plot', new PlotView({
			json: plot
		}));
	},

	//
	// window event handling methods
	//

	onResize: function() {
		this.getChildView('plot').onResize();
	}
});