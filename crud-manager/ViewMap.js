import CanMap from 'can/map/';
import List from 'can/list/';
import { Field } from '../util/field';

/**
 * @typedef {object} crud.types.relatedView RelatedView
 * related view objects that describe the relationship between a parent and child view.
 * //TODO this seems wrong, the foreignKey should probably be switched to the child
 * @option {String} foreignKey - The property to lookup a value for on the parent view's selected object
 * @option {String} referenceKey - The property on child view's objects to filter on
 * @option {crud.types.viewMap} view - The view object to pass to the related crud-manager
 */

/**
 * @module {Object} crud.types.viewMap ViewMap
 * @parent crud.types
 * A view object that controls the display and management of data in the
 * crud-manager and other data components.
 */
export const ViewMap = CanMap.extend({
  define: {
    /**
     * The can-connect object that connects our view to a rest api resource.
     * In order for pagination to work on the crud-manager, this connection
     * needs a special property set on it called `metadata.total` which
     * represents the total number of items available to the rest api.
     * This object is coerced into a CanMap to make the entire object
     * observable so this property can be set asynchronously.
     * @type {Object}
     */
    connection: {
      Type: CanMap
    },
    /**
     * An array of field definitions which controls the display and editing
     * of each property of the objects being displayed and edited
     * @property {Array<util/field.Field>} fields
     */
    fields: {
      Type: List
    }
  },
  /**
   * The message to display when an object is updated
   * @property {String} saveSuccessMessage
   */
  saveSuccessMessage: 'Object saved.',
  /**
   * The message to display when an object fails to save
   * @property {String} saveFailMessage
   */
  saveFailMessage: 'Object could not be saved.',
  /**
   * The message to display when an object is deleted
   * @property {String} deleteSuccessMessage
   */
  deleteSuccessMessage: 'Object removed.',
  /**
   * The message to display when an object fails to be deleted
   * @property {String} deleteFailMessage
   */
  deleteFailMessage: 'Object could not be removed.',
  /**
   * A flag to disable editing existing objects
   * @property {Boolean} disableEdit
   */
  disableEdit: false,
  /**
   * A flag to disable deleting existing objects
   * @property {Boolean} disableDelete
   */
  disableDelete: false,
  /**
   * A flag to disable creating new objects
   * @property {Boolean} disableAdd
   */
  disableAdd: false,
  /**
   * A can-connect object that utilizes a miniumum of the base and constructor behaviors.
   * This includes the can-connect.SuperMap, which consists of many different behaviors.
   * In addition, a custom set of behaviors may be used as long as they include
   * the constructor.
   *
   * This connection property can also contain a special metadata object. This object
   * may include more properties in the future but currently it supports a `totalItems`
   * property which allows the template to display how many items there are in total.
   * The path to this property should be `connection.metadata.totalItems`.
   *
   * @link https://connect.canjs.com/doc/index.html can-connect
   * @link https://connect.canjs.com/doc/can-connect|constructor.html constructor
   * @property {can-connect} connection
   */
  connection: undefined,
  /**
   * A template for creating new objects. This should be an constructor of can.Map
   * created using can.Map.extend. This object defines the default properties, types,
   * and can be used to implement custom serialization on objects before they are saved.
   *
   * CanJS includes a powerful define plugin which can implement very powerful
   * behavior with `serialize`, `value`, getters, and setters.
   *
   * This is usually the same object that is passed to can-connect `Map` property
   * and can reused here also: `connection.Map`.
   *
   * @link https://canjs.com/docs/can.Map.prototype.define.html Define Plugin
   * @signature `objectTemplate: can.Map.extend({prop: 'value'})`
   * @property {Constructor<can.Map>} objectTemplate
   */
  objectTemplate: undefined,
  /**
   * A property that controls the display of rows of data. This property can either
   * be `list-table` or `property-table`.
   *
   * 1. The list will show each objects properties in a horizontal table where each object occupies one single line.
   * This format is much more compact and allows for sorting.
   * 2. The property  table format will display a two column table for each object with fieldname and
   * value. This option is better suited for data types that will only have one items
   * displayed at a time because it occupies much more space and does not allow for sorting.
   *
   * The default value is `list-table`
   * @property {String} listType
   */
  listType: 'list-table',
  /**
   * The title of the view to display in the heading or tab container button in related views
   * @property {String} title
   */
  title: '',
  /**
   * Views related to the current view. If related views are provided, the
   * crud manager will display items related to selected items on the detail page.
   * The crud manager will automatically have filters created to only show items
   * with a value that matches the related views foreign key.
   * @property {Array<crud.types.relatedView>} relatedViews
   */
  relatedViews: undefined,
  /**
   * A method to call before a new object in this view is created
   * @property {funtion} beforeCreate
   */
  beforeCreate: undefined,
  /**
   * A method to call after a new object in this view is created
   * @property {funtion} beforeCreate
   */
  afterCreate: undefined,
  /**
   * A method to call before an object in this view is saved
   * @property {funtion} beforeCreate
   */
  beforeSave: undefined,
  /**
   * A method to call after an object in this view is saved
   * @property {funtion} afterSave
   */
  afterSave: undefined,
  /**
   * A method to call before an object in this view is deleted
   * @property {funtion} beforeDelete
   */
  beforeDelete: undefined,
  /**
   * A method to call after an object in this view is deleted
   * @property {funtion} afterDelete
   */
  afterDelete: undefined,
  /**
   * Additional buttons to display when items are checked in the table. Buttotns
   * can have an icon, text an an on click event handler
   * @property {Array<ManageButton>}
   *   ```
   *   manageButtons: [{
       iconClass: 'fa fa-files-o',
       text: 'New Workorder',
       onClick(items){
         batchWorkorder('water_pipe', items);
       }
     }],
     ```
   */
  manageButtons: undefined
});
