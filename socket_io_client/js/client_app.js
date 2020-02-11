// HELPER FUNCTIONS
//var log = console.log;
function getScopeOfCtrl(ctrlName) { return angular.element(document.querySelector("[ng-controller=" + ctrlName + "]")).scope(); }
function applyToCtrlScope(ctrlName, fn) { getScopeOfCtrl(ctrlName).$applyAsync(fn); }

// SOCKET EVENTS
var socket;
//var socket = io();
function bindSocketEvents($scope, $timeout) {
    socket.on('myNewConnection', function (data) {
        console.log(data);
        var thisChatInfo = {
            chatId: data.chatId,
            userId: data.userId,
            userName: $scope.userName
        };
        // put chat info to local storage logic (to be able to restore userId on re-connect) (BUT only for the same chat session)
        if (typeof localStorage.myPrevChatInfo === "undefined") {
            localStorage.myPrevChatInfo = JSON.stringify(thisChatInfo); // update local storage
        } else {
            var prevChatInfo = JSON.parse(localStorage.myPrevChatInfo); //console.log("prevChatInfo:", prevChatInfo);
            if (prevChatInfo.chatId === data.chatId) { // IT MEANS; we have been to this chat session before
                data.userId = prevChatInfo.userId; // SO; we restore the previous userId (to be able to own our previous messages on the chat)
                prevChatInfo.userName = $scope.userName;
                localStorage.myPrevChatInfo = JSON.stringify(prevChatInfo); // update prevChatInfo's user name only (in case user may enter a different name)
            } else { // we have been to a chat before BUT this is a complete new chat session
                localStorage.myPrevChatInfo = JSON.stringify(thisChatInfo); // update local storage again
            }
        }
        applyToCtrlScope('mySocketIOClientCtrl', function (scope) {
            scope.me = {
                id: data.userId,
                userName: $scope.userName
            };
            socket.emit('addUser', scope.me);
        });
    });

    socket.on('newConnection', function (data) {
        console.log(data);
    });

    socket.on('addTyper', function (who) {
        //console.log(who);
        applyToCtrlScope('mySocketIOClientCtrl', function (scope) {
            scope.typers.push(who);
        });
    });

    socket.on('removeTyper', function (who) {
        //console.log(who);
        applyToCtrlScope('mySocketIOClientCtrl', function (scope) {
            var foundIndex;
            for (var i = 0; i < scope.typers.length; i++) {
                if (scope.typers[i].id == who.id) { foundIndex = i; }
            }
            scope.typers.splice(foundIndex, 1); // delete typer from the list
        });
    });

    socket.on('messageList', function (data) {
        console.log(data);
        applyToCtrlScope('mySocketIOClientCtrl', function (scope) {
            scope.messages = data.messages;
            $timeout(function () { $("#messages-wrapper").scrollTop(1000000000); });
        });
    });

    socket.on('userList', function (data) {
        console.log(data);
        applyToCtrlScope('mySocketIOClientCtrl', function (scope) {
            scope.userList = data.userList;
        });
    });
}

// ANGULAR JS APP
var app = angular.module("frtSocketIOChatClient", []).controller("mySocketIOClientCtrl", ["$scope", "$timeout", function ($scope, $timeout) {

    $scope.typers = []; // list of typing users

    $scope.step = 1;
    if (typeof localStorage.myPrevChatInfo !== "undefined") {
        var prevChatInfo = JSON.parse(localStorage.myPrevChatInfo); console.log("prevChatInfo:", prevChatInfo);
        $scope.userName = prevChatInfo.userName;
    }
    $("input[ng-model=userName]").focus();
    $scope.letMeIn = function () {
        if (!$scope.userName) { return; }
        //console.log("letMeIn function fired!");

        socket = io(); // initialize my socket connection
        if (socket) bindSocketEvents($scope, $timeout); // if socket was initialized properly, bind socket event handlers

        $scope.step = 2;
        $scope.messageText = '';
        $timeout(function () { $("input[ng-model=messageText]").focus(); });
    }

    // my typing status controls
    var typing = false, typingTimeout;
    function myTypingStarted() { // switch to typing=true state
        typing = true;
        socket.emit('typingStarted', $scope.me);
    }
    function myTypingCountinues() { // renew the timeout (extend it)
        $timeout.cancel(typingTimeout);
        typingTimeout = $timeout(myTypingEnded, 6000);
    }
    function myTypingEnded() { // switch to typing=false state & clear the timeout & announce to others that your typing is ended
        typing = false;
        $timeout.cancel(typingTimeout);
        socket.emit('typingEnded', $scope.me);
    }
    $scope.messageBoxKeydown = function (e) {
        //console.log(e);
        if (e.which != 13) {
            if (!typing) {
                myTypingStarted();
            }
            myTypingCountinues();
        } else { // enter key press
            $scope.messageSend();
        }
    }

    $scope.messageSend = function () {
        if (!$scope.messageText) { return; }

        socket.emit('messageSent', {
            senderUserName: $scope.me.userName,
            senderUserId: $scope.me.id,
            messageText: $scope.messageText,
            messageTimestamp: Date.now()
        });
        $scope.messageText = null;

        // messageSend means typingEnded too, so clear typing state
        myTypingEnded();
    }

    $scope.exitChat = function () {
        if(confirm("Seriously!? U wanna get outta the room ?\n\nC'moon! We're cool as hell man! 😎")){
            myTypingEnded(); // to fix bug on exiting room while you're typing
            socket.disconnect();
            $scope.step = 1;
            var prevChatInfo = JSON.parse(localStorage.myPrevChatInfo);
            $scope.userName = prevChatInfo.userName || '';
            $timeout(function () { $("input[ng-model=userName]").focus(); });
        }
    }

}]);