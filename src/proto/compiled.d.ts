import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace session. */
export namespace session {

    /** SecSchemeVersion enum. */
    enum SecSchemeVersion {
        SecScheme0 = 0,
        SecScheme1 = 1
    }

    /** Properties of a SessionData. */
    interface ISessionData {

        /** SessionData secVer */
        secVer?: (session.SecSchemeVersion|null);

        /** SessionData sec0 */
        sec0?: (session.ISec0Payload|null);

        /** SessionData sec1 */
        sec1?: (session.ISec1Payload|null);
    }

    /** Represents a SessionData. */
    class SessionData implements ISessionData {

        /**
         * Constructs a new SessionData.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISessionData);

        /** SessionData secVer. */
        public secVer: session.SecSchemeVersion;

        /** SessionData sec0. */
        public sec0?: (session.ISec0Payload|null);

        /** SessionData sec1. */
        public sec1?: (session.ISec1Payload|null);

        /** SessionData proto. */
        public proto?: ("sec0"|"sec1");

        /**
         * Creates a new SessionData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SessionData instance
         */
        public static create(properties?: session.ISessionData): session.SessionData;

        /**
         * Encodes the specified SessionData message. Does not implicitly {@link session.SessionData.verify|verify} messages.
         * @param message SessionData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISessionData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SessionData message, length delimited. Does not implicitly {@link session.SessionData.verify|verify} messages.
         * @param message SessionData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISessionData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SessionData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SessionData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.SessionData;

        /**
         * Decodes a SessionData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SessionData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.SessionData;

        /**
         * Verifies a SessionData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SessionData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SessionData
         */
        public static fromObject(object: { [k: string]: any }): session.SessionData;

        /**
         * Creates a plain object from a SessionData message. Also converts values to other types if specified.
         * @param message SessionData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.SessionData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SessionData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SessionData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Sec0Payload. */
    interface ISec0Payload {

        /** Sec0Payload msg */
        msg?: (Uint8Array|null);

        /** Sec0Payload sr */
        sr?: (session.IPayloadDescriptor|null);

        /** Sec0Payload sc */
        sc?: (session.IPayloadDescriptor|null);
    }

    /** Represents a Sec0Payload. */
    class Sec0Payload implements ISec0Payload {

        /**
         * Constructs a new Sec0Payload.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISec0Payload);

        /** Sec0Payload msg. */
        public msg: Uint8Array;

        /** Sec0Payload sr. */
        public sr?: (session.IPayloadDescriptor|null);

        /** Sec0Payload sc. */
        public sc?: (session.IPayloadDescriptor|null);

        /**
         * Creates a new Sec0Payload instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sec0Payload instance
         */
        public static create(properties?: session.ISec0Payload): session.Sec0Payload;

        /**
         * Encodes the specified Sec0Payload message. Does not implicitly {@link session.Sec0Payload.verify|verify} messages.
         * @param message Sec0Payload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISec0Payload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Sec0Payload message, length delimited. Does not implicitly {@link session.Sec0Payload.verify|verify} messages.
         * @param message Sec0Payload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISec0Payload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Sec0Payload message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sec0Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.Sec0Payload;

        /**
         * Decodes a Sec0Payload message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Sec0Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.Sec0Payload;

        /**
         * Verifies a Sec0Payload message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sec0Payload message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sec0Payload
         */
        public static fromObject(object: { [k: string]: any }): session.Sec0Payload;

        /**
         * Creates a plain object from a Sec0Payload message. Also converts values to other types if specified.
         * @param message Sec0Payload
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.Sec0Payload, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sec0Payload to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Sec0Payload
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Sec1Payload. */
    interface ISec1Payload {

        /** Sec1Payload msg */
        msg?: (Uint8Array|null);

        /** Sec1Payload sr */
        sr?: (session.IPayloadDescriptor|null);

        /** Sec1Payload sc */
        sc?: (session.IPayloadDescriptor|null);
    }

    /** Represents a Sec1Payload. */
    class Sec1Payload implements ISec1Payload {

        /**
         * Constructs a new Sec1Payload.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISec1Payload);

        /** Sec1Payload msg. */
        public msg: Uint8Array;

        /** Sec1Payload sr. */
        public sr?: (session.IPayloadDescriptor|null);

