"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trino = exports.QueryIterator = exports.Iterator = exports.LoginAuth = exports.BasicAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const agentkeepalive_1 = __importStar(require("agentkeepalive"));
const DEFAULT_SERVER = 'http://localhost:8080';
const DEFAULT_SOURCE = 'trino-js-client';
const DEFAULT_USER = process.env.USER;
// Trino headers
const TRINO_HEADER_PREFIX = 'X-Trino-';
const TRINO_PREPARED_STATEMENT_HEADER = TRINO_HEADER_PREFIX + 'Prepared-Statement';
const TRINO_ADDED_PREPARE_HEADER = TRINO_HEADER_PREFIX + 'Added-Prepare';
const TRINO_USER_HEADER = TRINO_HEADER_PREFIX + 'User';
const TRINO_SOURCE_HEADER = TRINO_HEADER_PREFIX + 'Source';
const TRINO_CATALOG_HEADER = TRINO_HEADER_PREFIX + 'Catalog';
const TRINO_SCHEMA_HEADER = TRINO_HEADER_PREFIX + 'Schema';
const TRINO_SESSION_HEADER = TRINO_HEADER_PREFIX + 'Session';
const TRINO_SET_CATALOG_HEADER = TRINO_HEADER_PREFIX + 'Set-Catalog';
const TRINO_SET_SCHEMA_HEADER = TRINO_HEADER_PREFIX + 'Set-Schema';
const TRINO_SET_PATH_HEADER = TRINO_HEADER_PREFIX + 'Set-Path';
const TRINO_SET_SESSION_HEADER = TRINO_HEADER_PREFIX + 'Set-Session';
const TRINO_CLEAR_SESSION_HEADER = TRINO_HEADER_PREFIX + 'Clear-Session';
const TRINO_SET_ROLE_HEADER = TRINO_HEADER_PREFIX + 'Set-Role';
const TRINO_EXTRA_CREDENTIAL_HEADER = TRINO_HEADER_PREFIX + 'Extra-Credential';
const AUTHORIZATION_HEADER = 'Authorization';
class BasicAuth {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.type = 'basic';
    }
}
exports.BasicAuth = BasicAuth;
class LoginAuth {
    constructor(username, token) {
        this.username = username;
        this.token = token;
        this.type = 'login';
    }
}
exports.LoginAuth = LoginAuth;
const encodeAsString = (obj) => {
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
};
/**
 * It takes a Headers object and returns a new object with the same keys, but only the values that are
 * truthy
 * @param {RawAxiosRequestHeaders} headers - RawAxiosRequestHeaders - The headers object to be sanitized.
 * @returns An object with the key-value pairs of the headers object, but only if the value is truthy.
 */
