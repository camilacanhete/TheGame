/* HeaderController */

function HeaderController()
{
    //this.modelName = "header";
	this.view = {
		path: "views/components/header.html",
		type: "header"
	};
	
    MainController.call(this);
};

//csantos: inherit MainController
HeaderController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
HeaderController.prototype.constructor = HeaderController;

//csantos: action after page finished loading
HeaderController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
};

HeaderController.prototype.cacheDOM = function() {
	this.$btnBack = $("#btn-back");
	//this.$btnMenu = $("#btn-navbar");
};

HeaderController.prototype.bindCurrentEvents = function() {
	var self = this;
	
	//csantos: subscribe to events
	window.app.pubSub.subscribe("/controller/change", this, function(controller) {
		if(window.app.controller.view && window.app.controller.view.previous) {
			self.toggleNavBtns(true);
		} else {
			self.toggleNavBtns(false);
		}
	});
	
	//csantos: bind events
	this.$btnBack.on("click", this.returnToPreviousScreen);
};

HeaderController.prototype.returnToPreviousScreen = function(e) {
	if(window.app.controller.view && window.app.controller.view.previous) {
		window.app.setController(window.app.controller.view.previous);
	}
};

HeaderController.prototype.toggleNavBtns = function(showBackButton) {
	var self = this;
	
	if(showBackButton) {
		this.$btnBack.removeClass("invisible").addClass("back");
		
		/*setTimeout(function() {
			self.$btnBack.addClass("back");
		}, 50);*/
		
		//this.$btnMenu.addClass("hidden-xs-up");
	} else {
		this.$btnBack.removeClass("back").addClass("invisible");
		//this.$btnMenu.removeClass("hidden-xs-up");
	}
};
