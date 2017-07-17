/* PlayerController */

function PlayerController(param)
{
	//this.modelName = "player";
	
	this.view = {
		path: "views/pages/player.html",
		type: "body",
		previous: "select"
	};
	
	this.player = null;
	
	this.iddleAudio = null;
	
	//csantos: if != 0, move to the option setted here
	this.moveForward = 0;
	
	this.world = (param && param.world) ? param.world : "outer";
	this.chapterNumber = (param && param.chapter) ? param.chapter : null;
	
	MainController.call(this);
};

//csantos: inherit MainController
PlayerController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
PlayerController.prototype.constructor = PlayerController;

//csantos: action after page finished loading
PlayerController.prototype.onLoadPage = function()
{
	this.chapter = this.getChapter();
	this.enableBackButton = this.getBackButton();
	
	if(this.world === "outer") {
		this.saveCurrentChapter();
	}
	
	this.cacheDOM();
	
	if(!this.chapter.soon) {
		this.setIddleAudio();
		this.loadCoverImage();
		this.createButtonOptions();
		this.createPlayer();
		this.bindCurrentEvents();
		this.fixCoverHeight();
	} else {
		this.showWarningMessage();
	}
	
	this.showLoading(false);
};

PlayerController.prototype.cacheDOM = function() {
	this.$cover = $("#cover");
	this.$content = $("#content");
	this.$container = $("#container-options");
	this.$question = $("#question");
	this.$btnReturnToPrevious = $("#returnToPrevious");
	//this.$btnForwardToNext = $("#forwardToNext");
	this.$modalInnerWorld = $("#modalInnerWorld");
	this.$meditationTitle = $("#meditation-title");
	
	this.playerContainer = "#cp_container_1";
};

PlayerController.prototype.bindCurrentEvents = function() {
	var self = this;
	
	this.$container.on("click", "button", this.handleUserChoice.bind(this));
	
	this.$btnReturnToPrevious.on("click", this.returnToPreviousAudio.bind(this));
	//this.$btnForwardToNext.on("click", this.forwardToNextAudio.bind(this));
	
	//csantos: subscribe to event stop to toggle options after audio is played
	window.app.pubSub.subscribe("/player/stop", this, this.toggleOptions.bind(this));
	
	//csantos: subscribe to event play to pause iddle audio when regular audio is played again
	window.app.pubSub.subscribe("/player/play", this, this.pauseIddleAudio.bind(this));
};

PlayerController.prototype.fixCoverHeight = function() {
	var contentHeight = this.$content.outerHeight(true);
	this.$cover.css("height", "calc(100% - " + contentHeight + "px)");
	//$("body").animate({ scrollTop: $(document).height() - $(window).height() }, 500, 'swing');
};

//csantos: get current chapter (depending of the current world)
PlayerController.prototype.getChapter = function() {
	if(this.chapterNumber === null) {
		this.chapterNumber = window.app.currentUser.getCurrentChapter();
	}
	
	if(this.world === "inner") {
		return window.app.innerWorld.getChapter(this.chapterNumber);
	}
	
	return window.app.outerWorld.getChapter(this.chapterNumber);
};

//csantos: get information to check if back button is enabled or disabled (depending of the current world)
PlayerController.prototype.getBackButton = function() {
	if(this.world === "inner") {
		return false;
	}
	
	return !window.app.currentUser.getIsReturning();
};

PlayerController.prototype.handleUserChoice = function(e) {
	//csantos: user selected this option previously
	var $currentButton = $(e.target).closest("button");
	
	if($currentButton.hasClass("active")) {
		
		if($currentButton.data("romantic") !== null && $currentButton.data("romantic") !== undefined) {
			window.app.currentUser.setRomanticInterest($currentButton.data("romantic"));
		}
		
		this.changeChapter($currentButton.attr("id"));
	} else {
		//this.$question.html("TAP AGAIN TO CONFIRM");
		this.$question.children().first().addClass("flip__item--active");
		$currentButton.siblings().removeClass("active");
		$currentButton.addClass("active");
	}
};

