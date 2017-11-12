/* InnerWorld API. */

function InnerWorld()
{
	this.data = null;
};

//csantos: init class
InnerWorld.prototype.init = function() {
	var self = this;
	
	this.setData().then(function(res) {
		self.data = res;
		console.log(self.data);
	}).catch(function(err) {
		console.log(err);
	});
};

//csantos: set data from local database
InnerWorld.prototype.setData = function()
{
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: "../database/innerWorld.json",
			method: "GET",
			dataType: "json",
			success: function(res) {
				resolve(res);
			},
			error: function(err) {
				reject(err);
			}
		});
	});
};

InnerWorld.prototype.getData = function() {
	return this.data;
};

//csantos: get chapter
InnerWorld.prototype.getChapter = function(chapter) {
	var index = this.data.map(function(o) { return o.id; }).indexOf(chapter);
	
	return this.data[index];
};


//csantos: get title
InnerWorld.prototype.getTitle = function(chapter) {
	var index = this.data.map(function(o) { return o.id; }).indexOf(chapter);
	
	return this.data[index].title;
};
