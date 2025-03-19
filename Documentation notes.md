
# App Actions

1. Entry
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

# Component Embeds
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
         1. 
      4. Intro
      5. Modal
   3. OpenFlogs

---

---

# Component documentation sample

```

/**
 * @component ComponentName
 * @description A concise description of what this component does and its purpose in the application.
 * 
 * @props {Type} propName - Description of the prop and what it's used for.
 * @props {String} title - The title displayed in the component header.
 * @props {Boolean} isActive - Determines if the component is in active state.
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
 * @author Your Name
 * @lastModified 2025-03-16
 */
```
# Relationships documentation sample
```
/**
 * @component ComponentName
 * @description A concise description of what this component does and its purpose in the application.
 * 
 * @relationships
 *   @parent ParentComponentName - Describes how this component is used within the parent component.
 *   @children
 *     - ChildComponentName - Explains the purpose of this child component.
 *     - AnotherChildComponent - Describes when and why this component is used.
 *   @siblings
 *     - SiblingComponent - Explains how this component interacts with sibling components.
 * 
 * @imports
 *   @components
 *     - ImportedComponent from '@/components/path/ImportedComponent.vue' - Describes its role.
 *     - AnotherComponent from '@/components/path/AnotherComponent.vue' - Explains when it's used.
 *   @services
 *     - userService from '@/services/userService.js' - Explains what services this component uses.
 *   @stores
 *     - userStore from '@/store/modules/user.js' - Describes store interactions.
 *   @mixins
 *     - formMixin from '@/mixins/formMixin.js' - Explains what functionality this mixin provides.
 *   @directives
 *     - v-tooltip from '@/directives/tooltip.js' - Describes custom directives used.
 * 
 * @routeContext
 *   - Used in route '/dashboard' - Explains the routing context where this component appears.
 *   - Accessed via Named Route 'user-profile' - Specifies named routes that lead to this component.
 * 
 * @layouts
 *   - DefaultLayout - Specifies which layout this component typically appears in.
 * 
 * @api
 *   - '/api/users' (GET) - Lists API endpoints this component interacts with.
 *   - '/api/settings' (PUT) - Describes the purpose of this API interaction.
 * 
 * @fileStructure
 *   - Located in '@/components/users/' - Helps understand the file organization.
 *   - Related files: 'UserModel.js', 'userHelpers.js' - Lists related utility files.
 * 
 * ... (rest of the documentation)
 */


```