PlayerController.prototype.saveCurrentChapter = function() {
	if(this.chapter.id !== window.app.currentUser.getCurrentChapter()) {
		window.app.currentUser.setCurrentChapter(this.chapter.id);
		
		//csantos: emit a pub/sub event
		window.app.pubSub.publish("/user/change");
	}
};

PlayerController.prototype.savefinishListening = function(finishListening) {
	if(finishListening !== window.app.currentUser.getFinishListening()) {
		window.app.currentUser.setFinishListening(finishListening);
		
		//csantos: emit a pub/sub event
		window.app.pubSub.publish("/user/change");
	}
};

PlayerController.prototype.showWarningMessage = function() {
	$('<div/>', {
	  class: 'd-flex flex-column justify-content-center align-items-center',
	  html: '<h2 class="pt-1 text-center">Coming soon!</h2>'
		  + '<p class="text-center">Stay tuned for more updates<br>OR</p>'
		  + '<button class="mt-2 btn btn-secondary icon-reverse" style="width: 175px">'
		  +     '<span class="icon-spinner11"></span>'
	      + '</button>'
	}).on("click", ".btn", this.returnToPreviousAudio.bind(this)).appendTo(this.$container);
};

PlayerController.prototype.loadCoverImage = function() {
	this.$cover.css("background-image", "url(" + this.chapter.image + ")");
};

PlayerController.prototype.createButtonOptions = function()
{
	var self = this, disabled = "hidden-xs-up";
	
	if(window.app.currentUser.getFinishListening()) {
		disabled = "";
	}
	
	//csantos: if there is options, then load them
	if(this.chapter.options.length > 0) {
		
		//csantos: check if options are not from tomantic/non romantic interest type
		if(disabled === "" && this.chapter.options[0].id !== -1) {
			this.$question.removeClass("hidden-xs-up");
		}
		
		$.each(this.chapter.options, function(index, option) {
			//csantos: if option id == -1, then it's a choice based on a romantic interest
			if(option.id === -1) {
			   
			   //csantos: option and saved information should be aligned with each other to set moveForward variable
			   if(option.romanticInterest && window.app.currentUser.getRomanticInterest()) {
				   self.moveForward = option.moveTo;
			   } else if(!option.romanticInterest && !window.app.currentUser.getRomanticInterest()) {
				   self.moveForward = option.moveTo;
			   }
			//csantos: it's a regular option
			} else {
			   
			   var romantic = (self.chapter.id === 1) ? option.romanticInterest : null;
			   
			   $("<button/>", {
					id: option.id,
					"data-romantic": romantic,
					type: "button",
					class: "btn btn-primary btn-options " + disabled,
					html: option.label
				}).appendTo(self.$container);
			}
		});
	}
	
	if(this.enableBackButton && this.chapter.id > 1) {
		this.$btnReturnToPrevious.removeAttr("disabled");
		this.$btnReturnToPrevious.removeClass("hidden-xs-up");
		/*$("<button/>", {
			id: "returnToPrevious",
			type: "button",
			class: "btn btn-primary btn-options " + disabled,
			html: "I want to go back and choose a different option"
		}).appendTo(self.$container);*/
	} else {
		this.$btnReturnToPrevious.removeClass("hidden-xs-up");
	}
};

PlayerController.prototype.toggleOptions = function() {
	
	if(this.world === "outer") {
		
		//csantos: show message to say user unlocked an Inner World experience
		if(this.chapter.innerWorld) {
			
			//csantos: check if audio was already unlocked and message was already shown
			var isNew = window.app.currentUser.getInnerWorldPath(this.chapter.innerWorld.id);
			
			if(isNew === null) {
				this.$meditationTitle.html(this.chapter.innerWorld.title);
				this.$modalInnerWorld.modal("show");
				window.app.currentUser.setInnerWorldPath(this.chapter.innerWorld.id, this.chapter.innerWorld.title);
			}
		}
		
		//csantos: user finished listening this chapter
		//there is no need to make him listem to it again to show options, that's why we are saving it
		this.savefinishListening(true);
		
		//csantos: if there are options available and none of them are based on a romantic interest, then show them
		if(this.chapter.options.length > 0 && this.moveForward === 0) {
			this.playIddleAudio();
			this.$question.removeClass("hidden-xs-up");
			this.$container.find("button").removeClass("hidden-xs-up");
			this.fixCoverHeight();
		} else {
			
			//csantos: options are based on a romantic interest
			if(this.moveForward !== 0) {
				this.changeChapter(this.moveForward);
				
			//csantos: there are no options
			} else {
				this.changeChapter();
			}
		}
	}
};

