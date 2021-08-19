/** ***********************************************************************************************
 *                                            lbscript.js                    
 *                                                                   
 *                   Purpose: File contains implementation of Simple lightbox galery                                                        
 *                      Note: I will be glad for improvements and fixed bugs
 *********************************************************************************************** */

$(document).ready(() => {
    lbHtml = new LbHTMLStructure(settings);
    lbHtml.prepare();

    galCreator = new GaleriesCreator();

    lightbox = new Lightbox(galCreator.getGals("lb"));

    lightbox.bindFrame(lbHtml);
    lightbox.addOnClick();

    if(settings.keyboardEnable) {
        lightbox.bindKeys();
    }
});


/**
 * Prototype for galery object that is showed in one coherent presentation
 * @param {*} name id for each galery (typically is used name of lb subclass)
 * @param {*} photo first photo, that will be in galery (galery cannsot be empty)
 */
function Galery(name, photo) {
    this.imgs = [photo];
    this.name = name;
    this.addImg = addImg;

    function addImg(img) {
        this.imgs.push(img);
    }
}

/**
 * Object, that represents HTML structure, "frame" that is used for presenting photos
 * @param {*} settings object from settings.js, that controls few visual aspects of HTML structure
 */
function LbHTMLStructure(settings) {
    this.settings = settings;

    this.grandParent = null;
    this.photo = null;
    this.link = null;

    this.next = null;
    this.prev = null;
    this.cross = null;

    this.caption = null;
    this.number = null;
    this.loader = null;

    /**
     * Prepares HTML structure for LB presentation
     */
    this.prepare = function() {
        //prepare lb window in background
        this.grandParent = this.createEl("div", "", "", "lb_cont");
        this.grandParent.style.backgroundColor = "rgba(0, 0, 0, " + this.settings.bgAlpha + ")"; 
        this.grandParent.style.display = "none"; //lb is not showed when page is loaded

        document.getElementsByTagName("html")[0].appendChild(this.grandParent);

        this.createPhotoEl();
        this.createButtons();
        this.createInfo();

        this.createLoader();
    }

    /**
     * Creates main element, which shows photo to user
     * @note needs grandparent element to be created first
     */
    this.createPhotoEl = function() {
        this.photo = this.createEl("img", "", "Photo", "main_img");
        this.photo.loading = "lazy";
        this.photo.alt = "Something went wrong with your image...\
                          Try to check the path to image and if image exists...";

        this.photo.style.maxHeight = settings.maxHeight;
        this.photo.style.maxWidth = settings.maxWidth;

        this.grandParent.appendChild(this.photo);
    }

    /**
     * Destroys prepared HTML structure
     * @note can be used e. g. when multiple lightbox html structures are created
     */
    this.destroy = function() {
        while(this.grandParent.firstChild) {
            this.grandParent.removeChild(this.grandParent.firstChild);
        }

        if(this.grandParent) {
            $(this.grandParent).remove();
        }
    }

    /**
     * Creates button for presentation
     * @note Grandparent element must be created first
     */
    this.createButtons = function() {
        //next photo button
        this.next = this.createEl("img", "next.png", "Next image", "next");
        if(settings.shadows) {
            var nextBox = this.createEl("div", "", "", "next_box");
            nextBox.appendChild(this.next);
            this.grandParent.appendChild(nextBox);
        }
        else {
            this.grandParent.appendChild(this.next);
        }
        
        //previous photo button
        this.prev = this.createEl("img", "back.png", "Previous image", "prev");
        if(settings.shadows) {
            var prevBox = this.createEl("div", "", "", "prev_box");
            prevBox.appendChild(this.prev);
            this.grandParent.appendChild(prevBox);
        }
        else {
            this.grandParent.appendChild(this.prev);
        }

        //close button 
        this.cross = this.createEl("img", "close.png", "Close galery (Esc)", "cross");

        //downloading button
        this.link = this.createEl("a", "", "Download image", "");
        downImg = this.createEl("img", "download.png", "", "download");
        this.link.appendChild(downImg);

        if(settings.shadows) {
            var buttBox = this.createEl("div", "", "", "butt_box");
            buttBox.appendChild(this.cross);
            buttBox.appendChild(this.link);
            this.grandParent.appendChild(buttBox);
        }
        else {
            this.grandParent.appendChild(this.cross);
            this.grandParent.appendChild(this.link);
        }
    }

    /**
     * Creates "div" box with information about current photo (caption and number)
     * @note Grandparent element must be created first
     */
    this.createInfo = function() {
        var info = this.createEl("div", "", "", "info");
        this.grandParent.appendChild(info); 

        if(this.settings.captions) {
            this.caption = this.createEl("div", "", "", "caption");
            info.appendChild(this.caption);
        }

        if(this.settings.numbering) {
            this.number = this.createEl("div", "", "Current/Total", "numbering");
            info.appendChild(this.number);
        }
    }

    /**
     * Creates all necessary elements for loader
     * @note Grandparent element and main photo element must be created first
     */
    this.createLoader = function() {
        this.loader = this.createEl("div", "", "Loading...", "lb_loader");
        this.grandParent.appendChild(this.loader);

        this.photo.addEventListener("load", () => {this.hideLoader(50);});

        //Just dummy obj. to eliminate bug, when non-existing photo is  still loading and loading
        var empty = new Image(); 
        empty.src = "images/back.png";
        this.updateImage(empty);
        this.photo.addEventListener("error", () => {this.hideLoader(50);}); //<= err handling func.

        var nOfLoaderParts = 3;

        for(var i = 0; i < nOfLoaderParts; i++) {
            var newPart = this.createEl("div", "", "", "p" + i);
            newPart.className = "part";
            newPart.style.animationDelay = i*2 + "s";
            this.loader.appendChild(newPart);
        }

        var titleCont = this.createEl("div", "", "", "title_cont");
        titleCont.innerHTML = "Loading...";
        this.loader.appendChild(titleCont);
    }

    /**
     * Shows loader hides photo (inverse to hide loader)
     * @time time it takes for the state to change
     */
    this.showLoader = function(time = 0) {
        $(this.loader).fadeIn(time);
        $(this.photo).fadeOut(time);
    }

    /**
     * Shows photo hides loader (inverse to hide loader)
     * @time time it takes for the state to change
     */
     this.hideLoader = function(time = 0) {
        $(this.photo).fadeIn(time);
        $(this.loader).fadeOut(time);
    }

    /**
     * Creates HTML element
     * @param {*} type html tag, used for element
     * @param {*} bg background image (can be empty)
     * @param {*} title title text, showed when user hover cursor over the element
     * @param {*} id string used for identification of new element
     * @returns object with created element
     */
    this.createEl = function(type, bg, title, id) {
        var newEl = document.createElement(type);

        if(bg != "") {
            newEl.src = this.settings.imagesDir + bg;
        }

        if(id != "") {
            newEl.id = id;
        }

        if(title != "") {
            newEl.title = title;
        }
        
        return newEl;
    }

    /**
     * Updates HTML structure to current photo and (hides arrows, if photo is last/first and loop is disabled)
     * @param {*} imageObject object of image from page that should be showed
     * @param {*} curImIndex index of current photo in galery (important for numbering)
     * @param {*} totalImNumber total number of photos in current galery (important for numbering)
     */
    this.update = function(imageObject, curImIndex, totalImNumber) {
        this.updateArrows(curImIndex, totalImNumber);
        this.updateImage(imageObject);
        this.updateCaption(imageObject);
        this.updateNumber(curImIndex, totalImNumber);
    }

    /**
     * Updates arrows visibility
     * @param {*} curImIndex index of current photo in galery (important for numbering)
     * @param {*} totalImNumber total number of photos in current galery (important for numbering)
     */
    this.updateArrows = function(curImIndex, totalImNumber) {
        if(totalImNumber > 1) {
            if(!this.settings.loop) {
                if(curImIndex == 0) { //current photo is first
                    this.setArrowsVisibility(false, true, 30);
                }
                else if(curImIndex == totalImNumber - 1) { //current photo is last
                    this.setArrowsVisibility(true, false, 30);
                }
                else {
                    this.setArrowsVisibility(true, true);
                }
            }
            else {
                this.setArrowsVisibility(true, true);
            }
        }
        else {
            this.setArrowsVisibility(false, false);
        }
    }

    /**
     * Updates main image element with corresponding photo
     * @param {*} imageObject image that will be showed lightbox (or its original version)
     */
    this.updateImage = function(imageObject) {

        this.showLoader();

        var newImSrc = imageObject.src;
        var origImSrc;

        if((origImSrc = this.findOriginalImage(imageObject)) !== null) {
            newImSrc = origImSrc;
        }

        this.photo.src = newImSrc;
        this.link.href = newImSrc;
        this.link.download = getFilenameFromPath(newImSrc); 
    }


    /**
     * Find path to image with original quality (if it is possible)
     * @param {*} imageObject thumbnail image object, that contains necessary attributes ("data-orig")
     * @returns null if path cannot be found or path to original image
     * @note there is possible to end "data-orig" content with * or /,
     * in this case is used name of thumbnail for original image and rest of path from "data-orig"
     */
    this.findOriginalImage = function(imageObject) {
        var pathToOrig = imageObject.getAttribute("data-orig");

        if(pathToOrig !== null) {
            var pathTail = getFilenameFromPath(pathToOrig);

            if(pathTail == "*" || pathTail == "") {
                var origDirectory = pathToOrig.substr(0, pathToOrig.length - 1);

                return origDirectory + getFilenameFromPath(imageObject.src);
            }
            else {
                return pathToOrig;
            }
        }

        return null;
    }

    /**
     * Updates caption in lightbox
     * @param {*} imageObject object contains viewed image
     */
    this.updateCaption = function(imageObject) {
        if(this.caption !== null) {
            var captionContent = imageObject.getAttribute("data-caption");

            if(captionContent !== null) {
                this.caption.innerHTML = captionContent;
            }
            else {
                this.caption.innerHTML = "";
            }
        }
    }

    /**
     * Updates numbering in left corner
     * @param {*} curImIndex index of current photo in galery object
     * @param {*} totalImNumber total number of photos in galery
     */
    this.updateNumber = function(curImIndex, totalImNumber) {
        if(this.number !== null) {
            if(totalImNumber > 1) {
                var orderNumOfIm = curImIndex + 1;

                this.number.innerHTML = orderNumOfIm + "/" + totalImNumber;
            }
            else {
                this.number.innerHTML = "";
            }
        }
    }

    /**
     * crops path to filename with extension
     * @param {*} path, string that represents whole path to file
     * @returns cropped path
     */
    function getFilenameFromPath(path) {
        return path.substr(path.lastIndexOf("/") + 1);
    }

    /**
     * Shows window with lb and initializes it with photo given in argument
     */
    this.showFrame = function() {
        $("body").css("overflow", "hidden");
        $(this.grandParent).fadeIn();

        if(this.settings.blurFlag) {
            $("body").css("filter", "blur(5px)");
        }
    }

    /**
     * Hides window with lb
     */
    this.hideFrame = function() {
        $(this.grandParent).fadeOut(() => {
            $("body").css("overflow", "auto");
        }); 

        if(this.settings.blurFlag) {
            $("body").css("filter", "none");
        }
    }

    /**
     * Sets visibility of buttons used for switching to next and previous photo
     * @param {*} prevIsVisible if is true, left arrow will be visible 
     * @param {*} nextIsVisible if is true, right arrow will be visible
     * @param {*} time time of state changing (fadeOut and fadeIn are used for chaging visibility)
     */
    this.setArrowsVisibility = function(prevIsVisible = true, nextIsVisible = true, time = 0) {
        if(prevIsVisible) {
            $(this.prev).fadeIn(time);
        }
        else {
            $(this.prev).fadeOut(time);
        }

        if(nextIsVisible) {
            $(this.next).fadeIn(time);
        }
        else {
            $(this.next).fadeOut(time);
        }
    } 

    /**
     * Makes short effect of clicking to button
     * @param {*} buttonObj button that should be lighten
     */
    this.lightenButton = function(buttonObj) {
        var threshForExecution = 0.55;

        var isVisible = $(buttonObj).css("display") != "none";
        isVisible = isVisible && $(buttonObj).css("visibility") != "hidden";

        if(isVisible) {
            if($(buttonObj).css("opacity") < threshForExecution)  {
                $(buttonObj).fadeTo(10, 1).delay(100).fadeTo(10, 0.25);
            }
        }
    }
}

