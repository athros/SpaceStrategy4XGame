
function Layout(sizeInPixels, map, bodies)
{
	this.sizeInPixels = sizeInPixels;
	this.map = map;
	this.bodies = bodies;

	for (var i = 0; i < this.bodies.length; i++)
	{
		var body = this.bodies[i];
		var bodyPosInCells = body.loc.pos;
		var cell = this.map.cellAtPos(bodyPosInCells);
		cell.body = body;
	}
}

{
	// static methods

	Layout.planet = function(universe, planet)
	{
		var world = universe.world;
		var viewSize = universe.display.sizeInPixels;
		var mapSizeInPixels = viewSize.clone().multiplyScalar(.5);
		var mapPosInPixels = viewSize.clone().subtract
		(
			mapSizeInPixels
		).divideScalar
		(
			2
		);
		mapPosInPixels.z = 0;

		var mapSizeInCells = new Coords(9, 7);
		var mapCellSizeInPixels = mapSizeInPixels.clone().divide(mapSizeInCells);

		var terrains = 
		[
			new MapTerrain("None", " ", new VisualRectangle(mapCellSizeInPixels, null, "rgba(0, 0, 0, 0)"), false),
			new MapTerrain("Orbit", "-", new VisualRectangle(mapCellSizeInPixels, null, "Violet"), false),
			new MapTerrain("Surface", ".", new VisualRectangle(mapCellSizeInPixels, null, "LightGray"), false),
		];
		terrains.addLookups("codeChar");

		var map = Map.fromCellsAsStrings
		(
			mapSizeInPixels,
			mapPosInPixels,
			terrains,
			// cellsAsStrings
			[
				"---------",
				"         ",
				".........",
				".........",
				".........",
				".........",
				".........",
			]
		);

		var layout = new Layout
		(
			viewSize.clone(), // sizeInPixels
			map,
			// bodies
			[
				new Buildable("Hub", new Coords(4, 4), true)
			] 
		);

		return layout;
	}

	// instance methods

	Layout.prototype.elementAdd = function(elementToAdd)
	{
		this.bodies.push(elementToAdd);
		this.map.cellAtPos(elementToAdd.loc.pos).body = elementToAdd;
	}

	Layout.prototype.elementRemove = function(elementToRemove)
	{
		this.bodies.remove(elementToRemove);
		var elementPos = elementToRemove.loc.pos;
		var cell = this.map.cellAtPos(elementPos);
		cell.body = null;
	}

	// turnable

	Layout.prototype.facilities = function()
	{
		var returnValues = [];

		var cells = this.map.cells;
		for (var i = 0; i < cells.length; i++)
		{
			var cell = cells[i];
			var facility = cell.body;
			if (facility != null)
			{
				returnValues.push(facility);
			}
		}

		return returnValues;
	}

	Layout.prototype.initialize = function(universe)
	{
		// todo
	}

	Layout.prototype.updateForTurn = function(universe, world, faction, parentModel)
	{
		var cells = this.map.cells;
		for (var i = 0; i < cells.length; i++)
		{
			var cell = cells[i];
			var cellBody = cell.body;
			if (cellBody != null)
			{
				if (cellBody.updateForTurn != null)
				{
					cellBody.updateForTurn(universe, world, faction, parentModel, this);
				}
			}
		}

	}

	// drawable

	Layout.prototype.draw = function(universe, display)
	{
		display.drawBackground();
		this.map.draw(universe, display);
	}
}
