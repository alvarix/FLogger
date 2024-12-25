[Web URL](https://flogger.vercel.app)
[Github](https://github.com/alvarix/FLogger)

## About this project
Flogger was inspired by [NValt](https://brettterpstra.com/projects/nvalt/) (RIP).

It started as a way for Chad and Alvar to collaborate on a Vue project.  
Todo apps, time keeping apps - there are millions out there, but most seem over or under engineered.  
We wanted to build an app that would have some very specific super user features.

The initial scope: a cross device syncing progressively enhanced logging/notes app; it takes text files and adds a UI to highlight and manage date separated entries.

We quickly settled on Dropbox as the best way to authenticate and sync files.

Current features:
- Dropbox sync and auth
- Text file parsing to separate 'Flogs' by date into 'entries'
- Editing, copying or deleting of entries
- Create new Flog on Dropbox
- Light/dark mode
- 'Pretext' - Flog metadata that lives before the first entry
- Omni box to search flogs with autocomplete, or create new Flog if input is not matched (thanks NValt!)
- Read Only System Flogs that are managed in the repository instead of Dropbox


Wishlist:
  - Markdown
    - enhanced Markdown CLI
  - enhanced tags: key pairs
  - flog blending or comparison (compare two or more logs)
  - encryption
  - siri/alexa
  - publish to web
  - geotagger
  - time tracker
  - import from garmin, strava APIs
/*
Vue concepts:
    - composition API
    - composables
*/




