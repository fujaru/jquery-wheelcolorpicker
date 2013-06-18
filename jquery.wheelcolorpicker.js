/**
 * jQuery Wheel Color Picker
 * 
 * http://www.jar2.net/projects/jquery-wheelcolorpicker
 * 
 * Copyright © 2011 Fajar Chandra. All rights reserved.
 * Released under MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
	
	// Contains private methods
	var private = {};
	
	// Contains public methods
	var methods = {};
	
	// Holds the color picker popup widget for use globally
	var g_Popup = null;
	
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
	 *   format    - String [hex|css|rgb|rgba|rgb%] Color naming style
	 *   live      - Boolean Enable dynamic slider gradients.
	 *   preview   - Boolean Enable live color preview on input field
	 *   userinput - Boolean Enable picking color by typing directly
	 *   validate  - Boolean When userinput is enabled, always convert 
	 *               the input value to a specified format.
	 *   color     - (Deprecated) String Initial value in any of supported color 
	 *               value format. This value takes precedence over 
	 *               value attribute specified directly on input tags. 
	 *               If you want to use the tag's value attribute instead, 
	 *               set this to null.
	 *   alpha     - (Deprecated) Boolean Force the color picker to use alpha value 
	 *               despite its selected color format. This option is 
	 *               deprecated. Use sliders = "a" instead.
	 *   inverseLabel    - (deprecated) Boolean use inverse color for 
	 *                     input label instead of black/white color.
	 *   preserveWheel   - Boolean preserve color wheel shade when slider 
	 *                     position changes. If set to true, changing 
	 *                     color wheel from black will reset selectedColor.val 
	 *                     (shade) to 1.
	 *   cssClass  - Object CSS Classes to be added to the color picker.
	 *   width     - Mixed Color picker width, either in px or 'stretch' to 
	 *               fit the input width. If null then the default CSS size 
	 *               will be used.
	 *   height    - Integer Color picker height in px. If null then the default 
	 *               CSS size will be used.
	 *   layout    - String [block|popup] Layout mode.
	 *   animDuration    - Number Duration for transitions such as fade-in 
	 *                     and fade-out.
	 *   quality   - Number Quality factor. The normal quality is 1.
	 *   sliders   - String combination of sliders. If null then the color 
	 *               picker will show default values, which is "wv" for 
	 *               normal color or "wva" for color with alpha value. 
	 *               Possible combinations are "whsvrgba". Note that the 
	 *               order of letters affects the slider positions.
	 */
	$.fn.wheelColorPicker.defaults = {
		format: 'hex',
		preview: true,
		live: true,
		userinput: true,
		validate: false,
		color: null, /* DEPRECATED */
		alpha: null, /* DEPRECATED */
		inverseLabel: false, /* DEPRECATED */
		preserveWheel: false,
		cssClass: '',
		width: null,
		height: null,
		layout: 'popup',
		animDuration: 200,
		quality: 1,
		sliders: null
	};
	
	$.fn.wheelColorPicker.hasInit = false;
	
	/**
	 * Function: hsvToRgb
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
	
	/**
	 * Function: staticInit
	 * 
	 * Initialize wheel color picker globally
	 */
	methods.staticInit = function() {
		if($.fn.wheelColorPicker.hasInit)
			return;
		
		$('body').on('mouseup.wheelColorPicker', private.onBodyMouseUp);
		$('body').on('mousemove.wheelColorPicker', private.onBodyMouseMove);
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
			
			/// LAYOUT & BINDINGS ///
			// Setup block mode layout
			if( settings.layout == 'block' ) {
				$widget = private.initWidget.call( $this );
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
				$this.hide();
				
				// Draw shading
				methods.redrawSliders.call( $this, null, true );
				methods.updateSliders.call( $this );
				
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
				$this.on('blur.wheelColorPicker', methods.hide);
			}
		});
	};
	
	/**
	 * Function: setOptions
	 * 
	 * Set options to the color picker
	 */
	methods.setOptions = function( options ) {
		this.each(function() {
			var $this = $(this); // Refers to input elm
			var settings = $.extend( true, {}, $.fn.wheelColorPicker.defaults, options );
			$this.data('jQWCP.settings', settings);
		});
		
		return methods.init.call( this );
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
		
		// Set the input element the popup is attached to
		$widget.data('jQWCP.inputElm', this);
		
		// Assign custom css class
		$widget.attr( 'class', 'jQWCP-wWidget' );
		$widget.addClass( settings.cssClass );
		
		// Redraw sliders
		methods.redrawSliders.call( $this, null, true );
		methods.updateSliders.call( $this );
		
		$widget.fadeIn( settings.animDuration );
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
				
			var w = settings.quality * 50;
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
	 * Function: setRgba
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
	 * Set color using RGB combination.
	 */
	methods.setRgb = function( r, g, b ) {
		return methods.setRgba.call( this, r, g, b, null );
	};
	
	/**
	 * Function: setHsva
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
		});
		
		methods.updateSliders.call( this, "rgb" );
		return methods.redrawSliders.call( this, "svrgba" );
	};
	
	/**
	 * Function: setHsv
	 * 
	 * Set color using HSV combination.
	 */
	methods.setHsv = function( h, s, v ) {
		return methods.setHsva.call( this, h, s, v, null );
	};
	
	/**
	 * Function: setAlpha
	 * 
	 * Set alpha value.
	 */
	methods.setAlpha = function( value ) {
		return this.each(function() {
			var $this = $(this); // Refers to input elm
			var color = $this.data('jQWCP.color');
			
			color.a = value;
		});
	};
	
	/**
	 * Function: getColor
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
		return $(this).data('jQWCP.color');
	};
	
	/**
	 * Function: initWidget
	 * 
	 * Initialize widget elements and layout
	 */
	private.initWidget = function( widget ) {
		var settings = this.data('jQWCP.settings');
		
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
						"<canvas class='jQWCP-wHueSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Hue'></canvas>" +
						"<span class='jQWCP-wHueCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wSat jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wSatSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Saturation'></canvas>" +
						"<span class='jQWCP-wSatCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wVal jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wValSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Value'></canvas>" +
						"<span class='jQWCP-wValCursor jQWCP-scursor'></span>" +
					"</div>" +
				"</div>" +
				"<div class='jQWCP-wRGBGroup'>" +
					"<div class='jQWCP-wRed jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wRedSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Red'></canvas>" +
						"<span class='jQWCP-wRedCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wGreen jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wGreenSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Green'></canvas>" +
						"<span class='jQWCP-wGreenCursor jQWCP-scursor'></span>" +
					"</div>" +
					"<div class='jQWCP-wBlue jQWCP-slider-wrapper'>" +
						"<canvas class='jQWCP-wBlueSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Blue'></canvas>" +
						"<span class='jQWCP-wBlueCursor jQWCP-scursor'></span>" +
					"</div>" +
				"</div>" +
				"<div class='jQWCP-wAlpha jQWCP-slider-wrapper'>" +
					"<canvas class='jQWCP-wAlphaSlider jQWCP-slider' width='" + sCanvasSize + "' height='" + sCanvasSize + "' title='Alpha'></canvas>" +
					"<span class='jQWCP-wAlphaCursor jQWCP-scursor'></span>" +
				"</div>" +
			"</div>"
		);
			
		// Small UI fix to disable highlighting the widget
		$widget.find('.jQWCP-slider-wrapper, .jQWCP-scursor, .jQWCP-slider')
			.attr('unselectable', 'on')
			.css('-moz-user-select', 'none')
			.css('-webkit-user-select', 'none')
			.css('user-select', 'none');
			
		// Bind widget events
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-slider', private.onSliderMouseDown);
		$widget.on('mousedown.wheelColorPicker', '.jQWCP-scursor', private.onSliderCursorMouseDown);
		
		return $widget;
	};
	
	/**
	 * Function: onPopupDlgMouseDown
	 * 
	 * Prevent loss focus of the input causing the dialog to be hidden.
	 */
	private.onPopupDlgMouseDown = function( e ) {
		var $this = $(this); // Refers to wWidget
		var $input = $( $this.data('jQWCP.inputElm') );
		
		// Temporarily unbind blur event until mouse is released
		$input.off('blur.wheelColorPicker');
	};
	
	/**
	 * Function: onPopupDlgMouseUp
	 * 
	 * Re-bind events that was unbound by onPopupDlgMouseDown.
	 */
	private.onPopupDlgMouseUp = function( e ) {
		var $this = $(this); // Refers to wWidget
		var $input = $( $this.data('jQWCP.inputElm') );
		
		// Rebind blur event
		$input.on('blur.wheelColorPicker', methods.hide);
		
		// Input elm must always be focused
		$input.focus();
	};
	
	/**
	 * Function: onSliderMouseDown
	 * 
	 * Begin clicking the slider down. This will allow user to move 
	 * the slider although the mouse is outside the slider.
	 */
	private.onSliderMouseDown = function( e ) {
		var $this = $(this); // Refers to slider
		var $widget = $this.parents('jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.parent().get(0));
	};
	
	/**
	 * Function: onSliderCursorMouseDown
	 * 
	 * Begin clicking the slider down. This will allow user to move 
	 * the slider although the mouse is outside the slider.
	 */
	private.onSliderCursorMouseDown = function( e ) {
		var $this = $(this); // Refers to slider cursor
		var $widget = $this.parents('jQWCP-wWidget:eq(0)');
		var $input = $( $widget.data('jQWCP.inputElm') );
		
		$('body').data('jQWCP.activeControl', $this.parent().get(0));
	};
	
	/**
	 * Function: onBodyMouseUp
	 * 
	 * Clear active control reference.
	 */
	private.onBodyMouseUp = function( e ) {
		
		// Last time update active control before clearing
		private.updateActiveControl( e );
		
		// Clear active control reference
		$('body').data('jQWCP.activeControl', null);
	};
	
	/**
	 * Function: onBodyMouseMove
	 * 
	 * Move the active slider (when mouse click is down).
	 */
	private.onBodyMouseMove = function( e ) {
		var $control = $( $('body').data('jQWCP.activeControl') ); // Refers to slider wrapper
		
		if($control.length == 0)
			return;
		
		private.updateActiveControl( e );
		
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
		var color = $input.data('jQWCP.color');
		
		/// SLIDER CONTROL ///
		if($control.hasClass('jQWCP-slider-wrapper')) {
			var $cursor = $control.find('.jQWCP-scursor');
			
			var relY = (e.pageY - $control.offset().top) / $control.height();
			var value = relY < 0 ? 0 : relY > 1 ? 1 : relY;
			
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
	};
	
	
}) (jQuery);
