<script>
import { ref } from 'vue'

export default {
	name: "UserAuth",
	components: {
	},
	props: { 
		timestamp: Date,
	},
	// emits: ['userAuthed'],
	data() {
		return {
			hasError: false,
			form: {
				timestampValue: this.timestamp,
				tags: '',
				entry: '',
			}
		}
	},
	methods: {
		 submitAdd(event) {
			 if (this.isValidDate() == true ) {
				 this.$emit('newNote', this.form);
			 } else {
			 	this.hasError= true;
			 }

		 },
		 isValidDate: function() {
		 	this.hasError = false;
			/*
			https://codepen.io/wboka/pen/LXKVLb
				Valid formats:
				- M/D/YYYY
				- M/DD/YYYY
				- MM/D/YYYY
				- MM/DD/YYYY
				- YYYY-M-D
				- YYYY-M-DD
				- YYYY-MM-D
				- YYYY-MM-DD
			*/
			if (!/^(\d{1,2}\/\d{1,2}\/\d{4,}|\d{4,}-\d{1,2}-\d{1,2})$/.test(this.form.timestampValue)) {
				return false;
			}
			this.isISO8601 = /^\d{4}-\d{1,2}-\d{1,2}$/.test(this.form.timestampValue);
			// Get the month, day, and year parts
			var parts = this.form.timestampValue.split(this.isISO8601 ? "-" : "/");
			this.month = parseInt(parts[this.isISO8601 ? 1 : 0], 10);
			this.day = parseInt(parts[this.isISO8601 ? 2 : 1], 10);
			this.year = parseInt(parts[this.isISO8601 ? 0 : 2], 10);

			// Should be a valid javascript month 0-11
			if (this.month === 0 || this.month > 12) {
				return false;
			}

			// Valid month lengths
			var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			// Check for leap years
			if (this.year % 400 === 0 || (this.year % 100 !== 0 && this.year % 4 === 0)) {
				this.isLeapYear = true;
				monthLength[1]++;
			} else {
				this.isLeapYear = false;
			}

			return this.day > 0 && this.day <= monthLength[this.month - 1];
		}
	},
}
</script>

<template>
    <!-- Example description and UI -->
    <section class="container main">
        <p>This example shows how to use PKCE in the browser</p>
        <div id="pre-auth-section" style="display:none;">
            <button onClick="doAuth()">Start PKCE Auth Flow</button>

            <p class="info">Once authenticated, it will use the access token to list the files in your root directory.</p>
        </div>

        <div id="authed-section" style="display:none;">
            <p>You have successfully authenticated. Below are the contents of your root directory. They were fetched using the SDK and access token.</p>
            <ul id="files"></ul>
        </div>
    </section>
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
