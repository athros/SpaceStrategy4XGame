
function Ship(name, defn, pos, factionName, devices)
{
	this.name = name;
	this.defn = defn;
	this.loc = new Location(pos);
	this.factionName = factionName;
	this.devices = devices;

	this.integrity = 10;
	this.energyThisTurn = 0;
	this.distancePerMove = 0;
	this.shieldingThisTurn = 0;

	// Helper variables.
	this.displacement = new Coords();
}

{
	// static methods

	Ship.bodyDefnBuild = function(color)
	{
		var scaleFactor = 10;

		var returnValue = new BodyDefn
		(
			"Ship", 
			new Coords(1, 1).multiplyScalar(scaleFactor), // size
			new VisualGroup
			([
				new VisualPolygon
				(
					[
						new Coords(.5, 0).multiplyScalar(scaleFactor),
						new Coords(-.5, .5).multiplyScalar(scaleFactor),
						new Coords(-.5, -.5).multiplyScalar(scaleFactor),
					], 
					color.systemColor
				),
			])
		);

		return returnValue;
	}

	// instance methods

	Ship.prototype.faction = function(world)
	{
		return (this.factionName == null ? null : world.factions[this.factionName]);
	}

	Ship.prototype.id = function()
	{
		return this.factionName + this.name;
	}

	// movement

	Ship.prototype.linkPortalEnter = function(cluster, linkPortal)
	{
		var starsystemFrom = linkPortal.starsystemFrom(cluster);
		var starsystemTo = linkPortal.starsystemTo(cluster);
		var link = linkPortal.link(cluster);

		starsystemFrom.ships.remove(this);
		link.ships.push(this);

		var linkStarsystem1 = link.nodesLinked(cluster)[1].starsystem;
		var shipLoc = this.loc;
		var isLinkForward = (starsystemTo == linkStarsystem1);
		shipLoc.pos.clear().x = (isLinkForward ? 0 : link.length(cluster));
		shipLoc.vel.clear().x = (isLinkForward ? 1 : -1);
	}

	Ship.prototype.linkExit = function(world, link)
	{
		link.ships.remove(this);

		var cluster = world.network;
		var ship = this;
		var shipLoc = ship.loc;
		var shipPos = shipLoc.pos;
		var shipVel = shipLoc.vel;

		var indexOfNodeDestination = (shipVel.x > 0 ? 1 : 0);
		var indexOfNodeSource = 1 - indexOfNodeDestination;

		var nodesLinked = link.nodesLinked(cluster);
		var nodeDestination = nodesLinked[indexOfNodeDestination];
		var nodeSource = nodesLinked[indexOfNodeSource];

		var starsystemDestination = nodeDestination.starsystem;
		var starsystemSource = nodeSource.starsystem;

		var portalToExitFrom = starsystemDestination.linkPortals[starsystemSource.name];
		var exitPos = portalToExitFrom.loc.pos;
		shipPos.overwriteWith(exitPos).add(new Coords(1, 1, 1));

		starsystemDestination.ships.push(ship);

		var shipFaction = ship.faction(world);
		var factionKnowledge = shipFaction.knowledge;
		var starsystemNamesKnown = factionKnowledge.starsystemNames;
		var starsystemName = starsystemDestination.name;
		if (starsystemNamesKnown.contains(starsystemName) == false)
		{
			starsystemNamesKnown.push(starsystemName);
			var linkPortals = starsystemDestination.linkPortals;
			for (var i = 0; i < linkPortals.length; i++)
			{
				var linkPortal = linkPortals[i];
				var link = linkPortal.link(cluster);
				var linkName = link.name;
				factionKnowledge.linkNames.push(linkName);
			}

			factionKnowledge.worldKnownUpdate();
		}
	}

	Ship.prototype.moveTowardTarget = function(universe, target)
	{
		if (this.distanceLeftThisMove == null)
		{
			if (this.energyThisTurn >= this.energyPerMove)
			{
				this.energyThisTurn -= this.energyPerMove;
				this.distanceLeftThisMove = this.distancePerMove;
			}
		}

		if (this.distanceLeftThisMove > 0)
		{
			var shipLoc = this.loc;
			var shipPos = shipLoc.pos;
			var targetLoc = target.loc;
			var targetPos = targetLoc.pos;

			var displacementToTarget = this.displacement.overwriteWith
			(
				targetPos
			).subtract
			(
				shipPos
			);
			var distanceToTarget = displacementToTarget.magnitude();

			var distanceMaxPerTick = 3; // hack

			var distanceToMoveThisTick = (this.distanceLeftThisMove < distanceMaxPerTick ? this.distanceLeftThisMove : distanceMaxPerTick);

			if (distanceToTarget < distanceToMoveThisTick)
			{
				shipPos.overwriteWith(targetPos);

				// hack
				this.distanceLeftThisMove = null;
				this.activity = null;
				universe.inputHelper.isEnabled = true;
				this.order = null;

				var targetDefnName = target.defn.name;
				if (targetDefnName == "LinkPortal")
				{
					var portal = target;
					this.linkPortalEnter(universe.world.network, portal);
				}
				else if (targetDefnName == "Planet")
				{
					var planet = target;
					this.planetOrbitEnter(universe.world.network, "todo", planet);
				}
			}
			else
			{
				var directionToTarget = displacementToTarget.divideScalar
				(
					distanceToTarget
				);

				var shipVel = shipLoc.vel;
				shipVel.overwriteWith
				(
					directionToTarget
				).multiplyScalar
				(
					distanceToMoveThisTick
				);

				shipPos.add(shipVel);

				this.distanceLeftThisMove -= distanceToMoveThisTick;
				if (this.distanceLeftThisMove <= 0)
				{
					// hack
					this.distanceLeftThisMove = null;
					this.activity = null;
					universe.inputHelper.isEnabled = true;
				}
			}
		}
	}

	Ship.prototype.movementThroughLinkPerTurn = function(link)
	{
		return 8; // todo
	}

	Ship.prototype.planetOrbitEnter = function(universe, starsystem, planet)
	{
		starsystem.ships.remove(this);
		starsystem.ships.push(this);
	}

	// controls

	Ship.prototype.controlBuild = function(universe, containerSize)
	{
		var margin = 8;
		var controlSpacing = 16;
		var buttonSize = new Coords
		(
			containerSize.x - margin * 2,
			15
		);
		var fontHeightInPixels = margin;

		var returnValue = new ControlContainer
		(
			"containerShip",
			new Coords(0, 0), // pos
			containerSize,
			// children
			[
				new ControlLabel
				(
					"textShipAsSelection",
					new Coords(margin, margin),
					new Coords(containerSize.x, 0), // this.size
					false, // isTextCentered
					new DataBinding(this.name)
				),

				new ControlLabel
				(
					"labelIntegrity",
					new Coords(margin, margin + controlSpacing),
					new Coords(containerSize.x, controlSpacing), // this.size
					false, // isTextCentered
					"H:"
				),

				new ControlLabel
				(
					"textIntegrity",
					new Coords(containerSize.x / 4, margin + controlSpacing),
					new Coords(containerSize.x, controlSpacing), // this.size
					false, // isTextCentered
					new DataBinding(this, "integrity")
				),

				new ControlLabel
				(
					"labelEnergy",
					new Coords(containerSize.x / 2, margin + controlSpacing),
					new Coords(containerSize.x, controlSpacing), // this.size
					false, // isTextCentered
					"E:"
				),

				new ControlLabel
				(
					"textEnergy",
					new Coords(3 * containerSize.x / 4, margin + controlSpacing),
					new Coords(containerSize.x, controlSpacing), // this.size
					false, // isTextCentered
					new DataBinding(this, "energyThisTurn")
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
						alert("todo - view")
					}
				),

				new ControlButton
				(
					"buttonMove",
					new Coords(margin, margin + controlSpacing * 3), // pos
					buttonSize,
					"Move",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var venue = universe.venueCurrent;
						var ship = venue.selection;
						venue.cursorBuild(ship);
					}
				),
				new ControlButton
				(
					"buttonRepeat",
					new Coords(margin, margin + controlSpacing * 4), // pos
					buttonSize,
					"Repeat",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var venue = universe.venueCurrent;
						var ship = venue.selection;
						if (ship.order != null)
						{
							ship.order.obey(ship);
						}
					}
				),

				new ControlLabel
				(
					"labelDevices",
					new Coords(margin, margin + controlSpacing * 5), // pos
					new Coords(containerSize.x, 0), // this.size
					false, // isTextCentered
					new DataBinding("Devices:")
				),

				new ControlList
				(
					"listDevices",
					new Coords(margin, margin + controlSpacing * 6), // pos
					new Coords(buttonSize.x, controlSpacing * 2), // size
					// dataBindingForItems
					new DataBinding(this.devices, null),
					"defn.name", // bindingExpressionForOptionText
					fontHeightInPixels,
					new DataBinding(this, "deviceSelected"), // dataBindingForItemSelected
					null // bindingExpressionForItemValue
				),

				new ControlButton
				(
					"buttonDeviceUse",
					new Coords(margin, margin * 2 + controlSpacing * 7.5), // pos
					buttonSize,
					"Use Device",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var venue = universe.venueCurrent;
						var starsystem = venue.starsystem;
						var ship = venue.selection;
						var device = ship.deviceSelected;
						var deviceDefn = device.defn;
						if (deviceDefn.needsTarget == true)
						{
							var projectile = new Projectile(ship);
							var cursor = new Cursor(projectile);
							venue.selection = cursor;
						}
						else
						{
							device.use(universe, starsystem, ship);
						}
					}
				),


			]
		);

		return returnValue;
	}

	// diplomacy

	Ship.prototype.strength = function()
	{
		return 1;
	}

	// turns

	Ship.prototype.updateForTurn = function(universe, faction)
	{
		this.energyThisTurn = 0;
		this.distancePerMove = 0;
		this.energyPerMove = 0;
		this.shieldingThisTurn = 0;

		for (var i = 0; i < this.devices.length; i++)
		{
			var device = this.devices[i];
			device.updateForTurn(universe, this);
		}
	}
}
