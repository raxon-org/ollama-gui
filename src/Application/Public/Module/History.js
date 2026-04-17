import { getSection } from "/Module/Section.js";
import { file } from "/Application/Ollama/Module/File.js";
import create from "/Module/Create.js";
import { replace } from "/Module/String.js";
import { dialog } from "/Dialog/Module/Dialog.js";
let history = {};

history.init = (init) => {
    console.log(init);
}


history.add = (section, pre, prompt) => {
    console.log(prompt);
    const body = section.select('.body .history');
    let element = section.select('.body .history .menu');
    if(!element){
        element = create('ul', 'menu');
    }
    let active = element.select('.active');
    if(active){
        active.removeClass('active');
    }
    let name = prompt.split('').slice(0, 60).join('');
    let li = create('li', 'active');
    li.data('pre-id', pre.id);
    let p = create('p');
    p.title = prompt;
    let span = create('span', 'name');
    span.html(name);
    let history_delete = create('span', 'delete');
    history_delete.appendChild(create('i', 'fas fa-window-close'));
    p.appendChild(span);
    p.appendChild(history_delete);
    li.appendChild(p);
    let child = body.select('li:first-child');
    console.log(child);
    if(child){
        element.insertBefore(li, child);
    } else {
        element.appendChild(li);
    }
    body.appendChild(element);
    li.on('click', (event) => {
        let pre = section.select('pre#' + li.data('pre-id'));
        let active = element.select('.active');
        if(active){
            active.removeClass('active');
        }
        li.addClass('active');
        window.location.hash = li.data('pre-id');
        setTimeout(() => {
            window.location.hash = '';
        }, 0);
    });
    history_delete.on('click', (event) => {
        let pre = section.select('pre#' + li.data('pre-id'));
        li.remove();
        pre.remove();
    });
}

/*
history.update = (id) => {
    const navigation = select('section[name="application-desktop-navigation"]');
    if(!navigation){
        return;
    }
    const task_bar = navigation.select('.task-bar');
    if(!task_bar) {
        return;
    }
    const div = task_bar.select('div[data-section-id="' + id + '"]');
    if(!div){
        return;
    }
    const section = getSection(id);
    if(!section){
        return;
    }
    const head = section.select('.head');
    if(!head){
        return;
    }
    div.title = head.data('title');
}

history.delete = (id) => {
    const navigation = select('section[name="application-desktop-navigation"]');
    if(!navigation) {
        return;
    }
    const task_bar = navigation.select('.task-bar');
    if(!task_bar) {
        return;
    }
    const div = task_bar.select('div[data-section-id="' + id + '"]');
    if(!div) {
        return;
    }
    div.remove();
}

history.active = (id) => {
    const navigation = select('section[name="application-desktop-navigation"]');
    if (!navigation) {
        return;
    }
    const task_bar = navigation.select('.task-bar');
    if (!task_bar) {
        return;
    }
    let thumbnails = task_bar.select('div.thumbnail');
    if (is.nodeList(thumbnails)) {
        thumbnails.forEach((thumbnail) => {
            thumbnail.removeClass('active');
        });
    } else if (thumbnails) {
        thumbnails.removeClass('active');
    }
    const div = task_bar.select('div[data-section-id="' + id + '"]');
    if (!div) {
        return;
    }
    div.addClass('active');
}
 */

export { history };




