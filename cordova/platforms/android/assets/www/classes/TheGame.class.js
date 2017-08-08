/* TheGame is the main class. */

//csantos: current context - 'this' is the TheGame object
function TheGame()
{
    // csantos: SET DEVELOPMENT OR PRODUCTION PROFILE
    this.production = false;
    
    //csantos: check if app is running in browser or device
    this.isDesktopBrowser = !this.isMobileBrowser();
    
    //csantos: current load state
    this.loading = false;
    
    //csantos: current controller
    this.controller = null;
	
	//csantos: check if a file is being written
	this.isBeingWritten = false;
	
	//csantos: push notification global var
	this.push = null;
	
	//csantos: subscribed events from the pub/sub pattern. please, check function pubSubHandler
	this.pubSub = this.pubSubHandler();
	
	//csantos: array of users stored on device
	this.userAccounts = [];
	
	//csantos: current user logged in
	this.currentUser = new User();
	
	//csantos: outer world
	this.outerWorld = new OuterWorld();
	
	//csantos: inner world
	this.innerWorld = new InnerWorld();
	
    if ( !this.isDesktopBrowser )
    {
		console.log("This is a Mobile Browser");
		
        //csantos: check if device is ready to load content. most plugins won't work before that
        document.addEventListener('deviceready', this.deviceReady.bind(this), false);
    }
    else
    {
		console.log("This is a Desktop Browser");
		this.deviceReady();
    }
};

//csantos: check if this browser is mobile
TheGame.prototype.isMobileBrowser = function() {
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		return true;
	}
	
	return false;
};

//csantos: binding events as soon as the device is ready
TheGame.prototype.deviceReady = function()
{
    var self = this;
	this.outerWorld.init();
	this.innerWorld.init();
	
	setTimeout(function() {
		if (!self.isDesktopBrowser) {
			self.allowScreenToKeepAwake();
			self.setPushNotification();
		}
			   
		self.watchCurrentUser();
		self.getFileSystem();
			   
	}, 500);
};

//csantos: keep screen awake
TheGame.prototype.allowScreenToKeepAwake = function() {
	window.plugins.insomnia.keepAwake();
};

TheGame.prototype.downloadExpansionFile = function() {
	
	if(device.platform.toLowerCase() === "android") {
		// XAPKReader will only be defined (and should only be invoked) for the Android platform
		if (window.XAPKReader) {
			window.XAPKReader.downloadExpansionIfAvailable(function () {
				console.log("Expansion file check/download success.");
			}, function (err) {
				console.log(err);
				throw "Failed to download expansion file.";
			});
		}
	}
}

//csantos: set pub/sub pattern
TheGame.prototype.pubSubHandler = function() {
	
	return {
		events: {},
		subscribe: function (eventName, object, callback) {
			this.events[eventName] = this.events[eventName] || [];
			this.events[eventName].push({object: object, callback: callback});
		},
		unsubscribe: function(eventName, object, callback) {
			if (this.events[eventName]) {
				for (var i = 0; i < this.events[eventName].length; i++) {
					if (this.events[eventName][i].object === object) {
					  this.events[eventName].splice(i, 1);
					  break;
					}
				};
			}
		},
		publish: function (eventName, data) {
			if (this.events[eventName]) {
				this.events[eventName].forEach(function(instance) {
					instance.callback(data);
				});
			}
		}
	};
};

//csantos: util
TheGame.prototype.sanitizeURL = function(url, protocol)
{
    var sanitized = url
               .replace(/^file\:\/\//, '') // remove the leading file:// (temporarily)
               .replace(/\/+/g, '/')       // replace consecutive slashes with a single slash
               .replace(/\/+$/, '');       // remove trailing slashes

    switch(protocol)
    {
        case 'file':
            url = 'file://' + sanitized;
        break;
        default:
            url = sanitized;
        break;
    }
    
    return url;
};
						
//csantos: watch current user variable to see if there was changes on it
TheGame.prototype.watchCurrentUser = function() {
	var self = this;
						
	this.pubSub.subscribe("/user/change", this, function() {
		self.saveLocalUserData();
	});
};
						
//csantos: set push notification
TheGame.prototype.setPushNotification = function()
{
    var self = this;
    
    try
    {
		if(device.platform.toLowerCase() === "ios") {
			FirebasePlugin.grantPermission();
		}

		FirebasePlugin.getToken(function(token) {
			//used to push notifications to this device
			console.log("TOKEN: " + token);
		}, function(error) {
		    console.log("setPushNotification: getToken:");
		    console.log(error);
		});
						
		FirebasePlugin.onNotificationOpen(function(notification) {
			//console.log(notification);
			var $modal = $("#modalNotification");
			
			$modal.find(".modal-title").html(notification.aps.alert);
			$modal.find(".modal-message").html(notification["google.c.a.c_l"]);
			$modal.modal('show');
		}, function(error) {
		    console.log("setPushNotification: onNotificationOpen:");
            console.log(error);
		});
    }
    catch(err)
    {
		this.onFail(err);
		console.log("setPushNotification");
        console.log(error);
    }
};

//csantos: request file system is important to save user info on device
TheGame.prototype.getFileSystem = function()
{
	//csantos: user is on a desktop browser
	if(this.isDesktopBrowser) {
						
		this.onFileSystem();
						
	//csantos: user is on a mobile browser
	} else {
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0,
			$.proxy(this.onFileSystem, this),
			function(error) {
				console.log("getFileSystem failed:");
				console.log(error);
			});
	}
};

