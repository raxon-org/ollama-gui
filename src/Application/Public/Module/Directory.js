import { file } from "/Application/Ollama/Module/File.js";
import { getSectionById } from "/Module/Section.js";
import user from "/Module/User.js";
import { exception } from "/Module/Exception.js";

let directory = {};

directory.select = (section) => {
    const head = section.select('.head');
    if(!head){
        return;
    }
    head.trigger('mousedown');
}

directory.active = (li) => {
    if(li.hasClass('active')){
        return;
    }
    const ul = li.closest('ul');
    if(!ul){
        return;
    }
    let list = ul.select('li');
    if(!list) {
        return;
    }
    list.removeClass('active');
    list = ul.select('.name');
    list.removeClass('error');
    li.addClass('active');
    li.focus();
    ul.scrollTop = (li.offsetTop - ul.offsetHeight / 2);
    let p = li.select('p');
    let style = window.getComputedStyle(p);
    let left = parseInt(style["padding-left"]);
    ul.scrollLeft = (li.offsetLeft + left);
    directory.folder_default();
    directory.folder_open(li);
}

directory.expand = (event) => {
    event.stopPropagation();
    const li = event.target.closest('li');
    if(!li) {
        return;
    }
    if(directory.expand_open(li)){
    } else {
        directory.expand_close(li);
    }
}

directory.expand_open = (li) => {
    if (li.hasClass('expanded')) {
        return;
    }
    const angle = li.select('.fa-angle-right');
    if (angle) {
        angle.removeClass('fa-angle-right').addClass('fa-angle-down');
    }
    const section = select('section[id="' + file.data.get('section.id') + '"] ul.tree section[data-name="' + li.data('name') + '"]');
    if(section){
        section.removeClass('display-none');
    }
    /*
    directory.folder_default();
    directory.folder_open(li);
    const loader = li.select('.loader');
    if (loader) {
        loader.html('<i class="fas fa-spinner fa-spin"></i>');
    }
    const token = user.token();
    header("Authorization", 'Bearer ' + token);
    let node = {};
    node.directory = li.data('dir');
    li.request(null, node, (url, data) => {
        if(exception.authorization(data)){
            user.authorization(() => {
                directory.expand_close(li);
                directory.expand_open(li);
            });
        } else {
            data = directory.create_data(data, li);
            request(li.data('frontend-url'), data, (url, response) => {
                loader.html('');
            });
        }
    });
     */
    li.addClass('expanded');
    return true;
}

directory.expand_close = (li) => {
    if(!li.hasClass('expanded')){
        return;
    }
    const angle = li.select('.fa-angle-down');
    if(angle){
        angle.removeClass('fa-angle-down').addClass('fa-angle-right');
    }
    const folder_open = li.select('.fa-folder-open');
    if(folder_open){
        folder_open.removeClass('fa-folder-open').addClass('fa-folder');
    }
    const section = select('section[id="' + file.data.get('section.id') + '"] ul.tree section[data-name="' + li.data('name') + '"]');
    if(section){
        section.addClass('display-none');
    }
    li.removeClass('expanded');
    return true;
}

directory.open = (event) => {
    if(typeof event === 'undefined'){
        const section = getSectionById(file.data.get('section.id'));
        if(!section){
            return;
        }
        let list = section.select('ul.tree .bind');
        if(list) {
            if (is.nodeList(list)) {
                let index;
                for (index = 0; index < list.length; index++) {
                    directory.bind_node(list[index]);
                }
            } else {
                directory.bind_node(list);
            }
        }
    } else {
        const li = event.target.closest('li');
        if (!li) {
            return;
        }
        const dialog = li.closest('.dialog');
        if(!dialog){
            return;
        }
        const section = dialog.parentNode;
        if(!section){
            return;
        }
        directory.select(section);
        directory.active(li);
        if (event.detail === 1) {
            //click
            directory.address(li);
        } else {
            //dblclick}
            const expand = li.select('.expand');
            if (expand) {
                directory.expand(event);
            }
        }
    }
}

