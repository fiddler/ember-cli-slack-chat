# Ember-cli-slack-chat

Ember-cli-slack-chat makes it easy to add a support chat backed by Slack to your ember-cli app.

## Installation

* `npm install ember-cli-slack-chat --save-dev`
* Setup a server component to interact with Slack (Node.js example provided [here](https://github.com/fiddler/ember-cli-slack-chat-node-server))
* Add the component and provide options as per documentation below `{{ember-slack-chat options=options}}`

## Options

The component supports following options:
```JavaScript
{
  serverUrl: '', // Url to your Slack server component
  widgetState : 'closed|closed', // Have the component start opened or closed

  headerText: 'How can we help?', // Text in the widget header
  headerImage: 'https://s.gravatar.com/avatar/2f96c7e4839ffc2faf65052234f534f0?s=100', // Path to profile image

  emptyChatTopic: 'Support chat', // Topic to show inside empty chat
  emptyChatText: 'Questions? Just type it below and we\'ll answer you..', // Text to show inside empty chat
  
  inputPlaceholderText: 'Write message here...', // Placeholder for the text input

  supportUsername: 'Wingmen', // Name to show support replies under
  chatUserName: 'Me', // Name to show before user messages
}
```

The below screenshot illustrates how the options affect the component:

![Ember-cli-slack-chat example](/ember-cli-slack-chat-screenshot.png?raw=true)
