import { directory } from "/Application/Ollama/Gui/Module/Directory.js";
import { exception } from "/Module/Exception.js";
import { file } from "/Application/Ollama/Gui/Module/File.js";
import { history } from "/Application/Ollama/Gui/Module/History.js";
import { microphone } from "/Application/Ollama/Gui/Module/Microphone.js";
import { getSection } from "/Module/Section.js";
import { taskbar } from "/Application/Desktop/Module/Taskbar.js";
import create from "/Module/Create.js";
import user from "/Module/User.js";
import hljs from '/Highlight/es/highlight.js';
import apache from '/Highlight/es/languages/apache.js';
import awk from '/Highlight/es/languages/awk.js';
import bash from '/Highlight/es/languages/bash.js';
import c from '/Highlight/es/languages/c.js';
import cpp from '/Highlight/es/languages/cpp.js';
import css from '/Highlight/es/languages/css.js';
import dockerfile from '/Highlight/es/languages/dockerfile.js';
import excel from '/Highlight/es/languages/excel.js';
import go from '/Highlight/es/languages/go.js';
import graphql from '/Highlight/es/languages/graphql.js';
//import html from '/Highlight/es/languages/html.js';
import http from '/Highlight/es/languages/http.js';
import javascript from '/Highlight/es/languages/javascript.js';
import json from '/Highlight/es/languages/json.js';
import markdown from '/Highlight/es/languages/markdown.js';
import php from '/Highlight/es/languages/php.js';
import php_template from '/Highlight/es/languages/php-template.js';
import python from '/Highlight/es/languages/python.js';
import raxon from '/Highlight/es/languages/raxon.js';
import rust from '/Highlight/es/languages/rust.js';
import shell from '/Highlight/es/languages/shell.js';
import sql from '/Highlight/es/languages/sql.js';
import wasm from '/Highlight/es/languages/wasm.js';
import x86asm from '/Highlight/es/languages/x86asm.js';
import xml from '/Highlight/es/languages/xml.js';
import xquery from '/Highlight/es/languages/xquery.js';
import yaml from '/Highlight/es/languages/yaml.js';

let input = {};


