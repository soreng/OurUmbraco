(function () {
    angular.module('umbraco.resources', []);
    /**
 * @ngdoc service
 * @name umbraco.resources.authResource
 * @description
 * This Resource perfomrs actions to common authentication tasks for the Umbraco backoffice user
 *
 * @requires $q 
 * @requires $http
 * @requires umbRequestHelper
 * @requires angularHelper
 */
    function authResource($q, $http, umbRequestHelper, angularHelper) {
        return {
            get2FAProviders: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'Get2FAProviders')), 'Could not retrive two factor provider info');
            },
            send2FACode: function (provider) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostSend2FACode'), angular.toJson(provider)), 'Could not send code');
            },
            verify2FACode: function (provider, code) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostVerify2FACode'), {
                    code: code,
                    provider: provider
                }), 'Could not verify code');
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#performLogin
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Logs the Umbraco backoffice user in if the credentials are good
     *
     * ##usage
     * <pre>
     * authResource.performLogin(login, password)
     *    .then(function(data) {
     *        //Do stuff for login...
     *    });
     * </pre> 
     * @param {string} login Username of backoffice user
     * @param {string} password Password of backoffice user
     * @returns {Promise} resourcePromise object
     *
     */
            performLogin: function (username, password) {
                if (!username || !password) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Username or password cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostLogin'), {
                    username: username,
                    password: password
                }), 'Login failed for user ' + username);
            },
            /**
     * There are not parameters for this since when the user has clicked on their invite email they will be partially
     * logged in (but they will not be approved) so we need to use this method to verify the non approved logged in user's details.
     * Using the getCurrentUser will not work since that only works for approved users
     * @returns {} 
     */
            getCurrentInvitedUser: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'GetCurrentInvitedUser')), 'Failed to verify invite');
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#performRequestPasswordReset
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Checks to see if the provided email address is a valid user account and sends a link
     * to allow them to reset their password
     *
     * ##usage
     * <pre>
     * authResource.performRequestPasswordReset(email)
     *    .then(function(data) {
     *        //Do stuff for password reset request...
     *    });
     * </pre> 
     * @param {string} email Email address of backoffice user
     * @returns {Promise} resourcePromise object
     *
     */
            performRequestPasswordReset: function (email) {
                if (!email) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Email address cannot be empty' });
                }
                //TODO: This validation shouldn't really be done here, the validation on the login dialog
                // is pretty hacky which is why this is here, ideally validation on the login dialog would
                // be done properly.
                var emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(email)) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Email address is not valid' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostRequestPasswordReset'), { email: email }), 'Request password reset failed for email ' + email);
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#performValidatePasswordResetCode
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Checks to see if the provided password reset code is valid
     *
     * ##usage
     * <pre>
     * authResource.performValidatePasswordResetCode(resetCode)
     *    .then(function(data) {
     *        //Allow reset of password
     *    });
     * </pre> 
     * @param {integer} userId User Id
     * @param {string} resetCode Password reset code
     * @returns {Promise} resourcePromise object
     *
     */
            performValidatePasswordResetCode: function (userId, resetCode) {
                if (!userId) {
                    return angularHelper.rejectedPromise({ errorMsg: 'User Id cannot be empty' });
                }
                if (!resetCode) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Reset code cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostValidatePasswordResetCode'), {
                    userId: userId,
                    resetCode: resetCode
                }), 'Password reset code validation failed for userId ' + userId + ', code' + resetCode);
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.currentUserResource#getMembershipProviderConfig
     * @methodOf umbraco.resources.currentUserResource
     *
     * @description
     * Gets the configuration of the user membership provider which is used to configure the change password form         
     */
            getMembershipProviderConfig: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'GetMembershipProviderConfig')), 'Failed to retrieve membership provider config');
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#performSetPassword
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Checks to see if the provided password reset code is valid and sets the user's password
     *
     * ##usage
     * <pre>
     * authResource.performSetPassword(userId, password, confirmPassword, resetCode)
     *    .then(function(data) {
     *        //Password set
     *    });
     * </pre> 
     * @param {integer} userId User Id
     * @param {string} password New password
     * @param {string} confirmPassword Confirmation of new password
     * @param {string} resetCode Password reset code
     * @returns {Promise} resourcePromise object
     *
     */
            performSetPassword: function (userId, password, confirmPassword, resetCode) {
                if (userId === undefined || userId === null) {
                    return angularHelper.rejectedPromise({ errorMsg: 'User Id cannot be empty' });
                }
                if (!password) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Password cannot be empty' });
                }
                if (password !== confirmPassword) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Password and confirmation do not match' });
                }
                if (!resetCode) {
                    return angularHelper.rejectedPromise({ errorMsg: 'Reset code cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostSetPassword'), {
                    userId: userId,
                    password: password,
                    resetCode: resetCode
                }), 'Password reset code validation failed for userId ' + userId);
            },
            unlinkLogin: function (loginProvider, providerKey) {
                if (!loginProvider || !providerKey) {
                    return angularHelper.rejectedPromise({ errorMsg: 'loginProvider or providerKey cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostUnLinkLogin'), {
                    loginProvider: loginProvider,
                    providerKey: providerKey
                }), 'Unlinking login provider failed');
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#performLogout
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Logs out the Umbraco backoffice user
     *
     * ##usage
     * <pre>
     * authResource.performLogout()
     *    .then(function(data) {
     *        //Do stuff for logging out...
     *    });
     * </pre>
     * @returns {Promise} resourcePromise object
     *
     */
            performLogout: function () {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'PostLogout')));
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#getCurrentUser
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Sends a request to the server to get the current user details, will return a 401 if the user is not logged in
     *
     * ##usage
     * <pre>
     * authResource.getCurrentUser()
     *    .then(function(data) {
     *        //Do stuff for fetching the current logged in Umbraco backoffice user
     *    });
     * </pre>
     * @returns {Promise} resourcePromise object
     *
     */
            getCurrentUser: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'GetCurrentUser')), 'Server call failed for getting current user');
            },
            getCurrentUserLinkedLogins: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'GetCurrentUserLinkedLogins')), 'Server call failed for getting current users linked logins');
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#isAuthenticated
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Checks if the user is logged in or not - does not return 401 or 403
     *
     * ##usage
     * <pre>
     * authResource.isAuthenticated()
     *    .then(function(data) {
     *        //Do stuff to check if user is authenticated
     *    });
     * </pre>
     * @returns {Promise} resourcePromise object
     *
     */
            isAuthenticated: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'IsAuthenticated')), {
                    success: function (data, status, headers, config) {
                        //if the response is false, they are not logged in so return a rejection
                        if (data === false || data === 'false') {
                            return $q.reject('User is not logged in');
                        }
                        return data;
                    },
                    error: function (data, status, headers, config) {
                        return {
                            errorMsg: 'Server call failed for checking authentication',
                            data: data,
                            status: status
                        };
                    }
                });
            },
            /**
     * @ngdoc method
     * @name umbraco.resources.authResource#getRemainingTimeoutSeconds
     * @methodOf umbraco.resources.authResource
     *
     * @description
     * Gets the user's remaining seconds before their login times out
     *
     * ##usage
     * <pre>
     * authResource.getRemainingTimeoutSeconds()
     *    .then(function(data) {
     *        //Number of seconds is returned
     *    });
     * </pre>
     * @returns {Promise} resourcePromise object
     *
     */
            getRemainingTimeoutSeconds: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('authenticationApiBaseUrl', 'GetRemainingTimeoutSeconds')), 'Server call failed for checking remaining seconds');
            }
        };
    }
    angular.module('umbraco.resources').factory('authResource', authResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.codefileResource
    * @description Loads in data for files that contain code such as js scripts, partial views and partial view macros
    **/
    function codefileResource($q, $http, umbDataFormatter, umbRequestHelper, localizationService) {
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#getByPath
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Gets a codefile item with a given path
         *
         * ##usage
         * <pre>
         * codefileResource.getByPath('scripts', 'oooh-la-la.js')
         *    .then(function(codefile) {
         *        alert('its here!');
         *    });
         * </pre>
         * 
         * <pre>
         * codefileResource.getByPath('partialView', 'Grid%2fEditors%2fBase.cshtml')
         *    .then(function(codefile) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {type} the type of script (partialView, partialViewMacro, script)
         * @param {virtualpath} the virtual path of the script
         * @returns {Promise} resourcePromise object.
         *
         */
            getByPath: function (type, virtualpath) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'GetByPath', [
                    { type: type },
                    { virtualPath: virtualpath }
                ])), 'Failed to retrieve data for ' + type + ' from virtual path ' + virtualpath);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#getByAlias
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Gets a template item with a given alias
         *
         * ##usage
         * <pre>
         * codefileResource.getByAlias("upload")
         *    .then(function(template) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {String} alias Alias of template to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
            getByAlias: function (alias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'GetByAlias', [{ alias: alias }])), 'Failed to retrieve data for template with alias: ' + alias);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#deleteByPath
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Deletes a codefile with a given type & path
         *
         * ##usage
         * <pre>
         * codefileResource.deleteByPath('scripts', 'oooh-la-la.js')
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         * 
         * <pre>
         * codefileResource.deleteByPath('partialViews', 'Grid%2fEditors%2fBase.cshtml')
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {type} the type of script (partialViews, partialViewMacros, scripts)
         * @param {virtualpath} the virtual path of the script
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteByPath: function (type, virtualpath) {
                var promise = localizationService.localize('codefile_deleteItemFailed', [virtualpath]);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'Delete', [
                    { type: type },
                    { virtualPath: virtualpath }
                ])), promise);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#save
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Saves or update a codeFile
         * 
         * ##usage
         * <pre>
         * codefileResource.save(codeFile)
         *    .then(function(codeFile) {
         *        alert('its saved!');
         *    });
         * </pre>
         *
         * @param {Object} template object to save
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (codeFile) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'PostSave'), codeFile), 'Failed to save data for code file ' + codeFile.virtualPath);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#getSnippets
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Gets code snippets for a given file type
         * 
         * ##usage
         * <pre>
         * codefileResource.getSnippets("partialViews")
         *    .then(function(snippets) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {string} file type: (partialViews, partialViewMacros)
         * @returns {Promise} resourcePromise object.
         *
         */
            getSnippets: function (fileType) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'GetSnippets?type=' + fileType)), 'Failed to get snippet for' + fileType);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#getScaffold
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Returns a scaffold of an empty codefile item.
         * 
         * The scaffold is used to build editors for code file editors that has not yet been populated with data.
         * 
         * ##usage
         * <pre>
         * codefileResource.getScaffold("partialViews", "Breadcrumb")
         *    .then(function(data) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {string} File type: (scripts, partialViews, partialViewMacros).
         * @param {string} Snippet name (Ex. Breadcrumb).
         * @returns {Promise} resourcePromise object.
         *
         */
            getScaffold: function (type, id, snippetName) {
                var queryString = '?type=' + type + '&id=' + id;
                if (snippetName) {
                    queryString += '&snippetName=' + snippetName;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'GetScaffold' + queryString)), 'Failed to get scaffold for' + type);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.codefileResource#createContainer
         * @methodOf umbraco.resources.codefileResource
         *
         * @description
         * Creates a container/folder
         * 
         * ##usage
         * <pre>
         * codefileResource.createContainer("partialViews", "folder%2ffolder", "folder")
         *    .then(function(data) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {string} File type: (scripts, partialViews, partialViewMacros).
         * @param {string} Parent Id: url encoded path
         * @param {string} Container name
         * @returns {Promise} resourcePromise object.
         *
         */
            createContainer: function (type, parentId, name) {
                // Is the parent ID numeric?
                var key = 'codefile_createFolderFailedBy' + (isNaN(parseInt(parentId)) ? 'Name' : 'Id');
                var promise = localizationService.localize(key, [parentId]);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('codeFileApiBaseUrl', 'PostCreateContainer', {
                    type: type,
                    parentId: parentId,
                    name: encodeURIComponent(name)
                })), promise);
            }
        };
    }
    angular.module('umbraco.resources').factory('codefileResource', codefileResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.contentResource
 * @description Handles all transactions of content data
 * from the angular application to the Umbraco database, using the Content WebApi controller
 *
 * all methods returns a resource promise async, so all operations won't complete untill .then() is completed.
 *
 * @requires $q
 * @requires $http
 * @requires umbDataFormatter
 * @requires umbRequestHelper
 *
 * ##usage
 * To use, simply inject the contentResource into any controller or service that needs it, and make
 * sure the umbraco.resources module is accesible - which it should be by default.
 *
 * <pre>
 *    contentResource.getById(1234)
 *          .then(function(data) {
 *              $scope.content = data;
 *          });
 * </pre>
 **/
    function contentResource($q, $http, umbDataFormatter, umbRequestHelper) {
        /** internal method process the saving of data and post processing the result */
        function saveContentItem(content, action, files, restApiUrl) {
            return umbRequestHelper.postSaveContent({
                restApiUrl: restApiUrl,
                content: content,
                action: action,
                files: files,
                dataFormatter: function (c, a) {
                    return umbDataFormatter.formatContentPostData(c, a);
                }
            });
        }
        return {
            savePermissions: function (saveModel) {
                if (!saveModel) {
                    throw 'saveModel cannot be null';
                }
                if (!saveModel.contentId) {
                    throw 'saveModel.contentId cannot be null';
                }
                if (!saveModel.permissions) {
                    throw 'saveModel.permissions cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSaveUserGroupPermissions'), saveModel), 'Failed to save permissions');
            },
            getRecycleBin: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetRecycleBin')), 'Failed to retrieve data for content recycle bin');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#sort
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Sorts all children below a given parent node id, based on a collection of node-ids
         *
         * ##usage
         * <pre>
         * var ids = [123,34533,2334,23434];
         * contentResource.sort({ parentId: 1244, sortedIds: ids })
         *    .then(function() {
         *        $scope.complete = true;
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.parentId the ID of the parent node
         * @param {Array} options.sortedIds array of node IDs as they should be sorted
         * @returns {Promise} resourcePromise object.
         *
         */
            sort: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.sortedIds) {
                    throw 'args.sortedIds cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSort'), {
                    parentId: args.parentId,
                    idSortOrder: args.sortedIds
                }), 'Failed to sort content');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#move
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * contentResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message);
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
            move: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostMove'), {
                    parentId: args.parentId,
                    id: args.id
                }), 'Failed to move content');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#copy
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Copies a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * contentResource.copy({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was copied");
         *    }, function(err){
         *      alert("node wasnt copy:" + err.data.Message);
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.id the ID of the node to copy
         * @param {Int} args.parentId the ID of the parent node to copy to
         * @param {Boolean} args.relateToOriginal if true, relates the copy to the original through the relation api
         * @returns {Promise} resourcePromise object.
         *
         */
            copy: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostCopy'), args), 'Failed to copy content');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#unPublish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Unpublishes a content item with a given Id
         *
         * ##usage
         * <pre>
         * contentResource.unPublish(1234)
         *    .then(function() {
         *        alert("node was unpulished");
         *    }, function(err){
         *      alert("node wasnt unpublished:" + err.data.Message);
         *    });
         * </pre>
         * @param {Int} id the ID of the node to unpublish
         * @returns {Promise} resourcePromise object.
         *
         */
            unPublish: function (id) {
                if (!id) {
                    throw 'id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostUnPublish', [{ id: id }])), 'Failed to publish content with id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#emptyRecycleBin
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Empties the content recycle bin
         *
         * ##usage
         * <pre>
         * contentResource.emptyRecycleBin()
         *    .then(function() {
         *        alert('its empty!');
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object.
         *
         */
            emptyRecycleBin: function () {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'EmptyRecycleBin')), 'Failed to empty the recycle bin');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#deleteById
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Deletes a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {Int} id id of content item to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete item ' + id);
            },
            deleteBlueprint: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'DeleteBlueprint', [{ id: id }])), 'Failed to delete blueprint ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getById
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *        var myDoc = content;
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id id of content item to return
         * @returns {Promise} resourcePromise object containing the content item.
         *
         */
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve data for content id ' + id);
            },
            getBlueprintById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetBlueprintById', [{ id: id }])), 'Failed to retrieve data for content id ' + id);
            },
            getNotifySettingsById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetNotificationOptions', [{ contentId: id }])), 'Failed to retrieve data for content id ' + id);
            },
            setNotifySettingsById: function (id, options) {
                if (!id) {
                    throw 'contentId cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostNotificationOptions', {
                    contentId: id,
                    notifyOptions: options
                })), 'Failed to set notify settings for content id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getByIds
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets an array of content items, given a collection of ids
         *
         * ##usage
         * <pre>
         * contentResource.getByIds( [1234,2526,28262])
         *    .then(function(contentArray) {
         *        var myDoc = contentArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {Array} ids ids of content items to return as an array
         * @returns {Promise} resourcePromise object containing the content items array.
         *
         */
            getByIds: function (ids) {
                var idQuery = '';
                _.each(ids, function (item) {
                    idQuery += 'ids=' + item + '&';
                });
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetByIds', idQuery)), 'Failed to retrieve data for content with multiple ids');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getScaffold
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a scaffold of an empty content item, given the id of the content item to place it underneath and the content type alias.
         *
         * - Parent Id must be provided so umbraco knows where to store the content
         * - Content Type alias must be provided so umbraco knows which properties to put on the content scaffold
         *
         * The scaffold is used to build editors for content that has not yet been populated with data.
         *
         * ##usage
         * <pre>
         * contentResource.getScaffold(1234, 'homepage')
         *    .then(function(scaffold) {
         *        var myDoc = scaffold;
         *        myDoc.name = "My new document";
         *
         *        contentResource.publish(myDoc, true)
         *            .then(function(content){
         *                alert("Retrieved, updated and published again");
         *            });
         *    });
         * </pre>
         *
         * @param {Int} parentId id of content item to return
         * @param {String} alias contenttype alias to base the scaffold on
         * @returns {Promise} resourcePromise object containing the content scaffold.
         *
         */
            getScaffold: function (parentId, alias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetEmpty', [
                    { contentTypeAlias: alias },
                    { parentId: parentId }
                ])), 'Failed to retrieve data for empty content item type ' + alias);
            },
            getBlueprintScaffold: function (parentId, blueprintId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetEmpty', [
                    { blueprintId: blueprintId },
                    { parentId: parentId }
                ])), 'Failed to retrieve blueprint for id ' + blueprintId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getNiceUrl
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a url, given a node ID
         *
         * ##usage
         * <pre>
         * contentResource.getNiceUrl(id)
         *    .then(function(url) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id Id of node to return the public url to
         * @returns {Promise} resourcePromise object containing the url.
         *
         */
            getNiceUrl: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetNiceUrl', [{ id: id }])), 'Failed to retrieve url for id:' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getChildren
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets children of a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.getChildren(1234, {pageSize: 10, pageNumber: 2})
         *    .then(function(contentArray) {
         *        var children = contentArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {Int} parentid id of content item to return children of
         * @param {Object} options optional options object
         * @param {Int} options.pageSize if paging data, number of nodes per page, default = 0
         * @param {Int} options.pageNumber if paging data, current page index, default = 0
         * @param {String} options.filter if provided, query will only return those with names matching the filter
         * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
         * @param {String} options.orderBy property to order items by, default: `SortOrder`
         * @returns {Promise} resourcePromise object containing an array of content items.
         *
         */
            getChildren: function (parentId, options) {
                var defaults = {
                    includeProperties: [],
                    pageSize: 0,
                    pageNumber: 0,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'SortOrder',
                    orderBySystemField: true
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                //converts the value to a js bool
                function toBool(v) {
                    if (angular.isNumber(v)) {
                        return v > 0;
                    }
                    if (angular.isString(v)) {
                        return v === 'true';
                    }
                    if (typeof v === 'boolean') {
                        return v;
                    }
                    return false;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetChildren', {
                    id: parentId,
                    includeProperties: _.pluck(options.includeProperties, 'alias').join(','),
                    pageNumber: options.pageNumber,
                    pageSize: options.pageSize,
                    orderBy: options.orderBy,
                    orderDirection: options.orderDirection,
                    orderBySystemField: toBool(options.orderBySystemField),
                    filter: options.filter
                })), 'Failed to retrieve children for content item ' + parentId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#hasPermission
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns true/false given a permission char to check against a nodeID
         * for the current user
         *
         * ##usage
         * <pre>
         * contentResource.hasPermission('p',1234)
         *    .then(function() {
         *        alert('You are allowed to publish this item');
         *    });
         * </pre>
         *
         * @param {String} permission char representing the permission to check
         * @param {Int} id id of content item to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            checkPermission: function (permission, id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'HasPermission', [
                    { permissionToCheck: permission },
                    { nodeId: id }
                ])), 'Failed to check permission for item ' + id);
            },
            getDetailedPermissions: function (contentId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetDetailedPermissions', { contentId: contentId })), 'Failed to retrieve permissions for content item ' + contentId);
            },
            getPermissions: function (nodeIds) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'GetPermissions'), nodeIds), 'Failed to get permissions');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#save
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves changes made to a content item to its current version, if the content item is new, the isNew paramater must be passed to force creation
         * if the content item needs to have files attached, they must be provided as the files param and passed separately
         *
         *
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name!";
         *          contentResource.save(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre>
         *
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing
         * @param {Array} files collection of files for the document
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
            save: function (content, isNew, files) {
                var endpoint = umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSave');
                return saveContentItem(content, 'save' + (isNew ? 'New' : ''), files, endpoint);
            },
            saveBlueprint: function (content, isNew, files) {
                var endpoint = umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSaveBlueprint');
                return saveContentItem(content, 'save' + (isNew ? 'New' : ''), files, endpoint);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#publish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves and publishes changes made to a content item to a new version, if the content item is new, the isNew paramater must be passed to force creation
         * if the content item needs to have files attached, they must be provided as the files param and passed separately
         *
         *
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name, and be published!";
         *          contentResource.publish(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and published again");
         *            });
         *    });
         * </pre>
         *
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing
         * @param {Array} files collection of files for the document
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
            publish: function (content, isNew, files) {
                var endpoint = umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSave');
                return saveContentItem(content, 'publish' + (isNew ? 'New' : ''), files, endpoint);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#sendToPublish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves changes made to a content item, and notifies any subscribers about a pending publication
         *
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name, and be published!";
         *          contentResource.sendToPublish(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and notication send off");
         *            });
         *    });
         * </pre>
         *
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing
         * @param {Array} files collection of files for the document
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
            sendToPublish: function (content, isNew, files) {
                var endpoint = umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostSave');
                return saveContentItem(content, 'sendPublish' + (isNew ? 'New' : ''), files, endpoint);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#publishByid
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Publishes a content item with a given ID
         *
         * ##usage
         * <pre>
         * contentResource.publishById(1234)
         *    .then(function(content) {
         *        alert("published");
         *    });
         * </pre>
         *
         * @param {Int} id The ID of the conten to publish
         * @returns {Promise} resourcePromise object containing the published content item.
         *
         */
            publishById: function (id) {
                if (!id) {
                    throw 'id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'PostPublishById', [{ id: id }])), 'Failed to publish content with id ' + id);
            },
            createBlueprintFromContent: function (contentId, name) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentApiBaseUrl', 'CreateBlueprintFromContent', {
                    contentId: contentId,
                    name: name
                })), 'Failed to create blueprint from content with id ' + contentId);
            }
        };
    }
    angular.module('umbraco.resources').factory('contentResource', contentResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.contentTypeResource
    * @description Loads in data for content types
    **/
    function contentTypeResource($q, $http, umbRequestHelper, umbDataFormatter) {
        return {
            getCount: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetCount')), 'Failed to retrieve count');
            },
            getAvailableCompositeContentTypes: function (contentTypeId, filterContentTypes, filterPropertyTypes) {
                if (!filterContentTypes) {
                    filterContentTypes = [];
                }
                if (!filterPropertyTypes) {
                    filterPropertyTypes = [];
                }
                var query = {
                    contentTypeId: contentTypeId,
                    filterContentTypes: filterContentTypes,
                    filterPropertyTypes: filterPropertyTypes
                };
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetAvailableCompositeContentTypes'), query), 'Failed to retrieve data for content type id ' + contentTypeId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getWhereCompositionIsUsedInContentTypes
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a list of content types which use a specific composition with a given id
         *
         * ##usage
         * <pre>
         * contentTypeResource.getWhereCompositionIsUsedInContentTypes(1234)
         *    .then(function(contentTypeList) {
         *        console.log(contentTypeList);
         *    });
         * </pre>
         * @param {Int} contentTypeId id of the composition content type to retrieve the list of the content types where it has been used
         * @returns {Promise} resourcePromise object.
         *
         */
            getWhereCompositionIsUsedInContentTypes: function (contentTypeId) {
                var query = { contentTypeId: contentTypeId };
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetWhereCompositionIsUsedInContentTypes'), query), 'Failed to retrieve data for content type id ' + contentTypeId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getAllowedTypes
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a list of allowed content types underneath a content item with a given ID
         *
         * ##usage
         * <pre>
         * contentTypeResource.getAllowedTypes(1234)
         *    .then(function(array) {
         *        $scope.type = type;
         *    });
         * </pre>
         * @param {Int} contentTypeId id of the content item to retrive allowed child types for
         * @returns {Promise} resourcePromise object.
         *
         */
            getAllowedTypes: function (contentTypeId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetAllowedChildren', [{ contentId: contentTypeId }])), 'Failed to retrieve data for content id ' + contentTypeId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getAllPropertyTypeAliases
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a list of defined property type aliases
         *
         * @returns {Promise} resourcePromise object.
         *
         */
            getAllPropertyTypeAliases: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetAllPropertyTypeAliases')), 'Failed to retrieve property type aliases');
            },
            getAllStandardFields: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetAllStandardFields')), 'Failed to retrieve standard fields');
            },
            getPropertyTypeScaffold: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetPropertyTypeScaffold', [{ id: id }])), 'Failed to retrieve property type scaffold');
            },
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve content type');
            },
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete content type');
            },
            deleteContainerById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'DeleteContainer', [{ id: id }])), 'Failed to delete content type contaier');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getAll
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a list of all content types
         *
         * @returns {Promise} resourcePromise object.
         *
         */
            getAll: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetAll')), 'Failed to retrieve all content types');
            },
            getScaffold: function (parentId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'GetEmpty', { parentId: parentId })), 'Failed to retrieve content type scaffold');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#save
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Saves or update a content type
         *
         * @param {Object} content data type object to create/update
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (contentType) {
                var saveModel = umbDataFormatter.formatContentTypePostData(contentType);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostSave'), saveModel), 'Failed to save data for content type id ' + contentType.id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#move
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * contentTypeResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message);
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
            move: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostMove'), {
                    parentId: args.parentId,
                    id: args.id
                }), 'Failed to move content');
            },
            copy: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostCopy'), {
                    parentId: args.parentId,
                    id: args.id
                }), 'Failed to copy content');
            },
            createContainer: function (parentId, name) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostCreateContainer', {
                    parentId: parentId,
                    name: encodeURIComponent(name)
                })), 'Failed to create a folder under parent id ' + parentId);
            },
            createCollection: function (parentId, collectionName, collectionCreateTemplate, collectionItemName, collectionItemCreateTemplate, collectionIcon, collectionItemIcon) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostCreateCollection', {
                    parentId: parentId,
                    collectionName: collectionName,
                    collectionCreateTemplate: collectionCreateTemplate,
                    collectionItemName: collectionItemName,
                    collectionItemCreateTemplate: collectionItemCreateTemplate,
                    collectionIcon: collectionIcon,
                    collectionItemIcon: collectionItemIcon
                })), 'Failed to create collection under ' + parentId);
            },
            renameContainer: function (id, name) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('contentTypeApiBaseUrl', 'PostRenameContainer', {
                    id: id,
                    name: name
                })), 'Failed to rename the folder with id ' + id);
            }
        };
    }
    angular.module('umbraco.resources').factory('contentTypeResource', contentTypeResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.currentUserResource
    * @description Used for read/updates for the currently logged in user
    * 
    *
    **/
    function currentUserResource($q, $http, umbRequestHelper, umbDataFormatter) {
        //the factory object returned
        return {
            saveTourStatus: function (tourStatus) {
                if (!tourStatus) {
                    return angularHelper.rejectedPromise({ errorMsg: 'tourStatus cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('currentUserApiBaseUrl', 'PostSetUserTour'), tourStatus), 'Failed to save tour status');
            },
            getTours: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('currentUserApiBaseUrl', 'GetUserTours')), 'Failed to get tours');
            },
            performSetInvitedUserPassword: function (newPassword) {
                if (!newPassword) {
                    return angularHelper.rejectedPromise({ errorMsg: 'newPassword cannot be empty' });
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('currentUserApiBaseUrl', 'PostSetInvitedUserPassword'), angular.toJson(newPassword)), 'Failed to change password');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.currentUserResource#changePassword
         * @methodOf umbraco.resources.currentUserResource
         *
         * @description
         * Changes the current users password
         * 
         * @returns {Promise} resourcePromise object containing the user array.
         *
         */
            changePassword: function (changePasswordArgs) {
                changePasswordArgs = umbDataFormatter.formatChangePasswordModel(changePasswordArgs);
                if (!changePasswordArgs) {
                    throw 'No password data to change';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('currentUserApiBaseUrl', 'PostChangePassword'), changePasswordArgs), 'Failed to change password');
            }
        };
    }
    angular.module('umbraco.resources').factory('currentUserResource', currentUserResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
    function dashboardResource($q, $http, umbRequestHelper) {
        //the factory object returned
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.dashboardResource#getDashboard
         * @methodOf umbraco.resources.dashboardResource
         *
         * @description
         * Retrieves the dashboard configuration for a given section
         * 
         * @param {string} section Alias of section to retrieve dashboard configuraton for
         * @returns {Promise} resourcePromise object containing the user array.
         *
         */
            getDashboard: function (section) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dashboardApiBaseUrl', 'GetDashboard', [{ section: section }])), 'Failed to get dashboard ' + section);
            },
            /**
        * @ngdoc method
        * @name umbraco.resources.dashboardResource#getRemoteDashboardContent
        * @methodOf umbraco.resources.dashboardResource
        *
        * @description
        * Retrieves dashboard content from a remote source for a given section
        * 
        * @param {string} section Alias of section to retrieve dashboard content for
        * @returns {Promise} resourcePromise object containing the user array.
        *
        */
            getRemoteDashboardContent: function (section, baseurl) {
                //build request values with optional params
                var values = [{ section: section }];
                if (baseurl) {
                    values.push({ baseurl: baseurl });
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dashboardApiBaseUrl', 'GetRemoteDashboardContent', values)), 'Failed to get dashboard content');
            },
            getRemoteDashboardCssUrl: function (section, baseurl) {
                //build request values with optional params
                var values = [{ section: section }];
                if (baseurl) {
                    values.push({ baseurl: baseurl });
                }
                return umbRequestHelper.getApiUrl('dashboardApiBaseUrl', 'GetRemoteDashboardCss', values);
            }
        };
    }
    angular.module('umbraco.resources').factory('dashboardResource', dashboardResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.dataTypeResource
    * @description Loads in data for data types
    **/
    function dataTypeResource($q, $http, umbDataFormatter, umbRequestHelper) {
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getPreValues
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Retrieves available prevalues for a given data type + editor
         *
         * ##usage
         * <pre>
         * dataTypeResource.getPreValues("Umbraco.MediaPicker", 1234)
         *    .then(function(prevalues) {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {String} editorAlias string alias of editor type to retrive prevalues configuration for
         * @param {Int} id id of datatype to retrieve prevalues for
         * @returns {Promise} resourcePromise object.
         *
         */
            getPreValues: function (editorAlias, dataTypeId) {
                if (!dataTypeId) {
                    dataTypeId = -1;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetPreValues', [
                    { editorAlias: editorAlias },
                    { dataTypeId: dataTypeId }
                ])), 'Failed to retrieve pre values for editor alias ' + editorAlias);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getById
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Gets a data type item with a given id
         *
         * ##usage
         * <pre>
         * dataTypeResource.getById(1234)
         *    .then(function(datatype) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id id of data type to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve data for data type id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getByName
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Gets a data type item with a given name
         *
         * ##usage
         * <pre>
         * dataTypeResource.getByName("upload")
         *    .then(function(datatype) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {String} name Name of data type to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
            getByName: function (name) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetByName', [{ name: name }])), 'Failed to retrieve data for data type with name: ' + name);
            },
            getAll: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetAll')), 'Failed to retrieve data');
            },
            getGroupedDataTypes: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetGroupedDataTypes')), 'Failed to retrieve data');
            },
            getGroupedPropertyEditors: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetGroupedPropertyEditors')), 'Failed to retrieve data');
            },
            getAllPropertyEditors: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetAllPropertyEditors')), 'Failed to retrieve data');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getScaffold
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a scaffold of an empty data type item
         *
         * The scaffold is used to build editors for data types that has not yet been populated with data.
         *
         * ##usage
         * <pre>
         * dataTypeResource.getScaffold()
         *    .then(function(scaffold) {
         *        var myType = scaffold;
         *        myType.name = "My new data type";
         *
         *        dataTypeResource.save(myType, myType.preValues, true)
         *            .then(function(type){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object containing the data type scaffold.
         *
         */
            getScaffold: function (parentId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetEmpty', { parentId: parentId })), 'Failed to retrieve data for empty datatype');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#deleteById
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Deletes a data type with a given id
         *
         * ##usage
         * <pre>
         * dataTypeResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {Int} id id of content item to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete item ' + id);
            },
            deleteContainerById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'DeleteContainer', [{ id: id }])), 'Failed to delete content type contaier');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getCustomListView
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Returns a custom listview, given a content types alias
         *
         *
         * ##usage
         * <pre>
         * dataTypeResource.getCustomListView("home")
         *    .then(function(listview) {
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object containing the listview datatype.
         *
         */
            getCustomListView: function (contentTypeAlias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'GetCustomListView', { contentTypeAlias: contentTypeAlias })), 'Failed to retrieve data for custom listview datatype');
            },
            /**
        * @ngdoc method
        * @name umbraco.resources.dataTypeResource#createCustomListView
        * @methodOf umbraco.resources.dataTypeResource
        *
        * @description
        * Creates and returns a custom listview, given a content types alias
        *
        * ##usage
        * <pre>
        * dataTypeResource.createCustomListView("home")
        *    .then(function(listview) {
        *    });
        * </pre>
        *
        * @returns {Promise} resourcePromise object containing the listview datatype.
        *
        */
            createCustomListView: function (contentTypeAlias) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'PostCreateCustomListView', { contentTypeAlias: contentTypeAlias })), 'Failed to create a custom listview datatype');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#save
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Saves or update a data type
         *
         * @param {Object} dataType data type object to create/update
         * @param {Array} preValues collection of prevalues on the datatype
         * @param {Bool} isNew set to true if type should be create instead of updated
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (dataType, preValues, isNew) {
                var saveModel = umbDataFormatter.formatDataTypePostData(dataType, preValues, 'save' + (isNew ? 'New' : ''));
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'PostSave'), saveModel), 'Failed to save data for data type id ' + dataType.id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#move
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * dataTypeResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message); 
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
            move: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'PostMove'), {
                    parentId: args.parentId,
                    id: args.id
                }), 'Failed to move content');
            },
            createContainer: function (parentId, name) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'PostCreateContainer', {
                    parentId: parentId,
                    name: encodeURIComponent(name)
                })), 'Failed to create a folder under parent id ' + parentId);
            },
            renameContainer: function (id, name) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dataTypeApiBaseUrl', 'PostRenameContainer', {
                    id: id,
                    name: name
                })), 'Failed to rename the folder with id ' + id);
            }
        };
    }
    angular.module('umbraco.resources').factory('dataTypeResource', dataTypeResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.dictionaryResource
    * @description Loads in data for dictionary items
**/
    function dictionaryResource($q, $http, $location, umbRequestHelper, umbDataFormatter) {
        /**
         * @ngdoc method
         * @name umbraco.resources.dictionaryResource#deleteById
         * @methodOf umbraco.resources.dictionaryResource
         *
         * @description
         * Deletes a dictionary item with a given id
         *
         * ##usage
         * <pre>
         * dictionaryResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {Int} id id of dictionary item to delete
         * @returns {Promise} resourcePromise object.
         *
  **/
        function deleteById(id) {
            return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dictionaryApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete item ' + id);
        }
        /**
         * @ngdoc method
         * @name umbraco.resources.dictionaryResource#create
         * @methodOf umbraco.resources.dictionaryResource
         *
         * @description
         * Creates a dictionary item with the gieven key and parent id
         *
         * ##usage
         * <pre>
         * dictionaryResource.create(1234,"Item key")
         *    .then(function() {
         *        alert('its created!');
         *    });
         * </pre>
         *
         * @param {Int} parentid the parentid of the new dictionary item
         * @param {String} key the key of the new dictionary item
         * @returns {Promise} resourcePromise object.
         *
  **/
        function create(parentid, key) {
            return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dictionaryApiBaseUrl', 'Create', {
                parentId: parentid,
                key: key
            })), 'Failed to create item ');
        }
        /**
         * @ngdoc method
         * @name umbraco.resources.dictionaryResource#deleteById
         * @methodOf umbraco.resources.dictionaryResource
         *
         * @description
         * Gets a dictionary item with a given id
         *
         * ##usage
         * <pre>
         * dictionaryResource.getById(1234)
         *    .then(function() {
         *        alert('Found it!');
         *    });
         * </pre>
         *
         * @param {Int} id id of dictionary item to get
         * @returns {Promise} resourcePromise object.
         *
  **/
        function getById(id) {
            return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dictionaryApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to get item ' + id);
        }
        /**
        * @ngdoc method
        * @name umbraco.resources.dictionaryResource#save
        * @methodOf umbraco.resources.dictionaryResource
        *
        * @description
        * Updates a dictionary
        *
        * @param {Object} dictionary  dictionary object to update     
        * @param {Bool} nameIsDirty set to true if the name has been changed
        * @returns {Promise} resourcePromise object.
        *
        */
        function save(dictionary, nameIsDirty) {
            var saveModel = umbDataFormatter.formatDictionaryPostData(dictionary, nameIsDirty);
            return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('dictionaryApiBaseUrl', 'PostSave'), saveModel), 'Failed to save data for dictionary id ' + dictionary.id);
        }
        /**
         * @ngdoc method
         * @name umbraco.resources.dictionaryResource#getList
         * @methodOf umbraco.resources.dictionaryResource
         *
         * @description
         * Gets a list of all dictionary items
         *
         * ##usage
         * <pre>
         * dictionaryResource.getList()
         *    .then(function() {
         *        alert('Found it!');
         *    });
         * </pre>
         *         
         * @returns {Promise} resourcePromise object.
         *
  **/
        function getList() {
            return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('dictionaryApiBaseUrl', 'getList')), 'Failed to get list');
        }
        var resource = {
            deleteById: deleteById,
            create: create,
            getById: getById,
            save: save,
            getList: getList
        };
        return resource;
    }
    angular.module('umbraco.resources').factory('dictionaryResource', dictionaryResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.entityResource
    * @description Loads in basic data for all entities
    *
    * ##What is an entity?
    * An entity is a basic **read-only** representation of an Umbraco node. It contains only the most
    * basic properties used to display the item in trees, lists and navigation.
    *
    * ##What is the difference between entity and content/media/etc...?
    * the entity only contains the basic node data, name, id and guid, whereas content
    * nodes fetched through the content service also contains additional all of the content property data, etc..
    * This is the same principal for all entity types. Any user that is logged in to the back office will have access
    * to view the basic entity information for all entities since the basic entity information does not contain sensitive information.
    *
    * ##Entity object types?
    * You need to specify the type of object you want returned.
    *
    * The core object types are:
    *
    * - Document
    * - Media
    * - Member
    * - Template
    * - DocumentType
    * - MediaType
    * - MemberType
    * - Macro
    * - User
    * - Language
    * - Domain
    * - DataType
    **/
    function entityResource($q, $http, umbRequestHelper) {
        //the factory object returned
        return {
            getSafeAlias: function (value, camelCase) {
                if (!value) {
                    return '';
                }
                value = value.replace('#', '');
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetSafeAlias', {
                    value: value,
                    camelCase: camelCase
                })), 'Failed to retrieve content type scaffold');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getPath
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Returns a path, given a node ID and type
         *
         * ##usage
         * <pre>
         * entityResource.getPath(id, type)
         *    .then(function(pathArray) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id Id of node to return the public url to
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the url.
         *
         */
            getPath: function (id, type) {
                if (id === -1 || id === '-1') {
                    return '-1';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetPath', [
                    { id: id },
                    { type: type }
                ])), 'Failed to retrieve path for id:' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getUrl
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Returns a url, given a node ID and type
         *
         * ##usage
         * <pre>
         * entityResource.getUrl(id, type)
         *    .then(function(url) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id Id of node to return the public url to
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the url.
         *
         */
            getUrl: function (id, type) {
                if (id === -1 || id === '-1') {
                    return '';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetUrl', [
                    { id: id },
                    { type: type }
                ])), 'Failed to retrieve url for id:' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getById
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an entity with a given id
         *
         * ##usage
         * <pre>
         * //get media by id
         * entityResource.getEntityById(0, "Media")
         *    .then(function(ent) {
         *        var myDoc = ent;
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id id of entity to return
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
            getById: function (id, type) {
                if (id === -1 || id === '-1') {
                    return null;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetById', [
                    { id: id },
                    { type: type }
                ])), 'Failed to retrieve entity data for id ' + id);
            },
            getUrlAndAnchors: function (id) {
                if (id === -1 || id === '-1') {
                    return null;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetUrlAndAnchors', { id: id })), 'Failed to retrieve url and anchors data for id ' + id);
            },
            getAnchors: function (rteContent) {
                if (!rteContent || rteContent.length === 0) {
                    return [];
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetAnchors'), { rteContent: rteContent }), 'Failed to anchors data for rte content ' + rteContent);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getByIds
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities, given a collection of ids
         *
         * ##usage
         * <pre>
         * //Get templates for ids
         * entityResource.getEntitiesByIds( [1234,2526,28262], "Template")
         *    .then(function(templateArray) {
         *        var myDoc = contentArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {Array} ids ids of entities to return as an array
         * @param {string} type type name
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
            getByIds: function (ids, type) {
                var query = 'type=' + type;
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetByIds', query), { ids: ids }), 'Failed to retrieve entity data for ids ' + ids);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getByQuery
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an entity from a given xpath
         *
         * ##usage
         * <pre>
         * //get content by xpath
         * entityResource.getByQuery("$current", -1, "Document")
         *    .then(function(ent) {
         *        var myDoc = ent;
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {string} query xpath to use in query
         * @param {Int} nodeContextId id id to start from
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
            getByQuery: function (query, nodeContextId, type) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetByQuery', [
                    { query: query },
                    { nodeContextId: nodeContextId },
                    { type: type }
                ])), 'Failed to retrieve entity data for query ' + query);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getAll
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an entity with a given id
         *
         * ##usage
         * <pre>
         *
         * //Only return media
         * entityResource.getAll("Media")
         *    .then(function(ent) {
         *        var myDoc = ent;
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {string} type Object type name
         * @param {string} postFilter optional filter expression which will execute a dynamic where clause on the server
         * @param {string} postFilterParams optional parameters for the postFilter expression
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
            getAll: function (type, postFilter, postFilterParams) {
                //need to build the query string manually
                var query = 'type=' + type + '&postFilter=' + (postFilter ? postFilter : '');
                if (postFilter && postFilterParams) {
                    var counter = 0;
                    _.each(postFilterParams, function (val, key) {
                        query += '&postFilterParams[' + counter + '].key=' + key + '&postFilterParams[' + counter + '].value=' + val;
                        counter++;
                    });
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetAll', query)), 'Failed to retrieve entity data for type ' + type);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getAncestors
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets ancestor entities for a given item
         *
         *
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
            getAncestors: function (id, type, options) {
                var args = [
                    { id: id },
                    { type: type }
                ];
                if (options && options.dataTypeId) {
                    args.push({ dataTypeId: options.dataTypeId });
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetAncestors', args)), 'Failed to retrieve ancestor data for id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getChildren
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets children entities for a given item
         *
         * @param {Int} parentid id of content item to return children of
         * @param {string} type Object type name
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
            getChildren: function (id, type, options) {
                var args = [
                    { id: id },
                    { type: type }
                ];
                if (options && options.dataTypeId) {
                    args.push({ dataTypeId: options.dataTypeId });
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetChildren', args)), 'Failed to retrieve child data for id ' + id);
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.entityResource#getPagedChildren
          * @methodOf umbraco.resources.entityResource
          *
          * @description
          * Gets paged children of a content item with a given id
          *
          * ##usage
          * <pre>
          * entityResource.getPagedChildren(1234, "Content", {pageSize: 10, pageNumber: 2})
          *    .then(function(contentArray) {
          *        var children = contentArray;
          *        alert('they are here!');
          *    });
          * </pre>
          *
          * @param {Int} parentid id of content item to return children of
          * @param {string} type Object type name
          * @param {Object} options optional options object
          * @param {Int} options.pageSize if paging data, number of nodes per page, default = 1
          * @param {Int} options.pageNumber if paging data, current page index, default = 100
          * @param {String} options.filter if provided, query will only return those with names matching the filter
          * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
          * @param {String} options.orderBy property to order items by, default: `SortOrder`
          * @returns {Promise} resourcePromise object containing an array of content items.
          *
          */
            getPagedChildren: function (parentId, type, options) {
                var defaults = {
                    pageSize: 1,
                    pageNumber: 100,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'SortOrder'
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetPagedChildren', {
                    id: parentId,
                    type: type,
                    pageNumber: options.pageNumber,
                    pageSize: options.pageSize,
                    orderBy: options.orderBy,
                    orderDirection: options.orderDirection,
                    filter: encodeURIComponent(options.filter),
                    dataTypeId: options.dataTypeId
                })), 'Failed to retrieve child data for id ' + parentId);
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.entityResource#getPagedDescendants
          * @methodOf umbraco.resources.entityResource
          *
          * @description
          * Gets paged descendants of a content item with a given id
          *
          * ##usage
          * <pre>
          * entityResource.getPagedDescendants(1234, "Document", {pageSize: 10, pageNumber: 2})
          *    .then(function(contentArray) {
          *        var children = contentArray;
          *        alert('they are here!');
          *    });
          * </pre>
          *
          * @param {Int} parentid id of content item to return descendants of
          * @param {string} type Object type name
          * @param {Object} options optional options object
          * @param {Int} options.pageSize if paging data, number of nodes per page, default = 100
          * @param {Int} options.pageNumber if paging data, current page index, default = 1
          * @param {String} options.filter if provided, query will only return those with names matching the filter
          * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
          * @param {String} options.orderBy property to order items by, default: `SortOrder`
          * @returns {Promise} resourcePromise object containing an array of content items.
          *
          */
            getPagedDescendants: function (parentId, type, options) {
                var defaults = {
                    pageSize: 100,
                    pageNumber: 1,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'SortOrder',
                    dataTypeId: null
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'GetPagedDescendants', {
                    id: parentId,
                    type: type,
                    pageNumber: options.pageNumber,
                    pageSize: options.pageSize,
                    orderBy: options.orderBy,
                    orderDirection: options.orderDirection,
                    filter: encodeURIComponent(options.filter),
                    dataTypeId: options.dataTypeId
                })), 'Failed to retrieve child data for id ' + parentId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#search
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities, given a lucene query and a type
         *
         * ##usage
         * <pre>
         * entityResource.search("news", "Media")
         *    .then(function(mediaArray) {
         *        var myDoc = mediaArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {String} Query search query
         * @param {String} Type type of conten to search
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
            search: function (query, type, searchFrom, canceler, dataTypeId) {
                var args = [
                    { query: query },
                    { type: type }
                ];
                if (searchFrom) {
                    args.push({ searchFrom: searchFrom });
                }
                if (dataTypeId) {
                    args.push({ dataTypeId: dataTypeId });
                }
                var httpConfig = {};
                if (canceler) {
                    httpConfig['timeout'] = canceler;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'Search', args), httpConfig), 'Failed to retrieve entity data for query ' + query);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#searchAll
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities from all available search indexes, given a lucene query
         *
         * ##usage
         * <pre>
         * entityResource.searchAll("bob")
         *    .then(function(array) {
         *        var myDoc = array;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {String} Query search query
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
            searchAll: function (query, canceler) {
                var httpConfig = {};
                if (canceler) {
                    httpConfig['timeout'] = canceler;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('entityApiBaseUrl', 'SearchAll', [{ query: query }]), httpConfig), 'Failed to retrieve entity data for query ' + query);
            }
        };
    }
    angular.module('umbraco.resources').factory('entityResource', entityResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.healthCheckResource
 * @function
 *
 * @description
 * Used by the health check dashboard to get checks and send requests to fix checks.
 */
    (function () {
        'use strict';
        function healthCheckResource($http, umbRequestHelper) {
            /**
         * @ngdoc function
         * @name umbraco.resources.healthCheckService#getAllChecks
         * @methodOf umbraco.resources.healthCheckResource
         * @function
         *
         * @description
         * Called to get all available health checks
         */
            function getAllChecks() {
                return umbRequestHelper.resourcePromise($http.get(Umbraco.Sys.ServerVariables.umbracoUrls.healthCheckBaseUrl + 'GetAllHealthChecks'), 'Failed to retrieve health checks');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.healthCheckService#getStatus
         * @methodOf umbraco.resources.healthCheckResource
         * @function
         *
         * @description
         * Called to get execute a health check and return the check status
         */
            function getStatus(id) {
                return umbRequestHelper.resourcePromise($http.get(Umbraco.Sys.ServerVariables.umbracoUrls.healthCheckBaseUrl + 'GetStatus?id=' + id), 'Failed to retrieve status for health check with ID ' + id);
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.healthCheckService#executeAction
         * @methodOf umbraco.resources.healthCheckResource
         * @function
         *
         * @description
         * Called to execute a health check action (rectifying an issue)
         */
            function executeAction(action) {
                return umbRequestHelper.resourcePromise($http.post(Umbraco.Sys.ServerVariables.umbracoUrls.healthCheckBaseUrl + 'ExecuteAction', action), 'Failed to execute action with alias ' + action.alias + ' and healthCheckId + ' + action.healthCheckId);
            }
            var resource = {
                getAllChecks: getAllChecks,
                getStatus: getStatus,
                executeAction: executeAction
            };
            return resource;
        }
        angular.module('umbraco.resources').factory('healthCheckResource', healthCheckResource);
    }());
    /**
    * @ngdoc service
    * @name umbraco.resources.legacyResource
    * @description Handles legacy dialog requests
    **/
    function legacyResource($q, $http, umbRequestHelper) {
        //the factory object returned
        return {
            /** Loads in the data to display the section list */
            deleteItem: function (args) {
                if (!args.nodeId || !args.nodeType || !args.alias) {
                    throw 'The args parameter is not formatted correct, it requires properties: nodeId, nodeType, alias';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('legacyApiBaseUrl', 'DeleteLegacyItem', [
                    { nodeId: args.nodeId },
                    { nodeType: args.nodeType },
                    { alias: args.alias }
                ])), 'Failed to delete item ' + args.nodeId);
            }
        };
    }
    angular.module('umbraco.resources').factory('legacyResource', legacyResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.logResource
    * @description Retrives log history from umbraco
    * 
    *
    **/
    function logResource($q, $http, umbRequestHelper) {
        function isValidDate(input) {
            if (input) {
                if (Object.prototype.toString.call(input) === '[object Date]' && !isNaN(input.getTime())) {
                    return true;
                }
            }
            return false;
        }
        ;
        function dateToValidIsoString(input) {
            if (isValidDate(input)) {
                return input.toISOString();
            }
            return '';
        }
        ;
        //the factory object returned
        return {
            /**
        * @ngdoc method
        * @name umbraco.resources.logResource#getPagedEntityLog
        * @methodOf umbraco.resources.logResource
        *
        * @description
        * Gets a paginated log history for a entity
        *
        * ##usage
        * <pre>
        * var options = {
        *      id : 1234
        *      pageSize : 10,
        *      pageNumber : 1,
        *      orderDirection : "Descending",
        *      sinceDate : new Date(2018,0,1)
        * };
        * logResource.getPagedEntityLog(options)
        *    .then(function(log) {
        *        alert('its here!');
        *    });
        * </pre> 
        * 
        * @param {Object} options options object
        * @param {Int} options.id the id of the entity
        * @param {Int} options.pageSize if paging data, number of nodes per page, default = 10, set to 0 to disable paging
        * @param {Int} options.pageNumber if paging data, current page index, default = 1
        * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Descending`
        * @param {Date} options.sinceDate if provided this will only get log entries going back to this date
        * @returns {Promise} resourcePromise object containing the log.
        *
        */
            getPagedEntityLog: function (options) {
                var defaults = {
                    pageSize: 10,
                    pageNumber: 1,
                    orderDirection: 'Descending'
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                if (options.hasOwnProperty('sinceDate')) {
                    options.sinceDate = dateToValidIsoString(options.sinceDate);
                }
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                if (options.id === undefined || options.id === null) {
                    throw 'options.id is required';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('logApiBaseUrl', 'GetPagedEntityLog', options)), 'Failed to retrieve log data for id');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getPagedUserLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * Gets a paginated log history for the current user
         *
         * ##usage
         * <pre>
         * var options = {
         *      pageSize : 10,
         *      pageNumber : 1,
         *      orderDirection : "Descending",
         *      sinceDate : new Date(2018,0,1)
         * };
         * logResource.getPagedUserLog(options)
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Object} options options object
         * @param {Int} options.pageSize if paging data, number of nodes per page, default = 10, set to 0 to disable paging
         * @param {Int} options.pageNumber if paging data, current page index, default = 1
         * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Descending`
         * @param {Date} options.sinceDate if provided this will only get log entries going back to this date
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
            getPagedUserLog: function (options) {
                var defaults = {
                    pageSize: 10,
                    pageNumber: 1,
                    orderDirection: 'Descending'
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                if (options.hasOwnProperty('sinceDate')) {
                    options.sinceDate = dateToValidIsoString(options.sinceDate);
                }
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('logApiBaseUrl', 'GetPagedCurrentUserLog', options)), 'Failed to retrieve log data for id');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getEntityLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         *  <strong>[OBSOLETE] use getPagedEntityLog instead</strong><br />
         * Gets the log history for a give entity id
         *
         * ##usage
         * <pre>
         * logResource.getEntityLog(1234)
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of entity to return log history        
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
            getEntityLog: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('logApiBaseUrl', 'GetEntityLog', [{ id: id }])), 'Failed to retrieve user data for id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getUserLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * <strong>[OBSOLETE] use getPagedUserLog instead</strong><br />
         * Gets the current user's log history for a given type of log entry
         *
         * ##usage
         * <pre>
         * logResource.getUserLog("save", new Date())
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {String} type logtype to query for
         * @param {DateTime} since query the log back to this date, by defalt 7 days ago
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
            getUserLog: function (type, since) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('logApiBaseUrl', 'GetCurrentUserLog', [
                    { logtype: type },
                    { sinceDate: dateToValidIsoString(since) }
                ])), 'Failed to retrieve log data for current user of type ' + type + ' since ' + since);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * Gets the log history for a given type of log entry
         *
         * ##usage
         * <pre>
         * logResource.getLog("save", new Date())
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {String} type logtype to query for
         * @param {DateTime} since query the log back to this date, by defalt 7 days ago
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
            getLog: function (type, since) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('logApiBaseUrl', 'GetLog', [
                    { logtype: type },
                    { sinceDate: dateToValidIsoString(since) }
                ])), 'Failed to retrieve log data of type ' + type + ' since ' + since);
            }
        };
    }
    angular.module('umbraco.resources').factory('logResource', logResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.macroResource
    * @description Deals with data for macros
    *
    **/
    function macroResource($q, $http, umbRequestHelper) {
        //the factory object returned
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.macroResource#getMacroParameters
         * @methodOf umbraco.resources.macroResource
         *
         * @description
         * Gets the editable macro parameters for the specified macro alias
         *
         * @param {int} macroId The macro id to get parameters for
         *
         */
            getMacroParameters: function (macroId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('macroApiBaseUrl', 'GetMacroParameters', [{ macroId: macroId }])), 'Failed to retrieve macro parameters for macro with id  ' + macroId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.macroResource#getMacroResult
         * @methodOf umbraco.resources.macroResource
         *
         * @description
         * Gets the result of a macro as html to display in the rich text editor or in the Grid
         *
         * @param {int} macroId The macro id to get parameters for
         * @param {int} pageId The current page id
         * @param {Array} macroParamDictionary A dictionary of macro parameters
         *
         */
            getMacroResultAsHtmlForEditor: function (macroAlias, pageId, macroParamDictionary) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('macroApiBaseUrl', 'GetMacroResultAsHtmlForEditor'), {
                    macroAlias: macroAlias,
                    pageId: pageId,
                    macroParams: macroParamDictionary
                }), 'Failed to retrieve macro result for macro with alias  ' + macroAlias);
            },
            /**
         *
         * @param {} filename
         * @returns {}
         */
            createPartialViewMacroWithFile: function (virtualPath, filename) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('macroApiBaseUrl', 'CreatePartialViewMacroWithFile'), {
                    virtualPath: virtualPath,
                    filename: filename
                }), 'Failed to create macro "' + filename + '"');
            }
        };
    }
    angular.module('umbraco.resources').factory('macroResource', macroResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.mediaResource
 * @description Loads in data for media
 **/
    function mediaResource($q, $http, umbDataFormatter, umbRequestHelper) {
        /** internal method process the saving of data and post processing the result */
        function saveMediaItem(content, action, files) {
            return umbRequestHelper.postSaveContent({
                restApiUrl: umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'PostSave'),
                content: content,
                action: action,
                files: files,
                dataFormatter: function (c, a) {
                    return umbDataFormatter.formatMediaPostData(c, a);
                }
            });
        }
        return {
            getRecycleBin: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetRecycleBin')), 'Failed to retrieve data for media recycle bin');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#sort
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Sorts all children below a given parent node id, based on a collection of node-ids
         *
         * ##usage
         * <pre>
         * var ids = [123,34533,2334,23434];
         * mediaResource.sort({ sortedIds: ids })
         *    .then(function() {
         *        $scope.complete = true;
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.parentId the ID of the parent node
         * @param {Array} options.sortedIds array of node IDs as they should be sorted
         * @returns {Promise} resourcePromise object.
         *
         */
            sort: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.sortedIds) {
                    throw 'args.sortedIds cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'PostSort'), {
                    parentId: args.parentId,
                    idSortOrder: args.sortedIds
                }), 'Failed to sort media');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#move
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * mediaResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message);
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
            move: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'PostMove'), {
                    parentId: args.parentId,
                    id: args.id
                }), {
                    error: function (data) {
                        var errorMsg = 'Failed to move media';
                        if (data.id !== undefined && data.parentId !== undefined) {
                            if (data.id === data.parentId) {
                                errorMsg = 'Media can\'t be moved into itself';
                            }
                        } else if (data.notifications !== undefined) {
                            if (data.notifications.length > 0) {
                                if (data.notifications[0].header.length > 0) {
                                    errorMsg = data.notifications[0].header;
                                }
                                if (data.notifications[0].message.length > 0) {
                                    errorMsg = errorMsg + ': ' + data.notifications[0].message;
                                }
                            }
                        }
                        return { errorMsg: errorMsg };
                    }
                });
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getById
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.getById(1234)
         *    .then(function(media) {
         *        var myMedia = media;
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id id of media item to return
         * @returns {Promise} resourcePromise object containing the media item.
         *
         */
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve data for media id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#deleteById
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Deletes a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {Int} id id of media item to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete item ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getByIds
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets an array of media items, given a collection of ids
         *
         * ##usage
         * <pre>
         * mediaResource.getByIds( [1234,2526,28262])
         *    .then(function(mediaArray) {
         *        var myDoc = contentArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {Array} ids ids of media items to return as an array
         * @returns {Promise} resourcePromise object containing the media items array.
         *
         */
            getByIds: function (ids) {
                var idQuery = '';
                _.each(ids, function (item) {
                    idQuery += 'ids=' + item + '&';
                });
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetByIds', idQuery)), 'Failed to retrieve data for media ids ' + ids);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getScaffold
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Returns a scaffold of an empty media item, given the id of the media item to place it underneath and the media type alias.
         *
         * - Parent Id must be provided so umbraco knows where to store the media
         * - Media Type alias must be provided so umbraco knows which properties to put on the media scaffold
         *
         * The scaffold is used to build editors for media that has not yet been populated with data.
         *
         * ##usage
         * <pre>
         * mediaResource.getScaffold(1234, 'folder')
         *    .then(function(scaffold) {
         *        var myDoc = scaffold;
         *        myDoc.name = "My new media item";
         *
         *        mediaResource.save(myDoc, true)
         *            .then(function(media){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre>
         *
         * @param {Int} parentId id of media item to return
         * @param {String} alias mediatype alias to base the scaffold on
         * @returns {Promise} resourcePromise object containing the media scaffold.
         *
         */
            getScaffold: function (parentId, alias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetEmpty', [
                    { contentTypeAlias: alias },
                    { parentId: parentId }
                ])), 'Failed to retrieve data for empty media item type ' + alias);
            },
            rootMedia: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetRootMedia')), 'Failed to retrieve data for root media');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getChildren
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets children of a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.getChildren(1234, {pageSize: 10, pageNumber: 2})
         *    .then(function(contentArray) {
         *        var children = contentArray;
         *        alert('they are here!');
         *    });
         * </pre>
         *
         * @param {Int} parentid id of content item to return children of
         * @param {Object} options optional options object
         * @param {Int} options.pageSize if paging data, number of nodes per page, default = 0
         * @param {Int} options.pageNumber if paging data, current page index, default = 0
         * @param {String} options.filter if provided, query will only return those with names matching the filter
         * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
         * @param {String} options.orderBy property to order items by, default: `SortOrder`
         * @returns {Promise} resourcePromise object containing an array of content items.
         *
         */
            getChildren: function (parentId, options) {
                var defaults = {
                    pageSize: 0,
                    pageNumber: 0,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'SortOrder',
                    orderBySystemField: true
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                //converts the value to a js bool
                function toBool(v) {
                    if (angular.isNumber(v)) {
                        return v > 0;
                    }
                    if (angular.isString(v)) {
                        return v === 'true';
                    }
                    if (typeof v === 'boolean') {
                        return v;
                    }
                    return false;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetChildren', [
                    { id: parentId },
                    { pageNumber: options.pageNumber },
                    { pageSize: options.pageSize },
                    { orderBy: options.orderBy },
                    { orderDirection: options.orderDirection },
                    { orderBySystemField: toBool(options.orderBySystemField) },
                    { filter: options.filter }
                ])), 'Failed to retrieve children for media item ' + parentId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#save
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Saves changes made to a media item, if the media item is new, the isNew paramater must be passed to force creation
         * if the media item needs to have files attached, they must be provided as the files param and passed separately
         *
         *
         * ##usage
         * <pre>
         * mediaResource.getById(1234)
         *    .then(function(media) {
         *          media.name = "I want a new name!";
         *          mediaResource.save(media, false)
         *            .then(function(media){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre>
         *
         * @param {Object} media The media item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing
         * @param {Array} files collection of files for the media item
         * @returns {Promise} resourcePromise object containing the saved media item.
         *
         */
            save: function (media, isNew, files) {
                return saveMediaItem(media, 'save' + (isNew ? 'New' : ''), files);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#addFolder
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Shorthand for adding a media item of the type "Folder" under a given parent ID
         *
         * ##usage
         * <pre>
         * mediaResource.addFolder("My gallery", 1234)
         *    .then(function(folder) {
         *        alert('New folder');
         *    });
         * </pre>
         *
         * @param {string} name Name of the folder to create
         * @param {int} parentId Id of the media item to create the folder underneath
         * @returns {Promise} resourcePromise object.
         *
         */
            addFolder: function (name, parentId) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'PostAddFolder'), {
                    name: name,
                    parentId: parentId
                }), 'Failed to add folder');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getChildFolders
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Retrieves all media children with types used as folders.
         * Uses the convention of looking for media items with mediaTypes ending in
         * *Folder so will match "Folder", "bannerFolder", "secureFolder" etc,
         *
         * NOTE: This will return a max of 500 folders, if more is required it needs to be paged
         *
         * ##usage
         * <pre>
         * mediaResource.getChildFolders(1234)
         *    .then(function(data) {
         *        alert('folders');
         *    });
         * </pre>
         *
         * @param {int} parentId Id of the media item to query for child folders
         * @returns {Promise} resourcePromise object.
         *
         */
            getChildFolders: function (parentId) {
                if (!parentId) {
                    parentId = -1;
                }
                //NOTE: This will return a max of 500 folders, if more is required it needs to be paged
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'GetChildFolders', { id: parentId })), 'Failed to retrieve child folders for media item ' + parentId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#emptyRecycleBin
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Empties the media recycle bin
         *
         * ##usage
         * <pre>
         * mediaResource.emptyRecycleBin()
         *    .then(function() {
         *        alert('its empty!');
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object.
         *
         */
            emptyRecycleBin: function () {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'EmptyRecycleBin')), 'Failed to empty the recycle bin');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#search
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Paginated search for media items starting on the supplied nodeId
         *
         * ##usage
         * <pre>
         * mediaResource.search("my search", 1, 100, -1)
         *    .then(function(searchResult) {
         *        alert('it's here!');
         *    });
         * </pre>
         *
         * @param {string} query The search query
         * @param {int} pageNumber The page number
         * @param {int} pageSize The number of media items on a page
         * @param {int} searchFrom NodeId to search from (-1 for root)
         * @returns {Promise} resourcePromise object.
         *
         */
            search: function (query, pageNumber, pageSize, searchFrom) {
                var args = [
                    { 'query': query },
                    { 'pageNumber': pageNumber },
                    { 'pageSize': pageSize },
                    { 'searchFrom': searchFrom }
                ];
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaApiBaseUrl', 'Search', args)), 'Failed to retrieve media items for search: ' + query);
            }
        };
    }
    angular.module('umbraco.resources').factory('mediaResource', mediaResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.mediaTypeResource
    * @description Loads in data for media types
    **/
    function mediaTypeResource($q, $http, umbRequestHelper, umbDataFormatter, localizationService) {
        return {
            getCount: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetCount')), 'Failed to retrieve count');
            },
            getAvailableCompositeContentTypes: function (contentTypeId, filterContentTypes, filterPropertyTypes) {
                if (!filterContentTypes) {
                    filterContentTypes = [];
                }
                if (!filterPropertyTypes) {
                    filterPropertyTypes = [];
                }
                var query = {
                    contentTypeId: contentTypeId,
                    filterContentTypes: filterContentTypes,
                    filterPropertyTypes: filterPropertyTypes
                };
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetAvailableCompositeMediaTypes'), query), 'Failed to retrieve data for content type id ' + contentTypeId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaTypeResource#getWhereCompositionIsUsedInContentTypes
         * @methodOf umbraco.resources.mediaTypeResource
         *
         * @description
         * Returns a list of media types which use a specific composition with a given id
         *
         * ##usage
         * <pre>
         * mediaTypeResource.getWhereCompositionIsUsedInContentTypes(1234)
         *    .then(function(mediaTypeList) {
         *        console.log(mediaTypeList);
         *    });
         * </pre>
         * @param {Int} contentTypeId id of the composition content type to retrieve the list of the media types where it has been used
         * @returns {Promise} resourcePromise object.
         *
         */
            getWhereCompositionIsUsedInContentTypes: function (contentTypeId) {
                var query = { contentTypeId: contentTypeId };
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetWhereCompositionIsUsedInContentTypes'), query), 'Failed to retrieve data for content type id ' + contentTypeId);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaTypeResource#getAllowedTypes
         * @methodOf umbraco.resources.mediaTypeResource
         *
         * @description
         * Returns a list of allowed media types underneath a media item with a given ID
         *
         * ##usage
         * <pre>
         * mediaTypeResource.getAllowedTypes(1234)
         *    .then(function(array) {
         *        $scope.type = type;
         *    });
         * </pre>
         * @param {Int} mediaId id of the media item to retrive allowed child types for
         * @returns {Promise} resourcePromise object.
         *
         */
            getAllowedTypes: function (mediaId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetAllowedChildren', [{ contentId: mediaId }])), 'Failed to retrieve allowed types for media id ' + mediaId);
            },
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve content type');
            },
            getAll: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetAll')), 'Failed to retrieve all content types');
            },
            getScaffold: function (parentId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'GetEmpty', { parentId: parentId })), 'Failed to retrieve content type scaffold');
            },
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to retrieve content type');
            },
            deleteContainerById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'DeleteContainer', [{ id: id }])), 'Failed to delete content type contaier');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaTypeResource#save
         * @methodOf umbraco.resources.mediaTypeResource
         *
         * @description
         * Saves or update a media type
         *
         * @param {Object} content data type object to create/update
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (contentType) {
                var saveModel = umbDataFormatter.formatContentTypePostData(contentType);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'PostSave'), saveModel), 'Failed to save data for content type id ' + contentType.id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.mediaTypeResource#move
         * @methodOf umbraco.resources.mediaTypeResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * mediaTypeResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message);
         *    });
         * </pre>
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
            move: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                var promise = localizationService.localize('media_moveFailed');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'PostMove'), {
                    parentId: args.parentId,
                    id: args.id
                }), promise);
            },
            copy: function (args) {
                if (!args) {
                    throw 'args cannot be null';
                }
                if (!args.parentId) {
                    throw 'args.parentId cannot be null';
                }
                if (!args.id) {
                    throw 'args.id cannot be null';
                }
                var promise = localizationService.localize('media_copyFailed');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'PostCopy'), {
                    parentId: args.parentId,
                    id: args.id
                }), promise);
            },
            createContainer: function (parentId, name) {
                var promise = localizationService.localize('media_createFolderFailed', [parentId]);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'PostCreateContainer', {
                    parentId: parentId,
                    name: encodeURIComponent(name)
                })), promise);
            },
            renameContainer: function (id, name) {
                var promise = localizationService.localize('media_renameFolderFailed', [id]);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('mediaTypeApiBaseUrl', 'PostRenameContainer', {
                    id: id,
                    name: name
                })), promise);
            }
        };
    }
    angular.module('umbraco.resources').factory('mediaTypeResource', mediaTypeResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.memberResource
    * @description Loads in data for members
    **/
    function memberResource($q, $http, umbDataFormatter, umbRequestHelper) {
        /** internal method process the saving of data and post processing the result */
        function saveMember(content, action, files) {
            return umbRequestHelper.postSaveContent({
                restApiUrl: umbRequestHelper.getApiUrl('memberApiBaseUrl', 'PostSave'),
                content: content,
                action: action,
                files: files,
                dataFormatter: function (c, a) {
                    return umbDataFormatter.formatMemberPostData(c, a);
                }
            });
        }
        return {
            getPagedResults: function (memberTypeAlias, options) {
                if (memberTypeAlias === 'all-members') {
                    memberTypeAlias = null;
                }
                var defaults = {
                    pageSize: 25,
                    pageNumber: 1,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'LoginName',
                    orderBySystemField: true
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                //converts the value to a js bool
                function toBool(v) {
                    if (angular.isNumber(v)) {
                        return v > 0;
                    }
                    if (angular.isString(v)) {
                        return v === 'true';
                    }
                    if (typeof v === 'boolean') {
                        return v;
                    }
                    return false;
                }
                var params = [
                    { pageNumber: options.pageNumber },
                    { pageSize: options.pageSize },
                    { orderBy: options.orderBy },
                    { orderDirection: options.orderDirection },
                    { orderBySystemField: toBool(options.orderBySystemField) },
                    { filter: options.filter }
                ];
                if (memberTypeAlias != null) {
                    params.push({ memberTypeAlias: memberTypeAlias });
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'GetPagedResults', params)), 'Failed to retrieve member paged result');
            },
            getListNode: function (listName) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'GetListNodeDisplay', [{ listName: listName }])), 'Failed to retrieve data for member list ' + listName);
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.memberResource#getByKey
          * @methodOf umbraco.resources.memberResource
          *
          * @description
          * Gets a member item with a given key
          *
          * ##usage
          * <pre>
          * memberResource.getByKey("0000-0000-000-00000-000")
          *    .then(function(member) {
          *        var mymember = member; 
          *        alert('its here!');
          *    });
          * </pre> 
          * 
          * @param {Guid} key key of member item to return        
          * @returns {Promise} resourcePromise object containing the member item.
          *
          */
            getByKey: function (key) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'GetByKey', [{ key: key }])), 'Failed to retrieve data for member id ' + key);
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.memberResource#deleteByKey
          * @methodOf umbraco.resources.memberResource
          *
          * @description
          * Deletes a member item with a given key
          *
          * ##usage
          * <pre>
          * memberResource.deleteByKey("0000-0000-000-00000-000")
          *    .then(function() {
          *        alert('its gone!');
          *    });
          * </pre> 
          * 
          * @param {Guid} key id of member item to delete        
          * @returns {Promise} resourcePromise object.
          *
          */
            deleteByKey: function (key) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'DeleteByKey', [{ key: key }])), 'Failed to delete item ' + key);
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.memberResource#getScaffold
          * @methodOf umbraco.resources.memberResource
          *
          * @description
          * Returns a scaffold of an empty member item, given the id of the member item to place it underneath and the member type alias.
          *         
          * - Member Type alias must be provided so umbraco knows which properties to put on the member scaffold 
          * 
          * The scaffold is used to build editors for member that has not yet been populated with data.
          * 
          * ##usage
          * <pre>
          * memberResource.getScaffold('client')
          *    .then(function(scaffold) {
          *        var myDoc = scaffold;
          *        myDoc.name = "My new member item"; 
          *
          *        memberResource.save(myDoc, true)
          *            .then(function(member){
          *                alert("Retrieved, updated and saved again");
          *            });
          *    });
          * </pre> 
          * 
          * @param {String} alias membertype alias to base the scaffold on        
          * @returns {Promise} resourcePromise object containing the member scaffold.
          *
          */
            getScaffold: function (alias) {
                if (alias) {
                    return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'GetEmpty', [{ contentTypeAlias: alias }])), 'Failed to retrieve data for empty member item type ' + alias);
                } else {
                    return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberApiBaseUrl', 'GetEmpty')), 'Failed to retrieve data for empty member item type ' + alias);
                }
            },
            /**
          * @ngdoc method
          * @name umbraco.resources.memberResource#save
          * @methodOf umbraco.resources.memberResource
          *
          * @description
          * Saves changes made to a member, if the member is new, the isNew paramater must be passed to force creation
          * if the member needs to have files attached, they must be provided as the files param and passed separately 
          * 
          * 
          * ##usage
          * <pre>
          * memberResource.getBykey("23234-sd8djsd-3h8d3j-sdh8d")
          *    .then(function(member) {
          *          member.name = "Bob";
          *          memberResource.save(member, false)
          *            .then(function(member){
          *                alert("Retrieved, updated and saved again");
          *            });
          *    });
          * </pre> 
          * 
          * @param {Object} media The member item object with changes applied
          * @param {Bool} isNew set to true to create a new item or to update an existing 
          * @param {Array} files collection of files for the media item      
          * @returns {Promise} resourcePromise object containing the saved media item.
          *
          */
            save: function (member, isNew, files) {
                return saveMember(member, 'save' + (isNew ? 'New' : ''), files);
            }
        };
    }
    angular.module('umbraco.resources').factory('memberResource', memberResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.memberTypeResource
    * @description Loads in data for member types
    **/
    function memberTypeResource($q, $http, umbRequestHelper, umbDataFormatter) {
        return {
            getAvailableCompositeContentTypes: function (contentTypeId, filterContentTypes, filterPropertyTypes) {
                if (!filterContentTypes) {
                    filterContentTypes = [];
                }
                if (!filterPropertyTypes) {
                    filterPropertyTypes = [];
                }
                var query = '';
                _.each(filterContentTypes, function (item) {
                    query += 'filterContentTypes=' + item + '&';
                });
                // if filterContentTypes array is empty we need a empty variable in the querystring otherwise the service returns a error
                if (filterContentTypes.length === 0) {
                    query += 'filterContentTypes=&';
                }
                _.each(filterPropertyTypes, function (item) {
                    query += 'filterPropertyTypes=' + item + '&';
                });
                // if filterPropertyTypes array is empty we need a empty variable in the querystring otherwise the service returns a error
                if (filterPropertyTypes.length === 0) {
                    query += 'filterPropertyTypes=&';
                }
                query += 'contentTypeId=' + contentTypeId;
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'GetAvailableCompositeMemberTypes', query)), 'Failed to retrieve data for content type id ' + contentTypeId);
            },
            //return all member types
            getTypes: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'GetAllTypes')), 'Failed to retrieve data for member types id');
            },
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve content type');
            },
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete member type');
            },
            getScaffold: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'GetEmpty')), 'Failed to retrieve content type scaffold');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.memberTypeResource#save
         * @methodOf umbraco.resources.memberTypeResource
         *
         * @description
         * Saves or update a member type
         *
         * @param {Object} content data type object to create/update
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (contentType) {
                var saveModel = umbDataFormatter.formatContentTypePostData(contentType);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('memberTypeApiBaseUrl', 'PostSave'), saveModel), 'Failed to save data for member type id ' + contentType.id);
            }
        };
    }
    angular.module('umbraco.resources').factory('memberTypeResource', memberTypeResource);
    angular.module('umbraco.resources').factory('Umbraco.PropertyEditors.NestedContent.Resources', function ($q, $http, umbRequestHelper) {
        return {
            getContentTypes: function () {
                var url = Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/backoffice/UmbracoApi/NestedContent/GetContentTypes';
                return umbRequestHelper.resourcePromise($http.get(url), 'Failed to retrieve content types');
            }
        };
    });
    /**
    * @ngdoc service
    * @name umbraco.resources.ourPackageRepositoryResource
    * @description handles data for package installations
    **/
    function ourPackageRepositoryResource($q, $http, umbDataFormatter, umbRequestHelper) {
        var baseurl = Umbraco.Sys.ServerVariables.umbracoUrls.packagesRestApiBaseUrl;
        return {
            getDetails: function (packageId) {
                return umbRequestHelper.resourcePromise($http.get(baseurl + '/' + packageId + '?version=' + Umbraco.Sys.ServerVariables.application.version), 'Failed to get package details');
            },
            getCategories: function () {
                return umbRequestHelper.resourcePromise($http.get(baseurl), 'Failed to query packages');
            },
            getPopular: function (maxResults, category) {
                if (maxResults === undefined) {
                    maxResults = 10;
                }
                if (category === undefined) {
                    category = '';
                }
                return umbRequestHelper.resourcePromise($http.get(baseurl + '?pageIndex=0&pageSize=' + maxResults + '&category=' + category + '&order=Popular&version=' + Umbraco.Sys.ServerVariables.application.version), 'Failed to query packages');
            },
            search: function (pageIndex, pageSize, orderBy, category, query, canceler) {
                var httpConfig = {};
                if (canceler) {
                    httpConfig['timeout'] = canceler;
                }
                if (category === undefined) {
                    category = '';
                }
                if (query === undefined) {
                    query = '';
                }
                //order by score if there is nothing set
                var order = !orderBy ? '&order=Default' : '&order=' + orderBy;
                return umbRequestHelper.resourcePromise($http.get(baseurl + '?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&category=' + category + '&query=' + query + order + '&version=' + Umbraco.Sys.ServerVariables.application.version), httpConfig, 'Failed to query packages');
            }
        };
    }
    angular.module('umbraco.resources').factory('ourPackageRepositoryResource', ourPackageRepositoryResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.packageInstallResource
    * @description handles data for package installations
    **/
    function packageResource($q, $http, umbDataFormatter, umbRequestHelper) {
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.packageInstallResource#getInstalled
         * @methodOf umbraco.resources.packageInstallResource
         *
         * @description
         * Gets a list of installed packages       
         */
            getInstalled: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'GetInstalled')), 'Failed to get installed packages');
            },
            validateInstalled: function (name, version) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'ValidateInstalled', {
                    name: name,
                    version: version
                })), 'Failed to validate package ' + name);
            },
            deleteCreatedPackage: function (packageId) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'DeleteCreatedPackage', { packageId: packageId })), 'Failed to delete package ' + packageId);
            },
            uninstall: function (packageId) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'Uninstall', { packageId: packageId })), 'Failed to uninstall package');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.packageInstallResource#fetchPackage
         * @methodOf umbraco.resources.packageInstallResource
         *
         * @description
         * Downloads a package file from our.umbraco.com to the website server.
         * 
         * ##usage
         * <pre>
         * packageResource.download("guid-guid-guid-guid")
         *    .then(function(path) {
         *        alert('downloaded');
         *    });
         * </pre> 
         *  
         * @param {String} the unique package ID
         * @returns {String} path to the downloaded zip file.
         *
         */
            fetch: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'Fetch', [{ packageGuid: id }])), 'Failed to download package with guid ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.packageInstallResource#createmanifest
         * @methodOf umbraco.resources.packageInstallResource
         *
         * @description
         * Creates a package manifest for a given folder of files. 
         * This manifest keeps track of all installed files and data items
         * so a package can be uninstalled at a later time.
         * After creating a manifest, you can use the ID to install files and data.
         * 
         * ##usage
         * <pre>
         * packageResource.createManifest("packages/id-of-install-file")
         *    .then(function(summary) {
         *        alert('unzipped');
         *    });
         * </pre> 
         *  
         * @param {String} folder the path to the temporary folder containing files
         * @returns {Int} the ID assigned to the saved package manifest
         *
         */
            import: function (package) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'Import'), package), 'Failed to install package. Error during the step "Import" ');
            },
            installFiles: function (package) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'InstallFiles'), package), 'Failed to install package. Error during the step "InstallFiles" ');
            },
            checkRestart: function (package) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'CheckRestart'), package), 'Failed to install package. Error during the step "CheckRestart" ');
            },
            installData: function (package) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'InstallData'), package), 'Failed to install package. Error during the step "InstallData" ');
            },
            cleanUp: function (package) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('packageInstallApiBaseUrl', 'CleanUp'), package), 'Failed to install package. Error during the step "CleanUp" ');
            }
        };
    }
    angular.module('umbraco.resources').factory('packageResource', packageResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.redirectUrlResource
 * @function
 *
 * @description
 * Used by the redirect url dashboard to get urls and send requests to remove redirects.
 */
    (function () {
        'use strict';
        function redirectUrlsResource($http, umbRequestHelper) {
            /**
         * @ngdoc function
         * @name umbraco.resources.redirectUrlResource#searchRedirectUrls
         * @methodOf umbraco.resources.redirectUrlResource
         * @function
         *
         * @description
         * Called to search redirects
         * ##usage
         * <pre>
         * redirectUrlsResource.searchRedirectUrls("", 0, 20)
         *    .then(function(response) {
         *
         *    });
         * </pre>
         * @param {String} searchTerm Searh term
         * @param {Int} pageIndex index of the page to retrive items from
         * @param {Int} pageSize The number of items on a page
         */
            function searchRedirectUrls(searchTerm, pageIndex, pageSize) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('redirectUrlManagementApiBaseUrl', 'SearchRedirectUrls', {
                    searchTerm: searchTerm,
                    page: pageIndex,
                    pageSize: pageSize
                })), 'Failed to retrieve data for searching redirect urls');
            }
            /**
   * @ngdoc function
   * @name umbraco.resources.redirectUrlResource#getRedirectsForContentItem
   * @methodOf umbraco.resources.redirectUrlResource
   * @function
   *
   * @description
   * Used to retrieve RedirectUrls for a specific item of content for Information tab
   * ##usage
   * <pre>
   * redirectUrlsResource.getRedirectsForContentItem("udi:123456")
   *    .then(function(response) {
   *
   *    });
   * </pre>
   * @param {String} contentUdi identifier for the content item to retrieve redirects for
   */
            function getRedirectsForContentItem(contentUdi) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('redirectUrlManagementApiBaseUrl', 'RedirectUrlsForContentItem', { contentUdi: contentUdi })), 'Failed to retrieve redirects for content: ' + contentUdi);
            }
            function getEnableState() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('redirectUrlManagementApiBaseUrl', 'GetEnableState')), 'Failed to retrieve data to check if the 301 redirect is enabled');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.redirectUrlResource#deleteRedirectUrl
         * @methodOf umbraco.resources.redirectUrlResource
         * @function
         *
         * @description
         * Called to delete a redirect
         * ##usage
         * <pre>
         * redirectUrlsResource.deleteRedirectUrl(1234)
         *    .then(function() {
         *
         *    });
         * </pre>
         * @param {Int} id Id of the redirect
         */
            function deleteRedirectUrl(id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('redirectUrlManagementApiBaseUrl', 'DeleteRedirectUrl', { id: id })), 'Failed to remove redirect');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.redirectUrlResource#toggleUrlTracker
         * @methodOf umbraco.resources.redirectUrlResource
         * @function
         *
         * @description
         * Called to enable or disable redirect url tracker
         * ##usage
         * <pre>
         * redirectUrlsResource.toggleUrlTracker(true)
         *    .then(function() {
         *
         *    });
         * </pre>
         * @param {Bool} disable true/false to disable/enable the url tracker
         */
            function toggleUrlTracker(disable) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('redirectUrlManagementApiBaseUrl', 'ToggleUrlTracker', { disable: disable })), 'Failed to toggle redirect url tracker');
            }
            var resource = {
                searchRedirectUrls: searchRedirectUrls,
                deleteRedirectUrl: deleteRedirectUrl,
                toggleUrlTracker: toggleUrlTracker,
                getEnableState: getEnableState,
                getRedirectsForContentItem: getRedirectsForContentItem
            };
            return resource;
        }
        angular.module('umbraco.resources').factory('redirectUrlsResource', redirectUrlsResource);
    }());
    /**
  * @ngdoc service
  * @name umbraco.resources.relationResource
  * @description Handles loading of relation data
  **/
    function relationResource($q, $http, umbRequestHelper) {
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.relationResource#getByChildId
         * @methodOf umbraco.resources.relationResource
         *
         * @description
         * Retrieves the relation data for a given child ID
         * 
         * @param {int} id of the child item
         * @param {string} alias of the relation type
         * @returns {Promise} resourcePromise object containing the relations array.
         *
         */
            getByChildId: function (id, alias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('relationApiBaseUrl', 'GetByChildId', {
                    childId: id,
                    relationTypeAlias: alias
                })), 'Failed to get relation by child ID ' + id + ' and type of ' + alias);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.relationResource#deleteById
         * @methodOf umbraco.resources.relationResource
         *
         * @description
         * Deletes a relation item with a given id
         *
         * ##usage
         * <pre>
         * relationResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of relation item to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteById: function (id) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('relationApiBaseUrl', 'DeleteById', [{ id: id }])), 'Failed to delete item ' + id);
            }
        };
    }
    angular.module('umbraco.resources').factory('relationResource', relationResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.sectionResource
    * @description Loads in data for section
    **/
    function sectionResource($q, $http, umbRequestHelper) {
        /** internal method to get the tree app url */
        function getSectionsUrl(section) {
            return Umbraco.Sys.ServerVariables.sectionApiBaseUrl + 'GetSections';
        }
        //the factory object returned
        return {
            /** Loads in the data to display the section list */
            getSections: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('sectionApiBaseUrl', 'GetSections')), 'Failed to retrieve data for sections');
            },
            /** Loads in all available sections */
            getAllSections: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('sectionApiBaseUrl', 'GetAllSections')), 'Failed to retrieve data for sections');
            }
        };
    }
    angular.module('umbraco.resources').factory('sectionResource', sectionResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.stylesheetResource
    * @description service to retrieve available stylesheets
    * 
    *
    **/
    function stylesheetResource($q, $http, umbRequestHelper) {
        //the factory object returned
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.stylesheetResource#getAll
         * @methodOf umbraco.resources.stylesheetResource
         *
         * @description
         * Gets all registered stylesheets
         *
         * ##usage
         * <pre>
         * stylesheetResource.getAll()
         *    .then(function(stylesheets) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the stylesheets.
         *
         */
            getAll: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('stylesheetApiBaseUrl', 'GetAll')), 'Failed to retrieve stylesheets ');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.stylesheetResource#getRulesByName
         * @methodOf umbraco.resources.stylesheetResource
         *
         * @description
         * Returns all defined child rules for a stylesheet with a given name
         *
         * ##usage
         * <pre>
         * stylesheetResource.getRulesByName("ie7stylesheet")
         *    .then(function(rules) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the rules.
         *
         */
            getRulesByName: function (name) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('stylesheetApiBaseUrl', 'GetRulesByName', [{ name: name }])), 'Failed to retrieve stylesheets ');
            }
        };
    }
    angular.module('umbraco.resources').factory('stylesheetResource', stylesheetResource);
    /**
    * @ngdoc service
    * @name umbraco.resources.templateResource
    * @description Loads in data for templates
    **/
    function templateResource($q, $http, umbDataFormatter, umbRequestHelper, localizationService) {
        return {
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#getById
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Gets a template item with a given id
         *
         * ##usage
         * <pre>
         * templateResource.getById(1234)
         *    .then(function(template) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {Int} id id of template to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
            getById: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'GetById', [{ id: id }])), 'Failed to retrieve data for template id ' + id);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#getByAlias
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Gets a template item with a given alias
         *
         * ##usage
         * <pre>
         * templateResource.getByAlias("upload")
         *    .then(function(template) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @param {String} alias Alias of template to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
            getByAlias: function (alias) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'GetByAlias', [{ alias: alias }])), 'Failed to retrieve data for template with alias: ' + alias);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#getAll
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Gets all templates
         *
         * ##usage
         * <pre>
         * templateResource.getAll()
         *    .then(function(templates) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object.
         *
         */
            getAll: function () {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'GetAll')), 'Failed to retrieve data');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#getScaffold
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Returns a scaffold of an empty template item
         *
         * The scaffold is used to build editors for templates that has not yet been populated with data.
         *
         * ##usage
         * <pre>
         * templateResource.getScaffold()
         *    .then(function(template) {
         *        alert('its here!');
         *    });
         * </pre>
         *
         * @returns {Promise} resourcePromise object containing the template scaffold.
         *
         */
            getScaffold: function (id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'GetScaffold', [{ id: id }])), 'Failed to retrieve data for empty template');
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#deleteById
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Deletes a template with a given id
         *
         * ##usage
         * <pre>
         * templateResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre>
         *
         * @param {Int} id id of template to delete
         * @returns {Promise} resourcePromise object.
         *
         */
            deleteById: function (id) {
                var promise = localizationService.localize('template_deleteByIdFailed', [id]);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'DeleteById', [{ id: id }])), promise);
            },
            /**
         * @ngdoc method
         * @name umbraco.resources.templateResource#save
         * @methodOf umbraco.resources.templateResource
         *
         * @description
         * Saves or update a template
         * 
         * ##usage
         * <pre>
         * templateResource.save(template)
         *    .then(function(template) {
         *        alert('its saved!');
         *    });
         * </pre>
         *
         * @param {Object} template object to save
         * @returns {Promise} resourcePromise object.
         *
         */
            save: function (template) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('templateApiBaseUrl', 'PostSave'), template), 'Failed to save data for template id ' + template.id);
            }
        };
    }
    angular.module('umbraco.resources').factory('templateResource', templateResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.templateQueryResource
 * @function
 *
 * @description
 * Used by the query builder
 */
    (function () {
        'use strict';
        function templateQueryResource($http, umbRequestHelper) {
            /**
         * @ngdoc function
         * @name umbraco.resources.templateQueryResource#getAllowedProperties
         * @methodOf umbraco.resources.templateQueryResource
         * @function
         *
         * @description
         * Called to get allowed properties
         * ##usage
         * <pre>
         * templateQueryResource.getAllowedProperties()
         *    .then(function(response) {
         *
         *    });
         * </pre>
         */
            function getAllowedProperties() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateQueryApiBaseUrl', 'GetAllowedProperties')), 'Failed to retrieve properties');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.templateQueryResource#getContentTypes
         * @methodOf umbraco.resources.templateQueryResource
         * @function
         *
         * @description
         * Called to get content types
         * ##usage
         * <pre>
         * templateQueryResource.getContentTypes()
         *    .then(function(response) {
         *
         *    });
         * </pre>
         */
            function getContentTypes() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateQueryApiBaseUrl', 'GetContentTypes')), 'Failed to retrieve content types');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.templateQueryResource#getFilterConditions
         * @methodOf umbraco.resources.templateQueryResource
         * @function
         *
         * @description
         * Called to the filter conditions
         * ##usage
         * <pre>
         * templateQueryResource.getFilterConditions()
         *    .then(function(response) {
         *
         *    });
         * </pre>
         */
            function getFilterConditions() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('templateQueryApiBaseUrl', 'GetFilterConditions')), 'Failed to retrieve filter conditions');
            }
            /**
         * @ngdoc function
         * @name umbraco.resources.templateQueryResource#postTemplateQuery
         * @methodOf umbraco.resources.templateQueryResource
         * @function
         *
         * @description
         * Called to get content types
         * ##usage
         * <pre>
         * var query = {
         *     contentType: {
         *         name: "Everything"
         *      },
         *      source: {
         *          name: "My website"
         *      },
         *      filters: [
         *          {
         *              property: undefined,
         *              operator: undefined
         *          }
         *      ],
         *      sort: {
         *          property: {
         *              alias: "",
         *              name: "",
         *          },
         *          direction: "ascending"
         *      }
         *  };
         * 
         * templateQueryResource.postTemplateQuery(query)
         *    .then(function(response) {
         *
         *    });
         * </pre>
         * @param {object} query Query to build result
         */
            function postTemplateQuery(query) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('templateQueryApiBaseUrl', 'PostTemplateQuery'), query), 'Failed to retrieve query');
            }
            var resource = {
                getAllowedProperties: getAllowedProperties,
                getContentTypes: getContentTypes,
                getFilterConditions: getFilterConditions,
                postTemplateQuery: postTemplateQuery
            };
            return resource;
        }
        angular.module('umbraco.resources').factory('templateQueryResource', templateQueryResource);
    }());
    /**
 * @ngdoc service
 * @name umbraco.resources.usersResource
 * @function
 *
 * @description
 * Used by the users section to get users and send requests to create, invite, delete, etc. users.
 */
    (function () {
        'use strict';
        function tourResource($http, umbRequestHelper, $q, umbDataFormatter) {
            function getTours() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('tourApiBaseUrl', 'GetTours')), 'Failed to get tours');
            }
            var resource = { getTours: getTours };
            return resource;
        }
        angular.module('umbraco.resources').factory('tourResource', tourResource);
    }());
    /**
    * @ngdoc service
    * @name umbraco.resources.treeResource
    * @description Loads in data for trees
    **/
    function treeResource($q, $http, umbRequestHelper) {
        /** internal method to get the tree node's children url */
        function getTreeNodesUrl(node) {
            if (!node.childNodesUrl) {
                throw 'No childNodesUrl property found on the tree node, cannot load child nodes';
            }
            return node.childNodesUrl;
        }
        /** internal method to get the tree menu url */
        function getTreeMenuUrl(node) {
            if (!node.menuUrl) {
                return null;
            }
            return node.menuUrl;
        }
        //the factory object returned
        return {
            /** Loads in the data to display the nodes menu */
            loadMenu: function (node) {
                var treeMenuUrl = getTreeMenuUrl(node);
                if (treeMenuUrl !== undefined && treeMenuUrl !== null && treeMenuUrl.length > 0) {
                    return umbRequestHelper.resourcePromise($http.get(getTreeMenuUrl(node)), 'Failed to retrieve data for a node\'s menu ' + node.id);
                } else {
                    return $q.reject({ errorMsg: 'No tree menu url defined for node ' + node.id });
                }
            },
            /** Loads in the data to display the nodes for an application */
            loadApplication: function (options) {
                if (!options || !options.section) {
                    throw 'The object specified for does not contain a \'section\' property';
                }
                if (!options.tree) {
                    options.tree = '';
                }
                if (!options.isDialog) {
                    options.isDialog = false;
                }
                //create the query string for the tree request, these are the mandatory options:
                var query = 'application=' + options.section + '&tree=' + options.tree + '&isDialog=' + options.isDialog;
                //if you need to load a not initialized tree set this value to false - default is true
                if (options.onlyinitialized) {
                    query += '&onlyInitialized=' + options.onlyinitialized;
                }
                //the options can contain extra query string parameters
                if (options.queryString) {
                    query += '&' + options.queryString;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('treeApplicationApiBaseUrl', 'GetApplicationTrees', query)), 'Failed to retrieve data for application tree ' + options.section);
            },
            /** Loads in the data to display the child nodes for a given node */
            loadNodes: function (options) {
                if (!options || !options.node) {
                    throw 'The options parameter object does not contain the required properties: \'node\'';
                }
                return umbRequestHelper.resourcePromise($http.get(getTreeNodesUrl(options.node)), 'Failed to retrieve data for child nodes ' + options.node.nodeId);
            }
        };
    }
    angular.module('umbraco.resources').factory('treeResource', treeResource);
    /**
 * @ngdoc service
 * @name umbraco.resources.usersResource
 * @function
 *
 * @description
 * Used by the users section to get users and send requests to create, invite, delete, etc. users.
 */
    (function () {
        'use strict';
        function userGroupsResource($http, umbRequestHelper, $q, umbDataFormatter) {
            function getUserGroupScaffold() {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('userGroupsApiBaseUrl', 'GetEmptyUserGroup')), 'Failed to get the user group scaffold');
            }
            function saveUserGroup(userGroup, isNew) {
                if (!userGroup) {
                    throw 'userGroup not specified';
                }
                //need to convert the user data into the correctly formatted save data - it is *not* the same and we don't want to over-post
                var formattedSaveData = umbDataFormatter.formatUserGroupPostData(userGroup, 'save' + (isNew ? 'New' : ''));
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userGroupsApiBaseUrl', 'PostSaveUserGroup'), formattedSaveData), 'Failed to save user group');
            }
            function getUserGroup(id) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('userGroupsApiBaseUrl', 'GetUserGroup', { id: id })), 'Failed to retrieve data for user group ' + id);
            }
            function getUserGroups(args) {
                if (!args) {
                    args = { onlyCurrentUserGroups: true };
                }
                if (args.onlyCurrentUserGroups === undefined || args.onlyCurrentUserGroups === null) {
                    args.onlyCurrentUserGroups = true;
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('userGroupsApiBaseUrl', 'GetUserGroups', args)), 'Failed to retrieve user groups');
            }
            function deleteUserGroups(userGroupIds) {
                var query = 'userGroupIds=' + userGroupIds.join('&userGroupIds=');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userGroupsApiBaseUrl', 'PostDeleteUserGroups', query)), 'Failed to delete user groups');
            }
            var resource = {
                saveUserGroup: saveUserGroup,
                getUserGroup: getUserGroup,
                getUserGroups: getUserGroups,
                getUserGroupScaffold: getUserGroupScaffold,
                deleteUserGroups: deleteUserGroups
            };
            return resource;
        }
        angular.module('umbraco.resources').factory('userGroupsResource', userGroupsResource);
    }());
    /**
 * @ngdoc service
 * @name umbraco.resources.usersResource
 * @function
 *
 * @description
 * Used by the users section to get users and send requests to create, invite, disable, etc. users.
 */
    (function () {
        'use strict';
        function usersResource($http, umbRequestHelper, $q, umbDataFormatter) {
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#clearAvatar
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Deletes the user avatar
          *
          * ##usage
          * <pre>
          * usersResource.clearAvatar(1)
          *    .then(function() {
          *        alert("avatar is gone");
          *    });
          * </pre>
          * 
          * @param {Array} id id of user.
          * @returns {Promise} resourcePromise object.
          *
          */
            function clearAvatar(userId) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostClearAvatar', { id: userId })), 'Failed to clear the user avatar ' + userId);
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#disableUsers
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Disables a collection of users
          *
          * ##usage
          * <pre>
          * usersResource.disableUsers([1, 2, 3, 4, 5])
          *    .then(function() {
          *        alert("users were disabled");
          *    });
          * </pre>
          * 
          * @param {Array} ids ids of users to disable.
          * @returns {Promise} resourcePromise object.
          *
          */
            function disableUsers(userIds) {
                if (!userIds) {
                    throw 'userIds not specified';
                }
                //we need to create a custom query string for the usergroup array, so create it now and we can append the user groups if needed
                var qry = 'userIds=' + userIds.join('&userIds=');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostDisableUsers', qry)), 'Failed to disable the users ' + userIds.join(','));
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#enableUsers
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Enables a collection of users
          *
          * ##usage
          * <pre>
          * usersResource.enableUsers([1, 2, 3, 4, 5])
          *    .then(function() {
          *        alert("users were enabled");
          *    });
          * </pre>
          * 
          * @param {Array} ids ids of users to enable.
          * @returns {Promise} resourcePromise object.
          *
          */
            function enableUsers(userIds) {
                if (!userIds) {
                    throw 'userIds not specified';
                }
                //we need to create a custom query string for the usergroup array, so create it now and we can append the user groups if needed
                var qry = 'userIds=' + userIds.join('&userIds=');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostEnableUsers', qry)), 'Failed to enable the users ' + userIds.join(','));
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#unlockUsers
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Unlocks a collection of users
          *
          * ##usage
          * <pre>
          * usersResource.unlockUsers([1, 2, 3, 4, 5])
          *    .then(function() {
          *        alert("users were unlocked");
          *    });
          * </pre>
          * 
          * @param {Array} ids ids of users to unlock.
          * @returns {Promise} resourcePromise object.
          *
          */
            function unlockUsers(userIds) {
                if (!userIds) {
                    throw 'userIds not specified';
                }
                //we need to create a custom query string for the usergroup array, so create it now and we can append the user groups if needed
                var qry = 'userIds=' + userIds.join('&userIds=');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostUnlockUsers', qry)), 'Failed to enable the users ' + userIds.join(','));
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#setUserGroupsOnUsers
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Overwrites the existing user groups on a collection of users
          *
          * ##usage
          * <pre>
          * usersResource.setUserGroupsOnUsers(['admin', 'editor'], [1, 2, 3, 4, 5])
          *    .then(function() {
          *        alert("users were updated");
          *    });
          * </pre>
          * 
          * @param {Array} userGroupAliases aliases of user groups.
          * @param {Array} ids ids of users to update.
          * @returns {Promise} resourcePromise object.
          *
          */
            function setUserGroupsOnUsers(userGroups, userIds) {
                var userGroupAliases = userGroups.map(function (o) {
                    return o.alias;
                });
                var query = 'userGroupAliases=' + userGroupAliases.join('&userGroupAliases=') + '&userIds=' + userIds.join('&userIds=');
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostSetUserGroupsOnUsers', query)), 'Failed to set user groups ' + userGroupAliases.join(',') + ' on the users ' + userIds.join(','));
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#getPagedResults
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Get users
          *
          * ##usage
          * <pre>
          * usersResource.getPagedResults({pageSize: 10, pageNumber: 2})
          *    .then(function(data) {
          *        var users = data.items;
          *        alert('they are here!');
          *    });
          * </pre>
          * 
          * @param {Object} options optional options object
          * @param {Int} options.pageSize if paging data, number of users per page, default = 25
          * @param {Int} options.pageNumber if paging data, current page index, default = 1
          * @param {String} options.filter if provided, query will only return those with names matching the filter
          * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
          * @param {String} options.orderBy property to order users by, default: `Username`
          * @param {Array} options.userGroups property to filter users by user group
          * @param {Array} options.userStates property to filter users by user state
          * @returns {Promise} resourcePromise object containing an array of content items.
          *
          */
            function getPagedResults(options) {
                var defaults = {
                    pageSize: 25,
                    pageNumber: 1,
                    filter: '',
                    orderDirection: 'Ascending',
                    orderBy: 'Username',
                    userGroups: [],
                    userStates: []
                };
                if (options === undefined) {
                    options = {};
                }
                //overwrite the defaults if there are any specified
                angular.extend(defaults, options);
                //now copy back to the options we will use
                options = defaults;
                //change asc/desct
                if (options.orderDirection === 'asc') {
                    options.orderDirection = 'Ascending';
                } else if (options.orderDirection === 'desc') {
                    options.orderDirection = 'Descending';
                }
                var params = {
                    pageNumber: options.pageNumber,
                    pageSize: options.pageSize,
                    orderBy: options.orderBy,
                    orderDirection: options.orderDirection,
                    filter: options.filter
                };
                //we need to create a custom query string for the usergroup array, so create it now and we can append the user groups if needed
                var qry = umbRequestHelper.dictionaryToQueryString(params);
                if (options.userGroups.length > 0) {
                    //we need to create a custom query string for an array
                    qry += '&userGroups=' + options.userGroups.join('&userGroups=');
                }
                if (options.userStates.length > 0) {
                    //we need to create a custom query string for an array
                    qry += '&userStates=' + options.userStates.join('&userStates=');
                }
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('userApiBaseUrl', 'GetPagedUsers', qry)), 'Failed to retrieve users paged result');
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#getUser
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Gets a user
          *
          * ##usage
          * <pre>
          * usersResource.getUser(1)
          *    .then(function(user) {
          *        alert("It's here");
          *    });
          * </pre>
          * 
          * @param {Int} userId user id.
          * @returns {Promise} resourcePromise object containing the user.
          *
          */
            function getUser(userId) {
                return umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl('userApiBaseUrl', 'GetById', { id: userId })), 'Failed to retrieve data for user ' + userId);
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#createUser
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Creates a new user
          *
          * ##usage
          * <pre>
          * usersResource.createUser(user)
          *    .then(function(newUser) {
          *        alert("It's here");
          *    });
          * </pre>
          * 
          * @param {Object} user user to create
          * @returns {Promise} resourcePromise object containing the new user.
          *
          */
            function createUser(user) {
                if (!user) {
                    throw 'user not specified';
                }
                //need to convert the user data into the correctly formatted save data - it is *not* the same and we don't want to over-post
                var formattedSaveData = umbDataFormatter.formatUserPostData(user);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostCreateUser'), formattedSaveData), 'Failed to save user');
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#inviteUser
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Creates and sends an email invitation to a new user
          *
          * ##usage
          * <pre>
          * usersResource.inviteUser(user)
          *    .then(function(newUser) {
          *        alert("It's here");
          *    });
          * </pre>
          * 
          * @param {Object} user user to invite
          * @returns {Promise} resourcePromise object containing the new user.
          *
          */
            function inviteUser(user) {
                if (!user) {
                    throw 'user not specified';
                }
                //need to convert the user data into the correctly formatted save data - it is *not* the same and we don't want to over-post
                var formattedSaveData = umbDataFormatter.formatUserPostData(user);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostInviteUser'), formattedSaveData), 'Failed to invite user');
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#saveUser
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Saves a user
          *
          * ##usage
          * <pre>
          * usersResource.saveUser(user)
          *    .then(function(updatedUser) {
          *        alert("It's here");
          *    });
          * </pre>
          * 
          * @param {Object} user object to save
          * @returns {Promise} resourcePromise object containing the updated user.
          *
          */
            function saveUser(user) {
                if (!user) {
                    throw 'user not specified';
                }
                //need to convert the user data into the correctly formatted save data - it is *not* the same and we don't want to over-post
                var formattedSaveData = umbDataFormatter.formatUserPostData(user);
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostSaveUser'), formattedSaveData), 'Failed to save user');
            }
            /**
          * @ngdoc method
          * @name umbraco.resources.usersResource#deleteNonLoggedInUser
          * @methodOf umbraco.resources.usersResource
          *
          * @description
          * Deletes a user that hasn't already logged in (and hence we know has made no content updates that would create related records)
          *
          * ##usage
          * <pre>
          * usersResource.deleteNonLoggedInUser(1)
          *    .then(function() {
          *        alert("user was deleted");
          *    });
          * </pre>
          * 
          * @param {Int} userId user id.
          * @returns {Promise} resourcePromise object.
          *
          */
            function deleteNonLoggedInUser(userId) {
                return umbRequestHelper.resourcePromise($http.post(umbRequestHelper.getApiUrl('userApiBaseUrl', 'PostDeleteNonLoggedInUser', { id: userId })), 'Failed to delete the user ' + userId);
            }
            var resource = {
                disableUsers: disableUsers,
                enableUsers: enableUsers,
                unlockUsers: unlockUsers,
                setUserGroupsOnUsers: setUserGroupsOnUsers,
                getPagedResults: getPagedResults,
                getUser: getUser,
                createUser: createUser,
                inviteUser: inviteUser,
                saveUser: saveUser,
                deleteNonLoggedInUser: deleteNonLoggedInUser,
                clearAvatar: clearAvatar
            };
            return resource;
        }
        angular.module('umbraco.resources').factory('usersResource', usersResource);
    }());
}());