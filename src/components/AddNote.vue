<script setup>
import { ref } from 'vue'
import NoteData from '../modules/NoteData.ts';
import { defineEmits } from 'vue';

const emit = defineEmits(['newNote']);
// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
let hasError = ref(false);	

let form = ref( 
			new NoteData( 
				new Date().toLocaleDateString(),
				'',
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




	<form  id='add-note' @submit.prevent="submitAdd">
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
#add-note *:not(.date-validation) {
	display:block;
}



input.error {
	border:1px solid red;
}

.form-inner {
    max-width: 600px;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid black;
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
	background-color: #ccc;
	border-radius: 10px;
	padding: 6px 10px;
	margin-top: 10px;
	cursor: pointer;
}

#add-note label {
	margin-top: 20px;
}


</style>
