# About the code

Initialize Vue App
* yarn install
* yarn dev


Dropbox Auth process
* Dropbox flogger.notes@gmail.com
* Create app folder 
* https://www.dropbox.com/developers/apps
* set Redirect URL
* get client ID for SDK (App Key?)
* Enable More users (Apply for Production Status)

This app ... 
* is created using Vue 3 + Vite
* uses composition mode single file components
* uses modules and vue plugins written in either JavaScript or TypeScript

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

# How to contribute

We adopt the following collaboration process:

All work is planned using [Issues](https://github.com/alvarix/FLogger/issues) prioritized into [Milestones](https://github.com/alvarix/FLogger/milestones).

1) Start work by picking up an unassigned issue from the earliest incomplete milestone. 
   1) Assign the issue to yourself.
   2) Create a branch for the issue (off of main).
   3) Work locally on your issue branch.
   4) We encourage you to commit your work in progress at logical increments, but also daily or so, and to push to origin every time as a backup.
   5) Once you believe your code satisfies the issue and is ready for review and integration...
      1) You must bring your branch up to date with main. Fetch the latest from origin, and pull/merge main into your issue branch. Resolve any conflicts, and make sure your issue code is functioning as expected.
         1) We encourage you to fetch and merge from main routinely if your work on your issue code lasts for days+.
      2) Open a Pull Request from your issue branch to main. 
         1) Tag alvarix and/or chadcrume as reviewers for your PR.
         2) You should receive a github email notification from the vercel bot letting you know that your branch passes the build test.
2) PR reviewers give feedback or ask questions as comments in the github PR code review.
   1) Check that branch is not behind main.
   2) Check that all the checks on the github PR passed.
   3) ... need to elaborate review checklist ...
3) Once approved by either alvarix or chadcrume, the PR can be merged.
   1) Anyone working on their own issue branches are responsible for pulling the latest from main, and reconciling any conflicts, before their issue branch PR is considered ready to review and merge. (See step 1.5.1 above.)


