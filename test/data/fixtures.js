import data from './tasks.json';
import fixture from 'can/util/fixture/';
import List from 'can/list/';
import 'can/list/sort/';

//a mock ajax service
fixture({
  'GET /tasks' (params, response) {
    let perPage = params.data.perPage || 10;
    let page = params.data.page || 0;
    let sortInfo = params.data.sort;
    let tempData = new List(data);

    //filter it
    if (params.data.filters && params.data.filters.length) {
      //lets just handle one filter for testing
      let f = params.data.filters[0];
      console.log('only the first filter is going to be used!');
      if (f.operator !== 'contains') {
        console.log('operator not implemented, contains will be used instead');
      }
      tempData = tempData.filter(d => {
        return d[f.name].indexOf(f.value) !== -1;
      });
    }

    //sort it
    if (sortInfo && sortInfo.fieldName) {
      let field = sortInfo.fieldName;
      tempData = tempData.sort((a, b) => {
        return sortInfo.type === 'asc' ?
          //if ascending
          (a.attr(field) === b.attr(field) ? 0 :
            a.attr(field) > b.attr(field) ? 1 : -1) :
          //if descending
          (a.attr(field) === b.attr(field) ? 0 :
            a.attr(field) > b.attr(field) ? -1 : 1);
      });
    }

    //pageinate it
    tempData = tempData.slice(page * perPage, perPage + page * perPage);

    return tempData.attr();
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
      return i.id == params.data.id;
    })[0];
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
      return i.id == params.data.id;
    })[0];
    let index = data.indexOf(item);
    if (index !== -1) {
      data.splice(data.indexOf(item), 1);
      response(data);
    } else {
      response(404, 'Not Found');
    }
  }
});
