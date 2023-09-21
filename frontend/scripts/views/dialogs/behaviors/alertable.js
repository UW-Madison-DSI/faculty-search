/******************************************************************************\
|                                                                              |
|                                 alertable.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application.                               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2023, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import ErrorDialogView from '../../../views/dialogs/error-dialog-view.js';
import NotifyDialogView from '../../../views/dialogs/notify-dialog-view.js';
import StatusDialogView from '../../../views/dialogs/status-dialog-view.js';
import ConfirmDialogView from '../../../views/dialogs/confirm-dialog-view.js';
import DownloadDialogView from '../../../views/dialogs/download-dialog-view.js';

export default {

	//
	// dialog rendering methods
	//

	showDialog: function(dialogView, options) {
		if (this.dialogView) {
			this.dialogView.hide();
		}
		this.dialogView = dialogView.show(options);
	},

	error: function(options) {
		this.showDialog(new ErrorDialogView(options));
	},

	notify: function(options) {
		this.showDialog(new NotifyDialogView(options));
	},

	status: function(options) {
		this.showDialog(new StatusDialogView(options));
	},

	confirm: function(options) {
		this.showDialog(new ConfirmDialogView(options));
	},

	download: function(options) {
		this.showDialog(new DownloadDialogView(options));
	}
}