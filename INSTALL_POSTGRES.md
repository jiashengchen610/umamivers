# PostgreSQL Installation for macOS

Since Docker is not available, you'll need PostgreSQL installed locally. Here are the easiest methods:

## Option 1: Homebrew (Recommended)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add to PATH (add to your ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/bin:$PATH"
```

## Option 2: Postgres.app (GUI)

1. Download from: https://postgresapp.com/
2. Drag to Applications folder
3. Open Postgres.app
4. Click "Initialize" to create a new server
5. Add to PATH: `sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp`

## Option 3: Official Installer

1. Download from: https://www.postgresql.org/download/macos/
2. Run the installer
3. Follow the setup wizard
4. Remember your superuser password

## Verify Installation

```bash
# Check if PostgreSQL is installed
psql --version

# Check if you can connect
psql -d postgres -c "SELECT version();"
```

## After Installation

Once PostgreSQL is installed, run the setup script:

```bash
./setup-local.sh
```

This will:
- Create the `umami_db` database
- Create the `umami_user` with password `umami_pass`
- Set up all necessary extensions and permissions