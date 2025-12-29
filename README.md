# envcheck

Fast, modern Rust CLI for linting `.env` files and DevSecOps integrations.

## Installation

```bash
npm install -g @envcheck/cli
# or
npx @envcheck/cli lint .env
```

## Usage

```bash
# Lint .env files
npx @envcheck/cli lint .env .env.local

# Compare .env files
envcheck compare .env.example .env

# Check Kubernetes manifests
envcheck k8s-sync k8s/*.yaml --env .env

# Check Terraform variables
envcheck terraform . --env .env

# Check GitHub Actions workflows
envcheck actions . --env .env

# Auto-fix and commit
envcheck fix .env --commit
```

## Documentation

See [envcheck.github.io](https://envcheck.github.io) for full documentation.

## License

MIT
