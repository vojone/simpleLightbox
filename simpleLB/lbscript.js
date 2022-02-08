/** ***********************************************************************************************
 *                                            lbscript.js                    
 *                                                                   
 *                   Purpose: File contains implementation of Simple lightbox galery   
 *                                                      
 *                      Note: I will be glad for improvements and fixed bugs
 *                            This long file is little bit unclear (it will be probably better
 *                            to divide it into object prototypes and "main" part, but in this
 *                            case it is more complicated for non-power user to add simpleLB 
 *                            to his webpage)
 * 
 *********************************************************************************************** */

 $(document).ready(() => {
    lbHTML = new LbHTMLStructure(settings);
    lbHTML.prepare();

    galCreator = new GaleriesCreator();
    lightbox = new Lightbox(galCreator.getGals("lb"), lbHTML);

    controls = new Controls(settings, lbHTML, lightbox);
    controls.addButtonEvents();

    if(settings.keyboardEnable) {
        controls.bindKeys();
    }

    if(settings.cTransByMouse) {
        controls.bindMouse();
    }

    lightbox.preloadSpecific();
});


/**
 * Prototype for galery object that is shown in one coherent view (user needn't to leave lightbox)
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
    this.transformer = null;

    this.grandParent = null;
    this.photo = null;
    this.link = null;

    this.next = null;
    this.prev = null;
    this.cross = null;
    this.menu = null;

    this.caption = null;
    this.number = null;
    this.loader = null;

    /**
     * Prepares HTML structure for lightbox
     */
    this.prepare = function() {
        //prepare lb window in background
        this.grandParent = this.createEl("div", "", "", "lb_cont");
        this.grandParent.style.backgroundColor = "rgba(0, 0, 0, " + this.settings.bgAlpha + ")"; 
        this.grandParent.style.display = "none"; //lb is not shown when page is loaded

        document.getElementsByTagName("html")[0].appendChild(this.grandParent);

        this.createPhoto();

        this.transformer = new PhotoTransformer(this.photo);

        this.createButtons();
        this.createInfo();
        this.createLoader();

    }

    /**
     * Creates main element, which shows photo to user
     * @note needs grandparent element to be created first
     */
    this.createPhoto = function() {
        this.photo = this.createEl("img", "", "Foto", "main_photo");
        this.photo.loading = "lazy";
        this.photo.alt = "Něco se pokazilo...\
                          Zkuste zkontrolovat název fotografie a zda daná fotografie existuje...";

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
     * Creates button to control lightbox
     * @note Grandparent element must be created first
     */
    this.createButtons = function() {
        this.createArrows();

        //close button 
        this.cross = this.createEl("img", "close.png", "Zavřít galerii (Esc)", "cross");

        //downloading button
        this.link = this.createEl("a", "", "Stáhnout obrázek", "");
        this.link.downImg = this.createEl("img", "download.png", "", "download");
        this.link.appendChild(this.link.downImg);

        //Menu
        this.createMenu();

        let buttBox = this.createEl("div", "", "", "butt_box");
        if(this.settings.shadows) {
            $(buttBox).addClass("shadow");    
        }

        buttBox.appendChild(this.cross);
        buttBox.appendChild(this.link);
        if($(this.menu.menuUl).children().length > 0) { //Add menu, if is not empty
            buttBox.appendChild(this.menu);
        }

        this.grandParent.appendChild(buttBox);
        
    }

    /**
     * Creates menu with advance functions
     */
     this.createMenu = function() {
        this.menu = this.createEl("div", "menu.png", "Menu", "menu");
        this.menu.menuIconCont = this.createEl("div", "", "", "ico_cont");
        let menuIcon = this.createEl("img", "menu.png", "Menu", "menu_icon");
        this.menu.menuIconCont.appendChild(menuIcon);
        this.menu.appendChild(this.menu.menuIconCont);

        this.menu.menuUl = this.createEl("ul", "", "", "");

        if(this.settings.transformations) {
            this.menu.reset = this.createEl("li", "", "Obnovit", "");
            this.menu.reset.resetV = this.createEl("div", "", "", "res_view");
            this.menu.reset.resetV.innerHTML = "Obnovit"
            this.menu.reset.appendChild(this.menu.reset.resetV);

            this.menu.zoom = this.createEl("li", "", "Zoom", "");
            this.menu.zoom.zoomIn = this.createEl("div", "", "Přiblížit (+)", "in");
            setBgImage(this.menu.zoom.zoomIn, "zoomin.png");
            this.menu.zoom.zoomOut = this.createEl("div", "", "Oddálit (-)", "out");
            setBgImage(this.menu.zoom.zoomOut, "zoomout.png");
            this.menu.zoom.appendChild(this.menu.zoom.zoomIn);
            this.menu.zoom.appendChild(this.menu.zoom.zoomOut);

            this.menu.rotation = this.createEl("li", "", "Rotate", "");
            this.menu.rotation.rotLeft = this.createEl("div", "", "Rotace doprava (R)", "left");
            setBgImage(this.menu.rotation.rotLeft, "rotate.png");
            this.menu.rotation.rotRight = this.createEl("div", "", "Rotace doleva (L)", "right");
            setBgImage(this.menu.rotation.rotRight, "rotate.png");
            this.menu.rotation.appendChild(this.menu.rotation.rotLeft);
            this.menu.rotation.appendChild(this.menu.rotation.rotRight);

            this.menu.menuUl.appendChild(this.menu.reset);
            this.menu.menuUl.appendChild(this.menu.zoom);
            this.menu.menuUl.appendChild(this.menu.rotation);
            this.menu.appendChild(this.menu.menuUl);
        }

        if(this.settings.presentation) {
            this.menu.pres = this.createEl("li", "", "Nastavení prezentace", "");
            this.menu.pres.int = this.createEl("input" , "", "Čas na snímek (in ms)", "");
            this.menu.pres.int.name = "interval"
            this.menu.pres.int.value = this.settings.defPresentationInterval;
            this.menu.pres.int.size = "1";
            this.menu.pres.int.maxLength = "5";
            this.menu.pres.appendChild(this.menu.pres.int);


            this.menu.pres.play = this.createEl("div", "", "Spustit (Mezerník)", "run");
            setBgImage(this.menu.pres.play, "play.png");
            this.menu.pres.appendChild(this.menu.pres.play);

            this.menu.menuUl.appendChild(this.menu.pres);
        }
    }

    /**
     * Sets background image of element to "imageName"
     * @param {*} object 
     * @param {*} imageName 
     */
    function setBgImage(object, imageName) {
        $(object).css("background-image", "url('" + settings.imagesDir + imageName + "')");
    }

    /**
     * Opens menu with advanced functions
     */
    this.openMenu = function() {
        $(this.menu).addClass("active");

        if(this.settings.shadows)  {
            let buttBox = $(this.menu).parents("div").first();
            buttBox.addClass("active");
        }

        $(this.menu.menuUl).slideDown("fast");
    }

    /**
     * Closes menu with advanced functions
     */
    this.closeMenu = function() {
        $(this.menu.menuUl).slideUp("medium", () => {
            if(this.settings.shadows)  {
                let buttBox = $(this.menu).parents("div").first();
                buttBox.removeClass("active");
            }

            $(this.menu).removeClass("active");
        });
    }

    /**
     * Sets bg image of play button to play/stop icon
     * @param {*} setToPlay if its true, play icon is showed
     */
    this.setPlayButton = function(setToPlay) {
        if(setToPlay) {
            setBgImage(this.menu.pres.play, "play.png");
        }
        else {
            setBgImage(this.menu.pres.play, "pause.png");
        }
    }


    /**
     * Creates arrows to change shown photo
     */
    this.createArrows = function() {
        //next photo button
        let nextBox = this.createEl("div", "", "", "next_box");
        this.next = this.createEl("img", "next.png", "Další obrázek", "next");
        nextBox.appendChild(this.next);
        this.grandParent.appendChild(nextBox);

        //previous photo button
        let prevBox = this.createEl("div", "", "", "prev_box");
        this.prev = this.createEl("img", "next.png", "Předchozí obrázek", "prev");
        prevBox.appendChild(this.prev);
        this.grandParent.appendChild(prevBox);

        if(this.settings.shadows) {
            $(nextBox).addClass("shadow");
            $(prevBox).addClass("shadow");
        }
    }

    /**
     * Creates "div" box with information about current photo (caption and number)
     * @note Grandparent element must be created first
     */
    this.createInfo = function() {
        let info = this.createEl("div", "", "", "info");
        this.grandParent.appendChild(info); 

        if(this.settings.captions) {
            this.caption = this.createEl("div", "", "", "caption");
            info.appendChild(this.caption);
        }

        if(this.settings.numbering) {
            this.number = this.createEl("div", "", "Aktuálně/Celkově", "numbering");
            info.appendChild(this.number);
        }
    }

    /**
     * Creates all necessary elements for loader
     * @note Grandparent element and main photo element must be created first
     */
    this.createLoader = function() {
        this.loader = this.createEl("div", "", "Načítání...", "lb_loader");
        this.grandParent.appendChild(this.loader);

        this.photo.addEventListener("load", () => {this.hideLoader(50);});

        //Just dummy obj. to eliminate bug, when non-existing photo is  still loading and loading
        let empty = new Image(); 
        empty.src = this.settings.imagesDir + "next.png";
        this.updateImage(empty);
        this.photo.addEventListener("error", () => {this.hideLoader(50);}); //<= err handling func.

        let nOfLoaderParts = 3;

        for(let i = 0; i < nOfLoaderParts; i++) {
            let newPart = this.createEl("div", "", "", "p" + i);
            newPart.className = "part";
            newPart.style.animationDelay = i*2 + "s";
            this.loader.appendChild(newPart);
        }

        let titleCont = this.createEl("div", "", "", "title_cont");
        titleCont.innerHTML = "Načítání...";
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
     * @param {*} title title text, shown when user hover cursor over the element
     * @param {*} id string used for identification of new element
     * @returns object with created element
     */
    this.createEl = function(type, bg, title, id) {
        let newEl = document.createElement(type);

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
     * @param {*} imageObject object of image from page that should be shown
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
     * @param {*} imageObject image that will be shown lightbox (or its original version)
     */
    this.updateImage = function(imageObject) {

        this.showLoader();
        this.transformer.transformToDefault();
        let newImSrc = imageObject.src;
        let origImSrc;

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
        let pathToOrig = imageObject.getAttribute("data-orig");

        if(pathToOrig !== null) {
            let pathTail = getFilenameFromPath(pathToOrig);

            if(pathTail == "*" || pathTail == "") {
                let origDirectory = pathToOrig.substr(0, pathToOrig.length - 1);

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
            let captionContent = imageObject.getAttribute("data-caption");

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
                let orderNumOfIm = curImIndex + 1;

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
        let threshForExecution = 0.55;

        let isVisible = $(buttonObj).css("display") != "none";
        isVisible = isVisible && $(buttonObj).css("visibility") != "hidden";

        if(isVisible) {
            if($(buttonObj).css("opacity") < threshForExecution)  {
                $(buttonObj).fadeTo(10, 1).delay(100).fadeTo(10, 0.25);
            }
        }
    }
}

/**
 * Transforms photo
 * @param {*} photo object of photo that will be target for all transformations
 */
function PhotoTransformer(photo) {
    this.targetPhoto = photo;
    this.defScale = 1;
    this.defPos = [50, 50]; //in %
    this.defRotation = 0; //deg

    this.curPos = [this.defPos[0], this.defPos[1]];
    this.curAngle = this.defRotation;
    this.curScale = this.defScale;

    /**
     * Puts photo to new position x, y 
     * @param {*} x new x position of photo on the screen (in percents of parent elements width)
     * @param {*} y new y position of photo on the screen (in percents of parent elements height)
     */
    this.translate = function(x = this.defPos[0], y = this.defPos[1]) {
        $(this.targetPhoto).css("top", y + "%");
        $(this.targetPhoto).css("left", x + "%");

        this.curPos[0] = x;
        this.curPos[1] = y;
    }

    /**
     * Sets scale (zoom) of image to scaleF from argument
     * @param {*} scaleF scale factor
     * @note scale factor is cropped to interval <0.1, 10>
     */
    this.scale = function(scaleF = this.defScale) {
        let rotation = "rotate(" + this.curAngle + "deg)";

        let maxScale = 10, minScale = 0.1;
        let croppedScaleF = Math.min(Math.max(scaleF, minScale), maxScale);

        let transformation = "translate(-50%, -50%) " + rotation + " scale(" + croppedScaleF + ")";
        this.curScale = croppedScaleF;

        this.centerSmallImage();

        $(this.targetPhoto).css("transform", transformation);
    }

    /**
     * Sets rotation of image to angle from argument
     * @param {*} angle angle of rotation
     */
     this.rotate = function(angle = this.defRotation) {
        let scaling = "scale(" + this.curScale + ")";
    
        let newAngle = angle % 360;

        let transformation = "translate(-50%, -50%) rotate(" + newAngle + "deg) " + scaling;
        this.curAngle = newAngle;

        $(this.targetPhoto).css("transform", transformation);
    }

    /**
     * Puts main photo to the center of the screen (if pohoto is smaller than screen)
     */
     this.centerSmallImage = function() {
        let rect = this.targetPhoto.getBoundingClientRect();
        
        if(rect.height < window.innerHeight && rect.width < window.innerWidth) {
            this.translate();
        }
    }

    /**
     * Remove transform property from style attribute of main photo element
     */
     this.transformToDefault = function() {
        this.rotate();
        this.scale();
        this.translate();
        $(this.photo).css("transform", "");
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
        let imgs = [];
        let currentGalery = null, selected, currentClassName, lastClassName;

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
        let wholeClassName, mainClassEndWithGap, subclassStart, nextGapIndex;
        let result = null;

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
 * @param {*} arrOfGaleries array of galeries that should be shown in lightbox
 * @param {*} HTMLStruct specific hierarchy of elements that will show the galeries on webpage
 */
function Lightbox(arrOfGaleries, HTMLStruct) {
    this.galeries = arrOfGaleries;
    this.curIm = 0;
    this.curGal = 0;
    this.frame = HTMLStruct;
    this.presentationInterval = null;

    this.retCurGalLength = function() {
        return this.galeries[this.curGal].imgs.length;
    }

    /**
     * Loads next photo in current galery (when it is last photo go to start)
     */
    this.next = function() {
        let curGalLength = this.retCurGalLength();

        let isLastPhoto = (this.curIm == curGalLength - 1);
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
        let curGalLength = this.retCurGalLength();

        let isFirstPhoto = (this.curIm == 0);
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
     * Sets current photo to chosen one (can be in any galery) and then show lightbox
     * @param {*} gal index of new position in galery array
     * @param {*} im index of new position in current galery
     */
    this.showAt = function(gal = 0, im = 0) {
        this.set(gal, im);

        this.frame.showFrame();
    }

    /**
     * Sets position in view to given values
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
        let nextIm, prevIm;

        nextIm = new Image();
        prevIm = new Image();

        nextIm.src = this.frame.findOriginalImage(this.getCurImNeighbour(1));
        prevIm.src = this.frame.findOriginalImage(this.getCurImNeighbour(-1));
    }

    /**
     * Preloads specific image shown in LB galery
     */
     this.preloadSpecific = function(gal = 0, im = 0) {
        let curIm = new Image();
    
        if(gal >= this.galeries.length || im >= this.galeries[gal].imgs.length) {
            return false;
        }
        else {
            curIm = this.galeries[gal].imgs[im];

            return true;
        }
    }

    /**
     * @param diff differencce between cur. index and wanted image (can't be positive or negative)
     * @return image object of image in cur galery on index curIm + diff
     */
    this.getCurImNeighbour = function(diff) {
        let curGalLen = this.retCurGalLength(), resIndex;
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
     * Resets presentation in lightbox
     */
    this.reset = function() {
        if(this.presentationInterval != null) {
            clearInterval(this.presentationInterval);
            this.run();
        }
    }

    /**
     * Stops presentation
     */
    this.stop = function() {
        clearInterval(this.presentationInterval);
        this.presentationInterval = null;

        this.frame.setPlayButton(true);
        $(this.frame.link).show();
        this.frame.cross.src = this.frame.settings.imagesDir + "close.png";
        this.frame.cross.title = "Zavřít galerii (Esc)";
        this.frame.menu.pres.play.title = "Spustit (Mezerník)";
        this.frame.updateArrows(this.curIm, this.galeries[this.curGal].imgs.length);
    }

    /**
     * Runs automatic presentation of photos shown in lightbox
     * @param {*} interval time for which is one photo shown
     */
    this.run = function(interval = this.frame.menu.pres.int.value) {
        this.presentationInterval = setInterval(() => {
            let isLastPhoto = this.curIm == (this.galeries[this.curGal].imgs.length - 1);
            if(isLastPhoto && !this.frame.settings.loop) {
                this.stop();
                return;
            }

            this.next();
            this.frame.setArrowsVisibility(false, false); //Photo udate updates also arrows
        }, interval);
        
        this.frame.setPlayButton(false);
        $(this.frame.link).hide();
        this.frame.closeMenu();
        this.frame.cross.src = this.frame.settings.imagesDir + "pause.png";
        this.frame.cross.title = "Zastavit prezentaci (Mezerník)";
        this.frame.menu.pres.play.title = "Zastavit prezentaci (Mezerník)";
        this.frame.setArrowsVisibility(false, false);
    }
}

/**
 * Adds all necessary events to control lightbox by mouse and keyboard
 * @param {*} settings settings object with configuration
 * @param {*} frame HTML structure to be controled
 * @param {*} lightbox lightbox object to be controled
 */
function Controls(settings, frame, lightbox) {
    this.settings = settings;
    this.frame = frame;
    this.lb = lightbox;

    this.keyboardBlocked = false;
    this.ctrlPressed = false;
    this.transStart = [this.frame.transformer.curPos[0], this.frame.transformer.curPos[1]];
    this.lastTouchPosition = [];
    this.moveActivated = false;

    this.rotStep = 90;
    this.basicZoomStep = 0.2;

    /**
     * Zooms main photo
     * @param {*} zoomf How much will be tho photo zoomed (+ will zoom in, - will zoom out hte photo)
     * @param {*} sensitivity How much should be zoom sensitive
     */
     this.zoomPhoto = function(zoomf, sensitivity = 1) {
        this.frame.transformer.scale(this.frame.transformer.curScale + zoomf*sensitivity);
    }

    /**
     * Rotates main photo
     * @param {*} about Angle by which it will be rotated (+ means CCW)
     */
    this.rotatePhoto = function(about) {
        this.frame.transformer.rotate(this.frame.transformer.curAngle + about);
    }

    /**
     * Adds click event listener to buttons  in proper form (with a specific arguments)
     */
     this.addButtonEvents =  function() {
        this.frame.next.addEventListener("click", () => {this.lb.next();});
        this.frame.prev.addEventListener("click", () => {this.lb.prev();});
        this.frame.cross.addEventListener("click", () => {
            if(this.lb.presentationInterval) {
                this.lb.stop();
            }
            else {
                this.frame.hideFrame();
            }
        });

        if(this.settings.transformations) {
            this.frame.menu.reset.addEventListener("click", () => {
                this.frame.transformer.transformToDefault();
            });

            this.frame.menu.zoom.zoomIn.addEventListener("click", () => {
                this.zoomPhoto(this.basicZoomStep);
            });
            this.frame.menu.zoom.zoomOut.addEventListener("click", () => {
                this.zoomPhoto(-this.basicZoomStep);
            });

            this.frame.menu.rotation.rotRight.addEventListener("click", () => {
                this.rotatePhoto(this.rotStep);
            });
            this.frame.menu.rotation.rotLeft.addEventListener("click", () => {
                this.rotatePhoto(-this.rotStep);
            });
        }

        if(this.settings.presentation) {
            this.frame.menu.pres.play.addEventListener("click", () => {
                if(this.lb.presentationInterval == null) {
                    this.lb.run();
                }
                else {
                    this.lb.stop();
                }
            });
        }

        //Toggle menu visibility
        this.frame.menu.menuIconCont.addEventListener("click", () => {
            let isClosed = !this.frame.menu.className.includes("active");
            if(isClosed) {
                this.frame.openMenu();
            }
            else {
                this.frame.closeMenu();
            }
        });
        
        this.frame.grandParent.addEventListener("click", (e) => {
            if(this.frame.menu.className.includes("active")) {
                this.menuClose(e.target);
            }
            else {
                if(this.lb.presentationInterval) {
                    this.lb.stop();
                }
                else {
                    this.lbClose(e.target);
                }
            }
        });

        for(let i = 0; this.lb.galeries[i] != null; i++) {
            for(let u = 0; this.lb.galeries[i].imgs[u] != null; u++) {
                eval("this.lb.galeries[i].imgs[u].addEventListener(\"click\", () => { \
                        this.lb.showAt( + " + i + ", " + u + "); \
                    });");
            }
        }
    }

    /**
     * Hides window with lb when user clicks somewhere out of photo and buttons
     * @param {*} clickTarget object that was clicked by user
     */
     this.lbClose = function(clickTarget) {
        let clickedEl = clickTarget, lbFrame = this.frame;
        
        let elements = [];
        while(clickedEl !== null) {
            elements.push(clickedEl);
            clickedEl = clickedEl.parentElement;
        }
        
        let exceptions = [lbFrame.photo, lbFrame.next, 
                          lbFrame.prev, lbFrame.link, 
                          lbFrame.caption, lbFrame.number, lbFrame.menu];

        //react on everything except of buttons
        for(let i = 0; exceptions[i] != null; i++) {
            if(elements.includes(exceptions[i])) {
                return;
            }
        }
        

        this.frame.hideFrame();
    }

    /**
     * Hides menu when user clicks somewhere out of photo and buttons
     * @param {*} clickTarget object that was clicked by user
     */
     this.menuClose = function(clickTarget) {
        let clickedEl = clickTarget, lbFrame = this.frame;
        
        let elements = [];
        while(clickedEl !== null) {
            elements.push(clickedEl);
            clickedEl = clickedEl.parentElement;
        }
        
        let exceptions = [lbFrame.photo, lbFrame.next, 
                          lbFrame.prev, lbFrame.link, 
                          lbFrame.caption, lbFrame.number, lbFrame.menu];

        //react on everything except of buttons
        for(let i = 0; exceptions[i] != null; i++) {
            if(elements.includes(exceptions[i])) {
                return;
            }
        }
        

        lbFrame.closeMenu();
    }

    /**
     * Adds corresponding event
     */
     this.bindKeys = function() {
        $(document).keyup((keyPressed) => {
            this.keyboardBlocked = false;
            
            if(keyPressed.code == "ControlRight" || keyPressed.code == "ControlLeft") {
                this.ctrlPressed = false;
            }
        });

        $(document).keydown((keyPressed) => {
            if(keyPressed.code == "ControlRight" || keyPressed.code == "ControlLeft") {
                this.ctrlPressed = true;
            }

            this.keyHandler(keyPressed); 
        });
    }

    /**
     * Solves pressed key
     */ 
     this.keyHandler = function(key) {
        if(this.ctrlPressed) {
            return;
        }

        let lbIsVisible = $(this.frame.grandParent).css("display") != "none";
        if(lbIsVisible && !this.keyboardBlocked) {
            this.keyboardBlocked = true;
            setTimeout(() => {this.keyboardBlocked = false;}, 50);
        }

        this.basicKeys(key);
        if(this.settings.transformations) {
            this.transformKeys(key);
        }
    }

    /**
     * Runs corresponding function due to pressed key
     * @param {*} blocker ¨timeout that blocks running other events
     */
    this.basicKeys = function(key) {
        switch(key.code) {
            case "ArrowLeft":
                this.frame.lightenButton(this.frame.prev);
                if(this.lb.presentationInterval) {
                    this.lb.reset();
                }
                this.lb.prev();

                break;
            case "ArrowRight":
                this.frame.lightenButton(this.frame.next);
                if(this.lb.presentationInterval) {
                    this.lb.reset();
                }
                this.lb.next();
                break;

            case "Escape":
                this.frame.lightenButton(this.frame.cross);
                if(this.lb.presentationInterval) {
                    this.lb.stop();
                }
                else {
                    this.frame.hideFrame();
                }
                break;

            case "Space":
                if(this.lb.presentationInterval) {
                    this.lb.stop();
                }
                else {
                    this.lb.run();
                }
                break;
        }
    }

    /**
     * Runs transformation due to pressed key
     */
    this.transformKeys = function(key) {
        switch(key.code) {

            case "KeyL":
                this.rotatePhoto(this.rotStep);
                this.keyboardBlocked = false;
                break;
            case "KeyR":
                this.rotatePhoto(-this.rotStep);
                this.keyboardBlocked = false;
                break;

            case "NumpadAdd":
                this.zoomPhoto(this.basicZoomStep, sensitivity = 0.5);
                this.keyboardBlocked = false;
                break;
            case "NumpadSubtract":
                this.zoomPhoto(-this.basicZoomStep, sensitivity = 0.5);
                this.keyboardBlocked = false;
                break;
        }
    }


    /**
     * Adds mouse (and touch) events to control photo transformation
     */
    this.bindMouse = function() {
        if(!this.settings.transformations) { //Mouse events are disabled in settings file
            return;
        }

        /**
         * Zooms photo with wheel
         */
        this.frame.grandParent.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.zoomPhoto(-e.deltaY, sensitivity = 0.01);
        });


        /**
         * Activates grabbing of photo
         */
        this.frame.photo.addEventListener("mousedown", (e) => {
            this.mouseDownAction(e);
        });

        /**
         * For cell phones
         */
        this.frame.photo.addEventListener("touchstart", (e) => {
            let nFingers = this.getNumberOfFingers(e);
            if(nFingers == 1) {
                this.mouseDownAction(e);
            }
            else if(nFingers == 2) {
                this.startPinchZoom(e);
            }
        });

        /**
         * Deactivates grabbing of photo
         */
        this.frame.grandParent.addEventListener("mouseup", () => {
            this.mouseUpAction();
        });

        this.frame.grandParent.addEventListener("touchend", (e) => {
            if(this.getNumberOfFingers(e) == 1) {
                this.mouseUpAction();
            }
        });

        /**
         * Grabs photo
         */
        this.frame.grandParent.addEventListener("mousemove", (e) => {
            this.mouseMoveAction(e);
        });

        this.frame.grandParent.addEventListener("touchmove", (e) => {
            let nFingers = this.getNumberOfFingers(e);
            if(nFingers == 1) {
                this.mouseMoveAction(e);
            }
            else if(nFingers == 2) {
                this.pinchZoom(e);
            }
        });
    }

    /**
     * Initializes pinch gestures
     * @param {*} e Event object (contaning info about touches)
     */
    this.startPinchZoom = function(e) {
        e.preventDefault();

        let event = this.getTouchEvent(e);

        this.lastTouchPosition[0] = [event.touches[0].clientX, event.touches[0].clientY];
        this.lastTouchPosition[1] = [event.touches[1].clientX, event.touches[1].clientY];
    }


    /**
     * Performs zoom in/out of photo by "pinch getures" (two fingers moving away or getting closer on the screen)
     * @param {*} e Event object (contaning info about touches)
     */
    this.pinchZoom = function(e) {
        e.preventDefault();

        let event = this.getTouchEvent(e);

        let curPosTouchOne = [event.touches[0].clientX, event.touches[0].clientY];
        let curPosTouchTwo = [event.touches[1].clientX, event.touches[1].clientY];

        let currentDistance = this.getDistance(curPosTouchOne, curPosTouchTwo);
        let lastDistance = this.getDistance(this.lastTouchPosition[0], this.lastTouchPosition[1]);

        if(currentDistance < lastDistance || currentDistance > lastDistance) {
            this.zoomPhoto(currentDistance - lastDistance, sensitivity = 0.005);
        }

        this.lastTouchPosition[0] = curPosTouchOne;
        this.lastTouchPosition[1] = curPosTouchTwo;
    }


    /**
     * Can be used for getting event with details about touches
     * @param {*} e Event object that fired touch event
     * @returns Event object that contains touches array
     */
    this.getTouchEvent = function(e) {
        let event = (e.originalEvent === undefined) ? e : e.originalEvent;

        return event;
    }

    /**
     * Returns number of fingers fired an touch event
     * @param {*} e Event object that fired an event
     * @returns Number of used fingers or zero if it is not a touch event
     */
    this.getNumberOfFingers = function(e) {
        if(e.type == "touchstart" || e.type == "touchend" || 
           e.type == "touchmove" || e.type == "touchcancel") {
            let event = this.getTouchEvent(e);

            return event.touches.length;
        }

        return 0;
    }

    /**
     * Response fired when mouse clicked down - activates image moving
     * @param {*} e event object
     */
    this.mouseDownAction = function(e) {
        e.preventDefault();

        this.moveActivated = true;

        let yPerc = this.getYPosPerc(e);
        let xPerc = this.getXPosPerc(e);
        this.transStart[0] = xPerc;
        this.transStart[1] = yPerc;

        $(this.frame.photo).css("cursor", "grabbing");
        $(this.frame.photo).css("transition", "none");
    }

    /**
     *  Response fired when mouse button is realease - deactivates image moves
     */
    this.mouseUpAction = function() {
        this.moveActivated = false;

        this.frame.transformer.centerSmallImage();

        $(this.frame.photo).css("cursor", "");
        $(this.frame.photo).css("transition", "");
    }

    /**
     * Response for clicked mouse moves - moves with photo
     * @param {*} e Event fired
     */
    this.mouseMoveAction = function(e) {
        if(this.moveActivated) {
            let lbWidth = this.frame.grandParent.clientWidth;
            let lbHeight = this.frame.grandParent.clientHeight;

            let curPosXPerc = this.getXPosPerc(e);
            let curPosYPerc = this.getYPosPerc(e);

            let newPosX = this.frame.transformer.curPos[0] + curPosXPerc - this.transStart[0];
            let newPosY = this.frame.transformer.curPos[1] + curPosYPerc - this.transStart[1];

            if(this.isInsideWindow(newPosX*lbWidth/100, newPosY*lbHeight/100)) {
                this.frame.transformer.translate(newPosX, newPosY);
                this.transStart[0] = curPosXPerc;
                this.transStart[1] = curPosYPerc;
            }
        }
    }

    /**
     * @param {*} pt1 Array, that represents first point (first element is x coordinate second is y coordinate)
     * @param {*} pt2 Array, that represents second point
     * @returns Distance between two points
     */
     this.getDistance = function(pt1, pt2) {
        return Math.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2);
    }


    /**
     * Determines X position of finger/mouse on screen in percent of window width (it can be easily transformed to absolute value - multiply it by width)
     * @param {*} e mouse or touch event
     * @returns rounded position of cursor/finger in perc. of window width OR it returns zero if e is not mouse/touch event
     */
    this.getXPosPerc = function(e) {
        let lbWidth = this.frame.grandParent.clientWidth;
        let pos;

        if(e.type == "mousedown" || e.type == "mouseup" || 
           e.type == "mousemove") {

            pos = e.clientX;
        }
        else if(e.type == "touchstart" || e.type == "touchend" || 
                e.type == "touchmove" || e.type == "touchcancel") {

            let event = this.getTouchEvent(e);

            let touch = event.touches[0] || event.changedTouches[0];

            pos = touch.pageX;
        }
        else {
            return 0.0;
        }

        return Math.round((pos/lbWidth)*10000)/100; //Rounding
    }

    /**
     * Determines Y position of finger/mouse on screen in percent of window height (it can be easily transformed to absolute value - multiply it by height)
     * @param {*} e mouse or touch event
     * @returns rounded position of cursor/finger in perc. of window height OR it returns zero if e is not mouse/touch event
     */
    this.getYPosPerc = function(e) {
        let lbHeight = this.frame.grandParent.clientHeight;
        let pos;

        if(e.type == "mousedown" || e.type == "mouseup" || 
           e.type == "mousemove") {

            pos = e.clientY;
        }
        else if(e.type == "touchstart" || e.type == "touchend" || 
                e.type == "touchmove" || e.type == "touchcancel") {

            let event = this.getTouchEvent(e);

            let touch = event.touches[0] || event.changedTouches[0];

            pos = touch.pageY;
        }
        else {
            return 0.0;
        }

        return Math.round((pos/lbHeight)*10000)/100; //Rounding
    }


    /**
     * Checks whether is photo on position posX, posY still inside the window
     * @param {*} posX position x of image (in pixels)
     * @param {*} posY position y of image (in pixels)
     * @param {*} tolerance distance from edge (in px), where can img appears
     * @returns true if is inside else false
     */
    this.isInsideWindow = function(posX, posY, tolerance = 50) {
        let lbWidth = this.frame.grandParent.clientWidth;
        let lbHeight = this.frame.grandParent.clientHeight;
        let rect = this.frame.photo.getBoundingClientRect();

        let isInside = posX - rect.width/2 - tolerance < 0 &&
                    posY - rect.height/2 - tolerance/2 < 0;

        isInside = isInside && posX + rect.width/2 + tolerance > lbWidth &&
                posY + rect.height/2 + tolerance/2 > lbHeight;
                            
        return isInside;
    }

}




/***                                     End of lbscript.js                                    ***/

