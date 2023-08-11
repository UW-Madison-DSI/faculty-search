(function($) {

  // Based on https://gist.github.com/asgeo1/1652946

  /**
   * Bind an event handler to a "double tap" JavaScript event.
   * @param {function} handler
   * @param {number} [delay=300]
   */
  $.fn.doubletap = $.fn.doubletap || function(handler, delay) {
    delay = delay == null ? 300 : delay;
    this.bind('touchend', function(event) {
      var now = new Date().getTime();
      // The first time this will make delta a negative number.
      var lastTouch = $(this).data('lastTouch') || now + 1;
      var delta = now - lastTouch;
      if (delta < delay && 0 < delta) {
        // After we detect a doubletap, start over.
        $(this).data('lastTouch', null);
        if (handler !== null && typeof handler === 'function') {
          handler(event);
        }
      } else {
        $(this).data('lastTouch', now);
      }
    });
  };

})(jQuery);