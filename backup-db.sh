#!/bin/bash
BACKUP_DIR=~/gamezoe/server/backup
DB_FILE=~/gamezoe/server/gamezoe.db
DATE=$(date +%Y%m%d_%H%M%S)
cp "$DB_FILE" "$BACKUP_DIR/gamezoe_$DATE.db"
find "$BACKUP_DIR" -name "gamezoe_*.db" -mtime +7 -delete
echo "[$(date)] Backup completed: gamezoe_$DATE.db"
