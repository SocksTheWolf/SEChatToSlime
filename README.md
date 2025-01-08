This project tries to simply convert existing StreamElements widget files for usage with slime.

### Overview

It's mostly just a glorified find/replace system + a function bridge file but otherwise should just work for the most part.
Output zip file is widget.html, use that as your browser source (see slime2 OBS settings [here](https://forums.slime2.stream/resources/widget-setup.3/)).

This will not convert your existing StreamElements widgets to work with slime settings. It's not really made to, but could in the future if someone wanted to add that.

### To use

1. Go into StreamElements dashboard and download the "Data", "CSS", "JS" and "HTML" sections via the widget editor for your chat widget. Save each file with their appropriate file extension (DATA section can be saved as anything, everything else is their section names in lowercase [ex: CSS would be .css])
2. Upload your "DATA" section file to the `Data Settings` section
3. Upload your html, css and js files to the `Files` section
4. Wait for it to process
5. Download the files. Your output html can be set up like a regular slime widget.

### Special Thanks

* [JSZip](https://stuk.github.io/jszip/)
* [FileSaver](https://github.com/eligrey/FileSaver.js/)
* [RegEx101](https://regex101.com/) for just making it way more sane to build up the existing regular expressions