input.init = (section_id, languages = {}) => {
    const section = getSection(section_id);
    if(!section){
        return;
    }
    let content = section.select('.content');
    if(content){
        content.html('');
    }
    let id_list = [];
    for(let language in languages){
        let options = languages[language];
        switch(language){
            case 'apache':
                hljs.registerLanguage('apache', apache);
                break;
            case 'awk':
                hljs.registerLanguage('awk', awk);
                break;
            case 'bash':
                hljs.registerLanguage('bash', bash);
                break;
            case 'c':
                hljs.registerLanguage('c', c);
                break;
            case 'cpp':
                hljs.registerLanguage('cpp', cpp);
                break;
            case 'css':
                hljs.registerLanguage('css', css);
                break;
            case 'dockerfile':
                hljs.registerLanguage('dockerfile', dockerfile);
                break;
            case 'excel':
                hljs.registerLanguage('excel', excel);
                break;
            case 'go':
                hljs.registerLanguage('go', go);
                break;
            case 'graphql':
                hljs.registerLanguage('graphql', graphql);
                break;
            case 'html':
                //nothing
                break;
            case 'http':
                hljs.registerLanguage('http', http);
                break;
            case 'javascript':
                hljs.registerLanguage('javascript', javascript);
                break;
            case 'json':
                hljs.registerLanguage('json', json);
                break;
            case 'markdown':
                hljs.registerLanguage('markdown', markdown);
                break;
            case 'php':
                hljs.registerLanguage('php', php);
                break;
            case 'php-template':
                hljs.registerLanguage('php-template', php_template);
                break;
            case 'python':
                hljs.registerLanguage('python', python);
                break;
            case 'raxon':
                hljs.registerLanguage('raxon', raxon);
                break;
            case 'rust':
                hljs.registerLanguage('rust', rust);
                break;
            case 'shell':
                hljs.registerLanguage('shell', shell);
                break;
            case 'sql':
                hljs.registerLanguage('sql', sql);
                break;
            case 'wasm':
                hljs.registerLanguage('wasm', wasm);
                break;
            case 'x86asm':
                hljs.registerLanguage('x86asm', x86asm);
                break;
            case 'xml':
                hljs.registerLanguage('xml', xml);
                break;
            case 'xquery':
                hljs.registerLanguage('xquery', xquery);
                break;
            case 'yaml':
                hljs.registerLanguage('yaml', yaml);
                break;
        }
    }
    const button_options = section.select('button[name="options"]');
    button_options.on('click', (event) => {
        const options = section.select('.options');
        if(options){
            options.toggleClass('display-none');
        }
        const temperature = options.select('[name="temperature"]');
        if(temperature){
            temperature.on('change', (event) => {
                const value = event.target.value;
                if(value){
                    section.select('input[name="temperature"]').val(value);
                    section.select('.temperature-text').html('Temperature: ' + value);
                }
            });
            temperature.trigger('change');
        }
        const context_size = options.select('[name="context-size"]');
        if(context_size){
            context_size.on('change', (event) => {
                const value = event.target.value;
                if(value){
                    section.select('select[name="context-size"]').val(value);
                    section.select('.context-size-text').html('Tokens: ' + value);
                }
            });
            context_size.trigger('change');
        }
        const close = section.select('.fa-window-close');
        if(close){
            close.on('click', (event) => {
                const options = section.select('.options');
                if(options){
                    options.addClass('display-none');
                }
            });
        }
    });
    const button_clear = section.select('button[name="clear"]');
    button_clear.on('click', (event) => {
       let content = section.select('.content');
        if(content){
            content.html('');
        } 
        file.data.delete('messages.' + section_id);
    });
    const button_abort = section.select('button[name="abort"]');
    button_abort.on('click', (event) => {
        //need uuid
        const node = file.data.get('node');
        const data = {
            "uuid" : node?.uuid
        }
        request(file.data.get('route.backend.abort'), data, (url, response) => {
            const eventSource = file.data.get('eventsource.list.' + node?.uuid);
            eventSource.close();
            file.data.delete('eventsource.list.' + node?.uuid);
            //close connection
            /*
            const eventSource = new EventSource(file.data.get('route.backend.sse') + '&uuid=' + node?.uuid);
            eventSource.addEventListener('ping', (event) => {

            });
             */
        })
    });

    const button_microphone = section.select('button[name="microphone"]');    
    button_microphone.on('click', async (event) => {
        const body = section.select('.recorder'); 
        body.removeClass('display-none');       
        const list = body.select('.sound-clips');        
        if (button_microphone.data('on')){            
            button_microphone.data('delete', 'on');
            body.removeClass('has-microphone');            
            const stop = body.select('.microphone-stop');
            stop.trigger('click');
            let div = body.select('.microphone-options');
            if(is.nodeList(div)){
                for(let index = 0; index < div.length; index++){
                    body.removeChild(div[index]);
                }
            } else {
                body.removeChild(div);
            }
            body.addClass('display-none');
            console.log('off');
        } else {
            button_microphone.data('on', true);            
            body.addClass('has-microphone');
            let div = body.select('.microphone-options');
            if(is.empty(div)){
                div = create('div');
                div.className = 'microphone-options';
                div.html(
                    '<canvas class="visualizer" height="120px" width="290px"></canvas>' +
                    '<div class="buttons">' +
                    '<button class="microphone-record">Record</button>' +
                    '<button class="microphone-stop">Stop</button>' +
                    '<button class="microphone-quit">Quit</button>' +
                    '</div>' +
                    '<div class="sound-clips"></div>'
                );
                body.appendChild(div);
            }            
            microphone.init(section_id);
            console.log('on');            
            /*
            setTimeout(() => {
                const recorder = body.select('.microphone-record');
                recorder.trigger('click');   
                console.log(recorder);     
            }, 1);            
            */
        }        
    });

    const submit = section.select('button[name="submit"]')

    submit.on('click', (event) => {
        const prompt = section.select('textarea[name="prompt"]').val();
        const model = section.select('select[name="model"]').val();
        const url_backend = file.data.get('route.backend.generate');

        const num_ctx = parseInt(section.select('[name="context-size"]').val() ?? 2048);
        const temperature = parseFloat(section.select('[name="temperature"]').val() ?? 0.8);
        const seed = parseInt(section.select('[name="seed"]').val() ?? 0);
        const endpoint = section.select('[name="endpoint"]').val();        
        let think = false;
        if(section.select('[name="think"]')?.checked){
            think = section.select('[name="think"]').val();
            if(think === "true"){
                think = true;
            } else {
                think = false;
            }
        }            
        let data;
        if(_('prototype').string.contains(endpoint, 'embed')){
            data = {
                "entity" : {
                    "endpoint": endpoint,
                    "input": prompt,
                    "model": model
                }
            };
        }
        if(_('prototype').string.contains(endpoint, 'chat')){
            let messages = file.data.get('messages.' + section_id) ?? [];
            messages.push(
                {
                    "role": "user",
                    "content": prompt
                }
            );
            file.data.set('messages.' + section_id, messages);
            let tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "directory_list",
                        "description": "List a directory if it was ls",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "directory": {
                                    "type": "string",
                                    "description": "A directory to list",
                                },
                            },
                            "required": ["directory"],
                        }
                    }
                }
            ];
            tools = [];
            data = {
                "entity": {
                    "endpoint": endpoint,
                    "messages": messages,
                    // "tools": tools,
                    "model": model,
                    "think": think,
                    "options": {
                        "stream": true,
                        "num_ctx": num_ctx,
                        "temperature": temperature,
                        "seed": seed
                    }
                }
            }
        } else {
            data = {
                "entity" : {
                    "endpoint": endpoint,
                    "prompt": prompt,
                    "model": model,
                    "think": think,
                    "options": {
                        "stream": true,
                        "num_ctx": num_ctx,
                        "temperature": temperature,
                        "seed": seed
                    }
                }
            };
        }
        input.generate(section_id, section, data);
    });
}

