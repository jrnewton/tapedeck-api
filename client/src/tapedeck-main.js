import Vue from 'vue';
import axios from 'axios';

Vue.createApp({
  data() {
    return {
      email: '',
      archiveURL: '',
      status: ''
    };
  },
  methods: {
    async test() {
      try {
        //TODO: add real URL once auth is in place
        const res = await axios.get('lambda-url');
        console.log(JSON.stringify(res));
      } catch (error) {
        console.log(error);
      }
    },
    archiveSubmit() {
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
}).mount('#tapedeck-main');