//csantos: load file system to set, get and update user accounts.
TheGame.prototype.onFileSystem = function(filesystem)
{
	console.log("onFileSystem: got filesystem");
	
	this.getLocalDirectory();
};

//csantos: check if a folder already exists and create a new one if doesn't
TheGame.prototype.getLocalDirectory = function()
{
	var self = this;
	
	//csantos: user is on a desktop browser
	if(this.isDesktopBrowser) {
		
		//csantos: clean stored user accounts
		this.userAccounts = [];
		
		//csantos: get local user account stored on localStorage
		this.getLocalUserAccounts("TheGame");
						
	//csantos: user is on a mobile browser
	} else {
						
		var url = cordova.file.dataDirectory;
						
		//csantos: window.resolveLocalFileSystemURL() is necessary to android
		window.resolveLocalFileSystemURL(url, function(oEntry)
		{
			console.log("getLocalDirectory: " + oEntry.toURL());
										 
			oEntry.getDirectory("Data", { create: true }, function(dirEntry)
			{
				var directoryReader = dirEntry.createReader();
								
				//csantos: clean stored user accounts
				self.userAccounts = [];

				//csantos: get a list of all user accounts in the directory
				directoryReader.readEntries(
					$.proxy(self.getLocalUserAccounts, self),
					$.proxy(self.onFail, self, 'getLocalDirectory failed: unable to read entries')
				);
			},
			function()
			{
				//csantos: there is no data folder yet
				console.log("getLocalDirectory: There is no data folder yet and something went wrong when creating one.");
				$.proxy(self.onFail, self, 'getLocalDirectory failed: unable to create a new directory')
			});
		}, $.proxy(self.onFail, self, 'getLocalDirectory failed: unable to resolve local filesystem'));
	}
};

//csantos: get all user accounts saved on device
TheGame.prototype.getLocalUserAccounts = function(directory, counter)
{
    var self = this;
	
	//csantos: user is on a desktop browser
	if(this.isDesktopBrowser) {
		
		var user = new User();
		
		if(window.localStorage.getItem(directory) !== null && window.localStorage.getItem(directory) !== undefined) {
			
			console.log(JSON.parse(window.localStorage.getItem(directory)));
			
			var storedUsers = JSON.parse(window.localStorage.getItem(directory));
						
			for(var i in storedUsers) {
				//csantos: verify saved user accounts
				console.log("getLocalUserAccounts: Verified user accounts");
				console.log(storedUsers[i]);
				
				user = new User();
				user.setData(storedUsers[i]);
						
				this.userAccounts.push(user);
			}
						
			//csantos: load most recent user on currentUser
			this.loadUserInfo();
						
			//csantos: nothing else to do. call controller
			this.initController();
						
		} else {
			console.log("getUserAccounts: User is new.");
			
			this.currentUser.setIsUserNew(true);
			
			//csantos: nothing else to do. download expansion file and call controller
			this.downloadExpansionFile();
			this.initController();
		}
						
	//csantos: user is on a mobile browser
	} else {
						
		var url = cordova.file.dataDirectory + "/Data";
						
		if(directory.length > 0)
		{
			if(counter === undefined) { counter = 0; }
			if(counter >= directory.length)
			{
				this.currentUser.setIsUserNew(false);
				
				//csantos: nothing else to do. call controller
				this.initController();
				
				return;
			}
							
			if(directory[counter].name.indexOf("USER_") != -1)
			{
				window.resolveLocalFileSystemURL(url, function(oEntry)
				{
					oEntry.getDirectory(directory[counter].name, { create: false }, function(dirEntry)
					{
						console.log("getUserAccounts: found directory " + directory[counter].name);
										
						var directoryReader = dirEntry.createReader();
			
						//csantos: get a list of all data (images and files included) in the directory
						directoryReader.readEntries(
							$.proxy(self.getLocalUserData, self),
							$.proxy(self.onFail, self, 'getLocalUserAccounts failed: unable to read account files')
						);
					
						counter = counter + 1;
						
						self.getLocalUserAccounts(directory, counter);
						
					},
					function()
					{
						//csantos: there is no data folder yet
						console.log("getUserAccounts: There is no user folder yet.");
					});
					
				}, $.proxy(self.onFail, self, 'getLocalUserAccounts failed: unable to resolve filesystem'));
			}
		}
		else
		{
			console.log("getUserAccounts: User is new.");
			
			this.currentUser.setIsUserNew(true);
			
			//csantos: nothing else to do. download expansion file and call controller
			this.downloadExpansionFile();
			this.initController();
		}
	}
};

