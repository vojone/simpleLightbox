/** ***********************************************************************************************
 *                                            settings.js          
 *                                                                   
 *               Purpose: This file contains object, that represents settings (by modyfying
 *                        variables of this object you can modify some attributes of 
 *                        Simple lightbox without changing its implementation)                        
 *********************************************************************************************** */

const settings = {                      //MEANING:
    //Visual settings
    blurFlag : true,                    //if true body is blurred while is lightbox used (!set bgAlpha to < 1!)
    bgAlpha : 0.9,                      //bg transparency, float between 0 and 1 (1 is completely black, 0 is completely transparent)
    shadows: true,                      //allows creation of dark background behind the buttons and arrows (it can be disturbing, but is more user friendly) 

    imagesDir : "simpleLB/images/",     //path to source images and icons (e.g. for buttons)

    maxHeight : "100%",                 //maximum height of showed image, default is 100% (it can be given in every CSS-friendly format, but it must be in quotes!)
    maxWidth : "100%",                  //maximum width of showed image, default is 100% (it can be given in every CSS-friendly format, but it must be in quotes!)

    
    //Presentation settings
    captions: true,                     //allows captions (it can be defined for each photos by data-caption attribute)
    numbering: true,                    //allows numbering
    loop: false,                        //allows infinity presentation (from last photo you can skip to first) = true
    transformations: true,              //allows tranformation of image (user can rotate, zoom or translate the image (without anypermanent changes!!!))


    //Control settings
    keyboardEnable: true,               //allows controlling galery by keyboard
    cTransByMouse: true,                //allows controlling transformations by mouse (without tranformations enabled has no sense!!!)
}