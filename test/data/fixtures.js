import data from './tasks.json';
import fixture from 'can/util/fixture/';

//a mock ajax service
fixture({
  'GET /tasks' () {
    return data;
  },
  'POST /tasks' (params, response) {
    let newId = data[data.length - 1].id + 1;
    data.push(can.extend({
      id: newId
    }, params.data));
    response(data[data.length - 1]);
  },
  'GET /tasks/{id}' (params, response) {
    let items = data.filter((item) => {
      return item.id == params.data.id;
    });
    if (!items.length) {
      response(404, 'Not Found');
      return;
    }
    return items[0];
  },
  'PUT /tasks/{id}' (params, response) {
    let item = data.filter(i => {
      return i.id === params.data.id;
    });
    let index = data.indexOf(item);
    if (index !== -1) {
      data[index] = can.extend(item, params.data);
      response(data);
    } else {
      response(404, 'Not Found');
    }
  },
  'DELETE /tasks/{id}' (params, response) {
    let item = data.filter(i => {
      return i.id === params.data.id;
    });
    let index = data.indexOf(item);
    if (index !== -1) {
      data.splice(data.indexOf(item), 1);
      response(data);
    } else {
      response(404, 'Not Found');
    }
  }
});
