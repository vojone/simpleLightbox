simpleLB
========

Very simple presentation widget for presenting photos on your website, which can be used super easily.
It should work in all major browsers (Firefox, Edge, Chrome, Safari, Opera), but **it needs JavaScript to be enabled!**.

![simpleLB presentation](ex1.png "Photo viewed in simpleLB")

**For usage is important only simpleLB folder**, rest of files and folders are only additional with examples. 

Usage
-----

1. Add JQuery (if you didn't do it earlier, add this HTML tag to head part of page source code):

<pre>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</pre>

2. Link JavaScript files and CSS (add these three tags to head):

<pre>
    &lt;script src="simpleLB/settings.js"&gt;&lt;/script&gt;
    &lt;script src="simpleLB/lbscript.js"&gt;&lt;/script&gt;
    &lt;link rel="stylesheet" type="text/css" href="simpleLB/lbstyle.css"&gt;
</pre>

3. Add simpleLB folder to your root website folder (or adjust src attribute in step 2).

4. If you want to present in lightbox, add class "lb" to it, for example:

<pre>
    &lt;img src="image/src.jpg" class="lb"&gt;
</pre>

And that's basicaly everything.

Features
--------

+ You can add short description to each photo by *data-caption* attribute:

<pre>
    &lt;img src="image/src1.jpg" class="lb" data-caption="Lorem Ipsum Dolor Sit Amet">
</pre>


+ You can divide your images into more galeries (presentations, sections...) by adding subclass name after "lb":

 <pre>   
    &lt;img src="image/src1.jpg" class="lb a"&gt;
    &lt;img src="image/src2.jpg" class="lb a"&gt;
    &lt;img src="image/src3.jpg" class="lb a"&gt;
    &lt;img src="image/src4.jpg" class="lb b"&gt;
    &lt;img src="image/src5.jpg" class="lb b"&gt;
</pre>

Now, when user clicked on *src2.jpg* and he is going through the the photos by side arrows, he can't see *src4.jpg* and *src5.jpg* directly.
He must end lightbox and then click on one of these two.

**Be carefull, it can have negative side efect, e. g. if you use special class name for style specification.**
You can solve it by adding your special class name before "lb". Important is only first subclass just after "lb" class name.

**This feature can't be easily disabled.**


+ You can easily modify plenty of lightbox features and properties (especialy visual aspects) by changing *settings.js* file.

+ It's possible to manipulate with photo (keys R,L,+,- and mouse or menu in right top corner). User can **rotate, zoom or translate** photo to better view. This feature an be disabled in *settings.js*.

+ It's possible also run automatic **presentation** of photos (if it's is allowed in settings.js). This presentation can be run by hitting Space key or in menu. In menu you can also set time for which will be every photo shown in **ms** (when current photo is updated manually by keys this time interval is restarted). Presentation starts with current photo and can be started only in one direction. 


See index.html for more information and examples...
