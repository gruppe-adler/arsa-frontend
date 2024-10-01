import { Result, Server, ServerId } from './interfaces'

export async function getServers(): Promise<Server[]> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-servers`);
    return await jsonResponse.json();
}

export async function getServer(id: string): Promise<Server> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-server/${id}`);
    return await jsonResponse.json();
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