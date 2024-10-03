import { IpAddress, Result, Server, ServerId } from './interfaces'

export async function getServers(): Promise<Server[]> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-servers`);
    return await jsonResponse.json() as Server[];
}

export async function getServer(id: string): Promise<Server> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${id}`);
    return await jsonResponse.json() as Server;
}

export async function startServer(id: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${id}/start`);
    const result = await jsonResponse.json() as Result;
    return result.value;
}

export async function stopServer(id: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${id}/stop`);
    const result = await jsonResponse.json() as Result;
    return result.value;
}

export async function deleteServer(id: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${id}/delete`);
    const result = await jsonResponse.json() as Result;
    return result.value;
}

export async function isRunning(id: string): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${id}/isRunning`);
    const result = await jsonResponse.json() as Result;
    return result.value;
}

export async function addServer(server: Server): Promise<string> {
    const jsonResponse = await fetch(`http://localhost:8000/api/add-server`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const serverId = await jsonResponse.json() as ServerId;
    return serverId.uuid;
}

export async function updateServer(server: Server): Promise<boolean> {
    const jsonResponse = await fetch(`http://localhost:8000/api/server/${server.uuid}/update`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const result = await jsonResponse.json() as Result;
    return result.value;
}

export async function getPublicIp(): Promise<string> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-public-ip`);
    const ipAddress = await jsonResponse.json() as IpAddress;
    return ipAddress.ipv4;
}