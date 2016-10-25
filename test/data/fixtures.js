import data from './tasks.json';
import fixture from 'can-fixture';
import DefineList from 'can-define/list/list';
import assign from 'can-util/js/assign/assign';


//a mock ajax service
fixture({
    'GET /tasks' (params) {
        const perPage = params.data.perPage || 10;
        const page = params.data.page || 0;
        const sortInfo = params.data.sort;
        let tempData = new DefineList(data);

    //filter it
        if (params.data.filters && params.data.filters.length) {
      //lets just handle one filter for testing
            const f = params.data.filters[0];
            console.log('only the first filter is going to be used!');
            if (f.operator !== 'contains') {
                console.log('operator not implemented, contains will be used instead');
            }
            tempData = tempData.filter((d) => {
                return d[f.name].indexOf(f.value) !== -1;
            });
        }

    //sort it
        if (sortInfo && sortInfo.fieldName) {
            const field = sortInfo.fieldName;
            tempData = tempData.sort((a, b) => {
                return sortInfo.type === 'asc' ?
          //if ascending
          (a[field] === b[field] ? 0 :
            a[field] > b[field] ? 1 : -1) :
          //if descending
          (a[field] === b[field] ? 0 :
            a[field] > b[field] ? -1 : 1);
            });
        }

    //pageinate it
        tempData = tempData.slice(page * perPage, perPage + page * perPage);

        return tempData.serialize();
    },
    'POST /tasks' (params, response) {
        const newId = data[data.length - 1].id + 1;
        data.push(assign({
            id: newId
        }, params.data));
        response(data[data.length - 1]);
    },
    'GET /tasks/{id}' (params, response) {
        const items = data.filter((item) => {
          //eslint-disable-next-line eqeqeq
            return item.id == params.data.id;
        });
        if (!items.length) {
            response(404, 'Not Found');
            return null;
        }
        return items[0];
    },
    'PUT /tasks/{id}' (params, response) {
        let item = data.filter((i) => {
          //eslint-disable-next-line eqeqeq
            return i.id == params.data.id;
        });
        if (!item.length) {
            response(404, 'Not Found');
            return;
        }
        item = item[0];
        const index = data.indexOf(item);
        if (index !== -1) {
            data[index] = Object.assign(item, params.data);
            response(data);
        } else {
            response(404, 'Not Found');
        }
    },
    'DELETE /tasks/{id}' (params, response) {
        let item = data.filter((i) => {
            return i.id == params.data.id;
        });
        if (!item.length) {
            response(404, 'Not Found');
            return;
        }
        item = item[0];
        const index = data.indexOf(item);
        if (index !== -1) {
            data.splice(data.indexOf(item), 1);
            response(data);
        } else {
            response(404, 'Not Found');
        }
    }
});
