<template>
  <div
    id="live-md"
    ref="liveMdEl"
    contenteditable
    @change="changeLiveMd"
    v-html="liveMarkedHtmlString"
  ></div>
</template>

<script setup>
import {
  ref,
  defineExpose,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import { marked } from "marked";

const { rawText, editable } = defineProps({
  rawText: {
    type: String,
    default: "",
  },
  editable: {
    type: Boolean,
    default: false,
    optional: true
  }
});

console.log("MarkedText rawText", rawText);

// Followed approach shown here: https://dev.to/pyrsmk/how-to-use-the-contenteditable-attribute-in-vue-3-a89

// const postprocess = (html) => {
//   // console.log("html", html.replace(/(\<[^\>]*)(\?\>)/g,`$1 onfocus="()=>console.log('hi!!!')"$2`));
//   // console.log("html", html);
//   const processedHtml = html.replace(
//     /(\<[^\>]*)(\/?\>)/g,
//     `$1 contenteditable$2`
//   );
//   console.log("processedHtml", processedHtml);
//   return processedHtml;
// };

// marked.use({ hooks: { postprocess } });

const renderer = {
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
    return `
      <h${depth} contenteditable class="md-focus">
        <a name="${escapedText}" href="#${escapedText}">
          <span></span>
        </a>
        ${text}
      </h${depth}>`;
  },
  strong({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `
      <strong contenteditable class="md-focus">
        ${text}
      </strong>`;
  },
};

marked.use({
  extensions: [
    {
      name: "heading",
      renderer: renderer.heading,
    },
  ],
});
// marked.use({ renderer });
marked.use({
  extensions: [
    {
      name: "strong",
      renderer: renderer.strong,
    },
    // {
    //   name: "heading",
    //   renderer: renderer.heading,
    // },
  ],
});

const markdownHtml = ref(rawText || "");
// markdownHtml.value = marked.parse(
//   "# Marked in the browser\n\nRendered by **marked**."
// );
const liveMdEl = ref();
// This exposes access to the elements innerText properties
// so we can put a string from marked.parse into the dom using v-html.
// Could look for an existing utility to convert the string into elements.
defineExpose({ liveMdEl });

const liveMarkedHtmlString = ref(rawText);
watch(
  markdownHtml,
  async () => {
    console.log("watch(markdownHtml");
    liveMarkedHtmlString.value = await marked.parse(markdownHtml.value);
    console.log("watch(markdownHtml", liveMarkedHtmlString.value);
  },
  { immediate: true }
);
// const liveMarkedHtmlString = computed(() => {
//   const mdhtml = marked.parse(markdownHtml.value);
//   return mdhtml;
// });
const changeLiveMd = () => {
  // markdownHtml.value += ".";
  liveMarkedHtmlString.value.innerHtml = marked.parse(markdownHtml.value);
};

// const focusin = (event) => {
//   const level =
//     ["none", "capturing", "target", "bubbling"][event.eventPhase] ?? "error";
//   console.log("focusin", level);

//   // console.log(
//   //   "Element focused: ",
//   //   level,
//   //   event.target,
//   //   event.relatedTarget,
//   //   event.originalTarget,
//   //   event.currentTarget,
//   //   event.defaultPrevented,
//   //   event.bubbles
//   // );
// };
// const focusout = (event) => {
//   const level =
//     ["none", "capturing", "target", "bubbling"][event.eventPhase] ?? "error";
//   console.log("focusout", level);

//   // console.log(
//   //   "Element blurred: ",
//   //   level,
//   //   event.target,
//   //   event.relatedTarget,
//   //   event.originalTarget,
//   //   event.currentTarget,
//   //   event.defaultPrevented,
//   //   event.bubbles
//   // );
// };

const currentEl = ref();

const selectionchange = (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  // get the user selection informations
  let grab = document.getSelection(),
    text = grab.baseNode || 0, //  <-- clicked here
    node = text.parentNode; // <-- container

  // console.log("selectionchange: ", grab, text, node);
  // console.log("currentEl, liveMdEl", currentEl.value, liveMdEl.value);
  if (node && node !== currentEl.value) {
    // console.log("classNames: ", node?.className, currentEl.value?.className);
    if (currentEl.value) {
      // console.log("1");
      Array.from(currentEl.value.getElementsByClassName("md-explicit")).forEach(
        (el) => el.remove()
      );
      currentEl.value.className = currentEl.value.className.replace(
        // / ?md-active/,
        " md-active",
        ""
      );
      currentEl.value = undefined;
    }
    // console.log("grab.containsNode: ", grab.containsNode(node));
    // console.log("grab.containsNode firstChild: ", grab.containsNode(node.firstChild));
    // console.log(
    //   "liveMdEl.value.contains node: ",
    //   liveMdEl.value.contains(node)
    // );
    if (liveMdEl.value.contains(node)) {
      // console.log("2");
      // currentEl.value.className = currentEl.value.className.replace(" md-active", "");
      currentEl.value = toMarkedUXHtmlString(node);
      currentEl.value.className += " md-active";
    }
  }
};

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

onMounted(() => {
  nextTick(() => {
    // const rootEl = document.getElementById("live-md");
    // const els = [
    //   rootEl,
    //   ...Array.from(rootEl.getElementsByClassName("md-focus")),
    // ];
    // console.log("els", els);
    // for (const el of els) {
    //   // el.addEventListener("keydown", keydowncursor);
    //   el.addEventListener("click", focusin);
    //   el.addEventListener("blur", focusout);
    // }
    document.addEventListener("selectionchange", selectionchange);
    // document.addEventListener("focusin", focusin);
    // document.addEventListener("focusout", focusout);
  });
});
onUnmounted(() => {
  // const els = document
  //   .getElementById("live-md")
  //   .getElementsByClassName("md-focus");
  // for (const el of els) {
  //   // el.addEventListener("keydown", keydowncursor);
  //   el.removeEventListener("click", focusin);
  //   el.removeEventListener("blur", focusout);
  // }
  document.removeEventListener("selectionchange", selectionchange);
  // document.removeEventListener("focusin", focusin);
  // document.removeEventListener("focusout", focusout);
});
</script>

<style>
.md-explicit {
  color: red;
}
.md-active {
  color: #777;
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
