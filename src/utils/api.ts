import { IpAddress, Result, Server, ServerId, PlayerIdentityId, DockerStats, LogFile, ArsStatusResult, ArsStatus } from './interfaces';
import { useLogsStore } from '../stores/logs';

const api = import.meta.env.VITE_API_URL;

export async function getServers(): Promise<Server[]> {
    const jsonResponse = await fetch(`https://${api}/api/get-servers`);
    //const logsStore = useLogsStore();
    //logsStore.add(`Server list retrieved: ${jsonResponse}`);
    return (await jsonResponse.json()) as Server[];
}

export async function getServer(uuid: string): Promise<Server> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}`);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} retrieved: ${jsonResponse}`);
    return (await jsonResponse.json()) as Server;
}

export async function startServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/start`);
    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} started: ${result.value}`);
    return result.value;
}

export async function stopServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/stop`);
    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} stopped: ${result.value}`);
    return result.value;
}

export async function deleteServer(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}`, {
        method: 'DELETE',
        mode: 'cors'
    });
    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} deleted: ${result.value}`);
    return result.value;
}

export async function isRunning(uuid: string): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/isRunning`);
    const result = (await jsonResponse.json()) as Result;
    //const logsStore = useLogsStore();
    //logsStore.add(`Server with UUID ${id} is running: ${result.value}`);
    return result.value;
}

export async function getLogs(uuid: string): Promise<string[]> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/logs`);
    const result = (await jsonResponse.json()) as string[];
    const logsStore = useLogsStore();
    logsStore.add(`Getting Logs for Server with UUID ${uuid}: ${result.length} (count)`);
    return result;
}

export async function getLog(uuid: string, log: string, file: string): Promise<LogFile> {
    const textResponse = await fetch(`https://${api}/api/server/${uuid}/log/${log}/${file}`);
    const result = (await textResponse.json()) as LogFile;
    const logsStore = useLogsStore();
    logsStore.add(`Getting Log ${log}/${file} for Server with UUID: ${uuid}`);
    return result;
}

export async function deleteLog(uuid: string, log: string): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/log/${log}`, {
        method: 'DELETE',
        mode: 'cors'
    });
    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Deleting Log ${log} for Server with UUID: ${uuid}`);
    return result.value;
}

export async function getPlayersFromLog(uuid: string, log: string): Promise<PlayerIdentityId[]> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/log-players/${log}`);
    const result = (await jsonResponse.json()) as PlayerIdentityId[];
    const logsStore = useLogsStore();
    logsStore.add(`Getting Players from Log ${log} for Server with UUID: ${uuid}`);
    return result;
}

export async function getKnownPlayers(uuid: string): Promise<PlayerIdentityId[]> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/known-players`);
    const result = (await jsonResponse.json()) as PlayerIdentityId[];
    const logsStore = useLogsStore();
    logsStore.add(`Getting known Players for Server with UUID: ${uuid}`);
    return result;
}

export async function getStats(uuid: string): Promise<DockerStats> {
    const jsonResponse = await fetch(`https://${api}/api/server/${uuid}/stats`);
    const result = (await jsonResponse.json()) as DockerStats;
    const logsStore = useLogsStore();
    logsStore.add(`Getting Stats for Server with UUID: ${uuid}`);
    return result;
}

export async function addServer(server: Server): Promise<string> {
    const jsonResponse = await fetch(`https://${api}/api/add-server`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const serverId = (await jsonResponse.json()) as ServerId;
    const logsStore = useLogsStore();
    logsStore.add(`New Server added with UUID: ${serverId.uuid}`);
    return serverId.uuid;
}

export async function updateServer(server: Server): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/server/${server.uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
        mode: 'cors'
    });
    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${server.uuid} updated: ${result.value}`);
    return result.value;
}

export async function getPublicIp(): Promise<string> {
    const jsonResponse = await fetch(`https://${api}/api/get-public-ip`);
    const ipAddress = (await jsonResponse.json()) as IpAddress;
    const logsStore = useLogsStore();
    logsStore.add(`Public IPv4 address retrieved: ${ipAddress.ipv4}`);
    return ipAddress.ipv4;
}

export async function getArsStatus(): Promise<ArsStatus> {
    const jsonResponse = await fetch(`https://${api}/api/get-ars-status`);

    const result = (await jsonResponse.json()) as ArsStatusResult;
    const logsStore = useLogsStore();
    logsStore.add(`ARS status fetched`);
    return result.status;
}

export async function recreateArsDockerImage(): Promise<boolean> {
    const jsonResponse = await fetch(`https://${api}/api/recreate-ars-docker-image`);

    const result = (await jsonResponse.json()) as Result;
    const logsStore = useLogsStore();
    logsStore.add(`ARS docker image recreation started`);
    return result.value;
}
