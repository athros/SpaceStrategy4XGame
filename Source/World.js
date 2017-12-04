
function World(name, dateCreated, activityDefns, technologyTree, network, factions, ships, camera)
{
	this.name = name;
	this.dateCreated = dateCreated;

	this.activityDefns = activityDefns.addLookups("name");
	this.technologyTree = technologyTree;
	this.network = network;
	this.factions = factions;
	this.ships = ships;
	this.camera = camera;

	this.dateSaved = this.dateCreated;

	this.factions.addLookups("name");
	this.ships.addLookups("name");

	this.turnsSoFar = 1;
	this.factionIndexCurrent = 0;
}
{
	// static methods

	World.new = function(universe)
	{
		var worldName = NameGenerator.generateName() + " Cluster";

		var technologyTree = TechnologyTree.demo();

		var viewSize = universe.display.sizeInPixels.clone();
		var viewDimension = viewSize.y;

		var networkRadius = viewDimension * .35;
		var numberOfNetworkNodes = 6; // 128;
		var network = Network.generateRandom
		(
			universe, 
			worldName,
			NetworkNodeDefn.Instances._All,
			numberOfNetworkNodes,
			// minAndMaxDistanceOfNodesFromOrigin
			[ networkRadius / 2, networkRadius ],
			20 // distanceBetweenNodesMin
		);

		var focalLength = viewDimension;
		viewSize.z = focalLength;

		var numberOfFactions = 6;
		var factions = [];
		var ships = [];

		var colors = Color.Instances();
		var colorsForFactions = 
		[
			colors.Red,
			colors.Orange,
			colors.YellowDark,
			colors.Green,
			colors.Blue,
			colors.Violet,
		];

		var deviceDefns = 
		[
			new DeviceDefn
			(
				"Drive",
				false, // isActive
				false, // needsTarget
				[ "Drive" ], // categoryNames
				function initialize(universe, actor, device)
				{
					actor.distancePerMove = 0;
				},
				function updateForTurn(universe, actor, device)
				{
					actor.distancePerMove += 1;
				},
				function use(universe, actor, device, target)
				{
					actor.energyThisTurn -= 1;
				}
			),
			new DeviceDefn
			(
				"Generator",
				false, // isActive
				false, // needsTarget
				[ "Generator" ], // categoryNames
				function initialize(universe, actor, device)
				{
					actor.energyThisTurn = 0;
				},
				function updateForTurn(universe, actor, device)
				{
					actor.energyThisTurn += 10;
				},
				function use(universe, actor, device, target)
				{
					// Do nothing.
				}
			),
			new DeviceDefn
			(
				"Shield",
				true, // isActive
				false, // needsTarget
				[ "Shield" ], // categoryNames
				function initialize(universe, actor, device)
				{
					device.isActive = false;
				},
				function updateForTurn(universe, actor, device)
				{
					if (device.isActive == true)
					{
						actor.energyThisTurn -= 1;
						actor.shieldingThisTurn = 0;
					}
				},
				function use(universe, actor, device, target)
				{
					if (device.isActive == true)
					{
						device.isActive = false;
						actor.energyThisTurn += 1;
					}
					else
					{
						device.isActive = true;
						actor.energyThisTurn -= 1;
					}
				}
			),
			new DeviceDefn
			(
				"Weapon",
				true, // isActive
				true, // needsTarget
				[ "Weapon" ], // categoryNames
				function initialize(universe, actor, device)
				{
					// todo
				},
				function updateForTurn(universe, actor, device)
				{
					device.usesThisTurn = 3;
				},
				function use(universe, place, actor, device, target)
				{
					if (device.usesThisTurn > 0)
					{
						device.usesThisTurn--;
						target.integrity -= 1;
						if (target.integrity <= 0)
						{
							alert("todo - ship destroyed");
						}
					}
				}
			),
		].addLookups("name");

		for (var i = 0; i < numberOfFactions; i++)
		{
			var factionHomeStarsystem = null;

			var random = Math.random();
			var starsystemIndexStart = Math.floor
			(
				random * numberOfNetworkNodes
			);

			var starsystemIndex = starsystemIndexStart;

			while (factionHomeStarsystem == null)
			{
				factionHomeStarsystem = network.nodes[starsystemIndex].starsystem;
				if (factionHomeStarsystem.planets.length == 0)
				{
					factionHomestarsystem = null;
				}
				else if (factionHomeStarsystem.factionName != null)
				{
					factionHomeStarsystem = null;
				}

				starsystemIndex++;
				if (starsystemIndex >= numberOfNetworkNodes)
				{
					starsystemIndex = 0;
				}

				if (starsystemIndex == starsystemIndexStart)
				{
					throw "There are more factions than starsystems with planets.";
				}
			}

			var factionName = factionHomeStarsystem.name + "ians";
			factionHomeStarsystem.factionName = factionName;
			var factionColor = colorsForFactions[i];

			var ship = new Ship
			(
				factionName + " Ship0",
				Ship.bodyDefnBuild(factionColor),
				new Coords().randomize().multiply
				(
					factionHomeStarsystem.size
				).multiplyScalar
				(
					2
				).subtract
				(
					factionHomeStarsystem.size
				),
				factionName,
				[
					new Device(deviceDefns["Generator"]),
					new Device(deviceDefns["Drive"]),
					new Device(deviceDefns["Shield"]),
					new Device(deviceDefns["Weapon"]),
				]
			);
			ships.push(ship);
			factionHomeStarsystem.ships.push(ship);

			var faction = new Faction
			(
				factionName,
				factionColor,
				[], // relationships 
				new TechnologyResearcher
				(
					factionName + " Research",
					null, // nameOfTechnologyBeingResearched,
					0, // researchAccumulated
					// namesOfTechnologiesKnown
					[ "A" ]
				), 
				[
					factionHomeStarsystem.planets[0]
				], 
				[
					ship
				],
				new FactionKnowledge
				(
					[ factionHomeStarsystem ],
					[ factionHomeStarsystem.links() ]
				)
			);
			factions.push(faction);

		}

		DiplomaticRelationship.initializeForFactions(factions);

		var camera = new Camera
		(
			viewSize, 
			focalLength, 
			new Location
			(
				new Coords(-viewDimension, 0, 0), //pos, 
				new Orientation
				(
					new Coords(1, 0, 0), // forward
					new Coords(0, 0, 1) // down
				)
			)
		);

		var returnValue = new World
		(
			worldName,
			DateTime.now(),
			ActivityDefn.Instances._All,
			technologyTree,
			network,
			factions,
			ships,
			camera
		);
		return returnValue;
	}

	// instance methods

	World.prototype.factionCurrent = function()
	{
		return this.factions[this.factionIndexCurrent];
	}

	World.prototype.factionsOtherThanCurrent = function()
	{
		var factionCurrent = this.factionCurrent();
		var returnValues = this.factions.slice();
		returnValues.splice
		(
			this.factionIndexCurrent, 1
		);
		return returnValues;
	}

	World.prototype.updateForTurn = function(universe)
	{
		this.network.updateForTurn(universe);

		for (var i = 0; i < this.factions.length; i++)
		{
			var faction = this.factions[i];
			faction.updateForTurn(universe);
		}

		this.turnsSoFar++;
	}
}
