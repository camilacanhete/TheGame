/* User API. */

function User()
{
	//csantos: id - used to save information on device folder
	this.id = this.setId();
	
	//csantos: set if user is new or not
	this.isNew = true;
	
	//csantos: current save filename
	this.name = "";
	
	//csantos: current user chapter
	this.currentChapter = 1;
	
	//csantos: if user has finish listening this chapter or needs to listening to it yet
	this.finishListening = false;
	
	//csantos: check if user is returnin from a further choice and wants to listen again
	this.isReturning = false;
	
	//csantos: check if user alrady finished tutorial
	this.finishedTutorial = false;
	
	//csantos: decisions made for the outer world
	this.outerWorldPath = [];
	
	//csantos: decisions made for the inner world
	this.innerWorldPath = [{ id: 1, title: "Intro" }];
	
	//csantos: last saved date/hour in a timestamp format
	this.timestamp = null;
	
	//csantos: set user's relationship preference with Matthew (just friends or romantic interest)
	this.romantic = false;
};

//csantos: set/get user data
User.prototype.setData = function(data) {
	this.id = data.id;
	this.isNew = data.isNew;
	this.name = data.name;
	this.finishedTutorial = data.finishedTutorial;
	this.currentChapter = data.currentChapter;
	this.finishListening = data.finishListening;
	this.isReturning = data.isReturning;
	this.outerWorldPath = data.outerWorldPath;
	this.innerWorldPath = data.innerWorldPath;
	this.timestamp = data.timestamp;
	this.romantic = data.romantic;
	
	console.log("setData: current user is:");
	console.log(data);
};

User.prototype.getData = function() {
	this.timestamp = new Date().getTime();
	
	var data = {
		id: this.id,
		isNew: this.isNew,
		name: this.name,
		finishedTutorial: this.finishedTutorial,
		currentChapter: this.currentChapter,
		finishListening: this.finishListening,
		isReturning: this.isReturning,
		outerWorldPath: this.outerWorldPath,
		innerWorldPath: this.innerWorldPath,
		timestamp: this.timestamp,
		romantic: this.romantic
	}
	
	return data;
};

//csantos: set/get id
User.prototype.setId = function() {
	return (Math.random() + 1).toString(36).substring(7);
};

User.prototype.getId = function() {
	return this.id;
};

//csantos: set/get new user info
User.prototype.setIsUserNew = function(isNew) {
	this.isNew = isNew;
};

User.prototype.getIsUserNew = function() {
	return this.isNew;
};

//csantos: set/get finished tutorial
User.prototype.setTutorial = function(finished) {
	this.finishedTutorial = finished;
};

User.prototype.getTutorial = function() {
	return this.finishedTutorial;
};

//csantos: set/get user name
User.prototype.setName = function(name) {
	this.name = name;
};

User.prototype.getName = function() {
	return this.name;
};

//csantos: set/get romantic interest
User.prototype.setRomanticInterest = function(interest) {
	this.romantic = interest;
};

User.prototype.getRomanticInterest = function() {
	return this.romantic;
};

//csantos: set/get timestamp
User.prototype.setTimestamp = function(timestamp) {
	this.timestamp = timestamp;
};

User.prototype.getTimestamp = function() {
	return this.timestamp;
};

//csantos: set/get current chapter
User.prototype.setCurrentChapter = function(chapter) {
	
	if(chapter !== this.currentChapter) {
		this.currentChapter = chapter;
	}
};

User.prototype.getCurrentChapter = function() {
	return this.currentChapter;
};

//csantos: set/get finish listening
User.prototype.setFinishListening = function(finished) {
	
	if(finished !== this.finishListening) {
		this.finishListening = finished;
	}
};

User.prototype.getFinishListening = function() {
	return this.finishListening;
};

//csantos: set/get is returning
User.prototype.setIsReturning = function(isReturning) {
	
	if(isReturning !== this.isReturning) {
		this.isReturning = isReturning;
	}
};

User.prototype.getIsReturning = function() {
	return this.isReturning;
};

//csantos: set/get outer world path
User.prototype.setOuterWorldPath = function(id, title, number) {
	
	//csantos: check if current chapter is already there
	var index = this.outerWorldPath.map(function(o) { return o.id; }).indexOf(id);
	
	if(index === -1) {
		this.outerWorldPath.push({
			id: id,
			title: title,
			number: number
		});
	} else {
		//csantos: only update chapter if it's already there
		this.outerWorldPath[index].title = title;
		this.outerWorldPath[index].number = number;
		this.outerWorldPath[index].isReturning = false;
	}
};

User.prototype.getOuterWorldPath = function(position) {
	if(position !== null && position !== undefined) {
		return this.outerWorldPath[position];
	}
	
	return this.outerWorldPath;
};

User.prototype.checkOuterWorldIndexPosition = function(id) {
	//csantos: check if id is already there
	var index = this.outerWorldPath.map(function(o) { return o.id; }).indexOf(id);
	
	return index;
};

User.prototype.removePreviousOuterWorldPath = function(items) {
	if(!items) {
		items = 1;
	}
	
	if(this.outerWorldPath > items) {
		this.outerWorldPath.splice(0, this.outerWorldPath.length - items);
	}
};

//csantos: set/get inner world path
User.prototype.setInnerWorldPath = function(id, title) {
	
	//csantos: check if current chapter is already there
	var index = this.innerWorldPath.map(function(o) { return o.id; }).indexOf(id);
	
	if(index === -1) {
		this.innerWorldPath.push({
			id: id,
			title: title
		});
	}
};

User.prototype.getInnerWorldPath = function(id) {
	if(id !== null && id !== undefined) {
		var position = this.innerWorldPath.map(function(o) { return o.id; }).indexOf(id);
		
		if(position !== -1) {
			return this.innerWorldPath[position];
		} else {
			return null;
		}
	}
	
	return this.innerWorldPath;
};

//csantos: return json object ready to be saved on user device
User.prototype.stringify = function() {
	
	console.log(this.getData());
	return JSON.stringify(this.getData());
};
