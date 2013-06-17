/**
 * File: jquery.wheelcolorpicker.js
 * 
 * Version 1.3.2
 * 20 December 2011
 * 
 * JavaScript Wheel Color Picker
 * http://www.jar2.net/projects/jquery-wheelcolorpicker
 * 
 * 
 * Copyright © 2011 Fajar Yoseph Chandra. All rights reserved.
 * Released under MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Usage example: $('input').wheelColorPicker();
 */

(function($) {
	
	/**
	 * Object: settings
	 * 
	 * Contains default options for the wheelColorPicker plugin.
	 * 
	 * Member properties:
	 * 
	 *   dir       - String Directory path of wheel color picker's images
	 *   format    - String [hex|css|rgb|rgba|rgb%] Color naming style
	 *   preview   - Boolean Enable live color preview on input field
	 *   userinput - Boolean Enable picking color by typing directly
	 *   validate  - Boolean When userinput is enabled, always convert 
	 *               the input value to a specified format.
	 *   color     - String Initial value in any of supported color 
	 *               value format. This value takes precedence over 
	 *               value attribute specified directly on input tags. 
	 *               If you want to use the tag's value attribute instead, 
	 *               set this to null.
	 *   alpha     - Boolean Force the color picker to use alpha value 
	 *               despite its selected color format.
	 *   inverseLabel    - Boolean use inverse color for input label instead
	 *                     of black/white color.
	 *   preserveWheel   - Boolean preserve color wheel shade when slider 
	 *                     position changes. If set to true, changing 
	 *                     color wheel from black will reset selectedColor.val 
	 *                     (shade) to 1.
	 * 
	 * See also:
	 *   <init()>
	 */
	var settings = {
		dir: 'http://static.jar2.net/files-public/jquery/wheelcolorpicker/',
		//dir: '.',
		format: 'hex',
		preview: true,
		userinput: true,
		validate: false,
		color: null,
		alpha: false,
		inverseLabel: true,
		preserveWheel: false
	};
	
	// A reference to currently focused color input element
	var focusedInput = null;
	
	// Mouse state of the wheel and slider
	var isMouseDownWheel = false;
	var isMouseDownSlider = false;
	var isMouseDownSliderAlpha = false;
	
	/**
	 * Object: selectedColor
	 * 
	 * Contains all selected color components.
	 * 
	 * Member properties:
	 * 
	 *   pr  - Float [0,1] Red value
	 *   pg  - Float [0,1] Green value
	 *   pb  - Float [0,1] Blue value
	 *   val - Float [0,1] Value (brightness)
	 *   sat - Float [0,1] Saturation
	 *   hue - Float [0,360] Hue in degrees, 0 = red
	 *   r   - Integer [0,255] Final red value
	 *   g   - Integer [0,255] Final green value
	 *   b   - Integer [0,255] Final blue value
	 *   alpha - Float [0,1] Alpha value (transparency)
	 * 
	 */
	var selectedColor = {
		pr: 1,
		pg: 1,
		pb: 1,
		val: 1,
		sat: 0,
		hue: 0,
		r: 255,
		g: 255,
		b: 255,
		alpha: 1
	};
	
	/**
	 * Object: methods
	 * 
	 * Holds all available methods in wheelColorPicker plugin.
	 */
	var methods = {
		
		/**
		 * Method: init
		 * 
		 * Initialize wheelColorPicker.
		 * 
		 * Options:
		 *   Kindly see <settings> for available options.
		 */
		init: function(options) {
			
			// Extend settings
			if(options) 
				$.extend(settings, options);
			
			// Check alpha value support
			switch(settings.format) {
				case 'rgba':
				case 'rgba%':
					settings.alpha = true;
			}
				
			// Append stylesheet
			$('head').prepend(
				'<style type="text/css" id="jQWheelColorPickerCSS">' +
					'#jQWheelColorPickerDlg { ' +
						'position: absolute !important;' +
						'border: solid 1px black;' +
						'width: 160px !important;' +
						'height: 134px !important;' +
						'padding: 8px !important;' +
						'background-color: #222;' +
						'_background-color: #fff;' +
						'z-index: 100000 !important;' +
						'box-shadow: 1px 1px 4px black;' +
						'cursor: default;' +
						'border-radius: 10px;' +
					'}' +
					'#jQWheelColorPickerDlg.jqwcpWithAlpha { ' +
						'width: 190px !important;' +
					'}' +
					'#jQWheelColorPickerDlgWheel {' +
						'position: absolute !important;' +
						'left: 8px !important;' +
						'top: 8px !important;' +
						'width: 134px !important;' +
						'height: 134px !important;' +
						'z-index: 1 !important;' +
						'background: url("'+settings.dir+'/wheel.png") no-repeat center center !important;' +
					'}' +
					'#jQWheelColorPickerDlgWheelOverlay { ' +
						'position: absolute !important;' +
						'left: 0px !important;' +
						'top: 0px !important;' +
						'width: 100% !important;' +
						'height: 100% !important;' +
						'z-index: 2 !important;' +
						'border-radius: 50%;' +
						'-moz-border-radius: 50%;' +
						'-webkit-border-radius: 50%;' +
						'-o-border-radius: 50%;' +
						'background: black;' +
						'opacity: 0;' +
						'display: none;' +
					'}' +
					'#jQWheelColorPickerDlgSlider {' +
						'position: absolute !important;' +
						'display: block;' +
						'left: 150px !important;' +
						'top: 8px !important;' +
						'width: 16px !important;' +
						'height: 129px !important;' +
						'background-color: white;' +
						'border: solid 1px #111;' +
					'}' +
					'#jQWheelColorPickerDlgCross {' +
						'position: absolute !important;' +
						'background: url("'+settings.dir+'/cross.png") no-repeat center center !important;' +
						'width: 11px !important;' +
						'height: 11px !important;' +
						'z-index: 5 !important;' +
					'}' +
					'#jQWheelColorPickerDlgArrow {' +
						'position: absolute !important;' +
						'background: url("'+settings.dir+'/arrow.png") no-repeat center center !important;' +
						'width: 7px !important;' +
						'height: 7px !important;' +
						'left: 143px !important;' +
						'top: 5px;' +
					'}' +
					'#jQWheelColorPickerDlgSlider .jqwcpSliderPoint,' +
					'#jQWheelColorPickerDlgSliderAlpha .jqwcpSliderPoint {' +
						'position: relative !important;' +
						'width: 100% !important;' +
						'height: 3px !important;' +
						'font-size: 0 !important;' +
					'}' +
					'#jQWheelColorPickerDlgArrowAlpha {' +
						'position: absolute !important;' +
						'background: url("'+settings.dir+'/arrow.png") no-repeat center center !important;' +
						'width: 7px !important;' +
						'height: 7px !important;' +
						'left: 171px !important;' +
						'top: 134px;' +
					'}' +
					'#jQWheelColorPickerDlgSliderAlpha {' +
						'position: absolute !important;' +
						'display: block;' +
						'left: 178px !important;' +
						'top: 8px !important;' +
						'width: 16px !important;' +
						'height: 129px !important;' +
						'background: url("'+settings.dir+'/alpha.png") center center !important;' +
						'background-color: white;' +
						'border: solid 1px #111;' +
					'}' +
				'</style>'
			);
			
			return this.each(function() {
				// Bind events
				$(this).bind('focus.wheelColorPicker', methods.show);
				$(this).bind('blur.wheelColorPicker', methods.hide);
				
				// Set background alpha if it's enabled
				/*if(settings.preview && settings.alpha) {
					$(this).css('background-image', 'url("'+settings.dir+'/alpha.png")');
				}*/
				
				// If userinput is true, enable typing event handler
				if(settings.userinput) {
					$(this).removeAttr('readonly');
					$(this).bind('keyup.wheelColorPicker', function() {
						if(methods.updateColor($(this).val())) {
							methods.updateSelection();
							if(settings.validate)
								$(this).wheelColorPicker("updateValue");
							else {
								// Colorize input field
								if(settings.preview) {
									if(settings.alpha) {
										$(this).css('background-color', 'rgba(' + 
											selectedColor.r + ', ' +
											selectedColor.g + ', ' +
											selectedColor.b + ', ' +
											selectedColor.alpha +
										')');
									}
									else {
										$(this).css('background-color', 'rgb(' + 
											selectedColor.r + ', ' +
											selectedColor.g + ', ' +
											selectedColor.b +
										')');
									}
									
									// Use inverse color if enabled
									if(settings.inverseLabel) {
										$(this).css('color', 'rgb(' + 
											(255-selectedColor.r) + ', ' +
											(255-selectedColor.g) + ', ' +
											(255-selectedColor.b) +
										')');
									}
									else {
										$(this).css('color', 
											(selectedColor.val < 0.7 
											|| (selectedColor.sat > 0.5 
											   && Math.abs(selectedColor.hue-300) < 75)
											) ? 'white' : 'black'
										);
									}
								}
							}
						}
					});
				}
				else {
					$(this).attr('readonly', 'readonly');
				}
				
				// Update color value
				if(settings.color == null || settings.color == undefined) {
					if(('').trim) { 
						if($(this).val().trim() != '')
							$(this).wheelColorPicker('color', $(this).val());
					}
					else { // IE workaround (IE doesn't support String.trim())
						if($(this).val() != '')
							$(this).wheelColorPicker('color', $(this).val());
					}
				}
				else {
					$(this).wheelColorPicker('color', settings.color);
				}
				$(this).wheelColorPicker('updateValue');
			});
		},
		
		/**
		 * Method: destroy
		 * 
		 * Destroy Wheel Color Picker functionality from an element.
		 */
		destroy: function() {
			$("#jQWheelColorPickerCSS").remove();
			return this.each(function() {
				$(this).unbind('.wheelColorPicker');
			});
		},
		
		/**
		 * Method: updateValue
		 * 
		 * Update the value of input field
		 */
		updateValue: function() {
			// Colorize input field
			if(settings.preview) {
				if(settings.alpha) {
					$(this).css('background-color', 'rgba(' + 
						selectedColor.r + ', ' +
						selectedColor.g + ', ' +
						selectedColor.b + ', ' +
						selectedColor.alpha +
					')');
				}
				else {
					$(this).css('background-color', 'rgb(' + 
						selectedColor.r + ', ' +
						selectedColor.g + ', ' +
						selectedColor.b +
					')');
				}
				
				// Use inverse color if enabled
				if(settings.inverseLabel) {
					$(this).css('color', 'rgb(' + 
						(255-selectedColor.r) + ', ' +
						(255-selectedColor.g) + ', ' +
						(255-selectedColor.b) +
					')');
				}
				else {
					$(this).css('color', 
						(selectedColor.val < 0.7
						|| (selectedColor.sat > 0.5 
						   && Math.abs(selectedColor.hue-300) < 75)
						) ? 'white' : 'black'
					);
				}
			}
			
			// Update field value
			var val = '';
			switch(settings.format) {
				case 'css':
					val += '#';
				default:
				case 'hex':
					var r = selectedColor.r.toString(16);
					if(r.length == 1) r = '0'+r;
					var g = selectedColor.g.toString(16);
					if(g.length == 1) g = '0'+g;
					var b = selectedColor.b.toString(16);
					if(b.length == 1) b = '0'+b;
					val += r+g+b;
					break;
				case 'rgb':
					val += 'rgb('+selectedColor.r+','+selectedColor.g+','+selectedColor.b+')';
					break;
				case 'rgb%':
					var r = (selectedColor.r/255*100).toFixed(2);
					var g = (selectedColor.g/255*100).toFixed(2);
					var b = (selectedColor.b/255*100).toFixed(2);
					if(r == Math.round(r)) r = Math.round(r);
					if(g == Math.round(g)) g = Math.round(g);
					if(b == Math.round(b)) b = Math.round(b);
					val += 'rgb('+r+'%,'+g+'%,'+b+'%)';
					break;
				case 'rgba':
					val += 'rgba('+selectedColor.r+','+selectedColor.g+','+selectedColor.b+','+selectedColor.alpha+')';
					break;
				case 'rgba%':
					var r = (selectedColor.r/255*100).toFixed(2);
					var g = (selectedColor.g/255*100).toFixed(2);
					var b = (selectedColor.b/255*100).toFixed(2);
					if(r == Math.round(r)) r = Math.round(r);
					if(g == Math.round(g)) g = Math.round(g);
					if(b == Math.round(b)) b = Math.round(b);
					val += 'rgba('+r+'%,'+g+'%,'+b+'%,'+selectedColor.alpha+')';
					break;
			}
			$(this).val(val);
		},
		
		/**
		 * Method: color
		 * 
		 * Update the color selection on the dialog to match current 
		 * input value.
		 * 
		 * Parameters:
		 *   val - String Color value. Can be in either format: #ffffff, 
		 *         ffffff, rgb(255, 255, 255), or rgba(255, 255, 255, 1)
		 * 
		 * Return:
		 *   Boolean - true on success, false if invalid value is entered.
		 * 
		 */
		color: function(val) {
			var r, g, b, a = 1;
			
			// #ffffff
			if(val.length == 7 
			&& val.charAt(0) == '#'
			) {
				if(isNaN(r = parseInt(val.substr(1, 2), 16)))
					return false;
				if(isNaN(g = parseInt(val.substr(3, 2), 16)))
					return false;	
				if(isNaN(b = parseInt(val.substr(5, 2), 16)))
					return false;
			}
			
			// ffffff
			else if(val.length == 6) {
				if(isNaN(r = parseInt(val.substr(0, 2), 16)))
					return false;
				if(isNaN(g = parseInt(val.substr(2, 2), 16)))
					return false;	
				if(isNaN(b = parseInt(val.substr(4, 2), 16)))
					return false;
			}
			
			// #fff (Disabled due to conflicts with #ffffff)
			/*else if(val.length == 4) {
				if(isNaN(r = parseInt(val.substr(1, 1)+val.substr(1, 1), 16)))
					return false;
				if(isNaN(g = parseInt(val.substr(2, 1)+val.substr(2, 1), 16)))
					return false;	
				if(isNaN(b = parseInt(val.substr(3, 1)+val.substr(3, 1), 16)))
					return false;
			}*/
			
			// rgba(100%,100%,100%,1)
			else if(val.substr(0, 4) == 'rgba' 
				&& val.match(/rgba\s*\(\s*[0-9\.]+%\s*,\s*[0-9\.]+%\s*,\s*[0-9\.]+%\s*,\s*[01]\.?[0-9]*\s*\)/i) != null
			) {
				if(isNaN(r = parseInt(val.substring(val.indexOf('(')+1, val.indexOf(',')), 10)))
					return false;
				else
					r = Math.round(r/100*255);
				if(isNaN(g = parseInt(val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1)), 10)))
					return false;	
				else
					g = Math.round(g/100*255);
				if(isNaN(b = parseInt(val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(',')), 10)))
					return false;
				else
					b = Math.round(b/100*255);
				if(isNaN(a = parseFloat(val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')')), 10)))
					return false;
			}
			
			// rgba(255,255,255,1)
			else if(val.substr(0, 4) == 'rgba' 
				&& val.match(/rgba\s*\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[01]\.?[0-9]*\s*\)/i) != null
			) {
				if(isNaN(r = parseInt(val.substring(val.indexOf('(')+1, val.indexOf(',')), 10)))
					return false;
				if(isNaN(g = parseInt(val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1)), 10)))
					return false;	
				if(isNaN(b = parseInt(val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(',')), 10)))
					return false;
				if(isNaN(a = parseFloat(val.substring(val.lastIndexOf(',')+1, val.lastIndexOf(')')), 10)))
					return false;
			}
			
			// rgb(100%,100%,100%)
			else if(val.substr(0, 3) == 'rgb' 
				&& val.match(/rgb\s*\(\s*[0-9\.]+%\s*,\s*[0-9\.]+%\s*,\s*[0-9\.]+%\s*\)/i) != null
			) {
				if(isNaN(r = parseInt(val.substring(val.indexOf('(')+1, val.indexOf(',')), 10)))
					return false;
				else
					r = Math.round(r/100*255);
				if(isNaN(g = parseInt(val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1)), 10)))
					return false;	
				else
					g = Math.round(g/100*255);
				if(isNaN(b = parseInt(val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(')')), 10)))
					return false;
				else
					b = Math.round(b/100*255);
			}
			
			// rgb(255,255,255)
			else if(val.substr(0, 3) == 'rgb' 
				&& val.match(/rgb\s*\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\)/i) != null
			) {
				if(isNaN(r = parseInt(val.substring(val.indexOf('(')+1, val.indexOf(',')), 10)))
					return false;
				if(isNaN(g = parseInt(val.substring(val.indexOf(',')+1, val.indexOf(',', val.indexOf(',')+1)), 10)))
					return false;	
				if(isNaN(b = parseInt(val.substring(val.indexOf(',', val.indexOf(',')+1)+1, val.lastIndexOf(')')), 10)))
					return false;
			}
			
			// anything else
			else
				return false;
			
			// Update selectedColor values
			selectedColor.r = r;
			selectedColor.g = g;
			selectedColor.b = b;
			selectedColor.alpha = a;
			
			var maxColor = Math.max(r, g, b);
			var minColor = Math.min(r, g, b);
			var delta = maxColor - minColor;
			if(maxColor != 0) selectedColor.sat = delta / maxColor;
			else selectedColor.sat = 0;
			
			if(delta == 0) selectedColor.hue = 0;
			else if(r == maxColor) selectedColor.hue = (g - b) / delta;
			else if(g == maxColor) selectedColor.hue = 2 + (b - r) / delta;
			else if(b == maxColor) selectedColor.hue = 4 + (r - g) / delta;
			else selectedColor.hue = 0;
			selectedColor.hue = (selectedColor.hue * 60 + 360) % 360;
			
			selectedColor.val = maxColor/255;
			
			if(selectedColor.val == 0) {
				selectedColor.pr = 1;
				selectedColor.pg = 1;
				selectedColor.pb = 1;
			}
			else {
				selectedColor.pr = r/255 / selectedColor.val;
				selectedColor.pg = g/255 / selectedColor.val;
				selectedColor.pb = b/255 / selectedColor.val;
			}
			
			//methods.updateValue();
			$(this).wheelColorPicker('updateValue');
			
			return true;
		},
		
		/**
		 * Method: updateColor
		 * 
		 * (deprecated) Update the color selection on the dialog to 
		 * match current input value.
		 * 
		 * This method is deprecated in favor of color(),
		 * preserved here to maintain backward compatibility.
		 * 
		 * Parameters:
		 *   val - String Color value. Can be in either format: #ffffff, 
		 *         ffffff, rgb(255, 255, 255), or rgba(255, 255, 255, 1)
		 * 
		 * Return:
		 *   Boolean - true on success, false if invalid value is entered.
		 * 
		 * See also:
		 *   <color()>
		 */
		updateColor: function(val) {
			return $(this).wheelColorPicker("color", val);
		},
		
		/** 
		 * Method: updateSlider
		 * 
		 * Update color slider with the currently selected color p values.
		 * This function is intended for internal use. Please use 
		 * updateSelection() instead.
		 * 
		 * See also:
		 *   <updateSelection()>
		 *   <selectedColor>
		 */
		updateSlider: function() {
			var multiplier = 255 / $('#jQWheelColorPickerDlgSlider').height();
			var val = $('#jQWheelColorPickerDlgSlider').height();
			$('#jQWheelColorPickerDlgSlider .jqwcpSliderPoint').each(function () {
				$(this).css('background-color', 'rgb(' + 
					Math.round(selectedColor.pr * multiplier * val) + ', ' +
					Math.round(selectedColor.pg * multiplier * val) + ', ' +
					Math.round(selectedColor.pb * multiplier * val) +
				')');
				val -= 3;
			});
			
			if(settings.alpha)
				methods.updateSliderAlpha();
		},
		
		/** 
		 * Method: updateSliderAlpha
		 * 
		 * Update alpha slider with the currently selected color values.
		 * This function is intended for internal use. Please use 
		 * updateSelection() instead.
		 * 
		 * Version added: 1.2
		 * 
		 * See also:
		 * 	 <updateSlider()>
		 *   <updateSelection()>
		 *   <selectedColor>
		 */
		updateSliderAlpha: function() {
			var multiplier = 1 / $('#jQWheelColorPickerDlgSliderAlpha').height();
			var val = 0;
			$('#jQWheelColorPickerDlgSliderAlpha .jqwcpSliderPoint').each(function () {
				$(this).css('background-color', 'rgba(' + 
					Math.round(selectedColor.r) + ', ' +
					Math.round(selectedColor.g) + ', ' +
					Math.round(selectedColor.b) + ', ' +
					(multiplier*val) +
				')');
				val += 3;
			});
		},
		
		/**
		 * Method: updateSelection
		 * 
		 * Update color dialog selection to match current selectedColor
		 * value.
		 * 
		 * See also:
		 *   <updateColor()>
		 *   <updateSlider()>
		 *   <selectedColor>
		 */
		updateSelection: function() {
			var sliderY = (1-selectedColor.val) * $('#jQWheelColorPickerDlgSlider').height()
				+ parseInt($('#jQWheelColorPickerDlgSlider').css('top').replace('px', ''), 10)
				- $('#jQWheelColorPickerDlgArrow').outerHeight()/2;
			$('#jQWheelColorPickerDlgArrow').css('top', Math.round(sliderY)+'px');
			
			var radius = $('#jQWheelColorPickerDlgWheel').width() / 2;
			var wheelX = Math.cos(selectedColor.hue/180*Math.PI) * selectedColor.sat
				* radius
				+ radius
				- $('#jQWheelColorPickerDlgCross').outerWidth() / 2;
			$('#jQWheelColorPickerDlgCross').css('left', Math.round(wheelX)+'px');
			var wheelY = (Math.sin(selectedColor.hue/180*Math.PI) * selectedColor.sat
				* radius) * -1
				+ radius
				- $('#jQWheelColorPickerDlgCross').outerHeight() / 2;
			$('#jQWheelColorPickerDlgCross').css('top', Math.round(wheelY)+'px');
						
			// Update wheel shade #111220
			if(!settings.preserveWheel) {
				$('#jQWheelColorPickerDlgWheelOverlay').css('opacity', 1-selectedColor.val);
			}
			
			methods.updateSlider();
		},
		
		/**
		 * Method: show
		 * 
		 * Show the color picker dialog. 
		 * Please note that only one dialog can be shown per time. 
		 * If you call this function on several objects, the dialog will 
		 * only displayed for the last object.
		 * 
		 * Return: 
		 * 
		 *   The (last) object where the color picker dialog is displayed
		 *   for.
		 */
		show: function(e) {
			if(focusedInput == this)
				return false;
			
			methods.hide(e, true);
			
			// Append color dialog
			$('body').append(
				'<div id="jQWheelColorPickerDlg" style="display: none;" ' +
				'class="' + ((settings.alpha) ? 'jqwcpWithAlpha' : '') + '">' + 
					'<div id="jQWheelColorPickerDlgWheel">' +
						'<div id="jQWheelColorPickerDlgWheelOverlay"></div>' +
						'<span id="jQWheelColorPickerDlgCross">' +
						'</span>' +
					'</div>' +
					'<span id="jQWheelColorPickerDlgArrow">' +
					'</span>' +
					'<div id="jQWheelColorPickerDlgSlider">' +
					'</div>' +
				'</div>'
			);
			
			// If preserveWheel is false, enable wheel overlay (shading) #111220
			if(!settings.preserveWheel) {
				$('#jQWheelColorPickerDlgWheelOverlay').show();
			}
			
			// Draw slider colors
			var multiplier = 255 / $('#jQWheelColorPickerDlgSlider').height();
			for(var i = $('#jQWheelColorPickerDlgSlider').height(); i >= 0; i-=3) {
				$('#jQWheelColorPickerDlgSlider').append(
					'<div class="jqwcpSliderPoint" style="background-color: rgb(' + 
						Math.round(multiplier*i) + ', ' +
						Math.round(multiplier*i) + ', ' +
						Math.round(multiplier*i) + 
					');">' +
					'</div>'
				);
			}
			
			// If alpha is enabled, add alpha sider
			if(settings.alpha) {
				$('#jQWheelColorPickerDlg').append(
					'<span id="jQWheelColorPickerDlgArrowAlpha">' +
					'</span>' +
					'<div id="jQWheelColorPickerDlgSliderAlpha">' +
					'</div>' 
				);
				
				// Draw alpha slider colors
				var multiplier = 1 / $('#jQWheelColorPickerDlgSliderAlpha').height();
				for(var i = 0; i <= $('#jQWheelColorPickerDlgSliderAlpha').height(); i+=3) {
					$('#jQWheelColorPickerDlgSliderAlpha').append(
						'<div class="jqwcpSliderPoint" style="background-color: rgba(' + 
							'0,0,0,' +
							(multiplier*i) + 
						');">' +
						'</div>'
					);
				}
			}
			
			//{ Update crosshair position
			$('#jQWheelColorPickerDlgCross').css('left', 
				($('#jQWheelColorPickerDlgWheel').width() / 2 +
				$('#jQWheelColorPickerDlgWheel').position().left -
				Math.ceil($('#jQWheelColorPickerDlgCross').width() / 2))
				+'px'
			);
			
			$('#jQWheelColorPickerDlgCross').css('top', 
				($('#jQWheelColorPickerDlgWheel').height() / 2 +
				$('#jQWheelColorPickerDlgWheel').position().top - 
				Math.ceil($('#jQWheelColorPickerDlgCross').height() / 2))
				+'px'
			);
			//}
			
			// Prevent loss focus of the input
			$('#jQWheelColorPickerDlg').bind('mousedown', function() {
				$(focusedInput).unbind('blur'); // IE Blur Fix 110821
				setTimeout(function() {
					$(focusedInput).bind('blur', methods.hide); // IE Blur Fix 110821
				}, 1);
				return false;
			});
			// IE Blur Fix 110821
			$('#jQWheelColorPickerDlg').bind('click', function() {
				$(focusedInput).get(0).focus();
			});
			
			// Update mouse state on mouse down
			$('#jQWheelColorPickerDlgWheel').bind('mousedown', function() {
				isMouseDownWheel = true;
			});
			// Update mouse state on mouse down
			$('#jQWheelColorPickerDlgSlider').bind('mousedown', function() {
				isMouseDownSlider = true;
			});
			
			// Update mouse state on mouse down
			if(settings.alpha) {
				$('#jQWheelColorPickerDlgSliderAlpha').bind('mousedown', function() {
					isMouseDownSliderAlpha = true;
				});
			}
			
			// Update mouse state on release
			$('#jQWheelColorPickerDlg').bind('mouseup', function() {
				isMouseDownWheel = false;
				isMouseDownSlider = false;
				isMouseDownSliderAlpha = false;
			});
			
			// The event handler on user click (and drag) a spot
			$('#jQWheelColorPickerDlg').bind('mousemove mousedown', function(e) {
				//$(this).removeClass("jQPreventBlur"); // IE Blur Fix 110821
				
				/** MouseDownWheel event */
				if(isMouseDownWheel) {
					
					// Wheel radius
					var radius = $('#jQWheelColorPickerDlgWheel').width()/2;
						
					// Selection position (absolute)
					var selX = e.pageX - $('#jQWheelColorPickerDlgWheel').offset().left;
					var selY = e.pageY - $('#jQWheelColorPickerDlgWheel').offset().top;
					
					// Selection position (relative to central point)
					var selXC = selX - radius;
					var selYC = radius - selY;
					
					// Offset from central point
					var offset = Math.sqrt(Math.pow(selXC, 2) + Math.pow(selYC, 2));
					
					// Constraint selection point
					if(offset > radius) {
						selXC = radius / offset * selXC;
						selYC = radius / offset * selYC;
						selX = selXC + radius;
						selY = radius - selYC;
						offset = radius;
					}
					
					// Selection degree (hue)
					var deg = (
						(selXC == 0 
							? (selYC > 0 ? 90 : 270)
							: 360 * (Math.atan(selYC/selXC)) / (2 * Math.PI)
						)
						+(selXC < 0 ? 180 : 0)
						+360
					)%360;
					
					// Relative Offset (sat)
					var sat = offset/radius;
					
					// Calculate color
					var cr = (Math.abs(deg+360)+60)%360 < 120 ? 1
						: (deg > 240 ? (120-Math.abs(deg-360))/60 
						: (deg < 120 ? (120-deg)/60
						: 0));
					var cg = Math.abs(deg-120) < 60 ? 1
						: (Math.abs(deg-120) < 120 ? (120-Math.abs(deg-120))/60 
						: 0);
					var cb = Math.abs(deg-240) < 60 ? 1
						: (Math.abs(deg-240) < 120 ? (120-Math.abs(deg-240))/60 
						: 0);
						
					// When preserveWheel is true,
					// Reset shade if changing from black #111220
					if(settings.preserveWheel && selectedColor.val == 0) {
						selectedColor.val = 1;
						var sliderY = (1-selectedColor.val) * $('#jQWheelColorPickerDlgSlider').height()
							+ parseInt($('#jQWheelColorPickerDlgSlider').css('top').replace('px', ''), 10)
							- $('#jQWheelColorPickerDlgArrow').outerHeight()/2;
						$('#jQWheelColorPickerDlgArrow').css('top', Math.round(sliderY)+'px');
					}
					
					// Calculate final color (with saturation)
					var pr = (cr + (1-cr)*(1-sat));
					var pg = (cg + (1-cg)*(1-sat));
					var pb = (cb + (1-cb)*(1-sat));
					
					// Store selected color data
					selectedColor.pr = pr;
					selectedColor.pg = pg;
					selectedColor.pb = pb;
					selectedColor.r = (Math.round(selectedColor.pr * selectedColor.val * 255));
					selectedColor.g = (Math.round(selectedColor.pg * selectedColor.val * 255));
					selectedColor.b = (Math.round(selectedColor.pb * selectedColor.val * 255));
					selectedColor.hue = deg;
					selectedColor.sat = sat;
					
					// Update crosshair position
					$('#jQWheelColorPickerDlgCross').css('left', 
						(selX -	Math.ceil($('#jQWheelColorPickerDlgCross').width() / 2))
						+'px'
					);
					
					$('#jQWheelColorPickerDlgCross').css('top', 
						(selY - Math.ceil($('#jQWheelColorPickerDlgCross').height() / 2))
						+'px'
					);
					
					// Update color slider
					methods.updateSlider();
					
					// Update alpha slider
					methods.updateSliderAlpha();
					
					$(focusedInput).wheelColorPicker('updateValue');
				}
				
				/** MouseDownSlider event */
				if(isMouseDownSlider) {
					// Slider size
					var size = $('#jQWheelColorPickerDlgSlider').height();
						
					// Selection position (absolute)
					var selY = e.pageY - $('#jQWheelColorPickerDlgSlider').offset().top;
					
					// Constraint selection point
					if(selY < 0) {
						selY = 0;
					}
					else if(selY > size) {
						selY = size;
					}
					
					// Store selected color data
					selectedColor.val = (size-selY) / size;
					selectedColor.r = Math.round(selectedColor.pr * selectedColor.val * 255);
					selectedColor.g = Math.round(selectedColor.pg * selectedColor.val * 255);
					selectedColor.b = Math.round(selectedColor.pb * selectedColor.val * 255);
					
					// Update crosshair position
					$('#jQWheelColorPickerDlgArrow').css('top', 
						(selY - Math.ceil($('#jQWheelColorPickerDlgArrow').height() / 2) + 
						$('#jQWheelColorPickerDlgSlider').position().top)
						+'px'
					);
					
					// Update wheel shade
					if(!settings.preserveWheel) {
						$('#jQWheelColorPickerDlgWheelOverlay').css('opacity', 1-selectedColor.val);
					}
					
					// Update alpha slider
					methods.updateSliderAlpha();
					
					$(focusedInput).wheelColorPicker('updateValue');
				}
				
				/** MouseDownSlider event */
				if(settings.alpha && isMouseDownSliderAlpha) {
					// Slider size
					var size = $('#jQWheelColorPickerDlgSliderAlpha').height();
						
					// Selection position (absolute)
					var selY = e.pageY - $('#jQWheelColorPickerDlgSliderAlpha').offset().top;
					
					// Constraint selection point
					if(selY < 0) {
						selY = 0;
					}
					else if(selY > size) {
						selY = size;
					}
					
					// Store selected color data
					selectedColor.alpha = (selY / size).toFixed(2);
					if(selectedColor.alpha == Math.round(selectedColor.alpha))
						selectedColor.alpha = Math.round(selectedColor.alpha);
					
					// Update crosshair position
					$('#jQWheelColorPickerDlgArrowAlpha').css('top', 
						(selY - Math.ceil($('#jQWheelColorPickerDlgArrowAlpha').height() / 2) + 
						$('#jQWheelColorPickerDlgSliderAlpha').position().top)
						+'px'
					);
					
					$(focusedInput).wheelColorPicker('updateValue');
				}
			});
			
			// Update currently focused input reference
			$(this).each(function() {
				focusedInput = this;
			});
			
			// Update color picker dialog position
			$('#jQWheelColorPickerDlg').css('left', $(focusedInput).offset().left+'px');
			$('#jQWheelColorPickerDlg').css('top', ($(focusedInput).offset().top+$(focusedInput).outerHeight())+'px');
				
			// Update color picker selection position
			selectedColor.pr = 1;
			selectedColor.pg = 1;
			selectedColor.pb = 1;
			selectedColor.val = 1;
			selectedColor.hue = 0;
			selectedColor.sat = 0;
			selectedColor.r = 255;
			selectedColor.g = 255;
			selectedColor.b = 255;
			if(methods.updateColor($(focusedInput).val())) {
				methods.updateSelection();
			}
				
			// Show the dialog
			$('#jQWheelColorPickerDlg').fadeIn('fast');
			
			return focusedInput;
		},
		
		/**
		 * Method: hide
		 * 
		 * Hide the color picker dialog
		 * 
		 * Parameters:
		 * 
		 *   e       - Event object
		 *   instant - Boolean Instantly hide the dialog instead of using 
		 *             fading effect to hide it.
		 */
		hide: function(e, instant) {
			
			if(instant)
				$('#jQWheelColorPickerDlg').remove();
			else
				$('#jQWheelColorPickerDlg').fadeOut('fast', function() {
					$(this).remove();
				});
			
			isMouseDownWheel = false;
			isMouseDownSlider = false;
			focusedInput = null;
		}
		
	};
	
	/**
	 * Function: wheelColorPicker
	 * 
	 * The wheelColorPicker plugin function
	 * 
	 * See also:
	 * 
	 *   <methods>
	 * 
	 */
	$.fn.wheelColorPicker = function ( method ) {
		if ( methods[method] ) {
		  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.wheelColorPicker' );
		} 
	};
	
})( jQuery );