        /** Sec1Payload sc. */
        public sc?: (session.IPayloadDescriptor|null);

        /**
         * Creates a new Sec1Payload instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sec1Payload instance
         */
        public static create(properties?: session.ISec1Payload): session.Sec1Payload;

        /**
         * Encodes the specified Sec1Payload message. Does not implicitly {@link session.Sec1Payload.verify|verify} messages.
         * @param message Sec1Payload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISec1Payload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Sec1Payload message, length delimited. Does not implicitly {@link session.Sec1Payload.verify|verify} messages.
         * @param message Sec1Payload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISec1Payload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Sec1Payload message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sec1Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.Sec1Payload;

        /**
         * Decodes a Sec1Payload message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Sec1Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.Sec1Payload;

        /**
         * Verifies a Sec1Payload message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sec1Payload message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sec1Payload
         */
        public static fromObject(object: { [k: string]: any }): session.Sec1Payload;

        /**
         * Creates a plain object from a Sec1Payload message. Also converts values to other types if specified.
         * @param message Sec1Payload
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.Sec1Payload, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sec1Payload to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Sec1Payload
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PayloadDescriptor. */
    interface IPayloadDescriptor {

        /** PayloadDescriptor type */
        type?: (number|null);

        /** PayloadDescriptor from */
        from?: (number|null);

        /** PayloadDescriptor to */
        to?: (number|null);
    }

    /** Represents a PayloadDescriptor. */
    class PayloadDescriptor implements IPayloadDescriptor {

        /**
         * Constructs a new PayloadDescriptor.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.IPayloadDescriptor);

        /** PayloadDescriptor type. */
        public type: number;

        /** PayloadDescriptor from. */
        public from: number;

        /** PayloadDescriptor to. */
        public to: number;

        /**
         * Creates a new PayloadDescriptor instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PayloadDescriptor instance
         */
        public static create(properties?: session.IPayloadDescriptor): session.PayloadDescriptor;

        /**
         * Encodes the specified PayloadDescriptor message. Does not implicitly {@link session.PayloadDescriptor.verify|verify} messages.
         * @param message PayloadDescriptor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.IPayloadDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PayloadDescriptor message, length delimited. Does not implicitly {@link session.PayloadDescriptor.verify|verify} messages.
         * @param message PayloadDescriptor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.IPayloadDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PayloadDescriptor message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PayloadDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.PayloadDescriptor;

        /**
         * Decodes a PayloadDescriptor message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PayloadDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.PayloadDescriptor;

        /**
         * Verifies a PayloadDescriptor message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PayloadDescriptor message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PayloadDescriptor
         */
        public static fromObject(object: { [k: string]: any }): session.PayloadDescriptor;

        /**
         * Creates a plain object from a PayloadDescriptor message. Also converts values to other types if specified.
         * @param message PayloadDescriptor
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.PayloadDescriptor, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PayloadDescriptor to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PayloadDescriptor
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SessionCmd0. */
    interface ISessionCmd0 {

        /** SessionCmd0 clientPubKey */
        clientPubKey?: (Uint8Array|null);
    }

    /** Represents a SessionCmd0. */
    class SessionCmd0 implements ISessionCmd0 {

        /**
         * Constructs a new SessionCmd0.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISessionCmd0);

        /** SessionCmd0 clientPubKey. */
        public clientPubKey: Uint8Array;

        /**
         * Creates a new SessionCmd0 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SessionCmd0 instance
         */
        public static create(properties?: session.ISessionCmd0): session.SessionCmd0;

        /**
         * Encodes the specified SessionCmd0 message. Does not implicitly {@link session.SessionCmd0.verify|verify} messages.
         * @param message SessionCmd0 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SessionCmd0 message, length delimited. Does not implicitly {@link session.SessionCmd0.verify|verify} messages.
         * @param message SessionCmd0 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISessionCmd0, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SessionCmd0 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SessionCmd0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.SessionCmd0;

        /**
         * Decodes a SessionCmd0 message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SessionCmd0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.SessionCmd0;

        /**
         * Verifies a SessionCmd0 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SessionCmd0 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SessionCmd0
         */
        public static fromObject(object: { [k: string]: any }): session.SessionCmd0;

