# StreamElements Chat Widgets to Slime2

This project tries to simply convert existing StreamElements widget files for usage with [slime](https://slime2.stream/).

## Overview

It's mostly just a glorified find/replace system + a function bridge file but otherwise should just work for the most part.
Output zip file is widget.html, use that as your browser source (see slime2 OBS settings [here](https://forums.slime2.stream/resources/widget-setup.3/)).

### Features

* Translates SE Chat + Basic Widgets to be usable in a slime2 setup
* Bridged library for handling streamelements API code -> slime2 API code
* Provides an zip folder with your converted widget code
* Most (if not all) results require any further code modifications
* Directly injects existing StreamElements user settings into the widgets
* Support for pronouns if your widget supports it too!
* Free

## To use

1. Go into StreamElements dashboard and download the "Data", "CSS", "JS" and "HTML" sections via the widget editor for your chat widget. Save each file with their appropriate file extension (DATA section can be saved as anything, everything else is their section names in lowercase [ex: CSS would be .css])
2. Go to the [project url on this github page](https://socksthewolf.github.io/SEChatToSlime/).
3. Upload your "DATA" section file to the `Data Settings` section
4. Upload your html, css and js files to the `Files` section
5. Wait for it to process
6. Download the files. Your output html can be [setup like a regular slime widget](https://forums.slime2.stream/resources/widget-setup.3/).

A video version of the above can be found below:

[![Fun Helping Guide](https://img.youtube.com/vi/FTSqXM53kjM/0.jpg)](https://youtu.be/FTSqXM53kjM)

## Caveats
Due to this being a simple automation, there are some things that cannot be dynamically resolved.
This isn't always because of this tool, but because one platform had features the other doesn't (or will not).

As some have asked, this tool could be used for other SE widgets (technically not just chat), however, there are a few points to make note of...

### Limitations of slime2
These are features missing in slime2, as such, any widgets that relied on this won't work properly.
If you are converting a chat widget, you likely will not be using these anyways...

* SE specific events (such as donations, merch purchases, etc) will not appear
* Follow and initial sub events are not handled. There are mentions in the slime2 docs about adding this in the future.
* Because of the last point, stream labels may only partially work.
* You cannot send messages to chat.

### Limitations of StreamElements
Features that slime2 has but StreamElements never had functionality for.
If you want something in this section, you'll need to either have a widget that had support for this functionality anyways, or make modifications yourself.

* Partner Cheeremotes do not display the image reliably.
* Displaying pronouns is supported by this tool, but unless your widget handles that data already, it won't display. SE never had this feature.
* Clearing chat was never a function that SE supports, as such, the widget refreshes itself upon the clear chat event that slime2 sends.

### Limitations of this tool
Most points in here are things I can fix in the future, I'll mention if I am planning on it.

* Does not convert any StreamElements settings fields into setable slime2 settings components, but I doubt anyone needs this.

---

### Special Thanks

* [JSZip](https://stuk.github.io/jszip/)
* [FileSaver](https://github.com/eligrey/FileSaver.js/)
* [RegEx101](https://regex101.com/) for just making it way more sane to build up the existing regular expressions
