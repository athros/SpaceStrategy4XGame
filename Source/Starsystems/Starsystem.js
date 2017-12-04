
function Starsystem(name, size, star, linkPortals, planets, factionName)
{
	this.name = name;
	this.size = size;

	this.star = star;
	this.linkPortals = linkPortals;
	this.planets = planets;
	this.factionName = factionName;

	this.ships = [];

	// Helper variables
	this.drawPos = new Coords();
	this.drawPos2 = new Coords();
	this.drawLoc = new Location(this.drawPos);
	this.visualElevationStem = new VisualElevationStem(null);
	this.visualGrid = new VisualGrid(null, 40, 10, Color.Instances().CyanHalfTranslucent.systemColor);
}

{
	// constants

	Starsystem.SizeStandard = new Coords(100, 100, 100);

	// static methods

	Starsystem.generateRandom = function(universe)
	{
		var name = NameGenerator.generateName();
		var size = Starsystem.SizeStandard;

		var starColor = Color.Instances().Yellow.systemColor;
		var star = new Body
		(
			"Star", 
			new BodyDefn
			(
				"Star", 
				new Coords(40, 40), // size
				new VisualGroup
				([
					new VisualCircle(40, starColor, starColor),
					new VisualText(name)
				])
			),
			new Coords(0, 0, -10)
		);

		var numberOfPlanetsMin = 1;
		var numberOfPlanetsMax = 4;
		var numberOfPlanetsRange = 
			numberOfPlanetsMax - numberOfPlanetsMin;
		var numberOfPlanets = numberOfPlanetsMin + Math.floor
		(
			Math.random() * numberOfPlanetsRange
		);

		var spaceBetweenPlanets = 40;

		var planets = [];
		for (var i = 0; i < numberOfPlanets; i++)
		{
			var planetName = name + " " + (i + 1);

			var planet = new Planet
			(
				planetName,
				null, // factionName
				// pos
				new Coords().randomize().multiply
				(
					size
				).multiplyScalar
				(
					2
				).subtract
				(
					size
				),
				new PlanetDemographics(1),
				new PlanetIndustry(0, null),
				null // layout
			);

			planet.layout = Layout.generateRandom(universe, planet);

			planets.push(planet);
		}

		var returnValue = new Starsystem
		(
			name,
			size,
			star,
			[], // linkPortals - generated later
			planets
		);

		return returnValue;
	}

	// instance methods

	Starsystem.prototype.faction = function(universe)
	{
		return (this.factionName == null ? null : universe.world.factions[this.factionName]);
	}

	Starsystem.prototype.links = function()
	{
		var returnValues = [];

		for (var i = 0; i < this.linkPortals.length; i++)
		{
			var linkPortal = this.linkPortals[i];
			var link = linkPortal.link();
			returnValues.push(link);
		}

		return returnValues;
	}

	// moves

	Starsystem.prototype.updateForMove = function()
	{
		alert("todo");
	}

	// turns

	Starsystem.prototype.updateForTurn = function(universe)
	{
		for (var i = 0; i < this.bodies.length; i++)
		{
			var body = this.bodies[i];
			if (body.updateForTurn != null)
			{
				body.updateForTurn(universe, this);
			}
		}
	}

	// drawing

	Starsystem.prototype.draw = function(universe, display, camera)
	{
		this.visualElevationStem.camera = camera;
		this.visualGrid.camera = camera;

		this.visualGrid.draw(universe, display);

		var bodiesByType =
		[
			[ this.star ],
			this.linkPortals,
			this.planets,
			this.ships,
		];

		for (var t = 0; t < bodiesByType.length; t++)
		{
			var bodies = bodiesByType[t];

			for (var i = 0; i < bodies.length; i++)
			{
				var body = bodies[i];
				this.draw_Body
				(
					universe,
					display,
					camera, 
					body
				);
			}

		}
	}

	Starsystem.prototype.draw_Body = function(universe, display, camera, body)
	{
		var drawPos = this.drawPos;
		var drawLoc = this.drawLoc;

		var bodyPos = body.loc.pos;
		drawPos.overwriteWith(bodyPos);
		camera.coordsTransformWorldToView(drawPos);

		var bodyDefn = body.defn;
		var bodyVisual = bodyDefn.visual;
		bodyVisual.draw(universe, display, body, drawLoc);

		this.visualElevationStem.draw(universe, display, body, body.loc);
	}
}

// Visuals.

function VisualElevationStem(camera)
{
	this.camera = camera;
	this.drawPosTip = new Coords();
	this.drawPosPlane = new Coords();
}
{
	VisualElevationStem.prototype.draw = function(universe, display, drawable, drawLoc)
	{
		var drawablePosWorld = drawable.loc.pos;
		var drawPosTip = this.camera.coordsTransformWorldToView
		(
			this.drawPosTip.overwriteWith(drawablePosWorld)
		);
		var drawPosPlane = this.camera.coordsTransformWorldToView
		(
			this.drawPosPlane.overwriteWith(drawablePosWorld).clearZ()
		);
		var colorName = (drawablePosWorld.z < 0 ? "Green" : "Red");
		var colors = Color.Instances();
		display.drawLine(drawPosTip, drawPosPlane, colors[colorName].systemColor);
	}
}

function VisualGrid(camera, gridDimensionInCells, gridCellDimensionInPixels, color)
{
	this.camera = camera;
	this.gridSizeInCells = new Coords(1, 1, 0).multiplyScalar(gridDimensionInCells);
	this.gridCellSizeInPixels = new Coords(1, 1, 0).multiplyScalar(gridCellDimensionInPixels);
	this.color = color;

	this.gridSizeInPixels = this.gridSizeInCells.clone().multiply(this.gridCellSizeInPixels);
	this.gridSizeInCellsHalf = this.gridSizeInCells.clone().half();
	this.gridSizeInPixelsHalf = this.gridSizeInPixels.clone().half();

	this.drawPosFrom = new Coords();
	this.drawPosTo = new Coords();
	this.multiplier = new Coords();
}
{
	VisualGrid.prototype.draw = function(universe, display, drawable, drawLoc)
	{
		var drawPosFrom = this.drawPosFrom;
		var drawPosTo = this.drawPosTo;
		var multiplier = this.multiplier;

		for (var d = 0; d < 2; d++)
		{
			multiplier.clear();
			multiplier.dimension(d, this.gridCellSizeInPixels.dimension(d));

			for (var i = 0 - this.gridSizeInCellsHalf.x; i <= this.gridSizeInCellsHalf.x; i++)
			{
				drawPosFrom.overwriteWith
				(
					this.gridSizeInPixelsHalf
				).multiplyScalar(-1);

				drawPosTo.overwriteWith
				(
					this.gridSizeInPixelsHalf
				);

				drawPosFrom.dimension(d, 0);
				drawPosTo.dimension(d, 0);

				drawPosFrom.add(multiplier.clone().multiplyScalar(i));
				drawPosTo.add(multiplier.clone().multiplyScalar(i));

				this.camera.coordsTransformWorldToView(drawPosFrom);
				this.camera.coordsTransformWorldToView(drawPosTo);

				display.drawLine(drawPosFrom, drawPosTo, this.color);
			}
		}
	}
}
