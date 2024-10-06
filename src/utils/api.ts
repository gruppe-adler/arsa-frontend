import { IpAddress, Result, Server, ServerId } from './interfaces'
import { useLogsStore } from '../stores/logs'

export async function getServers(): Promise<Server[]> {
    const jsonResponse = await fetch(`http://localhost:3000/api/get-servers`);
    //const logsStore = useLogsStore();
    //logsStore.add(`Server list retrieved: ${jsonResponse}`);
    return await jsonResponse.json() as Server[];
}

export async function getServer(uuid: string): Promise<Server> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}`);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} retrieved: ${jsonResponse}`);
    return await jsonResponse.json() as Server;
}

export async function startServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/start`);
    const result = await jsonResponse.json() as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} started: ${result.value}`);
    return result.value;
}

export async function stopServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/stop`);
    const result = await jsonResponse.json() as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} stopped: ${result.value}`);
    return result.value;
}

export async function deleteServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/delete`);
    const result = await jsonResponse.json() as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} deleted: ${result.value}`);
    return result.value;
}

export async function isRunning(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/isRunning`);
    const result = await jsonResponse.json() as Result;
    //const logsStore = useLogsStore();
    //logsStore.add(`Server with UUID ${id} is running: ${result.value}`);
    return result.value;
}

export async function getLogs(uuid: string): Promise<string[]> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/logs`);
    const result = await jsonResponse.json() as string[];
    const logsStore = useLogsStore();
    logsStore.add(`Getting Logs for Server with UUID ${uuid}: ${result.length} (count)`);
    return result;
}

export async function getLog(uuid: string, log: string, file: string): Promise<string> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${uuid}/log/${log}/${file}`);
    const result = await jsonResponse.json() as string;
    const logsStore = useLogsStore();
    logsStore.add(`Getting Log ${log}/${file} for Server with UUID: ${uuid}`);
    return result;
}

export async function addServer(server: Server): Promise<string> {
    const jsonResponse = await fetch(`http://localhost:3000/api/add-server`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const serverId = await jsonResponse.json() as ServerId;
    const logsStore = useLogsStore();
    logsStore.add(`New Server added with UUID: ${serverId.uuid}`);
    return serverId.uuid;
}

export async function updateServer(server: Server): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:3000/api/server/${server.uuid}/update`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const result = await jsonResponse.json() as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${server.uuid} updated: ${result.value}`);
    return result.value;
}

export async function getPublicIp(): Promise<string> {
    const jsonResponse = await fetch(`http://localhost:3000/api/get-public-ip`);
    const ipAddress = await jsonResponse.json() as IpAddress;
    const logsStore = useLogsStore();
    logsStore.add(`Public IPv4 address retrieved: ${ipAddress.ipv4}`);
    return ipAddress.ipv4;
}