PlayerController.prototype.createPlayer = function() {
	var self = this;
	
	$(this.playerContainer).removeClass("hidden-xs-up");

	if(device.platform.toLowerCase() === "android") {
        var expansionPath = this.chapter.file.split("/");
        this.chapter.file = "content://com.navigate.thegame/" + expansionPath[expansionPath.length - 2] + "/" + expansionPath[expansionPath.length - 1];
	}

	this.player = new CirclePlayer("#jquery_jplayer_1", { mp3: self.chapter.file }, {
		cssSelectorAncestor: this.playerContainer,
		autoplay: true
	});

};

PlayerController.prototype.setIddleAudio = function() {

    if(device.platform.toLowerCase() === "android") {
        this.iddleAudio = new Audio("content://com.navigate.thegame/OuterWorld/Loop.mp3");
    } else {
        this.iddleAudio = new Audio("views/audio/OuterWorld/Loop.mp3");
    }
	
	this.iddleAudio.addEventListener("ended", this.resetIddleAudio, false);
};

PlayerController.prototype.resetIddleAudio = function() {
	this.currentTime = 0;
	this.play();
};

PlayerController.prototype.playIddleAudio = function() {
	if(this.iddleAudio) {
		this.iddleAudio.play();
	}
};

PlayerController.prototype.pauseIddleAudio = function() {
	if(this.iddleAudio) {
		this.iddleAudio.pause();
	}
};

PlayerController.prototype.stopIddleAudio = function() {
	if(this.iddleAudio) {
		this.iddleAudio.pause();
		
		//csantos: prevent memory leaks
		this.iddleAudio.removeEventListener("ended", this.resetIddleAudio);
		this.iddleAudio = null;
	}
};

PlayerController.prototype.changeChapter = function(chapter) {
	if(!this.chapter.end) {
		var nextChapter = (chapter && chapter !== "") ? Number(chapter) : this.chapter.id + 1;
		
		//csantos: avoid double click
		$(this).addClass("disabled");
		
		//csantos: save current user information
		window.app.currentUser.setIsUserNew(false);
		window.app.currentUser.setCurrentChapter(nextChapter);
		window.app.currentUser.setFinishListening(false);
		window.app.currentUser.setIsReturning(false);
		window.app.currentUser.setOuterWorldPath(this.chapter.id, this.chapter.title, this.chapter.number);
		
		//csantos: emit a pub/sub event
		window.app.pubSub.publish("/user/change");
		
		//csantos: change chapter
		window.app.setController("player");
	}	
};

PlayerController.prototype.returnToPreviousAudio = function() {
	var previousPathData = window.app.currentUser.getOuterWorldPath(window.app.currentUser.getOuterWorldPath().length - 1);
	
	window.app.currentUser.setCurrentChapter(previousPathData.id);
	window.app.currentUser.setFinishListening(true);
	window.app.currentUser.setIsReturning(true);
	window.app.currentUser.removePreviousOuterWorldPath();
	
	window.app.setController("player", false, true);
};

PlayerController.prototype.clear = function() {
	//csantos: stop iddle audio
	this.stopIddleAudio();
	this.$container.off();
	
	//csantos: unsubscribe to events to not trigger it more than once
	window.app.pubSub.unsubscribe("/player/stop", this, this.toggleOptions.bind(this));
	
	//csantos: unsubscribe to events to not trigger it more than once
	window.app.pubSub.unsubscribe("/player/play", this, this.pauseIddleAudio.bind(this));
};
