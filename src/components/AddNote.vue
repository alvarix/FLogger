<script setup>
import { ref } from 'vue'
import NoteData from '../modules/NoteData.js';
import { defineEmits } from 'vue';

const props = defineProps({
//	timestamp: {
//			type: Date,
//			default: () => new Date().toLocaleDateString()
//	}
})
const emit = defineEmits(['newNote']);
let hasError = ref(false);	

let form = ref( 
			new NoteData( 
				new Date(),
				'tag2 tag',
				'Change text',
			),
);

const submitAdd = (event) => {
//			 if (this.isValidDate() == true ) {
	//console.log(form)
	 emit('newNote', form);
//		 } else {
//		 	this.hasError= true;
//		 }

};

</script>

<template>
  <h2>Add Entry</h2>
	<form id='add-note' @submit.prevent="submitAdd">
		<div>
			<label for='time'>Time</label>
			<input :class={error:hasError} id='time' type="text" :placeholder="form.date" v-model="form.date" required >
			
			<em class='date-validation hidden' :class={error:hasError}>Please enter valid date</em>
		</div>
		<div>
			<label for="tags">Tags</label>
			<input type="text" v-model="form.tags" required>
		</div>
		<div>
			<label for="entry">Entry</label>
			<textarea id="entry" name="" cols="30" rows="10" v-model='form.entry' required></textarea>
		</div>
		<div><input type="submit"></div>
		
	</form>
</template>

<style scoped>
#add-note *:not(.date-validation) {
	display:block;
}

input.error {
	border:1px solid red;
}

.date-validation.error {
	display:block;
	color:red;
}


#add-note label {
	margin-top: 20px;
}


</style>
