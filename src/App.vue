<template>
  <div>
  	<h1>Flogger!</h1>
 </div>
  <AddNote :timestamp="timestamp" />
</template>

<script>
	import AddNote from './components/AddNote.vue';


	export default {

		components: {
			AddNote
		},

		data() {
			 return {
				timestamp: Date.now()
			 };
		},

		methods: {
		}
};

</script>





<style scoped>

</style>
