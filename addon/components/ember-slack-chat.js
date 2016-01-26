import Ember from 'ember';

export default Ember.Component.extend({
  _channel: 'C0K7N2UU9',
  _latest: 0,
  messages: Ember.A([]),
  setupChat: function() {
    let defaults = {
      widgetState: 'closed',
      headerText: 'How can we help?',
      headerImage: 'https://s.gravatar.com/avatar/2f96c7e4839ffc2faf65052234f534f0?s=100',
      emptyChatTopic: 'Support chat',
      emptyChatText: 'Questions? Just type it below and we\'ll answer you..',
      supportUserName: 'Wingmen',
      chatUserName: 'Me',
      inputPlaceholderText: 'Write message here...',
      serverUrl: ''
    };

    defaults = Object.assign( defaults, this.get('options') );

    this.setProperties(defaults);
  },

  setup: Ember.on('didInsertElement', function() {
    this._super();
    this.setupChat();
  }),

  keyPress: function (e) {
    if (e.which === 13) {
      console.log('Send message');
      if( this.get('newMessage') ) {
        this.sendMessage();
      }
    }
  },

  generateChannel: function() {
    // TODO: Allow customization
    return 'sup' + Date.now();
  },

  sendUserInfo: function() {
    // TODO: Send browser & other userinfo as a Slack attachment
    //"attachments": [
    //{
    //"fallback": "ReferenceError - UI is not defined: https://honeybadger.io/path/to/event/",
    //"text": "<https://honeybadger.io/path/to/event/|ReferenceError> - UI is not defined",
    //"fields": [
    //{
    //"title": "Project",
    //"value": "Awesome Project",
    //"short": true
    //},
    //{
    //"title": "Environment",
    //"value": "production",
    //"short": true
    //}
    //],
    //"color": "#F35A00"
    //}
    //]
  },

  sendMessage: function() {

    if( ! this.get('_channel') ) {
      Ember.$.post(this.get('serverUrl') + '/channels', { channel: this.generateChannel() }, (response) => {
        console.log('CREATED channel', response);
        this.set('_channel', response.channel.id);
        this.sendMessage();
      });
    }

    let msg = this.get('newMessage');
    this.get('messages').addObject({ text:  msg, user: this.get('chatUserName') });
    this.set('newMessage','');
    this.scrollToBottom();
    this.set('_latestMessage', Math.floor(Date.now() / 1000));
    Ember.$.post(this.get('serverUrl') + '/message', { message: msg, channel: this.get('_channel') }, (response) => {
      this.startListening();
    });
  },

  scrollToBottom: function() {
    Ember.$('.sc-messages').stop().animate({
      scrollTop: Ember.$('.sc-messages')[0].scrollHeight
    }, 500);
  },

  startListening: function() {
    if(! this.interval ) {
      this.interval = setInterval(() => {
        this.getHistory();
      }, 2000);
    }
  },

  getHistory: function() {
    Ember.$.get(this.get('serverUrl') + '/channel/' + this.get('_channel') + '/messages', { latest: this.get('_latestMessage') }, (response) => {
      if( response.messages && response.messages.length ) {
        this.set('_latestMessage', Math.floor(Date.now() / 1000));
        response.messages.forEach( (message) => {
          if( !( message.subtype && message.subtype === 'bot_message') ) {
            message.user = this.get('supportUserName');
            this.get('messages').addObject(message)
            this.scrollToBottom();
          }
        });
      }
    });
  },

  actions: {
    toggleWidget: function() {
      if( this.get('widgetState') === 'open' ) {
        this.set('widgetState', 'closed');
      } else {
        this.set('widgetState', 'open');
      }
    }
  }
});
