import { file } from "/Application/Ollama/Gui/Module/File.js";
import { getSection } from "/Module/Section.js";
import { taskbar } from "/Application/Desktop/Module/Taskbar.js";
import create from "/Module/Create.js";
import user from "/Module/User.js";

let menu = {};

menu.init = (section_id) => {
    menu.file(section_id);
    menu.application(section_id);
    menu.refresh(section_id);
}

menu.application = (section_id) => {
    const section = getSection(section_id);
    if(!section){
        return;
    }
    if(typeof _('dialog').click === 'function'){
        _('dialog').click(section, '.menu-application-ollama-manager');
    }
}

menu.refresh = (section_id) => {
    const section = getSection(section_id);
    if(!section){
        return;
    }
    const menu = section.select('.menu-application-ollama-manager');
    if(!menu){
        return;
    }
    const refresh = menu.select('.refresh');
    if(!refresh){
        return;
    }
    refresh.on('click', (event) => {
        const section = getSection(file.data.get('section.id'));
        if(!section){
            return;
        }
        const input = section.select('input[name="address"');
        if(!input){
            return;
        }
        if(input.val()){
            refresh.addClass('fa-spin');
            input.trigger('change');
        }
    });
}

menu.file = (section_id) => {
    const section = getSection(section_id);
    if(!section){
        return;
    }
    const menu = section.select('.menu');
    if(!menu){
        return;
    }
    const li = menu.select('li.file');
    if(!li){
        return;
    }
    const menu_file = menu.select('.menu-file');
    const menu_file_protector = menu.select('.menu-file-protector');
    const dialog = menu.closest('.dialog');
    li.on('click', (event) => {
        if(menu_file) {
            menu_file.toggleClass('display-none');
            menu_file.style.zIndex = parseInt(dialog.style.zIndex) + 2;
        }
        if(menu_file_protector){
            menu_file_protector.toggleClass('display-none');
            menu_file_protector.style.zIndex = parseInt(dialog.style.zIndex) + 1;
        }
    });
    if(menu_file_protector){
        menu_file_protector.on('click', (event) => {
            if(menu_file){
                menu_file.addClass('display-none');
                menu_file_protector.addClass('display-none');
            }
        });
    }
    const menu_file_exit = menu.select('.menu-file-exit');
    if(menu_file_exit){
        menu_file_exit.on('click', (event) => {
            taskbar.delete(section.attribute('id'));
            section.remove();
        });
    }
    const menu_file_demo = menu.select('.menu-file-demo');
    if(menu_file_demo){
        menu_file_demo.on('click', (event) => {
            alert('demo enable...');
        });
    }
    const menu_file_demo_write = menu.select('.menu-file-demo-write');
    if(menu_file_demo_write){
        menu_file_demo_write.on('click', (event) => {
            const data = file.data.get('data.' + section_id);
            const content = file.data.get('content.' + section_id);
            const messages = file.data.get('messages.' + section_id);
            // const history
            console.log(data);
            console.log(content);
            console.log(messages);
            alert('demo enable...');
        });
    }
    if(typeof _('dialog').click === 'function'){
        _('dialog').click(section, '.menu');
    }
}

export { menu }