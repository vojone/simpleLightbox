// JavaScript Document

lbName = ""; //label for downloaded photos ("lbName"_"number".jpg)
srcImagesDir = "simpleLB/images/"; //path to source images (e.g. for buttons)
blurFlag = true; //if true body is blurred while is lightbox used (!set bgAlpha to <> 1!)
bgAlpha = 0.85; //bg transparency (1 is completely black, 0 is completely transparent)

$(document).ready(() => {
    lightbox = new Lightbox();
    lightbox.create(bgAlpha);
    lightbox.getImages("lb");
    lightbox.addOnClick();
    bindKeyboard();
});

//Object prototype for galeries
function Galery(name, photo) {
    this.imgs = [photo];
    this.name = name;
    this.addImg = addImg;

    function addImg(img) {
        this.imgs.push(img);
    }
}

//updates photo source and download attributtes
function update() {
    lightbox.photo.src = lightbox.galeries[lightbox.curGal].imgs[lightbox.curIm].src;
    lightbox.link.href =  lightbox.galeries[lightbox.curGal].imgs[lightbox.curIm].src;
    lightbox.link.download = lbName + "_" + lightbox.curGal + "_" + lightbox.curIm; 
}

//Shows window with lb and initializes it with photo given in argument
function show(gal = 0, im = 0) {
    $("#lb_cont").fadeIn();
    document.body.style.overflow = 'hidden';

    if(blurFlag) {
        $("body").css("filter", "blur(5px)");
    }

    lightbox.curIm = im;
    lightbox.curGal = gal;

    update();
}

//loads next photo (when it is last photo go to start)
function nextPh() {
    var curGalLength = lightbox.galeries[lightbox.curGal].imgs.length; 

    lightbox.curIm++;

    if (lightbox.curIm > (curGalLength - 1)) {
        lightbox.curIm = 0;
    }

    update(lightbox.curGal, lightbox.curIm);   
}

//loads previous photo
function prevPh() {
    var curGalLength = lightbox.galeries[lightbox.curGal].imgs.length;

    lightbox.curIm--;

    if (lightbox.curIm < 0) {
        lightbox.curIm = curGalLength - 1;
    }

    update(lightbox.curGal, lightbox.curIm);    
}

//Hides window with lb
function backToWeb() {
    document.body.style.overflow = 'auto';
    $("#lb_cont").fadeOut(); 

    if(blurFlag) {
        $("body").css("filter", "none");
    }
}

//Hides window with lb when user clicks somewhere out of photo and buttons
function close(click) {
    var x = document.getElementById("lb_img"); 
    var el = click.target;
    
    elements = [];
    while(el !== null) {
        elements.push(el);
        el = el.parentElement;
    }
    
    exceptions = [x, 
                document.getElementById("lb_next"),
                document.getElementById("lb_back"),
                document.getElementById("lb_download")];

    //react on everything except of buttons
    for(let i = 0; exceptions[i] != null; i++) {
        if(elements.includes(exceptions[i])) {
            return;
        }
    }

    backToWeb();
}

function Lightbox() {
    this.parent;
    this.photo;
    this.link;

    this.galeries = [];
    this.curIm = 0;
    this.curGal = 0;
    this.create = createLb;
    this.getImages = getLbImages;
    this.addOnClick = addOnClick;

    function createLb(bgAlpha) {
        //Prepare lb window in background
        this.parent = createEl("div", "", "", "lb_cont", close);
        this.parent.style.backgroundColor = "rgba(0, 0, 0, " + bgAlpha + ")"; 
        this.parent.style.display = "none"; //lb is not showed when page is loaded
    
        document.getElementsByTagName("html")[0].appendChild(this.parent);
        this.photo = createEl("img", "", "", "lb_img", null);
        this.parent.appendChild(this.photo);
        
        //Downloading button
        this.link = createEl("a", "", "Download image", "", null);
        this.parent.appendChild(this.link);
        downImg = createEl("img", "download.png", "", "lb_download", null);
        this.link.appendChild(downImg);
    
        //Close button 
        crossButton = createEl("img", "lb_close.png", "Close galery (Esc)", "lb_cross", backToWeb);
        this.parent.appendChild(crossButton);
        
        //Next photo button
        nextButton = createEl("img", "next.png", "Next image", "lb_next", nextPh);
        this.parent.appendChild(nextButton);
        
        //Previous photo button
        backButton = createEl("img", "back.png", "Previous image", "lb_back", prevPh);
        this.parent.appendChild(backButton);
    }

    //Returns created html element
    function createEl(type, bg, title, id, clickEvent) {
        var newEl = document.createElement(type);

        if(bg != "") {
            newEl.src = srcImagesDir + bg;
        }

        if(id != "") {
            newEl.id = id;
        }

        if(title != "") {
            newEl.title = title;
        }
        
        if(clickEvent != null) {
            newEl.addEventListener("click", clickEvent);
        }
        
        return newEl;
    }

    //returns array of galeries with images
    function getLbImages(mainClassName) {
        var imgs = [];
        var currentGalery = null, imagesOnPage, selected, currentClassName, lastClassName;

        imagesOnPage = getAllImages();
        selected = selectLbImages(imagesOnPage, mainClassName); //select only images with lb class

        currentClassName = null, lastClassName = null;
        for(let i = 0; selected[i] != null; i++) {
            
            currentClassName = getFirstSubclassName(selected[i], mainClassName);
            if(i == 0 || currentClassName != lastClassName) {
                if(i != 0) {
                    imgs.push(currentGalery); //if galery is changing push it into result array
                }

                currentGalery = new Galery(currentClassName, selected[i]); //change galery, if name is changing
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
        var wholeClassName, mainClassEndWithGap, subclassStart, nextGapIndex, result;
    
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
        else {
            result = null;
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

    //Adds onclick attributte
    function addOnClick() {
        for(let i = 0; this.galeries[i] != null; i++) {
            for(let u = 0; this.galeries[i].imgs[u] != null; u++) {
                this.galeries[i].imgs[u].setAttribute("onclick", "show(" + i + ", " + u + ")");
            }
        }
    }
}

//adds corresponding event
function bindKeyboard() {
    $(document).keydown(function(keyPressed) {
        keyHandler(keyPressed);
    });
}

//Solves pressed key
function keyHandler(key) {
    pageState = lightbox.parent.style.display;

    if(pageState != "none") {
        switch(key.code || key.which) {
            case "ArrowLeft":
                prevPh();
                break;
            case "ArrowRight":
                nextPh();
                break;
            case "Escape":
                backToWeb();
                break;
        }
    }
}

