<?php
namespace Package\Raxon\Ollama\Gui\Trait;

use Exception;
use Package\Raxon\Basic\Trait\Install;
use Package\Raxon\Desktop\Module\Navigation;
use Raxon\Config;
use Raxon\Exception\DirectoryCreateException;
use Raxon\Exception\ObjectException;
use Raxon\Module\Core;

trait Setup {
    const NAME = 'Ollama/Gui';

    use Install;
    /**
     * @throws DirectoryCreateException
     * @throws Exception
     */
    public function install($flags, $options): void
    {
        $object = $this->object();
        if($object->config(Config::POSIX_ID) !== 0){
            return;
        }
        $application_list = $this->install_system_application(
            $flags,
            $options,
        );
        foreach($application_list as $application){
            $this->install_api($options, $application);
            $this->install_application($options, $application);
            Navigation::create(
                $object,
                $options,
                $application
            );
        }
        $command = 'app install raxon/account -patch';
        Core::execute($object, $command, $output, $notification);
        if($output){
            echo $output;
        }
        if($notification){
            echo $notification;
        }
        //move user list to account and navigation to desktop ?

    }

    /**
     * @throws ObjectException
     * @throws Exception
     */
    /*
    public function navigation_create($list): void
    {
        $object = $this->object();
        if(array_key_exists('nodeList', $list)){
            foreach($list['nodeList'] as $nr => $user){
                if(array_key_exists('uuid', $user)){
                    $node = new Node($object);
                    $class = 'Application.Desktop.Navigation';
                    $role = $node->role_system();
                    $response = $node->record(
                        $class,
                        $role,
                        [
                            'where' => [
                                [
                                    'attribute' => 'name',
                                    'operator' => '===',
                                    'value' => self::NAME,
                                ],
                                'and',
                                [
                                    'attribute' => 'user',
                                    'operator' => '===',
                                    'value' => $user['uuid'],
                                ]
                            ],
                            'relation' => false
                        ]
                    );
                    if($response === null){
                        $record = [
                            "name" => self::NAME,
                            "user" => $user['uuid'],
                            "route" => (object) [
                                'name' => self::ROUTE_NAME,
                                'get' => '{{route.name($this.name)}}'
                            ],
                            "url" => '{{route.get($this.route.get)}}',
                            "svg" => '/Application/' . self::NAME . '/Icon/Icon.png',
                            "icon" => '/Application/' . self::NAME . '/Icon/Icon.png'
                        ];
                        $response = $node->create($class, $role, $record);
                    }
                }
            }
        }
    }
    */

    /**
     * @throws ObjectException
     * @throws Exception
     */
    /*
    public function user_list($role=''): array
    {
        $object = $this->object();
        $list = [];
        switch($role){
            case 'ROLE_ADMIN':
                $node = new Node($object);
                $class = 'Account.Role';
                $role = $node->role_system();
                $response = $node->record($class, $role, [
                    'filter' => [
                        'name' => 'ROLE_ADMIN'
                    ]
                ]);
                if(
                    array_key_exists('node', $response) &&
                    is_object($response['node'])
                ){
                    $table = 'user';
                    $options = (object) [];
                    $options->relation = true;
                    $config = Database::config($object);
                    $connection = $object->config('doctrine.environment.system.*');
                    $em = Database::entity_manager($object, $config, $connection);
                    $entity = str_replace('.', '', Controller::name($table));
                    $object->request('entity', $entity);
                    $object->request('where', [
                        [
                            'attribute' => 'role',
                            'operator' => '===',
                            'value' => 'JSON_CONTAINS("' . $entity  .'.role", "' .$response['node']->uuid.'") = 1'
                        ]
                    ]);
                    $list = Entity::list($object, $em, $node->role_system(), $options);
                }
                break;
        }
        return $list;
    }
    */

}