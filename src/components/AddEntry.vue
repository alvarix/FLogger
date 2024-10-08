<script setup>
import { ref, watch, onMounted, nextTick  } from 'vue'
import EntryData from '../modules/EntryData.ts';
import { defineEmits } from 'vue';


const props = defineProps({
  copiedEntry: Object // Accept the copied entry as a prop
});


const emit = defineEmits(['newEntry']);
const newEntry = ref('');  // Initialize newEntry as a reactive variable

// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
let hasError = ref(false);	

let form = ref( 
			new EntryData( 
				new Date().toLocaleDateString(),
				'',
			),
);

const submitAdd = (event) => {
//			 if (this.isValidDate() == true ) {
	//console.log(form)
	 emit('newEntry', form);
//		 } else {
//		 	this.hasError= true;

//		 }

};

// Function to automatically resize the textarea based on content
const autoResizeTextarea = (el_id) => {
  const textarea = document.getElementById(el_id);
  if (textarea) {
    textarea.style.height = 'auto'; // Reset height to shrink if needed
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height based on scrollHeight
  }
};


watch(() => props.copiedEntry, (newVal) => {
	console.log('New copiedEntry received:', newVal);

  if (newVal && newVal.entry) {
    form.value.entry = newVal.entry; // Prepopulate the textarea with the copied entry
	const addEntryForm = document.getElementById('add-entry');

	nextTick(() => autoResizeTextarea('entry')); // Adjust the textarea size after the DOM update

    if (addEntryForm) {
      addEntryForm.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the form
    }
  }
});
</script>

<template>




	<form  id='add-entry' @submit.prevent="submitAdd">
		<div class="form-inner">
			<div>
				<input :class="['date', {error:hasError}]" id='time' type="text" :placeholder="form.date" v-model="form.date" required >
				
				<em class='date-validation hidden' :class={error:hasError}>Please enter valid date</em>
			</div>
			<div>
				<textarea autofocus id="entry" name="" cols="30" rows="2" v-model='form.entry' required></textarea>
			</div>
		</div>
		<div><input type="submit" value="Add Entry"></div>
		
	</form>
</template>

<style scoped>
#add-entry *:not(.date-validation) {
	display:block;
}

input.error {
	border:1px solid red;
}

input[type='submit'],
.form-inner,
.form-inner * {
	background-color:cornsilk;
}

.form-inner {
    max-width: 600px;
    border-radius: 14px;
    padding: 20px;
}
.form-inner,
input[type='submit'] {
	border: 1px solid #ccc;
}

input.date {
	font-weight: bold;
	font-size: 14px;
	border: none;
}

input, textarea {
	padding: 5px;
}

textarea {
	width: 100%;
}

.date-validation.error {
	display:block;
	color:red;
}

input[type=submit] {
	border-radius: 10px;
	padding: 6px 10px;
	margin-top: 10px;
	cursor: pointer;
}

#add-entry label {
	margin-top: 20px;
}

</style>
