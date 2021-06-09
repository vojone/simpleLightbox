// JavaScript Document

lbName = ""; //label for downloaded photos ("lbName"_"number".jpg)
srcImagesDir = "simpleLB/images/"; //path to source images (e.g. for buttons)
blurFlag = true; //if true body is blurred while is lightbox used (!set bgAlpha to <> 1!)
bgAlpha = 0.9; //bg transparency (1 is completely black, 0 is completely transparent)

$(document).ready(function() {

    //Prepare lb window in background
    page = document.createElement("div");
    page.id = "lb_cont";
    page.style.backgroundColor = "rgba(0, 0, 0, " + bgAlpha + ")"; 
    document.getElementsByTagName("html")[0].appendChild(page);
    photo = document.createElement("img");
    photo.id = "lb_img";
    page.appendChild(photo);
    page.addEventListener("click", close);

    page.style.display = "none"; //lb is not showed when page is loaded
      
    //Get images
    images = document.getElementsByClassName("lb");
    
    //Add onclick attributte
    for(i = 0; images[i] != null; i++) {
        images[i].setAttribute("onclick", "lb(" + i + ")");
    } 
    
    //Downloading button
    downLink = document.createElement("a");
    downLink.title = "Download image";
    page.appendChild(downLink);

    down = document.createElement("img");
    down.src = "simpleLB/images/download.png";
    down.id = "lb_download";
    downLink.appendChild(down);

    //Close button 
    crossButton = createEl("img", "lb_close.png", "Close galery", "lb_cross", backToWeb);
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

//Returns created html element
function createEl(type, bg, title, id, event) {
    newEl = document.createElement(type);
    newEl.src = srcImagesDir + bg;
    newEl.id = id;
    newEl.title = title;
    newEl.addEventListener("click", event);
    
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
function lb(im = 0) {
    $("#lb_cont").fadeIn();

    if(blurFlag) {
        $("body").css("filter", "blur(3px)");
    }

    photo.src = images[im].src;
    image = im;
    downLink.href =  images[im].src;
    downLink.download = lbName + "_" + im;    
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
    if (image > (images.length - 1)) {
      image = 0;
    }
    
    photo.src = images[image].src;
    downLink.href = images[image].src;
    downLink.download = lbName + "_" + image;    
}

//loads previous photo
function prevPh() {
    image--;
    if (image < 0) {
      image = images.length - 1;
    }

    photo.src = images[image].src;
    downLink.href =  images[image].src;
    downLink.download = lbName + "_" + image;    
}
