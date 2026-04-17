import { date } from "/Module/Date.js";
import { getSectionById } from "/Module/Section.js";
//import { header } from "/Module/Header/Js/Header.js";
import { object } from "/Module/Object.js";
import { exception } from "/Module/Exception.js";
//import { request } from "/Module/Request/Js/Request.js";
import { round } from "/Module/Round.js";
import { table } from "/Module/Table.js";
import { __ } from "/Module/Translation.js";
import create from "/Module/Create.js";
import user from "/Module/User.js";
import login from "/User/Module/Login.js";

let file = {};
file.data = {
    data : {},
    set : (attribute, value) => {
        if(typeof attribute === 'object'){
            for(let attr in attribute){
                object.set(attr, attribute[attr], file.data.data);
            }
        } else {
            object.set(attribute, value, file.data.data);
        }
    },
    has : (attribute) => {
        return object.has(attribute, file.data.data);
    },
    get : (attribute) => {
        return object.get(attribute, file.data.data);
    },
    delete : (attribute) => {
        return object.delete(attribute, file.data.data);
    }
};

file.read = () => {

    console.log(file.data.get());
}

file.header = (thead, tr) => {
    let th = create('th');
    tr.appendChild(th);
    th = create('th');
    th.html(__('file.manager.name'));
    tr.appendChild(th);
    th = create('th');
    th.html(__('file.manager.modified'));
    tr.appendChild(th);
    th = create('th');
    th.html(__('file.manager.type'));
    tr.appendChild(th);
    th = create('th');
    th.html(__('file.manager.size'));
    tr.appendChild(th);
    thead.appendChild(tr);
    return thead;
}

file.size = (size) => {
    const bytes = 1024;
    if(size > bytes * bytes * bytes * bytes){
        size = round(size / (bytes * bytes * bytes * bytes), 2) + ' ' + __('file.manager.TB');
    }
    else if(size > bytes * bytes * bytes){
        size = round(size / (bytes * bytes * bytes), 2) + ' ' + __('file.manager.GB');
    }
    else if(size > bytes * bytes){
        size = round(size / (bytes * bytes), 2) + ' ' + __('file.manager.MB');
    }
    else if(size > bytes){
        size = round(size / bytes, 2) + ' ' + __('file.manager.KB');
    } else {
        size += ' ' + __('file.manager.B');
    }
    return size;
}

file.list = (response) => {
    const section = getSectionById(file.data.get('section.id'));
    console.log(file.data.get('section.id'));
    console.log(section);
    console.log(response);
    if(!section){
        return;
    }
    let url = file.data.get('url');
    console.log(url);



    let create_table = create('table');
    let thead = create('thead');
    let tr = create('tr');
    let tbody = create('tbody');
    let totalBytes = 0;
    let totalItems = 0;
    thead = file.header(thead, tr);
    create_table.appendChild(thead);
    if(is.array(response.nodeList)){
        let files = [];
        for(let index in response.nodeList){
            files.push(response.nodeList[index]);
        }
        response.files = files;
    }
    if(is.array(response.files)){
        let index;
        totalItems = response.files.length;
        for(index=0; index < response.files.length; index++){
            let node = response.files[index];
            tr = create('tr');
            let td = create('td', 'icon');
            if(node.type.toLowerCase() === 'dir'){
                td.html('<i class="far fa-folder"></i>');
                tr.data('dir', node.url);
            } else {
                td.html('<i class="far fa-file"></i>');
                tr.data('file', node.url);
                tr.data('extension', node.extension);
                totalBytes+=node.size;
            }
            tr.appendChild(td);
            td = create('td');
            td.html(node.name);
            tr.appendChild(td);
            td = create('td');
            td.html(date('Y-m-d H:i', node.mtime));
            tr.appendChild(td);
            td = create('td');
            td.html(node.extension);
            tr.appendChild(td);
            td = create('td');
            td.html(file.size(node.size));
            tr.appendChild(td);
            tr.on('click', (event) => {
                file.open(event);
            });
            tbody.appendChild(tr);
        }
    }
    create_table.appendChild(tbody);
    const list = section.select('.list');
    if(list){
        list.html('');
        list.appendChild(create_table, list.firstChild);
    }
    const footer = section.select('.footer');
    if(footer){
        const item = footer.select('.item');
        if(item){
            if(totalItems === 1){
                item.html(totalItems + ' ' + __('file.manager.item'));
            } else {
                item.html(totalItems + ' ' + __('file.manager.items'));
            }

        }
        const size = footer.select('.size');
        if(size){
            size.html(file.size(totalBytes));
        }
    }
    table.resize(section.select('.list table'), '2px solid rgba(255, 124, 13, 1)', true);
    const refresh = section.select('.refresh');
    if(!refresh){
        return;
    }
    refresh.removeClass('fa-spin');
}

file.open = (event) => {
    const section = getSectionById(file.data.get('section.id'));
    if(!section){
        return;
    }
    if (event.detail === 1) {
        const list = section.select('.list tr');
        const element = event.target.closest('tr');
        if (
            list &&
            element
        ) {
            list.removeClass('selected');
            element.addClass('selected');
        }
    } else {
        const element = event.target.closest('tr');
        const address = section.select('input[name="address"]');
        if(
            element &&
            element.data('file')
        ){
            file.open_file(element);
        }
        else if (
            element &&
            element.data('dir') &&
            address
        ){
            address.data('dir', element.data('dir'));
            address.value = element.data('dir');
            address.trigger('change');
        }
    }
}

file.open_file = (element) => {
    const route = {
        extension : file.data.get('route.backend.extension'),
        frontend : file.data.get('route.frontend.open')
    };
    let node = {
        "name" : element.data('extension'),
        "request" : {
            "method" : "GET"
        }
    };
    if(!node?.name){
        node.name = 'txt';
    }
    return;
    const token = user.token();
    header("Authorization", 'Bearer ' + token);
    request(route.extension, node, (url, data) => {
        if(exception.authorization(data)){
            user.authorization((url, response) => {
                if(exception.authorization(response)){
                    redirect(user.loginUrl());
                } else {
                    user.data('user', response?.node);
                    request(route.extension, node, (url, response) => {
                        if(response?.nodeList){
                            let index;
                            for(index = 0; index < response.nodeList.length; index++){
                                let node = response.nodeList[index];
                                if(node && is.array(node?.applications)){
                                    let data_send = {};
                                    data_send.file = element.data('file');
                                    data_send.nodeList = node.applications;
                                    request(route.frontend, data_send, (url, response) => {
                                        console.log(response);
                                    });
                                }
                            }
                        }
                    });
                }
            });
        } else {
            if(data?.nodeList){
                let index;
                for(index = 0; index < data.nodeList.length; index++){
                    let node = data.nodeList[index];
                    if(node && is.array(node?.applications)){
                        let data_send = {};
                        data_send.file = element.data('file');
                        data_send.nodeList = node.applications;
                        request(route.frontend, data_send, (url, response) => {
                            console.log(response);
                        });
                    }
                }
            }
        }

    });
}

export { file }