/* SelectController */

function SelectController()
{
	//this.modelName = "select";
	
	this.view = {
		path: "views/pages/select.html",
		type: "body",
		previous: "home"
	};
	
	MainController.call(this);
};

//csantos: inherit MainController
SelectController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
SelectController.prototype.constructor = SelectController;

//csantos: action after page finished loading
SelectController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
	this.showLoading(false);
};

SelectController.prototype.cacheDOM = function() {
	this.$otSentence = $("#ot-sentence");
	this.$innerWorld = $(".innerWorld");
	this.$outerWorld = $(".outerWorld");
	
	if(!window.app.currentUser.getIsUserNew()) {
		this.$otSentence.html("CONTINUE");
	}
};

SelectController.prototype.bindCurrentEvents = function() {
	this.$innerWorld.on("click", function(e) {
		if(window.app.currentUser.getInnerWorldPath().length > 0) {
			window.app.setController("timeline", true, { world: "inner" });
		} else {
			window.app.setController("player", true, { world: "inner", chapter: 1 });
		}
	});
	
	this.$outerWorld.on("click", function(e) {
		if(window.app.currentUser.getOuterWorldPath().length > 2) {
			window.app.setController("timeline", true, { world: "outer" });
		} else {
			var outerWorld = window.app.currentUser.getOuterWorldPath();
			var foundTitle = false;
						
			for(var i = 0; i < outerWorld.length; i++) {
				if(outerWorld[i].title !== "") {
					foundTitle = true;
					break;
				}
			}
			
			if(foundTitle) {
				window.app.setController("timeline", true, { world: "outer" });
			} else {
				window.app.setController("player", true, { world: "outer" });
			}
		}
	});
};