        /**
         * Creates a plain object from a SessionCmd0 message. Also converts values to other types if specified.
         * @param message SessionCmd0
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.SessionCmd0, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SessionCmd0 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SessionCmd0
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SessionResp0. */
    interface ISessionResp0 {

        /** SessionResp0 status */
        status?: (session.Status|null);

        /** SessionResp0 devicePubKey */
        devicePubKey?: (Uint8Array|null);

        /** SessionResp0 deviceRandom */
        deviceRandom?: (Uint8Array|null);
    }

    /** Represents a SessionResp0. */
    class SessionResp0 implements ISessionResp0 {

        /**
         * Constructs a new SessionResp0.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISessionResp0);

        /** SessionResp0 status. */
        public status: session.Status;

        /** SessionResp0 devicePubKey. */
        public devicePubKey: Uint8Array;

        /** SessionResp0 deviceRandom. */
        public deviceRandom: Uint8Array;

        /**
         * Creates a new SessionResp0 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SessionResp0 instance
         */
        public static create(properties?: session.ISessionResp0): session.SessionResp0;

        /**
         * Encodes the specified SessionResp0 message. Does not implicitly {@link session.SessionResp0.verify|verify} messages.
         * @param message SessionResp0 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SessionResp0 message, length delimited. Does not implicitly {@link session.SessionResp0.verify|verify} messages.
         * @param message SessionResp0 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISessionResp0, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SessionResp0 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SessionResp0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.SessionResp0;

        /**
         * Decodes a SessionResp0 message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SessionResp0
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.SessionResp0;

        /**
         * Verifies a SessionResp0 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SessionResp0 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SessionResp0
         */
        public static fromObject(object: { [k: string]: any }): session.SessionResp0;

        /**
         * Creates a plain object from a SessionResp0 message. Also converts values to other types if specified.
         * @param message SessionResp0
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.SessionResp0, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SessionResp0 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SessionResp0
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SessionCmd1. */
    interface ISessionCmd1 {

        /** SessionCmd1 clientVerifyData */
        clientVerifyData?: (Uint8Array|null);
    }

    /** Represents a SessionCmd1. */
    class SessionCmd1 implements ISessionCmd1 {

        /**
         * Constructs a new SessionCmd1.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISessionCmd1);

        /** SessionCmd1 clientVerifyData. */
        public clientVerifyData: Uint8Array;

        /**
         * Creates a new SessionCmd1 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SessionCmd1 instance
         */
        public static create(properties?: session.ISessionCmd1): session.SessionCmd1;

        /**
         * Encodes the specified SessionCmd1 message. Does not implicitly {@link session.SessionCmd1.verify|verify} messages.
         * @param message SessionCmd1 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SessionCmd1 message, length delimited. Does not implicitly {@link session.SessionCmd1.verify|verify} messages.
         * @param message SessionCmd1 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISessionCmd1, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SessionCmd1 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SessionCmd1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.SessionCmd1;

        /**
         * Decodes a SessionCmd1 message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SessionCmd1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.SessionCmd1;

        /**
         * Verifies a SessionCmd1 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SessionCmd1 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SessionCmd1
         */
        public static fromObject(object: { [k: string]: any }): session.SessionCmd1;

        /**
         * Creates a plain object from a SessionCmd1 message. Also converts values to other types if specified.
         * @param message SessionCmd1
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.SessionCmd1, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SessionCmd1 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SessionCmd1
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SessionResp1. */
    interface ISessionResp1 {

        /** SessionResp1 status */
        status?: (session.Status|null);

        /** SessionResp1 deviceVerifyData */
        deviceVerifyData?: (Uint8Array|null);
    }

    /** Represents a SessionResp1. */
    class SessionResp1 implements ISessionResp1 {

        /**
         * Constructs a new SessionResp1.
         * @param [properties] Properties to set
         */
        constructor(properties?: session.ISessionResp1);

        /** SessionResp1 status. */
        public status: session.Status;

        /** SessionResp1 deviceVerifyData. */
        public deviceVerifyData: Uint8Array;

        /**
         * Creates a new SessionResp1 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SessionResp1 instance
         */
        public static create(properties?: session.ISessionResp1): session.SessionResp1;

