<script>
import { ref } from 'vue'
// import Component from "Component"

export default {
	name: "AddNote",
	components: {
		// Component,
	},
	props: { 
		timestamp: Date,
	},
	// emits: ['newNote'],
	data() {
		return {
			newTag: '',
			form: {
				timestampValue: this.timestamp,
				tags: '',
				entry: '',
			}
		}
	},
	methods: {
		 addTag() {
			  this.tags.push(this.newTag);
			  this.newTag = '';
		 },
		 submitAdd(event) {
			 this.$emit('newNote', this.form);
		 }
	},
}
</script>

<template>
  <h2>Add Entry</h2>
	<form id='add-note' @submit.prevent="submitAdd">
		<div>
			<label for='time'>Time</label>
			<input id='time' type="text" placeholder="timestampValue" v-model="form.timestampValue" required >
		</div>
		<div>
			<label for="tags">Tags</label>
			<input type="text" v-model="form.tags">
		</div>
		<div>
			<label for="entry">Entry</label>
			<textarea id="entry" name="" cols="30" rows="10" v-model='form.entry'></textarea>
		</div>
		<div><input type="submit"></div>
		
	</form>
</template>

<style scoped>
#add-note * {
	display:block;
}

#add-note label {
	margin-top: 20px;
}
</style>
