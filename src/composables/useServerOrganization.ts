import { ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';

const CLUSTERS_KEY = 'arsa-server-clusters';
const ORDER_KEY = 'arsa-server-order';
const CLUSTER_ORDER_KEY = 'arsa-cluster-order';

function loadJson<T>(key: string, fallback: T): T {
    try {
        return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback;
    } catch {
        return fallback;
    }
}

// Module-level singletons (not per-component refs) so every ServerItem and the
// ServersList page share the same live state — matches the useTheme.ts pattern.
const clusterByUuid = ref<Record<string, string>>(loadJson(CLUSTERS_KEY, {}));
// Custom drag-and-drop order, as a flat list of server uuids. A server not yet
// in here (new, or never dragged) just sorts after everything that is, in
// whatever order it was handed in.
const serverOrder = ref<string[]>(loadJson(ORDER_KEY, []));
// Same idea, but for the cluster sections themselves.
const clusterOrder = ref<string[]>(loadJson(CLUSTER_ORDER_KEY, []));

watch(clusterByUuid, value => localStorage.setItem(CLUSTERS_KEY, JSON.stringify(value)), { deep: true });
watch(serverOrder, value => localStorage.setItem(ORDER_KEY, JSON.stringify(value)), { deep: true });
watch(clusterOrder, value => localStorage.setItem(CLUSTER_ORDER_KEY, JSON.stringify(value)), { deep: true });

export function useServerOrganization() {
    const serversStore = useServersStore();

    function getCluster(uuid: string): string {
        return clusterByUuid.value[uuid] ?? '';
    }

    function setCluster(uuid: string, cluster: string) {
        const trimmed = cluster.trim();
        const next = { ...clusterByUuid.value };
        if (trimmed) {
            next[uuid] = trimmed;
        } else {
            delete next[uuid];
        }
        clusterByUuid.value = next;
    }

    // Renames a cluster across every server currently in it. Renaming to an
    // empty string ungroups all of them.
    function renameCluster(from: string, to: string) {
        const trimmed = to.trim();
        const next = { ...clusterByUuid.value };
        for (const [uuid, cluster] of Object.entries(next)) {
            if (cluster === from) {
                if (trimmed) {
                    next[uuid] = trimmed;
                } else {
                    delete next[uuid];
                }
            }
        }
        clusterByUuid.value = next;
    }

    // Sorts by position in serverOrder; anything not yet placed keeps its
    // relative position from the input list, appended after the placed ones.
    function orderServers<T extends { uuid?: string }>(servers: T[]): T[] {
        const indexOf = new Map(serverOrder.value.map((uuid, i) => [uuid, i]));
        return [...servers]
            .map((server, i) => ({ server, i }))
            .sort((a, b) => {
                const ai = (a.server.uuid ? indexOf.get(a.server.uuid) : undefined) ?? Number.MAX_SAFE_INTEGER;
                const bi = (b.server.uuid ? indexOf.get(b.server.uuid) : undefined) ?? Number.MAX_SAFE_INTEGER;
                return ai !== bi ? ai - bi : a.i - b.i;
            })
            .map(({ server }) => server);
    }

    function clusterMembers(cluster: string): string[] {
        return orderServers(
            (serversStore.servers as { uuid?: string }[]).filter(s => s.uuid && getCluster(s.uuid) === cluster)
        ).map(s => s.uuid!);
    }

    // Moves draggedId to sit next to targetId within `list`: after it when
    // dragging forward (down the list), before it when dragging backward.
    // Always inserting "before target" regardless of direction is a no-op
    // when dragging an item onto its immediate next sibling — removing the
    // dragged item shifts the target's index down by exactly the one slot
    // that move was supposed to close.
    function reposition(list: string[], draggedId: string, targetId: string): string[] {
        const base = [...list];
        const fromIdx = base.indexOf(draggedId);
        const originalTargetIdx = base.indexOf(targetId);
        if (fromIdx === -1 || originalTargetIdx === -1) return base;

        const draggingForward = fromIdx < originalTargetIdx;
        base.splice(fromIdx, 1);
        let toIdx = base.indexOf(targetId);
        if (draggingForward) toIdx += 1;
        base.splice(toIdx, 0, draggedId);
        return base;
    }

    // Dropped onto another server row: joins that row's cluster (if different)
    // and is positioned right next to it — this is both the reorder and the
    // "drag into a cluster" control.
    function moveServer(draggedUuid: string, targetUuid: string) {
        if (draggedUuid === targetUuid) return;
        const targetCluster = getCluster(targetUuid);
        if (getCluster(draggedUuid) !== targetCluster) {
            setCluster(draggedUuid, targetCluster);
        }

        const known = new Set(serverOrder.value);
        const base = [...serverOrder.value, ...clusterMembers(targetCluster).filter(uuid => !known.has(uuid))];
        serverOrder.value = reposition(base, draggedUuid, targetUuid);
    }

    // Dropped onto a cluster's empty area (not a specific row) or the
    // "new cluster" drop zone: just (re)assigns the cluster.
    function moveServerToCluster(draggedUuid: string, cluster: string) {
        setCluster(draggedUuid, cluster);
    }

    // Sorts cluster names by position in clusterOrder; anything not yet placed
    // keeps its relative position from the input list (e.g. alphabetical),
    // appended after the placed ones — same shape as orderServers.
    function orderClusters(names: string[]): string[] {
        const indexOf = new Map(clusterOrder.value.map((name, i) => [name, i]));
        return [...names]
            .map((name, i) => ({ name, i }))
            .sort((a, b) => {
                const ai = indexOf.get(a.name) ?? Number.MAX_SAFE_INTEGER;
                const bi = indexOf.get(b.name) ?? Number.MAX_SAFE_INTEGER;
                return ai !== bi ? ai - bi : a.i - b.i;
            })
            .map(({ name }) => name);
    }

    // Dropped one cluster headline onto another: positions the dragged
    // cluster's section right next to the target's. "Ungrouped" isn't a real
    // cluster and can't be reordered this way (caller should never pass it).
    function moveCluster(draggedCluster: string, targetCluster: string) {
        if (!draggedCluster || !targetCluster || draggedCluster === targetCluster) return;

        const allClusters = [...new Set(Object.values(clusterByUuid.value))];
        const known = new Set(clusterOrder.value);
        const base = [...clusterOrder.value, ...orderClusters(allClusters).filter(name => !known.has(name))];
        clusterOrder.value = reposition(base, draggedCluster, targetCluster);
    }

    return { getCluster, setCluster, renameCluster, orderServers, moveServer, moveServerToCluster, orderClusters, moveCluster };
}