        /**
         * Encodes the specified SessionResp1 message. Does not implicitly {@link session.SessionResp1.verify|verify} messages.
         * @param message SessionResp1 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: session.ISessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SessionResp1 message, length delimited. Does not implicitly {@link session.SessionResp1.verify|verify} messages.
         * @param message SessionResp1 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: session.ISessionResp1, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SessionResp1 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SessionResp1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): session.SessionResp1;

        /**
         * Decodes a SessionResp1 message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SessionResp1
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): session.SessionResp1;

        /**
         * Verifies a SessionResp1 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SessionResp1 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SessionResp1
         */
        public static fromObject(object: { [k: string]: any }): session.SessionResp1;

        /**
         * Creates a plain object from a SessionResp1 message. Also converts values to other types if specified.
         * @param message SessionResp1
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: session.SessionResp1, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SessionResp1 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SessionResp1
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Status enum. */
    enum Status {
        Success = 0,
        InvalidSecScheme = 1,
        InvalidProto = 2,
        TooManySessions = 3,
        InvalidArgument = 4,
        InternalError = 5,
        CryptoError = 6,
        InvalidSession = 7
    }
}

/** Namespace wifi_config. */
export namespace wifi_config {

    /** WiFiConfigMsgType enum. */
    enum WiFiConfigMsgType {
        TypeCmdGetStatus = 0,
        TypeRespGetStatus = 1,
        TypeCmdSetConfig = 2,
        TypeRespSetConfig = 3,
        TypeCmdApplyConfig = 4,
        TypeRespApplyConfig = 5
    }

    /** Properties of a CmdGetStatus. */
    interface ICmdGetStatus {
    }

    /** Represents a CmdGetStatus. */
    class CmdGetStatus implements ICmdGetStatus {

        /**
         * Constructs a new CmdGetStatus.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.ICmdGetStatus);

        /**
         * Creates a new CmdGetStatus instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CmdGetStatus instance
         */
        public static create(properties?: wifi_config.ICmdGetStatus): wifi_config.CmdGetStatus;

        /**
         * Encodes the specified CmdGetStatus message. Does not implicitly {@link wifi_config.CmdGetStatus.verify|verify} messages.
         * @param message CmdGetStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.ICmdGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CmdGetStatus message, length delimited. Does not implicitly {@link wifi_config.CmdGetStatus.verify|verify} messages.
         * @param message CmdGetStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.ICmdGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CmdGetStatus message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CmdGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.CmdGetStatus;

        /**
         * Decodes a CmdGetStatus message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CmdGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.CmdGetStatus;

        /**
         * Verifies a CmdGetStatus message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CmdGetStatus message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CmdGetStatus
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.CmdGetStatus;

        /**
         * Creates a plain object from a CmdGetStatus message. Also converts values to other types if specified.
         * @param message CmdGetStatus
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.CmdGetStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CmdGetStatus to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CmdGetStatus
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RespGetStatus. */
    interface IRespGetStatus {

        /** RespGetStatus staState */
        staState?: (wifi_config.WifiStationState|null);

        /** RespGetStatus failReason */
        failReason?: (wifi_config.WifiConnectFailedReason|null);

        /** RespGetStatus connected */
        connected?: (wifi_config.IWifiConnectedState|null);
    }

    /** Represents a RespGetStatus. */
    class RespGetStatus implements IRespGetStatus {

        /**
         * Constructs a new RespGetStatus.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.IRespGetStatus);

        /** RespGetStatus staState. */
        public staState: wifi_config.WifiStationState;

        /** RespGetStatus failReason. */
        public failReason?: (wifi_config.WifiConnectFailedReason|null);

        /** RespGetStatus connected. */
        public connected?: (wifi_config.IWifiConnectedState|null);

        /** RespGetStatus state. */
        public state?: ("failReason"|"connected");

        /**
         * Creates a new RespGetStatus instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RespGetStatus instance
         */
        public static create(properties?: wifi_config.IRespGetStatus): wifi_config.RespGetStatus;

