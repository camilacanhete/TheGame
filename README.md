# TheGame
Repositoy for an hybrid app called The Game: Nothing is as it seems

## Assets

### Technologies Used

This repo uses the following:

* [Bootstrap V4.0.0-alpha.6](http://v4-alpha.getbootstrap.com/)
* [jquery 3.1.1](https://jquery.com/download/)
* [Gulp](http://gulpjs.com/)


### Getting started

Clone the repo locally and run the following:

`npm install`

This will install the node dependencies for you locally.


### Using gulp

Gulp is a JavaScript task runner used to automate repetitive tasks. In this project we are using gulp to compile and minify our sass.

You will need to have gulp installed globally before beginning. To install globally, use the following command in terminal:

`npm install gulp-cli -g`

If you haven't used SASS before, go to this link:

http://sass-lang.com/install

To compile your sass, use the following command in terminal:

`gulp styles`

To minify your css, use the following command in terminal:

`gulp minify-css`

To compile your sass and watch for any additional changes to sass files use the following command in terminal (you will need to use 'ctrl c' to quit this task in terminal):

`gulp`


## Cordova

### Install cordova

Install or update your cordova environment to the latest version using [node](https://nodejs.org/en/):

`npm install -g cordova`

This app uses two external plugins:

* [cordova-plugin-firebase](https://github.com/arnesson/cordova-plugin-firebase)
* [cordova-plugin-insomnia](https://github.com/EddyVerbruggen/Insomnia-PhoneGap-Plugin)


