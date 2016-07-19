import can from 'can/util/library';
import CanMap from 'can/map/';
import Component from 'can/component/';

import 'date-selector/less/datepicker.less!';
import dateSelector from 'date-selector';

import template from './date-field.stache!';
import './date-field.less!';
import { ViewModel as TextViewModel } from '../text-field/';

/**
 * @constructor form-widget/field-components/date-field.ViewModel ViewModel
 * @parent form-widget/field-components/date-field
 * @group form-widget/field-components/date-field.ViewModel.props Properties
 *
 * @description A `<date-field />` component's ViewModel
 */
export let ViewModel = TextViewModel.extend({
  define: {
    properties: {
      Value: CanMap
    },
    value: {
      type: 'date',
      value: ''
    }
  },
  onBlur(element){
    can.trigger(element, 'change');
  }
});

Component.extend({
  tag: 'date-field',
  template: template,
  viewModel: ViewModel,
  events: {
    inserted() {
      dateSelector();
    },
    '{viewModel} value'(viewModel, event, newValue){
      viewModel.dispatch('change', [newValue]);
    }
  }
});
