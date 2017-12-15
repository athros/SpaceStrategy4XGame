
function Cursor(bodyParent)
{
	this.bodyParent = bodyParent;
	this.hasXYPositionBeenSpecified = false;
	this.hasZPositionBeenSpecified = false;

	this.defn = Cursor.BodyDefn();

	this.loc = new Location(new Coords(0, 0, 0));
	if (this.bodyParent.loc != null)
	{
		this.loc.overwriteWith(this.bodyParent.loc);
	}

	this.constraints = 
	[
		new Constraint_Cursor()
	];
}

{
	Cursor.BodyDefn = function()
	{
		if (Cursor._bodyDefn == null)
		{
			Cursor._bodyDefn = new BodyDefn
			(
				"Cursor", 
				new Coords(10, 10), // size
				new VisualGroup
				([
					new VisualRectangle(new Coords(10, 10), null, Color.Instances().Cyan),
				])
			);
		}
		return Cursor._bodyDefn;
	}

	// controls

	Cursor.prototype.controlBuild = function(universe, controlSize)
	{
		return this.bodyParent.controlBuild(universe, controlSize);
	}

	// drawable

	Cursor.prototype.draw = function(universe, display, venueStarsystem)
	{
		var starsystem = venueStarsystem.starsystem;
		starsystem.draw_Body
		(
			universe, 
			display,
			venueStarsystem.camera,
			this
		);
	}
}