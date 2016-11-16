define(function(require) {
    'use strict';

    var EventRecurrenceView;
    var _ = require('underscore');
    var __ = require('orotranslation/js/translator');
    var template = require('tpl!orocalendar/templates/calendar/event/recurrence/recurrence.html');
    var originValuesTemplate =
        require('tpl!orocalendar/templates/calendar/event/recurrence/recurrence-origin-values.html');
    var BaseView = require('oroui/js/app/views/base/view');
    var RecurrenceEndsView = require('orocalendar/js/calendar/event/recurrence/recurrence-ends-view');
    var RecurrenceDailyView = require('orocalendar/js/calendar/event/recurrence/recurrence-daily-view');
    var RecurrenceWeeklyView = require('orocalendar/js/calendar/event/recurrence/recurrence-weekly-view');
    var RecurrenceMonthlyView = require('orocalendar/js/calendar/event/recurrence/recurrence-monthly-view');

    EventRecurrenceView = BaseView.extend({
        RECURRENCE_REPEATS: {
            daily: ['daily'],
            weekly: ['weekly'],
            monthly: ['monthly', 'monthnth'],
            yearly: ['yearly', 'yearnth']
        },

        RECURRENCE_REPEAT_VIEWS: {
            daily: RecurrenceDailyView,
            weekly: RecurrenceWeeklyView,
            monthly: RecurrenceMonthlyView
        },

        /** @type {string|null}*/
        activeRepeatViewName: null,

        /** @type {string} defines name prefix for all form elements that are related to recurrence */
        inputNamePrefixes: '',

        _isCompletelyRendered: false,

        template: template,

        events: {
            'change [data-name="recurrence-repeat"]': 'onRecurrenceToggle',
            'change [data-name="recurrence-repeats"]': 'onRepeatsChange'
        },

        listen: {
            'change model': 'renderOriginValues'
        },

        initialize: function(options) {
            _.extend(this, _.pick(options, 'inputNamePrefixes'));
            EventRecurrenceView.__super__.initialize.call(this, options);
        },

        getTemplateData: function() {
            var RECURRENCE_REPEATS = this.RECURRENCE_REPEATS;
            var data = EventRecurrenceView.__super__.getTemplateData.call(this);

            data.cid = this.cid;
            data.repeatsOptions = _.map(_.keys(RECURRENCE_REPEATS), function(item) {
                return {
                    value: item,
                    label: __('oro.calendar.event.recurrence.repeat.' + item),
                    selected: RECURRENCE_REPEATS[item].indexOf(data.recurrenceType) !== -1
                };
            });

            return data;
        },

        render: function() {
            EventRecurrenceView.__super__.render.call(this);

            if (!this.model.isEmptyRecurrence()) {
                delete this._isCompletelyRendered;
                this.renderSubviews();
            }

            this.renderOriginValues();

            return this;
        },

        renderSubviews: function() {
            var repeatViewName = this.getRepeatViewName(this.model.get('recurrenceType')) ||
                _.keys(this.RECURRENCE_REPEAT_VIEWS)[0];

            _.each(this.RECURRENCE_REPEAT_VIEWS, function(View, name) {
                var $el = this.findElement(name).hide();
                this.subview(name, new View({
                    autoRender: true,
                    el: $el,
                    model: this.model
                }));
            }, this);

            this.subview('ends', new RecurrenceEndsView({
                autoRender: true,
                el: this.findElement('ends'),
                model: this.model
            }));

            this.switchRepeatView(repeatViewName);

            this._isCompletelyRendered = true;
        },

        getOriginValuesTemplateData: function() {
            var data = EventRecurrenceView.__super__.getTemplateData.call(this);

            data.inputNamePrefixes = this.inputNamePrefixes;
            data.recurrenceTypeOptions = _.map(this.model.RECURRENCE_TYPES, function(item) {
                return {
                    value: item,
                    label: item,
                    selected: data.recurrenceType === item
                };
            });
            data.instanceOptions = _.map(this.model.RECURRENCE_INSTANCE, function(item, key) {
                return {
                    value: key,
                    label: __('oro.calendar.event.recurrence.instance.' + item),
                    selected: Number(data.instance) === Number(key)
                };
            });
            data.dayOfWeekOptions = _.map(this.model.RECURRENCE_DAYOFWEEK, function(item) {
                return {
                    value: item,
                    label: item,
                    selected: data.dayOfWeek.indexOf(item) !== -1
                };
            });

            return data;
        },

        renderOriginValues: function() {
            var html = '';
            if (!this.model.isEmptyRecurrence()) {
                html = originValuesTemplate(this.getOriginValuesTemplateData());
            }
            this.findElement('origin-values').html(html);
        },

        findElement: function(shortName) {
            return this.$('[data-name="recurrence-' + shortName + '"]');
        },

        onRecurrenceToggle: function(e) {
            if (!this._isCompletelyRendered) {
                this.renderSubviews();
            }

            this.findElement('settings').toggle(e.target.checked);
            this.$el.trigger('content:changed');
        },

        onRepeatsChange: function(e) {
            var repeatViewName = e.target.value;
            this.switchRepeatView(repeatViewName);
        },

        switchRepeatView: function(repeatViewName) {
            _.each(_.keys(this.RECURRENCE_REPEAT_VIEWS), function(name) {
                var subview = this.subview(name);
                if (subview.isEnabled() && repeatViewName !== name) {
                    subview.disable();
                }
            }, this);

            this.subview(repeatViewName).enable();
        },

        getRepeatViewName: function(repeatType) {
            return _.findKey(this.RECURRENCE_REPEATS, function(repeatTypes) {
                return repeatTypes.indexOf(repeatType) !== -1;
            });
        }
    });

    return EventRecurrenceView;
});
