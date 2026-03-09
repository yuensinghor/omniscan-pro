/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.session = (function() {

    /**
     * Namespace session.
     * @exports session
     * @namespace
     */
    var session = {};

    /**
     * SecSchemeVersion enum.
     * @name session.SecSchemeVersion
     * @enum {number}
     * @property {number} SecScheme0=0 SecScheme0 value
     * @property {number} SecScheme1=1 SecScheme1 value
     */
    session.SecSchemeVersion = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "SecScheme0"] = 0;
        values[valuesById[1] = "SecScheme1"] = 1;
        return values;
    })();

    session.SessionData = (function() {

        /**
         * Properties of a SessionData.
         * @memberof session
         * @interface ISessionData
         * @property {session.SecSchemeVersion|null} [secVer] SessionData secVer
         * @property {session.ISec0Payload|null} [sec0] SessionData sec0
         * @property {session.ISec1Payload|null} [sec1] SessionData sec1
         */

        /**
         * Constructs a new SessionData.
         * @memberof session
         * @classdesc Represents a SessionData.
         * @implements ISessionData
         * @constructor
         * @param {session.ISessionData=} [properties] Properties to set
         */
        function SessionData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SessionData secVer.
         * @member {session.SecSchemeVersion} secVer
         * @memberof session.SessionData
         * @instance
         */
        SessionData.prototype.secVer = 0;

        /**
         * SessionData sec0.
         * @member {session.ISec0Payload|null|undefined} sec0
         * @memberof session.SessionData
         * @instance
         */
        SessionData.prototype.sec0 = null;

        /**
         * SessionData sec1.
         * @member {session.ISec1Payload|null|undefined} sec1
         * @memberof session.SessionData
         * @instance
         */
        SessionData.prototype.sec1 = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * SessionData proto.
         * @member {"sec0"|"sec1"|undefined} proto
         * @memberof session.SessionData
         * @instance
         */
        Object.defineProperty(SessionData.prototype, "proto", {
            get: $util.oneOfGetter($oneOfFields = ["sec0", "sec1"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new SessionData instance using the specified properties.
         * @function create
         * @memberof session.SessionData
         * @static
         * @param {session.ISessionData=} [properties] Properties to set
         * @returns {session.SessionData} SessionData instance
         */
        SessionData.create = function create(properties) {
            return new SessionData(properties);
        };

        /**
         * Encodes the specified SessionData message. Does not implicitly {@link session.SessionData.verify|verify} messages.
         * @function encode
         * @memberof session.SessionData
         * @static
         * @param {session.ISessionData} message SessionData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.secVer != null && Object.hasOwnProperty.call(message, "secVer"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.secVer);
            if (message.sec0 != null && Object.hasOwnProperty.call(message, "sec0"))
                $root.session.Sec0Payload.encode(message.sec0, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.sec1 != null && Object.hasOwnProperty.call(message, "sec1"))
                $root.session.Sec1Payload.encode(message.sec1, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified SessionData message, length delimited. Does not implicitly {@link session.SessionData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.SessionData
         * @static
         * @param {session.ISessionData} message SessionData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SessionData message from the specified reader or buffer.
         * @function decode
         * @memberof session.SessionData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.SessionData} SessionData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionData.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.SessionData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 2: {
                        message.secVer = reader.int32();
                        break;
                    }
                case 10: {
                        message.sec0 = $root.session.Sec0Payload.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.sec1 = $root.session.Sec1Payload.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SessionData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.SessionData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.SessionData} SessionData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SessionData message.
         * @function verify
         * @memberof session.SessionData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SessionData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.secVer != null && message.hasOwnProperty("secVer"))
                switch (message.secVer) {
                default:
                    return "secVer: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.sec0 != null && message.hasOwnProperty("sec0")) {
                properties.proto = 1;
                {
                    var error = $root.session.Sec0Payload.verify(message.sec0);
                    if (error)
                        return "sec0." + error;
                }
            }
            if (message.sec1 != null && message.hasOwnProperty("sec1")) {
                if (properties.proto === 1)
                    return "proto: multiple values";
                properties.proto = 1;
                {
                    var error = $root.session.Sec1Payload.verify(message.sec1);
                    if (error)
                        return "sec1." + error;
                }
            }
            return null;
        };

        /**
         * Creates a SessionData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.SessionData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.SessionData} SessionData
         */
        SessionData.fromObject = function fromObject(object) {
            if (object instanceof $root.session.SessionData)
                return object;
            var message = new $root.session.SessionData();
            switch (object.secVer) {
            default:
                if (typeof object.secVer === "number") {
                    message.secVer = object.secVer;
                    break;
                }
                break;
            case "SecScheme0":
            case 0:
                message.secVer = 0;
                break;
            case "SecScheme1":
            case 1:
                message.secVer = 1;
                break;
            }
            if (object.sec0 != null) {
                if (typeof object.sec0 !== "object")
                    throw TypeError(".session.SessionData.sec0: object expected");
                message.sec0 = $root.session.Sec0Payload.fromObject(object.sec0);
            }
            if (object.sec1 != null) {
                if (typeof object.sec1 !== "object")
                    throw TypeError(".session.SessionData.sec1: object expected");
                message.sec1 = $root.session.Sec1Payload.fromObject(object.sec1);
            }
            return message;
        };

        /**
         * Creates a plain object from a SessionData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.SessionData
         * @static
         * @param {session.SessionData} message SessionData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SessionData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.secVer = options.enums === String ? "SecScheme0" : 0;
            if (message.secVer != null && message.hasOwnProperty("secVer"))
                object.secVer = options.enums === String ? $root.session.SecSchemeVersion[message.secVer] === undefined ? message.secVer : $root.session.SecSchemeVersion[message.secVer] : message.secVer;
            if (message.sec0 != null && message.hasOwnProperty("sec0")) {
                object.sec0 = $root.session.Sec0Payload.toObject(message.sec0, options);
                if (options.oneofs)
                    object.proto = "sec0";
            }
            if (message.sec1 != null && message.hasOwnProperty("sec1")) {
                object.sec1 = $root.session.Sec1Payload.toObject(message.sec1, options);
                if (options.oneofs)
                    object.proto = "sec1";
            }
            return object;
        };

        /**
         * Converts this SessionData to JSON.
         * @function toJSON
         * @memberof session.SessionData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SessionData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SessionData
         * @function getTypeUrl
         * @memberof session.SessionData
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SessionData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.SessionData";
        };

        return SessionData;
    })();

    session.Sec0Payload = (function() {

        /**
         * Properties of a Sec0Payload.
         * @memberof session
         * @interface ISec0Payload
         * @property {Uint8Array|null} [msg] Sec0Payload msg
         * @property {session.IPayloadDescriptor|null} [sr] Sec0Payload sr
         * @property {session.IPayloadDescriptor|null} [sc] Sec0Payload sc
         */

        /**
         * Constructs a new Sec0Payload.
         * @memberof session
         * @classdesc Represents a Sec0Payload.
         * @implements ISec0Payload
         * @constructor
         * @param {session.ISec0Payload=} [properties] Properties to set
         */
        function Sec0Payload(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sec0Payload msg.
         * @member {Uint8Array} msg
         * @memberof session.Sec0Payload
         * @instance
         */
        Sec0Payload.prototype.msg = $util.newBuffer([]);

        /**
         * Sec0Payload sr.
         * @member {session.IPayloadDescriptor|null|undefined} sr
         * @memberof session.Sec0Payload
         * @instance
         */
        Sec0Payload.prototype.sr = null;

        /**
         * Sec0Payload sc.
         * @member {session.IPayloadDescriptor|null|undefined} sc
         * @memberof session.Sec0Payload
         * @instance
         */
        Sec0Payload.prototype.sc = null;

        /**
         * Creates a new Sec0Payload instance using the specified properties.
         * @function create
         * @memberof session.Sec0Payload
         * @static
         * @param {session.ISec0Payload=} [properties] Properties to set
         * @returns {session.Sec0Payload} Sec0Payload instance
         */
        Sec0Payload.create = function create(properties) {
            return new Sec0Payload(properties);
        };

        /**
         * Encodes the specified Sec0Payload message. Does not implicitly {@link session.Sec0Payload.verify|verify} messages.
         * @function encode
         * @memberof session.Sec0Payload
         * @static
         * @param {session.ISec0Payload} message Sec0Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sec0Payload.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.msg);
            if (message.sr != null && Object.hasOwnProperty.call(message, "sr"))
                $root.session.PayloadDescriptor.encode(message.sr, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.sc != null && Object.hasOwnProperty.call(message, "sc"))
                $root.session.PayloadDescriptor.encode(message.sc, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Sec0Payload message, length delimited. Does not implicitly {@link session.Sec0Payload.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.Sec0Payload
         * @static
         * @param {session.ISec0Payload} message Sec0Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sec0Payload.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Sec0Payload message from the specified reader or buffer.
         * @function decode
         * @memberof session.Sec0Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.Sec0Payload} Sec0Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sec0Payload.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.Sec0Payload();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.msg = reader.bytes();
                        break;
                    }
                case 2: {
                        message.sr = $root.session.PayloadDescriptor.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.sc = $root.session.PayloadDescriptor.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Sec0Payload message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.Sec0Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.Sec0Payload} Sec0Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sec0Payload.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Sec0Payload message.
         * @function verify
         * @memberof session.Sec0Payload
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sec0Payload.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.msg != null && message.hasOwnProperty("msg"))
                if (!(message.msg && typeof message.msg.length === "number" || $util.isString(message.msg)))
                    return "msg: buffer expected";
            if (message.sr != null && message.hasOwnProperty("sr")) {
                var error = $root.session.PayloadDescriptor.verify(message.sr);
                if (error)
                    return "sr." + error;
            }
            if (message.sc != null && message.hasOwnProperty("sc")) {
                var error = $root.session.PayloadDescriptor.verify(message.sc);
                if (error)
                    return "sc." + error;
            }
            return null;
        };

        /**
         * Creates a Sec0Payload message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.Sec0Payload
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.Sec0Payload} Sec0Payload
         */
        Sec0Payload.fromObject = function fromObject(object) {
            if (object instanceof $root.session.Sec0Payload)
                return object;
            var message = new $root.session.Sec0Payload();
            if (object.msg != null)
                if (typeof object.msg === "string")
                    $util.base64.decode(object.msg, message.msg = $util.newBuffer($util.base64.length(object.msg)), 0);
                else if (object.msg.length >= 0)
                    message.msg = object.msg;
            if (object.sr != null) {
                if (typeof object.sr !== "object")
                    throw TypeError(".session.Sec0Payload.sr: object expected");
                message.sr = $root.session.PayloadDescriptor.fromObject(object.sr);
            }
            if (object.sc != null) {
                if (typeof object.sc !== "object")
                    throw TypeError(".session.Sec0Payload.sc: object expected");
                message.sc = $root.session.PayloadDescriptor.fromObject(object.sc);
            }
            return message;
        };

        /**
         * Creates a plain object from a Sec0Payload message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.Sec0Payload
         * @static
         * @param {session.Sec0Payload} message Sec0Payload
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Sec0Payload.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.msg = "";
                else {
                    object.msg = [];
                    if (options.bytes !== Array)
                        object.msg = $util.newBuffer(object.msg);
                }
                object.sr = null;
                object.sc = null;
            }
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = options.bytes === String ? $util.base64.encode(message.msg, 0, message.msg.length) : options.bytes === Array ? Array.prototype.slice.call(message.msg) : message.msg;
            if (message.sr != null && message.hasOwnProperty("sr"))
                object.sr = $root.session.PayloadDescriptor.toObject(message.sr, options);
            if (message.sc != null && message.hasOwnProperty("sc"))
                object.sc = $root.session.PayloadDescriptor.toObject(message.sc, options);
            return object;
        };

        /**
         * Converts this Sec0Payload to JSON.
         * @function toJSON
         * @memberof session.Sec0Payload
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Sec0Payload.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Sec0Payload
         * @function getTypeUrl
         * @memberof session.Sec0Payload
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Sec0Payload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.Sec0Payload";
        };

        return Sec0Payload;
    })();

    session.Sec1Payload = (function() {

        /**
         * Properties of a Sec1Payload.
         * @memberof session
         * @interface ISec1Payload
         * @property {Uint8Array|null} [msg] Sec1Payload msg
         * @property {session.IPayloadDescriptor|null} [sr] Sec1Payload sr
         * @property {session.IPayloadDescriptor|null} [sc] Sec1Payload sc
         */

        /**
         * Constructs a new Sec1Payload.
         * @memberof session
         * @classdesc Represents a Sec1Payload.
         * @implements ISec1Payload
         * @constructor
         * @param {session.ISec1Payload=} [properties] Properties to set
         */
        function Sec1Payload(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sec1Payload msg.
         * @member {Uint8Array} msg
         * @memberof session.Sec1Payload
         * @instance
         */
        Sec1Payload.prototype.msg = $util.newBuffer([]);

        /**
         * Sec1Payload sr.
         * @member {session.IPayloadDescriptor|null|undefined} sr
         * @memberof session.Sec1Payload
         * @instance
         */
        Sec1Payload.prototype.sr = null;

        /**
         * Sec1Payload sc.
         * @member {session.IPayloadDescriptor|null|undefined} sc
         * @memberof session.Sec1Payload
         * @instance
         */
        Sec1Payload.prototype.sc = null;

        /**
         * Creates a new Sec1Payload instance using the specified properties.
         * @function create
         * @memberof session.Sec1Payload
         * @static
         * @param {session.ISec1Payload=} [properties] Properties to set
         * @returns {session.Sec1Payload} Sec1Payload instance
         */
        Sec1Payload.create = function create(properties) {
            return new Sec1Payload(properties);
        };

        /**
         * Encodes the specified Sec1Payload message. Does not implicitly {@link session.Sec1Payload.verify|verify} messages.
         * @function encode
         * @memberof session.Sec1Payload
         * @static
         * @param {session.ISec1Payload} message Sec1Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sec1Payload.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.msg);
            if (message.sr != null && Object.hasOwnProperty.call(message, "sr"))
                $root.session.PayloadDescriptor.encode(message.sr, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.sc != null && Object.hasOwnProperty.call(message, "sc"))
                $root.session.PayloadDescriptor.encode(message.sc, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Sec1Payload message, length delimited. Does not implicitly {@link session.Sec1Payload.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.Sec1Payload
         * @static
         * @param {session.ISec1Payload} message Sec1Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sec1Payload.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Sec1Payload message from the specified reader or buffer.
         * @function decode
         * @memberof session.Sec1Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.Sec1Payload} Sec1Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sec1Payload.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.Sec1Payload();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.msg = reader.bytes();
                        break;
                    }
                case 2: {
                        message.sr = $root.session.PayloadDescriptor.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.sc = $root.session.PayloadDescriptor.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Sec1Payload message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.Sec1Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.Sec1Payload} Sec1Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sec1Payload.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Sec1Payload message.
         * @function verify
         * @memberof session.Sec1Payload
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sec1Payload.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.msg != null && message.hasOwnProperty("msg"))
                if (!(message.msg && typeof message.msg.length === "number" || $util.isString(message.msg)))
                    return "msg: buffer expected";
            if (message.sr != null && message.hasOwnProperty("sr")) {
                var error = $root.session.PayloadDescriptor.verify(message.sr);
                if (error)
                    return "sr." + error;
            }
            if (message.sc != null && message.hasOwnProperty("sc")) {
                var error = $root.session.PayloadDescriptor.verify(message.sc);
                if (error)
                    return "sc." + error;
            }
            return null;
        };

        /**
         * Creates a Sec1Payload message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.Sec1Payload
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.Sec1Payload} Sec1Payload
         */
        Sec1Payload.fromObject = function fromObject(object) {
            if (object instanceof $root.session.Sec1Payload)
                return object;
            var message = new $root.session.Sec1Payload();
            if (object.msg != null)
                if (typeof object.msg === "string")
                    $util.base64.decode(object.msg, message.msg = $util.newBuffer($util.base64.length(object.msg)), 0);
                else if (object.msg.length >= 0)
                    message.msg = object.msg;
            if (object.sr != null) {
                if (typeof object.sr !== "object")
                    throw TypeError(".session.Sec1Payload.sr: object expected");
                message.sr = $root.session.PayloadDescriptor.fromObject(object.sr);
            }
            if (object.sc != null) {
                if (typeof object.sc !== "object")
                    throw TypeError(".session.Sec1Payload.sc: object expected");
                message.sc = $root.session.PayloadDescriptor.fromObject(object.sc);
            }
            return message;
        };

        /**
         * Creates a plain object from a Sec1Payload message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.Sec1Payload
         * @static
         * @param {session.Sec1Payload} message Sec1Payload
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Sec1Payload.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.msg = "";
                else {
                    object.msg = [];
                    if (options.bytes !== Array)
                        object.msg = $util.newBuffer(object.msg);
                }
                object.sr = null;
                object.sc = null;
            }
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = options.bytes === String ? $util.base64.encode(message.msg, 0, message.msg.length) : options.bytes === Array ? Array.prototype.slice.call(message.msg) : message.msg;
            if (message.sr != null && message.hasOwnProperty("sr"))
                object.sr = $root.session.PayloadDescriptor.toObject(message.sr, options);
            if (message.sc != null && message.hasOwnProperty("sc"))
                object.sc = $root.session.PayloadDescriptor.toObject(message.sc, options);
            return object;
        };

        /**
         * Converts this Sec1Payload to JSON.
         * @function toJSON
         * @memberof session.Sec1Payload
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Sec1Payload.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Sec1Payload
         * @function getTypeUrl
         * @memberof session.Sec1Payload
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Sec1Payload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.Sec1Payload";
        };

        return Sec1Payload;
    })();

    session.PayloadDescriptor = (function() {

        /**
         * Properties of a PayloadDescriptor.
         * @memberof session
         * @interface IPayloadDescriptor
         * @property {number|null} [type] PayloadDescriptor type
         * @property {number|null} [from] PayloadDescriptor from
         * @property {number|null} [to] PayloadDescriptor to
         */

        /**
         * Constructs a new PayloadDescriptor.
         * @memberof session
         * @classdesc Represents a PayloadDescriptor.
         * @implements IPayloadDescriptor
         * @constructor
         * @param {session.IPayloadDescriptor=} [properties] Properties to set
         */
        function PayloadDescriptor(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PayloadDescriptor type.
         * @member {number} type
         * @memberof session.PayloadDescriptor
         * @instance
         */
        PayloadDescriptor.prototype.type = 0;

        /**
         * PayloadDescriptor from.
         * @member {number} from
         * @memberof session.PayloadDescriptor
         * @instance
         */
        PayloadDescriptor.prototype.from = 0;

        /**
         * PayloadDescriptor to.
         * @member {number} to
         * @memberof session.PayloadDescriptor
         * @instance
         */
        PayloadDescriptor.prototype.to = 0;

        /**
         * Creates a new PayloadDescriptor instance using the specified properties.
         * @function create
         * @memberof session.PayloadDescriptor
         * @static
         * @param {session.IPayloadDescriptor=} [properties] Properties to set
         * @returns {session.PayloadDescriptor} PayloadDescriptor instance
         */
        PayloadDescriptor.create = function create(properties) {
            return new PayloadDescriptor(properties);
        };

        /**
         * Encodes the specified PayloadDescriptor message. Does not implicitly {@link session.PayloadDescriptor.verify|verify} messages.
         * @function encode
         * @memberof session.PayloadDescriptor
         * @static
         * @param {session.IPayloadDescriptor} message PayloadDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PayloadDescriptor.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.type);
            if (message.from != null && Object.hasOwnProperty.call(message, "from"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.from);
            if (message.to != null && Object.hasOwnProperty.call(message, "to"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.to);
            return writer;
        };

        /**
         * Encodes the specified PayloadDescriptor message, length delimited. Does not implicitly {@link session.PayloadDescriptor.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.PayloadDescriptor
         * @static
         * @param {session.IPayloadDescriptor} message PayloadDescriptor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PayloadDescriptor.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PayloadDescriptor message from the specified reader or buffer.
         * @function decode
         * @memberof session.PayloadDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.PayloadDescriptor} PayloadDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PayloadDescriptor.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.PayloadDescriptor();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.uint32();
                        break;
                    }
                case 2: {
                        message.from = reader.uint32();
                        break;
                    }
                case 3: {
                        message.to = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PayloadDescriptor message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.PayloadDescriptor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.PayloadDescriptor} PayloadDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PayloadDescriptor.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PayloadDescriptor message.
         * @function verify
         * @memberof session.PayloadDescriptor
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PayloadDescriptor.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isInteger(message.type))
                    return "type: integer expected";
            if (message.from != null && message.hasOwnProperty("from"))
                if (!$util.isInteger(message.from))
                    return "from: integer expected";
            if (message.to != null && message.hasOwnProperty("to"))
                if (!$util.isInteger(message.to))
                    return "to: integer expected";
            return null;
        };

        /**
         * Creates a PayloadDescriptor message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.PayloadDescriptor
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.PayloadDescriptor} PayloadDescriptor
         */
        PayloadDescriptor.fromObject = function fromObject(object) {
            if (object instanceof $root.session.PayloadDescriptor)
                return object;
            var message = new $root.session.PayloadDescriptor();
            if (object.type != null)
                message.type = object.type >>> 0;
            if (object.from != null)
                message.from = object.from >>> 0;
            if (object.to != null)
                message.to = object.to >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a PayloadDescriptor message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.PayloadDescriptor
         * @static
         * @param {session.PayloadDescriptor} message PayloadDescriptor
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PayloadDescriptor.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = 0;
                object.from = 0;
                object.to = 0;
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.from != null && message.hasOwnProperty("from"))
                object.from = message.from;
            if (message.to != null && message.hasOwnProperty("to"))
                object.to = message.to;
            return object;
        };

        /**
         * Converts this PayloadDescriptor to JSON.
         * @function toJSON
         * @memberof session.PayloadDescriptor
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PayloadDescriptor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PayloadDescriptor
         * @function getTypeUrl
         * @memberof session.PayloadDescriptor
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PayloadDescriptor.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.PayloadDescriptor";
        };

        return PayloadDescriptor;
    })();

    session.SessionCmd0 = (function() {

        /**
         * Properties of a SessionCmd0.
         * @memberof session
         * @interface ISessionCmd0
         * @property {Uint8Array|null} [clientPubKey] SessionCmd0 clientPubKey
         */

        /**
         * Constructs a new SessionCmd0.
         * @memberof session
         * @classdesc Represents a SessionCmd0.
         * @implements ISessionCmd0
         * @constructor
         * @param {session.ISessionCmd0=} [properties] Properties to set
         */
        function SessionCmd0(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SessionCmd0 clientPubKey.
         * @member {Uint8Array} clientPubKey
         * @memberof session.SessionCmd0
         * @instance
         */
        SessionCmd0.prototype.clientPubKey = $util.newBuffer([]);

        /**
         * Creates a new SessionCmd0 instance using the specified properties.
         * @function create
         * @memberof session.SessionCmd0
         * @static
         * @param {session.ISessionCmd0=} [properties] Properties to set
         * @returns {session.SessionCmd0} SessionCmd0 instance
         */
        SessionCmd0.create = function create(properties) {
            return new SessionCmd0(properties);
        };

        /**
         * Encodes the specified SessionCmd0 message. Does not implicitly {@link session.SessionCmd0.verify|verify} messages.
         * @function encode
         * @memberof session.SessionCmd0
         * @static
         * @param {session.ISessionCmd0} message SessionCmd0 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionCmd0.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.clientPubKey != null && Object.hasOwnProperty.call(message, "clientPubKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientPubKey);
            return writer;
        };

        /**
         * Encodes the specified SessionCmd0 message, length delimited. Does not implicitly {@link session.SessionCmd0.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.SessionCmd0
         * @static
         * @param {session.ISessionCmd0} message SessionCmd0 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionCmd0.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SessionCmd0 message from the specified reader or buffer.
         * @function decode
         * @memberof session.SessionCmd0
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.SessionCmd0} SessionCmd0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionCmd0.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.SessionCmd0();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.clientPubKey = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SessionCmd0 message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.SessionCmd0
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.SessionCmd0} SessionCmd0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionCmd0.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SessionCmd0 message.
         * @function verify
         * @memberof session.SessionCmd0
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SessionCmd0.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.clientPubKey != null && message.hasOwnProperty("clientPubKey"))
                if (!(message.clientPubKey && typeof message.clientPubKey.length === "number" || $util.isString(message.clientPubKey)))
                    return "clientPubKey: buffer expected";
            return null;
        };

        /**
         * Creates a SessionCmd0 message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.SessionCmd0
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.SessionCmd0} SessionCmd0
         */
        SessionCmd0.fromObject = function fromObject(object) {
            if (object instanceof $root.session.SessionCmd0)
                return object;
            var message = new $root.session.SessionCmd0();
            if (object.clientPubKey != null)
                if (typeof object.clientPubKey === "string")
                    $util.base64.decode(object.clientPubKey, message.clientPubKey = $util.newBuffer($util.base64.length(object.clientPubKey)), 0);
                else if (object.clientPubKey.length >= 0)
                    message.clientPubKey = object.clientPubKey;
            return message;
        };

        /**
         * Creates a plain object from a SessionCmd0 message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.SessionCmd0
         * @static
         * @param {session.SessionCmd0} message SessionCmd0
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SessionCmd0.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.clientPubKey = "";
                else {
                    object.clientPubKey = [];
                    if (options.bytes !== Array)
                        object.clientPubKey = $util.newBuffer(object.clientPubKey);
                }
            if (message.clientPubKey != null && message.hasOwnProperty("clientPubKey"))
                object.clientPubKey = options.bytes === String ? $util.base64.encode(message.clientPubKey, 0, message.clientPubKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientPubKey) : message.clientPubKey;
            return object;
        };

        /**
         * Converts this SessionCmd0 to JSON.
         * @function toJSON
         * @memberof session.SessionCmd0
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SessionCmd0.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SessionCmd0
         * @function getTypeUrl
         * @memberof session.SessionCmd0
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SessionCmd0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.SessionCmd0";
        };

        return SessionCmd0;
    })();

    session.SessionResp0 = (function() {

        /**
         * Properties of a SessionResp0.
         * @memberof session
         * @interface ISessionResp0
         * @property {session.Status|null} [status] SessionResp0 status
         * @property {Uint8Array|null} [devicePubKey] SessionResp0 devicePubKey
         * @property {Uint8Array|null} [deviceRandom] SessionResp0 deviceRandom
         */

        /**
         * Constructs a new SessionResp0.
         * @memberof session
         * @classdesc Represents a SessionResp0.
         * @implements ISessionResp0
         * @constructor
         * @param {session.ISessionResp0=} [properties] Properties to set
         */
        function SessionResp0(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SessionResp0 status.
         * @member {session.Status} status
         * @memberof session.SessionResp0
         * @instance
         */
        SessionResp0.prototype.status = 0;

        /**
         * SessionResp0 devicePubKey.
         * @member {Uint8Array} devicePubKey
         * @memberof session.SessionResp0
         * @instance
         */
        SessionResp0.prototype.devicePubKey = $util.newBuffer([]);

        /**
         * SessionResp0 deviceRandom.
         * @member {Uint8Array} deviceRandom
         * @memberof session.SessionResp0
         * @instance
         */
        SessionResp0.prototype.deviceRandom = $util.newBuffer([]);

        /**
         * Creates a new SessionResp0 instance using the specified properties.
         * @function create
         * @memberof session.SessionResp0
         * @static
         * @param {session.ISessionResp0=} [properties] Properties to set
         * @returns {session.SessionResp0} SessionResp0 instance
         */
        SessionResp0.create = function create(properties) {
            return new SessionResp0(properties);
        };

        /**
         * Encodes the specified SessionResp0 message. Does not implicitly {@link session.SessionResp0.verify|verify} messages.
         * @function encode
         * @memberof session.SessionResp0
         * @static
         * @param {session.ISessionResp0} message SessionResp0 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionResp0.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
            if (message.devicePubKey != null && Object.hasOwnProperty.call(message, "devicePubKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.devicePubKey);
            if (message.deviceRandom != null && Object.hasOwnProperty.call(message, "deviceRandom"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.deviceRandom);
            return writer;
        };

        /**
         * Encodes the specified SessionResp0 message, length delimited. Does not implicitly {@link session.SessionResp0.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.SessionResp0
         * @static
         * @param {session.ISessionResp0} message SessionResp0 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionResp0.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SessionResp0 message from the specified reader or buffer.
         * @function decode
         * @memberof session.SessionResp0
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.SessionResp0} SessionResp0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionResp0.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.SessionResp0();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.status = reader.int32();
                        break;
                    }
                case 2: {
                        message.devicePubKey = reader.bytes();
                        break;
                    }
                case 3: {
                        message.deviceRandom = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SessionResp0 message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.SessionResp0
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.SessionResp0} SessionResp0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionResp0.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SessionResp0 message.
         * @function verify
         * @memberof session.SessionResp0
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SessionResp0.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    break;
                }
            if (message.devicePubKey != null && message.hasOwnProperty("devicePubKey"))
                if (!(message.devicePubKey && typeof message.devicePubKey.length === "number" || $util.isString(message.devicePubKey)))
                    return "devicePubKey: buffer expected";
            if (message.deviceRandom != null && message.hasOwnProperty("deviceRandom"))
                if (!(message.deviceRandom && typeof message.deviceRandom.length === "number" || $util.isString(message.deviceRandom)))
                    return "deviceRandom: buffer expected";
            return null;
        };

        /**
         * Creates a SessionResp0 message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.SessionResp0
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.SessionResp0} SessionResp0
         */
        SessionResp0.fromObject = function fromObject(object) {
            if (object instanceof $root.session.SessionResp0)
                return object;
            var message = new $root.session.SessionResp0();
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "Success":
            case 0:
                message.status = 0;
                break;
            case "InvalidSecScheme":
            case 1:
                message.status = 1;
                break;
            case "InvalidProto":
            case 2:
                message.status = 2;
                break;
            case "TooManySessions":
            case 3:
                message.status = 3;
                break;
            case "InvalidArgument":
            case 4:
                message.status = 4;
                break;
            case "InternalError":
            case 5:
                message.status = 5;
                break;
            case "CryptoError":
            case 6:
                message.status = 6;
                break;
            case "InvalidSession":
            case 7:
                message.status = 7;
                break;
            }
            if (object.devicePubKey != null)
                if (typeof object.devicePubKey === "string")
                    $util.base64.decode(object.devicePubKey, message.devicePubKey = $util.newBuffer($util.base64.length(object.devicePubKey)), 0);
                else if (object.devicePubKey.length >= 0)
                    message.devicePubKey = object.devicePubKey;
            if (object.deviceRandom != null)
                if (typeof object.deviceRandom === "string")
                    $util.base64.decode(object.deviceRandom, message.deviceRandom = $util.newBuffer($util.base64.length(object.deviceRandom)), 0);
                else if (object.deviceRandom.length >= 0)
                    message.deviceRandom = object.deviceRandom;
            return message;
        };

        /**
         * Creates a plain object from a SessionResp0 message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.SessionResp0
         * @static
         * @param {session.SessionResp0} message SessionResp0
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SessionResp0.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.status = options.enums === String ? "Success" : 0;
                if (options.bytes === String)
                    object.devicePubKey = "";
                else {
                    object.devicePubKey = [];
                    if (options.bytes !== Array)
                        object.devicePubKey = $util.newBuffer(object.devicePubKey);
                }
                if (options.bytes === String)
                    object.deviceRandom = "";
                else {
                    object.deviceRandom = [];
                    if (options.bytes !== Array)
                        object.deviceRandom = $util.newBuffer(object.deviceRandom);
                }
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.session.Status[message.status] === undefined ? message.status : $root.session.Status[message.status] : message.status;
            if (message.devicePubKey != null && message.hasOwnProperty("devicePubKey"))
                object.devicePubKey = options.bytes === String ? $util.base64.encode(message.devicePubKey, 0, message.devicePubKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.devicePubKey) : message.devicePubKey;
            if (message.deviceRandom != null && message.hasOwnProperty("deviceRandom"))
                object.deviceRandom = options.bytes === String ? $util.base64.encode(message.deviceRandom, 0, message.deviceRandom.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceRandom) : message.deviceRandom;
            return object;
        };

        /**
         * Converts this SessionResp0 to JSON.
         * @function toJSON
         * @memberof session.SessionResp0
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SessionResp0.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SessionResp0
         * @function getTypeUrl
         * @memberof session.SessionResp0
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SessionResp0.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.SessionResp0";
        };

        return SessionResp0;
    })();

    session.SessionCmd1 = (function() {

        /**
         * Properties of a SessionCmd1.
         * @memberof session
         * @interface ISessionCmd1
         * @property {Uint8Array|null} [clientVerifyData] SessionCmd1 clientVerifyData
         */

        /**
         * Constructs a new SessionCmd1.
         * @memberof session
         * @classdesc Represents a SessionCmd1.
         * @implements ISessionCmd1
         * @constructor
         * @param {session.ISessionCmd1=} [properties] Properties to set
         */
        function SessionCmd1(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SessionCmd1 clientVerifyData.
         * @member {Uint8Array} clientVerifyData
         * @memberof session.SessionCmd1
         * @instance
         */
        SessionCmd1.prototype.clientVerifyData = $util.newBuffer([]);

        /**
         * Creates a new SessionCmd1 instance using the specified properties.
         * @function create
         * @memberof session.SessionCmd1
         * @static
         * @param {session.ISessionCmd1=} [properties] Properties to set
         * @returns {session.SessionCmd1} SessionCmd1 instance
         */
        SessionCmd1.create = function create(properties) {
            return new SessionCmd1(properties);
        };

        /**
         * Encodes the specified SessionCmd1 message. Does not implicitly {@link session.SessionCmd1.verify|verify} messages.
         * @function encode
         * @memberof session.SessionCmd1
         * @static
         * @param {session.ISessionCmd1} message SessionCmd1 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionCmd1.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.clientVerifyData != null && Object.hasOwnProperty.call(message, "clientVerifyData"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientVerifyData);
            return writer;
        };

        /**
         * Encodes the specified SessionCmd1 message, length delimited. Does not implicitly {@link session.SessionCmd1.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.SessionCmd1
         * @static
         * @param {session.ISessionCmd1} message SessionCmd1 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionCmd1.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SessionCmd1 message from the specified reader or buffer.
         * @function decode
         * @memberof session.SessionCmd1
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.SessionCmd1} SessionCmd1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionCmd1.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.SessionCmd1();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.clientVerifyData = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SessionCmd1 message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.SessionCmd1
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.SessionCmd1} SessionCmd1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionCmd1.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SessionCmd1 message.
         * @function verify
         * @memberof session.SessionCmd1
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SessionCmd1.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.clientVerifyData != null && message.hasOwnProperty("clientVerifyData"))
                if (!(message.clientVerifyData && typeof message.clientVerifyData.length === "number" || $util.isString(message.clientVerifyData)))
                    return "clientVerifyData: buffer expected";
            return null;
        };

        /**
         * Creates a SessionCmd1 message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.SessionCmd1
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.SessionCmd1} SessionCmd1
         */
        SessionCmd1.fromObject = function fromObject(object) {
            if (object instanceof $root.session.SessionCmd1)
                return object;
            var message = new $root.session.SessionCmd1();
            if (object.clientVerifyData != null)
                if (typeof object.clientVerifyData === "string")
                    $util.base64.decode(object.clientVerifyData, message.clientVerifyData = $util.newBuffer($util.base64.length(object.clientVerifyData)), 0);
                else if (object.clientVerifyData.length >= 0)
                    message.clientVerifyData = object.clientVerifyData;
            return message;
        };

        /**
         * Creates a plain object from a SessionCmd1 message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.SessionCmd1
         * @static
         * @param {session.SessionCmd1} message SessionCmd1
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SessionCmd1.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.clientVerifyData = "";
                else {
                    object.clientVerifyData = [];
                    if (options.bytes !== Array)
                        object.clientVerifyData = $util.newBuffer(object.clientVerifyData);
                }
            if (message.clientVerifyData != null && message.hasOwnProperty("clientVerifyData"))
                object.clientVerifyData = options.bytes === String ? $util.base64.encode(message.clientVerifyData, 0, message.clientVerifyData.length) : options.bytes === Array ? Array.prototype.slice.call(message.clientVerifyData) : message.clientVerifyData;
            return object;
        };

        /**
         * Converts this SessionCmd1 to JSON.
         * @function toJSON
         * @memberof session.SessionCmd1
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SessionCmd1.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SessionCmd1
         * @function getTypeUrl
         * @memberof session.SessionCmd1
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SessionCmd1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.SessionCmd1";
        };

        return SessionCmd1;
    })();

    session.SessionResp1 = (function() {

        /**
         * Properties of a SessionResp1.
         * @memberof session
         * @interface ISessionResp1
         * @property {session.Status|null} [status] SessionResp1 status
         * @property {Uint8Array|null} [deviceVerifyData] SessionResp1 deviceVerifyData
         */

        /**
         * Constructs a new SessionResp1.
         * @memberof session
         * @classdesc Represents a SessionResp1.
         * @implements ISessionResp1
         * @constructor
         * @param {session.ISessionResp1=} [properties] Properties to set
         */
        function SessionResp1(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SessionResp1 status.
         * @member {session.Status} status
         * @memberof session.SessionResp1
         * @instance
         */
        SessionResp1.prototype.status = 0;

        /**
         * SessionResp1 deviceVerifyData.
         * @member {Uint8Array} deviceVerifyData
         * @memberof session.SessionResp1
         * @instance
         */
        SessionResp1.prototype.deviceVerifyData = $util.newBuffer([]);

        /**
         * Creates a new SessionResp1 instance using the specified properties.
         * @function create
         * @memberof session.SessionResp1
         * @static
         * @param {session.ISessionResp1=} [properties] Properties to set
         * @returns {session.SessionResp1} SessionResp1 instance
         */
        SessionResp1.create = function create(properties) {
            return new SessionResp1(properties);
        };

        /**
         * Encodes the specified SessionResp1 message. Does not implicitly {@link session.SessionResp1.verify|verify} messages.
         * @function encode
         * @memberof session.SessionResp1
         * @static
         * @param {session.ISessionResp1} message SessionResp1 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionResp1.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
            if (message.deviceVerifyData != null && Object.hasOwnProperty.call(message, "deviceVerifyData"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.deviceVerifyData);
            return writer;
        };

        /**
         * Encodes the specified SessionResp1 message, length delimited. Does not implicitly {@link session.SessionResp1.verify|verify} messages.
         * @function encodeDelimited
         * @memberof session.SessionResp1
         * @static
         * @param {session.ISessionResp1} message SessionResp1 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SessionResp1.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SessionResp1 message from the specified reader or buffer.
         * @function decode
         * @memberof session.SessionResp1
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {session.SessionResp1} SessionResp1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionResp1.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.session.SessionResp1();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.status = reader.int32();
                        break;
                    }
                case 2: {
                        message.deviceVerifyData = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SessionResp1 message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof session.SessionResp1
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {session.SessionResp1} SessionResp1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SessionResp1.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SessionResp1 message.
         * @function verify
         * @memberof session.SessionResp1
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SessionResp1.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    break;
                }
            if (message.deviceVerifyData != null && message.hasOwnProperty("deviceVerifyData"))
                if (!(message.deviceVerifyData && typeof message.deviceVerifyData.length === "number" || $util.isString(message.deviceVerifyData)))
                    return "deviceVerifyData: buffer expected";
            return null;
        };

        /**
         * Creates a SessionResp1 message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof session.SessionResp1
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {session.SessionResp1} SessionResp1
         */
        SessionResp1.fromObject = function fromObject(object) {
            if (object instanceof $root.session.SessionResp1)
                return object;
            var message = new $root.session.SessionResp1();
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "Success":
            case 0:
                message.status = 0;
                break;
            case "InvalidSecScheme":
            case 1:
                message.status = 1;
                break;
            case "InvalidProto":
            case 2:
                message.status = 2;
                break;
            case "TooManySessions":
            case 3:
                message.status = 3;
                break;
            case "InvalidArgument":
            case 4:
                message.status = 4;
                break;
            case "InternalError":
            case 5:
                message.status = 5;
                break;
            case "CryptoError":
            case 6:
                message.status = 6;
                break;
            case "InvalidSession":
            case 7:
                message.status = 7;
                break;
            }
            if (object.deviceVerifyData != null)
                if (typeof object.deviceVerifyData === "string")
                    $util.base64.decode(object.deviceVerifyData, message.deviceVerifyData = $util.newBuffer($util.base64.length(object.deviceVerifyData)), 0);
                else if (object.deviceVerifyData.length >= 0)
                    message.deviceVerifyData = object.deviceVerifyData;
            return message;
        };

        /**
         * Creates a plain object from a SessionResp1 message. Also converts values to other types if specified.
         * @function toObject
         * @memberof session.SessionResp1
         * @static
         * @param {session.SessionResp1} message SessionResp1
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SessionResp1.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.status = options.enums === String ? "Success" : 0;
                if (options.bytes === String)
                    object.deviceVerifyData = "";
                else {
                    object.deviceVerifyData = [];
                    if (options.bytes !== Array)
                        object.deviceVerifyData = $util.newBuffer(object.deviceVerifyData);
                }
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.session.Status[message.status] === undefined ? message.status : $root.session.Status[message.status] : message.status;
            if (message.deviceVerifyData != null && message.hasOwnProperty("deviceVerifyData"))
                object.deviceVerifyData = options.bytes === String ? $util.base64.encode(message.deviceVerifyData, 0, message.deviceVerifyData.length) : options.bytes === Array ? Array.prototype.slice.call(message.deviceVerifyData) : message.deviceVerifyData;
            return object;
        };

        /**
         * Converts this SessionResp1 to JSON.
         * @function toJSON
         * @memberof session.SessionResp1
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SessionResp1.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SessionResp1
         * @function getTypeUrl
         * @memberof session.SessionResp1
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SessionResp1.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/session.SessionResp1";
        };

        return SessionResp1;
    })();

    /**
     * Status enum.
     * @name session.Status
     * @enum {number}
     * @property {number} Success=0 Success value
     * @property {number} InvalidSecScheme=1 InvalidSecScheme value
     * @property {number} InvalidProto=2 InvalidProto value
     * @property {number} TooManySessions=3 TooManySessions value
     * @property {number} InvalidArgument=4 InvalidArgument value
     * @property {number} InternalError=5 InternalError value
     * @property {number} CryptoError=6 CryptoError value
     * @property {number} InvalidSession=7 InvalidSession value
     */
    session.Status = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Success"] = 0;
        values[valuesById[1] = "InvalidSecScheme"] = 1;
        values[valuesById[2] = "InvalidProto"] = 2;
        values[valuesById[3] = "TooManySessions"] = 3;
        values[valuesById[4] = "InvalidArgument"] = 4;
        values[valuesById[5] = "InternalError"] = 5;
        values[valuesById[6] = "CryptoError"] = 6;
        values[valuesById[7] = "InvalidSession"] = 7;
        return values;
    })();

    return session;
})();

$root.wifi_config = (function() {

    /**
     * Namespace wifi_config.
     * @exports wifi_config
     * @namespace
     */
    var wifi_config = {};

    /**
     * WiFiConfigMsgType enum.
     * @name wifi_config.WiFiConfigMsgType
     * @enum {number}
     * @property {number} TypeCmdGetStatus=0 TypeCmdGetStatus value
     * @property {number} TypeRespGetStatus=1 TypeRespGetStatus value
     * @property {number} TypeCmdSetConfig=2 TypeCmdSetConfig value
     * @property {number} TypeRespSetConfig=3 TypeRespSetConfig value
     * @property {number} TypeCmdApplyConfig=4 TypeCmdApplyConfig value
     * @property {number} TypeRespApplyConfig=5 TypeRespApplyConfig value
     */
    wifi_config.WiFiConfigMsgType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "TypeCmdGetStatus"] = 0;
        values[valuesById[1] = "TypeRespGetStatus"] = 1;
        values[valuesById[2] = "TypeCmdSetConfig"] = 2;
        values[valuesById[3] = "TypeRespSetConfig"] = 3;
        values[valuesById[4] = "TypeCmdApplyConfig"] = 4;
        values[valuesById[5] = "TypeRespApplyConfig"] = 5;
        return values;
    })();

    wifi_config.CmdGetStatus = (function() {

        /**
         * Properties of a CmdGetStatus.
         * @memberof wifi_config
         * @interface ICmdGetStatus
         */

        /**
         * Constructs a new CmdGetStatus.
         * @memberof wifi_config
         * @classdesc Represents a CmdGetStatus.
         * @implements ICmdGetStatus
         * @constructor
         * @param {wifi_config.ICmdGetStatus=} [properties] Properties to set
         */
        function CmdGetStatus(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new CmdGetStatus instance using the specified properties.
         * @function create
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {wifi_config.ICmdGetStatus=} [properties] Properties to set
         * @returns {wifi_config.CmdGetStatus} CmdGetStatus instance
         */
        CmdGetStatus.create = function create(properties) {
            return new CmdGetStatus(properties);
        };

        /**
         * Encodes the specified CmdGetStatus message. Does not implicitly {@link wifi_config.CmdGetStatus.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {wifi_config.ICmdGetStatus} message CmdGetStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdGetStatus.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified CmdGetStatus message, length delimited. Does not implicitly {@link wifi_config.CmdGetStatus.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {wifi_config.ICmdGetStatus} message CmdGetStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdGetStatus.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CmdGetStatus message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.CmdGetStatus} CmdGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdGetStatus.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.CmdGetStatus();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CmdGetStatus message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.CmdGetStatus} CmdGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdGetStatus.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CmdGetStatus message.
         * @function verify
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CmdGetStatus.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a CmdGetStatus message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.CmdGetStatus} CmdGetStatus
         */
        CmdGetStatus.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.CmdGetStatus)
                return object;
            return new $root.wifi_config.CmdGetStatus();
        };

        /**
         * Creates a plain object from a CmdGetStatus message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {wifi_config.CmdGetStatus} message CmdGetStatus
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CmdGetStatus.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this CmdGetStatus to JSON.
         * @function toJSON
         * @memberof wifi_config.CmdGetStatus
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CmdGetStatus.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CmdGetStatus
         * @function getTypeUrl
         * @memberof wifi_config.CmdGetStatus
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CmdGetStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.CmdGetStatus";
        };

        return CmdGetStatus;
    })();

    wifi_config.RespGetStatus = (function() {

        /**
         * Properties of a RespGetStatus.
         * @memberof wifi_config
         * @interface IRespGetStatus
         * @property {wifi_config.WifiStationState|null} [staState] RespGetStatus staState
         * @property {wifi_config.WifiConnectFailedReason|null} [failReason] RespGetStatus failReason
         * @property {wifi_config.IWifiConnectedState|null} [connected] RespGetStatus connected
         */

        /**
         * Constructs a new RespGetStatus.
         * @memberof wifi_config
         * @classdesc Represents a RespGetStatus.
         * @implements IRespGetStatus
         * @constructor
         * @param {wifi_config.IRespGetStatus=} [properties] Properties to set
         */
        function RespGetStatus(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RespGetStatus staState.
         * @member {wifi_config.WifiStationState} staState
         * @memberof wifi_config.RespGetStatus
         * @instance
         */
        RespGetStatus.prototype.staState = 0;

        /**
         * RespGetStatus failReason.
         * @member {wifi_config.WifiConnectFailedReason|null|undefined} failReason
         * @memberof wifi_config.RespGetStatus
         * @instance
         */
        RespGetStatus.prototype.failReason = null;

        /**
         * RespGetStatus connected.
         * @member {wifi_config.IWifiConnectedState|null|undefined} connected
         * @memberof wifi_config.RespGetStatus
         * @instance
         */
        RespGetStatus.prototype.connected = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * RespGetStatus state.
         * @member {"failReason"|"connected"|undefined} state
         * @memberof wifi_config.RespGetStatus
         * @instance
         */
        Object.defineProperty(RespGetStatus.prototype, "state", {
            get: $util.oneOfGetter($oneOfFields = ["failReason", "connected"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new RespGetStatus instance using the specified properties.
         * @function create
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {wifi_config.IRespGetStatus=} [properties] Properties to set
         * @returns {wifi_config.RespGetStatus} RespGetStatus instance
         */
        RespGetStatus.create = function create(properties) {
            return new RespGetStatus(properties);
        };

        /**
         * Encodes the specified RespGetStatus message. Does not implicitly {@link wifi_config.RespGetStatus.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {wifi_config.IRespGetStatus} message RespGetStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespGetStatus.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.staState != null && Object.hasOwnProperty.call(message, "staState"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.staState);
            if (message.failReason != null && Object.hasOwnProperty.call(message, "failReason"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.failReason);
            if (message.connected != null && Object.hasOwnProperty.call(message, "connected"))
                $root.wifi_config.WifiConnectedState.encode(message.connected, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RespGetStatus message, length delimited. Does not implicitly {@link wifi_config.RespGetStatus.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {wifi_config.IRespGetStatus} message RespGetStatus message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespGetStatus.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RespGetStatus message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.RespGetStatus} RespGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespGetStatus.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.RespGetStatus();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.staState = reader.int32();
                        break;
                    }
                case 2: {
                        message.failReason = reader.int32();
                        break;
                    }
                case 3: {
                        message.connected = $root.wifi_config.WifiConnectedState.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RespGetStatus message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.RespGetStatus} RespGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespGetStatus.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RespGetStatus message.
         * @function verify
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RespGetStatus.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.staState != null && message.hasOwnProperty("staState"))
                switch (message.staState) {
                default:
                    return "staState: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.failReason != null && message.hasOwnProperty("failReason")) {
                properties.state = 1;
                switch (message.failReason) {
                default:
                    return "failReason: enum value expected";
                case 0:
                case 1:
                    break;
                }
            }
            if (message.connected != null && message.hasOwnProperty("connected")) {
                if (properties.state === 1)
                    return "state: multiple values";
                properties.state = 1;
                {
                    var error = $root.wifi_config.WifiConnectedState.verify(message.connected);
                    if (error)
                        return "connected." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RespGetStatus message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.RespGetStatus} RespGetStatus
         */
        RespGetStatus.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.RespGetStatus)
                return object;
            var message = new $root.wifi_config.RespGetStatus();
            switch (object.staState) {
            default:
                if (typeof object.staState === "number") {
                    message.staState = object.staState;
                    break;
                }
                break;
            case "Connected":
            case 0:
                message.staState = 0;
                break;
            case "Connecting":
            case 1:
                message.staState = 1;
                break;
            case "Disconnected":
            case 2:
                message.staState = 2;
                break;
            case "ConnectionFailed":
            case 3:
                message.staState = 3;
                break;
            }
            switch (object.failReason) {
            default:
                if (typeof object.failReason === "number") {
                    message.failReason = object.failReason;
                    break;
                }
                break;
            case "AuthError":
            case 0:
                message.failReason = 0;
                break;
            case "NetworkNotFound":
            case 1:
                message.failReason = 1;
                break;
            }
            if (object.connected != null) {
                if (typeof object.connected !== "object")
                    throw TypeError(".wifi_config.RespGetStatus.connected: object expected");
                message.connected = $root.wifi_config.WifiConnectedState.fromObject(object.connected);
            }
            return message;
        };

        /**
         * Creates a plain object from a RespGetStatus message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {wifi_config.RespGetStatus} message RespGetStatus
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RespGetStatus.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.staState = options.enums === String ? "Connected" : 0;
            if (message.staState != null && message.hasOwnProperty("staState"))
                object.staState = options.enums === String ? $root.wifi_config.WifiStationState[message.staState] === undefined ? message.staState : $root.wifi_config.WifiStationState[message.staState] : message.staState;
            if (message.failReason != null && message.hasOwnProperty("failReason")) {
                object.failReason = options.enums === String ? $root.wifi_config.WifiConnectFailedReason[message.failReason] === undefined ? message.failReason : $root.wifi_config.WifiConnectFailedReason[message.failReason] : message.failReason;
                if (options.oneofs)
                    object.state = "failReason";
            }
            if (message.connected != null && message.hasOwnProperty("connected")) {
                object.connected = $root.wifi_config.WifiConnectedState.toObject(message.connected, options);
                if (options.oneofs)
                    object.state = "connected";
            }
            return object;
        };

        /**
         * Converts this RespGetStatus to JSON.
         * @function toJSON
         * @memberof wifi_config.RespGetStatus
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RespGetStatus.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RespGetStatus
         * @function getTypeUrl
         * @memberof wifi_config.RespGetStatus
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RespGetStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.RespGetStatus";
        };

        return RespGetStatus;
    })();

    /**
     * WifiStationState enum.
     * @name wifi_config.WifiStationState
     * @enum {number}
     * @property {number} Connected=0 Connected value
     * @property {number} Connecting=1 Connecting value
     * @property {number} Disconnected=2 Disconnected value
     * @property {number} ConnectionFailed=3 ConnectionFailed value
     */
    wifi_config.WifiStationState = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Connected"] = 0;
        values[valuesById[1] = "Connecting"] = 1;
        values[valuesById[2] = "Disconnected"] = 2;
        values[valuesById[3] = "ConnectionFailed"] = 3;
        return values;
    })();

    /**
     * WifiConnectFailedReason enum.
     * @name wifi_config.WifiConnectFailedReason
     * @enum {number}
     * @property {number} AuthError=0 AuthError value
     * @property {number} NetworkNotFound=1 NetworkNotFound value
     */
    wifi_config.WifiConnectFailedReason = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "AuthError"] = 0;
        values[valuesById[1] = "NetworkNotFound"] = 1;
        return values;
    })();

    wifi_config.WifiConnectedState = (function() {

        /**
         * Properties of a WifiConnectedState.
         * @memberof wifi_config
         * @interface IWifiConnectedState
         * @property {string|null} [ip4Addr] WifiConnectedState ip4Addr
         * @property {Uint8Array|null} [bssid] WifiConnectedState bssid
         * @property {string|null} [ssid] WifiConnectedState ssid
         */

        /**
         * Constructs a new WifiConnectedState.
         * @memberof wifi_config
         * @classdesc Represents a WifiConnectedState.
         * @implements IWifiConnectedState
         * @constructor
         * @param {wifi_config.IWifiConnectedState=} [properties] Properties to set
         */
        function WifiConnectedState(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WifiConnectedState ip4Addr.
         * @member {string} ip4Addr
         * @memberof wifi_config.WifiConnectedState
         * @instance
         */
        WifiConnectedState.prototype.ip4Addr = "";

        /**
         * WifiConnectedState bssid.
         * @member {Uint8Array} bssid
         * @memberof wifi_config.WifiConnectedState
         * @instance
         */
        WifiConnectedState.prototype.bssid = $util.newBuffer([]);

        /**
         * WifiConnectedState ssid.
         * @member {string} ssid
         * @memberof wifi_config.WifiConnectedState
         * @instance
         */
        WifiConnectedState.prototype.ssid = "";

        /**
         * Creates a new WifiConnectedState instance using the specified properties.
         * @function create
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {wifi_config.IWifiConnectedState=} [properties] Properties to set
         * @returns {wifi_config.WifiConnectedState} WifiConnectedState instance
         */
        WifiConnectedState.create = function create(properties) {
            return new WifiConnectedState(properties);
        };

        /**
         * Encodes the specified WifiConnectedState message. Does not implicitly {@link wifi_config.WifiConnectedState.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {wifi_config.IWifiConnectedState} message WifiConnectedState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WifiConnectedState.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ip4Addr != null && Object.hasOwnProperty.call(message, "ip4Addr"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.ip4Addr);
            if (message.bssid != null && Object.hasOwnProperty.call(message, "bssid"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.bssid);
            if (message.ssid != null && Object.hasOwnProperty.call(message, "ssid"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.ssid);
            return writer;
        };

        /**
         * Encodes the specified WifiConnectedState message, length delimited. Does not implicitly {@link wifi_config.WifiConnectedState.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {wifi_config.IWifiConnectedState} message WifiConnectedState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WifiConnectedState.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WifiConnectedState message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.WifiConnectedState} WifiConnectedState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WifiConnectedState.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.WifiConnectedState();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.ip4Addr = reader.string();
                        break;
                    }
                case 2: {
                        message.bssid = reader.bytes();
                        break;
                    }
                case 3: {
                        message.ssid = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WifiConnectedState message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.WifiConnectedState} WifiConnectedState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WifiConnectedState.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WifiConnectedState message.
         * @function verify
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WifiConnectedState.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ip4Addr != null && message.hasOwnProperty("ip4Addr"))
                if (!$util.isString(message.ip4Addr))
                    return "ip4Addr: string expected";
            if (message.bssid != null && message.hasOwnProperty("bssid"))
                if (!(message.bssid && typeof message.bssid.length === "number" || $util.isString(message.bssid)))
                    return "bssid: buffer expected";
            if (message.ssid != null && message.hasOwnProperty("ssid"))
                if (!$util.isString(message.ssid))
                    return "ssid: string expected";
            return null;
        };

        /**
         * Creates a WifiConnectedState message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.WifiConnectedState} WifiConnectedState
         */
        WifiConnectedState.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.WifiConnectedState)
                return object;
            var message = new $root.wifi_config.WifiConnectedState();
            if (object.ip4Addr != null)
                message.ip4Addr = String(object.ip4Addr);
            if (object.bssid != null)
                if (typeof object.bssid === "string")
                    $util.base64.decode(object.bssid, message.bssid = $util.newBuffer($util.base64.length(object.bssid)), 0);
                else if (object.bssid.length >= 0)
                    message.bssid = object.bssid;
            if (object.ssid != null)
                message.ssid = String(object.ssid);
            return message;
        };

        /**
         * Creates a plain object from a WifiConnectedState message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {wifi_config.WifiConnectedState} message WifiConnectedState
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WifiConnectedState.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.ip4Addr = "";
                if (options.bytes === String)
                    object.bssid = "";
                else {
                    object.bssid = [];
                    if (options.bytes !== Array)
                        object.bssid = $util.newBuffer(object.bssid);
                }
                object.ssid = "";
            }
            if (message.ip4Addr != null && message.hasOwnProperty("ip4Addr"))
                object.ip4Addr = message.ip4Addr;
            if (message.bssid != null && message.hasOwnProperty("bssid"))
                object.bssid = options.bytes === String ? $util.base64.encode(message.bssid, 0, message.bssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.bssid) : message.bssid;
            if (message.ssid != null && message.hasOwnProperty("ssid"))
                object.ssid = message.ssid;
            return object;
        };

        /**
         * Converts this WifiConnectedState to JSON.
         * @function toJSON
         * @memberof wifi_config.WifiConnectedState
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WifiConnectedState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WifiConnectedState
         * @function getTypeUrl
         * @memberof wifi_config.WifiConnectedState
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WifiConnectedState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.WifiConnectedState";
        };

        return WifiConnectedState;
    })();

    wifi_config.CmdSetConfig = (function() {

        /**
         * Properties of a CmdSetConfig.
         * @memberof wifi_config
         * @interface ICmdSetConfig
         * @property {Uint8Array|null} [ssid] CmdSetConfig ssid
         * @property {Uint8Array|null} [passphrase] CmdSetConfig passphrase
         * @property {Uint8Array|null} [bssid] CmdSetConfig bssid
         */

        /**
         * Constructs a new CmdSetConfig.
         * @memberof wifi_config
         * @classdesc Represents a CmdSetConfig.
         * @implements ICmdSetConfig
         * @constructor
         * @param {wifi_config.ICmdSetConfig=} [properties] Properties to set
         */
        function CmdSetConfig(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CmdSetConfig ssid.
         * @member {Uint8Array} ssid
         * @memberof wifi_config.CmdSetConfig
         * @instance
         */
        CmdSetConfig.prototype.ssid = $util.newBuffer([]);

        /**
         * CmdSetConfig passphrase.
         * @member {Uint8Array} passphrase
         * @memberof wifi_config.CmdSetConfig
         * @instance
         */
        CmdSetConfig.prototype.passphrase = $util.newBuffer([]);

        /**
         * CmdSetConfig bssid.
         * @member {Uint8Array} bssid
         * @memberof wifi_config.CmdSetConfig
         * @instance
         */
        CmdSetConfig.prototype.bssid = $util.newBuffer([]);

        /**
         * Creates a new CmdSetConfig instance using the specified properties.
         * @function create
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {wifi_config.ICmdSetConfig=} [properties] Properties to set
         * @returns {wifi_config.CmdSetConfig} CmdSetConfig instance
         */
        CmdSetConfig.create = function create(properties) {
            return new CmdSetConfig(properties);
        };

        /**
         * Encodes the specified CmdSetConfig message. Does not implicitly {@link wifi_config.CmdSetConfig.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {wifi_config.ICmdSetConfig} message CmdSetConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdSetConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ssid != null && Object.hasOwnProperty.call(message, "ssid"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ssid);
            if (message.passphrase != null && Object.hasOwnProperty.call(message, "passphrase"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.passphrase);
            if (message.bssid != null && Object.hasOwnProperty.call(message, "bssid"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.bssid);
            return writer;
        };

        /**
         * Encodes the specified CmdSetConfig message, length delimited. Does not implicitly {@link wifi_config.CmdSetConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {wifi_config.ICmdSetConfig} message CmdSetConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdSetConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CmdSetConfig message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.CmdSetConfig} CmdSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdSetConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.CmdSetConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.ssid = reader.bytes();
                        break;
                    }
                case 2: {
                        message.passphrase = reader.bytes();
                        break;
                    }
                case 3: {
                        message.bssid = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CmdSetConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.CmdSetConfig} CmdSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdSetConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CmdSetConfig message.
         * @function verify
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CmdSetConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ssid != null && message.hasOwnProperty("ssid"))
                if (!(message.ssid && typeof message.ssid.length === "number" || $util.isString(message.ssid)))
                    return "ssid: buffer expected";
            if (message.passphrase != null && message.hasOwnProperty("passphrase"))
                if (!(message.passphrase && typeof message.passphrase.length === "number" || $util.isString(message.passphrase)))
                    return "passphrase: buffer expected";
            if (message.bssid != null && message.hasOwnProperty("bssid"))
                if (!(message.bssid && typeof message.bssid.length === "number" || $util.isString(message.bssid)))
                    return "bssid: buffer expected";
            return null;
        };

        /**
         * Creates a CmdSetConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.CmdSetConfig} CmdSetConfig
         */
        CmdSetConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.CmdSetConfig)
                return object;
            var message = new $root.wifi_config.CmdSetConfig();
            if (object.ssid != null)
                if (typeof object.ssid === "string")
                    $util.base64.decode(object.ssid, message.ssid = $util.newBuffer($util.base64.length(object.ssid)), 0);
                else if (object.ssid.length >= 0)
                    message.ssid = object.ssid;
            if (object.passphrase != null)
                if (typeof object.passphrase === "string")
                    $util.base64.decode(object.passphrase, message.passphrase = $util.newBuffer($util.base64.length(object.passphrase)), 0);
                else if (object.passphrase.length >= 0)
                    message.passphrase = object.passphrase;
            if (object.bssid != null)
                if (typeof object.bssid === "string")
                    $util.base64.decode(object.bssid, message.bssid = $util.newBuffer($util.base64.length(object.bssid)), 0);
                else if (object.bssid.length >= 0)
                    message.bssid = object.bssid;
            return message;
        };

        /**
         * Creates a plain object from a CmdSetConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {wifi_config.CmdSetConfig} message CmdSetConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CmdSetConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.ssid = "";
                else {
                    object.ssid = [];
                    if (options.bytes !== Array)
                        object.ssid = $util.newBuffer(object.ssid);
                }
                if (options.bytes === String)
                    object.passphrase = "";
                else {
                    object.passphrase = [];
                    if (options.bytes !== Array)
                        object.passphrase = $util.newBuffer(object.passphrase);
                }
                if (options.bytes === String)
                    object.bssid = "";
                else {
                    object.bssid = [];
                    if (options.bytes !== Array)
                        object.bssid = $util.newBuffer(object.bssid);
                }
            }
            if (message.ssid != null && message.hasOwnProperty("ssid"))
                object.ssid = options.bytes === String ? $util.base64.encode(message.ssid, 0, message.ssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.ssid) : message.ssid;
            if (message.passphrase != null && message.hasOwnProperty("passphrase"))
                object.passphrase = options.bytes === String ? $util.base64.encode(message.passphrase, 0, message.passphrase.length) : options.bytes === Array ? Array.prototype.slice.call(message.passphrase) : message.passphrase;
            if (message.bssid != null && message.hasOwnProperty("bssid"))
                object.bssid = options.bytes === String ? $util.base64.encode(message.bssid, 0, message.bssid.length) : options.bytes === Array ? Array.prototype.slice.call(message.bssid) : message.bssid;
            return object;
        };

        /**
         * Converts this CmdSetConfig to JSON.
         * @function toJSON
         * @memberof wifi_config.CmdSetConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CmdSetConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CmdSetConfig
         * @function getTypeUrl
         * @memberof wifi_config.CmdSetConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CmdSetConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.CmdSetConfig";
        };

        return CmdSetConfig;
    })();

    wifi_config.RespSetConfig = (function() {

        /**
         * Properties of a RespSetConfig.
         * @memberof wifi_config
         * @interface IRespSetConfig
         * @property {wifi_config.Status|null} [status] RespSetConfig status
         */

        /**
         * Constructs a new RespSetConfig.
         * @memberof wifi_config
         * @classdesc Represents a RespSetConfig.
         * @implements IRespSetConfig
         * @constructor
         * @param {wifi_config.IRespSetConfig=} [properties] Properties to set
         */
        function RespSetConfig(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RespSetConfig status.
         * @member {wifi_config.Status} status
         * @memberof wifi_config.RespSetConfig
         * @instance
         */
        RespSetConfig.prototype.status = 0;

        /**
         * Creates a new RespSetConfig instance using the specified properties.
         * @function create
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {wifi_config.IRespSetConfig=} [properties] Properties to set
         * @returns {wifi_config.RespSetConfig} RespSetConfig instance
         */
        RespSetConfig.create = function create(properties) {
            return new RespSetConfig(properties);
        };

        /**
         * Encodes the specified RespSetConfig message. Does not implicitly {@link wifi_config.RespSetConfig.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {wifi_config.IRespSetConfig} message RespSetConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespSetConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified RespSetConfig message, length delimited. Does not implicitly {@link wifi_config.RespSetConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {wifi_config.IRespSetConfig} message RespSetConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespSetConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RespSetConfig message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.RespSetConfig} RespSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespSetConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.RespSetConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.status = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RespSetConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.RespSetConfig} RespSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespSetConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RespSetConfig message.
         * @function verify
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RespSetConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    break;
                }
            return null;
        };

        /**
         * Creates a RespSetConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.RespSetConfig} RespSetConfig
         */
        RespSetConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.RespSetConfig)
                return object;
            var message = new $root.wifi_config.RespSetConfig();
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "Success":
            case 0:
                message.status = 0;
                break;
            case "InvalidSecScheme":
            case 1:
                message.status = 1;
                break;
            case "InvalidProto":
            case 2:
                message.status = 2;
                break;
            case "TooManySessions":
            case 3:
                message.status = 3;
                break;
            case "InvalidArgument":
            case 4:
                message.status = 4;
                break;
            case "InternalError":
            case 5:
                message.status = 5;
                break;
            case "CryptoError":
            case 6:
                message.status = 6;
                break;
            case "InvalidSession":
            case 7:
                message.status = 7;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a RespSetConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {wifi_config.RespSetConfig} message RespSetConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RespSetConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.status = options.enums === String ? "Success" : 0;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.wifi_config.Status[message.status] === undefined ? message.status : $root.wifi_config.Status[message.status] : message.status;
            return object;
        };

        /**
         * Converts this RespSetConfig to JSON.
         * @function toJSON
         * @memberof wifi_config.RespSetConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RespSetConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RespSetConfig
         * @function getTypeUrl
         * @memberof wifi_config.RespSetConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RespSetConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.RespSetConfig";
        };

        return RespSetConfig;
    })();

    wifi_config.CmdApplyConfig = (function() {

        /**
         * Properties of a CmdApplyConfig.
         * @memberof wifi_config
         * @interface ICmdApplyConfig
         */

        /**
         * Constructs a new CmdApplyConfig.
         * @memberof wifi_config
         * @classdesc Represents a CmdApplyConfig.
         * @implements ICmdApplyConfig
         * @constructor
         * @param {wifi_config.ICmdApplyConfig=} [properties] Properties to set
         */
        function CmdApplyConfig(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new CmdApplyConfig instance using the specified properties.
         * @function create
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {wifi_config.ICmdApplyConfig=} [properties] Properties to set
         * @returns {wifi_config.CmdApplyConfig} CmdApplyConfig instance
         */
        CmdApplyConfig.create = function create(properties) {
            return new CmdApplyConfig(properties);
        };

        /**
         * Encodes the specified CmdApplyConfig message. Does not implicitly {@link wifi_config.CmdApplyConfig.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {wifi_config.ICmdApplyConfig} message CmdApplyConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdApplyConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified CmdApplyConfig message, length delimited. Does not implicitly {@link wifi_config.CmdApplyConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {wifi_config.ICmdApplyConfig} message CmdApplyConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CmdApplyConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CmdApplyConfig message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.CmdApplyConfig} CmdApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdApplyConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.CmdApplyConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CmdApplyConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.CmdApplyConfig} CmdApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CmdApplyConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CmdApplyConfig message.
         * @function verify
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CmdApplyConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a CmdApplyConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.CmdApplyConfig} CmdApplyConfig
         */
        CmdApplyConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.CmdApplyConfig)
                return object;
            return new $root.wifi_config.CmdApplyConfig();
        };

        /**
         * Creates a plain object from a CmdApplyConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {wifi_config.CmdApplyConfig} message CmdApplyConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CmdApplyConfig.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this CmdApplyConfig to JSON.
         * @function toJSON
         * @memberof wifi_config.CmdApplyConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CmdApplyConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CmdApplyConfig
         * @function getTypeUrl
         * @memberof wifi_config.CmdApplyConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CmdApplyConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.CmdApplyConfig";
        };

        return CmdApplyConfig;
    })();

    wifi_config.RespApplyConfig = (function() {

        /**
         * Properties of a RespApplyConfig.
         * @memberof wifi_config
         * @interface IRespApplyConfig
         * @property {wifi_config.Status|null} [status] RespApplyConfig status
         */

        /**
         * Constructs a new RespApplyConfig.
         * @memberof wifi_config
         * @classdesc Represents a RespApplyConfig.
         * @implements IRespApplyConfig
         * @constructor
         * @param {wifi_config.IRespApplyConfig=} [properties] Properties to set
         */
        function RespApplyConfig(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RespApplyConfig status.
         * @member {wifi_config.Status} status
         * @memberof wifi_config.RespApplyConfig
         * @instance
         */
        RespApplyConfig.prototype.status = 0;

        /**
         * Creates a new RespApplyConfig instance using the specified properties.
         * @function create
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {wifi_config.IRespApplyConfig=} [properties] Properties to set
         * @returns {wifi_config.RespApplyConfig} RespApplyConfig instance
         */
        RespApplyConfig.create = function create(properties) {
            return new RespApplyConfig(properties);
        };

        /**
         * Encodes the specified RespApplyConfig message. Does not implicitly {@link wifi_config.RespApplyConfig.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {wifi_config.IRespApplyConfig} message RespApplyConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespApplyConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified RespApplyConfig message, length delimited. Does not implicitly {@link wifi_config.RespApplyConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {wifi_config.IRespApplyConfig} message RespApplyConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RespApplyConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RespApplyConfig message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.RespApplyConfig} RespApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespApplyConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.RespApplyConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.status = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RespApplyConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.RespApplyConfig} RespApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RespApplyConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RespApplyConfig message.
         * @function verify
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RespApplyConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    break;
                }
            return null;
        };

        /**
         * Creates a RespApplyConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.RespApplyConfig} RespApplyConfig
         */
        RespApplyConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.RespApplyConfig)
                return object;
            var message = new $root.wifi_config.RespApplyConfig();
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "Success":
            case 0:
                message.status = 0;
                break;
            case "InvalidSecScheme":
            case 1:
                message.status = 1;
                break;
            case "InvalidProto":
            case 2:
                message.status = 2;
                break;
            case "TooManySessions":
            case 3:
                message.status = 3;
                break;
            case "InvalidArgument":
            case 4:
                message.status = 4;
                break;
            case "InternalError":
            case 5:
                message.status = 5;
                break;
            case "CryptoError":
            case 6:
                message.status = 6;
                break;
            case "InvalidSession":
            case 7:
                message.status = 7;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a RespApplyConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {wifi_config.RespApplyConfig} message RespApplyConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RespApplyConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.status = options.enums === String ? "Success" : 0;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.wifi_config.Status[message.status] === undefined ? message.status : $root.wifi_config.Status[message.status] : message.status;
            return object;
        };

        /**
         * Converts this RespApplyConfig to JSON.
         * @function toJSON
         * @memberof wifi_config.RespApplyConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RespApplyConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RespApplyConfig
         * @function getTypeUrl
         * @memberof wifi_config.RespApplyConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RespApplyConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.RespApplyConfig";
        };

        return RespApplyConfig;
    })();

    /**
     * Status enum.
     * @name wifi_config.Status
     * @enum {number}
     * @property {number} Success=0 Success value
     * @property {number} InvalidSecScheme=1 InvalidSecScheme value
     * @property {number} InvalidProto=2 InvalidProto value
     * @property {number} TooManySessions=3 TooManySessions value
     * @property {number} InvalidArgument=4 InvalidArgument value
     * @property {number} InternalError=5 InternalError value
     * @property {number} CryptoError=6 CryptoError value
     * @property {number} InvalidSession=7 InvalidSession value
     */
    wifi_config.Status = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Success"] = 0;
        values[valuesById[1] = "InvalidSecScheme"] = 1;
        values[valuesById[2] = "InvalidProto"] = 2;
        values[valuesById[3] = "TooManySessions"] = 3;
        values[valuesById[4] = "InvalidArgument"] = 4;
        values[valuesById[5] = "InternalError"] = 5;
        values[valuesById[6] = "CryptoError"] = 6;
        values[valuesById[7] = "InvalidSession"] = 7;
        return values;
    })();

    wifi_config.WiFiConfigPayload = (function() {

        /**
         * Properties of a WiFiConfigPayload.
         * @memberof wifi_config
         * @interface IWiFiConfigPayload
         * @property {wifi_config.WiFiConfigMsgType|null} [msg] WiFiConfigPayload msg
         * @property {wifi_config.ICmdGetStatus|null} [cmdGetStatus] WiFiConfigPayload cmdGetStatus
         * @property {wifi_config.IRespGetStatus|null} [respGetStatus] WiFiConfigPayload respGetStatus
         * @property {wifi_config.ICmdSetConfig|null} [cmdSetConfig] WiFiConfigPayload cmdSetConfig
         * @property {wifi_config.IRespSetConfig|null} [respSetConfig] WiFiConfigPayload respSetConfig
         * @property {wifi_config.ICmdApplyConfig|null} [cmdApplyConfig] WiFiConfigPayload cmdApplyConfig
         * @property {wifi_config.IRespApplyConfig|null} [respApplyConfig] WiFiConfigPayload respApplyConfig
         */

        /**
         * Constructs a new WiFiConfigPayload.
         * @memberof wifi_config
         * @classdesc Represents a WiFiConfigPayload.
         * @implements IWiFiConfigPayload
         * @constructor
         * @param {wifi_config.IWiFiConfigPayload=} [properties] Properties to set
         */
        function WiFiConfigPayload(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WiFiConfigPayload msg.
         * @member {wifi_config.WiFiConfigMsgType} msg
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.msg = 0;

        /**
         * WiFiConfigPayload cmdGetStatus.
         * @member {wifi_config.ICmdGetStatus|null|undefined} cmdGetStatus
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.cmdGetStatus = null;

        /**
         * WiFiConfigPayload respGetStatus.
         * @member {wifi_config.IRespGetStatus|null|undefined} respGetStatus
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.respGetStatus = null;

        /**
         * WiFiConfigPayload cmdSetConfig.
         * @member {wifi_config.ICmdSetConfig|null|undefined} cmdSetConfig
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.cmdSetConfig = null;

        /**
         * WiFiConfigPayload respSetConfig.
         * @member {wifi_config.IRespSetConfig|null|undefined} respSetConfig
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.respSetConfig = null;

        /**
         * WiFiConfigPayload cmdApplyConfig.
         * @member {wifi_config.ICmdApplyConfig|null|undefined} cmdApplyConfig
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.cmdApplyConfig = null;

        /**
         * WiFiConfigPayload respApplyConfig.
         * @member {wifi_config.IRespApplyConfig|null|undefined} respApplyConfig
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        WiFiConfigPayload.prototype.respApplyConfig = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * WiFiConfigPayload payload.
         * @member {"cmdGetStatus"|"respGetStatus"|"cmdSetConfig"|"respSetConfig"|"cmdApplyConfig"|"respApplyConfig"|undefined} payload
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         */
        Object.defineProperty(WiFiConfigPayload.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["cmdGetStatus", "respGetStatus", "cmdSetConfig", "respSetConfig", "cmdApplyConfig", "respApplyConfig"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new WiFiConfigPayload instance using the specified properties.
         * @function create
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {wifi_config.IWiFiConfigPayload=} [properties] Properties to set
         * @returns {wifi_config.WiFiConfigPayload} WiFiConfigPayload instance
         */
        WiFiConfigPayload.create = function create(properties) {
            return new WiFiConfigPayload(properties);
        };

        /**
         * Encodes the specified WiFiConfigPayload message. Does not implicitly {@link wifi_config.WiFiConfigPayload.verify|verify} messages.
         * @function encode
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {wifi_config.IWiFiConfigPayload} message WiFiConfigPayload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WiFiConfigPayload.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.msg);
            if (message.cmdGetStatus != null && Object.hasOwnProperty.call(message, "cmdGetStatus"))
                $root.wifi_config.CmdGetStatus.encode(message.cmdGetStatus, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.respGetStatus != null && Object.hasOwnProperty.call(message, "respGetStatus"))
                $root.wifi_config.RespGetStatus.encode(message.respGetStatus, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.cmdSetConfig != null && Object.hasOwnProperty.call(message, "cmdSetConfig"))
                $root.wifi_config.CmdSetConfig.encode(message.cmdSetConfig, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.respSetConfig != null && Object.hasOwnProperty.call(message, "respSetConfig"))
                $root.wifi_config.RespSetConfig.encode(message.respSetConfig, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.cmdApplyConfig != null && Object.hasOwnProperty.call(message, "cmdApplyConfig"))
                $root.wifi_config.CmdApplyConfig.encode(message.cmdApplyConfig, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.respApplyConfig != null && Object.hasOwnProperty.call(message, "respApplyConfig"))
                $root.wifi_config.RespApplyConfig.encode(message.respApplyConfig, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified WiFiConfigPayload message, length delimited. Does not implicitly {@link wifi_config.WiFiConfigPayload.verify|verify} messages.
         * @function encodeDelimited
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {wifi_config.IWiFiConfigPayload} message WiFiConfigPayload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WiFiConfigPayload.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WiFiConfigPayload message from the specified reader or buffer.
         * @function decode
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {wifi_config.WiFiConfigPayload} WiFiConfigPayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WiFiConfigPayload.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.wifi_config.WiFiConfigPayload();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.msg = reader.int32();
                        break;
                    }
                case 10: {
                        message.cmdGetStatus = $root.wifi_config.CmdGetStatus.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.respGetStatus = $root.wifi_config.RespGetStatus.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.cmdSetConfig = $root.wifi_config.CmdSetConfig.decode(reader, reader.uint32());
                        break;
                    }
                case 13: {
                        message.respSetConfig = $root.wifi_config.RespSetConfig.decode(reader, reader.uint32());
                        break;
                    }
                case 14: {
                        message.cmdApplyConfig = $root.wifi_config.CmdApplyConfig.decode(reader, reader.uint32());
                        break;
                    }
                case 15: {
                        message.respApplyConfig = $root.wifi_config.RespApplyConfig.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WiFiConfigPayload message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {wifi_config.WiFiConfigPayload} WiFiConfigPayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WiFiConfigPayload.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WiFiConfigPayload message.
         * @function verify
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WiFiConfigPayload.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.msg != null && message.hasOwnProperty("msg"))
                switch (message.msg) {
                default:
                    return "msg: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.cmdGetStatus != null && message.hasOwnProperty("cmdGetStatus")) {
                properties.payload = 1;
                {
                    var error = $root.wifi_config.CmdGetStatus.verify(message.cmdGetStatus);
                    if (error)
                        return "cmdGetStatus." + error;
                }
            }
            if (message.respGetStatus != null && message.hasOwnProperty("respGetStatus")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.wifi_config.RespGetStatus.verify(message.respGetStatus);
                    if (error)
                        return "respGetStatus." + error;
                }
            }
            if (message.cmdSetConfig != null && message.hasOwnProperty("cmdSetConfig")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.wifi_config.CmdSetConfig.verify(message.cmdSetConfig);
                    if (error)
                        return "cmdSetConfig." + error;
                }
            }
            if (message.respSetConfig != null && message.hasOwnProperty("respSetConfig")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.wifi_config.RespSetConfig.verify(message.respSetConfig);
                    if (error)
                        return "respSetConfig." + error;
                }
            }
            if (message.cmdApplyConfig != null && message.hasOwnProperty("cmdApplyConfig")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.wifi_config.CmdApplyConfig.verify(message.cmdApplyConfig);
                    if (error)
                        return "cmdApplyConfig." + error;
                }
            }
            if (message.respApplyConfig != null && message.hasOwnProperty("respApplyConfig")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.wifi_config.RespApplyConfig.verify(message.respApplyConfig);
                    if (error)
                        return "respApplyConfig." + error;
                }
            }
            return null;
        };

        /**
         * Creates a WiFiConfigPayload message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {wifi_config.WiFiConfigPayload} WiFiConfigPayload
         */
        WiFiConfigPayload.fromObject = function fromObject(object) {
            if (object instanceof $root.wifi_config.WiFiConfigPayload)
                return object;
            var message = new $root.wifi_config.WiFiConfigPayload();
            switch (object.msg) {
            default:
                if (typeof object.msg === "number") {
                    message.msg = object.msg;
                    break;
                }
                break;
            case "TypeCmdGetStatus":
            case 0:
                message.msg = 0;
                break;
            case "TypeRespGetStatus":
            case 1:
                message.msg = 1;
                break;
            case "TypeCmdSetConfig":
            case 2:
                message.msg = 2;
                break;
            case "TypeRespSetConfig":
            case 3:
                message.msg = 3;
                break;
            case "TypeCmdApplyConfig":
            case 4:
                message.msg = 4;
                break;
            case "TypeRespApplyConfig":
            case 5:
                message.msg = 5;
                break;
            }
            if (object.cmdGetStatus != null) {
                if (typeof object.cmdGetStatus !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.cmdGetStatus: object expected");
                message.cmdGetStatus = $root.wifi_config.CmdGetStatus.fromObject(object.cmdGetStatus);
            }
            if (object.respGetStatus != null) {
                if (typeof object.respGetStatus !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.respGetStatus: object expected");
                message.respGetStatus = $root.wifi_config.RespGetStatus.fromObject(object.respGetStatus);
            }
            if (object.cmdSetConfig != null) {
                if (typeof object.cmdSetConfig !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.cmdSetConfig: object expected");
                message.cmdSetConfig = $root.wifi_config.CmdSetConfig.fromObject(object.cmdSetConfig);
            }
            if (object.respSetConfig != null) {
                if (typeof object.respSetConfig !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.respSetConfig: object expected");
                message.respSetConfig = $root.wifi_config.RespSetConfig.fromObject(object.respSetConfig);
            }
            if (object.cmdApplyConfig != null) {
                if (typeof object.cmdApplyConfig !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.cmdApplyConfig: object expected");
                message.cmdApplyConfig = $root.wifi_config.CmdApplyConfig.fromObject(object.cmdApplyConfig);
            }
            if (object.respApplyConfig != null) {
                if (typeof object.respApplyConfig !== "object")
                    throw TypeError(".wifi_config.WiFiConfigPayload.respApplyConfig: object expected");
                message.respApplyConfig = $root.wifi_config.RespApplyConfig.fromObject(object.respApplyConfig);
            }
            return message;
        };

        /**
         * Creates a plain object from a WiFiConfigPayload message. Also converts values to other types if specified.
         * @function toObject
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {wifi_config.WiFiConfigPayload} message WiFiConfigPayload
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WiFiConfigPayload.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.msg = options.enums === String ? "TypeCmdGetStatus" : 0;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = options.enums === String ? $root.wifi_config.WiFiConfigMsgType[message.msg] === undefined ? message.msg : $root.wifi_config.WiFiConfigMsgType[message.msg] : message.msg;
            if (message.cmdGetStatus != null && message.hasOwnProperty("cmdGetStatus")) {
                object.cmdGetStatus = $root.wifi_config.CmdGetStatus.toObject(message.cmdGetStatus, options);
                if (options.oneofs)
                    object.payload = "cmdGetStatus";
            }
            if (message.respGetStatus != null && message.hasOwnProperty("respGetStatus")) {
                object.respGetStatus = $root.wifi_config.RespGetStatus.toObject(message.respGetStatus, options);
                if (options.oneofs)
                    object.payload = "respGetStatus";
            }
            if (message.cmdSetConfig != null && message.hasOwnProperty("cmdSetConfig")) {
                object.cmdSetConfig = $root.wifi_config.CmdSetConfig.toObject(message.cmdSetConfig, options);
                if (options.oneofs)
                    object.payload = "cmdSetConfig";
            }
            if (message.respSetConfig != null && message.hasOwnProperty("respSetConfig")) {
                object.respSetConfig = $root.wifi_config.RespSetConfig.toObject(message.respSetConfig, options);
                if (options.oneofs)
                    object.payload = "respSetConfig";
            }
            if (message.cmdApplyConfig != null && message.hasOwnProperty("cmdApplyConfig")) {
                object.cmdApplyConfig = $root.wifi_config.CmdApplyConfig.toObject(message.cmdApplyConfig, options);
                if (options.oneofs)
                    object.payload = "cmdApplyConfig";
            }
            if (message.respApplyConfig != null && message.hasOwnProperty("respApplyConfig")) {
                object.respApplyConfig = $root.wifi_config.RespApplyConfig.toObject(message.respApplyConfig, options);
                if (options.oneofs)
                    object.payload = "respApplyConfig";
            }
            return object;
        };

        /**
         * Converts this WiFiConfigPayload to JSON.
         * @function toJSON
         * @memberof wifi_config.WiFiConfigPayload
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WiFiConfigPayload.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WiFiConfigPayload
         * @function getTypeUrl
         * @memberof wifi_config.WiFiConfigPayload
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WiFiConfigPayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/wifi_config.WiFiConfigPayload";
        };

        return WiFiConfigPayload;
    })();

    return wifi_config;
})();

module.exports = $root;