input.generate = (section_id, section, data) => {
    console.log(section_id);
    console.log(data);
    const prompt = section.select('textarea[name="prompt"]').val();
    const token = user.token();
    header("Authorization", 'Bearer ' + token);
    const url_backend = file.data.get('route.backend.generate');
    request(url_backend, data, (url, response) => {
        const start = microtime(true);
        const url_sse = file.data.get('route.backend.sse') + '&uuid=' + response?.node?.uuid;
        let eventSource = new EventSource(url_sse, {
            withCredentials: true,
        });
        data.entity.response = {
            "chunks": [],
            "blob": ''
        };
        file.data.set('node', response?.node);
        let eventsource_list = file.data.get('eventsource.list') ?? {};
        eventsource_list[response?.node?.uuid] = eventSource;
        file.data.set('eventsource.list', eventsource_list);
        let counter = 0;
        let last_event_id = 0;
        let retry = 0;
        let code_depth_multi_line = 0;
        let code_depth_single_line = 0;
        let code_partial_multi_line = '';
        let code_partial_single_line = '';
        let is_thought = false;
        let content = section.select('.content');
        if (content) {
            content.html(content.html() + '<article><span class="prompt">' + prompt + '</span><pre id="response-' + response?.node?.uuid + '"></pre><a id="response-bottom-' + response?.node?.uuid + '"></a></article>');
        }
        let pre = section.select('#response-' + response?.node?.uuid);
        // pre.html(pre.html() +  + "\n\n");
        history.add(section, pre, prompt);
        section.select('textarea[name="prompt"]').val('');
        section.select('textarea[name="prompt"]').focus();
        let a = section.select('#response-bottom-' + response?.node?.uuid);
        if (a) {
            a.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
            // a.scrollIntoView();
        }
        let size = section.select('.footer .size');
        if (size) {
            size.html('Size: ' + 0);
        }
        let queue = section.select('.footer .queue');
        if (queue) {
            queue.html('Queue: ' + 0);
        }
        let amount = section.select('.footer .amount');
        if (amount) {
            amount.html('Tokens: ' + 0);
        }
        let speed = section.select('.footer .speed-size');
        if (speed) {
            speed.html('Speed: ' + '0.000 B/sec')
        }
        speed = section.select('.footer .speed-amount');
        if (speed) {
            speed.html('Speed: ' + '0.000 T/sec')
        }
        eventSource.addEventListener('ping', (event) => {
            let pre = section.select('#response-' + response?.node?.uuid);
            let content = section.select('.content');
            let is_think = false;
            if (parseInt(event.lastEventId) >= parseInt(last_event_id)) {
                last_event_id = event.lastEventId;
            } else if (parseInt(event.lastEventId) === 1 && retry < 3) {
                last_event_id = event.lastEventId;
                if (pre) {
                    pre.html('');
                }
                retry++;
            } else {
                content.html(content.html() + '<hr>');
                //let microphone_button = select('#' + section_id + '[name="microphone"]');
                //let is_active = microphone_button.data('is-active');
                //if(is_active){
                //    microphone_button.data('delete', 'is-active');
                //    microphone_button.trigger('click');
                //}
                const record = select('#' + section_id + ' .microphone-record');
                if (record) {
                    record.disabled = false;
                }
                eventSource.close();
                return;
            }
            if (event?.data) {
                counter = 0;
                let ping_data = JSON.parse(event.data);
                if (ping_data?.finish && ping_data?.finish === true) {
                    eventSource.close();
                    return;
                }

                if (pre && ping_data?.prompt) {
                    section.select('textarea[name="prompt"]').val('');
                    section.select('textarea[name="prompt"]').focus();
                }
                if (
                    ping_data?.message &&
                    ping_data?.message?.tool_calls
                ) {
                    let index = 0;
                    for (index = 0; index < ping_data.message.tool_calls.length; index++) {
                        let tool_call = ping_data.message.tool_calls[index];
                        if (!in_array(tool_call.id, id_list)) {
                            if (tool_call?.function) {
                                const url_tool = file.data.get('route.backend.tool');
                                const data_tool = {
                                    function: tool_call.function.name,
                                    arguments: tool_call.function?.arguments,
                                };
                                request(url_tool, data_tool, (url, response_tool) => {
                                    let messages = file.data.get('messages.' + section_id) ?? [];
                                    let message_last = messages[messages.length - 1];
                                    if (message_last && message_last.role === 'user') {
                                        messages.pop();
                                    }
                                    if (message_last && message_last.role === 'system') {
                                        message_last.content += "\nfunction: " + tool_call?.function?.name + "\nresult:\n```json\n" + JSON.stringify(response_tool) + "\n```\n";
                                        let message_tool_calls = message_last.tool_calls ?? [];
                                        message_tool_calls.push(tool_call);
                                        // message_last.tool_calls = message_tool_calls;
                                        messages[messages.length - 1] = message_last;
                                    } else {
                                        messages.push({
                                            "role": "system",
                                            "content": "function: " + tool_call?.function?.name + "\nresult:\n```json\n" + JSON.stringify(response_tool) + "\n```\n",
                                            // "tool_calls": [tool_call],
                                        });
                                    }
                                    file.data.set('messages.' + section_id, messages);
                                })
                            }
                            id_list.push(tool_call.id);
                        }
                    }
                }
                let string = '';
                if (pre && (ping_data?.response || ping_data?.message || ping_data?.thinking)) {
                    if (ping_data?.response) {
                        //embedding calls
                        is_think = false;
                        if (typeof ping_data.response === 'string') {
                            string = input.unicode_replace(ping_data.response);
                        } else {
                            string = '```json' + "\n\n" + input.unicode_replace(JSON.stringify(ping_data.response)) + "\n" + '```' + "\n\n";
                        }
                        eventSource.close();
                        return;
                    } else if (
                        ping_data?.thinking
                    ) {
                        let thinking = section.select('.thinking[data-uuid="' + response?.node?.uuid + '"]');
                        if (is.nodeList(thinking)) {
                            thinking = thinking[thinking.count - 1];
                            let thinking_pre = thinking.select('pre');
                            thinking_pre.html(thinking_pre.html() + input.unicode_replace(ping_data.thinking));
                        } else if (thinking) {
                            let thinking_pre = thinking.select('pre');
                            thinking_pre.html(thinking_pre.html() + input.unicode_replace(ping_data.thinking));
                        } else {
                            thinking = create('blockquote');
                            thinking.className = 'thinking';
                            thinking.data('uuid', response?.node?.uuid)
                            thinking.html('<h3>Thinking...</h3><pre>' + "\n" + input.unicode_replace(ping_data.thinking) + '</pre>');
                            section.select('.content').appendChild(thinking);
                        }
                        let a = section.select('#thinking-bottom-' + response?.node?.uuid);
                        if (!a) {
                            a = create('a');
                            a.id = 'thinking-bottom-' + response?.node?.uuid;
                            section.select('.content').appendChild(a);
                        }
                        a.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
                        is_think = true;
                    } else if (
                        ping_data?.message &&
                        (
                            ping_data?.message?.content ||
                            ping_data?.message?.thinking
                        )
                    ) {
                        if (ping_data.message?.content) {
                            let content = input.unicode_replace(ping_data.message.content);
                            if (is_thought === true) {
                                is_thought = false;
                                content = '</blockquote>' + content;
                            }
                            string += content;
                        } else if (ping_data.message?.thinking) {
                            let thinking = section.select('.thinking[data-uuid="' + response?.node?.uuid + '"]');
                            if (is.nodeList(thinking)) {
                                thinking = thinking[thinking.count - 1];
                                let thinking_pre = thinking.select('pre');
                                thinking_pre.html(thinking_pre.html() + input.unicode_replace(ping_data.message.thinking));
                            } else if (thinking) {
                                let thinking_pre = thinking.select('pre');
                                thinking_pre.html(thinking_pre.html() + input.unicode_replace(ping_data.message.thinking));
                            } else {
                                thinking = create('blockquote');
                                thinking.className = 'thinking';
                                thinking.data('uuid', response?.node?.uuid);
                                thinking.html('<h3>Thinking...</h3><pre>' + "\n" + input.unicode_replace(ping_data.message.thinking) + '</pre>');
                                section.select('.content').appendChild(thinking);
                            }
                            let a = section.select('#thinking-bottom-' + response?.node?.uuid);
                            if (!a) {
                                a = create('a');
                                a.id = 'thinking-bottom-' + response?.node?.uuid;
                                section.select('.content').appendChild(a);
                            }
                            a.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
                            is_think = true;
                        }

                        /*
                        let messages = file.data.get('messages') ?? [];
                        messages.push({
                            "role": ping_data.message.role,
                            "content": ping_data.message.content
                        });
                        file.data.set('messages', messages);
                        */

                        let messages = file.data.get('messages.' + section_id) ?? [];
                        let message_last = messages[messages.length - 1];
                        if (message_last && message_last.role === ping_data.message.role) {
                            message_last.content += ping_data.message.content;
                            message_last.thinking += ping_data.message.thinking ?? '';
                            messages[messages.length - 1] = message_last;
                        } else {
                            messages.push({
                                "role": ping_data.message.role,
                                "content": ping_data.message.content,
                                "thinking": ping_data.message.thinking ?? ''
                            });
                        }
                        file.data.set('messages.' + section_id, messages);
                    }
                    if (string.substr(0, 3) === '```') {
                        code_partial_multi_line = string;
                    } else if (string.substr(0, 2) === '``') {
                        code_partial_multi_line += string;
                    } else if (string.substr(0, 1) === '`') {
                        code_partial_multi_line += string;
                        code_partial_single_line += string;
                    }
                    if (code_partial_multi_line.substring(0, 3) === '```') {
                        if (code_depth_multi_line === 0) {
                            code_depth_multi_line = 1;
                        } else {
                            code_depth_multi_line = 0;
                        }
                        code_partial_multi_line = '';
                    } else if (code_partial_single_line.substring(0, 1) === '`') {
                        if (code_depth_single_line === 0) {
                            code_depth_single_line = 1;
                        } else {
                            code_depth_single_line = 0;
                        }
                        code_partial_single_line = '';
                    }
                    if (code_partial_multi_line.length > 3) {
                        code_partial_multi_line = '';
                    }
                    data.entity.response.chunks.push(string);
                    data.entity.response.blob += string;
                    if (code_depth_multi_line === 1) {
                        pre.html(input.converter(data.entity.response.blob + "\n\n" + '```'));
                    } else {
                        pre.html(input.converter(data.entity.response.blob));
                    }
                    input.tag_code_remove_class(select('code.apache'), 'apache');
                    input.tag_code_remove_class(select('code.awk'), 'awk');
                    input.tag_code_remove_class(select('code.bash'), 'bash');
                    input.tag_code_remove_class(select('code.c'), 'c');
                    input.tag_code_remove_class(select('code.cpp'), 'cpp');
                    input.tag_code_remove_class(select('code.css'), 'css');
                    input.tag_code_remove_class(select('code.dockerfile'), 'dockerfile');
                    input.tag_code_remove_class(select('code.excel'), 'excel');
                    input.tag_code_remove_class(select('code.go'), 'go');
                    input.tag_code_remove_class(select('code.graphql'), 'graphql');
                    input.tag_code_remove_class(select('code.html'), 'html');
                    input.tag_code_remove_class(select('code.http'), 'http');
                    input.tag_code_remove_class(select('code.javascript'), 'javascript');
                    input.tag_code_remove_class(select('code.json'), 'json');
                    input.tag_code_remove_class(select('code.markdown'), 'markdown');
                    input.tag_code_remove_class(select('code.php'), 'php');
                    input.tag_code_remove_class(select('code.php-template'), 'php-template');
                    input.tag_code_remove_class(select('code.python'), 'python');
                    input.tag_code_remove_class(select('code.raxon'), 'raxon');
                    input.tag_code_remove_class(select('code.rust'), 'rust');
                    input.tag_code_remove_class(select('code.shell'), 'shell');
                    input.tag_code_remove_class(select('code.sh'), 'sh');
                    input.tag_code_remove_class(select('code.sql'), 'sql');
                    input.tag_code_remove_class(select('code.wasm'), 'wasm');
                    input.tag_code_remove_class(select('code.x86asm'), 'x86asm');
                    let assembly = section.select('code.assembly');
                    if (assembly) {
                        assembly.removeClass('assembly');
                        assembly.removeClass('language-assembly');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    assembly = section.select('code.nasm');
                    if (assembly) {
                        assembly.removeClass('nasm');
                        assembly.removeClass('language-nasm');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    assembly = section.select('code.asm');
                    if (assembly) {
                        assembly.removeClass('asm');
                        assembly.removeClass('language-asm');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    let c = section.select('code.C');
                    if (c) {
                        c.removeClass('C');
                        c.removeClass('language-C');
                        c.addClass('language-c');
                        hljs.highlightElement(c);
                    }
                    // input.tag_code_remove_class(select('code.assembly'), 'assembly');
                    // input.tag_code_remove_class(select('code.asm'), 'asm');
                    input.tag_code_remove_class(select('code.xml'), 'xml');
                    input.tag_code_remove_class(select('code.xquery'), 'xquery');
                    input.tag_code_remove_class(select('code.yaml'), 'yaml');
                    input.tag_code_remove_class(select('code.svg'), 'svg');
                    input.tag_code_add_class(select('code'), '', 'language-bash');
                    let a = section.select('#response-bottom-' + response?.node?.uuid);
                    if (a && is_think === false) {
                        a.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
                        // a.scrollIntoView();
                    }
                    let amount = section.select('.footer .amount');
                    if (amount) {
                        amount.html('Tokens: ' + data?.entity?.response?.chunks?.length);
                    }
                    let size = section.select('.footer .size');
                    if (size) {
                        size.html('Size: ' + data?.entity?.response?.blob?.length);
                    }
                    let duration = section.select('.footer .duration');
                    if (duration) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        if (!explode[1]) {
                            explode[1] = '000';
                        }
                        let day = Math.floor(time / 86400);
                        let hour = Math.floor(time / 3600);
                        if (hour >= 24) {
                            hour = hour % 24;
                        }
                        let minute = Math.floor(time / 60);
                        if (minute >= 60) {
                            minute = minute % 60;
                            hour++;
                        }
                        let second = Math.round(time % 60);
                        if (second >= 60) {
                            second = second % 60;
                            minute++;
                        }
                        if (day > 0) {
                            duration.html('Duration: ' + day + ' d, ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (hour > 0) {
                            duration.html('Duration: ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (minute > 0) {
                            duration.html('Duration: ' + minute + ' min, ' + second + ' sec');
                        } else {
                            duration.html('Duration: ' + second + ' sec');
                        }
                    }
                    let speed = section.select('.footer .speed-size');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_size = data?.entity?.response?.blob?.length / time;
                        speed_size = speed_size.toString().split('.');
                        if (!speed_size[1]) {
                            speed_size[1] = '000';
                        }
                        speed_size = speed_size[0] + '.' + speed_size[1].substring(0, 3);
                        speed.html('Speed: ' + speed_size + ' B/sec');
                    }
                    speed = section.select('.footer .speed-amount');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_token = data?.entity?.response?.chunks?.length / time;
                        speed_token = speed_token.toString().split('.');
                        if (!speed_token[1]) {
                            speed_token[1] = '000';
                        }
                        speed_token = speed_token[0] + '.' + speed_token[1].substring(0, 3);
                        speed.html('Speed: ' + speed_token + ' T/sec, ');
                    }
                    let queue = section.select('.footer .queue');
                    if (queue) {
                        queue.html('Queue: ' + ping_data?.queue);
                    }
                    let sse_memory = section.select('.footer .sse-memory');
                    if (sse_memory) {
                        sse_memory.html('SSE memory: ' + ping_data?.memory);
                    }
                } else {
                    let duration = section.select('.footer .duration');
                    if (duration) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        if (!explode[1]) {
                            explode[1] = '000';
                        }
                        let day = Math.floor(time / 86400);
                        let hour = Math.floor(time / 3600);
                        if (hour >= 24) {
                            hour = hour % 24;
                        }
                        let minute = Math.floor(time / 60);
                        if (minute >= 60) {
                            minute = minute % 60;
                            hour++;
                        }
                        let second = Math.round(time % 60);
                        if (second >= 60) {
                            second = second % 60;
                            minute++;
                        }
                        if (day > 0) {
                            duration.html('Duration: ' + day + ' d, ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (hour > 0) {
                            duration.html('Duration: ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (minute > 0) {
                            duration.html('Duration: ' + minute + ' min, ' + second + ' sec');
                        } else {
                            duration.html('Duration: ' + second + ' sec');
                        }
                        // duration.html('Duration: ' + explode[0] + '.' + explode[1].substring(0,3) + ' sec');
                    }
                    let speed = section.select('.footer .speed-size');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_size = data?.entity?.response?.blob?.length / time;
                        speed_size = speed_size.toString().split('.');
                        if (!speed_size[1]) {
                            speed_size[1] = '000';
                        }
                        speed_size = speed_size[0] + '.' + speed_size[1].substring(0, 3);
                        speed.html('Speed: ' + speed_size + ' B/sec');
                    }
                    speed = section.select('.footer .speed-amount');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_token = data?.entity?.response?.chunks?.length / time;
                        speed_token = speed_token.toString().split('.');
                        if (!speed_token[1]) {
                            speed_token[1] = '000';
                        }
                        speed_token = speed_token[0] + '.' + speed_token[1].substring(0, 3);
                        speed.html('Speed: ' + speed_token + ' T/sec, ');
                    }
                    let queue = section.select('.footer .queue');
                    if (queue) {
                        queue.html('Queue: ' + ping_data?.queue);
                    }
                    let sse_memory = section.select('.footer .sse-memory');
                    if (sse_memory) {
                        sse_memory.html('SSE memory: ' + ping_data?.memory);
                    }
                }
                let elements = section.select('pre *');
                if (is.nodeList(elements)) {
                    let index = 0;
                    for (index = 0; index < elements.count; index++) {
                        let element = elements[index];
                        console.log(element);
                    }

                } else if (elements) {
                    let element = elements;
                    console.log(element);
                }
                if (
                    ping_data?.done === true ||
                    ping_data?.finish === true
                ) {
                    let pre = section.select('#response-' + response?.node?.uuid);
                    if (!pre) {
                        pre = create('pre');
                        pre.id = 'response-' + response?.node?.uuid;
                        section.select('.content').appendChild(pre);
                    }
                    pre.html(input.converter(data.entity.response.blob));
                    content.html(content.html() + '<hr>');
                    eventSource.close();
                    input.tag_code_remove_class(select('code.apache'), 'apache');
                    input.tag_code_remove_class(select('code.awk'), 'awk');
                    input.tag_code_remove_class(select('code.bash'), 'bash');
                    input.tag_code_remove_class(select('code.c'), 'c');
                    input.tag_code_remove_class(select('code.cpp'), 'cpp');
                    input.tag_code_remove_class(select('code.css'), 'css');
                    input.tag_code_remove_class(select('code.dockerfile'), 'dockerfile');
                    input.tag_code_remove_class(select('code.excel'), 'excel');
                    input.tag_code_remove_class(select('code.go'), 'go');
                    input.tag_code_remove_class(select('code.graphql'), 'graphql');
                    input.tag_code_remove_class(select('code.html'), 'html');
                    input.tag_code_remove_class(select('code.http'), 'http');
                    input.tag_code_remove_class(select('code.javascript'), 'javascript');
                    input.tag_code_remove_class(select('code.json'), 'json');
                    input.tag_code_remove_class(select('code.markdown'), 'markdown');
                    input.tag_code_remove_class(select('code.php'), 'php');
                    input.tag_code_remove_class(select('code.php-template'), 'php-template');
                    input.tag_code_remove_class(select('code.python'), 'python');
                    input.tag_code_remove_class(select('code.raxon'), 'raxon');
                    input.tag_code_remove_class(select('code.rust'), 'rust');
                    input.tag_code_remove_class(select('code.shell'), 'shell');
                    input.tag_code_remove_class(select('code.sh'), 'sh');
                    input.tag_code_remove_class(select('code.sql'), 'sql');
                    input.tag_code_remove_class(select('code.wasm'), 'wasm');
                    input.tag_code_remove_class(select('code.x86asm'), 'x86asm');
                    let assembly = section.select('code.assembly');
                    if (assembly) {
                        assembly.removeClass('assembly');
                        assembly.removeClass('language-assembly');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    assembly = section.select('code.nasm');
                    if (assembly) {
                        assembly.removeClass('nasm');
                        assembly.removeClass('language-nasm');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    assembly = section.select('code.asm');
                    if (assembly) {
                        assembly.removeClass('asm');
                        assembly.removeClass('language-asm');
                        assembly.addClass('language-x86asm');
                        hljs.highlightElement(assembly);
                    }
                    let c = section.select('code.C');
                    if (c) {
                        c.removeClass('C');
                        c.removeClass('language-C');
                        c.addClass('language-c');
                        hljs.highlightElement(c);
                    }
                    input.tag_code_remove_class(select('code.xml'), 'xml');
                    input.tag_code_remove_class(select('code.xquery'), 'xquery');
                    input.tag_code_remove_class(select('code.yaml'), 'yaml');
                    input.tag_code_remove_class(select('code.svg'), 'svg');
                    input.tag_code_add_class(select('code'), '', 'language-bash');
                    let a = section.select('#response-bottom-' + response?.node?.uuid);
                    if (a) {
                        a.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'start'})
                        //a.scrollIntoView();
                    }
                    let amount = section.select('.footer .amount');
                    if (amount) {
                        amount.html('Tokens: ' + data?.entity?.response?.chunks?.length);
                    }
                    let size = section.select('.footer .size');
                    if (size) {
                        size.html('Size: ' + data?.entity?.response?.blob?.length + ' B');
                    }
                    let duration = section.select('.footer .duration');
                    if (duration) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        if (!explode[1]) {
                            explode[1] = '000';
                        }
                        let day = Math.floor(time / 86400);
                        let hour = Math.floor(time / 3600);
                        if (hour >= 24) {
                            hour = hour % 24;
                        }
                        let minute = Math.floor(time / 60);
                        if (minute >= 60) {
                            minute = minute % 60;
                            hour++;
                        }
                        let second = Math.round(time % 60);
                        if (second >= 60) {
                            second = second % 60;
                            minute++;
                        }
                        if (day > 0) {
                            duration.html('Total: ' + day + ' d, ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (hour > 0) {
                            duration.html('Total: ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                        } else if (minute > 0) {
                            duration.html('Total: ' + minute + ' min, ' + second + ' sec');
                        } else {
                            duration.html('Total: ' + second + ' sec');
                        }
                        // duration.html('Duration: ' + explode[0] + '.' + explode[1].substring(0,3) + ' sec');
                    }
                    let speed = section.select('.footer .speed-size');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_size = data?.entity?.response?.blob?.length / time;
                        speed_size = speed_size.toString().split('.');
                        if (!speed_size[1]) {
                            speed_size[1] = '000';
                        }
                        speed_size = speed_size[0] + '.' + speed_size[1].substring(0, 3);
                        speed.html('Speed: ' + speed_size + ' B/sec');
                    }
                    speed = section.select('.footer .speed-amount');
                    if (speed) {
                        let time = parseFloat(microtime(true)) - parseFloat(start);
                        let explode = time.toString().split('.');
                        let speed_token = data?.entity?.response?.chunks?.length / time;
                        speed_token = speed_token.toString().split('.');
                        if (!speed_token[1]) {
                            speed_token[1] = '000';
                        }
                        speed_token = speed_token[0] + '.' + speed_token[1].substring(0, 3);
                        speed.html('Speed: ' + speed_token + ' T/sec, ');
                    }
                    let queue = section.select('.footer .queue');
                    if (queue) {
                        queue.html('Queue: ' + ping_data?.queue);
                    }
                    let sse_memory = section.select('.footer .sse-memory');
                    if (sse_memory) {
                        sse_memory.html('SSE memory: ' + ping_data?.memory);
                    }
                    return;
                }
            } else {
                counter++;
                let duration = section.select('.footer .duration');
                if (duration) {
                    let time = parseFloat(microtime(true)) - parseFloat(start);
                    let explode = time.toString().split('.');
                    if (!explode[1]) {
                        explode[1] = '000';
                    }
                    let day = Math.floor(time / 86400);
                    let hour = Math.floor(time / 3600);
                    if (hour >= 24) {
                        hour = hour % 24;
                    }
                    let minute = Math.floor(time / 60);
                    if (minute >= 60) {
                        minute = minute % 60;
                        hour++;
                    }
                    let second = Math.round(time % 60);
                    if (second >= 60) {
                        second = second % 60;
                        minute++;
                    }
                    if (day > 0) {
                        duration.html('Duration: ' + day + ' d, ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                    } else if (hour > 0) {
                        duration.html('Duration: ' + hour + ' h, ' + minute + ' min, ' + second + ' sec');
                    } else if (minute > 0) {
                        duration.html('Duration: ' + minute + ' min, ' + second + ' sec');
                    } else {
                        duration.html('Duration: ' + second + ' sec');
                    }
                    // duration.html('Duration: ' + explode[0] + '.' + explode[1].substring(0,3) + ' sec');
                }
            }
        });
    });
}


input.replace_all = (string, find, replace) => {
    return string.replace(new RegExp(find, 'g'), replace);
}

input.unicode_replace = (string) => {
    let result = string.replace(/\u003c/g, "&lt;");
    // let result = string.replace(/\u003c/g, "<");
    return result;
}

input.converter = (string) => {
    const converter = new showdown.Converter();
    string = converter.makeHtml(string)
    // string = string.replace(/&lt;/g, '<');
    // string = string.replace(/&gt;/g, '>');
    string = string.replace(/&amp;lt;/g, '&lt;');
    string = string.replace(/&amp;gt;/g, '&gt;');
    return string;
}

input.tag_code_remove_class = (node, className) => {
    if (is.nodeList(node)) {
        for (let i = 0; i < node.length; i++) {
            node[i].removeClass(className);
            hljs.highlightElement(node[i]);
            // is_html[i].removeClass('language-html').addClass('language-xml');
        }
    } else if (node) {
        node.removeClass(className);
        hljs.highlightElement(node);
    }
}


input.tag_code_add_class = (node, select, className) => {
    if (is.nodeList(node)) {
        for (let i = 0; i < node.length; i++) {
            let item = node[i];
            if(is.empty(select)){
                let classlist = [];
                if(item){
                    classlist = item.attribute('class') ?? [];
                }
                if(is.empty(classlist)){
                    item.addClass(className);
                    hljs.highlightElement(item);
                }
            }
            else if (item.hasClass(select)) {
                item.removeClass(select).addClass(className);
                hljs.highlightElement(item);
            }
        }
    } else if (node) {
        if(is.empty(select)){
            console.log(node);
            let classlist = node?.attribute('class') ?? [];
            if(is.empty(classlist)){
                node.addClass(className);
                hljs.highlightElement(node);
            }
        }
        else if (node.hasClass(select)) {
            node.removeClass(select).addClass(className);
            hljs.highlightElement(node);
        }
    }
}

export { input }