const cleanHeaders = (headers) => {
    const sanitizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
        if (value) {
            sanitizedHeaders[key] = value;
        }
    }
    return sanitizedHeaders;
};
/* It's a wrapper around the Axios library that adds some Trino specific headers to the requests */
class Client {
    constructor(clientConfig, options) {
        this.clientConfig = clientConfig;
        this.options = options;
    }
    static create(options) {
        var _a, _b, _c, _d, _e, _f;
        const keepAliveAgent = new agentkeepalive_1.default({
            maxSockets: 160,
            maxFreeSockets: 160,
            timeout: 60000,
            freeSocketTimeout: 30000,
            keepAlive: true,
            keepAliveMsecs: 60000
        });
        const httpsKeepAliveAgent = new agentkeepalive_1.HttpsAgent(Object.assign({ maxSockets: 160, maxFreeSockets: 160, timeout: 60000, freeSocketTimeout: 30000, keepAliveMsecs: 60000, keepAlive: true }, ((_a = options.ssl) !== null && _a !== void 0 ? _a : {})));
        const clientConfig = {
            baseURL: (_b = options.server) !== null && _b !== void 0 ? _b : DEFAULT_SERVER,
            httpAgent: keepAliveAgent,
            httpsAgent: httpsKeepAliveAgent,
        };
        const headers = {
            [TRINO_USER_HEADER]: DEFAULT_USER,
            [TRINO_SOURCE_HEADER]: (_c = options.source) !== null && _c !== void 0 ? _c : DEFAULT_SOURCE,
            [TRINO_CATALOG_HEADER]: options.catalog,
            [TRINO_SCHEMA_HEADER]: options.schema,
            [TRINO_SESSION_HEADER]: encodeAsString((_d = options.session) !== null && _d !== void 0 ? _d : {}),
            [TRINO_EXTRA_CREDENTIAL_HEADER]: encodeAsString((_e = options.extraCredential) !== null && _e !== void 0 ? _e : {}),
        };
        if (options.auth && options.auth.type === 'basic') {
            const basic = options.auth;
            clientConfig.auth = {
                username: basic.username,
                password: (_f = basic.password) !== null && _f !== void 0 ? _f : '',
            };
            headers[TRINO_USER_HEADER] = basic.username;
        }
        else if (options.auth && options.auth.type === 'login') {
            const basic = options.auth;
            headers[TRINO_USER_HEADER] = basic.username;
            headers[AUTHORIZATION_HEADER] = `Bearer ${basic.token}`;
        }
        clientConfig.headers = cleanHeaders(headers);
        return new Client(clientConfig, options);
    }
    /**
     * Generic method to send a request to the server.
     * @param cfg - AxiosRequestConfig<any>
     * @returns The response data.
     */
    request(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .create(this.clientConfig)
                .request(cfg)
                .then(response => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const reqHeaders = (_a = this.clientConfig.headers) !== null && _a !== void 0 ? _a : {};
                const respHeaders = response.headers;
                reqHeaders[TRINO_CATALOG_HEADER] =
                    (_c = (_b = respHeaders[TRINO_SET_CATALOG_HEADER.toLowerCase()]) !== null && _b !== void 0 ? _b : reqHeaders[TRINO_CATALOG_HEADER]) !== null && _c !== void 0 ? _c : this.options.catalog;
                reqHeaders[TRINO_SCHEMA_HEADER] =
                    (_e = (_d = respHeaders[TRINO_SET_SCHEMA_HEADER.toLowerCase()]) !== null && _d !== void 0 ? _d : reqHeaders[TRINO_SCHEMA_HEADER]) !== null && _e !== void 0 ? _e : this.options.schema;
                reqHeaders[TRINO_SESSION_HEADER] =
                    (_g = (_f = respHeaders[TRINO_SET_SESSION_HEADER.toLowerCase()]) !== null && _f !== void 0 ? _f : reqHeaders[TRINO_SESSION_HEADER]) !== null && _g !== void 0 ? _g : encodeAsString((_h = this.options.session) !== null && _h !== void 0 ? _h : {});
                if (TRINO_CLEAR_SESSION_HEADER.toLowerCase() in respHeaders) {
                    reqHeaders[TRINO_SESSION_HEADER] = undefined;
                }
                if (TRINO_ADDED_PREPARE_HEADER.toLowerCase() in respHeaders) {
                    const prep = reqHeaders[TRINO_PREPARED_STATEMENT_HEADER];
                    reqHeaders[TRINO_PREPARED_STATEMENT_HEADER] =
                        (prep ? prep + ',' : '') +
                            respHeaders[TRINO_ADDED_PREPARE_HEADER.toLowerCase()];
                }
                this.clientConfig.headers = cleanHeaders(reqHeaders);
                return response.data;
            });
        });
    }
    /**
     * It takes a query object and returns a promise that resolves to a query result object
     * @param {Query | string} query - The query to execute.
     * @returns A promise that resolves to a QueryResult object.
     */
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const req = typeof query === 'string' ? { query } : query;
            const headers = Object.assign({ [TRINO_USER_HEADER]: req.user, [TRINO_CATALOG_HEADER]: req.catalog, [TRINO_SCHEMA_HEADER]: req.schema, [TRINO_SESSION_HEADER]: encodeAsString((_a = req.session) !== null && _a !== void 0 ? _a : {}), [TRINO_EXTRA_CREDENTIAL_HEADER]: encodeAsString((_b = req.extraCredential) !== null && _b !== void 0 ? _b : {}) }, ((_c = req.extraHeaders) !== null && _c !== void 0 ? _c : {}));
            const requestConfig = {
                method: 'POST',
                url: '/v1/statement',
                data: req.query,
                headers: cleanHeaders(headers),
            };
            return this.request(requestConfig).then(result => new Iterator(new QueryIterator(this, result)));
        });
    }
    /**
     * It returns the query info for a given queryId.
     * @param {string} queryId - The query ID of the query you want to get information about.
     * @returns The query info
     */
    queryInfo(queryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request({ url: `/v1/query/${queryId}`, method: 'GET' });
        });
    }
    /**
     * It cancels a query.
     * @param {string} queryId - The queryId of the query to cancel.
     * @returns The result of the query.
     */
    cancel(queryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request({ url: `/v1/query/${queryId}`, method: 'DELETE' }).then(_ => ({ id: queryId }));
        });
    }
}
class Iterator {
    constructor(iter) {
        this.iter = iter;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    next() {
        return this.iter.next();
    }
    /**
     * Calls a defined callback function on each QueryResult, and returns an array that contains the results.
     * @param fn A function that accepts a QueryResult. map calls the fn function one time for each QueryResult.
     */
    map(fn) {
        const that = this.iter;
        const asyncIterableIterator = {
            [Symbol.asyncIterator]: () => asyncIterableIterator,
            next() {
                return __awaiter(this, void 0, void 0, function* () {
                    return that.next().then(result => {
                        return {
                            value: fn(result.value),
                            done: result.done,
                        };
                    });
                });
            },
        };
        return new Iterator(asyncIterableIterator);
    }
    /**
     * Performs the specified action for each element.
     * @param fn A function that accepts a QueryResult. forEach calls the fn function one time for each QueryResult.
     */
    forEach(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, _e = __asyncValues(this), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const value = _c;
                    fn(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    /**
     * Calls a defined callback function on each QueryResult. The return value of the callback function is the accumulated
     * result, and is provided as an argument in the next call to the callback function.
     * @param acc The initial value of the accumulator.
     * @param fn A function that accepts a QueryResult and accumulator, and returns an accumulator.
     */
    fold(acc, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.forEach(value => (acc = fn(value, acc)));
            return acc;
        });
    }
}
exports.Iterator = Iterator;
/**
 * Iterator for the query result data.
 */
class QueryIterator {
    constructor(client, queryResult) {
        this.client = client;
        this.queryResult = queryResult;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    /**
     * It returns true if the queryResult object has a nextUri property, and false otherwise
     * @returns A boolean value.
     */
    hasNext() {
        return !!this.queryResult.nextUri;
    }
    /**
     * Retrieves the next QueryResult available. If there's no nextUri then there are no more
     * results and the query reached a completion state, successful or failure.
     * @returns The next set of results.
     */
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.hasNext()) {
                return Promise.resolve({ value: this.queryResult, done: true });
            }
            this.queryResult = yield this.client.request({
                url: this.queryResult.nextUri,
            });
            const data = (_a = this.queryResult.data) !== null && _a !== void 0 ? _a : [];
            if (data.length === 0) {
                if (this.hasNext()) {
                    return this.next();
                }
            }
            return Promise.resolve({ value: this.queryResult, done: false });
        });
    }
}
exports.QueryIterator = QueryIterator;
/**
 * Trino is a client for the Trino REST API.
 */
class Trino {
    constructor(client) {
        this.client = client;
    }
    static create(options) {
        return new Trino(Client.create(options));
    }
    /**
     * Submittes a query for execution and returns a QueryIterator object that can be used to iterate over the query results.
     * @param query - The query to execute.
     * @returns A QueryIterator object.
     */
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.query(query);
        });
    }
    /**
     * Retrieves the query info for a given queryId.
     * @param queryId - The query to execute.
     * @returns The query info
     */
    queryInfo(queryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.queryInfo(queryId);
        });
    }
    /**
     * It cancels a query.
     * @param {string} queryId - The queryId of the query to cancel.
     * @returns The result of the query.
     */
    cancel(queryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.cancel(queryId);
        });
    }
}
exports.Trino = Trino;
