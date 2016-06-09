import can from 'can/util/library';
import List from 'can/list/';
import CanMap from 'can/map/';
import CanEvent from 'can/event/';
import 'can/map/define/';
import Component from 'can/component/';

import template from './template.stache!';
import './search.less!';

/**
 * @constructor search-widget.ViewModel ViewModel
 * @parent search-widget
 * @group search-widget.ViewModel.props Properties
 *
 * @description A `<search-widget />` component's ViewModel
 */
export const ViewModel = CanMap.extend({
  /**
   * @prototype
   */
  define: {
    /**
     * The default address value for the textbox.
     * @property {String} search-widget.ViewModel.props.searchValue
     * @parent search-widget.ViewModel.props
     */
    searchValue: {
      value: '',
      type: 'string'
    },
    /**
     * The miniumum number of characters before the search begins
     * @property {Number} search-widget.ViewModel.props.minLength
     * @parent search-widget.ViewModel.props
     */
    minLength: {
      value: 5,
      type: 'number'
    },
    /**
     * a data source
     * @property {can-connect.connection} search-widget.ViewModel.props.dataSource
     * @parent search-widget.ViewModel.props
     */
    dataSource: {},
    /**
     * @property {Array<providers.locationProvider.types.suggestionsObject>} search-widget.ViewModel.props.suggestions
     * current suggestions in the widget
     * @parent search-widget.ViewModel.props
     */
    suggestions: {
      get() {
        if (this.attr('dataSource') && this.attr('searchValue').length > this.attr('minLength')) {
          return this.attr('dataSource').getList({ value: this.attr('searchValue') });
        }
      }
    }
  },
  setValue(val) {

  },
  /**
   * Clears the suggestions and selected value
   * @signature
   */
  clear: function() {
    this.attr('selectedItem', null);
    this.attr('suggestions').replace([]);
  },
  /**
   * Called internally when the address is resolved to a location by the data source
   * @signature
   * @param  {providers.locationProvider.types.locationObject} location The location object
   */
  selectItem: function(item) {
    this.clearSuggestions();
    this.attr('selectedItem', item);
  }
});

can.extend(ViewModel.prototype, CanEvent);

export default Component.extend({
  viewModel: ViewModel,
  template: template,
  tag: 'search-widget',
  events: {
    inserted: function() {
      if (this.viewModel.attr('mapNode')) {
        var mapViewModel = can.$(this.viewModel.attr('mapNode')).viewModel();
        this.viewModel.initMap(mapViewModel);
      }
    }
  }
});
