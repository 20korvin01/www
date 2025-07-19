## Setup for Android Application

- Install Cordova [cordova.apache.org](https://cordova.apache.org/docs/en/12.x-2025.01/guide/cli/installation.html)  
- Create new Cordova Project in cmd ``cordova create kit-campus-app com.kit.campus.app 
Kit-Campus-App``  
- Replace folder www with www from [this project](https://github.com/20korvin01/www)  
- In this folder add platform android ``cordova platform add android``  
- Check the requirements ``cordova requirements``  
- Run ``cordova build android``  
- Plug in your device and run ``cordova run android``
  - USB Debugging has to be activated on the phone  
  - Specific drivers for your phone might be required  
  - Access to positioning data has to be granted  