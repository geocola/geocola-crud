
import can from 'can/util/library';
import CanEvent from 'can/event/';
import Component from 'can/component/';
import CanMap from 'can/map/';
import template from './select-field.stache!';

/**
 * @constructor components/form-widget/field-components/select-field.ViewModel ViewModel
 * @parent components/form-widget/field-components/select-field
 * @group components/form-widget/field-components/select-field.ViewModel.props Properties
 *
 * @description A `<select-field />` component's ViewModel
 */
export let ViewModel = CanMap.extend({
  define: {
    properties: {
      Value: CanMap
    }
  },
  onChange(value) {
    //we could perform some other logic here
    this.attr('value', value);
    this.dispatch('change', [value]);
  },
  isSelected(value){
    return value == this.attr('value');
  }
});
can.extend(ViewModel.prototype, CanEvent);

Component.extend({
  tag: 'select-field',
  template: template,
  viewModel: ViewModel
});
