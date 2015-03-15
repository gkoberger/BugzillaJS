# DOWNLOAD THE ADD-ON

https://addons.mozilla.org/en-US/firefox/addon/bugzillajs/

# DEVELOPING THE ADD-ON (OSX Only!)

BugzillaJS requires Omnium (cross-browser pagemods), and can be installed
like this:

    git clone git@github.com:gkoberger/omnium.git --recursive
    cd omnium
    npm install

    git clone git@github.com:gkoberger/BugzillaJS.git bugzillajs
    ./builder.js bugzillajs

This should open up an install button in Firefox.

Omnium is just a wrapper that I use to generate XPI files.  It takes care of
figuring out all the page-mod logic.

# TESTING THE ADD-ON

Once you have it installed, check out the following URL to see it in action:

https://bugzilla.mozilla.org/show_bug.cgi?id=574290

# FEATURES

You can turn features on and off by clicking the "BugzillaJS Preferences" link
at the top and bottom of every page.  You need to refresh the page to see them
come into effect.

## Keyboard Shortcuts
To view all keyboard shortcuts, type "?" on any page.
- Enable keyboard shortcuts

## Improve Comments
Make the comments on bugs more readable.
- Turn timestamps into relative dates
- Highlight reporter and assignee comments
- Add scrollbar to overflowing comments
- Hide the first comment if empty

## Show inline media
Show images and other types of content right in the comments.
- Display images and attachments as an inline gallery
- Use lightbox for images
- Show GitHub logs inline
- Show gravatars in comments

## Improve Bugs
These pertain to editing bugs.
- Style the comments like Github
- Remove flags, status and blocking fields
- Remove access keys
- Don't guess OS and hardware
- Add a "new" link for dependent and blocking fields
- Add a "browse" link for component fields
- Show inline Treeherder results

## Listing Pages
These modify parts of the pages with lists of bugs.
- Option to open all bugs in tabs
- Agile Backlog

## Miscellaneous
These are other tidbits that do not fit into other categories.
- Makes saved searches into a dropdown (requires Mozilla skin)

# CONTRIBUTE

If you have an idea for an extra feature, either ask me to implement it or
you can implement it yourself and submit a patch.  I'll do a better job in the
future of cleaning up the code and possibly making it API-like.

# TROUBLESHOOTING

- It conflicts with other Bugzilla Jetpacks and Userscripts, including the
  Bugzilla Tweaks Jetpack running.
- Developing on it has only been tested on OSX; it probably won't work anywhere
  else.

## IF THERE IS A CONFLICT WITH ANOTHER SCRIPT

  Simply disabling the feature in the Bugzilla Preferences should fix it.

## STILL HAVE ISSUES?

  Post an issue, or contact me at gkoberger [a] gkoberger [dot] com
