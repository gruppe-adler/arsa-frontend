<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useServersStore } from '../stores/servers';
import { TreeRoot } from 'reka-ui';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(false);
const files = ref<string[]>([]);
interface TreeNode {
    name: string;
    path: string;
    children: TreeNode[];
    isFile: boolean;
}
const tree = ref<TreeNode[]>([]);
const expanded = ref<Record<string, boolean>>({});
const selected = ref<string | null>(null);
const fileContent = ref('');
const editedContent = ref('');
const saving = ref(false);

function buildTree(paths: string[]) {
    const root: TreeNode[] = [];
    for (const p of paths) {
        const parts = p.split('/').filter(Boolean);
        let nodeList = root;
        let accum = '';
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            accum = accum ? `${accum}/${part}` : part;
            let node = nodeList.find(n => n.name === part);
            if (!node) {
                node = { name: part, path: accum, children: [], isFile: i === parts.length - 1 };
                nodeList.push(node);
            }
            nodeList = node.children;
        }
    }
    return root;
}

function flattenTree(nodes: TreeNode[], level = 0, out: { item: TreeNode; level: number }[] = [], exp: Record<string, boolean> = {}) {
    for (const n of nodes) {
        out.push({ item: n, level });
        if (n.children && n.children.length && !n.isFile && exp[n.path]) {
            flattenTree(n.children, level + 1, out, exp);
        }
    }
    return out;
}

const flat = computed(() => flattenTree(tree.value, 0, [], expanded.value));

function toggleExpand(path: string) {
    expanded.value = { ...expanded.value, [path]: !expanded.value[path] };
}

async function loadFiles() {
    if (!props.serverId) return;
    loading.value = true;
    try {
        const res = await serversStore.getProfileFiles(props.serverId);
        if (res) {
            files.value = res.files || [];
            tree.value = buildTree(files.value || []);
        } else {
            files.value = [];
            tree.value = [];
        }
    } catch {
        files.value = [];
        tree.value = [];
    }
    loading.value = false;
}

async function loadFile(path: string) {
    if (!props.serverId) return;
    selected.value = path;
    fileContent.value = '';
    editedContent.value = '';
    try {
        const res = await serversStore.getProfileFile(props.serverId, path);
        if (res) {
            fileContent.value = res.file_content || '';
            editedContent.value = fileContent.value;
        } else {
            fileContent.value = '';
            editedContent.value = '';
        }
    } catch {
        fileContent.value = '';
        editedContent.value = '';
    }
}

async function save() {
    if (!props.serverId || !selected.value) return;
    saving.value = true;
    try {
        const ok = await serversStore.editProfileFile(props.serverId, selected.value, editedContent.value);
        if (ok) {
            fileContent.value = editedContent.value;
        }
    } finally {
        saving.value = false;
    }
}

watch(
    () => props.serverId,
    () => {
        files.value = [];
        tree.value = [];
        selected.value = null;
        fileContent.value = '';
        editedContent.value = '';
        loadFiles();
    },
    { immediate: true }
);

// sortedFiles not currently used (kept for reference)
</script>

<template>
    <div v-if="loading" class="tab-loading">Loading…</div>
    <template v-else>
        <div class="profile-editor">
            <aside class="file-tree">
                <div class="tree-head">Profile files</div>
                <div v-if="files.length === 0" class="empty-box">No profile files.</div>

                <TreeRoot v-else class="reka-tree" :items="tree" :getKey="(i: any) => i.path" :childrenKey="'children'">
                    <div class="tree-content">
                        <template v-for="fi in flat" :key="fi.item.path">
                            <div
                                :class="['tree-row', { selected: selected === fi.item.path, folder: !fi.item.isFile }]"
                                :style="{ paddingLeft: `${fi.level * 12}px` }"
                            >
                                <div v-if="!fi.item.isFile" class="node-expander" @click.stop.prevent="toggleExpand(fi.item.path)">
                                    <svg class="caret" viewBox="0 0 24 24" width="14" height="14" :class="{ open: expanded[fi.item.path] }">
                                        <polyline
                                            points="6 9 12 15 18 9"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div
                                    class="node-label"
                                    @click.stop.prevent="fi.item.isFile ? loadFile(fi.item.path) : toggleExpand(fi.item.path)"
                                >
                                    {{ fi.item.name }}
                                </div>
                            </div>
                        </template>
                    </div>
                </TreeRoot>
            </aside>

            <section class="editor">
                <div class="editor-head">
                    <div class="editor-title">{{ selected ?? 'No file selected' }}</div>
                    <div class="editor-actions">
                        <button class="btn" :disabled="!selected || saving" @click="save">{{ saving ? 'Saving…' : 'Save' }}</button>
                    </div>
                </div>

                <div class="editor-body">
                    <textarea
                        v-model="editedContent"
                        :placeholder="selected ? '' : 'Select a file to edit'"
                        class="editor-textarea"
                    ></textarea>
                </div>
            </section>
        </div>
    </template>
</template>

<style scoped>
.tree-content {
    padding: 2px 10px 2px;
}

.tree-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px;
    cursor: pointer;
    border-radius: 6px;
}
.tree-row:hover {
    background: var(--bg-soft);
}
.tree-row.selected {
    background: color-mix(in oklab, var(--indigo), transparent 85%);
    font-weight: 600;
    color: var(--indigo);
}
.tree-row.folder .node-label {
    font-weight: 600;
}
.node-expander {
    width: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.caret {
    transition: transform 120ms ease;
    color: var(--ink-3);
}
.caret.open {
    transform: rotate(180deg);
    color: var(--ink);
}

.tab-loading {
    color: var(--ink-3);
    font-size: 13px;
    padding: 24px 0;
}

.profile-editor {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 16px;
}

.file-tree {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg);
    overflow: hidden;
}
.tree-head {
    padding: 12px 16px;
    background: var(--bg-soft);
    font-weight: 600;
    color: var(--ink-3);
    font-size: 12px;
}
.file-list {
    list-style: none;
    margin: 0;
    padding: 8px 0;
    max-height: 480px;
    overflow: auto;
}
.file-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
}
.file-item:hover {
    background: var(--bg-soft);
}
.file-item.selected {
    background: var(--bg-soft);
    font-weight: 600;
}

.editor {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    background: var(--bg);
}
.editor-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
}
.editor-title {
    font-weight: 600;
}
.editor-body {
    padding: 12px;
    flex: 1 1 auto;
}
.editor-textarea {
    width: 100%;
    height: 520px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Ubuntu Mono', monospace;
    font-size: 13px;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 12px;
    background: var(--bg);
    color: var(--ink);
}

.empty-box {
    padding: 16px;
    color: var(--ink-3);
}

@media (max-width: 720px) {
    .profile-editor {
        grid-template-columns: 1fr;
    }
    .editor-textarea {
        height: 320px;
    }
}
</style>