//csantos: get user data from json file
TheGame.prototype.getLocalUserData = function(directory)
{
    for (i in directory)
    {
        if(directory[i].name.indexOf("json") != -1)
        {
            directory[i].file(
                $.proxy(this.loadLocalUserData, this),
                $.proxy(this.onFail, this, 'getLocalUserData failed: unable to access file')
            );
        }
    }
};

//csantos: push user data into array
TheGame.prototype.loadLocalUserData = function(file)
{
    var self = this;
	var reader = new FileReader();
	var user = new User();
	
	reader.onloadend = function(evt)
	{
		user.setData(JSON.parse(evt.target.result));
									 
		self.userAccounts.push(user);
						
		//csantos: verify saved user accounts
		console.log("loadLocalUserData: Verified user account");
		console.log(evt.target.result);
						
		//csantos: load most recent user on currentUser
		self.loadUserInfo();
	};
	
	reader.readAsText(file);
};
						
//csantos: verify which user was saved last and then load user information on currentUser
TheGame.prototype.loadUserInfo = function() {
	
	if(this.userAccounts.length > 1) {
						
		//csantos: search for most recent user
		var timestamp = null, recent = -1;
		for(var i = 0; i < this.userAccounts.length; i++) {
			if(i === 0 || this.userAccounts[i].getTimestamp() > timestamp) {
				timestamp = this.userAccounts[i].getTimestamp();
				recent = i;
			}
		}
		
		this.currentUser = this.userAccounts[recent];
		
	} else {
		this.currentUser = this.userAccounts[0];
	}
};
						
//csantos: request to save user locally
TheGame.prototype.saveLocalUserData = function(user_id)
{
	var self = this;
						
    if(!user_id)
    {
        user_id = this.currentUser.getId();
    }
						
	console.log("saveLocalUser: user id is " + user_id);

	//csantos: user is on a desktop browser
	if(this.isDesktopBrowser) {
		
		//csantos: check if local storage is available to save persistent data
		if(typeof(window.localStorage) !== "undefined") {
			
			var userFound = false;
					
			//csantos: loop through all user accounts
			for (var i = 0; i < this.userAccounts.length; i++)
			{
				console.log("user account id: " + this.userAccounts[i].getId());
				console.log("current user id: " + this.currentUser.getId());
						
				if(this.userAccounts[i].getId() === this.currentUser.getId())
				{
					userFound = true;
						
					//csantos: update userAccounts array with most recent info from current user
					this.userAccounts[i] = this.currentUser;
						
					console.log("user found is true! user length is " + this.userAccounts.length);
						
					break;
				}
			}
			
			//csantos: if current user wasn't found on userAccounts array...
			if(!userFound) {
				//csantos: push current user information on users account array
				this.userAccounts.push(this.currentUser);
						
				console.log("user found is false! user length is " + this.userAccounts.length);
			}
			
			//csantos: build JSON object to save on localStorage
			var jSONObject = {};
						
			for(var j = 0; j < this.userAccounts.length; j++) {
				jSONObject[this.userAccounts[j].getId()] = this.userAccounts[j].getData();
			}
			
			console.log("saveLocalUserData: Desktop data:");
			console.log(jSONObject[user_id]);
						
			//csantos: save user accounts on localStorage
			window.localStorage.setItem("TheGame", JSON.stringify(jSONObject));
						
		} else {
			alert("Unable to save file on this browseer. Don't lose your progress, update your browser now!");
		}
	//csantos: user is on a mobile browser
	} else {

		var url = cordova.file.dataDirectory + "/Data";
						
		/* csantos: window.resolveLocalFileSystemURL() is necessary to android
		   create user directory if doesn't exists or load user directory */
		window.resolveLocalFileSystemURL(url, function(oEntry){
			
			//csantos: get user info directory (if exists)
			oEntry.getDirectory("USER_" + user_id, { create: false }, function(dirEntry)
			{
				var directoryReader = dirEntry.createReader();
				
				//csantos: debug
				console.log("saveLocalUser: directory found - " + url);

				//csantos: get a list of all data (images and files included) in the directory
				oEntry.getDirectory("USER_" + user_id, { create: true }, function(dirEntry)
				{
					if(!self.isBeingWritten) {
						self.isBeingWritten = true;
						oEntry.getFile("USER_" + user_id + "/info.json",
									   {create: true},
									   $.proxy(self.writeLocalUserData, self, user_id),
									   $.proxy(self.onFail, self, 'saveLocalUserData failed: unable to access file')
						);
					}
				},
				function(){
					//csantos: debug
					console.log("saveLocalUser: there was an error creating directory USER_" + user_id);
				});
			},
			function(){
				
				//csantos: There is no local user folder yet
				console.log("saveLocalUser: There is no user folder yet, so we are creating a new one.");
				
				self.newUser = true;
				self.userAccounts.push(self.currentUser);
				
				oEntry.getDirectory("USER_" + user_id, { create: true }, function(dirEntry)
				{
					if(!self.isBeingWritten) {
						self.isBeingWritten = true;
									
						oEntry.getFile("USER_" + user_id + "/info.json",
									   {create: true},
									   $.proxy(self.writeLocalUserData, self, user_id),
									   $.proxy(self.onFail, self, 'saveLocalUserData failed: unable to create and access file'));
					}
				},
				function(){
					//csantos: debug
					console.log("saveLocalUser: there was an error creating directory USER_" + user_id);
				});
			});
			
		}, $.proxy(self.onFail, self, 'saveLocalUserData failed: unable to resolve filesystem'));
						
	}
};

