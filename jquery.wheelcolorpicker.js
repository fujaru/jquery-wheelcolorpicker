/**
 * jQuery Wheel Color Picker
 * 
 * http://www.jar2.net/projects/jquery-wheelcolorpicker
 * 
 * Author : Fajar Chandra
 * Date   : 2016.01.04
 * 
 * Copyright © 2011-2016 Fajar Chandra. All rights reserved.
 * Released under MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
	
	// Contains public methods
	var methods = {};
	
	// Contains private methods
	var private = {};
	
	// Holds the color picker popup widget for use globally
	var g_Popup = null;
	
	// Holds the overlay element wrapped in jQuery
	var g_Overlay = null;
	
	// Coordinate of the top left page (mobile chrome workaround)
	var g_Origin = { left: 0, top: 0 };
	
	// Various workaround flags
	var BUG_RELATIVE_PAGE_ORIGIN = false; // top left of the page is not on (0,0), making window.scrollX/Y and offset() useless
	
	/**
	 * Function: wheelColorPicker
	 * 
	 * The wheelColorPicker function wrapper. Firing all functions and 
	 * setting/getting all options in this plugin should be called via 
	 * this function.
	 * 
	 * This function will look for the options parameter passed in, and 
	 * try to do something as specified in this order:
	 * 1. If no argument is passed, then initialize the plugin
	 * 2. If object is passed, then call setOptions()
	 * 3. If string is passed, then try to fire a method with that name
	 * 4. If string is passed and no method matches the name, then try 
	 *    to set/get an option with that name
	 */
	$.fn.wheelColorPicker = function () {
		// Initialize
		if( arguments.length == 0 ) {
			return methods.setOptions.call( this, {} );
		}
		// Set options and initialize
		if( typeof arguments[0] === "object" ) {
			return methods.setOptions.call( this, arguments[0] );
		} 
		// Call a method
		else if( $.isFunction( methods[ arguments[0] ] ) ) {
			var shift = [].shift;
			var firstArg = shift.apply(arguments);
			return methods[ firstArg ].apply( this, arguments );
		} 
		// Set option value
		else if( arguments.length == 2 ) {
			return methods.setOption.call( this, arguments[0], arguments[1] );
		}
		// Get option value
		else if( arguments.length == 1) {
			return methods.getOption.call( this, arguments[0] );
		}
		else {
			$.error( 'Method/option named ' +  arguments[0] + ' does not exist on jQuery.wheelColorPicker' );
		}
	};
	
	/**
	 * Object: defaults
	 * 
	 * Contains default options for the wheelColorPicker plugin.
	 * 
	 * Member properties:
	 * 
	 *   format    - String Color naming style. See colorToRgb for all 
	 *               available formats.
	 *   live      - Boolean Enable dynamic slider gradients.
	 *   preview   - Boolean Enable live color preview on input field
	 *   userinput - (Deprecated) Boolean Enable picking color by typing directly
	 *   validate  - (Deprecated) Boolean When userinput is enabled, always convert 
	 *               the input value to a specified format. This option is 
	 *               deprecated. use autoConvert instead.
	 *   autoConvert     - Boolean Automatically convert inputted value to 
	 *                     specified format.
	 *   color     - Mixed Initial value in any of supported color 
	 *               value format or as an object. Setting this value will 
	 *               override the current input value.
	 *   alpha     - (Deprecated) Boolean Force the color picker to use alpha value 
	 *               despite its selected color format. This option is 
	 *               deprecated. Use sliders = "a" instead.
	 *   inverseLabel    - (deprecated) Boolean use inverse color for 
	 *                     input label instead of black/white color.
	 *   preserveWheel   - Boolean preserve color wheel shade when slider 
	 *                     position changes. If set to true, changing 
	 *                     color wheel from black will reset selectedColor.val 
	 *                     (shade) to 1.
	 *   interactive     - Boolean enable interactive sliders where slider bar
	 *                     gradients change dynamically as user drag a slider 
	 *                     handle. Set to false if this affect performance.
	 *                     See also 'quality' option if you wish to keep 
	 *                     interactive slider but with reduced quality.
	 *   cssClass  - Object CSS Classes to be added to the color picker.
	 *   width     - Mixed Color picker width, either in px or 'stretch' to 
	 *               fit the input width. If null then the default CSS size 
	 *               will be used.
	 *   height    - Integer Color picker height in px. If null then the default 
	 *               CSS size will be used.
	 *   layout    - String [block|popup] Layout mode.
	 *   animDuration    - Number Duration for transitions such as fade-in 
	 *                     and fade-out.
	 *   quality   - Rendering details quality. The normal quality is 1. 
	 *               Setting less than 0.1 may make the sliders ugly, 
	 *               while setting the value too high might affect performance.
	 *   sliders   - String combination of sliders. If null then the color 
	 *               picker will show default values, which is "wvp" for 
	 *               normal color or "wvap" for color with alpha value. 
	 *               Possible combinations are "whsvrgbap". Note that the 
	 *               order of letters affects the slider positions.
	 *   showSliderLabel - Boolean Show labels for each slider.
	 *   showSliderValue - Boolean Show numeric value of each slider.
	 *   hideKeyboard    - Boolean Keep input blurred to avoid on screen keyboard appearing. 
	 *                     If this is set to true, avoid assigning handler to blur event.
	 *   rounding  - Round the alpha value to N decimal digits. Default is 2.
	 *               Set -1 to disable rounding.
	 *   mobile    - Display mobile-friendly layout when opened in mobile device.
	 *   mobileAutoScroll    - Automatically scroll the page if focused input element 
	 *                         gets obstructed by color picker dialog.
	 *   htmlOptions     - Load options from HTML attributes. 
	 *                     To set options using HTML attributes, 
	 *                     prefix these options with 'data-wcp-' as attribute names.
     *   snap            - Snap color wheel and slider on 0, 0.5, and 1.0
     *   snapTolerance   - Snap if slider position falls within defined 
     *                     tolerance value.
	 */
	$.fn.wheelColorPicker.defaults = {
		format: 'hex', /* 1.x */
		preview: false, /* 1.x */
		live: true, /* 2.0 */
		userinput: true, /* DEPRECATED 1.x */
		validate: false, /* DEPRECATED 1.x */ /* See autoConvert */
		autoConvert: true, /* 2.0 */ /* NOT IMPLEMENTED */
		color: null, /* DEPRECATED 1.x */ /* Init-time usage only */
		alpha: null, /* DEPRECATED 1.x */ /* See methods.alpha */
		preserveWheel: false, /* DEPRECATED 1.x */ /* Use interactive */
		interactive: true, /* 3.0 */ /* NOT IMPLEMENTED */
		cssClass: '', /* 2.0 */
		layout: 'popup', /* 2.0 */
		animDuration: 200, /* 2.0 */
		quality: 1, /* 2.0 */
		sliderWidth: 1, /* 2.4 */
		sliders: null, /* 2.0 */
		showSliderLabel: true, /* 2.0 */
		showSliderValue: false, /* 2.0 */
		rounding: 2, /* 2.3 */
		mobile: true, /* 3.0 */ /* NOT IMPLEMENTED */
		hideKeyboard: false, /* 2.4 */
		htmlOptions: true, /* 2.3 */
        snap: false, /* 2.5 */
        snapTolerance: 0.05 /* 2.5 */
	};
	
	$.fn.wheelColorPicker.hasInit = false;
	
	/**
	 * Function: colorToStr
	 * 
	 * Introduced in 2.0
	 * 
	 * Convert color object to string in specified format
	 * 
	 * Available formats:
	 * - hex
	 * - css
	 * - rgb
	 * - rgb%
	 * - rgba
	 * - rgba%
	 * - hsv
	 * - hsv%
	 * - hsva
	 * - hsva%
	 * - hsb
	 * - hsb%
	 * - hsba
	 * - hsba%
	 */
	$.fn.wheelColorPicker.colorToStr = function( color, format ) {
		var result = "";
		switch( format ) {
			case 'css':
				result = "#";
			case 'hex': 
				var r = Math.round(color.r * 255).toString(16);
				if( r.length == 1) {
					r = "0" + r;
				}
				var g = Math.round(color.g * 255).toString(16);
				if( g.length == 1) {
					g = "0" + g;
				}
				var b = Math.round(color.b * 255).toString(16);
				if( b.length == 1) {
					b = "0" + b;
				}
				result += r + g + b;
				break;
				
			case 'rgb':
				result = "rgb(" + 
					Math.round(color.r * 255) + "," + 
					Math.round(color.g * 255) + "," + 
					Math.round(color.b * 255) + ")";
				break;
				
			case 'rgb%':
				result = "rgb(" + 
					(color.r * 100) + "%," + 
					(color.g * 100) + "%," + 
					(color.b * 100) + "%)";
				break;
				
			case 'rgba':
				result = "rgba(" + 
					Math.round(color.r * 255) + "," + 
					Math.round(color.g * 255) + "," + 
					Math.round(color.b * 255) + "," + 
					color.a + ")";
				break;
				
			case 'rgba%':
				result = "rgba(" + 
					(color.r * 100) + "%," + 
					(color.g * 100) + "%," + 
					(color.b * 100) + "%," + 
					(color.a * 100) + "%)";
				break;
				
			case 'hsv':
				result = "hsv(" + 
					(color.h * 360) + "," + 
					color.s + "," + 
					color.v + ")";
				break;
				
			case 'hsv%':
				result = "hsv(" + 
					(color.h * 100) + "%," + 
					(color.s * 100) + "%," + 
					(color.v * 100) + "%)";
				break;
				
			case 'hsva':
				result = "hsva(" + 
					(color.h * 360) + "," + 
					color.s + "," + 
					color.v + "," + 
					color.a + ")";
				break;
				
			case 'hsva%':
				result = "hsva(" + 
					(color.h * 100) + "%," + 
					(color.s * 100) + "%," + 
					(color.v * 100) + "%," + 
					(color.a * 100) + "%)";
				break;
				
				
			case 'hsb':
				result = "hsb(" + 
					color.h + "," + 
					color.s + "," + 
					color.v + ")";
				break;
				
			case 'hsb%':
				result = "hsb(" + 
					(color.h * 100) + "%," + 
					(color.s * 100) + "%," + 
					(color.v * 100) + "%)";
				break;
				
			case 'hsba':
				result = "hsba(" + 
					color.h + "," + 
					color.s + "," + 
					color.v + "," + 
					color.a + ")";
				break;
				
			case 'hsba%':
				result = "hsba(" + 
					(color.h * 100) + "%," + 
					(color.s * 100) + "%," + 
					(color.v * 100) + "%," + 
					(color.a * 100) + "%)";
				break;
				
		}
		return result;
	};
	
	/**
	 * Function: strToColor
	 * 
	 * Introduced in 2.0
	 * 
	 * Convert string to color object.
	 * Please note that if RGB color is supplied, the returned value 
	 * will only contain RGB.
	 * 
	 * If invalid string is supplied, FALSE will be returned.
	 */
	$.fn.wheelColorPicker.strToColor = function( val ) {
		var color = { a: 1 };
		var tmp;
		var hasAlpha;
		
		// #ffffff
		if(val.match(/^#[0-9a-f]{6}$/i) != null) {
			if( isNaN( color.r = parseInt(val.substr(1, 2), 16) / 255 ) ) {
				return false;
			}
			if( isNaN( color.g = parseInt(val.substr(3, 2), 16) / 255 ) ) {
				return false;	
			}
			if( isNaN( color.b = parseInt(val.substr(5, 2), 16) / 255 ) ) {
				return false;
			}
		}
		
		// ffffff
		else if(val.match(/^[0-9a-f]{6}$/i) != null) {
			if( isNaN( color.r = parseInt(val.substr(0, 2), 16) / 255 ) ) {
				return false;
			}
			if( isNaN( color.g = parseInt(val.substr(2, 2), 16) / 255 ) ) {
				return false;
			}
			if( isNaN( color.b = parseInt(val.substr(4, 2), 16) / 255 ) ) {
				return false;
			}
		}
		
		// rgb(100%,100%,100%)
		// rgba(100%,100%,100%,100%)
		// rgba(255,255,255,1)
		// rgba(100%,1, 0.5,.2)
		else if(
			val.match(/^rgba\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null ||
			val.match(/^rgb\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null 
		) {
			if(val.match(/a/i) != null) {
				hasAlpha = true;
			}
			else {
				hasAlpha = false;
			}
			
			tmp = val.substring(val.indexOf('(')+1, val.indexOf(','));
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.r = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.r = parseInt(tmp) / 255 ) ) {
					return false;
				}
			}
			
			tmp = val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1));
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.g = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.g = parseInt(tmp) / 255 ) ) {
					return false;
				}
			}
			
			if(hasAlpha) {
				tmp = val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(','));
			}
			else {
				tmp = val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')'));
			}
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.b = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.b = parseInt(tmp) / 255 ) ) {
					return false;
				}
			}
			
			if(hasAlpha) {
				tmp = val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')'));
				if( tmp.charAt( tmp.length-1 ) == '%') {
					if( isNaN( color.a = parseFloat(tmp) / 100 ) ) {
						return false;
					}
				}
				else {
					if( isNaN( color.a = parseFloat(tmp) ) ) {
						return false;
					}
				}
			}
		}
		
		// hsv(100%,100%,100%)
		// hsva(100%,100%,100%,100%)
		// hsv(360,1,1,1)
		// hsva(360,1, 0.5,.2)
		// hsb(100%,100%,100%)
		// hsba(100%,100%,100%,100%)
		// hsb(360,1,1,1)
		// hsba(360,1, 0.5,.2)
		else if(
			val.match(/^hsva\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null ||
			val.match(/^hsv\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null ||
			val.match(/^hsba\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null ||
			val.match(/^hsb\s*\(\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*,\s*([0-9\.]+%|[01]?\.?[0-9]*)\s*\)$/i) != null 
		) {
			if(val.match(/a/i) != null) {
				hasAlpha = true;
			}
			else {
				hasAlpha = false;
			}
			
			tmp = val.substring(val.indexOf('(')+1, val.indexOf(','));
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.h = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.h = parseFloat(tmp) / 360 ) ) {
					return false;
				}
			}
			
			tmp = val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1));
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.s = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.s = parseFloat(tmp) ) ) {
					return false;
				}
			}
			
			if(hasAlpha) {
				tmp = val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(','));
			}
			else {
				tmp = val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')'));
			}
			if( tmp.charAt( tmp.length-1 ) == '%') {
				if( isNaN( color.v = parseFloat(tmp) / 100 ) ) {
					return false;
				}
			}
			else {
				if( isNaN( color.v = parseFloat(tmp) ) ) {
					return false;
				}
			}
			
			if(hasAlpha) {
				tmp = val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')'));
				if( tmp.charAt( tmp.length-1 ) == '%') {
					if( isNaN( color.a = parseFloat(tmp) / 100 ) ) {
						return false;
					}
				}
				else {
					if( isNaN( color.a = parseFloat(tmp) ) ) {
						return false;
					}
				}
			}
		}
		
		else {
			return false;
		}
		
		return color;
	};
	
	/**
	 * Function: hsvToRgb
	 * 
	 * Introduced in 2.0
	 * 
	 * Perform HSV to RGB conversion
	 */
	$.fn.wheelColorPicker.hsvToRgb = function( h, s, v ) {
		
		// Calculate RGB from hue (1st phase)
		var cr = (h <= (1/6) || h >= (5/6)) ? 1
			: (h < (1/3) ? 1 - ((h - (1/6)) * 6)
			: (h > (4/6) ? (h - (4/6)) * 6
			: 0));
		var cg = (h >= (1/6) && h <= (3/6)) ? 1
			: (h < (1/6) ? h * 6
			: (h < (4/6) ? 1 - ((h - (3/6)) * 6)
			: 0));
		var cb = (h >= (3/6) && h <= (5/6)) ? 1
			: (h > (2/6) && h < (3/6) ? (h - (2/6)) * 6
			: (h > (5/6) ? 1 - ((h - (5/6)) * 6)
			: 0));
			
		//~ console.log(cr + ' ' + cg + ' ' + cb);
		
		// Calculate RGB with saturation & value applied
		var r = (cr + (1-cr)*(1-s)) * v;
		var g = (cg + (1-cg)*(1-s)) * v;
		var b = (cb + (1-cb)*(1-s)) * v;
		
		//~ console.log(r + ' ' + g + ' ' + b + ' ' + v);
		
		return { r: r, g: g, b: b };
	};
	
	/**
	 * Function: rgbToHsv
	 * 
	 * Introduced in 2.0
	 * 
	 * Perform RGB to HSV conversion
	 */
	$.fn.wheelColorPicker.rgbToHsv = function( r, g, b ) {
		
		var h;
		var s;
		var v;
	
		var maxColor = Math.max(r, g, b);
		var minColor = Math.min(r, g, b);
		var delta = maxColor - minColor;
		
		// Calculate saturation
		if(maxColor != 0) {
			s = delta / maxColor;
		}
		else {
			s = 0;
		}
		
		// Calculate hue
		// To simplify the formula, we use 0-6 range.
		if(delta == 0) {
			h = 0;
		}
		else if(r == maxColor) {
			h = (6 + (g - b) / delta) % 6;
		}
		else if(g == maxColor) {
			h = 2 + (b - r) / delta;
		}
		else if(b == maxColor) {
			h = 4 + (r - g) / delta;
		}
		else {
			h = 0;
		}
		// Then adjust the range to be 0-1
		h = h/6;
		
		// Calculate value
		v = maxColor;
		
		//~ console.log(h + ' ' + s + ' ' + v);
		
		return { h: h, s: s, v: v };
	};
	
	/*
	 * DEVELOPER's NOTE
	 * 
	 * While the way to retrieve references differs, the following 
	 * local variable names are reused to reference the same object 
	 * across methods.
	 * 
	 * input - input DOM element
	 * $input - input element wrapped in jquery
	 * widget - color picker DOM element (div.jQWCP-wWidget)
	 * $widget - color picker widget wrapped in jquery (div.jQWCP-wWidget)
	 * settings - reference to settings object
	 */
	
	/**
	 * Function: staticInit
	 * 
	 * Introduced in 2.0
	 * 
	 * Initialize wheel color picker globally
	 */
	methods.staticInit = function() {
		if($.fn.wheelColorPicker.hasInit)
			return;
			
		// This must only occur once
		$.fn.wheelColorPicker.hasInit = true;
			
		// Insert overlay element to handle popup closing
		// when hideKeyboard is true, hence input is always blurred
		g_Overlay = $('<div id="jQWCP-overlay" style="display: none;"></div>');
		$('body').append(g_Overlay);
		g_Overlay.on('click', private.onOverlayClick);
		
		// Attach events
		$('body').on('mouseup.wheelColorPicker', private.onBodyMouseUp);
		$('body').on('touchend.wheelColorPicker', private.onBodyMouseUp);
		$('body').on('mousemove.wheelColorPicker', private.onBodyMouseMove);
		$('body').on('touchmove.wheelColorPicker', private.onBodyMouseMove);
	};
	
	/**
	 * Function: init
	 * 
	 * Initialize wheel color picker
	 */
	methods.init = function() {
		methods.staticInit();
		
		return this.each(function() {
			var $this = $(this);
			var settings = $this.data('jQWCP.settings');
			var $widget = null;
			
			// Initialization must only occur once
			if(settings.hasInit)
				return;
			
			// Set hasInit flag to true
			// Notice: remember that settings was assigned by reference, 
			// so we can directly set the members of settings object.
			settings.hasInit = true;
			
			// Setup selected color container
			var color = { h: 0, s: 0, v: 1, r: 1, g: 1, b: 1, a: 1 };
			$this.data('jQWCP.color', color);
			
			// Check sliders option
			if(settings.sliders == null)
				settings.sliders = 'wvp' + (settings.format.indexOf('a') >= 0 ? 'a' : '');
			
			/// LAYOUT & BINDINGS ///
			// Setup block mode layout
			if( settings.layout == 'block' ) {
				$widget = private.initWidget.call( $this );
				//private.adjustWidget( $widget.get(0), settings );
				$widget.addClass(settings.cssClass);
				// Store DOM element reference
				$this.data('jQWCP.widget', $widget.get(0));
				$widget.data('jQWCP.inputElm', this);
				
				// Wrap widget around the input elm and put the input 
				// elm inside widget
				$widget.addClass('jQWCP-block');
				$this.after($widget);
				if($this.css('display') == "inline") {
					$widget.css('display', "inline-block");
				}
				else {
					$widget.css('display', $this.css('display'));
				}
				$widget.append($this);
				private.adjustWidget( $widget.get(0), settings );
				$this.hide();
				
				// Add tabindex attribute to make the widget focusable
				if($this.attr('tabindex') != undefined) {
					$widget.attr('tabindex', $this.attr('tabindex'));
				}
				else {
					$widget.attr('tabindex', 0);
				}
				
				// Draw shading
				methods.redrawSliders.call( $this, null, true );
				methods.updateSliders.call( $this );
				
				// Bind widget element events
				$widget.on('focus.wheelColorPicker', private.onWidgetFocus);
				$widget.on('blur.wheelColorPicker', private.onWidgetBlur);
			}
			// Setup popup mode layout
			else {
				if(g_Popup == null) {
					$widget = private.initWidget.call( $this );
					// Store DOM element reference
					$this.data('jQWCP.widget', $widget.get(0));
					
					// Assign widget to global
					g_Popup = $widget;
					g_Popup.hide();
					$('body').append($widget);
					
					// Bind popup events
					$widget.on('mousedown.wheelColorPicker', private.onPopupDlgMouseDown);
					$widget.on('mouseup.wheelColorPicker', private.onPopupDlgMouseUp);
					
				}
				else {
					$this.data('jQWCP.widget', g_Popup);
				}
				
				// Bind input element events
				$this.on('focus.wheelColorPicker', methods.show);
				//$this.on('blur.wheelColorPicker', methods.hide);
				$this.on('blur.wheelColorPicker', private.onInputBlur);
			}
			
			// Bind input events
			$this.on('keyup.wheelColorPicker', private.onInputKeyup);
			$this.on('change.wheelColorPicker', private.onInputChange);
			
			// Set color value
			if(settings.color == null) {
				methods.setValue.call( $this, $this.val() );
			}
			else if(typeof(settings.color) == "object") {
				methods.setColor.call( $this, settings.color );
				settings.color = undefined;
			}
			else {
				methods.setValue.call( $this, settings.color );
				settings.color = undefined;
			}
			
			// Set readonly mode
			/* DEPRECATED */
			if(settings.userinput) {
				$this.removeAttr('readonly');
			}
			else {
				$this.attr('readonly', true);
			}
		});
	};
	
	/**
	 * Function: setOptions
	 * 
	 * Introduced in 2.0
	 * 
	 * Set options to the color picker
	 */
	methods.setOptions = function( options ) {
		var optionsParam = options;
		this.each(function() {
			var $this = $(this); // Refers to input elm
			var input = this;
			options = $.extend({}, optionsParam); // Reset options for each iteration
			
			// Load options from HTML attributes
			if(typeof options.htmlOptions == 'undefined') {
				// Since defaults is not yet loaded, specifically lookup 
				// from defaults.htmlOptions if not htmlOptions is not specified.
				options.htmlOptions = $.fn.wheelColorPicker.defaults.htmlOptions;
			}
			if(options.htmlOptions) {
				$.each($.fn.wheelColorPicker.defaults, function(key, val) {
					if(input.hasAttribute('data-wcp-'+key)) {
						options[key] = $this.attr('data-wcp-'+key);
					}
				});
			}
			// Override options
			var settings = $.extend( true, {}, $.fn.wheelColorPicker.defaults, options );
			$this.data('jQWCP.settings', settings);
		});
		
		return methods.init.call( this );
	};
	
	/**
	 * Function: destroy
	 * 
	 * Destroy the color picker and return it to normal element.
	 */
	methods.destroy = function() {
		return this.each(function() {
			var $this = $(this);
			var settings = $this.data('jQWCP.settings');
			var $widget = null;
			
			// Destroy must only occur when it's initialized
			if(!settings)
				return;
			
			// Reset layout
			if(settings.layout == 'block') {
				$widget = $( $this.data('jQWCP.widget') );
				$widget.before($this);
				$widget.remove();
				$this.show();
			}
			else {
				$widget = g_Popup;
			}
			
			// Unbind events
			$this.off('focus.wheelColorPicker');
			$this.off('blur.wheelColorPicker');
			$this.off('keyup.wheelColorPicker');
			$this.off('change.wheelColorPicker');
			
			// Remove data
			$this.data('jQWCP.settings', null);
			$this.data('jQWCP.widget', null);
		});
	};
	
	/**
	 * Function: show
	 * 
	 * Show the color picker dialog. This function is only applicable to 
	 * popup mode color picker layout.
	 * 
	 * Parameter:
	 *   e - Event object
	 */
	methods.show = function( e ) {
		var $this = $(this); // Refers to input elm
		var settings = $this.data('jQWCP.settings');
		var $widget = g_Popup;
		
		// Don't do anything if not using popup layout
		if( settings.layout != "popup" )
			return;
			
		// Don't do anything if the popup is already shown and attached 
		// to the correct input elm
		if( this == $this.data('jQWCP.inputElm') )
			return;
			
		// Terminate ongoing transitions
		$widget.stop( true, true );
		
		// Reposition the popup window
		$widget.css({
			top: ($this.offset().top + $this.outerHeight()) + 'px',
			left: $this.offset().left + 'px'
		});
		
		// BUG_RELATIVE_PAGE_ORIGIN workaround
		if(BUG_RELATIVE_PAGE_ORIGIN) {
			$widget.css({
				top: ($this.get(0).getBoundingClientRect().top - g_Origin.top + $this.outerHeight()) + 'px',
				left: ($this.get(0).getBoundingClientRect().left - g_Origin.left) + 'px'
			});
		}
		
		// Set the input element the popup is attached to
		$widget.data('jQWCP.inputElm', this);
		
		// Assign custom css class
		$widget.attr( 'class', 'jQWCP-wWidget' );
		$widget.addClass( settings.cssClass );
		
		// Adjust layout
		private.adjustWidget( $widget.get(0), settings );
		
		// Redraw sliders
		methods.redrawSliders.call( $this, null, true );
		methods.updateSliders.call( $this );
		
		// Store last textfield value
		settings.lastValue = $this.val();
		
		$widget.fadeIn( settings.animDuration );
		
		// If hideKeyboard is true, force to hide soft keyboard
		if(settings.hideKeyboard) {
			$this.blur();
			g_Overlay.show();
		}
	};
	
	/**
	 * Function: hide
	 * 
	 * Hide the color picker dialog. This function is only applicable to 
	 * popup mode color picker layout.
	 * 
	 * Parameter:
	 *   e - Event object
	 */
	methods.hide = function( e ) {
		var $this = $(this); // Refers to input elm
		var settings = $this.data('jQWCP.settings');
		
		g_Popup.fadeOut( settings.animDuration );
	};
	
	/**
	 * Function: redrawSliders
	 * 
	 * Introduced in 2.0
	 * 
	 * Redraw slider gradients.
	 * 
	 * Parameter:
	 *   sliders - String combination of sliders to be redrawn. If not 
	 *             specified then redraw all sliders. Possible combinations 
	 *             are "hsvrgba".
	 *   force   - Boolean force redraw.
	 */
	methods.redrawSliders = function( sliders, force ) {
		return this.each(function() {
			var $this = $(this); // Refers to input elm
			var settings = $this.data('jQWCP.settings');
			var $widget = $( $this.data('jQWCP.widget') );
			var color = $this.data('jQWCP.color');
			
			// No need to redraw sliders on global popup widget if not 
			// attached to the input elm in current iteration
			if(this != $widget.data('jQWCP.inputElm'))
				return;
				
			var w = settings.sliderWidth;
			var h = settings.quality * 50;
			
			var A = 1;
			var R = 0;
			var G = 0;
			var B = 0;
			var H = 0;
			var S = 0;
			var V = 1;
			
			// Dynamic colors
			if(settings.live) {
				A = color.a;
				R = Math.round(color.r * 255);
				G = Math.round(color.g * 255);
				B = Math.round(color.b * 255);
				H = color.h;
				S = color.s;
				V = color.v;
			}
			
			/// PREVIEW ///
			// Preview box must always be redrawn
			var $previewBox = $widget.find('.jQWCP-wPreviewBox');
			var previewBoxCtx = $previewBox.get(0).getContext('2d');
			previewBoxCtx.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
			previewBoxCtx.clearRect(0, 0, w, h);
			previewBoxCtx.fillRect(0, 0, w, h);
			
			/// SLIDERS ///
			if(!settings.live && !force)
				return;
			
			/// ALPHA ///
			// The top color is (R, G, B, 1)
			// The bottom color is (R, G, B, 0)
			var $alphaSlider = $widget.find('.jQWCP-wAlphaSlider');
			var alphaSliderCtx = $alphaSlider.get(0).getContext('2d');
			var alphaGradient = alphaSliderCtx.createLinearGradient(0, 0, 0, h);
			alphaGradient.addColorStop(0, "rgba("+R+","+G+","+B+",1)");
			alphaGradient.addColorStop(1, "rgba("+R+","+G+","+B+",0)");
			alphaSliderCtx.fillStyle = alphaGradient;
			alphaSliderCtx.clearRect(0, 0, w, h);
			alphaSliderCtx.fillRect(0, 0, w, h);
			
			/// RED ///
			// The top color is (255, G, B)
			// The bottom color is (0, G, B)
			var $redSlider = $widget.find('.jQWCP-wRedSlider');
			var redSliderCtx = $redSlider.get(0).getContext('2d');
			var redGradient = redSliderCtx.createLinearGradient(0, 0, 0, h);
			redGradient.addColorStop(0, "rgb(255,"+G+","+B+")");
			redGradient.addColorStop(1, "rgb(0,"+G+","+B+")");
			redSliderCtx.fillStyle = redGradient;
			redSliderCtx.fillRect(0, 0, w, h);
			
			/// GREEN ///
			// The top color is (R, 255, B)
			// The bottom color is (R, 0, B)
			var $greenSlider = $widget.find('.jQWCP-wGreenSlider');
			var greenSliderCtx = $greenSlider.get(0).getContext('2d');
			var greenGradient = greenSliderCtx.createLinearGradient(0, 0, 0, h);
			greenGradient.addColorStop(0, "rgb("+R+",255,"+B+")");
			greenGradient.addColorStop(1, "rgb("+R+",0,"+B+")");
			greenSliderCtx.fillStyle = greenGradient;
			greenSliderCtx.fillRect(0, 0, w, h);
			
			/// BLUE ///
			// The top color is (R, G, 255)
			// The bottom color is (R, G, 0)
			var $blueSlider = $widget.find('.jQWCP-wBlueSlider');
			var blueSliderCtx = $blueSlider.get(0).getContext('2d');
			var blueGradient = blueSliderCtx.createLinearGradient(0, 0, 0, h);
			blueGradient.addColorStop(0, "rgb("+R+","+G+",255)");
			blueGradient.addColorStop(1, "rgb("+R+","+G+",0)");
			blueSliderCtx.fillStyle = blueGradient;
			blueSliderCtx.fillRect(0, 0, w, h);
			
			/// HUE ///
			// The hue slider is static.
			var $hueSlider = $widget.find('.jQWCP-wHueSlider');
			var hueSliderCtx = $hueSlider.get(0).getContext('2d');
			var hueGradient = hueSliderCtx.createLinearGradient(0, 0, 0, h);
			hueGradient.addColorStop(0, "#f00");
			hueGradient.addColorStop(0.166666667, "#ff0");
			hueGradient.addColorStop(0.333333333, "#0f0");
			hueGradient.addColorStop(0.5, "#0ff");
			hueGradient.addColorStop(0.666666667, "#00f");
			hueGradient.addColorStop(0.833333333, "#f0f");
			hueGradient.addColorStop(1, "#f00");
			hueSliderCtx.fillStyle = hueGradient;
			hueSliderCtx.fillRect(0, 0, w, h);
			
			/// SAT ///
			// The top color is hsv(h, 1, v)
			// The bottom color is hsv(0, 0, v)
			var satTopRgb = $.fn.wheelColorPicker.hsvToRgb(H, 1, V);
			satTopRgb.r = Math.round(satTopRgb.r * 255);
			satTopRgb.g = Math.round(satTopRgb.g * 255);
			satTopRgb.b = Math.round(satTopRgb.b * 255);
			var $satSlider = $widget.find('.jQWCP-wSatSlider');
			var satSliderCtx = $satSlider.get(0).getContext('2d');
			var satGradient = satSliderCtx.createLinearGradient(0, 0, 0, h);
			satGradient.addColorStop(0, "rgb("+satTopRgb.r+","+satTopRgb.g+","+satTopRgb.b+")");
			satGradient.addColorStop(1, "rgb("+Math.round(V*255)+","+Math.round(V*255)+","+Math.round(V*255)+")");
			satSliderCtx.fillStyle = satGradient;
			satSliderCtx.fillRect(0, 0, w, h);
			
			/// VAL ///
			// The top color is hsv(h, s, 1)
			// The bottom color is always black.
			var valTopRgb = $.fn.wheelColorPicker.hsvToRgb(H, S, 1);
			valTopRgb.r = Math.round(valTopRgb.r * 255);
			valTopRgb.g = Math.round(valTopRgb.g * 255);
			valTopRgb.b = Math.round(valTopRgb.b * 255);
			var $valSlider = $widget.find('.jQWCP-wValSlider');
			var valSliderCtx = $valSlider.get(0).getContext('2d');
			var valGradient = valSliderCtx.createLinearGradient(0, 0, 0, h);
			valGradient.addColorStop(0, "rgb("+valTopRgb.r+","+valTopRgb.g+","+valTopRgb.b+")");
			valGradient.addColorStop(1, "#000");
			valSliderCtx.fillStyle = valGradient;
			valSliderCtx.fillRect(0, 0, w, h);
			
		});
	};
	
	/**
	 * Function: updateSliders
	 * 
	 * Introduced in 2.0
	 * 
	 * Update slider positions.
	 */
	methods.updateSliders = function() {
		return this.each(function() {
			var $this = $(this); // Refers to input elm
			var settings = $this.data('jQWCP.settings');
			var $widget = $( $this.data('jQWCP.widget') );
			var color = $this.data('jQWCP.color');
			
			// No need to redraw sliders on global popup widget if not 
			// attached to the input elm in current iteration
			if(this != $widget.data('jQWCP.inputElm'))
				return;
				
			//~ console.log(color);
			
			// Wheel
			var $wheel = $widget.find('.jQWCP-wWheel');
			var $wheelCursor = $widget.find('.jQWCP-wWheelCursor');
			var $wheelOverlay = $widget.find('.jQWCP-wWheelOverlay');
			var wheelX = Math.cos(2 * Math.PI * color.h) * color.s;
			var wheelY = Math.sin(2 * Math.PI * color.h) * color.s;
			var wheelOffsetX = $wheel.width() / 2;
			var wheelOffsetY = $wheel.height() / 2;
			$wheelCursor.css('left', (wheelOffsetX + (wheelX * $wheel.width() / 2)) + 'px');
			$wheelCursor.css('top', (wheelOffsetY - (wheelY * $wheel.height() / 2)) + 'px');
			if(settings.preserveWheel) {
				$wheelOverlay.css('opacity', 0);
			}
			else {
				$wheelOverlay.css('opacity', 1 - (color.v < 0.2 ? 0.2 : color.v));
			}
			
			// Hue
			var $hueSlider = $widget.find('.jQWCP-wHueSlider');
			var $hueCursor = $widget.find('.jQWCP-wHueCursor');
			$hueCursor.css('top', (color.h * $hueSlider.height()) + 'px');
			
			// Saturation
			var $satSlider = $widget.find('.jQWCP-wSatSlider');
			var $satCursor = $widget.find('.jQWCP-wSatCursor');
			$satCursor.css('top', ((1 - color.s) * $satSlider.height()) + 'px');
			
			// Value
			var $valSlider = $widget.find('.jQWCP-wValSlider');
			var $valCursor = $widget.find('.jQWCP-wValCursor');
			$valCursor.css('top', ((1 - color.v) * $valSlider.height()) + 'px');
			
			// Red
			var $redSlider = $widget.find('.jQWCP-wRedSlider');
			var $redCursor = $widget.find('.jQWCP-wRedCursor');
			$redCursor.css('top', ((1 - color.r) * $redSlider.height()) + 'px');
			
			// Green
			var $greenSlider = $widget.find('.jQWCP-wGreenSlider');
			var $greenCursor = $widget.find('.jQWCP-wGreenCursor');
			$greenCursor.css('top', ((1 - color.g) * $greenSlider.height()) + 'px');
			
			// Blue
			var $blueSlider = $widget.find('.jQWCP-wBlueSlider');
			var $blueCursor = $widget.find('.jQWCP-wBlueCursor');
			$blueCursor.css('top', ((1 - color.b) * $blueSlider.height()) + 'px');
			
			// Alpha
			var $alphaSlider = $widget.find('.jQWCP-wAlphaSlider');
			var $alphaCursor = $widget.find('.jQWCP-wAlphaCursor');
			$alphaCursor.css('top', ((1 - color.a) * $alphaSlider.height()) + 'px');
		});
	};
	
	/**
	 * Function: updateSelection
	 * 
	 * DEPRECATED in 2.0
	 * 
	 * Update color dialog selection to match current selectedColor value.
	 */
	methods.updateSelection = function() {
		methods.redrawSliders.call( $this );
		return methods.updateSliders.call( $this );
	};
	
	/**
	 * Function: setRgba
	 * 
	 * Introduced in 2.0
	 * 
	 * Set color using RGBA combination.
	 */
	methods.setRgba = function( r, g, b, a ) {
		this.each(function() {
			var $this = $(this); // Refers to input elm
			var color = $this.data('jQWCP.color');
			
			color.r = r;
			color.g = g;
			color.b = b;
			
			if(a != null) {
				color.a = a;
			}
			
			var hsv = $.fn.wheelColorPicker.rgbToHsv(r, g, b);
			color.h = hsv.h;
			color.s = hsv.s;
			color.v = hsv.v;
			//~ console.log(color);
		});

		methods.updateSliders.call( this, "hsv" );
		return methods.redrawSliders.call( this, "svrgba" );
	};
	
	/**
	 * Function: setRgb
	 * 
	 * Introduced in 2.0
	 * 
	 * Set color using RGB combination.
	 */
	methods.setRgb = function( r, g, b ) {
		return methods.setRgba.call( this, r, g, b, null );
	};
	
	/**
	 * Function: setHsva
	 * 
	 * Introduced in 2.0
	 * 
	 * Set color using HSVA combination.
	 */
	methods.setHsva = function( h, s, v, a ) {
		this.each(function() {
			var $this = $(this); // Refers to input elm
			var color = $this.data('jQWCP.color');
			
			color.h = h;
			color.s = s;
			color.v = v;
			
			if(a != null) {
				color.a = a;
			}
			
			var rgb = $.fn.wheelColorPicker.hsvToRgb(h, s, v);
			color.r = rgb.r;
			color.g = rgb.g;
			color.b = rgb.b;
			//~ console.log(color);
		});
		
		methods.updateSliders.call( this, "rgb" );
		return methods.redrawSliders.call( this, "svrgba" );
	};
	
	/**
	 * Function: setHsv
	 * 
	 * Introduced in 2.0
	 * 
	 * Set color using HSV combination.
	 */
	methods.setHsv = function( h, s, v ) {
		return methods.setHsva.call( this, h, s, v, null );
	};
	
	/**
	 * Function: setAlpha
	 * 
	 * Introduced in 2.0
	 * 
	 * Set alpha value.
	 */
	methods.setAlpha = function( value ) {
		this.each(function() {
			var $this = $(this); // Refers to input elm
			var color = $this.data('jQWCP.color');
			
			color.a = value;
		});
		return methods.redrawSliders.call( this, "" );
	};
	
	/**
	 * Function: alpha
	 * 
	 * Introduced in 2.0
	 * DEPRECATED in 2.0
	 * 
	 * This function is made to maintain compatibility with deprecated 
	 * alpha option.
	 */
	methods.alpha = function( value ) {
		var settings = this.data('jQWCP.settings');
		if( value == null ) {
			return settings.sliders.indexOf('a') == -1 ? false : true;
		}
		else if( value == true ) {
			if(settings.sliders.indexOf('a') == -1)
				return this.each(function() {
					var $this = $(this); // Refers to input control
					var settings = $this.data('jQWCP.settings');
					settings.sliders += 'a';
				});
		}
		else if( value == false ) {
			return this.each(function() {
				var $this = $(this); // Refers to input control
				var settings = $this.data('jQWCP.settings');
				settings.sliders.replace('a', '');
			});
		}
	};
	
	/**
	 * Function: color
	 * 
	 * DEPRECATED in 2.0
	 * 
	 * Gets/sets color
	 */
	methods.color = function( value ) {
		if(value == null) {
			return methods.getValue.call( this );
		}
		else {
			return methods.setValue.call( this, value );
		}
	};
	
	/**
	 * Function: getColor
	 * 
	 * Introduced in 2.0
	 * 
	 * Return color components as an object. The object consists of:
	 * { 
	 *   r: red
	 *   g: green
	 *   b: blue
	 *   h: hue
	 *   s: saturation
	 *   v: value
	 *   a: alpha
	 * }
	 */
	methods.getColor = function() {
		return this.data('jQWCP.color');
	};
	
	/**
	 * Function: setColor
	 * 
	 * Introduced in 2.0
	 * 
	 * Set color by passing an object consisting of:
	 * { r, g, b, a } or
	 * { h, s, v, a }
	 */
	methods.setColor = function( color ) {
		if(color.r != null) {
			return methods.setRgba.call( this, color.r, color.g, color.b, color.a );
		}
		else if(color.h != null) {
			return methods.setHsva.call( this, color.h, color.s, color.v, color.a );
		}
		else if(color.a != null) {
			return methods.setAlpha.call( this, color.a );
		}
		return this;
	};
	
	/**
	 * Function: getValue
	 * 
	 * Get the color value as string.
	 */
	methods.getValue = function( format ) {
		var settings = this.data('jQWCP.settings');
		var color = this.data('jQWCP.color');
		if( format == null ) {
			format = settings.format;
		}
			
		// If settings.rounding is TRUE, round alpha value to N decimal digits
		if(settings.rounding >= 0) {
			color.a = Math.round(color.a * Math.pow(10, settings.rounding)) / Math.pow(10, settings.rounding);
		}
		return $.fn.wheelColorPicker.colorToStr( color, format );
	};
	
	/**
	 * Function: setValue
	 * 
	 * Set the color value as string.
	 */
	methods.setValue = function( value ) {
		var color = $.fn.wheelColorPicker.strToColor( value );
		if(!color)
			return this;
			
		return methods.setColor.call( this, color );
	}
	
	/**
	 * Function: initWidget
	 * 
	 * Initialize widget elements and layout
	 */
	private.initWidget = function( widget ) {
		var settings = this.data('jQWCP.settings');
		
		var sliderWidth = settings.sliderWidth;
		var sCanvasSize = settings.quality * 50;

		/// WIDGET ///
		// Notice: We won't use canvas to draw the color wheel since 
		// it may takes time and cause performance issue.
		var $widget = $(
			"<div class='jQWCP-wWidget'>" + 
				"<div class='jQWCP-wWheelGroup'>" +
					"<div class='jQWCP-wWheel'>" + 
						"<div class='jQWCP-wWheelOverlay'></div>" +
						"<span class='jQWCP-wWheelCursor'></span>" +
					"</div>" +
				"</div>" + 
				"<div class='jQWCP-wHSVGroup'>" +
					"<div class='jQWCP-wHue jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wHueSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Hue'></canvas>" +
						"<span class='jQWCP-wHueCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wSat jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wSatSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Saturation'></canvas>" +
						"<span class='jQWCP-wSatCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wVal jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wValSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Value'></canvas>" +
						"<span class='jQWCP-wValCursor jQWCP-scursor'></span>" +
					"</div>" +
				"</div>" +
				"<div class='jQWCP-wRGBGroup'>" +
					"<div class='jQWCP-wRed jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wRedSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Red'></canvas>" +
						"<span class='jQWCP-wRedCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wGreen jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wGreenSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Green'></canvas>" +
						"<span class='jQWCP-wGreenCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wBlue jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wBlueSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Blue'></canvas>" +
						"<span class='jQWCP-wBlueCursor jQWCP-scursor'></span>" +
					"</div>" +
				"</div>" +
				"<div class='jQWCP-wAlpha jQWCP-slider-wrapper'>" +
					"<canvas class='jQWCP-wAlphaSlider jQWCP-slider' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Alpha'></canvas>" +
					"<span class='jQWCP-wAlphaCursor jQWCP-scursor'></span>" +
				"</div>" +
				"<div class='jQWCP-wPreview'>" +
					"<canvas class='jQWCP-wPreviewBox' width='" + sliderWidth + "' height='" + sCanvasSize + "' title='Selected Color'></canvas>" +
				"</div>" +
			"</div>"
		);
			
		// Small UI fix to disable highlighting the widget
		// Also UI fix to disable touch context menu 
		$widget.find('.jQWCP-wWheel, .jQWCP-slider-wrapper, .jQWCP-scursor, .jQWCP-slider')
			.attr('unselectable', 'on')
			.css('-moz-user-select', 'none')
			.css('-webkit-user-select', 'none')
			.css('user-select', 'none')
			.css('-webkit-touch-callout', 'none');
			
		// Disable context menu on sliders
		// Workaround for touch browsers
		$widget.on('contextmenu.wheelColorPicker', function() { return false; });
			
		// Bind widget events
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-wWheel', private.onWheelMouseDown);
		$widget.on('touchstart.wheelColorPicker', '.jQWCP-wWheel', private.onWheelMouseDown);
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-wWheelCursor', private.onWheelCursorMouseDown);
		$widget.on('touchstart.wheelColorPicker', '.jQWCP-wWheelCursor', private.onWheelCursorMouseDown);
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-slider', private.onSliderMouseDown);
		$widget.on('touchstart.wheelColorPicker', '.jQWCP-slider', private.onSliderMouseDown);
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-scursor', private.onSliderCursorMouseDown);
		$widget.on('touchstart.wheelColorPicker', '.jQWCP-scursor', private.onSliderCursorMouseDown);
		
		return $widget;
	};
	
	/**
	 * Function: adjustWidget
	 * 
	 * Update widget to match current settings.
	 */
	private.adjustWidget = function( widget, settings ) {
		var $widget = $(widget);
		var sliders = settings.sliders;
		
		if(sliders.indexOf('w') < 0)
			$widget.find('.jQWCP-wWheel').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wWheel').show().removeClass('hidden');
			
		if(sliders.indexOf('h') < 0)
			$widget.find('.jQWCP-wHue').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wHue').show().removeClass('hidden');
			
		if(sliders.indexOf('h') < 0)
			$widget.find('.jQWCP-wHue').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wHue').show().removeClass('hidden');
			
		if(sliders.indexOf('s') < 0)
			$widget.find('.jQWCP-wSat').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wSat').show().removeClass('hidden');
			
		if(sliders.indexOf('v') < 0)
			$widget.find('.jQWCP-wVal').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wVal').show().removeClass('hidden');
			
		if(sliders.indexOf('r') < 0)
			$widget.find('.jQWCP-wRed').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wRed').show().removeClass('hidden');
			
		if(sliders.indexOf('g') < 0)
			$widget.find('.jQWCP-wGreen').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wGreen').show().removeClass('hidden');
			
		if(sliders.indexOf('b') < 0)
			$widget.find('.jQWCP-wBlue').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wBlue').show().removeClass('hidden');
			
		if(sliders.indexOf('a') < 0)
			$widget.find('.jQWCP-wAlpha').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wAlpha').show().removeClass('hidden');
			
		if(sliders.indexOf('p') < 0)
			$widget.find('.jQWCP-wPreview').hide().addClass('hidden');
		else
			$widget.find('.jQWCP-wPreview').show().removeClass('hidden');
		
		// Adjust container width
		var $visElms = $widget.find('.jQWCP-wWheel, .jQWCP-slider-wrapper, .jQWCP-wPreview').not('.hidden');
		var width = 0
		$visElms.each(function(index, item) {
			width += parseFloat($(item).css('margin-left').replace('px', '')) + $(item).outerWidth();
		});
		$widget.css({ width: width + 'px' });
	};
	
	/**
	 * Function: onPopupDlgMouseDown
	 * 
	 * Prevent loss focus of the input causing the dialog to be hidden.
	 */
	private.onPopupDlgMouseDown = function( e ) {
		var $this = $(this); // Refers to wWidget
		var $input = $( $this.data('jQWCP.inputElm') );
		
		// Temporarily unbind blur and focus event until mouse is released
		$input.off('blur.wheelColorPicker');
		$input.off('focus.wheelColorPicker');
		
		// Temporarily unbind all blur events until mouse is released
        // data('events') is deprecated since jquery 1.8
        if($input.data('events') != undefined) {
            var blurEvents = $input.data('events').blur;
        }
        else {
            var blurEvents = undefined;
        }
		var suspendedEvents = { blur: [] };
		//suspendedEvents.blur = blurEvents;
		//$input.off('blur');
		if(blurEvents != undefined) {
			for(var i = 0; i < blurEvents.length; i++) {
				suspendedEvents.blur.push(blurEvents[i]);
				//suspendedEvents.blur['blur' + (blurEvents[i].namespace != '' ? blurEvents[i].namespace : '')] = blurEvents[i].handler;
			}
		}
		$input.data('jQWCP.suspendedEvents', suspendedEvents);
		//console.log(blurEvents);
		//console.log($input.data('jQWCP.suspendedEvents'));
	};
	
	/**
	 * Function: onPopupDlgMouseUp
	 * 
	 * Re-bind events that was unbound by onPopupDlgMouseDown.
	 */
	private.onPopupDlgMouseUp = function( e ) {
		var $this = $(this); // Refers to wWidget
		var $input = $( $this.data('jQWCP.inputElm') );
		var settings = $input.data('jQWCP.settings');
		
		// Input elm must always be focused, unless hideKeyboard is set to true
		if(!settings.hideKeyboard) {
			$input.trigger('focus.jQWCP_DONT_TRIGGER_EVENTS');
		}
		
		// Rebind blur & focusevent
		//$input.on('blur.wheelColorPicker', methods.hide);
		//$input.on('focus.wheelColorPicker', methods.show);
		//$input.on('blur.wheelColorPicker', private.onInputBlur);
		// ^ already executed by onBodyMouseUp (event bubbling)
		// Enabling this will cause double binding
		
	};
	
	/**
	 * Function: onWheelMouseDown
	 * 
	 * Begin clicking the wheel down. This will allow user to move 
	 * the crosshair although the mouse is outside the wheel.
	 */
	private.onWheelMouseDown = function( e ) {
		var $this = $(this); // Refers to wheel
		var $widget = $this.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.get(0));
		
		// Trigger sliderdown event
		$input.trigger('sliderdown');
	};
	
	
	/**
	 * Function: onWheelCursorMouseDown
	 * 
	 * Begin clicking the wheel down. This will allow user to move 
	 * the crosshair although the mouse is outside the wheel.
	 */
	private.onWheelCursorMouseDown = function( e ) {
		var $this = $(this); // Refers to cursor
		var $widget = $this.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.parent().get(0));
	};
	
	/**
	 * Function: onSliderMouseDown
	 * 
	 * Begin clicking the slider down. This will allow user to move 
	 * the slider although the mouse is outside the slider.
	 */
	private.onSliderMouseDown = function( e ) {
		var $this = $(this); // Refers to slider
		var $widget = $this.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.parent().get(0));
		
		// Trigger sliderdown event
		$input.trigger('sliderdown');
	};
	
	/**
	 * Function: onSliderCursorMouseDown
	 * 
	 * Begin clicking the slider down. This will allow user to move 
	 * the slider although the mouse is outside the slider.
	 */
	private.onSliderCursorMouseDown = function( e ) {
		var $this = $(this); // Refers to slider cursor
		var $widget = $this.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.parent().get(0));
	};
	
	/**
	 * Function: onBodyMouseUp
	 * 
	 * Clear active control reference.
	 * 
	 * Note: This event handler is also applied to touchend
	 */
	private.onBodyMouseUp = function( e ) {
		var $control = $( $('body').data('jQWCP.activeControl') ); // Refers to slider wrapper or wheel
		
		if($control.length != 0) {
			var $widget = $control.parents('.jQWCP-wWidget:eq(0)');
			var $input = $( $widget.data('jQWCP.inputElm') );
			var settings = $input.data('jQWCP.settings');
			
			// Last time update active control before clearing
			// Only call this function if mouse position is known
			// On touch action, touch point is not available
			if(e.pageX != undefined) {
				private.updateActiveControl( e );
			}
			
			// Rebind blur and focus event to input elm which was 
			// temporarily released when popup dialog is shown
			if(settings.layout == 'popup') {
				// Focus first before binding event so it wont get fired
				// Input elm must always be focused, unless hideKeyboard is set to true
				if(!settings.hideKeyboard) {
					$input.trigger('focus.jQWCP_DONT_TRIGGER_EVENTS');
				}
				
				$input.on('blur.wheelColorPicker', private.onInputBlur);
				$input.on('focus.wheelColorPicker', methods.show);
				
				var suspendedEvents = $input.data('jQWCP.suspendedEvents');
				var blurEvents = suspendedEvents.blur;
				for(var i = 0; i < blurEvents.length; i++) {
					$input.on('blur' + (blurEvents[i].namespace == '' ? '' : '.' + blurEvents[i].namespace), blurEvents[i].handler);
				}
			}
			
			// Clear active control reference
			$('body').data('jQWCP.activeControl', null);
			
			// Trigger sliderup event
			$input.trigger('sliderup');
		}
	};
	
	/**
	 * Function: onBodyMouseMove
	 * 
	 * Move the active slider (when mouse click is down).
	 */
	private.onBodyMouseMove = function( e ) {
		var $control = $( $('body').data('jQWCP.activeControl') ); // Refers to slider wrapper or wheel
		
		// Do stuffs when popup is open
		if($control.length == 0)
			return;
			
		// If active, prevent default
		e.preventDefault();
		
		var $widget = $control.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		private.updateActiveControl( e );
		
		// Trigger slidermove event
		$input.trigger('slidermove');
		
		return false;
	};
	
	/**
	 * Function: updateActiveControl
	 * 
	 * Move the active control.
	 */
	private.updateActiveControl = function( e ) {
		var $control = $( $('body').data('jQWCP.activeControl') ); // Refers to slider wrapper
		
		if($control.length == 0)
			return;
		
		var $widget = $control.parents('.jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		var settings = $input.data('jQWCP.settings');
		var color = $input.data('jQWCP.color');
		
		// pageX and pageY wrapper for touches
		if(e.pageX == undefined && e.originalEvent.touches.length > 0) {
			e.pageX = e.originalEvent.touches[0].pageX;
			e.pageY = e.originalEvent.touches[0].pageY;
		}
		$('#log').html(e.pageX + '/' + e.pageY);
		
		/// WHEEL CONTROL ///
		if($control.hasClass('jQWCP-wWheel')) {
			var $cursor = $control.find('.jQWCP-wWheelCursor');
			var $overlay = $control.find('.jQWCP-wWheelOverlay');
			
			var relX = (e.pageX - $control.offset().left - ($control.width() / 2)) / ($control.width() / 2);
			var relY = - (e.pageY - $control.offset().top - ($control.height() / 2)) / ($control.height() / 2);
			
			// BUG_RELATIVE_PAGE_ORIGIN workaround
			if(BUG_RELATIVE_PAGE_ORIGIN) {
				var relX = (e.pageX - ($control.get(0).getBoundingClientRect().left - g_Origin.left) - ($control.width() / 2)) / ($control.width() / 2);
				var relY = - (e.pageY - ($control.get(0).getBoundingClientRect().top - g_Origin.top) - ($control.height() / 2)) / ($control.height() / 2);
			}
			
			//console.log(relX + ' ' + relY);
			
			// Sat value is calculated from the distance of the cursor from the central point
			var sat = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2));
			// If distance is out of bound, reset to the upper bound
			if(sat > 1) {
				sat = 1;
			}
            
            // Snap to 0,0
            if(settings.snap && sat < settings.snapTolerance) {
                sat = 0;
            }
			
			// Hue is calculated from the angle of the cursor. 0deg is set to the right, and increase counter-clockwise.
            var hue = (relX == 0 && relY == 0) ? 0 : Math.atan( relY / relX ) / ( 2 * Math.PI );
			// If hue is negative, then fix the angle value (meaning angle is in either Q2 or Q4)
			if( hue < 0 ) {
				hue += 0.5;
			}
			// If y is negative, then fix the angle value (meaning angle is in either Q3 or Q4)
			if( relY < 0 ) {
				hue += 0.5;
			}
			
			methods.setHsv.call( $input, hue, sat, color.v );
		}
		
		/// SLIDER CONTROL ///
		else if($control.hasClass('jQWCP-slider-wrapper')) {
			var $cursor = $control.find('.jQWCP-scursor');
			
			var relY = (e.pageY - $control.offset().top) / $control.height();
			
			// BUG_RELATIVE_PAGE_ORIGIN workaround
			if(BUG_RELATIVE_PAGE_ORIGIN) {
				var relY = (e.pageY - ($control.get(0).getBoundingClientRect().top - g_Origin.top)) / $control.height();
			}
			
			var value = relY < 0 ? 0 : relY > 1 ? 1 : relY;
            
            // Snap to 0.0, 0.5, and 1.0
            //console.log(value);
            if(settings.snap && value < settings.snapTolerance) {
                value = 0;
            }
            else if(settings.snap && value > 1-settings.snapTolerance) {
                value = 1;
            }
            if(settings.snap && value > 0.5-settings.snapTolerance && value < 0.5+settings.snapTolerance) {
                value = 0.5;
            }
			
			$cursor.css('top', (value * $control.height()) + 'px');
			
			/// Update color value ///
			// Red
			if($control.hasClass('jQWCP-wRed')) {
				methods.setRgb.call( $input, 1-value, color.g, color.b );
			}
			// Green
			if($control.hasClass('jQWCP-wGreen')) {
				methods.setRgb.call( $input, color.r, 1-value, color.b );
			}
			// Blue
			if($control.hasClass('jQWCP-wBlue')) {
				methods.setRgb.call( $input, color.r, color.g, 1-value );
			}
			// Hue
			if($control.hasClass('jQWCP-wHue')) {
				methods.setHsv.call( $input, value, color.s, color.v );
			}
			// Saturation
			if($control.hasClass('jQWCP-wSat')) {
				methods.setHsv.call( $input, color.h, 1-value, color.v );
			}
			// Value
			if($control.hasClass('jQWCP-wVal')) {
				methods.setHsv.call( $input, color.h, color.s, 1-value );
			}
			// Alpha
			if($control.hasClass('jQWCP-wAlpha')) {
				methods.setAlpha.call( $input, 1-value );
			}
		}
		
		/// UPDATE INPUT ///
		$input.val( methods.getValue.call( $input ) );
		if( settings.preview ) {
			$input.css('background', $.fn.wheelColorPicker.colorToStr( color, 'rgba' ));
			if( color.v > .5 ) {
				$input.css('color', 'black');
			}
			else {
				$input.css('color', 'white');
			}
		}
	};
	
	/**
	 * Function: onInputChange
	 * 
	 * Update the color picker when input is changed.
	 */
	private.onInputChange = function( e ) {
		var $this = $(this); // Refers to input elm
		var color = $.fn.wheelColorPicker.strToColor( $this.val() );
		if(color) {
			methods.setColor.call( $this, color );
		}
	};
	
	/**
	 * Function: onInputKeyup
	 * 
	 * Update the color picker when input is changed.
	 */
	private.onInputKeyup = function( e ) {
		private.onInputChange.call( this, e );
	};
	
	/**
	 * Function: onInputBlur
	 * 
	 * Try to trigger onChange event if value has been changed.
	 */
	private.onInputBlur = function( e ) {
		var $this = $(this); // Refers to input elm
		var settings = $this.data('jQWCP.settings');
		var lastValue = settings.lastValue;
		var currentValue = $this.val();
		
		if(settings.hideKeyboard) {
			return;
		}
		
		// Trigger 'change' event only when it was modified by widget
		// because user typing on the textfield will automatically
		// trigger 'change' event on blur.
		if(lastValue != currentValue) {
			$this.trigger('change');
		}
		
		// Hide widget (if using popup)
		if(settings.layout == 'popup') {
			methods.hide.call($this);
		}
	};
	
	/**
	 * Function: onWidgetFocus
	 * 
	 * Prepare runtime widget data
	 */
	private.onWidgetFocus = function( e ) {
		var $input = $( $(this).data('jQWCP.inputElm') );
		var $widget = $(this);
		var settings = $input.data('jQWCP.settings');
		
		// Store last textfield value
		settings.lastValue = $input.val();
		
		// Trigger focus event
		$input.triggerHandler('focus');
	};
	
	/**
	 * Function: onWidgetBlur
	 * 
	 * Try to trigger onChange event if value has been changed.
	 */
	private.onWidgetBlur = function( e ) {
		var $input = $( $(this).data('jQWCP.inputElm') );
		var $widget = $(this);
		
		// Basically the same as private.onInputBlur
		private.onInputBlur.call($input);
		
		// Trigger blur event
		$input.triggerHandler('blur');
	};
	
	/**
	 * Function: onOverlayClick
	 * 
	 * Hide colorpicker popup dialog if overlay is clicked.
	 * This has the same effect as blurring input element if hideKeyboard = false.
	 */
	private.onOverlayClick = function( e ) {		
		var $widget = g_Popup; // Refers to slider wrapper or wheel
		var input = g_Popup.data('jQWCP.inputElm');
		
		if(g_Popup != null && g_Popup.data('jQWCP.inputElm') != null) {
			var $input = $(input);
			var settings = $input.data('jQWCP.settings');
			var lastValue = settings.lastValue;
			var currentValue = $input.val();
			
			// Trigger 'change' event only when it was modified by widget
			// because user typing on the textfield will automatically
			// trigger 'change' event on blur.
			if(lastValue != currentValue) {
				$input.trigger('change');
			}
			
			methods.hide.call($input);
		}
		$(this).hide();
	};
	
	////////////////////////////////////////////////////////////////////
	
	/**
	 * Automatically initialize color picker on page load
	 * for elements with data-wheelcolorpicker attribute.
	 */
	$(document).ready(function() {
		$('[data-wheelcolorpicker]').wheelColorPicker({ htmlOptions: true });
	});
	
	////////////////////////////////////////////////////////////////////
	
	/**
	 * Browser specific workarounds
	 */
	(function() {
		// MOZILLA //
		
		// Force low resolution slider canvases to improve performance
		// Note: Do not rely on $.browser since it's obsolete by jQuery 2.x
		if($.browser != undefined && $.browser.mozilla) {
			$.fn.wheelColorPicker.defaults.quality = 0.2;
		}
		
		// MOZILLA 3.6 //
		
		// 1x1 solid color canvas doesn't get upscaled correctly
		if(navigator.userAgent.indexOf('Firefox/3.6') >= 0) {
			$.fn.wheelColorPicker.defaults.sliderWidth = 50;
		}
		
		// MOBILE CHROME //
		
		// BUG_RELATIVE_PAGE_ORIGIN
		// Calibrate the coordinate of top left point of the page
		// On mobile chrome, the top left of the page is not always set at (0,0)
		// making window.scrollX/Y and $.offset() useless
		$(document).ready(function() {
			$('body').append(
				'<div id="jQWCP-PageOrigin" style="position: absolute; top: 0; left: 0; height: 0; width: 0;"></div>'
			);
		
			$(window).on('scroll.jQWCP_RelativePageOriginBugFix', function() {
				var origin = document.getElementById('jQWCP-PageOrigin').getBoundingClientRect();
				g_Origin = origin;
				if(origin.left != 0 || origin.top != 0) {
					BUG_RELATIVE_PAGE_ORIGIN = true;
				}
			});
		});
		
	})();
	
}) (jQuery);
