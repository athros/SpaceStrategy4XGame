
function TechnologyResearchSession(technologyTree, researcher)
{
	this.technologyTree = technologyTree;
	this.researcher = researcher;
}

{
	// static methods

	TechnologyResearchSession.demo = function()
	{
		var technologies =
		[
			new Technology("A", 	5, 	[], 	[]),
			new Technology("A.1", 	8, 	["A"], 	[]),
			new Technology("A.2", 	8, 	["A"], 	[]),
			new Technology("A.3", 	8, 	["A"], 	[]),
			new Technology("B", 	5, 	[], 	[]),
			new Technology("C", 	5, 	[], 	[]),

			new Technology("A+B", 	10, 	["A", "B"], []),
			new Technology("A+C", 	10, 	["A", "C"], []),
			new Technology("B+C", 	10, 	["B", "C"], []),

			new Technology("A+B+C", 15, 	["A", "B", "C"], 	[]),

			new Technology("(A+B)+(B+C)", 	20, 	["A+B", "B+C"], 	[]),
		];

		var technologyTree = new TechnologyTree
		(
			"All Technologies",
			technologies
		);

		var researcher = new TechnologyResearcher
		(
			"Researcher0",
			null, // nameOfTechnologyBeingResearched,
			0, // researchAccumulated
			// namesOfTechnologiesKnown
			[
				"A",
			]
		);

		var researchSession = new TechnologyResearchSession
		(
			technologyTree,
			researcher
		);

		return researchSession;
	}

	// instance methods

	TechnologyResearchSession.prototype.isResearchNotInProgress = function()
	{
		var returnValue = (this.researcher.researchAccumulated == 0);
		return returnValue;
	}

	TechnologyResearchSession.prototype.isTechnologyBeingResearched = function()
	{
		return (this.researcher.nameOfTechnologyBeingResearched != null);
	}

	TechnologyResearchSession.prototype.researchAccumulatedIncrement = function
	(
		universe,
		amountToIncrement
	)
	{
		this.researcher.researchAccumulatedIncrement(universe, amountToIncrement);
	}

	TechnologyResearchSession.prototype.researchRequired = function()
	{
		var technologyBeingResearched = this.technologyBeingResearched();
		var returnValue = 
		(
			technologyBeingResearched == null 
			? 0 
			: technologyBeingResearched.researchRequired
		);
		return returnValue;
	}

	TechnologyResearchSession.prototype.technologyBeingResearched = function()
	{
		var techName = this.researcher.nameOfTechnologyBeingResearched;
		var returnValue = this.technologyTree.technologies[techName];

		return returnValue;
	}

	// controls

	TechnologyResearchSession.prototype.controlBuild = function(universe)
	{
		var display = universe.display;
		var size = display.sizeInPixels;
		var margin = display.fontHeightInPixels;
		var labelHeight = display.fontHeightInPixels;
		var buttonHeight = labelHeight * 2.5;

		var returnValue = new ControlContainer
		(
			"containerResearchSession", // name, 
			new Coords(0, 0), // pos, 
			size, 
			// children
			[
				new ControlLabel
				(
					"labelResearcher", // name, 
					new Coords(margin, margin), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding("Researcher:") //text
				),

				new ControlLabel
				(
					"textResearcher", // name, 
					new Coords(70, margin), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding(this.researcher.name) //text
				),

				new ControlLabel
				(
					"labelTechnologiesKnown", // name, 
					new Coords(margin, 30), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding("Technologies Known:") //text
				),

				new ControlList
				(
					"listTechnologiesKnown",
					new Coords(margin, 45), // pos
					new Coords(110, 50), // size
					// items
					new DataBinding
					(
						this.researcher.namesOfTechnologiesKnown,
						null
					),
					null, // bindingExpressionForItemText
					labelHeight // fontHeightInPixels
				),

				new ControlLabel
				(
					"labelTechnologiesAvailable", // name, 
					new Coords(140, 30), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding("Technologies Available:") // text
				),

				new ControlList
				(
					"listTechnologiesAvailable", // name, 
					new Coords(140, 45), // pos, 
					new Coords(110, 50), // size, 
					// items,
					new DataBinding
					(
						this, "researcher.technologiesAvailable()" 
					),
					"name", // bindingExpressionForItemText
					labelHeight, // fontHeightInPixels
					new DataBinding(this.researcher, "nameOfTechnologyBeingResearched"), // bindingForItemSelected
					"name" // bindingExpressionForItemValue
				),

				new ControlLabel
				(
					"labelTechnologyBeingResearched", // name, 
					new Coords(margin, 120), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding("Technology Being Researched:") // text
				),

				new ControlLabel
				(
					"textTechnologyBeingResearched", // name, 
					new Coords(160, 120), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding
					(
						this.researcher, 
						"nameOfTechnologyBeingResearched"
					)
				),

				new ControlLabel
				(
					"labelResearchAccumulated", // name, 
					new Coords(margin, 135), // pos, 
					new Coords(size.x - margin * 2, labelHeight), // size, 
					false, // isTextCentered, 
					new DataBinding("Research Accumulated:") // text
				),

				new ControlLabel
				(
					"textResearchAccumulated", // name, 
					new Coords(120, 140), // pos, 
					new Coords(30, labelHeight), // size, 
					true, // isTextCentered, 
					new DataBinding(this.researcher, "researchAccumulated") // text
				),

				new ControlLabel
				(
					"labelSlash", // name, 
					new Coords(130, 140), // pos, 
					new Coords(30, labelHeight), // size, 
					true, // isTextCentered, 
					new DataBinding("/") // text
				),

				new ControlLabel
				(
					"textResearchRequired", // name, 
					new Coords(140, 140), // pos, 
					new Coords(30, labelHeight), // size, 
					true, // isTextCentered, 
					new DataBinding(this, "researchRequired()") // text
				),

				new ControlButton
				(
					"buttonResearchPlusOne", //name, 
					new Coords(margin, 155), //pos, 
					new Coords(buttonHeight * 4, buttonHeight), // size, 
					"Research + 1", // text, 
					labelHeight, // fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe) 
					{ 
						var session = universe.venueCurrent.researchSession;
						session.researchAccumulatedIncrement(universe, 1);
					}
				),

				new ControlButton
				(
					"buttonBack", //name, 
					new Coords(margin, size.y - margin - buttonHeight), //pos, 
					new Coords(buttonHeight, buttonHeight), // size, 
					"Back", // text, 
					labelHeight, // fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe) 
					{ 
						var venueNext = new VenueWorld(universe.world);
						venueNext = new VenueFader(venueNext, universe.venueCurrent);
						universe.venueNext = venueNext;
					}
				)

			]
		);

		this.control = returnValue;

		return returnValue;
	}
}