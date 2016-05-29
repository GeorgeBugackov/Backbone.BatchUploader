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

      /*---------- Start of "multiple" block -------- */

      _sendMultiple: function () {
        this._pendingRequests = [];
        this._batchPromise = $.Deferred();

        _.each(this.get('entities'), this._saveEntity, this);

        $.when(this._batchPromise)
          .done(this._onResolved)
          .fail(this._onRejected)
          .progress(this._defrredProgress);
      },

      _saveEntity: function (entity) {
        if (entity instanceof Backbone.Model && entity.save) {
          this._pendingRequests.push(entity.save(null, {
            success: function () {
              this._areRequestsCompleted(this._pendingRequests);
            }.bind(this)
          }));
        } else {
          console.warn("This entity is not a backbone model " +
          "or has no 'save' method", entity);
        }
      },

      _areRequestsCompleted: function (requests) {
        if (!_.any(requests, this._isXHRPending)) {
          this._batchPromise.resolveWith(this);
          requests = [];
        }
      },

      _isXHRPending: function (xhr) {
        return xhr.status !== 200;
      },

      _onResolved: function () {},

      _onRejected: function () {},

      _defrredProgress: function () {},

      /*---------- End -------- */

      /*---------- Start of "single" block -------- */

      _sendSingle: function  () {
        console.warn('Single request was sent');
      }

      /*---------- End -------- */
    });

    return Backbone.BatchUploader;
}));
