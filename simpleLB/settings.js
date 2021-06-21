/** ***********************************************************************************************
 *                                            settings.js   
 * 
 *                                           Author: vojone              
 *                                                                   
 *               Purpose: This file contains object, that represents settings (by modyfying
 *                        variables of this object you can modify some attributes of 
 *                        Simple lightbox without changing its implementation)                        
 *********************************************************************************************** */


const settings = {                      //MEANING:
    blurFlag : true,                    //if true body is blurred while is lightbox used (!set bgAlpha to < 1!)
    bgAlpha : 0.85,                     //bg transparency, float between 0 and 1 (1 is completely black, 0 is completely transparent)
    imagesDir : "simpleLB/images/",     //path to source images (e.g. for buttons)
}