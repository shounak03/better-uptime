import { redis } from "bun";
import { ClientClosedError, createClient } from "redis";

export const redisClient = createClient().on("error", (err) => console.log("Redis Client Error", err)).connect();

type WebsiteEvent = {
    id: string;
    url: string; 
}

type MessageType = {
    id:string,
    message:{
        id: string,
        url: string
    }
}

// New types for website status results
type WebsiteStatusEvent = {
    websiteId: string;
    status: 'UP' | 'DOWN' | 'UNKNOWN';
    regionId: string;
    responseTime: number;
    checkedAt: string; // ISO timestamp
}

type StatusMessageType = {
    id: string,
    message: {
        websiteId: string,
        status: string,
        regionId: string,
        responseTime: string,
        checkedAt: string
    }
}

const STREAM_NAME = 'betteruptime:website'
const STATUS_STREAM_NAME = 'betteruptime:website:status'

async function xAdd({url,id}: WebsiteEvent) {
    (await redisClient).xAdd(
        STREAM_NAME,"*",{
            id:id,url:url
        }
    )
}

// New function to add website status results to stream
async function xAddStatus({websiteId, status, regionId, responseTime, checkedAt}: WebsiteStatusEvent) {
    (await redisClient).xAdd(
        STATUS_STREAM_NAME, "*", {
            websiteId,
            status,
            regionId,
            responseTime: responseTime.toString(),
            checkedAt
        }
    )
}

export async function addWebsites(websites:WebsiteEvent[]) {
    for (const website of websites) {
        await xAdd({ id: website.id, url: website.url });
    }
}

// New function to add website status results in batch
export async function addWebsiteStatuses(statuses: WebsiteStatusEvent[]) {
    for (const status of statuses) {
        await xAddStatus(status);
    }
}

export async function xReadGroup(consumerGroup:string,workerId:string):Promise<MessageType[]> {
    const res = await (await redisClient).xReadGroup(
        consumerGroup, workerId,{
            key: STREAM_NAME,
            id:'>'
        },{
            COUNT:3
        }
    )
    //@ts-ignore
    let messages:MessageType[] = res?.[0]?.messages; 
    return messages;
}

// New function to read from status stream
export async function xReadGroupStatus(consumerGroup: string, workerId: string): Promise<StatusMessageType[]> {
    const res = await (await redisClient).xReadGroup(
        consumerGroup, workerId, {
            key: STATUS_STREAM_NAME,
            id: '>'
        }, {
            COUNT: 10 // Process more status updates at once
        }
    )
    //@ts-ignore
    let messages: StatusMessageType[] = res?.[0]?.messages;
    return messages || [];
}

export async function xAck(consumerGroup:string,eventId:string) {
    (await redisClient).xAck(
        STREAM_NAME, consumerGroup, eventId
    )
}

// New function to acknowledge status stream messages
export async function xAckStatus(consumerGroup: string, eventId: string) {
    (await redisClient).xAck(
        STATUS_STREAM_NAME, consumerGroup, eventId
    )
}

// Function to create consumer groups if they don't exist
export async function createConsumerGroups() {
    try {
        await (await redisClient).xGroupCreate(STREAM_NAME, 'website-checkers', '0', { MKSTREAM: true });
        console.log('Created consumer group: website-checkers');
    } catch (error: any) {
        if (!error.message.includes('BUSYGROUP')) {
            console.error('Error creating website-checkers group:', error);
        }
    }

    try {
        await (await redisClient).xGroupCreate(STATUS_STREAM_NAME, 'status-processors', '0', { MKSTREAM: true });
        console.log('Created consumer group: status-processors');
    } catch (error: any) {
        if (!error.message.includes('BUSYGROUP')) {
            console.error('Error creating status-processors group:', error);
        }
    }
}

// Export types for use in other packages
export type { WebsiteStatusEvent, StatusMessageType };