/**
 * Creates array of galeries for "main" lb object
 */
function GaleriesCreator() {

    /**
     * Assembles photos to galeries (represented by Galery objects) and makes array from them
     * @param {*} mainClassName class name that identifies lightboxed images
     * @returns array of galeries
     */
    this.getGals = function(mainClassName) {
        var imgs = [];
        var currentGalery = null, selected, currentClassName, lastClassName;

        selected = selectLbImages(mainClassName);

        currentClassName = null, lastClassName = null;
        for(let i = 0; selected[i] != null; i++) {
            
            currentClassName = getFirstSubclassName(selected[i], mainClassName);
            if(i == 0 || currentClassName != lastClassName) {
                if(i != 0) {
                    //if galery is changing push it into result array
                    imgs.push(currentGalery);
                }

                //change galery, if name is changing
                currentGalery = new Galery(currentClassName, selected[i]);
            }
            else {
                currentGalery.addImg(selected[i]);
            }

            lastClassName = currentClassName;
        }

        if(currentGalery != null) {
            imgs.push(currentGalery);
        }
        
        return imgs;
    }

    /**
     * Selected all images with proper class name on loaded page
     * @param {*} mainClassName class name that identifies lightboxed images
     * @returns array of images
     */
    function selectLbImages(mainClassName) {
        return document.getElementsByClassName(mainClassName);
    }

    /**
     * Return first subclass name of element
     * @param {*} element element object
     * @param {*} mainClassName name of main class, that identifies lightboxed images
     * @returns 
     */
    function getFirstSubclassName(element, mainClassName) {
        var wholeClassName, mainClassEndWithGap, subclassStart, nextGapIndex;
        var result = null;

        wholeClassName = element.className;
        mainClassEndWithGap = wholeClassName.indexOf(mainClassName + " ", 0);
    
        if(mainClassEndWithGap != -1) {
            subclassStart = mainClassEndWithGap + mainClassName.length + 1;
            nextGapIndex = wholeClassName.indexOf(" ", subclassStart);
    
            if(nextGapIndex > 0) {
                result = wholeClassName.substring(subclassStart, nextGapIndex);
            }
            else {
                result = wholeClassName.substring(subclassStart, wholeClassName.length);
            }
            
        }
    
        return result;
    }
}

