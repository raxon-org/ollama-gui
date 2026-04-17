//import { create } from "/Module/Create/Js/Create.js";
import { file } from "/Application/Ollama/Gui/Module/File.js";
import { getSection } from "/Module/Section.js";
//import { taskbar } from "/Navigation/Module/Js/Taskbar.js";
//import { user } from "/Module/User/Js/User.js";
//import {exception} from "/Module/Exception/Js/Exception.js";

let head = {};

head.init = () => {
    head.select();
}

head.select = () => {
    const section = getSection(file.data.get('section.id'));
    if(!section){
        return;
    }
    const head = section.select('.head');
    head.on('mousedown', (event) => {
        const div = event.target.closest('div');
        if(!div){
            return;
        }
        const dialog = div.parentNode;
        if(!dialog){
            return;
        }
        const section = dialog.parentNode;
        if(!section){
            return;
        }
        console.log(section);
        console.log(section.attribute('id'));
        file.data.set('section.id', section.attribute('id'));
    });
}

export { head }