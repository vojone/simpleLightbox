// JavaScript Document

lbName = ""; //label for downloaded photos ("lbName"_"number".jpg)
srcImagesDir = "simpleLB/images/"; //path to source images (e.g. for buttons)
blurFlag = true; //if true body is blurred while is lightbox used (!set bgAlpha to <> 1!)
bgAlpha = 0.92; //bg transparency (1 is completely black, 0 is completely transparent)

var page, photo, images, downLink, image = 0;

$(document).ready(function() {

    //Prepare lb window in background
    page = createEl("div", "", "", "lb_cont", close);
    page.style.backgroundColor = "rgba(0, 0, 0, " + bgAlpha + ")"; 
    page.style.display = "none"; //lb is not showed when page is loaded

    document.getElementsByTagName("html")[0].appendChild(page);
    photo = createEl("img", "", "", "lb_img", null);
    page.appendChild(photo);

    images = getImages("lb");
    addOnclick(images);
    
    //Downloading button
    downLink = createEl("a", "", "Download image", "", null);
    page.appendChild(downLink);
    downImg = createEl("img", "download.png", "", "lb_download", null);
    downLink.appendChild(downImg);

    //Close button 
    crossButton = createEl("img", "lb_close.png", "Close galery (Esc)", "lb_cross", backToWeb);
    page.appendChild(crossButton);
    
    //Next photo button
    nextButton = createEl("img", "next.png", "Next image", "lb_next", nextPh);
    page.appendChild(nextButton);
    
    //Previous photo button
    backButton = createEl("img", "back.png", "Previous image", "lb_back", prevPh);
    page.appendChild(backButton);

    
    $(document).keydown(function(keyPressed) {
        keyHandler(keyPressed);
    });
});

//Adds onclick attributte
function addOnclick(elementsArr) {
    for(i = 0; elementsArr[i] != null; i++) {
        for(u = 0; elementsArr[i][u] != null; u++) {
            elementsArr[i][u].setAttribute("onclick", "lb(" + i + ", " + u + ")");
        }
    }
}

//returns array of galeries with images
function getImages(mainClassName) {
    var imgs = [[]];

    imagesOnPage = document.getElementsByClassName(mainClassName);
    currentClassName = null, lastClassName = null;
    for(i = 0, u = 0, v = 0; imagesOnPage[i] != null; i++) {

        currentClassName = getFirstSubclassName(mainClassName);

        if(currentClassName == lastClassName) {
            imgs[u][v] = imagesOnPage[i];
            v++;
        }
        else {
            u++;
            v = 0;
            imgs[u][v] = imagesOnPage[i];
        }
    }
    
    return imgs;
}

//return first subclass name after main class name
function getFirstSubclassName(mainClassName) {
    wholeClassName = imagesOnPage[i].className;
    mainClassEnd = wholeClassName.indexOf(mainClassName, 0) + mainClassName.length;
    seriesNameEnd = wholeClassName.indexOf(" ", mainClassEnd);

    if(seriesNameEnd != -1) {
        result = wholeClassName.substring(mainClassEnd, seriesNameEnd);
    }
    else {
        result = null;
    }

    return result;
}

//Returns created html element
function createEl(type, bg, title, id, clickEvent) {
    newEl = document.createElement(type);

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

//Solves pressed key
function keyHandler(key) {
    pageState = page.style.display;

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

//Shows window with lb and initializes it with photo given in argument
function lb(gal = 0, im = 0) {
    $("#lb_cont").fadeIn();

    if(blurFlag) {
        $("body").css("filter", "blur(5px)");
    }

    image = im;
    galery = gal;

    updateLb(galery, image);    
}

//Hides window with lb
function backToWeb() {
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
    for(i = 0; exceptions[i] != null; i++) {
        if(elements.includes(exceptions[i])) {
            return;
        }
    }

    backToWeb();
}

//loads next photo (when it is last photo go to start)
function nextPh() {
    image++;
    if (image > (images[galery].length - 1)) {
      image = 0;
    }
    
    updateLb(galery, image);   
}

//loads previous photo
function prevPh() {
    image--;
    if (image < 0) {
      image = images[galery].length - 1;
    }

    updateLb(galery, image);    
}

//updates photo source and download attributtes
function updateLb(gal = 0, im = 0) {
    photo.src = images[gal][im].src;
    downLink.href =  images[galery][im].src;
    downLink.download = lbName + "_" + gal + "_" + im; 
}
