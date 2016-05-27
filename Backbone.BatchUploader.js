(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'jquery', 'backbone'], factory);
    } else if(typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(
            require('underscore'),
            require('jquery'),
            require('backbone')
        );
    } else {
        // Browser globals
        factory(_, jQuery, Backbone);
    }
}(function(_, $, Backbone){
    if(!Backbone){
        throw 'Please include Backbone.js before Backbone.ModelBinder.js';
    }

    Backbone.BatchUploader = Backbone.Model.extend({

      initialize: function (options) {
        var defaults = {
            entities: [], // array of models (could be of different type)
                          // + success callbacks for them
            batchURL: '', // URL for single mod
            type: 'multiple' // multiple || single
          };

        this.set(_.extend(defaults, options));
      },

      send: function () {
        var methodName = '_send' + this.get('type').charAt(0).toUpperCase()
         + this.get('type').slice(1).toLowerCase();

        if (this.get('entities').length) {
          this[methodName]();
        } else {
          console.warn('No models to upload. Requests were not sent!');
        }
      },

      _sendMultiple: function () {
        _.each(this.get('entities'), function (entity, i, entities) {
          entity.model.save(null, {
            success: entity.success,
            error: entity.error
          });
        });
      },

      _sendSingle: function  () {
        console.warn('Single request was sent');
      }
    });

    return Backbone.BatchUploader;
}));
