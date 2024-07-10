<script setup>
import { ref } from 'vue'
import NoteData from '../modules/NoteData.ts';
import { defineEmits } from 'vue';

const showDiv = ref(false);
const toggleDiv = () => {
          showDiv.value = !showDiv.value;
        };

const emit = defineEmits(['newNote']);
let hasError = ref(false);	

let form = ref( 
			new NoteData( 
				new Date().toLocaleDateString(),
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

  <button @click="toggleDiv"><span v-if="showDiv">Close Entry Form</span><span v-else>Add Log Entry</span></button>

	<form  v-if="showDiv" id='add-note' @submit.prevent="submitAdd">
		<div>
			<label for='time'>Time</label>
			<input :class={error:hasError} id='time' type="text" :placeholder="form.date" v-model="form.date" required >
			
			<em class='date-validation hidden' :class={error:hasError}>Please enter valid date</em>
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

form {
	background-color: #ccc;
	padding: 10px;
	border-radius: 10px;
	margin: 30px 0;
	max-width: 600px;
}

input, textarea {
	outline: 1px solid #999;
	padding: 5px;
}

.date-validation.error {
	display:block;
	color:red;
}


#add-note label {
	margin-top: 20px;
}


</style>
