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
    lightbox.bindKeys();
});


//object prototype for galeries
function Galery(name, photo) {
    this.imgs = [photo];
    this.name = name;
    this.addImg = addImg;

    function addImg(img) {
        this.imgs.push(img);
    }
}

//this is prototype of object, that is responsible for creating HTML structure of lightbox and
//changing its properties
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

    this.prepare = function() {
        //prepare lb window in background
        this.grandParent = this.createEl("div", "", "", "lb_cont");
        this.grandParent.style.backgroundColor = "rgba(0, 0, 0, " + this.settings.bgAlpha + ")"; 
        this.grandParent.style.display = "none"; //lb is not showed when page is loaded
    
        document.getElementsByTagName("html")[0].appendChild(this.grandParent);
        this.photo = this.createEl("img", "", "", "main_img");
        this.grandParent.appendChild(this.photo);
        
        //next photo button
        this.next = this.createEl("img", "next.png", "Next image", "next");
        this.grandParent.appendChild(this.next);
        
        //previous photo button
        this.prev = this.createEl("img", "back.png", "Previous image", "prev");
        this.grandParent.appendChild(this.prev);


        //close button 
        this.cross = this.createEl("img", "close.png", "Close galery (Esc)", "cross");
        this.grandParent.appendChild(this.cross);

        //downloading button
        this.link = this.createEl("a", "", "Download image", "");
        this.grandParent.appendChild(this.link);
        downImg = this.createEl("img", "download.png", "", "download");
        this.link.appendChild(downImg);

        var info = this.createEl("div", "", "", "info");
        this.grandParent.appendChild(info); 

        this.caption = this.createEl("div", "", "", "caption");
        info.appendChild(this.caption);

        this.number = this.createEl("div", "", "Current/Total", "numbering");
        info.appendChild(this.number);
    }

    //returns created html element
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

    this.update = function(imageObject, curImIndex, totalImNumber) {
        this.updateImage(imageObject);
        this.updateCaption(imageObject);
        this.updateNumber(curImIndex, totalImNumber);
    }

    //updates photo source and download attributtes (and caption or numbering if they are enabled)
    this.updateImage = function(imageObject) {
        this.photo.src = imageObject.src;
        this.link.href = imageObject.src;
        this.link.download = getFilenameFromPath(imageObject.src); 
    }

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

    //crops path to filename with extension
    function getFilenameFromPath(path) {
        return path.substr(path.lastIndexOf("/") + 1);
    }

    //Shows window with lb and initializes it with photo given in argument
    this.showFrame = function() {
        $("body").css("overflow", "hidden");
        $("#" + this.grandParent.id).fadeIn();

        if(this.settings.blurFlag) {
            $("body").css("filter", "blur(5px)");
        }
    }

    //Hides window with lb
    this.hideFrame = function() {
        $("#" + this.grandParent.id).fadeOut(); 
        $("body").css("overflow", "auto");

        if(this.settings.blurFlag) {
            $("body").css("filter", "none");
        }
    }

    this.setArrowsVisibility = function(prevIsVisible = true, nextIsVisible = true) {
        if(prevIsVisible) {
            $("#" + this.prev.id).show();
        }
        else {
            $("#" + this.prev.id).hide();
        }

        if(nextIsVisible) {
            $("#" + this.next.id).show();
        }
        else {
            $("#" + this.next.id).hide();
        }
    } 

    this.lightenButton = function(buttonObj) {
        var threshForExecution = 0.55;
        if($("#" + buttonObj.id).css("opacity") < threshForExecution)  {
            $("#" + buttonObj.id).fadeTo(10, 1).delay(40).fadeTo(10, 0.3);
        }
    }
}

