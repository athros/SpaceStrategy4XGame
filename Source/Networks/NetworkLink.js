
function NetworkLink(namesOfNodesLinked)
{
	this.namesOfNodesLinked = namesOfNodesLinked;
	this.ships = [];

	this.name = this.namesOfNodesLinked.join("-");

	this.color = "rgba(128, 128, 128, .25)"; // hack
}

{
	NetworkLink.prototype.direction = function(cluster)
	{
		return this.displacement(cluster).normalize();
	}

	NetworkLink.prototype.displacement = function(cluster)
	{
		var nodesLinked = this.nodesLinked(cluster);

		var returnValue = nodesLinked[1].loc.pos.clone().subtract
		(
			nodesLinked[0].loc.pos
		);

		return returnValue;
	}

	NetworkLink.prototype.length = function(cluster)
	{
		return this.displacement(cluster).magnitude();
	}

	NetworkLink.prototype.nodesLinked = function(cluster)
	{
		var returnValue = 
		[
			cluster.nodes[this.namesOfNodesLinked[0]],
			cluster.nodes[this.namesOfNodesLinked[1]],
		];

		return returnValue;
	}

	// turns

	NetworkLink.prototype.updateForTurn = function(universe)
	{
		if (this.ships.length > 0)
		{
			var world = universe.world;
			var cluster = world.network;

			var length = this.length(cluster);

			var shipsExitingLink = [];

			for (var i = 0; i < this.ships.length; i++)
			{
				var ship = this.ships[i];
				var shipLoc = ship.loc;
				var shipPos = shipLoc.pos;
				var shipVel = shipLoc.vel;
				shipPos.x += (shipVel.x * ship.movementThroughLinkPerTurn(this));

				if (shipPos.x < 0 || shipPos.x > length)
				{
					shipsExitingLink.push(ship);
				}
			}

			for (var i = 0; i < shipsExitingLink.length; i++)
			{
				var ship = shipsExitingLink[i];
				ship.linkExit(world, this);
			}
		}
	}

	// drawable

	NetworkLink.prototype.draw = function
	(
		universe,
		camera, 
		nodeRadiusActual, 
		drawPosFrom, 
		drawPosTo
	)
	{
		var cluster = universe.world.network;
		var nodesLinked = this.nodesLinked(cluster);
		var nodeFromPos = nodesLinked[0].loc.pos;
		var nodeToPos = nodesLinked[1].loc.pos;

		camera.coordsTransformWorldToView
		(
			drawPosFrom.overwriteWith(nodeFromPos)
		);

		camera.coordsTransformWorldToView
		(
			drawPosTo.overwriteWith(nodeToPos)
		);

		if (drawPosFrom.z <= 0 || drawPosTo.z <= 0)
		{
			return; // hack - todo - Clipping.
		}

		var directionFromNode0To1InView = drawPosTo.clone().subtract
		(
			drawPosFrom
		).normalize();

		var perpendicular = directionFromNode0To1InView.clone().right();

		var perspectiveFactorFrom = 
			camera.focalLength / drawPosFrom.z;
		var perspectiveFactorTo = 
			camera.focalLength / drawPosTo.z;

		var radiusApparentFrom = 
			nodeRadiusActual * perspectiveFactorFrom;
		var radiusApparentTo = 
			nodeRadiusActual * perspectiveFactorTo;

		var display = universe.display;

		display.drawPolygon
		(
			[
				drawPosFrom, 
				drawPosTo,
				perpendicular.clone().multiplyScalar(radiusApparentTo).add(drawPosTo),
				perpendicular.clone().multiplyScalar(radiusApparentFrom).add(drawPosFrom)
			],
			this.color // hack
		);

		var drawPos = drawPosFrom;

		var ships = this.ships;
		for (var i = 0; i < ships.length; i++)
		{
			var ship = ships[i];
			this.draw_Ship
			(
				universe, 
				cluster, 
				display, 
				camera, 
				ship, 
				drawPos, 
				nodeFromPos, 
				nodeToPos
			);
		}
	}

	NetworkLink.prototype.draw_Ship = function
	(
		universe, cluster, display, camera, ship, drawPos, nodeFromPos, nodeToPos
	)
	{
		var world = universe.world;

		var forward = this.direction(cluster);
		var linkLength = this.length(cluster);

		var fractionOfLinkTraversed = ship.loc.pos.x / linkLength; 

		/*
		var shipVel = ship.loc.vel;
		if (shipVel.x < 0)
		{
			fractionOfLinkTraversed = 1 - fractionOfLinkTraversed;
			forward.multiplyScalar(-1);
		}
		*/

		camera.coordsTransformWorldToView
		(
			drawPos.overwriteWith
			(
				nodeFromPos
			).multiplyScalar
			(
				1 - fractionOfLinkTraversed
			).add
			(
				nodeToPos.clone().multiplyScalar
				(
					fractionOfLinkTraversed
				)
			)
		);

		var shipColor = ship.faction(world).color;
		var shipSizeMultiplier = 4; // hack
		var shipVisual = new VisualPolygon
		(
			[
				new Coords(0, 0).multiplyScalar(shipSizeMultiplier),
				new Coords(.5, -1).multiplyScalar(shipSizeMultiplier),
				new Coords(-.5, -1).multiplyScalar(shipSizeMultiplier)
			],
			shipColor.systemColor,
			null, // colorBorder
		);
		shipVisual.draw(universe, display, ship, new Location(drawPos));
	}

}
