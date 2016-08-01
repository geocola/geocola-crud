import can from 'can/util/library';
import CanMap from 'can/map/';
import 'can/map/define/';
import List from 'can/list/';
import Component from 'can/component/';
import Route from 'can/route/';
import template from './template.stache!';
import './widget.less!';

import '../list-table/';
import '../property-table/';
import '../form-widget/';
import '../filter-widget/';
import '../paginate-widget/';

import 'can-ui/modal-container/';
import 'can-ui/tab-container/';
import 'can-ui/panel-container/';

import { FilterList } from '../filter-widget/Filter';
import { mapToFields, parseFieldArray } from '../util/field';
import PubSub from 'pubsub-js';
import { ViewMap } from './ViewMap';

export const TOPICS = {
  /**
   * Topic to add a new message when an object is modified or deleted. The topic
   * published is `addMessage`
   * @property {String} crud-manager.ViewModel.topics.ADD_MESSAGE
   * @parent crud-manager.ViewModel.topics
   */
  ADD_MESSAGE: 'addMessage',
  /**
   * topic to clear existing messages. The topic
   * published is `clearMessages`
   * @property {String} crud-manager.ViewModel.topics.CLEAR_MESSAGES
   * @parent crud-manager.ViewModel.topics
   */
  CLEAR_MESSAGES: 'clearMessages'
};

const DEFAULT_BUTTONS = [{
  iconClass: 'fa fa-list-ul',
  eventName: 'view',
  title: 'View Row Details'
}];
const EDIT_BUTTONS = DEFAULT_BUTTONS.concat([{
  iconClass: 'fa fa-pencil',
  eventName: 'edit',
  title: 'Edit Row'
}, {
  iconClass: 'fa fa-trash',
  eventName: 'delete',
  title: 'Remove Row'
}]);

export const SortMap = CanMap.extend({
  fieldName: null,
  type: 'asc'
});
/**
 * @module crud-manager
 */

/**
 * @constructor crud-manager.ViewModel ViewModel
 * @parent crud-manager
 * @group crud-manager.ViewModel.props Properties
 * @group crud-manager.ViewModel.topics Topics
 *
 * @description A `<crud-manager />` component's ViewModel
 */
