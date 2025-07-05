<template>
  <aside class="vue-file">MarkedText.vue</aside>

  <div
    id="live-md"
    :ref="bindLiveMdEl"
    contenteditable
    @change="changeLiveMd"
    v-html="liveMarkedHtmlString"
  ></div>
</template>

<script setup>
// Vue 3 Composition API imports
import { ref, defineExpose, watch, onMounted, onUnmounted } from "vue";
// Markdown parsing library
import { marked } from "marked";
// Utility functions for text processing and DOM manipulation
import {
  getIdString,
  buildRegexFromArray, // TODO: Remove unused import
  renderTextWithTagsMarkedup,
} from "@/modules/utilities";

// Component props definition with TypeScript-style validation
const { rawText, tags, editable, idSuffix } = defineProps({
  rawText: {
    type: String,
    default: "",
  },
  tags: {
    type: Array,
    default: () => [],
    optional: true,
  },
  editable: {
    type: Boolean,
    default: false,
    optional: true,
  },
  idSuffix: {
    type: String,
    default: "",
    optional: true,
  },
});

// Event emitter for tag selection
const emit = defineEmits(["tag-selected"]);

/**
 * Handles tag selection events and emits them to parent component
 * @param {string} tag - The selected tag text
 */
const handleTagSelect = (tag) => {
  emit("tag-selected", tag);
};

// Custom markdown renderer configuration
// Followed approach shown here: https://dev.to/pyrsmk/how-to-use-the-contenteditable-attribute-in-vue-3-a89
const renderer = {
  /**
   * Custom heading renderer that adds clickable tags and anchor links
   * @param {Object} params - Object containing tokens and depth
   * @returns {string} HTML string for the heading
   */
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const headingId = getIdString(`${text} ${idSuffix}`);
    // Only apply tag markup for h1 elements when tags are available
    const taggedText =
      depth > 1 || tags.length == 0
        ? text
        : renderTextWithTagsMarkedup(text, tags);
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
    return `
      <h${depth} id="${headingId}" contenteditable class="md-focus">
        <a name="${escapedText}" href="#${escapedText}">
          <span></span>
        </a>
        ${taggedText}
      </h${depth}>`;
  },
  /**
   * Custom strong/bold text renderer
   * @param {Object} params - Object containing tokens
   * @returns {string} HTML string for strong text
   */
  strong({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `
      <strong contenteditable class="md-focus">
        ${text}
      </strong>`;
  },
};

/**
 * Binds click event listeners to tag elements for interactive tag selection
 * @param {HTMLElement} el - The container element
 */
const bindLiveMdEl = (el) => {
  const tagEls = el?.getElementsByClassName("md-tag");
  if (tagEls)
    Array.from(tagEls).forEach((el) => {
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        handleTagSelect(el.textContent);
      });
    });
};

// Configure marked.js with custom renderers
marked.use({
  extensions: [
    {
      name: "heading",
      renderer: renderer.heading,
    },
  ],
});

marked.use({
  extensions: [
    {
      name: "strong",
      renderer: renderer.strong,
    },
  ],
});

// Reactive references for markdown content and DOM element
const markdownHtml = ref(rawText || "");
const liveMdEl = ref();

// Expose the live markdown element for external access
// This allows parent components to access the element's innerText properties
defineExpose({ liveMdEl });

// Reactive reference for the rendered HTML string
const liveMarkedHtmlString = ref(rawText);

// Watch for changes in markdown content and re-render HTML
watch(
  markdownHtml,
  async () => {
    liveMarkedHtmlString.value = await marked.parse(markdownHtml.value);
  },
  { immediate: true }
);

/**
 * Handles changes to the live markdown content
 * Note: This function appears to have a bug - should use innerHTML instead of innerHtml
 */
const changeLiveMd = () => {
  liveMarkedHtmlString.value.innerHtml = marked.parse(markdownHtml.value);
};

// Reference to track the currently active element
const currentEl = ref();

/**
 * Handles selection change events to show markdown syntax hints
 * @param {Event} event - The selection change event
 */
const selectionchange = (event) => {
  // Ignore composition events (IME input)
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  
  // Get the current selection information
  let grab = document.getSelection(),
    text = grab.baseNode || 0,
    node = text.parentNode;

  // Only process if we have a new node and it's different from current
  if (node && node !== currentEl.value) {
    // Clean up previous element's markdown hints
    if (currentEl.value) {
      Array.from(currentEl.value.getElementsByClassName("md-explicit")).forEach(
        (el) => el.remove()
      );
      currentEl.value.className = currentEl.value.className.replace(
        " md-active",
        ""
      );
      currentEl.value = undefined;
    }
    
    // Add markdown hints to new element if it's within our container
    if (liveMdEl.value.contains(node)) {
      currentEl.value = toMarkedUXHtmlString(node);
      currentEl.value.className += " md-active";
    }
  }
};

/**
 * Adds visual markdown syntax hints to different HTML elements
 * @param {HTMLElement} node - The DOM element to add hints to
 * @returns {HTMLElement} The modified element
 */
const toMarkedUXHtmlString = (node) => {
  switch (node.tagName) {
    case "H1":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit"># </span>`
      );
      return node;
    case "H2":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">## </span>`
      );
      return node;
    case "H3":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">### </span>`
      );
      return node;
    case "H4":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">#### </span>`
      );
      return node;
    case "H5":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">##### </span>`
      );
      return node;
    case "H6":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">####### </span>`
      );
      return node;
    case "STRONG":
    case "B":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">**</span>`
      );
      node.insertAdjacentHTML(
        "beforeend",
        `<span class="md-explicit">**</span>`
      );
      return node;
    case "EM":
    case "I":
      node.insertAdjacentHTML(
        "afterbegin",
        `<span class="md-explicit">*</span>`
      );
      node.insertAdjacentHTML(
        "beforeend",
        `<span class="md-explicit">*</span>`
      );
      return node;
    default:
      return node;
  }
};

// Lifecycle hooks for event listener management
onMounted(() => {
  // Only add selection change listener if component is editable
  if (editable) document.addEventListener("selectionchange", selectionchange);
});

onUnmounted(() => {
  // Clean up event listener when component is destroyed
  if (editable)
    document.removeEventListener("selectionchange", selectionchange);
});
</script>

<style>
.md-explicit {
  color: red;
}
.md-active {
  color: #777;
}
.md-tag {
  border: 1px dashed blue;
}
/* b.md-active::before,
b.md-active::after,
strong.md-active::before,
strong.md-active::after {
  content: "**";
}
h1.md-active::before {
  content: "#";
}
h2.md-active::before {
  content: "##";
}
h3.md-active::before {
  content: "###";
}
h4.md-active::before {
  content: "####";
}
h5.md-active::before {
  content: "#####";
}
h5.md-active::before {
  content: "######";
} */
</style>
