/* MainController is the parent class of controllers. */

function MainController()
{
    this.model = null;
};

//csantos: init controller with view and model
MainController.prototype.init = function()
{
    this.loadView();
    this.loadModel();
};

//csantos: load the view and then bind events
MainController.prototype.loadView = function()
{
    var self = this;
	var $container = null;
	
	if(this.view) {
		switch(this.view.type) {
			case "header":
				$container = $("#header");
			break;
			case "body":
				$container = $("#body");
			break;
			case "footer":
				$container = $("#footer");
			break;
		}
		
		$.get(this.view.path, function(data) {
			  
			/* csantos: remove all content except loading screen */
            $container.contents().filter(function () {
                return this.id != "loading-screen";
            }).remove();
			  
			$container.append(data);
			  
			if(self.header)
			{
				if(self.header.css) {
					$("#header").css(self.header.css);
				}
			  
				if(self.header.back) {
					if(self.header.back.display)
					{
						$(".header__btn-back").removeClass("invisible");
						$(".header__logo").addClass("header__logo--sm");
					}
					else {
						$(".header__btn-back").addClass("invisible");
						$(".header__logo").removeClass("header__logo--sm");
					}
				}
			}
			  
			self.bindEvents();
		});
	}
};

//csantos: load the model if exists
MainController.prototype.loadModel = function()
{
	var self = this;
	
	if(this.modelName)
	{
		var model_name = this.modelName;
		this.modelName = null;
		
		console.log("setModel: models/" + model_name + ".js");
		
		$.getScript("models/" + model_name + ".js")
        .done(function( script, textStatus )
        {
            //csantos: load dinamically the controller file
            model_name = model_name.split("-");
            
            for (i in model_name)
            {
                model_name[i] = model_name[i].charAt(0).toUpperCase() + model_name[i].substring(1);
            }
            
            model_name = model_name.join("");
            
            self.model = new window[model_name + "Model"]();
            self.model.setController(self);
            
        })
        .fail(function( jqxhr, settings, exception )
        {
            console.log( "setModel: Erro ao carregar model " + model_name + " - " + exception );
        });
	}
};

//csantos: bindEvents into window instead of document for android
MainController.prototype.bindEvents = function()
{
    var self = this;
    
    //csantos: unbind events to force controller's update
    $( window ).unbind();
    
    //csantos: remove old document listeners
    document.removeEventListener("menubutton", self.androidBtnMenu);
    document.removeEventListener("backbutton", self.androidBtnBack);
    
    //csantos: set timeout is the safest way to make sure plugins will be attached properly
    $( window ).ready(function() { setTimeout($.proxy(self.onLoadPage, self), 500) });
    
	//csantos: make app display correctly on landscape and portrait mode
	$( window ).bind("orientationchange resize", $.proxy(self.toggleOrientation, self));
	
    //csantos: android menu button pressed
    document.addEventListener("menubutton", self.androidBtnMenu, false);
    
    //csantos: android back button pressed
    document.addEventListener("backbutton", self.androidBtnBack, false);
	
	//csantos: handle zoom button close
	$("#zoomBtnClose").on("click", self.closeZoom);
    
    // csantos: this plugin creates a similar function of appendTo that replaces content instead
    $.fn.htmlTo = function(elem) {
        return this.each(function() {
            $(elem).html($(this).html());
        });
    }
};

MainController.prototype.onLoadPage = function()
{
};

MainController.prototype.toggleOrientation = function()
{
};

MainController.prototype.configMovements = function()
{
};

MainController.prototype.refreshList =  function()
{
};

//csantos: remove all objects and prevent memory leaks from controllers that need it
MainController.prototype.clear = function() {
};

MainController.prototype.androidBtnMenu = function(e)
{
	e.preventDefault();
};

MainController.prototype.androidBtnBack = function(e)
{
	e.preventDefault();
	
	if ($('.modal.in').length > 0)
	{
		console.log('androidBtnBack: page has modal opened');
		$('.modal.in').modal('hide');
	}
	else if($('.cmn-toggle-switch').hasClass('cmn-toggle-switch__htla active'))
	{
		console.log('androidBtnBack: page has no modal opened but there is a section to go back');
		$('#btn-toggle-navbar').trigger('click');		
	}
	else
	{
		console.log('androidBtnBack: page has no modal opened and no section to go back. exiting app');
		$("#modal-leave").modal({backdrop: 'static', keyboard: false});
	}
};

MainController.prototype.showLoading = function(show)
{
	if(show)
	{
		window.app.loading = true;
		$("#loading-screen").removeClass("hidden-xs-up");
	}
	else
	{
		$("#loading-screen").addClass("hidden-xs-up");
		window.app.loading = false;
	}
};

//csantos: android devices will call native applications so this function can be skipped for them
MainController.prototype.enableExternalLinks = function()
{
	$("a[target='_blank']").on("click", function(e){
		e.preventDefault();
        e.stopImmediatePropagation();
		window.open($(e.currentTarget).attr('href'), '_system', '');
	});
};

//csantos: check if user has internet connection
MainController.prototype.isConnected = function()
{
    if(window.app.isDesktopBrowser)
    {
        return true;
    }
    
    var networkState = navigator.connection.type;
    //alert(networkState);

    if(networkState == Connection.NONE || networkState == Connection.UNKNOWN)
    {
        return false;
    }
    else
    {
        return true;
    }
};

MainController.prototype.returnHome = function()
{
	window.app.setController('home');
};

