{{RAX}}
{{require(config('controller.dir.view') + config('controller.title') + '/Init.tpl')}}
{{$request.method = 'replace'}}
{{$request.target = html.target.create('section', ['id' => $id])}}
{{$request.target += ' .address-bar'}}
{{block.html()}}
<div class="left">
</div>
<div class="middle">
    <textarea name="input" class="ollama-manager-input">
    </textarea>
    <button type="button" class="button-submit"><i class="fas fa-chevron-up"></i></button>
</div>
{{/block}