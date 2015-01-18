(function(root) {
    'use strict';

    /* The topics data structure as followings:
        {
            'first': [{
                token: 'pubsub_uuid_0',
                callback: func1 
            },{
                token: 'pubsub_uuid_1',
                callback: func2
            }],
            'two': [{
                token: 'pubsub_uuid_3',
                callback: func3
            },{
                token: 'pubsub_uuid_4',
                callback: func4
            }],  
        }
    */
   
    var topics = {},
        uuid = -1,
        pubsub;

    function getMatchedSubscribers(topicName) {
        if (typeof topicName !== 'string' || !topics[topicName]) {
            return null;
        }

        var matchedTopics = [];

        // Support topic namespace 
        for (m in topics) {
            if (m === topicName) {
                matchedTopics.push(topics[m]);
            } else if (m.indexOf(topicName + '.') > -1) {
                matchedTopics.push(topics[m]);
            }
        }

        if (matchedTopics.length > 0) {
            return matchedTopics;
        } else {
            return null;
        }
    }

    pubsub = {
        /**
         * Publish a topic with event data.
         * @param  {String} topicName   The topic name.
         * @param  {Object} args        Event data.
         * @return {Boolean}            Publish succeed or not.
         */
        publish: function(topicName, args) {
            var matchedSubscribers = getMatchedSubscribers(topicName),
                len = matchedSubscribers ? matchedSubscribers.length : 0,
                subscribers,
                subLen;

            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    subscribers = matchedSubscribers[i];
                    subLen = subscribers ? subscribers.length : 0;

                    for (var j = 0; j < subLen; j++) {
                        subscribers[j].callback(topicName, args);
                    }
                }
            }

            return true;
        },
        /**
         * Subscribe a topic and handle callback.
         * @param  {String}   topicName The topic name.
         * @param  {Function} callback  The callback handler for topic.
         * @return {String}             The topic token.
         */
        subscribe: function(topicName, callback) {
            if (!topics[topicName]) {
                topics[topicName] = [];
            }

            var token = 'pubsub_uuid_' + (++uuid);
            topics[topicName].push({
                token: token,
                callback: callback
            });

            return token;
        },
        /**
         * Unsubscribe topic by topic name or token.
         * @param  {String} value Topic name or token.
         * @return {Boolean}      Unsubscribe succeed or not.
         */
        unsubscribe: function(value) {
            var isTopic = typeof value === 'string' && topics.hasOwnProperty(value),
                isToken = !isTopic && typeof value === 'string';

            if (isTopic) {
                delete topics[value];
                return true;
            }

            if (isToken) {
                for (m in topics) {
                    if (topics[m]) {
                        for (var i = 0, j = topics[m].length; i < j; i++) {
                            if (topics[m][i].token === value) {
                                topics[m].splice(i, 1);
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        },
        /**
         * Remove all topics.
         */
        clear: function() {
            topics = {};
        }
    };

    root.pubsub = pubsub;

})(typeof window === 'object' && window);
