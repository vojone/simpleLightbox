const settings = {
    //OPTION:                           //MEANING:
    lbName : "",                        //label for downloaded photos ("lbName"_"number".jpg)
    srcImagesDir : "simpleLB/images/",  //path to source images (e.g. for buttons)
    blurFlag : true,                    //if true body is blurred while is lightbox used (!set bgAlpha to <> 1!)
    bgAlpha : 0.85,                     //bg transparency (1 is completely black, 0 is completely transparent)
}

$(document).ready(() => {
    lbHtml = new LbHTMLStructure();
    lbHtml.prepare(settings.bgAlpha);

    lightbox = new Lightbox();
    lightbox.bindFrame(lbHtml);
    lightbox.getImages("lb");
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

function LbHTMLStructure() {
    this.grandParent = null;
    this.photo = null;
    this.link = null;

    this.next = null;
    this.prev = null;
    this.cross = null;

    this.prepare = makeHtmlStruct;
    this.update = update;
    this.show = show;
    this.hide = hide;

    function makeHtmlStruct(bgAlpha) {
        //Prepare lb window in background
        this.grandParent = createEl("div", "", "", "lb_cont", close);
        this.grandParent.style.backgroundColor = "rgba(0, 0, 0, " + bgAlpha + ")"; 
        this.grandParent.style.display = "none"; //lb is not showed when page is loaded
    
        document.getElementsByTagName("html")[0].appendChild(this.grandParent);
        this.photo = createEl("img", "", "", "lb_img");
        this.grandParent.appendChild(this.photo);
        
        //downloading button
        this.link = createEl("a", "", "Download image", "");
        this.grandParent.appendChild(this.link);
        downImg = createEl("img", "download.png", "", "lb_download");
        this.link.appendChild(downImg);
    
        //close button 
        this.cross = createEl("img", "lb_close.png", "Close galery (Esc)", "lb_cross");
        this.grandParent.appendChild(this.cross);
        
        //next photo button
        this.next = createEl("img", "next.png", "Next image", "lb_next");
        this.grandParent.appendChild(this.next);
        
        //previous photo button
        this.prev = createEl("img", "back.png", "Previous image", "lb_back");
        this.grandParent.appendChild(this.prev);
    }

    //returns created html element
    function createEl(type, bg, title, id) {
        var newEl = document.createElement(type);

        if(bg != "") {
            newEl.src = settings.srcImagesDir + bg;
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
    function update(imageObject) {
        this.photo.src = imageObject.src;
        this.link.href = imageObject.src;
        this.link.download = getFilenameFromPath(imageObject.src); 
    }

    //Shows window with lb and initializes it with photo given in argument
    function show() {
        $("body").css("overflow", "hidden");
        $("#" + this.grandParent.id).fadeIn();

        if(settings.blurFlag) {
            $("body").css("filter", "blur(5px)");
        }
    }

    //Hides window with lb
    function hide() {
        $("#" + this.grandParent.id).fadeOut(); 
        $("body").css("overflow", "auto");

        if(settings.blurFlag) {
            $("body").css("filter", "none");
        }
    }
}

//crops path to filename with extension
function getFilenameFromPath(path) {
    return path.substr(path.lastIndexOf("/") + 1);
}

function Lightbox() {
    this.galeries = [];
    this.curIm = 0;
    this.curGal = 0;
    this.frame = null;

    this.bindFrame = bindFrame;
    this.getImages = getLbImages;

    this.next = nextIm;
    this.prev = prevIm;
    this.set = setIm;
    this.showAt = showAt;

    this.addOnClick = addOnClick;
    this.keyHandler = keyHandler;
    this.bindKeys = bindKeyboard;
    this.lbClose = close;

    this.getCurrentIm = getCurrentIm;

    //returns current "position" in presentation
    function getCurrentIm() {
        return this.galeries[this.curGal].imgs[this.curIm];
    }

    //adds corresponding event
    function bindKeyboard() {

        $(document).keydown((keyPressed) => {
            this.keyHandler(keyPressed); 
        });
    }

    //binds HTML structure to lightbox object
    function bindFrame(HTMLStruct) {
        this.frame = HTMLStruct;

        this.frame.next.addEventListener("click", () => {this.next();});
        this.frame.prev.addEventListener("click", () => {this.prev();});
        this.frame.cross.addEventListener("click", () => {this.frame.hide();});
        
        this.frame.grandParent.addEventListener("click", (target) => {this.lbClose(target);});
    } 

    //loads next photo (when it is last photo go to start)
    function nextIm() {
        var curGalLength = this.galeries[this.curGal].imgs.length; 

        this.curIm++;

        if (this.curIm > (curGalLength - 1)) {
            this.curIm = 0;
        }

        this.frame.update(this.getCurrentIm());   
    }

    //loads previous photo
    function prevIm() {
        var curGalLength = this.galeries[this.curGal].imgs.length;

        this.curIm--;

        if (this.curIm < 0) {
            this.curIm = curGalLength - 1;
        }

        this.frame.update(this.getCurrentIm());    
    }

    //set position in presentation to given values
    function setIm(gal = 0, im = 0) {
        this.curGal = gal;
        this.curIm = im;

        this.frame.update(this.getCurrentIm());
    }

    //set current photo to chosen one and then show lightbox
    function showAt(gal = 0, im = 0) {
        this.set(gal, im);
        this.frame.show();
    }

    //returns array of galeries with images
    function getLbImages(mainClassName) {
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
        
        this.galeries = imgs;
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

    //adds click event listener in proper form (with a specific arguments)
    function addOnClick() {
        for(let i = 0; this.galeries[i] != null; i++) {
            for(let u = 0; this.galeries[i].imgs[u] != null; u++) {
                eval("this.galeries[i].imgs[u].addEventListener(\"click\", () => { this.showAt( + " + i + ", " + u + "); });");
            }
        }
    }

    //hides window with lb when user clicks somewhere out of photo and buttons
    function close(click) {
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

    //solves pressed key
    function keyHandler(key) {
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

//End of lbscript.js

