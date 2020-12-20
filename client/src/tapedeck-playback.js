import Vue from 'vue';

Vue.createApp({
  data() {
    return {
      id: 1,
      desc: 'Test File',
      url:
        'https://tapedeck-88da7a2d-990c-474b-aa2f-2716203101d9.s3.us-east-2.amazonaws.com/test.mp3'
    };
  }
}).mount('#tapedeck-playback');
