const COLOR_CODES = [
    {
        code: "0",
        name: "black",
        color: "#000000",
    },
    {
        code: "1",
        name: "dark_blue",
        color: "#0000AA",
    },
    {
        code: "2",
        name: "dark_green",
        color: "#00AA00",
    },
    {
        code: "3",
        name: "dark_aqua",
        color: "#00AAAA",
    },
    {
        code: "4",
        name: "dark_red",
        color: "#AA0000",
    },
    {
        code: "5",
        name: "dark_purple",
        color: "#AA00AA",
    },
    {
        code: "6",
        name: "gold",
        color: "#FFAA00",
    },
    {
        code: "7",
        name: "gray",
        color: "#AAAAAA",
    },
    {
        code: "8",
        name: "dark_gray",
        color: "#555555",
    },
    {
        code: "9",
        name: "blue",
        color: "#5555FF",
    },
    {
        code: "a",
        name: "green",
        color: "#55FF55",
    },
    {
        code: "b",
        name: "aqua",
        color: "#55FFFF",
    },
    {
        code: "c",
        name: "red",
        color: "#FF5555",
    },
    {
        code: "d",
        name: "light_purple",
        color: "#FF55FF",
    },
    {
        code: "e",
        name: "yellow",
        color: "#FFFF55",
    },
    {
        code: "f",
        name: "white",
        color: "#FFFFFF",
    },
];

const FORMAT_CODES = [
    {
        code: "k",
        name: "obfuscated",
        css: "background-color: white;border-radius: .1em;",
    },
    {
        code: "l",
        name: "bold",
        css: "font-weight: 600;",
    },
    {
        code: "m",
        name: "strikethrough",
        css: "text-decoration: strikethrough;",
    },
    {
        code: "n",
        name: "underline",
        css: "text-decoration: underline;",
    },
    {
        code: "o",
        name: "italic",
        css: "font-style: italic;",
    },
];

class MOTD {

    utils = null;

    constructor(utils) {
        this.utils = utils;
    }
    
    /**
     * Formats Minecraft MOTDs to HTML formatted text
     * @param {string} text 
     * @returns {string}
     */
    #formatMinecraftMOTDText(text) {
        let endText = "";

        let sectionTag = false;
        let endTagNextColor = false;
        let endTagsString = "";

        const endTags = () => {
            endText += endTagsString;
            endTagsString = "";
        }

        text = this.utils.htmlEscape(text);

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const lowerChar = char.toLowerCase();

            if (sectionTag) {
                sectionTag = false;
                const colorCode = COLOR_CODES.find(x => x.code === lowerChar);
                const formatCode = FORMAT_CODES.find(x => x.code === lowerChar);

                if (colorCode) {
                    if (endTagNextColor) {
                        endTags();
                    }
                    endText += `<span style="color: ${colorCode.color};">`;
                    endTagsString += "</span>";
                    continue;
                } else if (formatCode) {
                    endText += `<span style="${formatCode.css}">`;
                    endTagsString += "</span>";
                    endTagNextColor = true;
                    continue;
                } else if (char.toLowerCase() === "r") {
                    endTags();
                    endTagNextColor = false;
                    continue;
                }
            } else if (char === "§") {
                sectionTag = true;
                continue;
            }
            endText += char;
        }

        endTags();

        endText = endText
            .replace(/ +/g, " ")
            .replace(/\n/g, "<br>");

        return endText;
    }

    /**
     * Formats a specific JSON block.
     * @param {{text:string,bold:boolean?,italic:boolean?,obfuscated:boolean?,strikethrough:boolean?,underline:boolean?,color:string?,extra:{text:string,bold:boolean?,italic:boolean?,obfuscated:boolean?,strikethrough:boolean?,underline:boolean?,color:string?,extra:[]?}[]?}} block 
     * @param {{bold:boolean?,italic:boolean?,obfuscated:boolean?,strikethrough:boolean?,underline:boolean?,color:string?}?} styles 
     * @returns {string}
     */
    #formatMinecraftMOTDJson(block, styles = {}) {
        let blockStyle = "";
        if (block?.color || styles?.color) {
            let color = block.hasOwnProperty("color") ? block.color : styles.color;

            const foundColor = COLOR_CODES.find(x => x.name === color);
            if (foundColor) {
                color = foundColor.color;
            }

            blockStyle += `color:${color};`;
        }

        FORMAT_CODES.forEach(formatCode => {
            if (block.hasOwnProperty(formatCode.name)) {
                if (block[formatCode.name]) {
                    blockStyle += formatCode.css;
                }
            } else if (styles.hasOwnProperty(formatCode.name) && styles[formatCode.name]) {
                blockStyle += formatCode.css;
            }
        });

        let result = "";

        if (block.text !== "") {
            result += `<span style="${this.utils.htmlEscape(blockStyle)}">${block?.text ? this.utils.htmlEscape(block.text) : ""}</span>`
        }

        if (block?.extra) {
            block.extra.forEach(extra => {
                result += this.#formatMinecraftMOTDJson(extra, {
                    bold: block.bold,
                    italic: block.italic,
                    obfuscated: block.obfuscated,
                    strikethrough: block.strikethrough,
                    underline: block.underline,
                    color: block.color,
                });
            });
        }

        return result;
    }

    /**
     * Returns an HTML formatted version of JSON or legacy string color text for Minecraft
     * @param {string|{text:string,bold:boolean?,italic:boolean?,obfuscated:boolean?,strikethrough:boolean?,underline:boolean?,color:string?,extra:{text:string,bold:boolean?,italic:boolean?,obfuscated:boolean?,strikethrough:boolean?,underline:boolean?,color:string?,extra:[]?}[]?}}
     * @returns {string}
     */
    formatMinecraftMOTD(data) {
        // Attempt to parse string into an object
        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch(err) {}
        }

        if (typeof data === "string") {
            return this.#formatMinecraftMOTDText(data);
        } else if (typeof data === "object") {
            return this.#formatMinecraftMOTDJson(data);
        } else {
            throw new Error("Must send either a string or object");
        }
    }
}

module.exports = MOTD;