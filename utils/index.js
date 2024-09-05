const CommunicationManager = require("./CommunicationManager");
const MOTD = require("./MOTD");

class Utils {

    /**
     * Regex for MinecraftServer.pro server names
     */
    SERVER_NAME_REGEX = /^[\w !@#$%^&*\(\)\[\]{}|:;'",.<>?/_\-+=]{4,32}$/;

    /**
     * Regex to match allowed domain names
     */
    SERVER_DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    
    /**
     * Regex to match IPv4 Server IPs
     */
    SERVER_IP_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

    /**
     * Regex to match Minecraft color codes
     */
    COLOR_CODE_REGEX = /[§�][0-9a-fk-or]/gi;

    /**
     * Communication Manager between other services
     * @type {CommunicationManager}
     */
    CommunicationManager = new CommunicationManager(this);

    /**
     * MOTD Utils
     * @type {MOTD}
     */
    MOTD = new MOTD(this);

    /**
     * Escapes text into a form that is HTML-safe.
     * @param {string} text 
     * @returns {string}
     */
    htmlEscape(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /**
     * Maps a ping number to a quality
     * @param {number} ping 
     * @returns {{quality:string,icon:string,bars:number}}
     */
    pingToQuality(ping) {
        if (ping < 30) {
            return {
                quality: "Excellent",
                icon: "signal-bars",
                bars: 4,
            };
        } else if (ping < 60) {
            return {
                quality: "Good",
                icon: "signal-bars-good",
                bars: 3,
            };
        } else if (ping < 100) {
            return {
                quality: "Fair",
                icon: "signal-bars-fair",
                bars: 2,
            };
        }
        return {
            quality: "Weak",
            icon: "signal-bars-weak",
            bars: 1,
        };
    }

    /**
     * Adds commas to a number. Ex: 1234 -> 1,234
     * @param {number} num 
     * @returns {string}
     */
    comma(num) {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Generates a random string of (length) length.
     * @param {number} length 
     * @returns {string} Generated String
     */
    stringGenerator(length = 32) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;
    }

}

const utils = new Utils();

global.utils = utils;

module.exports = utils;
