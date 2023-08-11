(function($) {
	var insertAtCaret = function(value) {

		// check if text region is empty
		//
		if ($(this).html() == '') {
			$(this).html(value);
			return;
		}

		// insert text at caret
		//
		var selection, range;
		if (window.getSelection) {
			selection = window.getSelection();
			if (selection.getRangeAt && selection.rangeCount) {
				range = selection.getRangeAt(0);
				range.deleteContents();
				var startPosition = range.startOffset;
				var endPosition = range.endOffset;
				var selectedNode = selection.anchorNode;

				var html = '';
				var parent = selection.anchorNode.parentNode;
				for (var i = 0; i < parent.childNodes.length; i++) {
					var childNode = parent.childNodes[i];
					switch (childNode.nodeName) {

						case 'BR':
							html += '<br>';
							break;

						case '#text':
							var text = childNode.nodeValue;
							if (childNode == selectedNode) {	
								html += text.substring(0, startPosition) + value + text.substring(endPosition, text.length);
							} else {
								html += text;
							}
							break;

					}
				}

				$(this).html(html);
				$(this).setCaretAtEnd();
				// $(this).setCaretAt(startPosition + value.length);
			}
		} else if (document.selection && document.selection.createRange) {
			document.selection.createRange().text = value;
		}
	};

	$.fn.setCaretAt = function(position) {
		last = this[this.length - 1];
		if (last.childNodes.length > 0) {
			var range = document.createRange();
			var selection = window.getSelection();
			range.setStart(last.childNodes[last.childNodes.length - 1], position);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	};

	$.fn.insertAtCaret = function(value) {
		$(this).each(function() {
			insertAtCaret.call(this, value);
		});
	};

	$.fn.setCaretAtEnd = function(value) {
		$(this).each(function() {
			if (this.childNodes.length > 0) {
				var length = this.childNodes[this.childNodes.length - 1].length;
				if (length > 0) {
					$(this).setCaretAt(length);
				}
			}
		});
	};
})(jQuery);