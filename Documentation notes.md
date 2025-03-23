# Notes
- DropBoxFlogs.vue 
  - The main UI window (used to be)
    - auth
    - Flogs list
- useFLogs.ts 
  - is the workhorse 
  - and the interface btwn UI and DBX?

---

# Documentation ideas
1. List major functions, then minor functions (Arcanca, Assign player roles)
2. 
# Refactor ideas
1. Rename files for their centrality in the app (or include components therein)
   1. eg: Home (import )
2. Break up monolith files
   1. useFlogs
      1. display
      2. edit 
      3. delete 
      4. ...
   2. 

3. Remove any mention of Dropbox past the data interface
4. OpenFlogs = OpenFlog etc down the chain
5. 
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
 
# App Views
1. Entry
2. Flogs
3. DBX

# Embeds
1. App.vue
   1. ThemeSwitcher
   2. DropBoxFlogs
      1. useDropboxFlogs
         1. modules/Flog
         2. useDropboxFiles
      2. useFlogs
         1. modules/EntryData
         2. modules/Flog
         3. useDropboxFiles
      3. AddFlog
      4. Intro
         1. useDropboxFlogs
      5. Modal
   3. OpenFlogs
      1. useFlogs
      2. modules/EntryData
      3. modules/Flog
      4. AddEntry
         1. modules/EntryData
      5. EntryList
         1. Entry
            1. modules/EntryData
         2. modules/EntryData
      6. Pretext

1. App.vue
   1. ThemeSwitcher
   2. DropBoxFlogs
      3. AddFlog
      4. Intro
      5. Modal
   3. OpenFlogs
      3. modules/Flog
      4. AddEntry
      5. EntryList
         1. Entry
      6. Pretext

# Embeds rethought
1. Login
   1. Modal
   2. Intro
2. Flog
   1. NewEntry
   2. EntryList
      1. Entry
         1. Pretext
3. FlogList
   1. AddFlog
   2. DeleteFLog
      
         





# Component documentation sample

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