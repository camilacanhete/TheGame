/* CreditsController */

function CreditsController()
{
	//this.modelName = "credits";
	
	this.view = {
		path: "views/pages/credits.html",
		type: "body",
		previous: "home"
	};
	
	MainController.call(this);
};

//csantos: inherit MainController
CreditsController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
CreditsController.prototype.constructor = CreditsController;

//csantos: action after page finished loading
CreditsController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
	this.showLoading(false);
};

CreditsController.prototype.cacheDOM = function() {
};

CreditsController.prototype.bindCurrentEvents = function() {
};
