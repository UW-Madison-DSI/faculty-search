export default {
	input: '../scripts/main.js',

	output: {
		format: 'es',
		dir: '../../frontend-built/scripts',
		inlineDynamicImports: false,
		chunkFileNames: '[name].js'
	},

	manualChunks: {

		// library chunks
		//
		'jquery': ['../library/jquery/jquery-3.6.0.js'],
		'lodash': ['../library/lodash/lodash.js'],
		'backbone': ['../library/backbone/backbone.js'],
		'marionette': ['../library/backbone/marionette/backbone.marionette.js'],
		'underscore': ['../library/underscore/underscore.js'],

		// vendor chunks
		//
		'splitjs': ['../vendor/split-js/split.js']
	}
};