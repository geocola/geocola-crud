import q from 'steal-qunit';
import can from 'can';

import { ViewModel } from './crud-manager';
import { ViewMap } from './ViewMap';
import { Connection, TaskMap } from '../../test/data/connection';
import { TOPICS } from './crud-manager';
import PubSub from 'pubsub-js';
let vm;

q.config.testTimeout = 2000;

q.module('crud-manager.ViewModel', {
  beforeEach: () => {
    localStorage.clear();
    vm = new ViewModel();
  },
  afterEach: () => {
    vm = null;
    PubSub.clearAllSubscriptions();
    localStorage.clear();
  }
});

test('totalPages get()', assert => {
  let cases = [{
    items: 99,
    perPage: 10,
    expected: 10
  }, {
    items: 100,
    perPage: 10,
    expected: 10
  }, {
    items: 101,
    perPage: 10,
    expected: 11
  }];
  cases.forEach(c => {
    vm.attr({
      view: {
        connectionProperties: {
          totalItems: c.items
        }
      },
      queryPerPage: c.perPage
    });
    assert.equal(vm.attr('totalPages'), c.expected, 'totalPages should be calculated correctly');
  });
});

test('showPaginate get()', assert => {
  vm.attr({
    view: {
      connectionProperties: {
        totalItems: 10
      }
    }
  });
  vm.attr('parameters.perPage', 25);
  assert.equal(vm.attr('showPaginate'), false, 'pagination should not be shown with one page');

  vm.attr({
    view: {
      connectionProperties: {
        totalItems: 10
      }
    }
  });
  vm.attr('parameters.perPage', 5);
  assert.equal(vm.attr('showPaginate'), true, 'pagination should be shown with more than one page');
});

test('objects get()', assert => {
  let done = assert.async();
  vm.attr('view', { connection: Connection });
  vm.attr('objects').then(data => {
    assert.ok(data.length, 'data should be retrieved correctly');
    done();
  });
});

test('focusObject get()', assert => {
  let done = assert.async();
  vm.attr({
    view: {
      connection: Connection
    },
    viewId: 11
  });
  vm.attr('focusObject').then(data => {
    assert.equal(data.attr('id'), 11, 'data should be retrieved correctly');
    done();
  });

});

test('buttons get()', assert => {
  assert.equal(vm.attr('buttons').length, 3, 'buttons should be edit buttons');
  vm.attr('view', {
    disableEdit: true
  });

  assert.equal(vm.attr('buttons').length, 1, 'buttons should be default buttons');
});

test('_fields get()', assert => {
  vm.attr('view', {
    objectTemplate: TaskMap
  });
  assert.equal(vm.attr('_fields').length, 2, 'if no fields exist on the view, they should be created from the objectTemplate');

  vm.attr('view', {
    fields: ['test1', 'test2', 'test3', 'test4']
  });
  assert.equal(vm.attr('_fields').length, 4, 'if fields do exist on the view, they should be created correctly');
});

test('init() with parameters', assert => {
  vm = new ViewModel({
    view: {
      parameters: { test: 'text' }
    }
  });
  assert.equal(vm.attr('parameters.test'), 'text', 'parameters should be mixed in');

  vm = new ViewModel({
    relatedField: 'test',
    relatedValue: 'testVal'
  });
  assert.equal(vm.attr('parameters.filters.length'), 1, 'should create filters parameter when initialized with related field and value');
});

test('editObject(scope, dom, event, obj)', assert => {
  let done = assert.async();
  let id = 11;
  let obj = Connection.get({ id: id }).then(obj => {
    vm.attr('view', {
      connection: Connection
    });
    vm.editObject(null, null, null, obj);
    assert.equal(vm.attr('viewId'), 11, 'viewId should be set correctly');
    assert.equal(vm.attr('page'), 'edit', 'edit page should be displayed');
    done();
  });
});

test('viewObject(scope, dom, event, obj)', assert => {
  let done = assert.async();
  let id = 11;
  let def = Connection.get({ id: id });
  def.then(obj => {
    vm.attr('view', {
      connection: Connection
    });
    vm.viewObject(null, null, null, obj);
    assert.equal(vm.attr('viewId'), 11, 'viewId should be set correctly');
    assert.equal(vm.attr('page'), 'details', 'details page should be displayed');
    done();
  });
});