        /**
         * Encodes the specified RespGetStatus message. Does not implicitly {@link wifi_config.RespGetStatus.verify|verify} messages.
         * @param message RespGetStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.IRespGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RespGetStatus message, length delimited. Does not implicitly {@link wifi_config.RespGetStatus.verify|verify} messages.
         * @param message RespGetStatus message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.IRespGetStatus, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RespGetStatus message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RespGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.RespGetStatus;

        /**
         * Decodes a RespGetStatus message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RespGetStatus
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.RespGetStatus;

        /**
         * Verifies a RespGetStatus message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RespGetStatus message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RespGetStatus
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.RespGetStatus;

        /**
         * Creates a plain object from a RespGetStatus message. Also converts values to other types if specified.
         * @param message RespGetStatus
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.RespGetStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RespGetStatus to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RespGetStatus
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** WifiStationState enum. */
    enum WifiStationState {
        Connected = 0,
        Connecting = 1,
        Disconnected = 2,
        ConnectionFailed = 3
    }

    /** WifiConnectFailedReason enum. */
    enum WifiConnectFailedReason {
        AuthError = 0,
        NetworkNotFound = 1
    }

    /** Properties of a WifiConnectedState. */
    interface IWifiConnectedState {

        /** WifiConnectedState ip4Addr */
        ip4Addr?: (string|null);

        /** WifiConnectedState bssid */
        bssid?: (Uint8Array|null);

        /** WifiConnectedState ssid */
        ssid?: (string|null);
    }

    /** Represents a WifiConnectedState. */
    class WifiConnectedState implements IWifiConnectedState {

        /**
         * Constructs a new WifiConnectedState.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.IWifiConnectedState);

        /** WifiConnectedState ip4Addr. */
        public ip4Addr: string;

        /** WifiConnectedState bssid. */
        public bssid: Uint8Array;

        /** WifiConnectedState ssid. */
        public ssid: string;

        /**
         * Creates a new WifiConnectedState instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WifiConnectedState instance
         */
        public static create(properties?: wifi_config.IWifiConnectedState): wifi_config.WifiConnectedState;

        /**
         * Encodes the specified WifiConnectedState message. Does not implicitly {@link wifi_config.WifiConnectedState.verify|verify} messages.
         * @param message WifiConnectedState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.IWifiConnectedState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WifiConnectedState message, length delimited. Does not implicitly {@link wifi_config.WifiConnectedState.verify|verify} messages.
         * @param message WifiConnectedState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.IWifiConnectedState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WifiConnectedState message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WifiConnectedState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.WifiConnectedState;

        /**
         * Decodes a WifiConnectedState message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WifiConnectedState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.WifiConnectedState;

        /**
         * Verifies a WifiConnectedState message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WifiConnectedState message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WifiConnectedState
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.WifiConnectedState;

        /**
         * Creates a plain object from a WifiConnectedState message. Also converts values to other types if specified.
         * @param message WifiConnectedState
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.WifiConnectedState, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WifiConnectedState to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WifiConnectedState
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CmdSetConfig. */
    interface ICmdSetConfig {

        /** CmdSetConfig ssid */
        ssid?: (Uint8Array|null);

        /** CmdSetConfig passphrase */
        passphrase?: (Uint8Array|null);

        /** CmdSetConfig bssid */
        bssid?: (Uint8Array|null);
    }

    /** Represents a CmdSetConfig. */
    class CmdSetConfig implements ICmdSetConfig {

        /**
         * Constructs a new CmdSetConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.ICmdSetConfig);

        /** CmdSetConfig ssid. */
        public ssid: Uint8Array;

        /** CmdSetConfig passphrase. */
        public passphrase: Uint8Array;

        /** CmdSetConfig bssid. */
        public bssid: Uint8Array;

        /**
         * Creates a new CmdSetConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CmdSetConfig instance
         */
        public static create(properties?: wifi_config.ICmdSetConfig): wifi_config.CmdSetConfig;

        /**
         * Encodes the specified CmdSetConfig message. Does not implicitly {@link wifi_config.CmdSetConfig.verify|verify} messages.
         * @param message CmdSetConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.ICmdSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CmdSetConfig message, length delimited. Does not implicitly {@link wifi_config.CmdSetConfig.verify|verify} messages.
         * @param message CmdSetConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.ICmdSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CmdSetConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CmdSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.CmdSetConfig;

        /**
         * Decodes a CmdSetConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CmdSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.CmdSetConfig;

        /**
         * Verifies a CmdSetConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CmdSetConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CmdSetConfig
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.CmdSetConfig;

        /**
         * Creates a plain object from a CmdSetConfig message. Also converts values to other types if specified.
         * @param message CmdSetConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.CmdSetConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CmdSetConfig to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CmdSetConfig
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RespSetConfig. */
    interface IRespSetConfig {