//this object is responsible for creating array of galeries, that can be viewed in Lightbox
function GaleriesCreator() {

    //returns array of galeries with images
    this.getGals = function(mainClassName) {
        var imgs = [];
        var currentGalery = null, imagesOnPage, selected, currentClassName, lastClassName;

        imagesOnPage = getAllImages(mainClassName);
        //select only images with lb class
        selected = selectLbImages(imagesOnPage, mainClassName);

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

    function getAllImages(mainClassName) {
        return document.getElementsByClassName(mainClassName);
    }

    
    //selects only images with lb classes
    function selectLbImages(imArr, mainClassName) {
        var result = [];

        for(let i = 0; imArr[i] != null; i++) {
            if(imArr[i].className.indexOf(mainClassName) != -1) {
                result.push(imArr[i]);
            }
        }
    
        return result;
    }

    //return first subclass name after main class name
    function getFirstSubclassName(currentEl, mainClassName) {
        var wholeClassName, mainClassEndWithGap, subclassStart, nextGapIndex;
        var result = null;

        wholeClassName = currentEl.className;
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

//this "main" object handles input events (such as button clicking or key pressing)
//also holds cur. position
function Lightbox(arrOfGaleries) {
    this.galeries = arrOfGaleries;
    this.curIm = 0;
    this.curGal = 0;
    this.frame = null;

    //binds HTML structure to lightbox object
    this.bindFrame = function(HTMLStruct) {
        this.frame = HTMLStruct;

        this.frame.next.addEventListener("click", () => {this.next();});
        this.frame.prev.addEventListener("click", () => {this.prev();});
        this.frame.cross.addEventListener("click", () => {this.frame.hideFrame();});
        
        this.frame.grandParent.addEventListener("click", (target) => {this.lbClose(target);});
    }

    //loads next photo in current galery (when it is last photo go to start)
    this.next = function() {
        var curGalLength = this.galeries[this.curGal].imgs.length; 

        this.curIm++;

        if (this.curIm > (curGalLength - 1)) {
            this.curIm = 0;
        }

        this.frame.update(this.getCurrentIm(), this.curIm, this.galeries[this.curGal].imgs.length);   
    }

    //loads previous photo in current galery
    this.prev = function() {
        var curGalLength = this.galeries[this.curGal].imgs.length;

        this.curIm--;

        if (this.curIm < 0) {
            this.curIm = curGalLength - 1;
        }

        this.frame.update(this.getCurrentIm(), this.curIm, this.galeries[this.curGal].imgs.length);    
    }

    //hides window with lb when user clicks somewhere out of photo and buttons
    this.lbClose = function(click) {
        var clickedEl = click.target, lbFrame = this.frame;
        
        var elements = [];
        while(clickedEl !== null) {
            elements.push(clickedEl);
            clickedEl = clickedEl.parentElement;
        }
        
        var exceptions = [lbFrame.photo, lbFrame.next, lbFrame.prev, lbFrame.link];

        //react on everything except of buttons
        for(let i = 0; exceptions[i] != null; i++) {
            if(elements.includes(exceptions[i])) {
                return;
            }
        }

        lbFrame.hideFrame();
    }

    //adds click event listener in proper form (with a specific arguments)
    this.addOnClick =  function() {
        for(let i = 0; this.galeries[i] != null; i++) {
            for(let u = 0; this.galeries[i].imgs[u] != null; u++) {
                eval("this.galeries[i].imgs[u].addEventListener(\"click\", () => { \
                        this.showAt( + " + i + ", " + u + "); \
                    });");
            }
        }
    }

    //set current photo to chosen one (can be in any galery) and then show lightbox
    this.showAt = function(gal = 0, im = 0) {
        this.set(gal, im);

        if(this.galeries[this.curGal].imgs.length > 1) {
            this.frame.setArrowsVisibility(true, true);
        }
        else {
            this.frame.setArrowsVisibility(false, false);
        }

        this.frame.showFrame();
    }

    //set position in presentation to given values
    this.set = function(gal = 0, im = 0) {
        this.curGal = gal;
        this.curIm = im;

        this.frame.update(this.getCurrentIm(), this.curIm, this.galeries[this.curGal].imgs.length);
    }

    //returns current "position" in presentation
    this.getCurrentIm = function() {
        return this.galeries[this.curGal].imgs[this.curIm];
    }

    //adds corresponding event
    this.bindKeys = function() {

        $(document).keydown((keyPressed) => {
            this.keyHandler(keyPressed); 
        });
    }

    //adds click event listener in proper form (with a specific arguments)
    this.addOnClick =  function() {
        for(let i = 0; this.galeries[i] != null; i++) {
            for(let u = 0; this.galeries[i].imgs[u] != null; u++) {
                eval("this.galeries[i].imgs[u].addEventListener(\"click\", () => { \
                    this.showAt( + " + i + ", " + u + "); \
                    });");
            }
        }
    }

    //set current photo to chosen one and then show lightbox
    this.showAt = function(gal = 0, im = 0) {
        this.set(gal, im);
        this.frame.showFrame();
    }

    //set position in presentation to given values
    this.set = function(gal = 0, im = 0) {
        this.curGal = gal;
        this.curIm = im;

        this.frame.update(this.getCurrentIm());
    }

    //returns current "position" in presentation
    this.getCurrentIm = function() {
        return this.galeries[this.curGal].imgs[this.curIm];
    }

    //adds corresponding event
    this.bindKeys = function() {

        $(document).keydown((keyPressed) => {
            this.keyHandler(keyPressed); 
        });
    }

    //solves pressed key
    this.keyHandler = function(key) {
        pageState = this.frame.grandParent.style.display;

        if(pageState != "none") {
            switch(key.code || key.which) {
                case "ArrowLeft":
                    this.prev();
                    this.frame.lightenButton(this.frame.prev);
                    break;
                case "ArrowRight":
                    this.next();
                    this.frame.lightenButton(this.frame.next);
                    break;
                case "Escape":
                    this.frame.hideFrame();
                    this.frame.lightenButton(this.frame.cross);
                    break;
            }
        }
    }
}


/***                                     End of lbscript.js                                    ***/

