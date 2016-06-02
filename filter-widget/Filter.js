import CanMap from 'can/map/';
export const Filter = CanMap.extend({
  define: {
    val: {},
    name: {
      type: 'string',
      value: ''
    },
    op: {
      value: 'like',
      type: 'string'
    },
    operator: {
      value: 'like',
      set(val) {
        let op = FilterOptions.filter(f => {
          return f.value === val;
        })[0].operator;
        this.attr('op', op);
        return val;
      },
      serialize: false
    }
  }
});

export const FilterOptions = [{
  label: 'Does not contain',
  operator: 'not_like',
  value: 'not_like',
  types: ['string']
}, {
  label: 'Contains',
  operator: 'like',
  value: 'like',
  types: ['string'],
  filterFactory(filter) {
    filter.attr('val', ['%', filter.attr('val'), '%'].join(''));
    return filter;
  }
}, {
  label: 'Starts with',
  operator: 'like',
  value: 'like',
  types: ['string'],
  filterFactory(filter) {
    filter.attr('val', [filter.attr('val'), '%'].join(''));
    return filter;
  }
}, {
  label: 'Ends with',
  operator: 'like',
  value: 'like',
  types: ['string'],
  filterFactory(filter) {
    filter.attr('val', ['%', filter.attr('val')].join(''));
    return filter;
  }
}, {
  label: 'Exactly equal to',
  operator: 'equals',
  value: 'equals',
  types: ['string', 'number', 'boolean', 'date']
}, {
  label: 'Not exactly equal to',
  operator: 'not_equal_to',
  value: 'not_equal_to',
  types: ['string', 'number', 'boolean', 'date']
}, {
  label: 'Greater Than',
  operator: '>',
  value: 'greater_than',
  types: ['number'],
  filterFactory(filter) {
    filter.attr('val', parseFloat(filter.attr('val')));
    return filter;
  }
}, {
  label: 'Less Than',
  operator: '<',
  value: 'less_than',
  types: ['number'],
  filterFactory(filter) {
    filter.attr('val', parseFloat(filter.attr('val')));
    return filter;
  }
}, {
  label: 'Before',
  operator: '<',
  value: 'before',
  types: ['date'],
  valueField: {
    name: 'val',
    alias: 'Value',
    type: 'date',
    properties: {
      placeholder: 'Select a date'
    }
  }
}, {
  label: 'After',
  operator: '>',
  value: 'after',
  types: ['date'],
  valueField: {
    name: 'val',
    alias: 'Value',
    type: 'date',
    properties: {
      placeholder: 'Select a date'
    }
  }
}];
