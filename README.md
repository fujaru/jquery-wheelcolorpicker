jQuery Wheel Color Picker Plugin
================================

The Wheel Color Picker plugin adds color picker functionality to HTML form inputs in the round color wheel fashion. The Wheel Color Picker dialog appears as users focus the input. It currently supports these HTML elements:

*   input (works on buttons too!)
*   textarea

Note: It should also works on other HTML elements which support jQuery .val() function.


Features
--------

**SUPPORTED COLORS**

This plugin supports both RGB and HSV modes with additional Alpha channel.

**MULTIPLE FORMAT**

There are numbers of formats which the color picker can display its value:

*   **hex** format, e.g. ffffff
*   **CSS-style hex** format, e.g. #ffffff
*   **rgb** format, e.g. rgb(255, 255, 255)
*   **hsv** format, e.g. hsv(1.0, 1.0, 1.0)
     
**INDIVIDUAL SLIDERS**

The color picker can be set to display slider for each individual color channel.

**THEMING CAPABILITY**

The color picker appearance can be customized using CSS. This package already contains two CSS variants which can be used as starting point to make your own theme.

See [Features Page](https://github.com/fujaru/jquery-wheelcolorpicker/wiki/Features) for the complete list.


Usage
-----

Initialize the color picker to an element by simply calling:

```js
.wheelColorPicker( options );
```

**Example**

```html
<input type="text" class="colorpicker" />
<script type="text/javascript">
  $(function() { $('.colorpicker').wheelColorPicker(); });
</script>
```


Demo
----
Try Wheel Color Picker plugin in action at our [demonstration page](http://www.jar2.net/projects/jquery-wheelcolorpicker/demo).


Documentation
-------------
See [Documentation Page](https://github.com/fujaru/jquery-wheelcolorpicker/wiki) for a complete documentation.


License
-------
jQuery Wheel Color Picker plugin is released under [MIT License](http://opensource.org/licenses/MIT).


What's New
----------
The new 2.x version is a complete rewrite from version 1.x. It has cleaner code and adds more features.


Backward Compatibility
----------------------
To allow smooth transition from version 1.x to 2.x, this version includes most of options and methods from version 1.x which are now declared as *deprecated*. You should not depend on these deprecated functions as they can be removed at anytime. 
Feature like CSS theming is not backward compatible though. For more information, see [Migration](https://github.com/fujaru/jquery-wheelcolorpicker/wiki/Migration) page.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/fujaru/jquery-wheelcolorpicker/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
