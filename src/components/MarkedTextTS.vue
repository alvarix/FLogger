<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  defineExpose,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import { marked, type Tokens } from "marked";

const { rawText } = defineProps<{
  rawText?: string;
}>();

// Followed approach shown here: https://dev.to/pyrsmk/how-to-use-the-contenteditable-attribute-in-vue-3-a89

// const postprocess = (html) => {
//   const processedHtml = html.replace(
//     /(\<[^\>]*)(\/?\>)/g,
//     `$1 contenteditable$2`
//   );
//   return processedHtml;
// };

// marked.use({ hooks: { postprocess } });

const headingRenderer = ({
  tokens,
  depth,
}: Tokens.Heading | Tokens.Generic): string => {
  // @ts-expect-error - Still figuring out Marked typing
  const text = this?.parser?.parseInline(tokens);
  const escapedText = text?.toLowerCase().replace(/[^\w]+/g, "-");
  return `
      <h${depth} contenteditable class="md-focus">
        <a name="${escapedText}" href="#${escapedText}">
          <span></span>
        </a>
        ${text}
      </h${depth}>`;
};
const boundFunction = headingRenderer.bind(marked);

// marked.use.extend(boundFunction);

const strongRenderer = ({ tokens }: Tokens.Strong | Tokens.Generic): string => {
  // @ts-expect-error - Still figuring out Marked typing
  const text = this.parser.parseInline(tokens);
  return `
      <strong contenteditable class="md-focus">
        ${text}
      </strong>`;
};
const renderers = {
  heading: boundFunction,
  strong: strongRenderer,
};

marked.use({
  renderer: renderers
});
// marked.use({ renderers });
// marked.use({
//   extensions: [
//     {
//       name: "strong",
//       renderer: renderers.strong,
//     },
//     // {
//     //   name: "heading",
//     //   renderer: renderers.heading,
//     // },
//   ],
// });

const markDown = ref<string>(rawText || "");
// markDown.value = marked.parse(
//   "# Marked in the browser\n\nRendered by **marked**."
// );
const liveMdEl = ref<HTMLElement>();
const mdEl = ref<HTMLElement>();
// This exposes access to the elements innerText properties to set from marked md
defineExpose({ mdEl, liveMdEl });

const liveMarkedHtmlString = ref<string>();
watch(markDown, async () => {
  liveMarkedHtmlString.value = await marked.parse(markDown.value);
});
// const liveMd = computed<string>(() => {
//   const mdhtml = marked.parse(markDown.value);
//   return mdhtml;
// });

const changeLiveMd = async () => {
  // markDown.value += ".";
  if (liveMdEl.value)
    liveMdEl.value.innerHTML = await marked.parse(markDown.value);
};

// const updatePreview = () => {
//   markDown.value = mdEl.value?.innerText || "";
// };
const preview = computed(() => {
  const mdhtml = marked.parse(markDown.value);
  return mdhtml;
});
onMounted(() => {
  markDown.value = mdEl.value?.innerText || "";
});

// const focusin = (event:Event) => {
//   const level =
//     ["none", "capturing", "target", "bubbling"][event.eventPhase] ?? "error";

// };
// const focusout = (event) => {
//   const level =
//     ["none", "capturing", "target", "bubbling"][event.eventPhase] ?? "error";
// };

// const keydowncursor = (event) => {
//   if (event.isComposing || event.keyCode === 229) {
//     return;
//   }
//   const level =
//     ["none", "capturing", "target", "bubbling"][event.eventPhase] ?? "error";
// };

const previewEl = ref<HTMLElement>(); // saved to spare processor time
const currentEl = ref<HTMLElement>();

const selectionchange = () =>
  // event: Event
  {
    // This check should only be necessary for keydown and keyup events:
    // if (event.isComposing || event.keyCode === 229) {
    //   return;
    // }

    // find and save our main HTML objects
    if (!previewEl.value)
      previewEl.value = document.getElementById("live-md") ?? undefined;
    // get the user selection informations
    let grab = document.getSelection(),
      text = grab?.anchorNode, //  <-- clicked here
      node = text?.parentElement; // <-- container

    if (node && node !== currentEl.value) {
      if (currentEl.value) {
        Array.from(
          currentEl.value.getElementsByClassName("md-explicit")
        ).forEach((el) => el.remove());
        currentEl.value.className = currentEl.value.className.replace(
          // / ?md-active/,
          " md-active",
          ""
        );
        currentEl.value = undefined;
      }
      if (previewEl.value?.contains(node)) {
        // currentEl.value.className = currentEl.value.className.replace(" md-active", "");
        currentEl.value = toMd(node);
        if (currentEl.value) currentEl.value.className += " md-active";
      }
    }
  };

const toMd = (node:HTMLElement) => {
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
  //   .getElementById("live-md")?.getElementsByClassName("md-focus");
  // for (const el of els) {
  //   // el.addEventListener("keydown", keydowncursor);
  //   el.removeEventListener("click", focusin);
  //   el.removeEventListener("blur", focusout);
  // }
  document.removeEventListener("selectionchange", selectionchange);
  // document.removeEventListener("focusin", focusin);
  // document.removeEventListener("focusout", focusout);
});

/*
 * 
 * TO DO
 * 
 * Sanitize the html
 * From https://marked.js.org/using_pro#hooks
 * 
Example: Sanitize HTML with isomorphic-dompurify

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// Override function
function postprocess(html) {
  return DOMPurify.sanitize(html);
}

marked.use({ hooks: { postprocess } });

// Run marked
 *
 * 
 */
</script>

<template>
  <!-- <textarea v-model="markDown">
# Marked in the browser\n\nRendered by **marked**.</textarea
  > -->
  <!-- <pre ref="mdEl" contenteditable @keydown.enter="updatePreview">{{
    `
# Marked in the browser 

## Rendered by **marked** *marked* ***marked***.

`
  }}</pre> -->
  <div id="preview" contenteditable hidden v-html="preview"></div>
  <div
    id="live-md"
    ref="liveMdEl"
    contenteditable
    @change="changeLiveMd"
    v-html="liveMarkedHtmlString"
  ></div>
</template>

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
