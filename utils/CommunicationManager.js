const publisher = require("./redis");
const config = require("../config.json");

const DEFAULT_ACK_BUFFER = 300;

class CommunicationManager {

    utils;
    
    constructor(utils) {
        this.utils = utils;
    }

    /**
     * Sends a message to Redis with no expected response
     * @param {string} channel 
     * @param {string|object} message 
     * @returns {Promise<void>}
     */
    #send(channel, message) {
        if (typeof message !== "string") message = JSON.stringify(message);
        return publisher.publish(channel, message);
    }

    /**
     * 
     * @param {string} channel 
     * @param {object} message 
     * @param {number?} timeout 
     * @param {number?} ackBuffer Buffer to prevent the await from ending before receiving acknowledgements from all servers
     * @returns {Promise<any[]>}
     */
    #sendAndAwait(channel, message, timeout, ackBuffer = DEFAULT_ACK_BUFFER) {
        return new Promise((resolve, reject) => {
            const start = Date.now();

            console.log(`[CommunicationManager] Sending ${channel} request`);
            const subscriber = publisher.duplicate();

            const replyChannel = `${channel}-${this.utils.stringGenerator(10)}`;

            let results = [];
            let to;
            let awaitAckTimeout;

            const exit = () => {
                clearTimeout(awaitAckTimeout);
                clearTimeout(to);
                subscriber.unsubscribe();
                resolve(results);
                console.log(`[CommunicationManager] Completed ${channel} request in ${Date.now() - start} ms`);
            };

            let expectedReplies = 0;
            subscriber.subscribe(replyChannel, data => {
                try {
                    data = JSON.parse(data);
                    if (data?.acknowledge) {
                        if (awaitAckTimeout) {
                            clearTimeout(awaitAckTimeout);
                        }
                        console.log(`[CommunicationManager] Received acknowledgement to ${channel} from ${data.source} in ${Date.now() - start} ms`);
                        expectedReplies++;
                    } else {
                        results.push(data);
                        console.log(`[CommunicationManager] Received reply to ${channel} from ${data.source} in ${Date.now() - start} ms`);
                        // If the results are more than or equal to the expected replies, exit early
                        if (results.length >= expectedReplies) {
                            // DO NOT exit early if the time taken is less than or equal to ack buffer. Instead, wait for another ack and set an exit timeout an ack buffer later
                            // This gives enough time to ensure that all servers have replied with an acknowledgement, preventing a single server from outrunning the rest.
                            if (Date.now() - start <= ackBuffer) {
                                if (!awaitAckTimeout) {
                                    console.log(`[CommunicationManager] Ack buffer active. Server will wait another ${ackBuffer} ms to complete request`)
                                    awaitAckTimeout = setTimeout(exit, ackBuffer);
                                }
                                return;
                            }
                            exit();
                        }
                    }
                } catch(err) {
                    console.error(err);
                }
            });

            subscriber.connect();

            message.timeout = timeout;
            message.replyChannel = replyChannel;

            this.#send(channel, JSON.stringify(message));

            to = setTimeout(exit, timeout);
        });
    }

    /**
     * Sends a message to ping servers to ping the desired IP
     */
    sendPingServer(ip, port, timeout = 3000) {
        return this.#sendAndAwait("pingServer", {
            ip,
            port,
            source: config.serverLocation,
        }, timeout);
    }

    /**
     * Sends a ping complete message to web servers
     * @returns {Promise<void>}
     */
    sendPingComplete() {
        return this.#send("pingComplete", {
            source: config.serverLocation,
        });
    }

    /**
     * Sends a message to Discord to add the user to the Discord guild
     * @param {string} userId
     * @param {string} accessToken
     * @param {number} timeout
     * @returns {Promise<void>}
     */
    sendAddUser(userId, accessToken, timeout = 1000) {
        return this.#sendAndAwait("addUser", {
            userId,
            accessToken,
            source: config.serverLocation,
        }, timeout);
    }

    /**
     * Sends a global message when a server updates with the server ID.
     * @param {string} serverId 
     * @returns {Promise<void>}
     */
    sendUpdateServer(serverId) {
        return this.#send("updateServer", {
            serverId,
        });
    }

    /**
     * Listens on channel and calls function with payload
     * @param {"ping"|"pingComplete"|"addUser"|"updateServer"} channel
     * @param {function} listener 
     */
    on(channel, listener) {
        const subscriber = publisher.duplicate();

        subscriber.subscribe(channel, data => {
            try {
                data = JSON.parse(data);
            } catch(err) {
                console.error(err);
            }

            if (data?.replyChannel) {
                this.#send(data.replyChannel, {
                    acknowledge: true,
                    source: config.serverLocation,
                });
            }

            const reply = replyData => {
                if (!data?.replyChannel) return false;

                if (typeof replyData !== "string") {
                    replyData.source = config.serverLocation;
                    replyData = JSON.stringify(replyData);
                }

                publisher.publish(data.replyChannel, replyData);

                return true;
            }

            try {
                listener(data, reply);
            } catch(err) {
                console.error(`Error occurred while calling ${channel} listener: ${err}`);
            }
        });

        subscriber.connect();
    }

}

module.exports = CommunicationManager;
