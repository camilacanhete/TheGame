/* OuterWorld API. */

function OuterWorld()
{
	this.data = null;
};

//csantos: init class
OuterWorld.prototype.init = function() {
	var self = this;
	
	this.setData().then(function(res) {
		self.data = res;
		console.log(self.data);
	}).catch(function(err) {
		console.log(err);
	});
};

//csantos: set data from local database
OuterWorld.prototype.setData = function()
{
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: "../www/database/outerWorld.json",
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

OuterWorld.prototype.getData = function() {
	return this.data;
};

//csantos: get chapter
OuterWorld.prototype.getChapter = function(chapter) {
	var index = this.data.map(function(o) { return o.id; }).indexOf(chapter);
	
	return this.data[index];
};

