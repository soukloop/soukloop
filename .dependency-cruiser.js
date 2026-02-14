/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'feature-isolation',
            severity: 'error',
            comment: 'Features in features/ should not import from other features.',
            from: {
                path: '^features/([^/]+)',
            },
            to: {
                path: '^features/([^/]+)',
                pathNot: '^features/$1',
            },
        },
        {
            name: 'feature-boundaries',
            severity: 'error',
            comment: 'Features can only import from lib, components, types, or common libraries.',
            from: {
                path: '^features/',
            },
            to: {
                path: '^',
                pathNot: [
                    '^features/',
                    '^lib/',
                    '^components/',
                    '^types/',
                    '^server/',
                    '^env'
                ],
            },
        },
        // {
        //     name: 'no-server-in-client',
        //     severity: 'error',
        //     comment: 'Do not import server-only files in client components',
        //     from: {
        //         path: "^(app|components|features)",
        //         content: "^('use client'|\"use client\")"
        //     },
        //     to: {
        //         path: "(actions|db|server)\\.ts$"
        //     }
        // }
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
            dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg'],
        },
        includeOnly: '^(app|features|components|lib|types)',
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: 'tsconfig.json',
        },
        progress: { type: 'performance-log' },
    },
};
