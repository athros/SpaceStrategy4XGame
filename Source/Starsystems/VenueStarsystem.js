
function VenueStarsystem(venueParent, starsystem)
{
	this.venueParent = venueParent;
	this.starsystem = starsystem;
}

{
	VenueStarsystem.prototype.cursorBuild = function()
	{
		var ship = this.selection;
		var cursor = new Cursor(ship);
		this.cursor = cursor;
		this.bodies.push(cursor);
		this.selection = cursor;
	}

	VenueStarsystem.prototype.cursorClear = function()
	{
		this.selection = this.cursor.bodyParent;
		this.bodies.remove(this.cursor);
		this.cursor = null;
	}

	VenueStarsystem.prototype.draw = function(universe)
	{
		var world = universe.world;
		var display = universe.display;

		display.drawBackground();
		this.starsystem.draw
		(
			universe,
			world, 
			display,
			this.camera
		);

		if (this.cursor != null)
		{
			this.cursor.draw(universe, world, display, this);
		}

		this.venueControls.draw(universe, world);
	}

	VenueStarsystem.prototype.finalize = function(universe)
	{
		universe.soundHelper.soundForMusic.pause(universe);
	}

	VenueStarsystem.prototype.initialize = function(universe)
	{
		this.venueControls = new VenueControls
		(
			this.controlBuild(universe)
		);

		var starsystem = this.starsystem;

		var soundHelper = universe.soundHelper;
		soundHelper.soundWithNamePlayAsMusic(universe, "Music");

		var viewSize = universe.display.sizeInPixels.clone();
		var focalLength = viewSize.y;
		viewSize.z = focalLength * 4;

		this.camera = new Camera
		(
			viewSize, 
			focalLength, 
			new Location
			(
				new Coords(0 - focalLength, 0, 0), //pos, 
				new Orientation
				(
					new Coords(1, 0, 0), // forward
					new Coords(0, 0, 1) // down
				)
			)
		);

		var targetForCamera = new Coords(0, 0, 0);

		this.camera.constraints = 
		[
			new Constraint_PositionOnCylinder
			(
				targetForCamera, // center
				new Orientation
				(
					new Coords(1, 0, 0), 
					new Coords(0, 0, 1) // axis
				),
				0, // yaw
				this.camera.focalLength, // radius
				0 - this.camera.focalLength / 2 // distanceFromCenterAlongAxisMax
			),

			new Constraint_LookAt(targetForCamera),
		].addLookups("name");

		Constrainable.constrain(universe, universe.world, this, this.camera);

		this.bodies = [];
		this.bodies.push(starsystem.star);
		this.bodies = this.bodies.concat(starsystem.linkPortals);
		this.bodies = this.bodies.concat(starsystem.planets);
		this.bodies = this.bodies.concat(starsystem.ships);
	}

	VenueStarsystem.prototype.model = function()
	{
		return this.starsystem;
	}

	VenueStarsystem.prototype.selectionName = function()
	{
		return (this.selection == null ? "[none]" : this.selection.name);
	}

	VenueStarsystem.prototype.updateForTimerTick = function(universe)
	{
		this.venueControls.updateForTimerTick(universe);

		Constrainable.constrain(universe, universe.world, this, this.camera);

		if (this.cursor != null)
		{
			Constrainable.constrain(universe, universe.world, this, this.cursor);
		}

		var bodies = this.starsystem.ships;
		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			var bodyDefnName = body.defn.name;

			if (bodyDefnName == "Ship")
			{
				var ship = body;

				var shipActivity = ship.activity;
				if (shipActivity != null)
				{
					shipActivity.perform(universe, ship);
				}
			}
		}

		this.draw(universe);

		this.updateForTimerTick_Input(universe);
	}

	VenueStarsystem.prototype.updateForTimerTick_Input = function(universe)
	{
		var inputHelper = universe.inputHelper;

		var inputsActive = inputHelper.inputsActive;
		for (var i = 0; i < inputsActive.length; i++)
		{
			var inputActive = inputsActive[i];
			if (inputActive == "_a")
			{
				this.cameraLeft(.01);
			}
			else if (inputActive == "_d")
			{
				this.cameraRight(.01);
			}
			else if (inputActive == "_f")
			{
				this.cameraDown(10);
			}
			else if (inputActive == "_r")
			{
				this.cameraUp(10);
			}
			else if (inputActive == "_s")
			{
				this.cameraOut(10);
			}
			else if (inputActive == "_w")
			{
				this.cameraIn(10);
			}
			else if (inputHelper.isMouseClicked() == true)
			{
				this.updateForTimerTick_Input_Mouse(universe);
			}
		}
	}

	VenueStarsystem.prototype.updateForTimerTick_Input_Mouse = function(universe)
	{
		var inputHelper = universe.inputHelper;
		inputHelper.isMouseClicked(false);

		universe.soundHelper.soundWithNamePlayAsEffect(universe, "Sound");
		var mouseClickPos = inputHelper.mouseClickPos.clone();

		var camera = this.camera;

		var rayFromCameraThroughClick = new Ray
		(
			camera.loc.pos,
			camera.coordsTransformViewToWorld
			(
				mouseClickPos, true // ignoreZ
			).subtract
			(
				camera.loc.pos
			)
		);

		var bodiesClickedAsCollisions = Collision.rayAndBodies
		(
			rayFromCameraThroughClick,
			this.bodies,
			10, // bodyRadius
			[]
		);

		var bodyClicked;

		if (bodiesClickedAsCollisions.length == 0)
		{
			bodyClicked = null;
		}
		else
		{
			var bodiesClickedAsCollisionsSorted = [];

			for (var i = 0; i < bodiesClickedAsCollisions.length; i++)
			{
				var collisionToSort = bodiesClickedAsCollisions[i];

				var j = 0;
				for (j = 0; j < bodiesClickedAsCollisionsSorted.length; j++)
				{
					var collisionSorted = bodiesClickedAsCollisionsSorted[j];

					if (collisionToSort.distance < collisionSorted.distance)
					{
						break;
					}
				}

				bodiesClickedAsCollisionsSorted.insertElementAt
				(
					collisionToSort, j 
				);
			}

			var numberOfCollisions = bodiesClickedAsCollisionsSorted.length;
			if (this.selection == null || numberOfCollisions == 1)
			{
				bodyClicked = bodiesClickedAsCollisionsSorted[0].colliders[0];
			}
			else
			{
				for (var c = 0; c < numberOfCollisions; c++)
				{
					var collision = bodiesClickedAsCollisionsSorted[c];
					bodyClicked = collision.colliders[0];

					if (bodyClicked == this.selection)
					{
						var cNext = c + 1;
						if (cNext >= numberOfCollisions)
						{
							cNext = 0;
						}
						collision = bodiesClickedAsCollisionsSorted[cNext];
						bodyClicked = collision.colliders[0];
						break;
					}
				}
			}
		}

		this.updateForTimerTick_Input_Mouse_Selection(universe, bodyClicked);
	}

	VenueStarsystem.prototype.updateForTimerTick_Input_Mouse_Selection = function(universe, bodyClicked)
	{
		var inputHelper = universe.inputHelper;

		if (this.selection == null)
		{
			this.selection = bodyClicked;
		}
		else
		{
			var selectionDefnName = this.selection.defn.name;
			if (selectionDefnName == "Cursor")
			{
				var cursor = this.selection;

				var cursorBodyParentName = cursor.bodyParent.constructor.name;

				if (cursorBodyParentName == "Ship")
				{
					if (bodyClicked != null && bodyClicked.defn.name != "Cursor")
					{
						var targetBody = bodyClicked;

						var ship = cursor.bodyParent;

						ship.order = new Order
						(
							"Go",
							targetBody
						);

						this.cursorClear();

						inputHelper.isEnabled = false;

						ship.order.obey(ship);
					}
					else if (cursor.hasXYPositionBeenSpecified == false)
					{
						cursor.hasXYPositionBeenSpecified = true;
					}
					else if (cursor.hasZPositionBeenSpecified == false)
					{
						var targetBody = new Body
						(
							"Target", 
							new BodyDefn
							(
								"MoveTarget", 
								new Coords(0, 0, 0)
							), 
							cursor.loc.pos.clone()
						); 

						var ship = cursor.bodyParent;

						ship.order = new Order
						(
							"Go",
							targetBody
						);

						this.cursorClear();

						inputHelper.isEnabled = false;

						ship.order.obey(ship);
					}
				}
			}
			else if (this.selection == bodyClicked)
			{
				if (selectionDefnName == "Planet")
				{
					var layout = bodyClicked.layout;
					var venueNext = new VenueLayout(this, layout);
					venueNext = new VenueFader(venueNext, universe.venueCurrent);
					universe.venueNext = venueNext;
				}
			}
			else
			{
				this.selection = bodyClicked;
			}
		}


	}

	// camera

	VenueStarsystem.prototype.cameraCenterOnSelection = function()
	{
		if (this.selection != null)
		{
			var cameraConstraint = this.camera.constraints["PositionOnCylinder"];
			cameraConstraint.center.overwriteWith(this.selection.loc.pos);
		}
	}

	VenueStarsystem.prototype.cameraDown = function(cameraSpeed)
	{
		new Action_CylinderMove_DistanceAlongAxis(cameraSpeed).perform(this.camera);
	}

	VenueStarsystem.prototype.cameraIn = function(cameraSpeed)
	{
		new Action_CylinderMove_Radius(0 - cameraSpeed).perform(this.camera);
	}

	VenueStarsystem.prototype.cameraLeft = function(cameraSpeed)
	{
		new Action_CylinderMove_Yaw(0 - cameraSpeed).perform(this.camera);
	}

	VenueStarsystem.prototype.cameraOut = function(cameraSpeed)
	{
		new Action_CylinderMove_Radius(cameraSpeed).perform(this.camera);
	}

	VenueStarsystem.prototype.cameraReset = function()
	{
		new Action_CylinderMove_Reset().perform(this.camera);
	}

	VenueStarsystem.prototype.cameraRight = function(cameraSpeed)
	{
		new Action_CylinderMove_Yaw(cameraSpeed).perform(this.camera);
	}

	VenueStarsystem.prototype.cameraUp = function(cameraSpeed)
	{
		new Action_CylinderMove_DistanceAlongAxis(0 - cameraSpeed).perform(this.camera);
	}

	// controls

	VenueStarsystem.prototype.controlBuild = function(universe)
	{
		var returnValue = null;

		var display = universe.display;
		var containerMainSize = display.sizeInPixels.clone();
		var fontHeightInPixels = display.fontHeightInPixels;
		var controlHeight = 16;
		var margin = 10;
		var containerInnerSize = new Coords(100, 60);
		var buttonWidth = (containerInnerSize.x - margin * 3) / 2;

		var controlBuilder = universe.controlBuilder;

		var returnValue = new ControlContainer
		(
			"containerStarsystem",
			new Coords(0, 0), // pos
			containerMainSize,
			// children
			[
				new ControlButton
				(
					"buttonBack",
					new Coords
					(
						(containerMainSize.x - buttonWidth) / 2, 
						containerMainSize.y - margin - controlHeight
					), // pos
					new Coords(buttonWidth, controlHeight), // size
					"Back",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var venueNext = universe.venueCurrent.venueParent;
						venueNext = new VenueFader(venueNext, universe.venueCurrent);
						universe.venueNext = venueNext;
					}
				),

				controlBuilder.timeAndPlace
				(
					universe,
					containerMainSize, 
					containerInnerSize, 
					margin,
					controlHeight
				),

				controlBuilder.view
				(
					universe,
					containerMainSize, 
					containerInnerSize, 
					margin,
					controlHeight
				),

				controlBuilder.selection
				(
					universe,
					new Coords
					(
						containerMainSize.x - margin - containerInnerSize.x,
						margin
					),
					new Coords
					(
						containerInnerSize.x, 
						containerMainSize.y - margin * 2
					), 
					margin,
					controlHeight
				),

			]
		);

		returnValue = new ControlContainerTransparent(returnValue);

		return returnValue;
	}
}
