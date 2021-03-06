
// classes

function TalkDefn(name, talkNodes)
{
	this.name = name;
	this.talkNodes = talkNodes;

	for (var i = 0; i < this.talkNodes.length; i++)
	{
		var talkNode = this.talkNodes[i];
		if (talkNode.defn.name == "label")
		{
			var label = talkNode.parameters[0];
			this.talkNodes[TalkNode.Underscore + label] = talkNode;
		}
	}
}

{
	TalkDefn.prototype.talkNodeByLabel = function(nameOfTalkNodeToGet)
	{
		return this.talkNodes[TalkNode.Underscore + nameOfTalkNodeToGet];
	};
}
