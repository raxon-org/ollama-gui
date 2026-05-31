{{RAX}}
{{block.html()}}
<section id="{{$id}}" name="{{$section.name}}" class="display-none">
    <div class="dialog dialog-{{config('controller.name')}}-main">
        <div class="head" data-title="{{__('ollama.manager.title')}} | {{$request.file|>default:''}}">
            <h1><img src="{{route.get($section.name + '-icon')}}" class="icon" /> {{__('ollama.manager.title')}}</h1>
            <span class="close"><i class="fas fa-window-close"></i></span>
            <span class="minimize"><i class="far fa-window-minimize"></i></span>
        </div>
        <div class="menu">
            <ul>
                <li class="file">{{__('ollama.manager.file')}}</li>
            </ul>
            <div class="menu-file-protector display-none">
            </div>
            <div class="menu-file display-none">
                <ul>
                    /*
                    <li>New</li>
                    <li>Open</li>
                    <li class="menu-file-save">Save</li>
                    <li>Save as</li>
                    <li>Print</li>
                    */
                    <li class="menu-file-exit">{{__('ollama.manager.exit')}}</li>
                </ul>
            </div>
        </div>
        <div class="body">
            <div class="history">
            </div>
            <div class="content">
                <p class="loading">
                    <i class="fas fa-spinner fa-spin"></i><br>
                    <span>{{__('ollama.manager.loading')}}</span>
                </p>
            </div>
            <div class="input">
                <textarea name="prompt"></textarea>
                <button type="button" name="submit" title="{{__('ollama.manager.submit')}}"><i class="fas fa-chevron-right"></i></button>
                <button type="button" name="abort" title="{{__('ollama.manager.abort')}}"><i class="fas fa-poop"></i></button>
                <button type="button" name="clear-queue" title="{{__('ollama.manager.clear.queue')}}"><i class="fas fa-trash"></i></button>
                <button type="button" name="microphone" title="{{__('ollama.manager.microphone')}}"><i class="fas fa-microphone"></i></button>
                <button type="button" name="clear" title="{{__('ollama.manager.clear')}}"><i class="fas fa-broom"></i></button>
                <select name="model">
                    <option value="codellama:70b">Codellama:70b (38 GB)</option>
                    <option value="gemma3:4b">Gemma3:4b (3.3 GB)</option>
                    <option value="gemma2:27b">Gemma2:27b (16 GB)</option>
                    <option value="qwen3:0.6b">Qwen3:0.6b (523 MB)</option>
                    <option value="qwen3:1.7b">Qwen3:1.7b (1.4 GB)</option>
                    <option value="qwen3:4b">Qwen3:4b (2.6 GB)</option>
                    <option value="qwen3:30b-a3b">Qwen3:30b-a3b (18 GB)</option>                    
                    <option value="qwen3:32b">Qwen3:32b (20 GB)</option>
                    <option value="qwen3-vl:8b">Qwen3-vl:8b (6.1 GB)</option>
                    <option value="qwen3-embedding">Qwen3-embedding:8b (4.7 GB)</option>
                    <option value="qwen3-coder-next">Qwen3-coder-next:?b (51 GB)</option>
                    <option value="gpt-oss:20b">Gpt-oss:20b (14 GB)</option>
                    <option value="gemma4:e4b">Gemma4:e4b (9.6 GB)</option>
                    <option value="gemma4:31b">Gemma4:31b (19 GB)</option>
                    <option value="llama3.1" selected="selected">Llama3.1 (4.7 GB)</option>
                    <option value="llama3.1:70b">Llama3.1:70b (40 GB)</option>
                    <option value="llama3.2-vision:90b">llama3.2-vision (90b) (55 GB)</option>
                    <option value="llama3.3">llama3.3 (70b) (42 GB)</option>
                    <option value="llama4">llama4 (109b) (67 GB)</option>
                    <option value="mixtral:8x7b">Mixtral:8x7b (26 GB)</option>
                    <option value="phi3:14b">Phi3:14b (8 GB)</option>
                    <option value="rnj-1">Rnj-1 (5.1 GB)</option>
                    <option value="deepseek-r1:8b">Deepseek-r1:8b (5.2 GB)</option>
                    <option value="qwen2.5:72b">Qwen2.5:72b (47 GB)</option>
                </select>
                <button type="button" name="options" title="{{__('ollama.manager.options')}}"><i class="fas fa-paw"></i></button>                
            </div>
            <div class="recorder display-none">
                <i class="fas fa-window-close"></i><br />                
            </div>
            <div class="options display-none">
                <i class="fas fa-window-close"></i><br />
                <label>Endpoint</label>
                <select name="endpoint">
                    <option value="http://localhost:11434/api/chat" selected="selected">http://localhost:11434/api/chat</option>
                    <option value="http://localhost:11434/api/embed">http://localhost:11434/api/embed</option>
                    <option value="http://localhost:11434/api/generate">http://localhost:11434/api/generate</option>

                </select>
                <label>Temperature</label><br />
                <input type="range" min="0.1" max="3.0" step="0.01" value="0.8" name="temperature"><span class="temperature-text"></span><br />
                <label>Context size</label><br />
                <select name="context-size">
                    <option value="2048" selected="selected">2048</option>
                    <option value="4096">4096</option>
                    <option value="8192">8192</option>
                    <option value="16384">16384</option>
                    <option value="32768">32768</option>
                    <option value="65536">65536</option>
                    <option value="131072">131072</option>
                </select><span class="context-size-text"></span><br />
                <label>Seed</label><br />
                <input type="number" min="0" max="9999999999" step="1" value="0" name="seed"><span class="seed-text"></span><br />
                <label>Think</label><br />
                <input type="checkbox" name="think" value="true"><br />
            </div>
        </div>
        <div class="footer">
            <span class="size"></span>
            <span class="speed-size"></span>
            <span class="amount"></span>
            <span class="speed-amount"></span>
            <span class="duration"></span>
            <span class="queue"></span>
            <span class="sse-memory"></span>
        </div>
    </div>
</section>
{{/block}}