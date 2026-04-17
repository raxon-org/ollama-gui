{{$register = Package.Raxon.OllamaGui:Init:register()}}
{{if(!is.empty($register))}}
{{Package.Raxon.OllamaGui:Import:role.system()}}
{{$flags = flags()}}
{{$options = options()}}
{{Package.Raxon.OllamaGui:Main:install($flags, $options)}}
{{/if}}