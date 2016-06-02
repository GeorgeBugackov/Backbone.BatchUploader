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
        throw 'Please include Backbone.js before Backbone.BatchUploader.js';
    }

    Backbone.BatchUploader = Backbone.Model.extend({

      initialize: function (options) {
        var defaults = {
            entities: [], // array of models (could be of different type)
                          // + success callbacks for them
            batchURL: '', // URL for single mode
            type: 'multiple' // multiple || single
          };

        this.set(_.extend(defaults, options));
      },

      send: function (callbacks) {
        var methodName = '_send' + this.get('type').charAt(0).toUpperCase()
         + this.get('type').slice(1).toLowerCase();

        if (this.get('entities').length) {
          this[methodName](callbacks);
        } else {
          console.warn('No models to upload. Requests were not sent!');
        }
      },

      /*---------- Start of "multiple" block -------- */

      _sendMultiple: function (callbacks) {
        this._pendingRequests = [];

        _.each(this.get('entities'), this._saveEntity, this);

        $.when.apply($, this._pendingRequests)
          .done(callbacks.success)
          .fail(callbacks.error);
      },

      _saveEntity: function (entity) {
        if (entity instanceof Backbone.Model && entity.save) {
          this._pendingRequests.push(entity.save());
        } else {
          console.warn("This entity is not a backbone model " +
          "or has no 'save' method", entity);
        }
      },
      /*---------- End -------- */


      /*---------- Start of "single" block -------- */
      _sendSingle: function  (callbacks) {
          var batchURL = this.get('batchURL'),
            batchModel;

          if (batchURL) {
            batchModel = new Backbone.Model({
              entities: this.get('entities')
            });

            batchModel.urlRoot = batchURL;

            batchModel.save(null, {
              success: callbacks.success,
              error: callbacks.error
            });
          } else {
            console.warn('batchURL for single request upload is not defined.' +
              'Request was not sent!');
          }
      },
      /*---------- End -------- */

      save: function () {
        console.warn('BatchUploader could not be saved');
      },

      fetch: function () {
        console.warn('BatchUploader could not be fetched');
      }
    });

    return Backbone.BatchUploader;
}));
