///<reference path="typings/angular.d.ts" />
///<reference path="typings/manoirApp.d.ts" />
///<reference path="typings/angular-sanitize.d.ts" />
///<reference path="typings/angular-animate.d.ts" />
///<reference path="typings/signalr/index.d.ts" />
///<reference path="typings/manoirApp.d.ts" />
var Manoir;
(function (Manoir) {
    var SecurityApp;
    (function (SecurityApp) {
        class DefaultPage extends Manoir.Common.ManoirAppPage {
            constructor($scope, $http, $timeout) {
                super();
                this.scope = $scope;
                this.http = $http;
                this.$timeout = $timeout;
                this.scope.Events = this;
                this.scope.Loading = true;
                this.scope.isAdding = false;
                let self = this;
                this.init();
                this.RefreshData();
                setInterval(function () { self.RefreshData(); }, 5000);
            }
            init() {
                this.connection = new signalR.HubConnectionBuilder()
                    .withUrl("/hubs/1.0/appanddevices")
                    .withAutomaticReconnect()
                    .build();
                this.connection.on("notifyMeshChange", this.onMeshChange);
                this.connection.start().catch(err => console.error(err));
                try {
                    super.checkLogin(true);
                }
                catch (e) {
                    document.location.reload(true);
                }
            }
            onMeshChange(changeType, mesh) {
                console.log(mesh);
            }
            RefreshData() {
                let self = this;
                let sc = self.scope;
                let url = "api/presence?ts=" + (new Date).getTime();
                fetch(url)
                    .then(res => res.json())
                    .then(json => {
                    sc.currentPresence = json;
                    self.updateUsersFromPresence(sc.allUsers, sc.currentPresence);
                    sc.Loading = false;
                    sc.$applyAsync(function () { });
                });
                url = "api/users?ts=" + (new Date).getTime();
                fetch(url)
                    .then(res => res.json())
                    .then(json => {
                    sc.allUsers = json;
                    self.updateUsersFromPresence(sc.allUsers, sc.currentPresence);
                    sc.$applyAsync(function () { });
                });
            }
            startAddPresence() {
                let self = this;
                let sc = self.scope;
                sc.isAdding = true;
                sc.$applyAsync(function () { });
            }
            stopAddPresence() {
                let self = this;
                let sc = self.scope;
                sc.isAdding = false;
                sc.$applyAsync(function () { });
            }
            addPresence(user) {
                let self = this;
                let sc = self.scope;
                sc.isAdding = false;
                sc.Loading = true;
                sc.$applyAsync(function () { });
                let url = "api/presence/add/" + user.id + "?ts=" + (new Date).getTime();
                fetch(url)
                    .then(res => res.json())
                    .then(json => {
                    sc.currentPresence = json;
                    self.updateUsersFromPresence(sc.allUsers, sc.currentPresence);
                    sc.$applyAsync(function () { });
                });
            }
            startRemovePresence(user) {
                let self = this;
                let sc = self.scope;
                sc.currentSelectedPresence = user;
                sc.$applyAsync(function () { });
            }
            stopRemovePresence() {
                let self = this;
                let sc = self.scope;
                sc.currentSelectedPresence = null;
                sc.$applyAsync(function () { });
            }
            removePresence(user) {
                let self = this;
                let sc = self.scope;
                if (user == null)
                    user = sc.currentSelectedPresence;
                sc.isAdding = false;
                sc.Loading = true;
                sc.currentSelectedPresence = null;
                sc.$applyAsync(function () { });
                let url = "api/presence/remove/" + user.userId + "?ts=" + (new Date).getTime();
                fetch(url)
                    .then(res => res.json())
                    .then(json => {
                    sc.currentPresence = json;
                    self.updateUsersFromPresence(sc.allUsers, sc.currentPresence);
                    sc.$applyAsync(function () { });
                });
            }
            updateUsersFromPresence(users, pres) {
                if (users == null || pres == null)
                    return;
                for (var i = 0; i < users.length; i++) {
                    var found = false;
                    for (var p = 0; p < pres.mainUsers.length; p++) {
                        if (users[i].id == pres.mainUsers[p].userId)
                            found = true;
                    }
                    for (var p = 0; p < pres.guests.length; p++) {
                        if (users[i].id == pres.guests[p].userId)
                            found = true;
                    }
                    users[i].alreadyPresent = found;
                }
            }
        }
        SecurityApp.DefaultPage = DefaultPage;
    })(SecurityApp = Manoir.SecurityApp || (Manoir.SecurityApp = {}));
})(Manoir || (Manoir = {}));
var theApp = angular.module('SecurityApp', []);
theApp.controller('DefaultPage', Manoir.SecurityApp.DefaultPage);
theApp.filter('trustAsHtml', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html);
    };
});
//# sourceMappingURL=SecurityApp.js.map