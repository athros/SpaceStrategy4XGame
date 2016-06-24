
function VenueTalkSession(venueParent, talkSession)
{
	this.venueParent = venueParent;
	this.talkSession = talkSession;
}

{
	VenueTalkSession.prototype.draw = function()
	{
		this.venueControls.draw();
	}

	VenueTalkSession.prototype.initialize = function()
	{
		var controlRoot = this.controlBuild();
		this.venueControls = new VenueControls(controlRoot);
		this.talkSession.update();
	}

	VenueTalkSession.prototype.updateForTimerTick = function()
	{

		this.venueControls.updateForTimerTick();		
	}

	// controls

	VenueTalkSession.prototype.controlBuild = function()
	{
		var containerSize = Globals.Instance.displayHelper.viewSize.clone();
		var margin = 10;
		var controlHeight = 15;

		var returnValue = new ControlContainer
		(
			"containerConfigure",
			ControlBuilder.ColorsForeAndBackDefault,
			new Coords(0, 0), // pos
			containerSize,
			// children
			[
				new ControlButton
				(
					"buttonDone",
					new Coords
					(
						margin, margin	
					), // pos
					new Coords
					(
						controlHeight, controlHeight
					), // size
					"<",
					null, // dataBindingForIsEnabled
					// click
					function ()
					{
						var universe = Globals.Instance.universe;
						var venueNext = universe.venueCurrent.venueParent;
						venueNext = new VenueFader(venueNext);
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
					null, // dataBindingForIsEnabled
					// click
					function ()
					{
						var talkSession = Globals.Instance.universe.venueCurrent.talkSession;
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
					new DataBinding(this.talkSession, "displayTextCurrent")
				),


				new ControlSelect
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
					// dataBindingForValueSelected
					new DataBinding(this.talkSession, "optionSelected"),
					// options
					new DataBinding
					(
						this.talkSession, "optionsAvailable"
					),
					null, // bindingExpressionForOptionValues
					"text", // bindingExpressionForOptionText
					new DataBinding(true), // isEnabled
					4 // numberOfItemsVisible
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
					// dataBindingForIsEnabled
					new DataBinding(this.talkSession, "hasResponseBeenSpecified"), 
					// click
					this.talkSession.respond.bind(this.talkSession)
				),	
			]
		);

		return returnValue;
	}
}
