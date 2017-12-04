
function NetworkNode(name, defn, pos, starsystem)
{
	this.name = name;
	this.defn = defn;
	this.loc = new Location(pos);
	this.starsystem = starsystem;
}

{
	// constants 

	NetworkNode.RadiusActual = 4;
}

{
	NetworkNode.prototype.controlBuild = function(universe)
	{
		var viewSize = universe.display.sizeInPixels;
		var containerSize = new Coords(100, 80);
		var margin = 10;
		var controlSpacing = 8;
		var fontHeightInPixels = margin;
		var buttonSize = new Coords
		(
			containerSize.x - margin * 4,
			10
		);

		var starsystem = this.starsystem;

		var returnValue = new ControlContainer
		(
			"containerStarsystem",
			new Coords(viewSize.x - margin - containerSize.x, margin), // pos
			new Coords(containerSize.x - margin * 2, 40), // size
			// children
			[
				new ControlLabel
				(
					"labelStarsystemName",
					new Coords(margin, margin),
					new Coords(0, 0), // this.size
					false, // isTextCentered
					new DataBinding(starsystem.name)
				),

				new ControlLabel
				(
					"labelStarsystemHolder",
					new Coords(margin, margin + controlSpacing),
					new Coords(0, 0), // this.size
					false, // isTextCentered
					new DataBinding(starsystem, "faction.name")
				),

				new ControlButton
				(
					"buttonView",
					new Coords(margin, margin + controlSpacing * 2), // pos
					buttonSize, // size
					"View",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var starsystemToView = universe.venueCurrent.selection.starsystem;
						universe.venueNext = new VenueStarsystem(universe, starsystemToView); 
					}
				),
			]
		);

		return returnValue;
	}
}
