jQuery Wheel Color Picker Plugin
================================

**DRAFT NOTICE:** *This branch is a work in progress. Many things may change or break. Please download 2.3.0 instead.*

The Wheel Color Picker plugin adds color picker functionality to HTML form inputs in round color wheel style. The Wheel Color Picker can be displayed as a popup dialog as users focus the input, or embedded inline. It currently supports these HTML elements:

*   input (works on buttons too!)
*   textarea

Note: It should also works on other HTML elements which support jQuery .val() function.

![](http://blog.jar2.net/wp-content/uploads/2015/04/jqwcp.png)


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

Since version 2.3, an easier way to initialize the color picker is by simply adding `data-wheelcolorpicker` attribute to an input element.

```html
<input type="text" data-wheelcolorpicker />
```

**JAVASCRIPT WAY**

Or you can also initialize the color picker to an element by calling:

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
See example.html for more usage examples or try it online at our [demonstration page](http://www.jar2.net/projects/jquery-wheelcolorpicker/demo).



Documentation
-------------
See [Documentation Page](https://github.com/fujaru/jquery-wheelcolorpicker/wiki) for a complete documentation.



License
-------
jQuery Wheel Color Picker plugin is released under [MIT License](http://opensource.org/licenses/MIT).



What's New in 3.0
-----------------

*Work in progress*



Backward Compatibility
----------------------

**Version 2.x**

The new version 3.x is compatible with 2.x.
If you use a custom CSS which makes significant changes to positioning and/or sizes, the new mobile layout might be broken. In this case, you might want to switch back to default CSS or turning off mobile layout by setting `mobile` option to `false`.

**Version 1.x**

Options and methods marked as *deprecated* in version 2.x are still available which makes this backward compatible to 1.x. However, please refrain on using any deprecated options and methods since they are planned to be removed in future release. CSS is not backward compatible. Switching back to base theme is recommended. For more information, see [Migration](https://github.com/fujaru/jquery-wheelcolorpicker/wiki/Migration) page.
p