TheGame.prototype.writeLocalUserData = function(user_id, file)
{
    var self = this;
    
    file.createWriter(function(writer)
    {
        writer.onwriteend = function(e)
        {
            //csantos: success
			self.isBeingWritten = false;
            console.log("writeLocalUserData: User successfully saved!");
        }
        
        //csantos: if current user wasn't loaded properly on userAccounts array...
        if(user_id === self.currentUser.getId())
        {
			console.log(self.currentUser.stringify());
            writer.write(self.currentUser.stringify());
        }
        else
        {
            for (i in self.userAccounts)
            {
                if(self.userAccounts[i].getId() === user_id)
                {
                    writer.write(self.userAccounts[i].stringify());
                    break;
                }
            }
        }
        
    }, $.proxy(self.onFail, self, 'writeLocalUserData failed: unable to create writer'));
};
						
//csantos: general fail class
TheGame.prototype.onFail = function(element, description)
{
    var desc = description && description !== "" ? description : "";
						
	console.log(element);
	console.log(description);
	
    //csantos: show message to user
    alert("We got an error " + element);
};

//csantos: check if app is already running
TheGame.prototype.appIsReady = function()
{
    if(this.controller && !this.loading)
    {
        return true;
    }
    
    return false;
};

//csantos: the first controller to be loaded
TheGame.prototype.initController = function() {
	this.setController("header", true);
	this.setController("home");
};

//csantos: IMPORTANT! controller classes must be named 'PageController' and the file must be 'page.js'
TheGame.prototype.setController = function(controller, disableLoading, parameters)
{   
    if(disableLoading || (!disableLoading && !this.loading))
    {
        var self = this;
		
		if(!disableLoading) { this.loading = true; }
        
        //csantos: allowing app to initialize with other pages (universal links)
        if(!this.controller && !controller)
        {
            controller = "home";
        }
						
        console.log("setController: controllers/" + controller + ".js");
        
        $.getScript("controllers/" + controller + ".js")
        .done(function( script, textStatus )
        {
            //csantos: load dinamically the controller file
            var controller_name = controller.split("-");
            
            for (i in controller_name)
            {
                controller_name[i] = controller_name[i].charAt(0).toUpperCase() + controller_name[i].substring(1);
            }
            
            controller = controller_name.join("");
			  
			//csantos: clear previous controller to prevent memory leaks (remove event listeners too)
			if(self.controller) {
				self.controller.clear();
			}
			  
			//csantos: load new controller
            self.controller = new window[controller + "Controller"](parameters);
			self.controller.init();
			self.controller.showLoading(true);
			  
			//csantos: emit a pub/sub event
			self.pubSub.publish("/controller/change", controller.toLowerCase());
        })
        .fail(function( jqxhr, settings, exception )
        {
            console.log( "setController: Error loading controller " + controller + " - " + exception);
        });
    
    }
};
