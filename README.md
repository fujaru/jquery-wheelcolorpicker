Notice: Development Stage
-------------------------

The new version 2 is currently in heavy development. If you're planning to use this plugin on production server, please consider using [version 1](https://github.com/fujaru/jquery-wheelcolorpicker/tree/v1) at the moment. The newer version 2 will be backward compatible so no need to worry.

------------------------------------------------------------

jQuery Wheel Color Picker Plugin
================================

The Wheel Color Picker plugin adds color picker functionality to HTML form inputs in the round color wheel fashion. The Wheel Color Picker dialog appears as users focus the input. It currently supports these HTML elements:

*   input (works on buttons too!)
*   textarea

Note: It should also works on other HTML elements which support jQuery .val() function.


Features
--------

**SUPPORTED COLORS**

This plugin supports the following color modes:

*   RGB
*   RGBA

**MULTIPLE FORMAT**

There are numbers of formats which the color picker can display its value:

*   **hex** format, e.g. ffffff
*   **CSS-style hex** format, e.g. #ffffff
*   **rgb** format, e.g. rgb(255, 255, 255)
*   **rgba** format, e.g. rgba(255, 255, 255, 1)
*   **rgb%** format, e.g. rgb(100%, 100%, 100%)
*   **rgba%** format, e.g. rgb(100%, 100%, 100%, 1)

**THEMING CAPABILITY**

The color picker appearance can be customized using CSS. This package already contains two CSS variants which can be used as starting point to make your own theme.


Planned Features
----------------

There are new features which are listed to be implemented in the near-future releases.

**ADJUSTABLE COLOR PICKER SIZE**

The color picker size can be adjusted with two options:

*   **fixed** size in width x height px
*   **stretch** the width to be the same as it's corresponding input element

**RESIZEABLE COLOR PICKER**

Enables user to resize color picker so they can pick the color more precisely.

**COMPONENT COLOR RETRIEVAL**

Get only the R, G, or B value from the selected color.


License
-------
jQuery Wheel Color Picker plugin is released under [MIT License](http://opensource.org/licenses/MIT).


Usage
-----

Initialize the color picker to an element by simply calling:

    .wheelColorPicker( options );

**Example**

    <input type="text" class="colorpicker" />
    <script type="text/javascript">
      $(function() { $('.colorpicker').wheelColorPicker(); });
    </script>


Documentation
-------------
See [Documentation Page](https://github.com/fujaru/jquery-wheelcolorpicker/wiki) for a complete documentation.


Supported Browsers
------------------
This plugin is supported in the following browsers:

*   IE 9+
*   Firefox 4+
*   Opera 10+
*   Chrome
*   Safari 5+


What's New
----------
The new 2.x version is a complete rewrite from version 1.x. It has cleaner code and adds more features.


Backward Compatibility
----------------------
To allow smooth transition from version 1.x to 2.x, this version includes most of options and methods from version 1.x which are now declared as *deprecated*. You should not depend on these deprecated functions as they can be removed at anytime. 
Feature like CSS theming is not backward compatible though. For more information, see [Migration](https://github.com/fujaru/jquery-wheelcolorpicker/wiki/Migration) page.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/fujaru/jquery-wheelcolorpicker/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
