var ampersandModel = require('ampersand-model'),
    uuid = require('node-uuid'),
    _ = require('lodash');

module.exports = ampersandModel.extend({

    initialize: function(opts) {
        var self = this;

        self.username = opts.username || uuid.v4();
        self.createSocket();
    },

    createSocket: function() {
        var self = this,
            socket = self.socket = new Peer(self.username, {  // register w/ peer.js
                key: 'lwjd5qra8257b9'
            });

        // send available to connectTo
        socket.on('open', function() {
            self.trigger('socket:open');
        });

        // setup handlers (when someone connects to you)
        socket.on('connection', function(conn) {
            conn.on('open', function() {
                self.trigger('connection:open', conn);

                // incoming data events
                conn.on('data', self.onData.bind(self));

                // send an ack
                conn.send('Hey, ' + conn.peer);
            });
        });
    },

    onData: function(data) {
        var self = this;

        self.trigger("connection:data", {
            data: data
        });
    },

    connectToPeers: function(peers) {
        var self = this;

        return _.map(peers, function(peer) {
            self.connectToPeer(peer);
        });
    },

    connectToPeer: function(peer) {
        var self = this,
            connection = self.connect(peer);

        connection.on('open', function () {
            self.trigger('connection:open', connection);

            connection.on('data', function (data) {
                self.trigger("connection:data", {
                    connection: connection,
                    data: data
                });
            });

            connection.on('close', function () {
                self.trigger('connection:close');
            });

            // announce
            connection.send('Whattup!!');
        });

        return connection;
    },

    leaveRoom: function() {
        var self = this;

        // goodbye world
        self.trigger('socket:closed', self.socket.peer);
        self.socket.destroy();
    },

    getPeers: function() {
        var self = this;

        return _.keys(self.socket.connections);
    },

    removePeer:  $.noop,

    extraProperties: 'allow'
});
