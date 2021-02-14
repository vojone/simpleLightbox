lb_page = "";
lb_photo = "";
lb_images = "";
lb_image = 0;
lb_nazev = "";
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
      
    lb_cross = document.createElement("img");
    lb_cross.src = "lightbox/images/lb_close.png";
    lb_cross.id = "lb_cross";
    lb_cross.addEventListener("click", backToProject);
    lb_page.appendChild(lb_cross);
    
    lb_down_link = document.createElement("a");
    lb_down_link.title = "Stáhnout fotku";
    lb_page.appendChild(lb_down_link);
    lb_down = document.createElement("img");
    lb_down.src = "lightbox/images/download.png";
    lb_down.id = "lb_download";
    lb_down_link.appendChild(lb_down);
    
    lb_next = document.createElement("img");
    lb_next.src = "lightbox/images/next.png";
    lb_next.id = "lb_next";
    lb_next.addEventListener("click", lb_nextPh);
    lb_page.appendChild(lb_next);
    
    lb_back = document.createElement("img");
    lb_back.src = "lightbox/images/back.png";
    lb_back.id = "lb_back";
    lb_back.addEventListener("click", lb_prevPh); 
    lb_page.appendChild(lb_back);
});



// JavaScript Document
