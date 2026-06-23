import { getSection } from "/Module/Section.js";
import { file } from "/Application/Ollama/Gui/Module/File.js";
import { uuid } from "/Module/Web.js";
import user from "/Module/User.js";
//import {createElement} from "../../../../../ace-builds";
// import { pipeline, env } from '/Xenova/transformers@2.14.0.js';
//import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

let microphone = {};

microphone.init = (section_id) => {

    // env.allowRemoteModels = true;
    // env.localModelPath = '/Xenova/Models/';
    const section = getSection(section_id);
    const recorder = section.select('.recorder');
    if(!section){
        return;
    }
    const options = section.select('.microphone-options');
    if(!options){
        return;
    }    
    const record = options.select('.microphone-record');
    const stop = options.select('.microphone-stop');
    const quit = options.select('.microphone-quit');
    const sound_clips = options.select(".sound-clips");
    const canvas = options.select(".visualizer");
    const start = microtime(true);
    const close = recorder.select('.fa-window-close');
    if(close){
        close.onclick = () => {
            stop.trigger('click');
            const button_microphone = section.select('button[name="microphone"]');    
            button_microphone.trigger('click');
        }        
    }
    console.log(record);
    console.log(stop);
    if(!record){
        return;
    }
    if(!stop){
        return;
    }
    stop.disabled = true;
    console.log('yes');

    let audio_context;
    let data_array;
    let buffer_length;
    let analyser;
    let draw_time;
    let fps = 0;
    const canvas_context = canvas.getContext("2d");

// Main block for doing the audio recording
    if (navigator.mediaDevices.getUserMedia) {
        console.log("The mediaDevices.getUserMedia() method is supported.");

        const constraints = { audio: true };
        let chunks = [];

        let onSuccess = (stream) => {
            let media_recorder = new MediaRecorder(stream);

            visualize(stream);

            record.onclick = function () {                
                media_recorder.start();
                console.log(media_recorder.state);
                console.log("Recorder started.");
                record.style.background = "red";
                stop.disabled = false;
                record.disabled = true;
            };

            stop.onclick = function () {
                media_recorder.stop();
                console.log(media_recorder.state);
                console.log("Recorder stopped.");
                record.style.background = "";
                record.style.color = "";                
                stop.disabled = true;                
            };

            quit.onclick = function () {
                if (stream) {
                    stream.getTracks().forEach(
                        track => track.stop()
                    );
                    stream = null;
                }
                //close recorder or leave open ?
            }

            media_recorder.onstop = async function (event) {
                let start = microtime(true);
                console.log("Last data to read (after MediaRecorder.stop() called).");
                /*
                const clip_name = prompt(
                    "Enter a name for your sound clip?",
                    "My unnamed clip"
                );
                 */

                const clip_container = document.createElement("article");
                const clip_label = document.createElement("p");
                const audio = document.createElement("audio");
                const delete_button = document.createElement("button");

                clip_container.classList.add("clip");
                audio.setAttribute("controls", "");
                delete_button.textContent = "Delete";
                delete_button.className = "delete";

                const clip_name = "Transcribing...";
                clip_label.textContent = clip_name;
                clip_container.appendChild(audio);
                clip_container.appendChild(clip_label);
                clip_container.appendChild(delete_button);
                sound_clips.appendChild(clip_container);

                audio.controls = true;
                // const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                const blob = new Blob(chunks, {type: "audio/webm"});
                // const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                chunks = [];
                audio.src = window.URL.createObjectURL(blob);
                //const blob_16bit = wav_encode_16bit(chunks, 44100, 2);

                const arrayBuffer = await blob.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const blob_wav = wav_encode_16bit(audioBuffer);;
                const filename = uuid() + ".wav"; // Generate a unique filename
                const file_wav = new File([blob_wav], filename, { type: "audio/wav" });
                const data = new FormData();
                data.append("file", file_wav);                                
                data.append("directory", file.data.get('route.backend.target'));
                let url = file.data.get('route.backend.upload');
                const token = user.token();
                let messages;
                //speech to text engine and submit
                fetch((url), {
                    method: "POST",
                    body: data,
                    headers: {
                        "Authorization": 'Bearer ' + token
                    }
                })
                .then(response => response.text())
                .then(data => {
                    console.log("Success:", data);
                    header("Authorization", 'Bearer ' + token);
                    request(
                        file.data.get('route.backend.speech.to.text'), 
                        {
                            "url": file.data.get('route.backend.target') + filename,
                        }, (url, response) => {
                            if(response?.url && response?.name){
                                //let menu = select('section[name="application-desktop-navigation"] nav');
                                switch(response.name){
                                    case 'application-ollama-line-eraser':
                                        messages = file.data.get('messages.' + section_id);
                                        console.log(messages);
                                        console.log('##############################yes');
                                        alert('Ollama Line Eraser');
                                    break;
                                    case 'application-ollama-word-eraser':
                                        messages = file.data.get('messages.' + section_id);
                                        let index = messages.length - 1;
                                        while(index >= 0){
                                            let message = messages[index];
                                            if(message.role === 'user'){
                                                continue;
                                            } else {
                                                console.log(messages[index]);
                                                messages[index].content = messages[index].content.replace(/(\b\w+\b)/g, '');
                                                console.log(messages[index]);
                                                break;
                                            }
                                            index--;
                                        }
                                        file.data.set('messages.' + section_id, messages);
                                        let prompt = select('#' + section_id + ' [name="prompt"]');
                                        prompt.val('continue');
                                        clip_label.textContent = 'Erased last word...';
                                        let submit_button = select('#' + section_id + ' [name="submit"]');
                                        submit_button.trigger('click');
                                    break;
                                    case 'application-ollama-microphone-quit':
                                        quit.trigger('click');
                                    break;
                                    default:
                                        let menu_start = select('section[name="application-desktop-navigation"] .start');
                                        if(menu_start){
                                            menu_start.trigger('click');
                                        }
                                        let item = select('section[name="application-desktop-navigation"] a[data-url="' + response.url + '"]');
                                        if(item){
                                            item.trigger('click');
                                        }
                                    break;
                                }
                            } else if(
                                !is.empty(response) &&
                                response !== ' '
                            ){
                                let prompt = select('#' + section_id + ' [name="prompt"]');
                                console.log(response);
                                prompt.val(response);
                                clip_label.textContent = response;
                                let submit_button = select('#' + section_id + ' [name="submit"]');
                                submit_button.trigger('click');
                            }

                        }
                    );                    
                })
                .catch(error => {
                    console.error("Error:", error);
                });            
                /*
                blob_data(blob_wav)
                    .then(audio_data => {                        
                        let data = {
                            "directory": "/mnt/Vps3/Mount/Audio/Music/29-2025/",
                            "file": ,
                            "data": audio_data,
                            "type": "audio/wav;base64",
                        };
                        
                        let url = file.data.get('route.backend.upload');
                        const token = user.token();
                        header("Authorization", 'Bearer ' + token);
                        request(url, data, (url, response) => {
                            console.log(response);
                        });
                        //console.log(audio_data); // 👈 This is the Base64-encoded string
                        console.log(url);
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error converting blob to data:', error);
                    });
                    */
                //voice to txt
                
/*
                let transcriber = await pipeline(
                    'automatic-speech-recognition',
                    'Xenova/whisper-small.en',
                    {
                        quantized: true
                    }
                );
*/
                /*
                  const output = await transcriber(blob, {
                              language: 'en',
                              task: "transcribe",
                              chunk_length_s: 30,
                              stride_length_s: 5,
                              callback_function: callback_function, // after each generation step
                              chunk_callback: chunk_callback, // after each chunk is processed
                          });
                 */
/*
                let {text} = await transcriber(audio.src);
                console.log(text);
                let duration = (microtime(true) - start) * 1000;
                clip_label.textContent = text;
                console.log(duration + ' msec');
                console.log("recorder stopped");
                let prompt = select('#' + section_id + ' [name="prompt"]');
                prompt.val(text);
                let microphone_button = select('#' + section_id + ' [name="microphone"]');
                //microphone_button.data('is-active', true);
                //microphone_button.trigger('click');
                */
                // let submit_button = select('#' + section_id + ' [name="submit"]');
                // submit_button.trigger('click');
                delete_button.onclick = (event) => {
                    event.target.closest(".clip").remove();
                };
                clip_label.onclick = () => {
                    const existing_name = clip_label.textContent;
                    const new_clip_name = prompt("Enter a new name for your sound clip?");
                    if (is.empty(new_clip_name)) {
                        clip_label.textContent = existing_name;
                    } else {
                        clip_label.textContent = new_clip_name;
                    }
                };
            };
            
            media_recorder.ondataavailable = (event)=>  {
                //maybe add chunk nr or create some
                chunks.push(event.data);
            };
        };

        let onError = (error) => {
            console.log("The following error occured: " + error);
        };
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
        console.log("MediaDevices.getUserMedia() not supported on your browser!");
    }

    const blob_data = (blob) => {         
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const visualize = (stream) => {
        if (is.empty(audio_context)) {
            audio_context = new AudioContext();
        }

        const source = audio_context.createMediaStreamSource(stream);

        analyser = audio_context.createAnalyser();
        analyser.fftSize = 2048;
        buffer_length = analyser.frequencyBinCount;
        data_array = new Uint8Array(buffer_length);
        source.connect(analyser);
        file.data.microphone = {
            "draw": 0
        }
        draw();
    }

    const wav_encode_16bit = (buffer) => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length * numChannels;
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;

        const interleaved = new Float32Array(length);
        let offset = 0;

        // Interleave channels
        for (let i = 0; i < buffer.length; i++) {
            for (let c = 0; c < numChannels; c++) {
                interleaved[offset++] = buffer.getChannelData(c)[i];
            }
        }
        const bufferSize = 44 + length * bytesPerSample;
        const view = new DataView(new ArrayBuffer(bufferSize));
        offset = 0;
        function writeString(s) { 
            for (let i = 0; i < s.length; i++){
                view.setUint8(offset++, s.charCodeAt(i));
            }  
        }
        function writeUint32(v) { 
            view.setUint32(offset, v, true); 
            offset += 4; 
        }
        function writeUint16(v) { 
            view.setUint16(offset, v, true); 
            offset += 2; 
        }
        writeString('RIFF');
        writeUint32(36 + length * bytesPerSample);
        writeString('WAVE');
        writeString('fmt ');
        writeUint32(16);
        writeUint16(1); // PCM
        writeUint16(numChannels);
        writeUint32(sampleRate);
        writeUint32(sampleRate * blockAlign);
        writeUint16(blockAlign);
        writeUint16(16);
        writeString('data');
        writeUint32(length * bytesPerSample);
        for (let i = 0; i < interleaved.length; i++) {
            let s = Math.max(-1, Math.min(1, interleaved[i]));
            view.setInt16(offset, s * 0x7FFF, true);
            offset += 2;
        }
        return new Blob([view], { type: 'audio/wav' });
    }

    const draw = () => {
        const width = canvas.width;
        const height = canvas.height;
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(data_array);
        canvas_context.fillStyle = "rgba(255, 255, 255, 0.1)";
        // canvas_context.fillStyle = "rgba(75, 150, 245, 0.1)";
        canvas_context.fillRect(0, 0, width, height);
        canvas_context.lineWidth = 1;
        canvas_context.strokeStyle = "rgba(75, 150, 245, 0.7)";
        // canvas_context.strokeStyle = "rgba(255, 255, 255, 0.7)";
        canvas_context.beginPath();
        let slice_width = (width * 1.0) / buffer_length;
        let x = 0;
        let y_max = 0;
        for (let i = 0; i < buffer_length; i++) {
            let v = data_array[i] / 128.0;
            let y = (v * height) / 2;
            if(y > y_max){
                y_max = y;
            }
            if (i === 0) {
                canvas_context.moveTo(x, y);
            } else {
                canvas_context.lineTo(x, y);
            }
            x += slice_width;
        }
        canvas_context.lineTo(canvas.width, canvas.height / 2);
        canvas_context.stroke();
        file.data.microphone.draw++;

        if(is.empty(draw_time)){
            draw_time = microtime(true);
        }
        if(microtime(true) - draw_time > 1){
            draw_time = microtime(true);
            fps = file.data.microphone.draw;
            file.data.microphone.draw = 0;
        }
        canvas_context.font = "10px Source Sans Pro";
        canvas_context.fillStyle = "rgba(75, 150, 245, 0.7)";
        canvas_context.fillText("FPS: " + fps,280,110);
        let is_recording = record.data('record') ?? null;
        //microphone auto recording
        if(y_max > 62 && !is_recording){
            record.trigger('click');
            record.data('record', true);
            record.data('delete', 'timer');
        }
        if(y_max < 62 && is_recording){            
            if(!record.data('has', 'timer')){
                record.data('timer', microtime(true));
            } else {
                let current = microtime(true);
                if((current - record.data('timer')) >= 2.5){
                    stop.trigger('click');
                    record.data('delete', 'timer');
                    record.data('delete', 'record');
                } 
            }            
        }
        console.log(y_max);
    }

    window.onresize = function () {
        canvas.width = options.offsetWidth;
    };
    window.onresize();
}

export { microphone }