directory.tree = (data) => {
    if(is.array(data?.nodeList?.tree)){
        let index;
        for(index=0; index<data.nodeList.tree.length; index++){
            let node = data.nodeList.tree[index];
            if(!is.empty(node.section) && !is.empty(node.section.dir)){
                node.target = 'section[id=\'' + file.data.get('section.id') + '\'] ul.tree section[data-dir=\'' + node.section.dir +'\']';
            }
            node.method = 'replace';
        }
    }
    data.section = {
        id: file.data.get('section.id')
    }
    return data;
}

directory.read = () => {
    const route = {
        backend : file.data.get('route.backend.tree'),
        frontend :file.data.get('route.frontend.directory')
    };
    console.log(route);
    const retry = file.data.get('directory.read.retry');
    const token = user.token();
    if (
        token &&
        route.backend &&
        route.frontend
    ){
        header("Authorization", 'Bearer ' + token);
        request(route.backend, null, (url, data) => {
            if(
                !is.empty(retry) &&
                exception.authorization(data)
            ){
                console.log(data);
                return;
                //redirect(user.loginUrl());
            }
            else if(
                is.empty(retry) &&
                exception.authorization(data)
            ){
                console.log(data);
                user.authorization(() => {
                    file.data.set('directory.read.retry', 1);
                    directory.read();
                });
            } else {
                data = directory.tree(data);
                console.log(data);
                request(route.frontend, data, (url, response) => {
                    if(
                        is.empty(retry) &&
                        exception.authorization(data)
                    ){
                        user.authorization(() => {
                            file.data.set('directory.read.retry', 1);
                            directory.read();
                        });
                    } else {
                        directory.first();
                    }
                });
            }
        });
    }
}

directory.first = () => {
    const section = getSectionById(file.data.get('section.id'));
    console.log(section);
    if(!section){
        return;
    }
    const list = section.select('.tree li');
    console.log(list);
    let node;
    if(is.nodeList(list)){
        node = list[0];
    } else {
        node = list;
    }
    if(!node){
        return;
    }
    console.log('click');
    //node.trigger('click');

    const name = node.data('name');
    if(!name){
        return;
    }
    const input = section.select('input[name="address"]');
    if(!input){
        return;
    }
    input.val(name);
    input.trigger('change');
    directory.active(node);
}

directory.create_data = (data, li) => {
    data.indent = li.data('indent');
    data.method = li.data('method');
    data.target = li.data('target');
    data.name = li.data('name');
    data.section = {
        id : file.data.get('section.id')
    }
    return data;
}

directory.folder_close = (node) => {
    let folder = node.select('.fa-folder-open');
    if (folder) {
        folder.removeClass('fa-folder-open').addClass('fa-folder');
    }
}

directory.folder_default = () => {
    const section = getSectionById(file.data.get('section.id'));
    if(!section){
        return;
    }
    const list = section.select('ul.tree li');
    if(list){
        if(is.nodeList(list)){
            let index;
            for(index=0; index < list.length; index++){
                directory.folder_close(list[index]);
            }
        } else {
            directory.folder_close(list);
        }
    }
}

directory.folder_open = (li) => {
    console.log(li);
    const folder = li.select('.fa-folder');
    if (folder) {
        folder.removeClass('fa-folder').addClass('fa-folder-open');
    }
    const section = li.closest('section');
    console.log(section);
    if(section){
        const previous = section.previousElementSibling;
        console.log(previous);
        if(previous && previous.tagName === folder.tagName){
            directory.folder_open(previous);
        }
    }
}

directory.address = (li) => {
    const section = getSectionById(file.data.get('section.id'));
    if(!section){
        return;
    }
    const address = section.select('input[name="address"]');
    if(!address){
        return;
    }
    address.value = li.data('name');
    address.data('name', li.data('name'));
    address.trigger('change');
}

directory.bind_node = (node) => {
    console.log(node);
    if(node.hasClass('bind')){
        node.removeClass('bind');
        node.on('click', directory.open);
        let expand = node.select('.expand');
        if (expand && typeof expand.on == 'function') {
            expand.on('click', directory.expand);
        }
    }
}

export { directory }