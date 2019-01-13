Vue.component('form-list', {
    template: `
        <div>
            <!-- List Form -->
            <div class="form-group">
                <label for="listName" class="col-form-label">
                    Name:
                </label>
                <input
                    id="listName"
                    type="text"
                    required="true"
                    class="form-control col-sm"
                    placeholder="List name"
                    v-model="list.name" />
            </div>

            <div class="form-group">
                <label for="listDescription" class="col-form-label">
                    Description:
                </label>
                <textarea
                    id="listDescription"
                    required="true"
                    class="form-control col-sm"
                    placeholder="List description"
                    rows="3"
                    v-model="list.description" />
            </div>

            <!-- Button Menu -->
            <button type="button" class="btn btn-success" v-on:click="saveList(list.id)">
                Save
            </button>

            <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#attributeModal">
                Add Attribute
            </button>

            <button type="button" class="btn btn-danger" v-on:click="deleteList(list.id)">
                Delete
            </button>

            <button type="button" class="btn btn-outline-secondary" v-on:click="goToHome()">
                Close
            </button>

            <!-- Attributes List -->
            <h1 class="mt-5">Attributes</h1>

            <table class="table table-striped table-dark table-hover table-borderless">
                <thead>
                    <tr>
                        <th scope="col">
                            Name
                        </th>
                        <th scope="col">
                            Mandatory
                        </th>
                        <th scope="col">
                            Unique
                        </th>
                        <th scope="col">
                            Linked List
                        </th>
                        <th scope="col">
                            Data Type
                        </th>
                        <th scope="col">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="attribute in attributes">
                        <td>
                            {{ attribute.name }}
                        </td>
                        <td>
                            {{ attribute.flagMandatory }}
                        </td>
                        <td>
                            {{ attribute.flagUnique }}
                        </td>
                        <td>
                            {{ attribute.linkedListId }}
                        </td>
                        <td>
                            {{ attribute.sysDataTypeByDataTypeId.name }}
                        </td>
                        <td>
                            <a href="#" class="badge badge-secondary" v-on:click="showModal(attribute.id)">
                                Edit Attribute
                            </a>

                            <!-- Update Attribute Modal -->
                            <div class="modal fade" v-bind:id="attribute.id" tabindex="-1" role="dialog" aria-labelledby="attributeModalTitle" aria-hidden="true">
                                <form-attribute v-bind:listId="list.id" v-bind:attribute="attribute">
                                </form-attribute>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- New  Attribute Modal -->
            <div class="modal fade" id="attributeModal" tabindex="-1" role="dialog" aria-labelledby="attributeModalTitle" aria-hidden="true">
                <form-attribute v-bind:listId="list.id" v-bind:attribute="{}">
                </form-attribute>
            </div>
        </div>
    `,
    data: function () {
        return {
            'list': {},
            'attributes': [],
            'queryGetList': `query getList($id: Int!) {
                sysListById(id: $id) {
                    id
                    name
                    description
                    sysAttributesByListId {
                        nodes {
                            id
                            name
                            description
                            flagMandatory
                            flagUnique
                            linkedListId
                            sysDataTypeByDataTypeId {
                                name
                              }
                            defaultValue
                        }
                    }
                }
            }`,
            'mutationCreateList': `mutation createList($sysList: SysListInput!) {
                createSysList(input: {sysList: $sysList}) {
                    sysList {
                        id
                        name
                        description
                    }
                }
            }`,
            'mutationUpdateList': `mutation updateList($id: Int!, $sysListPatch: SysListPatch!) {
                updateSysListById(input: {id: $id, sysListPatch: $sysListPatch }) {
                    sysList {
                        id
                        name
                        description
                    }
                }
            }`,
            'mutationDeleteList': `mutation deleteList($id: Int!) {
                deleteSysListById(input: {id: $id}){
                    sysList {
                        id
                    }
                }
            }`
        }
    },
    mounted: function () {
        // Get list Id from URL parameters
        var urlParams = new URLSearchParams(window.location.search);
        var listId = parseInt(urlParams.get('listId'));
        if (!isNaN(listId)) {
            this.getList(listId);
        }
      },
    methods: {
        getList(listId) {
            // Method to get a list
            payload = {
                'query': this.queryGetList,
                'variables': { 'id': listId }
            };
            this.$http.post(Vue.prototype.$graphqlUrl, payload).then (
                function(response){
                    if(response.status == "200"){
                        this.list = response.data.data.sysListById;
                        this.attributes = this.list.sysAttributesByListId.nodes;
                    }
                }
            );
        },
        saveList(listId) {
            // Method to create or update a list
            // Verify if listId is provided
            if (isNaN(listId)) {
                // Create a new list
                payload = {
                    'query': this.mutationCreateList,
                    'variables': {
                        'sysList': {
                            'name': this.list.name,
                            'description': this.list.description
                        }
                    }
                };
                this.$http.post(Vue.prototype.$graphqlUrl, payload).then (
                    function(response){
                        if(response.status == "200"){
                            if(response.data.errors){
                                    $('#alert').append(`
                                        <div class="alert alert-danger alert-dismissable text-danger">
                                            Error: ` + response.data.errors[0].message + `
                                            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">
                                                &times;
                                            </button>
                                        </div>`
                                    );
                                  
                            } else {
                                this.list = response.data.data.createSysList.sysList;
                                window.location.href = 'edit-list.html?listId=' + this.list.id;
                            }
                        }
                    }
                );
            }
            else {
                // Update an existing list
                payload = {
                    'query': this.mutationUpdateList,
                    'variables': { 
                        'id': this.list.id,
                        'sysListPatch': {
                            "name": this.list.name,
                            "description": this.list.description,
                        }
                    }
                };
                this.$http.post(Vue.prototype.$graphqlUrl, payload).then (
                    function(response){
                        if(response.status == "200"){
                            if(response.data.errors){
                                    $('#alert').append(`
                                        <div class="alert alert-danger alert-dismissable text-danger">
                                            Error: ` + response.data.errors[0].message + `
                                            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">
                                                &times;
                                            </button>
                                        </div>`
                                    );
                                  
                            } else {
                                this.list = response.data.data.updateSysListById.sysList;
                            }
                        }
                    }
                );
            }
        },
        deleteList(listId) {
            // Method to delete a list
            payload = {
                'query': this.mutationDeleteList,
                'variables': {
                    'id': listId
                }
            };
            this.$http.post(Vue.prototype.$graphqlUrl, payload).then (
                function(response){
                    if(response.status == "200"){
                        if(response.data.errors){
                                $('#alert').append(`
                                    <div class="alert alert-danger alert-dismissable text-danger">
                                        Error: ` + response.data.errors[0].message + `
                                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">
                                            &times;
                                        </button>
                                    </div>`
                                );
                              
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                }
            );
        },
        showModal(modalId) {
            $('#' + modalId).modal('show');
        },
        goToHome() {
            window.location.href = 'index.html';
        }
    }
});
