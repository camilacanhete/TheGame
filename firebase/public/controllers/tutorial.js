/* TutorialController */

function TutorialController()
{
	//this.modelName = "tutorial";
	
	this.view = {
		path: "views/pages/tutorial.html",
		type: "body",
		previous: "home"
	};
	
	this.isFirstSlide = true;
	this.isLastSlide = false;
	
	MainController.call(this);
};

//csantos: inherit MainController
TutorialController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
TutorialController.prototype.constructor = TutorialController;

//csantos: action after page finished loading
TutorialController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
	this.showLoading(false);
};

TutorialController.prototype.cacheDOM = function() {
	var self = this;
	
	this.$carousel = $("#carousel");
	this.$btnNext = $("#btn-next");
	this.$btnPrevious = $("#btn-previous");
	this.$btnSkip = $("#btn-skip");
	
	this.$carousel.carousel({
		interval: false,
		wrap: true
	});
	
	this.$carousel.on('slide.bs.carousel', function(e) {
		var target = $(e.relatedTarget);
		
		if(target.is(":first-child")) {
			self.isFirstSlide = true;
			self.$btnPrevious.attr("disabled", "disabled");
		} else {
			self.isFirstSlide = false;
			self.$btnPrevious.removeAttr("disabled");
		}
		
		if(target.is(":last-child")) {
			self.isLastSlide = true;
			self.$btnNext.html('<span class="icon-checkmark" style="padding: 3px;"></span><span>DONE</span>');
			self.$btnNext.removeClass("btn-primary").addClass("btn-secondary");
		} else {
			self.isLastSlide = false;
			self.$btnNext.html('<span class="icon-arrow-right" style="padding: 3px;"></span><span>NEXT</span>');
			self.$btnNext.removeClass("btn-secondary").addClass("btn-primary");
		}
	});
	
	this.$btnNext.on("click", function() {
		if(self.isLastSlide) {
			window.app.currentUser.setTutorial(true);
					 
			//csantos: emit a pub/sub event
			window.app.pubSub.publish("/user/change");
					 
			window.app.setController("select");
		} else {
			self.$carousel.carousel('next');
		}
	});
	
	this.$btnPrevious.on("click", function() {
		self.$carousel.carousel('prev');
	});
	
	this.$btnSkip.on("click", function() {
		window.app.currentUser.setTutorial(true);
					 
		//csantos: emit a pub/sub event
		window.app.pubSub.publish("/user/change");
		
		window.app.setController("select");
	});
};

TutorialController.prototype.bindCurrentEvents = function() {
};
