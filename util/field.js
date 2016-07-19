/*
 * field parsing and creating utilities
 */

import CanMap from 'can/map/';
import 'can/map/define/';
import stache from 'can/view/stache/';
import can from 'can/util/library';

import { makeSentenceCase } from './string';

let TEMPLATES = {
  text: '<text-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
  select: '<select-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
  file: '<file-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
  json: '<json-field {properties}="properties" (change)="setField" {value}="getFieldValue(.)" />',
  date: '<date-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />'
};

//precompile templates
for (var type in TEMPLATES) {
  if (TEMPLATES.hasOwnProperty(type)) {
    TEMPLATES[type] = stache(TEMPLATES[type]);
  }
}

export {TEMPLATES};

/**
 * @module util/field.Field FieldDefinition
 * @parent crud.types
 *
 */
export const Field = CanMap.extend({
  define: {
    /**
     * The name of the property on the object, this field's name
     * @property {String} util/field.Field.name
     */
    name: {
      type: 'string'
    },
    /**
     * A friendly name for the field used to display to the user
     * The default is to capitalize the name and remove underscores
     * @property {String} util/field.Field.alias
     */
    alias: {
      type: 'string',
      get(alias) {
        if (alias) {
          return alias;
        }
        return makeSentenceCase(this.attr('name'));
      }
    },
    /**
     * The type of the form field to use when editing this field. These types
     * are defined in the `util/field.TEMPLATES` constant
     * @property {String} util/field.Field.type
     */
    fieldType: {
      type: 'string',
      value: 'text'
    },
    /**
     * The form field template to use when editing this field. This should be
     * a can.stache template renderer. By default, this value is set to the
     * template for the given `type` property.
     * @property {can.view.Renderer}
     */
    formTemplate: {
      get(template) {
        if (template) {
          return template;
        }
        let type = this.attr('fieldType');
        if (!TEMPLATES.hasOwnProperty(type)) {
          console.warn('No template for the given field type', type);
          return TEMPLATES.text;
        }
        return TEMPLATES[type];
      }
    },
    /**
     * Excludes this field from the list-table
     * @property {Boolean}
     */
    excludeListTable: {
      value: false
    },
    /**
     * Excludes this field from the property-table
     * @property {Boolean}
     */
    excludePropertyTable: {
      value: false
    },
    /**
     * Excludes this field from the form-widget
     * @property {Boolean}
     */
    excludeForm: {
      value: false
    },
    /**
     * Formats the property when it is displayed in a property or list table
     * @property {Function}
     */
    formatter: {
      value: null
    }
  },
  getFormattedValue(obj) {
    return this.attr('formatter') ?
      this.attr('formatter')(obj.attr(this.attr('name')), obj):
      can.esc(obj.attr(this.attr('name')));
  }
});

/**
 * @function util/field.mapToFields
 * Converts a can.Map to an array of Field objects using the define
 * property or the keys
 * @param  {Constructor<can.Map>} m The extended map/constructor to parse
 * @return {Array<Field>} The array of fields
 */
export function mapToFields(m) {
  let define = m.define || m.prototype.define;
  let fields = [];
  if (define) {
    for (let prop in define) {
      if (define.hasOwnProperty(prop)) {
        fields.push(can.extend({
          name: prop,
          type: 'text',
          fieldType: 'text',
        }, define[prop]));
      }
    }
  } else {
    //we have a constructor so make a new map and get its keys
    fields = CanMap.keys(new m());
  }
  return parseFieldArray(fields);
}

/**
 * @function util/field.parseFieldArray
 * Converts an array of strings or field json objects into Field objects
 * @param  {Array<Field | String>} fields An array of either strings or JSON like objects representing Field object properties
 * @return {Array<Field>} The array of fields
 */
export function parseFieldArray(fields) {
  return fields.map(f => {
    if (typeof f === 'string') {
      f = {
        name: f
      };
    }
    return new Field(f);
  });
}
