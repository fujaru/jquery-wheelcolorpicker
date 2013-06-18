<!--
Notice: Old Version
-------------------
This branch contains the **old 1.x version** of jQuery Wheel Color Picker plugin and no longer maintained. If you're intending to use this plugin for your new websites, please look for the newer 2.x version in **master** branch instead. The newer version has a cleaner code and addresses a few issues that persists in this version.

The files were originally hosted at http://v6.jar2.net/projects/jquery-wheelcolorpicker which has been migrated to GitHub to maintain compatibility with newer jQuery Plugin Registry website.

------------------------------------------------------------
-->

jQuery - Wheel Color Picker Plugin
==================================

The Wheel Color Picker plugin adds color picker functionality to HTML form inputs in the round color wheel fashion. The Wheel Color Picker dialog appears as users focus the input. It currently supports these HTML elements:

* input (works on buttons too!)
* textarea

Note: It should also works on other HTML elements which support jQuery .val() function.

There are numbers of formats which the color picker can display its value:

* **hex** format, e.g. ffffff
* **CSS-style hex** format, e.g. #ffffff
* **rgb** format, e.g. rgb(255, 255, 255)
* **rgba** format, e.g. rgba(255, 255, 255, 1)
* **rgb%** format, e.g. rgb(100%, 100%, 100%)
* **rgba%** format, e.g. rgb(100%, 100%, 100%, 1)

jQuery Wheel Color Picker plugin is released under [MIT License](http://v6.jar2.net/projects/jquery-wheelcolorpicker/license).


Demo
----
See http://v6.jar2.net/projects/jquery-wheelcolorpicker/demo for demo.


Usage
-----
Initialize the color picker to an element by simply calling:

    .wheelColorPicker( options );

**Example**


    <input type="text" class="colorpicker" />
    <script type="text/javascript">
      $(function() { $('.colorpicker').wheelColorPicker({ dir: '.' }); });
    </script>


Options
-------
<table class="table">
	<tbody><tr>
		<th>Name</th>
		<th>Type/Values</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>dir</td>
		<td>String</td>
		<td>Directory path containing necessary plugin images.</td>
	</tr>
	<tr>
		<td>format</td>
		<td>'hex' | 'css' | 'rgb' | 'rgba' | 'rgb%' | 'rgba%'</td>
		<td>Format of the chosen color value.</td>
	</tr>
	<tr>
		<td>preview</td>
		<td>Boolean</td>
		<td>Enable live color preview on the input's background.</td>
	</tr>
	<tr>
		<td>userinput</td>
		<td>Boolean</td>
		<td>Enable picking color by typing directly</td>
	</tr>
	<tr>
		<td>validate</td>
		<td>Boolean</td>
		<td>When userinput is enabled, always convert the input value to a specified format.</td>
	</tr>
	<tr>
		<td>color</td>
		<td>String</td>
		<td>Initial value in any of supported color value format. <br>
		This value takes precedence over value attribute specified 
		directly on input tags. <br>If you want to use the tag's value 
		attribute instead, set this to null.</td>
	</tr>
	<tr>
		<td>alpha</td>
		<td>Boolean</td>
		<td>Boolean Force the color picker to use alpha value 
		despite its selected color format.</td>
	</tr>
	<tr>
		<td>inverseLabel</td>
		<td>Boolean</td>
		<td>Use inverse color for input label instead of black/white color. Default is true.</td>
	</tr>
</tbody></table>


Methods
-------
<table class="table">
	<tbody><tr>
		<th>Method</th>
		<th>Usage</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>show</td>
		<td>.wheelColorPicker("show")</td>
		<td>Show the color picker dialog.</td>
	</tr>
	<tr>
		<td>hide</td>
		<td>.wheelColorPicker("hide")</td>
		<td>Hide the color picker dialog.</td>
	</tr>
	<tr>
		<td>destroy</td>
		<td>.wheelColorPicker("destroy")</td>
		<td>Destroy the assigned color picker function.</td>
	</tr>
	<tr>
		<td>updateValue</td>
		<td>.wheelColorPicker("updateValue")</td>
		<td>Update the input value from the color picker dialog.</td>
	</tr>
	<tr>
		<td>color</td>
		<td>.wheelColorPicker("color", value)</td>
		<td>Update the selection color on the color picker dialog.</td>
	</tr>
	<tr>
		<td>updateColor</td>
		<td>.wheelColorPicker("updateColor", value)</td>
		<td>Update the selection color on the color picker dialog. (deprecated)</td>
	</tr>
	
	<tr>
		<td>updateSelection</td>
		<td>.wheelColorPicker("updateSelection")</td>
		<td>Update color dialog selection to match current selectedColor value.</td>
	</tr>
</tbody></table>


Theming
-------
The color picker dialog can be themed using CSS by defining styles of #jQWheelColorPickerDlg. This is the ID used by the dialog. For your note, while in general most of CSS properties can be defined, some properties such as size and positioning might not take effect.

Here's the basic markup of the color picker dialog.

    <div id="jQWheelColorPickerDlg">
      <div id="jQWheelColorPickerDlgWheel">
    		<span id="jQWheelColorPickerDlgCross"></span>
    	</div>
    	<span id="jQWheelColorPickerDlgArrow"></span>
    	<span id="jQWheelColorPickerDlgSlider">
    		<span class="jqwcpSliderPoint"></span>
    		...
    	</span>
    	<span id="jQWheelColorPickerDlgArrowAlpha"></span>
    	<span id="jQWheelColorPickerDlgSliderAlpha">
    		<span class="jqwcpSliderPoint"></span>
    		...
    	</span>
    </div>

**Example**

The example below changes the dialog background to white.

    #jQWheelColorPickerDlg {
    	background-color: white;
    }
