import Ember from 'ember';

export default Ember.Component.extend({
  _channel: '',
  _latest: Math.floor(Date.now() / 1000)+'.000000',
  messages: Ember.A([]),

  setup: Ember.on('didInsertElement', function() {
    this._super();
    this.setupChat();
  }),

  setupChat: function() {

    // Check local storage, if we have chat history & channel data
    if( localStorage && localStorage.getItem('slackChatData') ) {
      let savedData = JSON.parse( localStorage.getItem('slackChatData') );
      this.set('_channel', savedData.channel);
      this.set('messages',Ember.A(savedData.messages));
    }

    let defaults = {
      widgetState: 'closed',
      headerText: 'How can we help?',
      headerImage: 'https://s.gravatar.com/avatar/2f96c7e4839ffc2faf65052234f534f0?s=100',
      emptyChatTopic: 'Support chat',
      emptyChatText: 'Questions? Just type it below and we\'ll answer you..',
      supportUserName: 'Wingmen',
      chatUserName: 'Me',
      channelCreationCustomFields: false,
      inputPlaceholderText: 'Write message here...',
      serverUrl: ''
    };

    defaults = Object.assign( defaults, this.get('options') );

    this.setProperties(defaults);
  },

  messagesChanged: Ember.observer('messages.length', function() {
    if( localStorage && localStorage.getItem('slackChatData') ) {
       let data = JSON.parse( localStorage.getItem('slackChatData') );
       data.messages = this.get('messages').toArray();
       localStorage.setItem('slackChatData', JSON.stringify(data) );
    }
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

  getInfo: function() {
    return this.get('channelCreationCustomFields') || [
      {
        'fallback': '',
        'text': '',
        'fields': [
          {
            'title': 'URL',
            'value': window.location.href,
            'short': true
          },
          {
            'title': 'UA',
            'value': window.navigator.userAgent,
            'short': true
          },
          {
            'title': 'Language',
            'value': window.navigator.language,
            'short': true
          }
        ],
        "color": "#F35A00"
      }
    ];
  },

  sendMessage: function(includeInfo) {

    if( ! this.get('_channel') ) {
      Ember.$.post(this.get('serverUrl') + '/channels', { channel: this.generateChannel() }, (response) => {
        this.set('_channel', response.channel.id);
        if( localStorage ) {
          localStorage.setItem('slackChatData', JSON.stringify({ channel: response.channel.id, messages: [] }) );
        }
        this.sendMessage(true);
      });
      return;
    }

    let msg = this.get('newMessage');
    let data = {
      message: msg,
      channel: this.get('_channel'),
      attachments: includeInfo ? this.getInfo() : ''
    };
    this.get('messages').addObject({ text:  msg, user: this.get('chatUserName') });
    this.set('newMessage','');
    this.scrollToBottom();
    Ember.$.post(this.get('serverUrl') + '/message', data, (response) => {
      this.set('_latestMessage', response.message.ts);
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
    Ember.$.get(this.get('serverUrl') + '/channel/' + this.get('_channel') + '/messages', { oldest: this.get('_latestMessage') }, (response) => {
      if( response.messages && response.messages.length ) {
        response.messages.forEach( (message) => {
          if( !( message.subtype && message.subtype === 'bot_message') ) {
            message.user = this.get('supportUserName');
            this.get('messages').addObject(message)
            this.scrollToBottom();
            this.set('_latestMessage', message.ts);
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
