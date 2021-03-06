
function VenueTalkSession(venueParent, talkSession)
{
	this.venueParent = venueParent;
	this.talkSession = talkSession;
}

{
	VenueTalkSession.prototype.draw = function(universe)
	{
		this.venueControls.draw(universe);
	};

	VenueTalkSession.prototype.initialize = function(universe)
	{
		var controlRoot = this.controlBuild(universe);
		this.venueControls = new VenueControls(controlRoot);
		this.talkSession.update();
	};

	VenueTalkSession.prototype.updateForTimerTick = function(universe)
	{
		this.venueControls.updateForTimerTick(universe);
	};

	// controls

	VenueTalkSession.prototype.controlBuild = function(universe)
	{
		var containerSize = universe.display.sizeInPixels.clone();
		var margin = 10;
		var controlHeight = 15;
		var fontHeightInPixels = margin;

		var controlBuilder = universe.controlBuilder;

		var returnValue = new ControlContainer
		(
			"containerConfigure",
			new Coords(0, 0), // pos
			containerSize,
			// children
			[
				new ControlButton
				(
					"buttonBack",
					new Coords(margin, margin), // pos
					new Coords(controlHeight, controlHeight), // size
					"<",
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

				new ControlButton
				(
					"buttonLog",
					new Coords
					(
						containerSize.x - margin - controlHeight * 2, margin
					), // pos
					new Coords
					(
						controlHeight * 2, controlHeight
					), // size
					"Log",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{
						var talkSession = universe.venueCurrent.talkSession;
						alert(talkSession.log.join("\n"));
					}
				),

				new ControlLabel
				(
					"labelTalk",
					new Coords(margin, controlHeight + margin * 2), // pos
					new Coords
					(
						containerSize.x - margin * 2,
						controlHeight
					), // size
					false, // isTextCentered
					new DataBinding(this.talkSession, function get(c) { return c.displayTextCurrent(); } ),
					fontHeightInPixels
				),

				new ControlList
				(
					"listResponses",
					new Coords
					(
						margin, controlHeight * 2 + margin * 3
					), // pos
					new Coords
					(
						containerSize.x - margin * 2,
						controlHeight * 4
					), // size
					// options
					new DataBinding
					(
						this.talkSession, function get(c) { return c.optionsAvailable(); }
					),
					new DataBinding(null, function get(c) { return c.text(); } ), // bindingForOptionText
					fontHeightInPixels,
					// dataBindingForValueSelected
					new DataBinding(this.talkSession, function get(c) { return c.optionSelected; } ),
					null
				),

				new ControlButton
				(
					"buttonContinue",
					new Coords
					(
						margin, controlHeight * 6 + margin * 4
					), // pos
					new Coords
					(
						containerSize.x - margin * 2,
						controlHeight
					), // size
					"Continue",
					fontHeightInPixels,
					true, // hasBorder
					true, // isEnabled
					this.talkSession.respond.bind(this.talkSession, universe)
				),
			]
		);

		return returnValue;
	};
}
