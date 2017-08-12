/* TimelineController */

function TimelineController(param)
{
	//this.modelName = "timeline";
	
	this.view = {
		path: "views/pages/timeline.html",
		type: "body",
		previous: "select"
	};
	
	this.world = (param && param.world) ? param.world : "outer";
	
	MainController.call(this);
};

//csantos: inherit MainController
TimelineController.prototype = new MainController();

//csantos: correct the constructor pointer because it points to MainController
TimelineController.prototype.constructor = TimelineController;

//csantos: action after page finished loading
TimelineController.prototype.onLoadPage = function()
{
	this.cacheDOM();
	this.bindCurrentEvents();
	this.renderTimeline();
	this.showLoading(false);
};

TimelineController.prototype.cacheDOM = function() {
	this.$timeline = $(".timeline");
	this.$btnProgress = $("#btn-continue-progress");
};

TimelineController.prototype.bindCurrentEvents = function() {
	var self = this;
	
	this.$btnProgress.on("click", $.proxy(self.openController, self, "player"));
	this.$timeline.on("click", ".timeline-panel.active", function() {
		var id = $(this).closest("li").attr("id");
		window.app.setController("player", true, { world: "inner", chapter: Number(id) });
	});
};

TimelineController.prototype.openController = function(controller)
{
	window.app.setController(controller, true, { world: this.world });
};

TimelineController.prototype.renderTimeline = function() {
	var self = this;
	var path = null;
	
	if(this.world === "outer") { //Outer World
		path = window.app.currentUser.getOuterWorldPath();
		
		this.$btnProgress.removeClass("hidden-xs-up");
		
		if(window.app.currentUser.getOuterWorldPath().length === 0) {
			this.$btnProgress.html("Start");
		}
		
		if(path.length > 0) {
			var chapterNumber = "", badge = "", btnContinue = "";
			$.each(path, function(index, chapter) {
				   
				   if(chapter.number && chapter.number !== "") {
					   badge = '<div class="timeline-badge">'+ chapter.number +'</div>';
					   chapterNumber = "Chapter " + chapter.number;
				   } else {
					   badge = "";
					   chapterNumber = "";
				   }
				   
				   /*if(index === path.length - 1) {
					   btnContinue = '<button type="button" class="btn btn-primary mt-6">Continue</button>';
				   }*/
				if(chapter.title !== "") {
					$("<li/>", {
					  id: chapter.id,
					  html:       badge
							+     '<div class="timeline-panel">'
							+         '<div class="timeline-heading">'
							+             '<h4 class="timeline-title">'+ chapterNumber +'</h4>'
							+         '</div>'
							+         '<div class="timeline-body">'
							+             '<p>'+ chapter.title +'</p>'
							+         '</div>'
							+     '</div>'
					}).appendTo(self.$timeline);
				}
			});
		}
		
		//csantos: append to give an effect of continuity
		/*$("<li/>", {
			html: '<div class="timeline-badge">?</div>'
				+     '<div class="timeline-panel">'
				+         '<div class="timeline-heading">'
				+             '<h4 class="timeline-title">???</h4>'
				+         '</div>'
				+         '<div class="timeline-body">'
				+             '<p></p>'
				+         '</div>'
				+     '</div>'
		}).appendTo(self.$timeline);*/
	} else { //Inner World
		path = window.app.currentUser.getInnerWorldPath();
		
		/*if(path.length > 0) {
			$.each(path, function(index, chapter) {
				$("<li/>", {
				  id: chapter.id,
				  html:       '<div class="timeline-badge"><span class="icon-unlocked"></span></div>'
						+     '<div class="timeline-panel active">'
						+         '<div class="timeline-body">'
						+             '<p>'+ chapter.title +'</p>'
						+         '</div>'
						+     '</div>'
				}).appendTo(self.$timeline);
			});
		}*/
		
		$.each(window.app.innerWorld.getData(), function(index, chapter) {
			   
			var chapterUnlocked = path.filter(function(savedChapter){ return savedChapter.id === chapter.id });
			   
			console.log("Chapter " + chapter.id + ":");
			console.log(chapterUnlocked);
			   
			if(chapterUnlocked.length === 0) {
				$("<li/>", {
					html: '<div class="timeline-badge"><span class="icon-lock"></span></div>'
						+     '<div class="timeline-panel">'
						+         '<div class="timeline-body">'
						+             '<p>Technology Enhanced Meditation Locked</p>'
						+         '</div>'
						+     '</div>'
				}).appendTo(self.$timeline);
			}
			else {
				chapterUnlocked = chapterUnlocked[0];
			   
				$("<li/>", {
				  id: chapterUnlocked.id,
				  html:       '<div class="timeline-badge"><span class="icon-unlocked"></span></div>'
						+     '<div class="timeline-panel active">'
						+         '<div class="timeline-body">'
						+             '<p>'+ chapterUnlocked.title +'</p>'
						+         '</div>'
						+     '</div>'
				}).appendTo(self.$timeline);
			}
			
			/*if(index > path.length - 1) {

			   
				$("<li/>", {
					html: '<div class="timeline-badge"><span class="icon-lock"></span></div>'
						+     '<div class="timeline-panel">'
						+         '<div class="timeline-body">'
						+             '<p>Technology Enhanced Meditation Locked</p>'
						+         '</div>'
						+     '</div>'
				}).appendTo(self.$timeline);
			}*/
		});
	}
};
