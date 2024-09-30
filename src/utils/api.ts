import { Server } from './interfaces'

export async function getServers(): Promise<Server[]> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-servers`);
    return await jsonResponse.json();
}

export async function getServer(id: string): Promise<Server> {
    const jsonResponse = await fetch(`http://localhost:8000/api/get-server/${id}`);
    return await jsonResponse.json();
}

export async function addServer(server: Server): Promise<void> {
    const jsonResponse = await fetch(`http://localhost:8000/api/add-server`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    return await jsonResponse.json();
}