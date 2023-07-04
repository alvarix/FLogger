<script>
import { ref } from 'vue'
// import Component from "Component"


export default {
	name: "AddNote",
	components: {
		// Component,
	},
	props: { 
		timestamp: Number,
	},
	data() {
		return {
			timestampValue: "",
			tags: [],
			newTag: '',
			entry: '',
		}
	},
 methods: {
		 addTag() {
			  this.tags.push(this.newTag);
			  this.newTag = '';
		 },
	},
	mounted() {
		this.timestampValue = this.timestamp.toString();
	}
}






</script>

<template>
  <h2>Add Entry</h2>
	<form id='add-note' @submit.prevent="submitForm">
		<div>
			<label for='time'>Time</label>
			<input id='time' type="text" placeholder="timestampValue" v-model="timestampValue" required>
			<em>V-model sanity check: {{timestampValue}}</em>
		</div>
		<div>
			<label for="tags">Tags</label>
			<input type="text" v-model="newTag" @keyup.enter="addTag" required>
			<em>V-model sanity check: {{newTag}}</em>
			<em>Array:</em>
			    <ul>
       <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>
		</div>
		<div>
			<label for="entry">Entry</label>
			<textarea id="entry" name="" cols="30" rows="10" v-model='entry' required></textarea>
			<em>V-model sanity check: {{entry}}</em>
		</div>
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
