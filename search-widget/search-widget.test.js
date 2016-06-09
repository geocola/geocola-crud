import q from 'steal-qunit';

import { ViewModel } from './search-widget';
import SuperMap from 'can-connect/can/super-map/';
import data from '../test/data/tasks.json';
import CanMap from 'can/map/';
import List from 'can/list/';

let TaskMap = CanMap.extend({
  id:null,
  name: null,
  description: null
});

let TaskList = List.extend({
  map: TaskMap
});


export const Connection = SuperMap({
  idProp: "id",
  'Map': TaskMap,
  List: TaskList,
  url: {
    getListData(params){
      console.log(params);
    }
  },
  name: "task"
});


let vm;
q.module('search-widget.ViewModel', {
  beforeEach() {
    vm = new ViewModel();
  },
  afterEach() {
    vm = null;
  }
});

q.test('suggestions get()', assert => {
  let done = assert.asyng();
  vm.attr('dataSource', Connection);
  vm.attr('searchValue', 'test task');
  vm.attr('suggestions').then(data => {
    console.log(data);
  });
});