test('saveObject(obj) success', assert => {
  let done = assert.async(3);
  let view = {
    connection: Connection
  };
  let token = PubSub.subscribe(TOPICS.ADD_MESSAGE, (name, message) => {
    assert.ok(message.attr('message'), 'message should be published');
    done();
  });

  let id = 11;
  let obj = Connection.get({ id: id }).then(obj => {
    vm.attr('view', view);

    let def = vm.saveObject(obj);
    def.then(result => {
      assert.ok(result, 'deferred should be resolved');
      done();
    });
  });

  id = 999;
  vm.attr('view', view);

  let def = vm.saveObject(new TaskMap({ title: 'title' }));
  def.fail(result => {
    assert.ok(result, 'deferred should be resolved');
    done();
  });
});

test('beforeCreate and afterCreate events', assert => {
  let done = assert.async(4);
  let myMap = new TaskMap({ name: 'do stuff' });
  let view = {
    connection: Connection,
    beforeCreate(obj) {
      assert.notOk(obj.attr('id'), 'event should pass object not yet be saved with id');
      done();
    },
    afterCreate(obj) {
      assert.ok(typeof obj.attr('id') === 'number', 'event should have object passed with a new id');
      done();
    }
  };
  vm.attr('view', view);

  vm.on('beforeCreate', (event, obj) => {
    assert.notOk(obj.attr('id'), 'event should pass object not yet be saved with id');
    done();
  });

  vm.on('afterCreate', (event, obj) => {
    assert.ok(typeof obj.attr('id') === 'number', 'event should have object passed with a new id');
    done();
  });

  vm.setPage('add');
  vm.saveObject(myMap);
});

test('setPage(page)', assert => {
  vm.attr({
    'page': 'edit',
    viewId: 999
  });

  vm.setPage('all');
  assert.equal(vm.attr('page'), 'all', 'page should be set correctly');
  assert.equal(vm.attr('viewId'), 0, 'viewId should be reset');
});

test('getNewObject()', assert => {
  vm.attr('view', {
    objectTemplate: TaskMap
  });
  assert.deepEqual(vm.getNewObject().attr(), new TaskMap().attr(), 'new object should be created');
});

test('deleteObject(obj, skipConfirm)', assert => {
  let done = assert.async(7);
  let view = {
    connection: Connection,
    beforeDelete(obj) {
      assert.equal(obj.attr('id'), id, 'object should be passed with before delete event');
      done();
    },
    afterDelete(obj) {
      assert.equal(obj.attr('id'), id, 'object should be passed with after delete event');
      done();
    }
  };
  let token = PubSub.subscribe(TOPICS.ADD_MESSAGE, (name, message) => {
    assert.ok(message.attr('message'), 'message should be published');
    done();
  });

  let id = 11;
  vm.attr('view', view);

  vm.on('beforeDelete', (event, obj) => {
    assert.equal(obj.attr('id'), id, 'object should be passed with before delete event');
    done();
  });
  vm.on('afterDelete', (event, obj) => {
    assert.equal(obj.attr('id'), id, 'object should be passed with after delete event');
    done();
  });

  //delete the object skip confirm
  let def = vm.deleteObject(new TaskMap({ id: id }), true);
  def.then(result => {
    assert.ok(result, 'success deferred should be resolved');
    done();
  });

  id = 99;
  vm.attr('view', view);

  //delete the object skip confirm
  def = vm.deleteObject(new TaskMap({ id: id }), true);
  def.fail(result => {
    assert.ok(result, 'fail deferred should be resolved');
    done();
  });
});

test('deleteMmultiple()', assert => {
  let done = assert.async(2);
  let view = {
    connection: Connection
  };
  let token = PubSub.subscribe(TOPICS.ADD_MESSAGE, (name, message) => {
    assert.ok(message.attr('message'), 'message should be published');
    done();
  });

  let id = 11;
  vm.attr({
    view: view,
    selectedObjects: new can.List([new TaskMap({
      id: 11
    }), new TaskMap({
      id: 1
    })])
  });
  let defs = vm.deleteMultiple(true);
  defs.forEach(def => {
    def.then(r => {
      assert.ok(r, 'deferred should be resolved');
      done();
    });
  });
});

test('toggleFilter(val)', assert => {
  vm.toggleFilter();
  assert.ok(vm.attr('filterVisible'), 'filter should be visible after toggling');

  vm.toggleFilter();
  assert.notOk(vm.attr('filterVisible'), 'filter should not be visible after toggling again');

  vm.toggleFilter(false);
  assert.notOk(vm.attr('filterVisible'), 'filter should not be visible after toggling to false');
});

test('getRelatedValue(foreignKey, focusObject)', assert => {
  let map = new TaskMap({
    test: 'testValue'
  });
  assert.equal(vm.getRelatedValue('test', map), 'testValue', 'related value should be returned');
});
