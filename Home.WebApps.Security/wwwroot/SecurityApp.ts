///<reference path="typings/angular.d.ts" />
///<reference path="typings/manoirApp.d.ts" />
///<reference path="typings/angular-sanitize.d.ts" />
///<reference path="typings/angular-animate.d.ts" />
///<reference path="typings/signalr/index.d.ts" />
///<reference path="typings/manoirApp.d.ts" />

module Manoir.SecurityApp {

    interface IDefaultPageScope extends ng.IScope {
        Loading: boolean;
        currentPresence: Presence;
        allUsers: User[];

        currentSelectedPresence: UserPresent;
        isAdding: boolean;

    }

    interface User {
        id: string;
        firstName: string;
        name: string;
        avatar: UserImage;

        alreadyPresent: boolean;
    }
    interface UserImage {
        urlSquareSmall: string;
    }

    interface UserPresent {
        userId: string;
        userFirstName: string;
        userName: string;
        imageUrl: string;
    }

    interface Presence {
        mainUsers: UserPresent[];
        guests: UserPresent[];
        privacyModeActivated: boolean;
    }

    export class DefaultPage extends Manoir.Common.ManoirAppPage {
        connection: signalR.HubConnection;

        scope: IDefaultPageScope;
        $timeout: ng.ITimeoutService;
        http: any;
        constructor($scope: IDefaultPageScope, $http: any, $timeout: ng.ITimeoutService) {
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

        private init() {
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
                (document.location as any).reload(true);
            }
        }

        private onMeshChange(changeType: string, mesh: any) : void {
            console.log(mesh);
        }

       

        public RefreshData(): void {
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

        public startAddPresence() {
            let self = this;
            let sc = self.scope;
            sc.isAdding = true;
            sc.$applyAsync(function () { });
        }

        public stopAddPresence() {
            let self = this;
            let sc = self.scope;
            sc.isAdding = false;
            sc.$applyAsync(function () { });
        }

        public addPresence(user: User) {
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

        public startRemovePresence(user: UserPresent) {
            let self = this;
            let sc = self.scope;
            sc.currentSelectedPresence = user;
            sc.$applyAsync(function () { });
        }

        public stopRemovePresence() {
            let self = this;
            let sc = self.scope;
            sc.currentSelectedPresence = null;
            sc.$applyAsync(function () { });
        }

        public removePresence(user: UserPresent) {


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

        private updateUsersFromPresence(users: Array<User>, pres: Presence) {
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
}

var theApp = angular.module('SecurityApp', []);

theApp.controller('DefaultPage', Manoir.SecurityApp.DefaultPage);
theApp.filter('trustAsHtml', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html);
    }
});