        /** RespSetConfig status */
        status?: (wifi_config.Status|null);
    }

    /** Represents a RespSetConfig. */
    class RespSetConfig implements IRespSetConfig {

        /**
         * Constructs a new RespSetConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.IRespSetConfig);

        /** RespSetConfig status. */
        public status: wifi_config.Status;

        /**
         * Creates a new RespSetConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RespSetConfig instance
         */
        public static create(properties?: wifi_config.IRespSetConfig): wifi_config.RespSetConfig;

        /**
         * Encodes the specified RespSetConfig message. Does not implicitly {@link wifi_config.RespSetConfig.verify|verify} messages.
         * @param message RespSetConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.IRespSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RespSetConfig message, length delimited. Does not implicitly {@link wifi_config.RespSetConfig.verify|verify} messages.
         * @param message RespSetConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.IRespSetConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RespSetConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RespSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.RespSetConfig;

        /**
         * Decodes a RespSetConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RespSetConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.RespSetConfig;

        /**
         * Verifies a RespSetConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RespSetConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RespSetConfig
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.RespSetConfig;

        /**
         * Creates a plain object from a RespSetConfig message. Also converts values to other types if specified.
         * @param message RespSetConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.RespSetConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RespSetConfig to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RespSetConfig
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CmdApplyConfig. */
    interface ICmdApplyConfig {
    }

    /** Represents a CmdApplyConfig. */
    class CmdApplyConfig implements ICmdApplyConfig {

        /**
         * Constructs a new CmdApplyConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.ICmdApplyConfig);

        /**
         * Creates a new CmdApplyConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CmdApplyConfig instance
         */
        public static create(properties?: wifi_config.ICmdApplyConfig): wifi_config.CmdApplyConfig;

        /**
         * Encodes the specified CmdApplyConfig message. Does not implicitly {@link wifi_config.CmdApplyConfig.verify|verify} messages.
         * @param message CmdApplyConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.ICmdApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CmdApplyConfig message, length delimited. Does not implicitly {@link wifi_config.CmdApplyConfig.verify|verify} messages.
         * @param message CmdApplyConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.ICmdApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CmdApplyConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CmdApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.CmdApplyConfig;

        /**
         * Decodes a CmdApplyConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CmdApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.CmdApplyConfig;

        /**
         * Verifies a CmdApplyConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CmdApplyConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CmdApplyConfig
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.CmdApplyConfig;

        /**
         * Creates a plain object from a CmdApplyConfig message. Also converts values to other types if specified.
         * @param message CmdApplyConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.CmdApplyConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CmdApplyConfig to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CmdApplyConfig
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RespApplyConfig. */
    interface IRespApplyConfig {

        /** RespApplyConfig status */
        status?: (wifi_config.Status|null);
    }

    /** Represents a RespApplyConfig. */
    class RespApplyConfig implements IRespApplyConfig {

        /**
         * Constructs a new RespApplyConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.IRespApplyConfig);

        /** RespApplyConfig status. */
        public status: wifi_config.Status;

        /**
         * Creates a new RespApplyConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RespApplyConfig instance
         */
        public static create(properties?: wifi_config.IRespApplyConfig): wifi_config.RespApplyConfig;

        /**
         * Encodes the specified RespApplyConfig message. Does not implicitly {@link wifi_config.RespApplyConfig.verify|verify} messages.
         * @param message RespApplyConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.IRespApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RespApplyConfig message, length delimited. Does not implicitly {@link wifi_config.RespApplyConfig.verify|verify} messages.
         * @param message RespApplyConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.IRespApplyConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RespApplyConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RespApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.RespApplyConfig;

        /**
         * Decodes a RespApplyConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RespApplyConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.RespApplyConfig;

        /**
         * Verifies a RespApplyConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RespApplyConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RespApplyConfig
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.RespApplyConfig;

        /**
         * Creates a plain object from a RespApplyConfig message. Also converts values to other types if specified.
         * @param message RespApplyConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.RespApplyConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RespApplyConfig to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RespApplyConfig
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Status enum. */
    enum Status {
        Success = 0,
        InvalidSecScheme = 1,
        InvalidProto = 2,
        TooManySessions = 3,
        InvalidArgument = 4,
        InternalError = 5,
        CryptoError = 6,
        InvalidSession = 7
    }

