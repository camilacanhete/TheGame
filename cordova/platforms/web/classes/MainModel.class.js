/* MainModel is the parent class of models. */

function MainModel()
{
	this.controller = null;
};

//csantos: set parent controller
MainModel.prototype.setController = function(controller)
{
	this.controller = controller;
};

//csantos: make a network request
MainModel.prototype.networkRequest = function(url, method, contentType, headers, payload) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: url,
			method: method,
			headers: headers,
			data: payload,
			contentType: contentType,
			success: function(res) {
				resolve(res);
			},
			error: function(err) {
				reject(err);
			}
		});
	});
}

