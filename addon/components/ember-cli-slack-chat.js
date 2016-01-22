import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
    console.log('did insert element invoked');
  },
  willDestroyElement: function() {
    console.log('will destroy invoked');
  }
});
