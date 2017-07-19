/* HomeController */

function HomeController()
{
	//this.modelName = "home";
	
	this.view = {
		path: "views/pages/home.html",
		type: "body"
	};
	
	MainController.call(this);
};

//csantos: inherit MainController
HomeController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
HomeController.prototype.constructor = HomeController;

//csantos: action after page finished loading
HomeController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
	this.fixCoverHeight();
	this.loadUsersOnModal();
	this.showLoading(false);
};

HomeController.prototype.cacheDOM = function() {
	this.$cover = $("#cover");
	this.$content = $("#content");
	this.$btnContinue = $("#btn-continue");
	this.$btnNewGame = $("#btn-new-game");
	this.$btnCredits = $("#btn-credits");
	this.$btnStart = $("#btn-start");
	
	//input
	this.$name = $("#name");
	this.$nameHelpBlock = $("#nameHelpBlock");
	
	//modals
	this.$modalSaveGame = $("#modalSaveGame");
	this.$modalUsers = $("#modalUsers");
};

HomeController.prototype.bindCurrentEvents = function() {
	var self = this;
	
	this.$btnNewGame.on("click", this.openCreateModal.bind(this));
	this.$btnStart.on("click", this.createNewGame.bind(this));
	this.$btnCredits.on("click", this.openCredits.bind(this));
	this.$modalUsers.on("click", ".btn-secondary", this.changeUserAndContinue.bind(this));
	
	if(window.app.userAccounts.length > 0 || !window.app.currentUser.getIsUserNew()) {
		this.$btnContinue.removeClass("hidden-xs-up");
		this.$btnContinue.on("click", this.continueGame.bind(this));
	}
	
	this.$name.on("input propertychange", function(e)
    {
        switch(e.target.name)
        {
            case "name":
				if (/^[a-zA-Z0-9]*$/g.test($(this).val()) && $(this).val().length > 3) {
					self.$btnStart.removeAttr("disabled");
					self.$nameHelpBlock.addClass("hidden-xs-up");
				} else {
					self.$btnStart.attr("disabled", "disabled");
					self.$nameHelpBlock.removeClass("hidden-xs-up");
				}
			break;
		}
	});
};

HomeController.prototype.fixCoverHeight = function() {
	var contentHeight = this.$content.outerHeight(true);
	this.$cover.css("height", "calc(100% - " + contentHeight + "px)");
};

HomeController.prototype.openCreateModal = function() {
	this.$modalSaveGame.modal("show");
};

HomeController.prototype.createNewGame = function(e)
{
	e.preventDefault();
	
	var self = this, $buttonStart = $(e.target).closest("button");
	
	if(!$buttonStart.hasClass("disabled")) {
		
		this.$modalSaveGame.on("hidden.bs.modal", function() {
			window.app.currentUser = new User();
			window.app.currentUser.setName(self.$name.val());
			
			//csantos: emit a pub/sub event
			window.app.pubSub.publish("/user/change");
			
			window.app.setController("tutorial");
		});
		
		this.$modalSaveGame.modal("hide");
	}
};

HomeController.prototype.openCredits = function() {
	window.app.setController("credits");
};

HomeController.prototype.continueGame = function()
{
	if(window.app.userAccounts.length > 1) {
		this.$modalUsers.modal("show");
	} else {
		if(window.app.currentUser.getTutorial()) {
			window.app.setController("select");
		} else {
			window.app.setController("tutorial");
		}
		
	}
};

HomeController.prototype.loadUsersOnModal = function() {
	for(var i = 0; i < window.app.userAccounts.length; i++){
		
		var dateFormat = new Date(window.app.userAccounts[i].getTimestamp());

		this.$modalUsers.find(".modal-body").append('<button id="'+ i +'"class="form-control btn btn-secondary mt-5">'+ window.app.userAccounts[i].getName() +'<br><small class="mt-3">Last saved: '+ (dateFormat.getUTCMonth() + 1) + '/' + dateFormat.getUTCDate() + '/' + dateFormat.getUTCFullYear() + ' ' + dateFormat.getUTCHours() + ':' + dateFormat.getUTCMinutes() + '</small></button>');
	}
};

HomeController.prototype.changeUserAndContinue = function(e) {
	var position = Number($(e.target).closest("button").attr("id"));
	
	this.$modalUsers.on("hidden.bs.modal", function() {
		window.app.currentUser = window.app.userAccounts[position];
		
		if(window.app.currentUser.getTutorial()) {
			window.app.setController("select");
		} else {
			window.app.setController("tutorial");
		}
	});

	this.$modalUsers.modal("hide");
};
