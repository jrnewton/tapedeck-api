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
    async test(event) {
      try {
        //TODO: add real URL once auth is in place
        const res = await axios.get('lambda-url');
        console.log(JSON.stringify(res));
      } catch (error) {
        console.log(error);
      }
    },
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

const mounted = app.mount('#tapedeck-main');
