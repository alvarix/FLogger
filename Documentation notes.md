# Components


## Routes and route components

- **main** : **App** — The main app at the primary route has these components 
- **dbauthpopup** : **DbAuthPopup** — There's a second route for the Dropbox PKCE authentication and authorization flow.

## Main components

- **main** : **App**
  - **FloggerHead** — Displays the app logo and user settings menu
  - **DropboxLogin** — The option to log in if not already.
  - **FlogList** — If logged in, display either a list of the user's flogs, or...
  - **EditFlog** — An open flog. Actually can display multiple, although the app doesn't offer an opportunity to open a second one at present.

- **dbauthpopup** : **DbAuthPopup**
  - **DropBoxAuth** — A component that shows an in progress spinner and handles the return redirect from Dropbox.

## Main components breakdown

  - **FloggerHead**
    - **ThemeSwitcher** — A light/dark mode toggler.

  - **DropboxLogin**
    - **FloggerIntro** — Homepage content for unauthenticated users.
    - **ModalContent** — A modal is displayed while the Dropbox flow is happening in a popup.

  - **FlogList**
    - **AddFlog**

  - **EditFlog**
    - **FlogPretext**
    - **AddEntry**
    - **EntryList**
      - **Entry**


---

# App Actions

1. Entry
   1. View *
   1. Add *
   2. Edit  
   3. Delete 
2. Flogs
   1. List
   2. Create
   3. Open 
   4. Close
3. Other
   1. Connect DBX
   2. Disconnect DBX
   3. Change theme
 
# Dependency graph

Installed [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) to generate diagrams of import dependencies:

## Without node_modules

The following diagram is generated with this command: 

```shell
npx dependency-cruiser  --exclude "^node_modules" --output-type dot src | dot -T svg > dependencygraph.svg
```

[Dependecy graph without node_modules](dependencygraph.svg "Dependecy graph without node_modules")

## With node_modules

The following diagram is generated with this command: 

```shell
npx dependency-cruiser  --output-type dot src | dot -T svg > dependencygraph.svg
```

[Dependecy graph with node_modules](dependencygraph-full.svg "Dependecy graph with node_modules")

# SFC structure

```vue
<template> ... </template>
<script setup lang="ts"> ... </script>
<style> ... </style>
```


# Style conventions


## Documentation practice

Considering adopting JSDocs/TSDocs format. This allows immediate utility in IDEs and with linting tools. Although the doc generation doesn't work with Vite+Vue.

 - The comment block should go at the top of the ```<script setup lang="ts">``` tag.
 - SFC props should be defined with the @param tag


## TypeScript

Using TS for the standard reasons. With Vite+Vue there is no useful or easy tooling to autogenerate documentation. But the type error checking and type-based auto-completion in IDE are useful.

TypeScript is installed with the node package ```typescript``` and config settings are in the ```tsconfig.json``` file.


### Best practices for creating Vue SFC files with TS:

 - Use ```<script setup lang="ts">``` (or ```<script setup lang="tsx">``` for JSX) to enable TypeScript support. 
 - Use defineProps to declare and type-check component props. 
 - Use defineEmits to declare and type-check emitted events. 
 - Use defineOptions (for Options API) or defineComponent (for Composition API) to specify component options and type them. 
   - Haven't found a use case convincing enough to use defineComponent over ```<script setup>```. Except perhaps the explicit code organization into props, data, watchers, etc.
 - Use ref and computed for reactive variables and computed properties, and specify their types. 
   - Always define ref vars as ```const```!


## Vue TypeScript checking

Using ```vue-tsc``` for Vue TypeScript checking, along with ```@vue/tsconfig``` for the typescript config, and ```vite-plugin-checker``` to run vue-tsc in a worker thread along with Vite dev mode. This will validate ts in vue SFC files. 

The [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension shows vue-tsc issues in VS Code. And the ```vite-plugin-checker``` module runs vue-tsc with ```yarn dev``` and shows the issues in that terminal window. But you can also run vue-tsc on-demand in a shell (```yarn vue-tsc --noEmit```), or in watch mode in a separate shell parallel to the vite dev mode (```yarn vue-tsc --noEmit --watch```). 

The ```vue-tsc``` errors are also displayed in-browser in dev mode. You can click on the file link to open that line of code in VS Code.


## Linting (including for TypeScript and Vue)

Using ```eslint``` along with ```typescript-eslint``` and ```eslint-plugin-vue```, and dependency ```@eslint/js```. 

 - ```typescript-eslint``` enables ESLint (and Prettier, if we decide to us it) to support TypeScript.
 - ```eslint-plugin-vue``` enables checking the <template> and <script> of .vue files with ESLint, as well as Vue code in .js files.

Config settings are in ```eslint.config.mjs```. *This is not an easy config to set up.*

The [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension shows linting issues in VS Code. But you can also run in it a shell:

```shell
yarn eslint .
```

***Note:*** All builds will need to pass the linting tests.



## About using ```vue-tsc``` and ```eslint-plugin-vue``` together

An AI summary...

> Using both tools provides a more comprehensive approach to code quality:
>
>  - ```vue-tsc``` focuses on type correctness and preventing runtime errors, while ```eslint-plugin-vue``` focuses on code style, maintainability, and potential bugs.
>  - ```vue-tsc``` operates during the build process, while ESLint can be configured to run in your editor or as part of your CI/CD pipeline, providing real-time feedback and ensuring consistent code quality throughout the development process.
>
> While there might be some overlap in the issues they catch, their primary focuses are different, and using them together provides a more robust and well-rounded approach to code quality in Vue.js projects.


## IDE set up

 - VS Code
 - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension ("vue.volar")
   - This enables in-editor error messaging from vue-tsc.
 - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension ("dbaeumer.vscode-eslint")
   - This enables in-editor error messaging from eslint.



# Proposed custom component documentation sample

```

/**
 * @description A concise description of what this component does and its purpose in the application.
 * 
 * @props {Type} propName - Description of the prop and what it's used for.
 * @props {String} title - The title displayed in the component header.
 * 
 * @emits {EventName} - Description of when this event is emitted and what data it contains.
 * @emits {update:selectedItem} - Emitted when a new item is selected, contains the item object.
 *  
 * @slots
 *   default - Description of the default slot.
 *   header - Content for the component header area.
 * 
 * @computed
 *   computedPropertyName - What this computed property returns and its purpose.
 *   filteredItems - Returns filtered items based on the search query.
 * 
 * @methods
 *   methodName(param) - What this method does and when it's called.
 *   handleSubmit() - Processes form submission and validates input.
 * 
 * @watch
 *   watchedProperty - What changes are being watched and side effects.
 *   searchQuery - Triggers new API request when search input changes.
 * 
 * @dependencies
 *   external-library - Why this dependency is needed.
 *   vuex-store-modules - Which store modules this component interacts with.
 * 
 * @example
 *   <component-name
 *     :title="'My Component'"
 *     :is-active="true"
 *     @update:selected-item="handleItemSelection"
 *   >
 *     <template #header>Custom Header Content</template>
 *     Main content goes here
 *   </component-name>
 *
 *
 * @relationships
 *   @parent ParentComponentName - Describes how this component is used within the parent component.
 *   @children
 *     - ChildComponentName - Explains the purpose of this child component.
 *   @siblings
 *     - SiblingComponent - Explains how this component interacts with sibling components.
 * @imports
 *   @components
 *     - ImportedComponent from '@components/path/ImportedComponent.vue' - Describes its role.
 *   @composables
 *   @modules
 */
```