/**
 * "Main" object, which holds the current position and changes it
 * @param {*} arrOfGaleries array of galeries that should be showed in lightbox
 */
function Lightbox(arrOfGaleries) {
    this.galeries = arrOfGaleries;
    this.curIm = 0;
    this.curGal = 0;
    this.frame = null;
    this.keyboardBlocked = false;

    /**
     * Binds corresponding HTML structure to this object and sets src of main photo to first image
     * @param {*} HTMLStruct created HTML structure
     */
    this.bindFrame = function(HTMLStruct) {
        this.frame = HTMLStruct;

        this.frame.next.addEventListener("click", () => {this.next();});
        this.frame.prev.addEventListener("click", () => {this.prev();});
        this.frame.cross.addEventListener("click", () => {this.frame.hideFrame();});
        
        this.frame.grandParent.addEventListener("click", (target) => {this.lbClose(target);});
    }

    this.retCurGalLength = function() {
        return this.galeries[this.curGal].imgs.length;
    }

    /**
     * Loads next photo in current galery (when it is last photo go to start)
     */
    this.next = function() {
        var curGalLength = this.retCurGalLength();

        var isLastPhoto = (this.curIm == curGalLength - 1);
        if(!this.frame.settings.loop && isLastPhoto) {
            return;
        }
        else {
            this.curIm++;

            if (this.curIm > (curGalLength - 1)) {
                this.curIm = 0;
            }

            this.preload();

            this.frame.update(this.getCurrentIm(), this.curIm, curGalLength);
        }
    }

    /**
     * Loads previous photo in current galery
     */
    this.prev = function() {
        var curGalLength = this.retCurGalLength();

        var isFirstPhoto = (this.curIm == 0);
        if(!this.frame.settings.loop && isFirstPhoto) {
            return;
        }
        else {
            this.curIm--;

            if (this.curIm < 0) {
                this.curIm = curGalLength - 1;
            }

            this.preload();

            this.frame.update(this.getCurrentIm(), this.curIm, curGalLength);
        }
    }

    /**
     * His window with lb when user clicks somewhere out of photo and buttons
     * @param {*} click event object
     */
    this.lbClose = function(click) {
        var clickedEl = click.target, lbFrame = this.frame;
        
        var elements = [];
        while(clickedEl !== null) {
            elements.push(clickedEl);
            clickedEl = clickedEl.parentElement;
        }
        
        var exceptions = [lbFrame.photo, lbFrame.next, 
                        lbFrame.prev, lbFrame.link, 
                        lbFrame.caption, lbFrame.number];

        //react on everything except of buttons
        for(let i = 0; exceptions[i] != null; i++) {
            if(elements.includes(exceptions[i])) {
                return;
            }
        }

        lbFrame.hideFrame();
    }

    /**
     * Adds click event listener in proper form (with a specific arguments)
     */
    this.addOnClick =  function() {
        for(let i = 0; this.galeries[i] != null; i++) {
            for(let u = 0; this.galeries[i].imgs[u] != null; u++) {
                eval("this.galeries[i].imgs[u].addEventListener(\"click\", () => { \
                        this.showAt( + " + i + ", " + u + "); \
                    });");
            }
        }
    }

    /**
     * Sets current photo to chosen one (can be in any galery) and then show lightbox
     * @param {*} gal index of new position in galery array
     * @param {*} im index of new position in current galery
     */
    this.showAt = function(gal = 0, im = 0) {
        this.set(gal, im);

        this.frame.showFrame();
    }

    /**
     * Sets position in presentation to given values
     * @param {*} gal index of new position in galery array
     * @param {*} im index of new position in current galery
     */
    this.set = function(gal = 0, im = 0) {
        this.curGal = gal;
        this.curIm = im;

        this.preload();

        this.frame.update(this.getCurrentIm(), this.curIm, this.retCurGalLength());
    }

    /**
     * Preloads source image of next and previous images
     */
    this.preload = function() {
        var nextIm, prevIm;

        nextIm = new Image();
        prevIm = new Image();

        nextIm.src = this.frame.findOriginalImage(this.getCurImNeighbour(1));
        prevIm.src = this.frame.findOriginalImage(this.getCurImNeighbour(-1));
    }

    /**
     * @param diff differencce between cur. index and wanted image (can't be positive or negative)
     * @return image object of image in cur galery on index curIm + diff
     */
    this.getCurImNeighbour = function(diff) {
        var curGalLen = this.retCurGalLength(), resIndex;
        diff = diff % curGalLen;;

        if(this.curIm + diff >= curGalLen) {
            resIndex = (this.curIm + diff) % curGalLen;
        }
        else if (this.curIm + diff < 0) {
            resIndex = curGalLen - Math.abs(this.curIm + diff);
        }
        else {
            resIndex = this.curIm + diff;
        }

        return this.galeries[this.curGal].imgs[resIndex];
    }

    /**
     * @returns current object of image
     */
    this.getCurrentIm = function() {
        return this.galeries[this.curGal].imgs[this.curIm];
    }

    /**
     * Adds corresponding event
     */
    this.bindKeys = function() {

        $(document).keydown((keyPressed) => {
            this.keyHandler(keyPressed); 
        });
    }

    /**
     * Solves pressed key
     */ 
    this.keyHandler = function(key) {
        lbIsVisible = this.frame.grandParent.style.display != "none";

        if(lbIsVisible && !this.keyboardBlocked) {
            this.keyboardBlocked = true;
            setTimeout(() => {this.keyboardBlocked = false;}, 50);

            switch(key.code || key.which) {
                case "ArrowLeft":
                    this.frame.lightenButton(this.frame.prev);
                    this.prev();
                    break;
                case "ArrowRight":
                    this.frame.lightenButton(this.frame.next);
                    this.next();
                    break;
                case "Escape":
                    this.frame.lightenButton(this.frame.cross);
                    this.frame.hideFrame();
                    break;
            }
        }
    }
}


/***                                     End of lbscript.js                                    ***/

