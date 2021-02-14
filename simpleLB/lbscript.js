// JavaScript Document

lb_page = "";
lb_photo = "";
lb_images = "";
lb_image = 0;
lb_name = "";
lb_down_link = "";

$(document).ready(function(){
    lb_page = document.createElement("div");
    lb_page.id = "lb_cont";
    document.getElementsByTagName("html")[0].appendChild(lb_page);
    lb_photo = document.createElement("img");
    lb_photo.id = "lb_img";
    lb_page.appendChild(lb_photo);
    lb_page.addEventListener("click", lb_close);
      
    lb_page.style.display = "none";
      
    lb_images = document.getElementsByClassName("lb");
    for(i = 0; lb_images[i] != null; i++) {
        lb_images[i].setAttribute("onclick", "lb(" + i + ")");
    }
      
    lb_cross = document.createElement("img");
    lb_cross.src = "simpleLB/images/lb_close.png";
    lb_cross.id = "lb_cross";
    lb_cross.addEventListener("click", backToWeb);
    lb_page.appendChild(lb_cross);
    
    lb_down_link = document.createElement("a");
    lb_down_link.title = "Download image";
    lb_page.appendChild(lb_down_link);
    lb_down = document.createElement("img");
    lb_down.src = "simpleLB/images/download.png";
    lb_down.id = "lb_download";
    lb_down_link.appendChild(lb_down);
    
    lb_next = document.createElement("img");
    lb_next.src = "simpleLB/images/next.png";
    lb_next.id = "lb_next";
    lb_next.addEventListener("click", lb_nextPh);
    lb_page.appendChild(lb_next);
    
    lb_back = document.createElement("img");
    lb_back.src = "simpleLB/images/back.png";
    lb_back.id = "lb_back";
    lb_back.addEventListener("click", lb_prevPh); 
    lb_page.appendChild(lb_back);
});


function lb(lb_im = 0) {
    $("#lb_cont").fadeIn();
    lb_photo.src = lb_images[lb_im].src;
    lb_image = lb_im;
    lb_down_link.href =  lb_images[lb_im].src;
    lb_down_link.download = lb_name + "_" + lb_im;    
}

function backToWeb() {
    $("#lb_cont").fadeOut();       
}

function lb_close(click) {
    var x = document.getElementById("lb_img"); 
    var el = click.target;
    
    elements = [];
    while(el !== null) {
        elements.push(el);
        el = el.parentElement;
    }
    
    if (!elements.includes(x) && !elements.includes(document.getElementById("lb_next")) && 
        !elements.includes(document.getElementById("lb_back")) && 
        !elements.includes(document.getElementById("lb_download"))) {
      backToWeb();
    }
}

function delete_lb() {
    document.getElementsByTagName("html")[0].removeChild(lb_page);
}

function lb_nextPh() {
    lb_image++;
    if (lb_image > (lb_images.length - 1)) {
      lb_image = 0;
    }
    
    lb_photo.src = lb_images[lb_image].src;
    lb_down_link.href = lb_images[lb_image].src;
    lb_down_link.download = lb_name + "_" + lb_image;    
}

function lb_prevPh() {
    lb_image--;
    if (lb_image < 0) {
      lb_image = lb_images.length - 1;
    }

    lb_photo.src = lb_images[lb_image].src;
    lb_down_link.href =  lb_images[lb_image].src;
    lb_down_link.download = lb_name + "_" + lb_image;    
}

