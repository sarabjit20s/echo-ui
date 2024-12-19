# Contributing

Thanks for your interest in contributing to ui.shadcn.com. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out to [sarabjit20s.bsky.social](https://bsky.app/profile/sarabjit20s.bsky.social).


## About this repository

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [`workspaces`](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.
- We use [Fumadocs](https://fumadocs.vercel.app/) framework for our documentation site.

## Structure

This repository is structured as follows:

```
apps
└── www
    ├── app
    ├── components
    ├── content
packages
└── react-native
```

| Path                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `apps/www/app`            | The Next.js application for the website. |
| `apps/www/components`     | The React components for the website.    |
| `apps/www/content`        | The content for the website.             |
| `packages/react-native`   | The React Native components             |


## Documentation

The documentation for this project is located in the `www` workspace. You can run the documentation locally by running the following command:

```bash
pnpm --filter=www dev
```


## Commit Convention
Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guide.


## Requests for new components
If you have a request for a new component, please open a discussion on GitHub. We'll be happy to help you out.
