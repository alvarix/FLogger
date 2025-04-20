# Components


## Routes and route components

- **main** : **App** — The main app at the primary route has these components 
- **dbauthpopup** : **DbAuthPopup** — There's a second route for the Dropbox PKCE authentication and authorization flow.

## Main components

- **main** : **App**
  - **Head** — Displays the app logo and user settings menu
  - **Login** — The option to log in if not already.
  - **FlogList** — If logged in, display either a list of the user's flogs, or...
  - **Flog** — An open flog. Actually can display multiple, although the app doesn't offer an opportunity to open a second one at present.

- **dbauthpopup** : **DbAuthPopup**
  - **DropBoxAuth** — A component that shows an in progress spinner and handles the return redirect from Dropbox.

## Main components breakdown

  - **Head**
    - **ThemeSwitcher** — A light/dark mode toggler.

  - **Login**
    - **Intro** — Homepage content for unauthenticated users.
    - **Modal** — A modal is displayed while the Dropbox flow is happening in a popup.

  - **FlogList**
    - **AddFlog**

  - **Flog**
    - **Pretext**
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


# Documentation practice

## TSDocs

Considering adopting TSDocs format. This allows immediate utility in IDEs and with linting tools.

 - The comment block should go at the top of the ```<script setup lang="ts">``` tag.
 - SFC props should be defined with the @param tag

## Linting

Using eslint and typescript-eslint. Config settings are in ```eslint.config.mjs```.

Releases should pass the linting test:

```shell
yarn eslint .
```

Also installed ```vue-tsc``` and ```vite-plugin-checker```. This will validate ts in vue files. You can run in on demand in a shell, or in watch mode (in a separate shell parallel to the vite dev mode). But ```vite-plugin-checker``` runs vue-tsc in a separate worker thread during development from the ```yarn dev``` command.

On demand CLI:

```shell
yarn vue-tsc --noEmit
```

We have a package script to shorten this to:

```shell
yarn vue-tsc
```

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
 *     - ImportedComponent from '@/components/path/ImportedComponent.vue' - Describes its role.
 *   @composables
 *   @modules
 */
```

# TypeScript

Using TS for the standard reasons. With Vite+Vue there is no useful or easy tooling to autogenerate documentation. But the type error checking and type-based auto-completion in IDE are useful.

Best practices for creating Vue SFC files with TS:
 - Use ```<script setup lang="ts">``` (or ```<script setup lang="tsx">``` for JSX) to enable TypeScript support. 
 - Use defineProps to declare and type-check component props. 
 - Use defineEmits to declare and type-check emitted events. 
 - Use defineOptions (for Options API) or defineComponent (for Composition API) to specify component options and type them. 
   - Haven't found a use case convincing enough to use defineComponent over ```<script setup>```. Except perhaps the explicit code organization into props, data, watchers, etc.
 - Use ref and computed for reactive variables and computed properties, and specify their types. 
   - Always define ref vars as ```const```!