export let ViewModel = CanMap.extend({
  /**
   * @prototype
   */
  define: {
    /**
     * The view object that controls the entire setup of the crud-manager.
     * Properties on the view control how each field is formatted, default values,
     * interactions, etc.
     * @property {crud.types.viewMap} crud-manager.ViewModel.props.view
     * @parent crud-manager.ViewModel.props
     */
    view: {
      Type: ViewMap,
      set(view) {
        //if parameters are in the view, mix them in to the crud parameters
        if (view.attr('parameters')) {
          this.attr('parameters').attr(view.attr('parameters').serialize());
        }
        return view;
      }
    },
    /**
     * The current page to display in this view. Options include:
     * * `list`: The list table page that displays all records
     * * `details`: The individual view page that shows one detailed record
     * * `edit`: The editing view that allows editing of an individual record using a form
     * @property {String} crud-manager.ViewModel.props.page
     * @parent crud-manager.ViewModel.props
     */
    page: {
      value: 'list',
      type: 'string'
    },
    /**
     * A virtual property that calculates the number of total pages to show
     * on the list page. This controls the paginator widget. It uses the property
     * `view.connectionProperties.total`  and `queryPerPage` to perform this calculation.
     * @property {String} crud-manager.ViewModel.props.totalPages
     * @parent crud-manager.ViewModel.props
     */
    totalPages: {
      get() {
        let total = this.attr('view.connection.metadata.total');
        if (!total) {
          return 0;
        }

        //round up to the nearest integer
        return Math.ceil(total /
          this.attr('parameters.perPage'));
      }
    },
    /**
     * The array of per page counts to display in the per page switcher. This
     * list is automatically filtered to include options provided where one
     * step below is less than the total count. Example, if there are
     * 30 total items, the default list returned will be 10, 20, and 50.
     * If no options are returned the per page switcher is hidden.
     * @property {Array<Number>} crud-manager.ViewModel.props.perPageOptions
     * @parent crud-manager.ViewModel.props
     */
    perPageOptions: {
      Value() {
        return [10, 20, 50, 100];
      },
      get(counts) {
        return counts.filter((c, index) => {
          return counts[index ? index - 1 : index] < this.attr('view.connection.metadata.total');
        });
      }
    },
    /**
     * A helper to show or hide the paginate-widget. If totalPages is less than
     * 2, the paginate widget will not be shown.
     * @property {Boolean} crud-manager.ViewModel.props.showPaginate
     * @parent crud-manager.ViewModel.props
     */
    showPaginate: {
      type: 'boolean',
      get() {
        return this.attr('totalPages') > 1;
      }
    },
    /**
     * the internal parameters object. This is prepopulated when view is set.
     * @type {Object}
     */
    parameters: {
      Value: CanMap.extend({
        define: {
          filters: { Type: FilterList, Value: FilterList },
          perPage: { type: 'number', value: 10 },
          page: { type: 'number', value: 0 },
          sort: { Type: SortMap, Value: SortMap }
        }
      })
    },
    /**
     * A promise that resolves to the objects retrieved from a can-connect.getList call
     * @property {can.Deferred} crud-manager.ViewModel.props.objects
     * @parent crud-manager.ViewModel.props
     */
    objects: {
      get(prev, setAttr) {
        let params = this.attr('parameters') ? this.attr('parameters').serialize() : {};
        let promise = this.attr('view.connection').getList(params);
        //handle promise.fail for deferreds
        let dummy = promise.fail ? promise.fail(err => {
            console.error('unable to complete objects request', err);
          }) :
          //and handle promise.catch for local-storage deferreds...
          promise.catch(err => {
            console.error('unable to complete objects request', err);
          });
        return promise;
      }
    },
    /**
     * A promise that resolves to the object retreived from a `can-connect.get` call
     * @property {can.Map} crud-manager.ViewModel.props.focusObject
     * @parent crud-manager.ViewModel.props
     */
    focusObject: {
      get(prev, setAttr) {
        if (this.attr('viewId')) {
          let params = {};
          params[this.attr('view.connection').idProp] = this.attr('viewId');
          let promise = this.attr('view.connection').get(params);
          let dummy = promise.fail ? promise.fail(function(err) {
            console.error('unable to complete focusObject request', err);
          }) : promise.catch(function(err) {
            console.error('unable to complete focusObject request', err);
          });
          return promise;
        }
        return null;
      }
    },
    /**
     * Buttons to use for the list table actions. If `view.disableEdit` is falsey
     * the buttons will include an edit and delete button. Otherwise, it will be
     * a simple view details button.
     * @property {Array<crud.types.TableButtonObject>} crud-manager.ViewModel.props.buttons
     * @parent crud-manager.ViewModel.props
     */
    buttons: {
      type: '*',
      get() {
        return this.attr('view.disableEdit') ? DEFAULT_BUTTONS : EDIT_BUTTONS;
      }
    },
    /**
     * The page number, this is calculated by incrementing the queryPage by one.
     * @property {Number}  crud-manager.ViewModel.props.pageNumber
     * @parent crud-manager.ViewModel.props
     */
    pageNumber: {
      get() {
        return this.attr('parameters.page') + 1;
      }
    },
    /**
     * The current id number of the object that is being viewed in the property
     * table or edited in the form widget.
     * @property {Number}  crud-manager.ViewModel.props.buttons
     * @parent crud-manager.ViewModel.props
     */
    viewId: {
      type: 'number',
      value: 0
    },
    /**
     * Current loading progress. NOT IMPLEMENTED
     * TODO: implement loading progress on lengthy processes like multi delete
     * @property {Number}  crud-manager.ViewModel.props.progress
     * @parent crud-manager.ViewModel.props
     */
    progress: {
      type: 'number',
      value: 100
    },
    /**
     * Whether or not the filter popup is visible
     * @property {Boolean} crud-manager.ViewModel.props.buttons
     * @parent crud-manager.ViewModel.props
     */
    filterVisible: {
      type: 'boolean',
      value: false
    },
    /**
     * The internal field array that define the display of data and field types
     * for editing and filtering
     * @property {Array<Field>} crud-manager.ViewModel.props._fields
     * @parent crud-manager.ViewModel.props
     */
    _fields: {
      get() {

        //try a fields propety first
        if (this.attr('view.fields')) {
          return parseFieldArray(this.attr('view.fields'));
        }

        //if that doesn't exist, use the objectTemplate or Map to create fields
        let template = this.attr('view.objectTemplate') || this.attr('view.connection.Map');
        return mapToFields(template);
      }
    },
    /**
     * An array of currently selected objects in the list-table
     * @property {Array<can.Map>} crud-manager.ViewModel.props.selectedObjects
     * @parent crud-manager.ViewModel.props
     */
    selectedObjects: {
      Value: List
    }
  },
  /**
   * @function init
   * Initializes filters and other parameters
   */
  init() {
    //set up related filters which are typically numbers
    if (this.attr('relatedField')) {
      let val = parseFloat(this.attr('relatedValue'));
      if (!val) {
        //if we can't force numeric type, just use default value
        val = this.attr('relatedValue');
      }
      this.attr('parameters.filters').push({
        name: this.attr('relatedField'),
        operator: 'equals',
        value: this.attr('relatedValue')
      });
    }
  },
  /**
   * @function setPage
   * Changes the page and resets the viewId to 0
   * @signature
   * @param {String} page The name of the page to switch to
   */
  setPage(page) {
    this.attr({
      'viewId': 0,
      'page': page
    });
  },
  /**
   * @function editObject
   * Sets the current viewId to the object's id and sets the page to edit
   * to start editing the object provided.
   * @signature
   * @param  {can.Map} scope The stache scope (not used)
   * @param  {domNode} dom   The domNode that triggered the event (not used)
   * @param  {Event} event The event that was triggered (not used)
   * @param  {can.Map} obj   The object to start editing
   */
  editObject(scope, dom, event, obj) {
    this.attr({
      'viewId': this.attr('view.connection').id(obj),
      'page': 'edit'
    });
  },
  /**
   * @function viewObject
   * Sets the current viewId to the object's id and sets the page to details
   * to display a detailed view of the object provided.
   * @signature
   * @param  {can.Map} scope The stache scope (not used)
   * @param  {domNode} dom   The domNode that triggered the event (not used)
   * @param  {Event} event The event that was triggered (not used)
   * @param  {can.Map} obj   The object to view
   */
  viewObject(scope, dom, event, obj) {
    this.attr({
      'viewId': this.attr('view.connection').id(obj),
      'page': 'details'
    });
  },
  /**
   * @function saveObject
   * Saves the provided object and sets the current viewId to the object's
   * id once it is returned. We then switch the page to the detail view to
   * display the created or updated object.
   *
   * This method also adds notifications once the object is saved using PubSub.
   *
   * @signature `saveObject(obj)`
   * @param  {can.Map} obj   The object to save
   *
   * @signature `saveObject(scope, dom, event, obj)`
   * @param  {can.Map} scope The stache scope (not used)
   * @param  {domNode} dom   The domNode that triggered the event (not used)
   * @param  {Event} event The event that was triggered (not used)
   * @param  {can.Map} obj   The object to save
   */
  saveObject() {
    let obj;
    //accept 4 params from the template or just one
    if (arguments.length === 4) {
      obj = arguments[3];
    } else {
      obj = arguments[0];
    }
    let page = this.attr('page');

    //trigger events beforeCreate/beforeSave depending on if we're adding or
    //updating an object
    if (page === 'add') {
      this.onEvent(obj, 'beforeCreate');
    } else {
      this.onEvent(obj, 'beforeSave');
    }

    //display a loader
    //TODO: add loading progress?
    this.attr('progress', 100);
    this.attr('page', 'loading');

    //save the object
    var deferred = this.attr('view.connection').save(obj);
    deferred.then(result => {

      //add a message
      PubSub.publish(TOPICS.ADD_MESSAGE, {
        message: this.attr('view.saveSuccessMessage'),
        detail: 'ID: ' + this.attr('view.connection').id(result)
      });

      if (page === 'add') {
        this.onEvent(obj, 'afterCreate');
      } else {
        this.onEvent(obj, 'afterSave');
      }

      //update the view id
      //set page to the details view by default
      this.attr({
        viewId: result.attr('id'),
        page: 'details'
      });

    }).fail(e => {
      console.warn(e);
      PubSub.publish(TOPICS.ADD_MESSAGE, {
        message: this.attr('view.saveFailMessage'),
        detail: e.statusText + ' : <small>' + e.responseText + '</small>',
        level: 'danger',
        timeout: 20000
      });
      this.attr('page', page);
    });
    return deferred;
  },
  /**
   * @function getNewObject
   * Creates and returns a new object from the view's objectTemplate
   * @signature
   * @return {can.map} A new object created from the `view.objectTemplate`
   */
  getNewObject() {
    //create a new empty object with the defaults provided
    //from the objectTemplate property which is a map
    let props = {};
    if (this.attr('relatedField')) {
      props[this.attr('relatedField')] = this.attr('relatedValue');
    }
    return new(this.attr('view.objectTemplate'))(props);
  },
  /**
   * @function deleteObject
   * Displays a confirm dialog box and if confirmed, deletes the object provided.
   * Once the object is deleted, a message is published using PubSub.
   *
   * @signature `deleteObject(obj, skipConfirm)`
   * @param  {can.Map} obj   The object to delete
   * @param {Boolean} skipConfirm If true, the method will not display a confirm dialog
   *
   * @signature `deleteObject( scope, dom, event, obj, skipConfirm )`
   * @param  {can.Map} scope The stache scope (not used)
   * @param  {domNode} dom   The domNode that triggered the event (not used)
   * @param  {Event} event The event that was triggered (not used)
   * @param  {can.Map} obj   The object to delete
   * @param {Boolean} skipConfirm If true, the method will not display a confirm dialog
   * and will immediately attempt to remove the object
   */
  deleteObject() {
    let obj, skipConfirm;
    //arguments can be ( scope, dom, event, obj, skipConfirm )
    //OR (obj, skipConfirm)
    if (arguments.length > 2) {
      obj = arguments[3];
      skipConfirm = arguments[4];
    } else {
      obj = arguments[0];
      skipConfirm = arguments[1];
    }
    if (obj && (skipConfirm || confirm('Are you sure you want to delete this record?'))) {

      //beforeDelete handler
      this.onEvent(obj, 'beforeDelete');

      //destroy the object using the connection
      let deferred = this.attr('view.connection').destroy(obj);
      deferred.then(result => {

        //add a message
        PubSub.publish(TOPICS.ADD_MESSAGE, {
          message: this.attr('view.deleteSuccessMessage'),
          detail: 'ID: ' + this.attr('view.connection').id(result)
        });

        //afterDelete handler
        this.onEvent(obj, 'afterDelete');
      });

      deferred.fail(result => {
        //add a message
        PubSub.publish(TOPICS.ADD_MESSAGE, {
          message: this.attr('view.deleteFailMessage'),
          detail: result.statusText + ' : <small>' + result.responseText + '</small>',
          level: 'danger',
          timeout: 20000
        });
      });
      return deferred;
    }
  },
  /**
   * @function deleteMultiple
   * Iterates through the objects in the `selectedObjects` array
   * and deletes each one individually.
   * //TODO implement batch deleting to avoid many ajax calls
   * @signature
   * @param {Boolean} skipConfirm If true, the method will not display a confirm dialog
   * and will immediately attempt to remove the selected objects
   */
  deleteMultiple(skipConfirm) {
    let selected = this.attr('selectedObjects');
    if (skipConfirm || confirm('Are you sure you want to delete the ' +
        selected.length + ' selected records?')) {
      let defs = [];
      selected.forEach((obj) => {
        defs.push(this.deleteObject(null, null, null, obj, true));
      });
      selected.replace([]);
      return defs;
    }
    return null;
  },
  /**
   * @function toggleFilter
   * Toggles the display of the filter dialog
   * @signature
   * @param  {Boolean} val (Optional) whether or not to display the dialog
   */
  toggleFilter(val) {
    if (typeof val !== 'undefined') {
      this.attr('filterVisible', val);
    } else {
      this.attr('filterVisible', !this.attr('filterVisible'));
    }
  },
  /**
   * @function getRelatedValue
   * Retrieves a value from an object based on the key provided
   * @signature
   * @param  {String} foreignKey  The name of the field to retrieve from the object
   * @param  {can.Map} focusObject The object to retrieve the property from
   * @return {*} The object's property
   */
  getRelatedValue(foreignKey, focusObject) {
    return focusObject.attr(foreignKey);
  },
  /**
   * @function onEvent
   * A helper function to trigger beforeSave, afterSave, etc events.
   * @signature
   * @param  {can.Map} obj       The object to dispatch with the event
   * @param  {String} eventName The name of the event to dispatch
   */
  onEvent(obj, eventName) {

    //get the view method
    let prop = this.attr(['view', eventName].join('.'));

    //if it is a function, call it passing the object
    if (typeof prop === 'function') {
      prop(obj);
    }

    //dispatch an event
    this.dispatch(eventName, [obj]);
  }
});

Component.extend({
  tag: 'crud-manager',
  viewModel: ViewModel,
  template: template,
  //since this is a recursive component, don't leak the scope.
  //this prevents infinite nesting of the components.
  leakScope: false,
  events: {
    '{viewModel.parameters.filters} change' () {
      this.viewModel.attr('parameters.page', 0);
    },
    '{viewModel.parameters.perPage} change' () {
      this.viewModel.attr('parameters.page', 0);
    }
  }
});
