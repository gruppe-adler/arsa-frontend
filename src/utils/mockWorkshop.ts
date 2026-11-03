import { Asset, AssetDetailResponse, Dependency } from '../api/model';

// Dev-only fixtures for the debug server page (see DebugServer.vue) — lets the
// workshop browser/detail overlay render, including dependency bullets,
// without a running backend. Never imported outside dev-only code paths.

function placeholderImage(seed: string, color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="white">${seed}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function makeAsset(overrides: Partial<Asset> & { id: string; name: string; color: string }): Asset {
    const { color, ...rest } = overrides;
    return {
        author: { id: 'mock-author', username: 'Mock Author' },
        averageRating: 4.3,
        blocked: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        currentVersionNumber: '1.0.0',
        currentVersionSize: 52428800,
        previews: [{ contentType: 'image/svg+xml', height: 225, url: placeholderImage(rest.name, color), width: 400 }],
        private: false,
        ratingCount: 128,
        subscriberCount: 4096,
        summary: `Mock workshop entry for ${rest.name}.`,
        tags: [{ category: 'Gameplay', name: 'Mock' }],
        type: 'mod',
        unlisted: false,
        updatedAt: '2025-06-01T00:00:00.000Z',
        ...rest
    };
}

function makeDependency(id: string, name: string): Dependency {
    return { asset: { id, name }, version: '1.0.0' };
}

function makeDetailResponse(asset: Asset, dependencies: Dependency[]): AssetDetailResponse {
    return {
        asset: {
            ...asset,
            description: asset.summary,
            gameVersion: '1.2.0',
            license: null,
            obsolete: false,
            ratings: { dislikes: 4, likes: 120, rating: asset.averageRating },
            screenshots: asset.previews,
            versions: []
        },
        download_total: asset.subscriberCount * 3,
        version_detail: { changelog: 'Mock changelog entry.', dependencies, scenarios: [] }
    };
}

export const mockWorkshopAssets: Asset[] = [
    makeAsset({ id: '59E4SIM0010JJJJ', name: 'Tactical Helmets Pack', color: '#2e7d32' }),
    makeAsset({ id: '59E4SIM0011KKKK', name: 'Advanced Animations Core', color: '#5e35b1' }),
    makeAsset({ id: '59E4SIM0012LLLL', name: 'Realistic Weather System', color: '#1565c0' }),
    makeAsset({ id: '59E4SIM0013MMMM', name: 'Dynamic Cloud Shaders', color: '#6d4c41' })
];

const dependenciesById: Record<string, Dependency[]> = {
    // Already in the mock server's mod list -> renders green.
    // "Advanced Animations Core" isn't -> renders yellow/todo.
    '59E4SIM0010JJJJ': [
        makeDependency('59E4SIM0001AAAA', 'Community Framework'),
        makeDependency('59E4SIM0002BBBB', 'Enhanced Movement'),
        makeDependency('59E4SIM0011KKKK', 'Advanced Animations Core')
    ],
    '59E4SIM0011KKKK': [],
    // "Project Atlas Terrain" is already installed -> green; "Dynamic Cloud
    // Shaders" isn't -> yellow/todo.
    '59E4SIM0012LLLL': [
        makeDependency('59E4SIM0005EEEE', 'Project Atlas Terrain'),
        makeDependency('59E4SIM0013MMMM', 'Dynamic Cloud Shaders')
    ],
    '59E4SIM0013MMMM': []
};

export const mockWorkshopDetails = new Map<string, AssetDetailResponse>(
    mockWorkshopAssets.map(asset => [asset.id, makeDetailResponse(asset, dependenciesById[asset.id] ?? [])])
);
