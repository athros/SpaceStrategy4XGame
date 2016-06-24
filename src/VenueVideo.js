
function VenueVideo(videoName, venueNext)
{
	this.videoName = videoName;
	this.venueNext = venueNext;

	this.hasVideoBeenStarted = false;
}

{
	VenueVideo.prototype.draw = function()
	{
		// do nothing
	}

	VenueVideo.prototype.initialize = function()
	{
		// do nothing
	}

	VenueVideo.prototype.updateForTimerTick = function()
	{
		if (this.video == null)
		{
			Globals.Instance.displayHelper.hide();
			this.video = Globals.Instance.videoHelper.videos[this.videoName];
			this.video.play();
		}	

		var inputHelper = Globals.Instance.inputHelper;
		if (inputHelper.isMouseLeftPressed == true)
		{
			inputHelper.isMouseLeftPressed = false;
			this.video.stop();
		}

		if (this.video.isFinished == true)
		{
			var displayHelper = Globals.Instance.displayHelper;
			displayHelper.clear("Black");
			displayHelper.show();
			var universe = Globals.Instance.universe;
			universe.venueNext = this.venueNext;
		}
	}
}
