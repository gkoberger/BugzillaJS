DEMO
===============================================================================

[ Temporarily not working ]
http://gkoberger.net/bugzilla/demo/index.html

DOWNLOAD THE ADD-ON
===============================================================================

https://addons.mozilla.org/en-US/firefox/addon/bugzillajs/

DEVELOPING THE ADD-ON (OSX Only!)
-------------------------------------------------------------------------------

BugzillaJS requires Omnium (cross platform pagemods), and can be installed
like this:

    mkdir omnium
    cd omnium
    git clone git@github.com:gkoberger/omnium.git --recursive .
    git clone git@github.com:gkoberger/BugzillaJS.git bugzillajs
    python builder.py bugzillajs

This should open up an install button in Firefox.

Omnium is just a wrapper that I use to generate XPI files.  It takes care of
figuring out all the page mod logic.

TESTING THE ADD-ON
===============================================================================

Once you have it installed, check out the following URL to see it in action:

https://bugzilla.mozilla.org/show_bug.cgi?id=574290

Or, use the URL above to demo it before installing it.

FEATURES
===============================================================================

You can turn features on and off by clicking the "BugzillaJS Preferences" link
at the top and bottom of every page.  You need to refresh the page to see them
come into effect.

#### PREFERENCES

  You can turn all features on and off in the preferences (the "BugzillaJS
  Preferences" link at the top and bottom of every page).

#### SHOW CHANGES

  This will show the changes to the bug inline.  Things like status,
  assigned_to, cc, etc are shown (and, if applicable, attached to the relevant
  comment).

  [Inspired by Bugzilla Tweaks; thanks to potch for the idea/help]

#### GIT LOGS INLINE

  If a link to a github commit is posted, the changes will be shown inline.

#### IMAGE GALLERY

  If a link to an image is posted, there will be a gallery inline

#### LIGHTBOX

  View images as a lightbox, so you don't have to open a new window

#### HIDE EMPTY FIRST COMMENT

  If the first comment is empty, it's not shown.

#### PRETTY DATES

  Replaces timestamps with relative dates (such as "Last week")

#### GRAVATARS

  Show an avatar in the comments

#### GIT STYLE COMMENTS

  Sylizes the comments to look like github comments

#### REMOVE FLAGS

  Remove the flags field in the bugs (off by default)

#### REMOVE ACCESSIBILITY KEYS

  Remove the accessibility keys (off by default)

#### DON'T GUESS HARDWARE OR OS

  Don't attempt to guess the system info, but include a link to guess. (off
  by default).

#### FILL IN PRODUCT FOR "CLONE BUG" LINK

  Automatically select the product and componenet when clicking the Clone
  Bug link on the bottom right of the page.

#### NEW DEPENDANT/BLOCKER BUG LINK

  Adds a link next to "Depends On" and "Blocks" fields to create a new
  dependant/blocker bug for the current bug.

#### AGILE BACKLOG

  Enable Agile backlog features on bug searches with whiteboard column
  See http://groovecoder.com/2011/07/18/bugzilla-agile/

TODO / KNOWN BUGS
===============================================================================

- Use thumbnails for gallery, not full images with a width+height

CONTRIBUTE
===============================================================================

If you have an idea for an extra feature, either ask me to implement it or
you can implement it yourself and submit a patch.  I'll do a better job in the
future of cleaning up the code and possibly making it API-like.

TROUBLESHOOTING
===============================================================================

 - It conflicts with other Bugzilla Jetpacks and Userscripts, including the
   Bugzilla Tweaks Jetpack running.
 - Developing on it has only been tested on OSX; it probably won't work anywhere
   else.

IF THERE IS A CONFLICT WITH ANOTHER SCRIPT:
  Simply disabling the feature in the Bugzilla Preferences should fix it.

STILL HAVE ISSUES?
  Contact me at gkoberger [a] mozilla [dot] com
