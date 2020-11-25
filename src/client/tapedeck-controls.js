'use strict';

const app = Vue.createApp({
  data() {
    return {
      email: '',
      archiveURL: '',
      status: ''
    };
  },
  methods: {
    archiveSubmit(event) {
      if (this.email === '') {
        alert('Please enter your email address');
        return;
      }

      if (this.archiveURL === '') {
        alert('Please enter a URL to archive');
        return;
      }

      //TODO: call faas
      alert(
        `Thanks! We'll email you at ${this.email} when the archive is available`
      );
      this.archiveURL = '';
    }
  },
  computed: {}
});

const mounted = app.mount('#tapedeck-controls');
