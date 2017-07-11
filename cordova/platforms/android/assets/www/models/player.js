/* PlayerModel */

function PlayerModel()
{
	MainModel.call(this);
};

//csantos: inherit MainModel
PlayerModel.prototype = new MainModel();

//csantos: correct the constructor pointer because it points to MainModel
PlayerModel.prototype.constructor = PlayerModel;

PlayerModel.prototype.getChapter = function(id)
{
};