    /** Properties of a WiFiConfigPayload. */
    interface IWiFiConfigPayload {

        /** WiFiConfigPayload msg */
        msg?: (wifi_config.WiFiConfigMsgType|null);

        /** WiFiConfigPayload cmdGetStatus */
        cmdGetStatus?: (wifi_config.ICmdGetStatus|null);

        /** WiFiConfigPayload respGetStatus */
        respGetStatus?: (wifi_config.IRespGetStatus|null);

        /** WiFiConfigPayload cmdSetConfig */
        cmdSetConfig?: (wifi_config.ICmdSetConfig|null);

        /** WiFiConfigPayload respSetConfig */
        respSetConfig?: (wifi_config.IRespSetConfig|null);

        /** WiFiConfigPayload cmdApplyConfig */
        cmdApplyConfig?: (wifi_config.ICmdApplyConfig|null);

        /** WiFiConfigPayload respApplyConfig */
        respApplyConfig?: (wifi_config.IRespApplyConfig|null);
    }

    /** Represents a WiFiConfigPayload. */
    class WiFiConfigPayload implements IWiFiConfigPayload {

        /**
         * Constructs a new WiFiConfigPayload.
         * @param [properties] Properties to set
         */
        constructor(properties?: wifi_config.IWiFiConfigPayload);

        /** WiFiConfigPayload msg. */
        public msg: wifi_config.WiFiConfigMsgType;

        /** WiFiConfigPayload cmdGetStatus. */
        public cmdGetStatus?: (wifi_config.ICmdGetStatus|null);

        /** WiFiConfigPayload respGetStatus. */
        public respGetStatus?: (wifi_config.IRespGetStatus|null);

        /** WiFiConfigPayload cmdSetConfig. */
        public cmdSetConfig?: (wifi_config.ICmdSetConfig|null);

        /** WiFiConfigPayload respSetConfig. */
        public respSetConfig?: (wifi_config.IRespSetConfig|null);

        /** WiFiConfigPayload cmdApplyConfig. */
        public cmdApplyConfig?: (wifi_config.ICmdApplyConfig|null);

        /** WiFiConfigPayload respApplyConfig. */
        public respApplyConfig?: (wifi_config.IRespApplyConfig|null);

        /** WiFiConfigPayload payload. */
        public payload?: ("cmdGetStatus"|"respGetStatus"|"cmdSetConfig"|"respSetConfig"|"cmdApplyConfig"|"respApplyConfig");

        /**
         * Creates a new WiFiConfigPayload instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WiFiConfigPayload instance
         */
        public static create(properties?: wifi_config.IWiFiConfigPayload): wifi_config.WiFiConfigPayload;

        /**
         * Encodes the specified WiFiConfigPayload message. Does not implicitly {@link wifi_config.WiFiConfigPayload.verify|verify} messages.
         * @param message WiFiConfigPayload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: wifi_config.IWiFiConfigPayload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WiFiConfigPayload message, length delimited. Does not implicitly {@link wifi_config.WiFiConfigPayload.verify|verify} messages.
         * @param message WiFiConfigPayload message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: wifi_config.IWiFiConfigPayload, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WiFiConfigPayload message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WiFiConfigPayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): wifi_config.WiFiConfigPayload;

        /**
         * Decodes a WiFiConfigPayload message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WiFiConfigPayload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): wifi_config.WiFiConfigPayload;

        /**
         * Verifies a WiFiConfigPayload message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WiFiConfigPayload message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WiFiConfigPayload
         */
        public static fromObject(object: { [k: string]: any }): wifi_config.WiFiConfigPayload;

        /**
         * Creates a plain object from a WiFiConfigPayload message. Also converts values to other types if specified.
         * @param message WiFiConfigPayload
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: wifi_config.WiFiConfigPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WiFiConfigPayload to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WiFiConfigPayload
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
