// JavaScript Document

lb_name = ""; //label for downloaded photos ("lb_name"_"number".jpg)

$(document).ready(function(){

    //Prepare lb window in background
    lb_page = document.createElement("div");
    lb_page.id = "lb_cont";
    document.getElementsByTagName("html")[0].appendChild(lb_page);
    lb_photo = document.createElement("img");
    lb_photo.id = "lb_img";
    lb_page.appendChild(lb_photo);
    lb_page.addEventListener("click", lb_close);

    lb_page.style.display = "none"; //lb is not showed when page is loaded
      
    //Get images
    lb_images = document.getElementsByClassName("lb");
    
    //Add onclick attributte
    for(i = 0; lb_images[i] != null; i++) {
        lb_images[i].setAttribute("onclick", "lb(" + i + ")");
    } 

    $(document).keydown(function(keyPressed) {
        keyHandler(keyPressed);
    });

    //Close button 
    lb_cross = document.createElement("img");
    lb_cross.src = "simpleLB/images/lb_close.png";
    lb_cross.id = "lb_cross";
    lb_cross.title = "Close galery";
    lb_cross.addEventListener("click", lb_backToWeb);
    lb_page.appendChild(lb_cross);
    
    //Downloading button
    lb_down_link = document.createElement("a");
    lb_down_link.title = "Download image";
    lb_page.appendChild(lb_down_link);
    lb_down = document.createElement("img");
    lb_down.src = "simpleLB/images/download.png";
    lb_down.id = "lb_download";
    lb_down_link.appendChild(lb_down);
    
    //Next photo button
    lb_next = document.createElement("img");
    lb_next.src = "simpleLB/images/next.png";
    lb_next.title = "Next image";
    lb_next.id = "lb_next";
    lb_next.addEventListener("click", lb_nextPh);
    lb_page.appendChild(lb_next);
    
    //Previous photo button
    lb_back = document.createElement("img");
    lb_back.src = "simpleLB/images/back.png";
    lb_back.title = "Previous image";
    lb_back.id = "lb_back";
    lb_back.addEventListener("click", lb_prevPh); 
    lb_page.appendChild(lb_back);
});

//Solves pressed key
function keyHandler(key) {
    lb_state = document.getElementById("lb_cont").style.display;

    if(lb_state != "none") {
        switch(key.code || key.which) {
            case "ArrowLeft":
                lb_prevPh();
                break;
            case "ArrowRight":
                lb_nextPh();
                break;
            case "Escape":
                lb_backToWeb();
                break;
        }
    }
}

//Shows window with lb and initializes it with photo given in argument
function lb(lb_im = 0) {
    $("#lb_cont").fadeIn();
    lb_photo.src = lb_images[lb_im].src;
    lb_image = lb_im;
    lb_down_link.href =  lb_images[lb_im].src;
    lb_down_link.download = lb_name + "_" + lb_im;    
}

//Hides window with lb
function lb_backToWeb() {
    $("#lb_cont").fadeOut();       
}

//Hides window with lb when user clicks somewhere out of photo and buttons
function lb_close(click) {
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

    lb_backToWeb();
}

//loads next photo (when it is last photo go to start)
function lb_nextPh() {
    lb_image++;
    if (lb_image > (lb_images.length - 1)) {
      lb_image = 0;
    }
    
    lb_photo.src = lb_images[lb_image].src;
    lb_down_link.href = lb_images[lb_image].src;
    lb_down_link.download = lb_name + "_" + lb_image;    
}

//loads previous photo
function lb_prevPh() {
    lb_image--;
    if (lb_image < 0) {
      lb_image = lb_images.length - 1;
    }

    lb_photo.src = lb_images[lb_image].src;
    lb_down_link.href =  lb_images[lb_image].src;
    lb_down_link.download = lb_name + "_" + lb_image;    
}
