'use strict';

const app = Vue.createApp({
  data() {
    return {
      email: 'newt@hey.com',
      recent: [
        {
          muted: false,
          desc: 'Test File',
          url:
            'https://tapedeck-88da7a2d-990c-474b-aa2f-2716203101d9.s3.us-east-2.amazonaws.com/test.mp3'
        }
      ],
      status: ''
    };
  },
  methods: {
    async play(item) {
      try {
        await this.$refs.audio.play();
      } catch (error) {
        console.log('error playing', JSON.stringify(error));
      }
    },
    async pause(item) {
      try {
        await this.$refs.audio.pause();
      } catch (error) {
        console.log('error playing', JSON.stringify(error));
      }
    },
    forward(item) {
      this.$refs.audio.currentTime = this.$refs.audio.currentTime + 15;
    },
    mute(item) {
      item.muted = !item.muted;
    },
    muteAction(item) {
      if (item.muted) {
        return 'Unmute';
      } else {
        return 'Mute';
      }
    }
  }
});

const mounted = app.mount('#tapedeck-archives');
