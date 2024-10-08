import { AxiosRequestConfig } from 'axios';
import * as tls from 'tls';
export type AuthType = string;
export interface Auth {
    readonly type: AuthType;
}
export declare class BasicAuth implements Auth {
    readonly username: string;
    readonly password?: string | undefined;
    readonly type: AuthType;
    constructor(username: string, password?: string | undefined);
}
export declare class LoginAuth implements Auth {
    readonly username: string;
    readonly token: string;
    readonly type: AuthType;
    constructor(username: string, token: string);
}
export type Session = {
    [key: string]: string;
};
export type ExtraCredential = {
    [key: string]: string;
};
export type RequestHeaders = {
    [key: string]: string;
};
export type SecureContextOptions = tls.SecureContextOptions & {
    readonly rejectUnauthorized?: boolean;
};
export type ConnectionOptions = {
    readonly server?: string;
    readonly source?: string;
    readonly catalog?: string;
    readonly schema?: string;
    readonly auth?: Auth;
    readonly session?: Session;
    readonly extraCredential?: ExtraCredential;
    readonly ssl?: SecureContextOptions;
};
export type QueryStage = {
    stageId: string;
    state: string;
    done: boolean;
    nodes: number;
    totalSplits: number;
    queuedSplits: number;
    runningSplits: number;
    completedSplits: number;
    cpuTimeMillis: number;
    wallTimeMillis: number;
    processedRows: number;
    processedBytes: number;
    physicalInputBytes: number;
    failedTasks: number;
    coordinatorOnly: boolean;
    subStages: QueryStage[];
};
export type QueryStats = {
    state: string;
    queued: boolean;
    scheduled: boolean;
    nodes: number;
    totalSplits: number;
    queuedSplits: number;
    runningSplits: number;
    completedSplits: number;
    cpuTimeMillis: number;
    wallTimeMillis: number;
    queuedTimeMillis: number;
    elapsedTimeMillis: number;
    processedRows: number;
    processedBytes: number;
    physicalInputBytes: number;
    peakMemoryBytes: number;
    spilledBytes: number;
    rootStage: QueryStage;
    progressPercentage: number;
};
export type Columns = {
    name: string;
    type: string;
}[];
export type QueryData = any[];
export type QueryFailureInfo = {
    type: string;
    message: string;
    suppressed: string[];
    stack: string[];
};
export type QueryError = {
    message: string;
    errorCode: number;
    errorName: string;
    errorType: string;
    failureInfo: QueryFailureInfo;
};
export type QueryResult = {
    id: string;
    infoUri?: string;
    nextUri?: string;
    columns?: Columns;
    data?: QueryData[];
    stats?: QueryStats;
    warnings?: string[];
    error?: QueryError;
};
export type QueryInfo = {
    queryId: string;
    state: string;
    query: string;
    failureInfo?: QueryFailureInfo;
};
export type Query = {
    query: string;
    catalog?: string;
    schema?: string;
    user?: string;
    session?: Session;
    extraCredential?: ExtraCredential;
    extraHeaders?: RequestHeaders;
};
declare class Client {
    private readonly clientConfig;
    private readonly options;
    private constructor();
    static create(options: ConnectionOptions): Client;
    /**
     * Generic method to send a request to the server.
     * @param cfg - AxiosRequestConfig<any>
     * @returns The response data.
     */
    request<T>(cfg: AxiosRequestConfig<unknown>): Promise<T>;
    /**
     * It takes a query object and returns a promise that resolves to a query result object
     * @param {Query | string} query - The query to execute.
     * @returns A promise that resolves to a QueryResult object.
     */
    query(query: Query | string): Promise<Iterator<QueryResult>>;
    /**
     * It returns the query info for a given queryId.
     * @param {string} queryId - The query ID of the query you want to get information about.
     * @returns The query info
     */
    queryInfo(queryId: string): Promise<QueryInfo>;
    /**
     * It cancels a query.
     * @param {string} queryId - The queryId of the query to cancel.
     * @returns The result of the query.
     */
    cancel(queryId: string): Promise<QueryResult>;
}
export declare class Iterator<T> implements AsyncIterableIterator<T> {
    private readonly iter;
    constructor(iter: AsyncIterableIterator<T>);
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(): Promise<IteratorResult<T>>;
    /**
     * Calls a defined callback function on each QueryResult, and returns an array that contains the results.
     * @param fn A function that accepts a QueryResult. map calls the fn function one time for each QueryResult.
     */
    map<B>(fn: (t: T) => B): Iterator<B>;
    /**
     * Performs the specified action for each element.
     * @param fn A function that accepts a QueryResult. forEach calls the fn function one time for each QueryResult.
     */
    forEach(fn: (value: T) => void): Promise<void>;
    /**
     * Calls a defined callback function on each QueryResult. The return value of the callback function is the accumulated
     * result, and is provided as an argument in the next call to the callback function.
     * @param acc The initial value of the accumulator.
     * @param fn A function that accepts a QueryResult and accumulator, and returns an accumulator.
     */
    fold<B>(acc: B, fn: (value: T, acc: B) => B): Promise<B>;
}
/**
 * Iterator for the query result data.
 */
export declare class QueryIterator implements AsyncIterableIterator<QueryResult> {
    private readonly client;
    private queryResult;
    constructor(client: Client, queryResult: QueryResult);
    [Symbol.asyncIterator](): AsyncIterableIterator<QueryResult>;
    /**
     * It returns true if the queryResult object has a nextUri property, and false otherwise
     * @returns A boolean value.
     */
    hasNext(): boolean;
    /**
     * Retrieves the next QueryResult available. If there's no nextUri then there are no more
     * results and the query reached a completion state, successful or failure.
     * @returns The next set of results.
     */
    next(): Promise<IteratorResult<QueryResult>>;
}
/**
 * Trino is a client for the Trino REST API.
 */
export declare class Trino {
    private readonly client;
    private constructor();
    static create(options: ConnectionOptions): Trino;
    /**
     * Submittes a query for execution and returns a QueryIterator object that can be used to iterate over the query results.
     * @param query - The query to execute.
     * @returns A QueryIterator object.
     */
    query(query: Query | string): Promise<Iterator<QueryResult>>;
    /**
     * Retrieves the query info for a given queryId.
     * @param queryId - The query to execute.
     * @returns The query info
     */
    queryInfo(queryId: string): Promise<QueryInfo>;
    /**
     * It cancels a query.
     * @param {string} queryId - The queryId of the query to cancel.
     * @returns The result of the query.
     */
    cancel(queryId: string): Promise<QueryResult>;
}
export {};
