'use strict';

const app = Vue.createApp({
  data() {
    return {
      archiveURL: '',
      archiveURLMessage: ''
    };
  },
  methods: {
    archiveSubmit(event) {
      alert(`Recording ${this.archiveURL} now!`);
      this.archiveURL = '';
    }
  },
  computed: {}
});

const mounted = app.mount('#tape-deck-controls');
