/** ***********************************************************************************************
 *                                            lbscript.js    
 * 
 *                                          Author: vojone                   
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

    this.prepare = function() {
        //prepare lb window in background
        this.grandParent = this.createEl("div", "", "", "lb_cont");
        this.grandParent.style.backgroundColor = "rgba(0, 0, 0, " + this.settings.bgAlpha + ")"; 
        this.grandParent.style.display = "none"; //lb is not showed when page is loaded
    
        document.getElementsByTagName("html")[0].appendChild(this.grandParent);
        this.photo = this.createEl("img", "", "", "lb_img");
        this.grandParent.appendChild(this.photo);
        
        //downloading button
        this.link = this.createEl("a", "", "Download image", "");
        this.grandParent.appendChild(this.link);
        downImg = this.createEl("img", "download.png", "", "lb_download");
        this.link.appendChild(downImg);
    
        //close button 
        this.cross = this.createEl("img", "lb_close.png", "Close galery (Esc)", "lb_cross");
        this.grandParent.appendChild(this.cross);
        
        //next photo button
        this.next = this.createEl("img", "next.png", "Next image", "lb_next");
        this.grandParent.appendChild(this.next);
        
        //previous photo button
        this.prev = this.createEl("img", "back.png", "Previous image", "lb_back");
        this.grandParent.appendChild(this.prev);
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

    //updates photo source and download attributtes
    this.update = function(imageObject) {
        this.photo.src = imageObject.src;
        this.link.href = imageObject.src;
        this.link.download = getFilenameFromPath(imageObject.src); 
    }

    //crops path to filename with extension
    function getFilenameFromPath(path) {
        return path.substr(path.lastIndexOf("/") + 1);
    }

    //Shows window with lb and initializes it with photo given in argument
    this.show = function() {
        $("body").css("overflow", "hidden");
        $("#" + this.grandParent.id).fadeIn();

        if(this.settings.blurFlag) {
            $("body").css("filter", "blur(5px)");
        }
    }

    //Hides window with lb
    this.hide = function() {
        $("#" + this.grandParent.id).fadeOut(); 
        $("body").css("overflow", "auto");

        if(this.settings.blurFlag) {
            $("body").css("filter", "none");
        }
    }
}

//this object is responsible for creating array of galeries, that can be viewed in Lightbox
function GaleriesCreator() {

    //returns array of galeries with images
    this.getGals = function(mainClassName) {
        var imgs = [];
        var currentGalery = null, imagesOnPage, selected, currentClassName, lastClassName;

        imagesOnPage = getAllImages();
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

    function getAllImages() {
        return document.getElementsByTagName("img");
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
        this.frame.cross.addEventListener("click", () => {this.frame.hide();});
        
        this.frame.grandParent.addEventListener("click", (target) => {this.lbClose(target);});
    }

    //loads next photo (when it is last photo go to start)
    this.next = function() {
        var curGalLength = this.galeries[this.curGal].imgs.length; 

        this.curIm++;

        if (this.curIm > (curGalLength - 1)) {
            this.curIm = 0;
        }

        this.frame.update(this.getCurrentIm());   
    }

    //loads previous photo
    this.prev = function() {
        var curGalLength = this.galeries[this.curGal].imgs.length;

        this.curIm--;

        if (this.curIm < 0) {
            this.curIm = curGalLength - 1;
        }

        this.frame.update(this.getCurrentIm());    
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

        lbFrame.hide();
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
        this.frame.show();
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
                    break;
                case "ArrowRight":
                    this.next();
                    break;
                case "Escape":
                    this.frame.hide();
                    break;
            }
        }
    }
}

/***                                       End of lbscript.js                                  ***/

